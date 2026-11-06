# -*- coding: utf-8 -*-
"""Workspace-owned Matrix state with non-destructive legacy migration."""

from __future__ import annotations

from contextlib import ExitStack, closing
import hashlib
import json
import logging
import os
from pathlib import Path
import shutil
import sqlite3
import stat
import tempfile

from qwenpaw.plugins.install_lock import plugin_install_lock

logger = logging.getLogger(__name__)

_CRYPTO_SUFFIXES = (
    ".db",
    ".trusted_devices",
    ".blacklisted_devices",
    ".ignored_devices",
)


class MatrixStateError(RuntimeError):
    """Matrix state cannot be used without risking identity or data loss."""


def _read_json(path):
    if not path.exists():
        return None
    try:
        value = json.loads(path.read_text("utf-8"))
    except (OSError, ValueError) as exc:
        raise MatrixStateError("MATRIX_STATE_UNREADABLE") from exc
    if not isinstance(value, dict):
        raise MatrixStateError("MATRIX_STATE_INVALID")
    return value


def _atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix="." + path.name, dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(value, stream, ensure_ascii=False)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def _crypto_file_exists(path):
    if path.is_symlink():
        raise MatrixStateError("MATRIX_CRYPTO_PATH_UNSAFE")
    try:
        mode = path.stat().st_mode
    except FileNotFoundError:
        return False
    except OSError as exc:
        # Such a legacy name could never have been a Windows file/ADS.
        if os.name == "nt" and getattr(exc, "winerror", None) == 123:
            return False
        raise MatrixStateError("MATRIX_CRYPTO_STORE_UNREADABLE") from exc
    if not stat.S_ISREG(mode):
        raise MatrixStateError("MATRIX_CRYPTO_STORE_INVALID")
    return True


def _migrate_crypto_database(
    directory,
    legacy_name,
    name,
    user_id,
    device_id,
    *,
    destination_directory=None,
    remove_source=True,
):
    """Snapshot the authenticated old DB, including committed WAL and ADS."""
    if directory.is_symlink():
        raise MatrixStateError("MATRIX_CRYPTO_PATH_UNSAFE")
    source = directory / legacy_name
    destination_directory = destination_directory or directory
    destination = destination_directory / name
    old_exists = _crypto_file_exists(source)
    new_exists = _crypto_file_exists(destination)
    if old_exists and new_exists:
        raise MatrixStateError("MATRIX_CRYPTO_STORE_CONFLICT")
    if new_exists:
        try:
            with closing(
                sqlite3.connect(destination.as_uri() + "?mode=ro", uri=True),
            ) as database:
                _verify_crypto_identity(database, user_id, device_id)
        except sqlite3.Error as exc:
            raise MatrixStateError("MATRIX_CRYPTO_STORE_INVALID") from exc
        return
    if not old_exists:
        return
    fd, temporary = tempfile.mkstemp(
        prefix=".matrix-crypto-",
        dir=destination_directory,
    )
    os.close(fd)
    temporary = Path(temporary)
    try:
        with closing(
            sqlite3.connect(source.as_uri() + "?mode=ro", uri=True),
        ) as old:
            with closing(sqlite3.connect(temporary)) as new:
                _verify_crypto_identity(old, user_id, device_id)
                old.backup(new)
                if new.execute("PRAGMA integrity_check").fetchall() != [
                    ("ok",),
                ]:
                    raise MatrixStateError("MATRIX_CRYPTO_STORE_INVALID")
        with temporary.open("r+b") as stream:
            os.fsync(stream.fileno())
        # Hard-link publication is atomic and cannot overwrite a second DB.
        # Existing Matrix identity/workspace/legacy OS claims are still held.
        try:
            os.link(temporary, destination)
        except FileExistsError as exc:
            raise MatrixStateError("MATRIX_CRYPTO_STORE_CONFLICT") from exc
        if os.name != "nt":
            directory_fd = os.open(destination_directory, os.O_RDONLY)
            try:
                os.fsync(directory_fd)
            finally:
                os.close(directory_fd)
        # Only a complete, checked, durably published snapshot permits this.
        # An interruption before removal leaves both DBs and fails closed.
        if remove_source:
            source.unlink()
    except (OSError, sqlite3.Error) as exc:
        raise MatrixStateError("MATRIX_CRYPTO_STORE_MIGRATION_FAILED") from exc
    finally:
        temporary.unlink(missing_ok=True)


def _verify_crypto_identity(database, user_id, device_id):
    identities = set(
        database.execute("SELECT user_id, device_id FROM accounts"),
    )
    if identities != {(user_id, device_id)}:
        raise MatrixStateError("MATRIX_CRYPTO_STORE_IDENTITY_CONFLICT")


def _is_sqlite_database(path):
    if not _crypto_file_exists(path):
        return False
    with path.open("rb") as stream:
        return stream.read(16) == b"SQLite format 3\0"


class MatrixStateStore:
    """Keep state in each workspace and hold locks only while running."""

    def __init__(self, config):
        workspace = config.get("workspace_dir")
        if not workspace:
            raise MatrixStateError("MATRIX_WORKSPACE_REQUIRED")
        self.workspace = Path(workspace).expanduser().resolve()
        self.root = self.workspace / "channel_state" / "matrix"
        self.homeserver = str(config.get("homeserver") or "").rstrip("/")
        self.legacy = (
            Path(config["legacy_state_dir"]).expanduser().resolve()
            if config.get("legacy_state_dir")
            else None
        )
        self.owner = None
        self.directory = None
        self.crypto_dir = None
        self.database_name = None
        self._claims = ExitStack()
        self._begun = False

    def begin(self):
        if self._begun:
            raise MatrixStateError("MATRIX_STATE_ALREADY_OWNED")
        try:
            self._claims.enter_context(
                plugin_install_lock(self.root / ".active.lock", timeout=0),
            )
        except Exception as exc:
            raise MatrixStateError("MATRIX_STATE_ALREADY_OWNED") from exc
        self._begun = True

    def auth_hint(self):
        current = _read_json(self.root / "current.json")
        if current and current.get("homeserver") == self.homeserver:
            scope = current.get("scope", "")
            if len(scope) != 64 or any(
                c not in "0123456789abcdef" for c in scope
            ):
                raise MatrixStateError("MATRIX_STATE_INVALID")
            return _read_json(self.root / scope / "auth.json")
        return self.legacy_auth()

    def legacy_auth(self):
        return (
            _read_json(self.legacy / "matrix_auth_state.json")
            if self.legacy
            else None
        )

    def _legacy_identity(self):
        try:
            return self.legacy_auth() or {}
        except MatrixStateError as exc:
            logger.warning("MATRIX_LEGACY_SKIPPED: %s", exc)
            return {}

    @staticmethod
    def _matches(legacy, user_id, device_id):
        return bool(
            legacy
            and legacy.get("user_id") == user_id
            and legacy.get("device_id", "") == device_id,
        )

    @staticmethod
    def _copy_file(source, destination):
        fd, temporary = tempfile.mkstemp(
            prefix=".matrix-crypto-",
            dir=destination.parent,
        )
        try:
            with (
                os.fdopen(fd, "wb") as target,
                source.open("rb") as source_stream,
            ):
                shutil.copyfileobj(source_stream, target)
                target.flush()
                os.fsync(target.fileno())
            os.replace(temporary, destination)
        finally:
            Path(temporary).unlink(missing_ok=True)

    @classmethod
    def _migrate_crypto_files(
        cls,
        crypto,
        user_id,
        device_id,
        database_name,
    ):
        safe_base = Path(database_name).stem
        bases = tuple(
            dict.fromkeys(
                (
                    f"{user_id}_{device_id}",
                    "matrix",
                    crypto.parent.name,
                    safe_base,
                ),
            ),
        )
        # Preflight the complete set before changing any source file.
        selected = {}
        for suffix in _CRYPTO_SUFFIXES:
            candidates = [
                crypto / f"{base}{suffix}"
                for base in bases
                if _crypto_file_exists(crypto / f"{base}{suffix}")
            ]
            if len(candidates) > 1:
                raise MatrixStateError("MATRIX_CRYPTO_STORE_CONFLICT")
            if candidates:
                selected[suffix] = candidates[0]
        for suffix, legacy_path in selected.items():
            safe_path = crypto / f"{safe_base}{suffix}"
            if suffix == ".db" and _is_sqlite_database(legacy_path):
                # SQLite backup preserves committed WAL and authenticates keys.
                _migrate_crypto_database(
                    crypto,
                    (
                        legacy_path.name
                        if legacy_path != safe_path
                        else ".absent.db"
                    ),
                    database_name,
                    user_id,
                    device_id,
                )
            elif legacy_path != safe_path:
                cls._copy_file(legacy_path, safe_path)
                legacy_path.unlink()

    def _copy_crypto_store(
        self,
        source,
        target,
        user_id,
        device_id,
        database_name,
    ):
        safe_base = Path(database_name).stem
        scope = hashlib.sha256(
            json.dumps([self.homeserver, user_id, device_id]).encode(),
        ).hexdigest()
        bases = tuple(
            dict.fromkeys(
                (
                    f"{user_id}_{device_id}",
                    "matrix",
                    scope,
                    safe_base,
                ),
            ),
        )
        selected = {}
        for suffix in _CRYPTO_SUFFIXES:
            candidates = [
                source / f"{base}{suffix}"
                for base in bases
                if _crypto_file_exists(source / f"{base}{suffix}")
            ]
            if len(candidates) > 1:
                raise MatrixStateError("MATRIX_CRYPTO_STORE_CONFLICT")
            if candidates:
                selected[suffix] = candidates[0]
        legacy_names = {
            f"{base}{suffix}{sidecar}"
            for base in bases
            for suffix in _CRYPTO_SUFFIXES
            for sidecar in ("", "-wal", "-shm", "-journal")
        }

        def ignore_legacy(_directory, names):
            return [name for name in names if name in legacy_names]

        shutil.copytree(source, target, ignore=ignore_legacy)
        for suffix, legacy_path in selected.items():
            safe_path = target / f"{safe_base}{suffix}"
            if suffix == ".db" and _is_sqlite_database(legacy_path):
                _migrate_crypto_database(
                    source,
                    legacy_path.name,
                    database_name,
                    user_id,
                    device_id,
                    destination_directory=target,
                    remove_source=False,
                )
            else:
                self._copy_file(legacy_path, safe_path)

    def _claim_device(self, scope):
        claim_root = (
            self.legacy / "matrix_plugin_claims"
            if self.legacy
            else Path(tempfile.gettempdir()) / "qwenpaw-matrix-device-claims"
        )
        device_claim = claim_root / scope
        try:
            self._claims.enter_context(
                plugin_install_lock(
                    device_claim.with_suffix(".lock"),
                    timeout=0,
                ),
            )
        except Exception as exc:
            raise MatrixStateError("MATRIX_DEVICE_ACTIVE_CONFLICT") from exc
        latest = _read_json(device_claim.with_suffix(".json")) or {}
        return device_claim, latest

    def _latest_workspace_state(self, latest, owner, scope):
        workspace = latest.get("workspace_dir")
        if not isinstance(workspace, str) or not Path(workspace).is_absolute():
            return None
        if any(
            latest.get(key) != owner[key]
            for key in ("homeserver", "user_id", "device_id")
        ):
            return None
        source_root = (
            Path(workspace).expanduser().resolve() / "channel_state" / "matrix"
        )
        source = source_root / scope
        if not source.is_dir():
            return None
        source_owner = _read_json(source / "owner.json")
        if source_owner != latest:
            raise MatrixStateError("MATRIX_STATE_IDENTITY_CONFLICT")
        return source

    def _copy_crypto_for_existing_owner(
        self,
        directory,
        user_id,
        device_id,
        database_name,
        legacy_database_name,
    ):
        scope_name = (
            hashlib.sha256(
                json.dumps([self.homeserver, user_id, device_id]).encode(),
            ).hexdigest()
            + ".db"
        )
        target = directory / "crypto_store"
        if (target / database_name).is_file():
            return
        if target.exists() and any(target.iterdir()):
            raise MatrixStateError("MATRIX_CRYPTO_STORE_CONFLICT")
        if self.legacy is None:
            return
        legacy_crypto = self.legacy / "matrix_crypto_store"
        if not any(
            (legacy_crypto / name).is_file()
            for name in (
                database_name,
                legacy_database_name,
                "matrix.db",
                scope_name,
            )
        ):
            return
        self.root.mkdir(parents=True, exist_ok=True)
        staging = Path(
            tempfile.mkdtemp(prefix=".matrix-crypto-repair-", dir=self.root),
        )
        try:
            try:
                with plugin_install_lock(
                    self.legacy / ".matrix-plugin.lock",
                    timeout=0,
                ):
                    self._copy_crypto_store(
                        legacy_crypto,
                        staging / "crypto_store",
                        user_id,
                        device_id,
                        database_name,
                    )
            except MatrixStateError:
                raise
            except Exception as exc:
                raise MatrixStateError("MATRIX_LEGACY_COPY_FAILED") from exc
            if target.exists():
                target.rmdir()
            os.replace(staging / "crypto_store", target)
        finally:
            shutil.rmtree(staging, ignore_errors=True)

    # Keep the transaction or callback contract intact.
    # pylint: disable=R0912
    def _migrate_previous_state(
        self,
        directory,
        owner,
        database_name,
        legacy_database_name,
        encryption_enabled,
        source_directory=None,
    ):
        self.root.mkdir(parents=True, exist_ok=True)
        staging = Path(
            tempfile.mkdtemp(prefix=".matrix-migration-", dir=self.root),
        )

        def has_crypto(path):
            scope_name = (
                hashlib.sha256(
                    json.dumps(
                        [
                            self.homeserver,
                            owner["user_id"],
                            owner["device_id"],
                        ],
                    ).encode(),
                ).hexdigest()
                + ".db"
            )
            return any(
                (path / name).is_file()
                for name in (
                    database_name,
                    legacy_database_name,
                    "matrix.db",
                    scope_name,
                )
            )

        try:
            try:
                with ExitStack() as migration_locks:
                    if self.legacy is not None:
                        migration_locks.enter_context(
                            plugin_install_lock(
                                self.legacy / ".matrix-plugin.lock",
                                timeout=0,
                            ),
                        )
                    if source_directory is None:
                        legacy = self.legacy_auth() or {}
                        if not self._matches(
                            legacy,
                            owner["user_id"],
                            owner["device_id"],
                        ):
                            raise MatrixStateError("MATRIX_LEGACY_COPY_FAILED")
                        sync = self.legacy / "matrix_sync_token"
                        source_crypto = self.legacy / "matrix_crypto_store"
                    else:
                        sync = source_directory / "sync_token"
                        source_crypto = source_directory / "crypto_store"
                        legacy_crypto = (
                            self.legacy / "matrix_crypto_store"
                            if self.legacy is not None
                            else None
                        )
                        if (
                            not has_crypto(source_crypto)
                            and legacy_crypto is not None
                            and has_crypto(legacy_crypto)
                        ):
                            source_crypto = legacy_crypto
                    if sync.is_file():
                        try:
                            shutil.copy2(sync, staging / "sync_token")
                        except OSError as exc:
                            if encryption_enabled:
                                raise
                            logger.warning(
                                "Matrix legacy sync copy failed; using "
                                "initial sync: %s",
                                exc,
                            )
                    if has_crypto(source_crypto):
                        try:
                            self._copy_crypto_store(
                                source_crypto,
                                staging / "crypto_store",
                                owner["user_id"],
                                owner["device_id"],
                                database_name,
                            )
                        except (OSError, shutil.Error):
                            if encryption_enabled:
                                raise
                            shutil.rmtree(
                                staging / "crypto_store",
                                ignore_errors=True,
                            )
                            logger.warning(
                                "Matrix legacy crypto copy failed; using "
                                "fresh state",
                            )
            except MatrixStateError:
                raise
            except Exception as exc:
                raise MatrixStateError("MATRIX_LEGACY_COPY_FAILED") from exc
            _atomic_json(staging / "owner.json", owner)
            if directory.exists():
                raise MatrixStateError("MATRIX_STATE_IDENTITY_CONFLICT")
            os.replace(staging, directory)
            staging = None
        finally:
            if staging is not None:
                shutil.rmtree(staging, ignore_errors=True)

    # pylint: enable=R0912

    def bind(self, user_id, device_id, *, encryption_enabled=False):
        if not self._begun or not user_id:
            raise MatrixStateError("MATRIX_STATE_IDENTITY_REQUIRED")
        owner = {
            "homeserver": self.homeserver,
            "user_id": user_id,
            "device_id": device_id,
            "workspace_dir": str(self.workspace),
        }
        if self.owner:
            if self.owner != owner:
                raise MatrixStateError("MATRIX_STATE_IDENTITY_CONFLICT")
            return
        scope = hashlib.sha256(
            json.dumps([self.homeserver, user_id, device_id]).encode(),
        ).hexdigest()
        directory = self.root / scope
        if not directory.resolve().is_relative_to(self.root.resolve()):
            raise MatrixStateError("MATRIX_STATE_PATH_UNSAFE")
        # The containing directory already identifies the account and device.
        # SQLite and native Windows file APIs still impose legacy path limits.
        database_name = "matrix.db" if os.name == "nt" else f"{scope}.db"
        legacy_database_name = f"{user_id}_{device_id}.db"
        if (
            Path(legacy_database_name).name != legacy_database_name
            or "\\" in legacy_database_name
            or "\0" in legacy_database_name
        ):
            raise MatrixStateError("MATRIX_CRYPTO_FILENAME_UNSAFE")
        device_claim, latest = self._claim_device(scope)
        previous = _read_json(directory / "owner.json")
        if previous is not None and previous != owner:
            raise MatrixStateError("MATRIX_STATE_IDENTITY_CONFLICT")
        crypto = directory / "crypto_store"
        if crypto.exists():
            self._migrate_crypto_files(
                crypto,
                user_id,
                device_id,
                database_name,
            )
        legacy = self._legacy_identity()
        latest_source = (
            self._latest_workspace_state(latest, owner, scope)
            if previous is None
            else None
        )
        if previous is not None:
            self._copy_crypto_for_existing_owner(
                directory,
                user_id,
                device_id,
                database_name,
                legacy_database_name,
            )
        elif latest_source is not None or self._matches(
            legacy,
            user_id,
            device_id,
        ):
            if directory.exists():
                raise MatrixStateError("MATRIX_STATE_IDENTITY_CONFLICT")
            self._migrate_previous_state(
                directory,
                owner,
                database_name,
                legacy_database_name,
                encryption_enabled,
                source_directory=latest_source,
            )
        else:
            if legacy:
                logger.info(
                    "MATRIX_LEGACY_SKIPPED: legacy identity does not match",
                )
            _atomic_json(directory / "owner.json", owner)
        _atomic_json(device_claim.with_suffix(".json"), owner)
        _atomic_json(
            self.root / "current.json",
            {"homeserver": self.homeserver, "scope": scope},
        )
        self.owner = owner
        self.directory = directory
        self.crypto_dir = directory / "crypto_store"
        self.database_name = database_name

    def save_auth(
        self,
        token,
        user_id,
        device_id,
        *,
        credential_scope=None,
        password_fingerprint="",
    ):
        if (
            not self.directory
            or self.owner["user_id"] != user_id
            or self.owner["device_id"] != device_id
        ):
            raise MatrixStateError("MATRIX_STATE_IDENTITY_CONFLICT")
        _atomic_json(
            self.directory / "auth.json",
            {
                "access_token": token,
                "user_id": user_id,
                "device_id": device_id,
                "credential_scope": credential_scope,
                "password_fingerprint": password_fingerprint,
            },
        )

    def load_sync(self):
        if self.directory is None:
            raise MatrixStateError("MATRIX_STATE_IDENTITY_REQUIRED")
        path = self.directory / "sync_token"
        try:
            return (
                path.read_text("utf-8").strip() or None
                if path.exists()
                else None
            )
        except OSError as exc:
            logger.warning("Matrix sync token could not be read: %s", exc)
            return None

    def save_sync(self, token):
        if self.directory is None:
            raise MatrixStateError("MATRIX_STATE_IDENTITY_REQUIRED")
        path = self.directory / "sync_token"
        fd, temporary = tempfile.mkstemp(prefix=".sync-", dir=self.directory)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                stream.write(token)
            os.replace(temporary, path)
        finally:
            Path(temporary).unlink(missing_ok=True)

    def close(self):
        self._claims.close()
        self._begun = False
