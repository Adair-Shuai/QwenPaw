# -*- coding: utf-8 -*-
"""Startup component update orchestration.

The production OSS endpoint, embedded verification key, and bundled-plugin
allowlist are safe defaults. Remote checks are initiated by the desktop
version/update control. Startup only activates updates explicitly queued by
that user-facing flow.
All three values can be overridden with environment variables for testing.
"""

# pylint: disable=too-many-branches

from __future__ import annotations

import os
import json
from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
import logging
import threading
from urllib.parse import urlparse

from ..__version__ import __version__
from ..config.utils import get_plugins_dir
from ..constant import WORKING_DIR
from ..plugins.bundled import is_plugin_uninstalled
from ..plugins.install_lock import plugin_install_lock
from .update import detect_target
from .client import ComponentClient
from .update import (
    DEFAULT_PRESERVE_PATHS,
    ComponentUpdateError,
    ComponentUpdatePlan,
    ComponentUpdater,
    _version,
    _is_link_like,
    _safe_component_id,
    _safe_path,
)

logger = logging.getLogger(__name__)
_PENDING_UPDATES_PATH = WORKING_DIR / "components" / "pending.json"
_PENDING_LOCK = threading.RLock()
_PENDING_SCHEMA_VERSION = 2
_PENDING_MAX_ATTEMPTS = 5
_PENDING_MAX_AGE = timedelta(days=7)
_COMPONENT_INSTALL_LOCKS = WORKING_DIR / "components" / "install-locks"
# Cross-process install serialization: downloads of large components can run
# for tens of minutes on slow links, so the peer-wait budget must cover that.
_COMPONENT_INSTALL_LOCK_TIMEOUT = 3600.0

# The component signing public key is deliberately public and is embedded in
# the client.  The private key remains a GitHub Actions secret and must never
# be shipped with the application.
_DEFAULT_COMPONENT_PUBLIC_KEY = "T0VO6V4iNHzSxU3eV68N4nifjq2CqtDfMO0QPtH72mw="
_DEFAULT_COMPONENT_BASE_URL = (
    "https://ugsci-download.oss-cn-beijing.aliyuncs.com"
)
_MANAGED_PLUGIN_DENYLIST = frozenset({"cloudpaw", "qwenpaw-pet"})
DIRECTORY_COMPONENT_IDS = frozenset(
    {
        "backend",
        "python-runtime",
        "python-packages",
        "node-runtime",
        "java-runtime",
        "officecli",
        "neqsim",
        "computer-use-helper",
    },
)
_MANAGED_COMPONENTS_ROOT = WORKING_DIR / "components" / "managed"
_ADOPTED_COMPONENTS_PATH = WORKING_DIR / "components" / "adopted.json"
_ADOPTED_LOCK = threading.RLock()


def _component_install_lock_path(component: str) -> Path:
    """Path to the cross-process lock serializing one component's install."""
    safe_id = "".join(
        c if c.isalnum() or c in "-_." else "_" for c in component
    )
    return _COMPONENT_INSTALL_LOCKS / f"{safe_id}.lock"


def _read_adopted_components() -> set[str]:
    with _ADOPTED_LOCK:
        try:
            payload = json.loads(
                _ADOPTED_COMPONENTS_PATH.read_text(encoding="utf-8"),
            )
            if not isinstance(payload, dict):
                return set()
            if payload.get("schema_version") != 1:
                return set()
            raw_components = payload.get("components", [])
            if not isinstance(raw_components, list):
                return set()
            components: set[str] = set()
            for item in raw_components:
                if not isinstance(item, str) or not item.strip():
                    continue
                try:
                    components.add(_safe_component_id(item))
                except ComponentUpdateError:
                    logger.warning(
                        "Ignoring invalid component id in adoption state: %r",
                        item,
                    )
            return components
        except (
            OSError,
            TypeError,
            ValueError,
            json.JSONDecodeError,
            ComponentUpdateError,
        ):
            return set()


def set_component_update_adoption(component: str, adopted: bool) -> None:
    """Allow a remotely installed plugin to join signed OSS updates."""
    component = _safe_component_id(component)
    with _ADOPTED_LOCK:
        with plugin_install_lock(
            _ADOPTED_COMPONENTS_PATH.with_name(".adopted.lock"),
            timeout=30.0,
        ) as acquired:
            if not acquired:
                raise ComponentUpdateError(
                    "component adoption update is already in progress",
                )
            # Re-read only after the cross-process lock is held so concurrent
            # installs of different newly signed plugins merge instead of
            # replacing one another's adoption entries.
            components = _read_adopted_components()
            if adopted:
                components.add(component)
            else:
                components.discard(component)
            _ADOPTED_COMPONENTS_PATH.parent.mkdir(parents=True, exist_ok=True)
            temporary = _ADOPTED_COMPONENTS_PATH.with_name(
                f".{_ADOPTED_COMPONENTS_PATH.name}.{os.getpid()}.staging",
            )
            try:
                temporary.write_text(
                    json.dumps(
                        {
                            "schema_version": 1,
                            "components": sorted(components),
                        },
                        ensure_ascii=False,
                        sort_keys=True,
                    )
                    + "\n",
                    encoding="utf-8",
                )
                os.replace(temporary, _ADOPTED_COMPONENTS_PATH)
            finally:
                temporary.unlink(missing_ok=True)


def is_component_update_adopted(component: str) -> bool:
    """Return whether *component* opted into signed OSS updates."""
    component = _safe_component_id(component)
    return component in _read_adopted_components()


def _default_managed_components() -> set[str]:
    """Return only bundled plugin IDs eligible for remote management."""
    try:
        from ..plugins.bundled import (
            _get_bundled_plugins_dirs,
            _read_manifest,
        )

        managed: set[str] = set()
        for root in _get_bundled_plugins_dirs():
            for plugin_dir in sorted(root.iterdir()):
                if not plugin_dir.is_dir() or plugin_dir.name in {
                    "__pycache__",
                }:
                    continue
                manifest = _read_manifest(plugin_dir)
                plugin_id = str((manifest or {}).get("id") or "").strip()
                if plugin_id and plugin_id not in _MANAGED_PLUGIN_DENYLIST:
                    managed.add(plugin_id)
        return managed | set(DIRECTORY_COMPONENT_IDS)
    except Exception:  # pragma: no cover - packaging discovery is best effort
        logger.warning(
            "Failed to discover bundled managed components",
            exc_info=True,
        )
        return set(DIRECTORY_COMPONENT_IDS)


def resolve_component_destination(plugins: Path, component: str) -> Path:
    """Resolve an installed plugin by ID while preserving aliases."""
    # pylint: disable=too-many-statements
    if _is_link_like(plugins):
        raise ComponentUpdateError("plugins directory must not be a link")
    direct = plugins / component
    if _is_link_like(direct):
        raise ComponentUpdateError(
            f"component destination must not be a link: {direct}",
        )
    candidates: set[Path] = set()
    if direct.exists():
        if not direct.is_dir():
            raise ComponentUpdateError(
                f"component destination is not a directory: {direct}",
            )
        try:
            manifest = json.loads(
                (direct / "plugin.json").read_text(encoding="utf-8"),
            )
        except (
            OSError,
            ValueError,
            TypeError,
            json.JSONDecodeError,
        ) as exc:
            raise ComponentUpdateError(
                "component destination is occupied by an invalid plugin: "
                f"{direct}",
            ) from exc
        if str(manifest.get("id") or "").strip() == component:
            candidates.add(direct)
        else:
            raise ComponentUpdateError(
                "component destination is occupied by a different "
                f"plugin: {direct}",
            )
    if plugins.is_dir():
        for plugin_dir in sorted(plugins.iterdir()):
            if not plugin_dir.is_dir() or plugin_dir == direct:
                continue
            identity_source = plugin_dir
            destination = plugin_dir
            if plugin_dir.name.startswith("."):
                suffix = ".previous"
                if not plugin_dir.name.endswith(suffix):
                    continue
                destination_name = plugin_dir.name[1 : -len(suffix)]
                try:
                    _safe_component_id(destination_name)
                except ComponentUpdateError:
                    continue
                # A pre-marker crash can leave only `.alias.previous` on
                # disk. Resolve it to the original alias destination.
                destination = plugins / destination_name
                if _is_link_like(destination):
                    try:
                        linked_manifest = json.loads(
                            (destination / "plugin.json").read_text(
                                encoding="utf-8",
                            ),
                        )
                    except (
                        OSError,
                        ValueError,
                        TypeError,
                        json.JSONDecodeError,
                    ):
                        linked_manifest = {}
                    if (
                        str(linked_manifest.get("id") or "").strip()
                        == component
                    ):
                        raise ComponentUpdateError(
                            "component destination must not be a link: "
                            f"{destination}",
                        )
                    continue
                identity_source = (
                    destination if destination.is_dir() else plugin_dir
                )
            if _is_link_like(plugin_dir):
                try:
                    linked_manifest = json.loads(
                        (plugin_dir / "plugin.json").read_text(
                            encoding="utf-8",
                        ),
                    )
                except (
                    OSError,
                    ValueError,
                    TypeError,
                    json.JSONDecodeError,
                ):
                    linked_manifest = {}
                if str(linked_manifest.get("id") or "").strip() == component:
                    raise ComponentUpdateError(
                        f"component alias must not be a link: {plugin_dir}",
                    )
                continue
            try:
                manifest = json.loads(
                    (identity_source / "plugin.json").read_text(
                        encoding="utf-8",
                    ),
                )
            except (OSError, ValueError, TypeError, json.JSONDecodeError):
                continue
            if str(manifest.get("id") or "").strip() == component:
                candidates.add(destination)
    if len(candidates) > 1:
        rendered = ", ".join(str(path) for path in sorted(candidates))
        raise ComponentUpdateError(
            f"multiple plugin directories claim component {component}: "
            f"{rendered}",
        )
    if candidates:
        return next(iter(candidates))
    return direct


def _resolve_managed_directory(
    updater: ComponentUpdater,
    component: str,
    *,
    target_version: str | None = None,
) -> Path | None:
    """Resolve a runtime/tool tree without trusting paths from the pointer."""
    component = _safe_component_id(component)
    root = _MANAGED_COMPONENTS_ROOT.absolute()
    if _is_link_like(root):
        raise ComponentUpdateError(
            "managed components root must not be a link",
        )
    component_root = root / component
    if _is_link_like(component_root):
        raise ComponentUpdateError("managed component root must not be a link")
    if target_version is not None:
        # Versions are parsed by the signed-manifest validator; additionally
        # reject path syntax before deriving a filesystem destination.
        _safe_path(target_version)
        return component_root / target_version
    version, path = updater.active_directory_record(component)
    if version is None or path is None:
        return None
    _safe_path(version)
    expected = (component_root / version).absolute()
    if path.absolute() != expected:
        raise ComponentUpdateError(
            f"active path for {component} escapes its managed root",
        )
    if _is_link_like(path):
        raise ComponentUpdateError(
            "active managed component may not be a link",
        )
    return path if path.is_dir() else None


def _bundled_directory_records() -> dict[str, tuple[str, Path]]:
    """Read the immutable desktop active pointer supplied by Tauri."""
    raw_root = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if not raw_root:
        return {}
    resource_root = Path(raw_root).absolute()
    if not resource_root.is_dir() or _is_link_like(resource_root):
        return {}
    active_path = resource_root / "state" / "active.json"
    if not active_path.is_file():
        active_path = resource_root / "binaries" / "state" / "active.json"
    if not active_path.is_file() or _is_link_like(active_path):
        return {}
    try:
        payload = json.loads(active_path.read_text(encoding="utf-8"))
        schema = payload.get("schemaVersion", payload.get("schema_version"))
        target = payload.get("target")
        components = payload.get("components")
        if (
            schema != 1
            or target not in {None, detect_target()}
            or not isinstance(components, dict)
        ):
            return {}
    except (OSError, TypeError, ValueError, json.JSONDecodeError):
        return {}
    records: dict[str, tuple[str, Path]] = {}
    for component, record in components.items():
        if component not in DIRECTORY_COMPONENT_IDS or not isinstance(
            record,
            dict,
        ):
            continue
        try:
            component = _safe_component_id(component)
            version = str(record["version"]).strip()
            # Older macOS desktop bundles wrote the JDK archive directory
            # name (for example ``jdk-21.0.12+8-mac-aarch64-…``) into
            # active.json instead of a release version.  That value is a
            # safe path segment but not a PEP 440 version, and must not make
            # the whole component service fail during startup.  The
            # component is temporarily omitted from local-version matching;
            # the signed manifest can still be checked for plugin updates.
            _version(version, "bundled component version")
            relative = _safe_path(str(record["path"]))
            destination = (resource_root / Path(relative)).absolute()
            destination.relative_to(resource_root)
            current = resource_root
            for part in Path(relative).parts:
                current /= part
                if _is_link_like(current):
                    raise ComponentUpdateError(
                        "bundled directory component path contains a link",
                    )
            if not version or not destination.is_dir():
                continue
            records[component] = (version, destination)
        except (KeyError, OSError, ValueError, ComponentUpdateError) as exc:
            if isinstance(
                exc,
                ComponentUpdateError,
            ) and "bundled component version" in str(exc):
                logger.warning(
                    "Ignoring invalid bundled directory component version "
                    "for %s: %s",
                    component,
                    exc,
                )
            continue
    return records


def _valid_active_component_ids() -> set[str]:
    """Return valid component IDs recorded by the desktop active pointer."""
    active_path = WORKING_DIR / "components" / "active.json"
    try:
        payload = json.loads(active_path.read_text(encoding="utf-8"))
        components = payload.get("components")
        if not isinstance(components, dict):
            return set()
    except (OSError, TypeError, ValueError, json.JSONDecodeError):
        return set()

    valid: set[str] = set()
    for raw_component, raw_record in components.items():
        if not isinstance(raw_record, dict):
            continue
        try:
            component = _safe_component_id(raw_component)
            _version(
                str(raw_record.get("version", "")).strip(),
                "active component version",
            )
        except (ComponentUpdateError, TypeError, ValueError):
            continue
        valid.add(component)
    return valid


def _resolve_installed_directory(
    updater: ComponentUpdater,
    component: str,
) -> Path | None:
    managed = _resolve_managed_directory(updater, component)
    if managed is not None:
        return managed
    _, bundled = updater.bundled_directory_record(component)
    return bundled if bundled is not None and bundled.is_dir() else None


def _authorize_component_install() -> None:
    token = os.environ.get("QWENPAW_COMPONENT_INSTALL_TOKEN", "").strip()
    presented = os.environ.get("QWENPAW_COMPONENT_INSTALL_AUTH", "").strip()
    if token and token != presented:
        raise ComponentUpdateError(
            "component installation authorization failed",
        )


def _pending_now() -> datetime:
    return datetime.now(timezone.utc)


def _new_pending_record() -> dict[str, Any]:
    return {
        "queued_at": _pending_now().isoformat(),
        "attempts": 0,
        "last_error": None,
    }


def _load_pending_records() -> dict[str, dict[str, Any]]:
    if not _PENDING_UPDATES_PATH.is_file():
        return {}
    try:
        payload = json.loads(
            _PENDING_UPDATES_PATH.read_text(encoding="utf-8"),
        )
    except (OSError, json.JSONDecodeError):
        logger.warning("Pending component update queue is invalid")
        return {}
    if not isinstance(payload, dict):
        return {}
    components = payload.get("components")
    if isinstance(components, list):
        # Backward-compatible migration from schema 1.
        return {
            str(component): _new_pending_record()
            for component in components
            if str(component).strip()
        }
    if not isinstance(components, dict):
        return {}
    records: dict[str, dict[str, Any]] = {}
    for component, raw in components.items():
        component_id = str(component).strip()
        if not component_id or not isinstance(raw, dict):
            continue
        record = _new_pending_record()
        queued_at = raw.get("queued_at")
        if isinstance(queued_at, str) and queued_at.strip():
            record["queued_at"] = queued_at.strip()
        try:
            record["attempts"] = max(0, int(raw.get("attempts", 0)))
        except (TypeError, ValueError):
            record["attempts"] = 0
        last_error = raw.get("last_error")
        record["last_error"] = (
            str(last_error) if last_error is not None else None
        )
        records[component_id] = record
    return records


def _pending_expired(record: dict[str, Any]) -> bool:
    if int(record.get("attempts", 0)) >= _PENDING_MAX_ATTEMPTS:
        return True
    try:
        queued_at = datetime.fromisoformat(str(record["queued_at"]))
        if queued_at.tzinfo is None:
            queued_at = queued_at.replace(tzinfo=timezone.utc)
    except (KeyError, TypeError, ValueError):
        return True
    elapsed = _pending_now() - queued_at.astimezone(timezone.utc)
    return elapsed > _PENDING_MAX_AGE


def _store_pending_records(records: dict[str, dict[str, Any]]) -> None:
    with _PENDING_LOCK:
        _PENDING_UPDATES_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not records:
            _PENDING_UPDATES_PATH.unlink(missing_ok=True)
            return
        temporary = _PENDING_UPDATES_PATH.with_name(
            f".{_PENDING_UPDATES_PATH.name}.{os.getpid()}."
            f"{threading.get_ident()}.tmp",
        )
        temporary.write_text(
            json.dumps(
                {
                    "schema_version": _PENDING_SCHEMA_VERSION,
                    "components": {
                        component: records[component]
                        for component in sorted(records)
                    },
                },
                ensure_ascii=False,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
        os.replace(temporary, _PENDING_UPDATES_PATH)


def _write_pending_components(components: set[str]) -> None:
    if not components:
        return
    with _PENDING_LOCK:
        records = _load_pending_records()
        for component in components:
            records.setdefault(str(component), _new_pending_record())
        _store_pending_records(records)


def _record_pending_failure(
    record: dict[str, Any],
    error: BaseException | str,
    *,
    count_attempt: bool = True,
) -> None:
    # Contention (another update process holding the download lease) is not
    # a genuine attempt: no bytes moved and nothing about the artifact is
    # wrong. Burning one of the limited attempts on it could exhaust the
    # retry budget through pure bad luck across restarts.
    if count_attempt:
        record["attempts"] = int(record.get("attempts", 0)) + 1
    record["last_error"] = str(error)


def queue_component_update(component: str) -> dict[str, Any]:
    _authorize_component_install()
    service = configured_service()
    if service is None:
        raise ComponentUpdateError("component updates are not configured")
    try:
        plans = {str(item["component"]): item for item in service.check()}
        if component not in service.updater.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
            )
        if component not in plans:
            return {
                "component": component,
                "queued": False,
                "reason": "up-to-date",
            }
        _write_pending_components({component})
        return {
            "component": component,
            "queued": True,
            "restart_required": True,
        }
    finally:
        service.client.close()


def queue_all_component_updates() -> dict[str, Any]:
    """Queue every currently available managed update for safe restart."""
    _authorize_component_install()
    service = configured_service()
    if service is None:
        return {"enabled": False, "queued": [], "restart_required": False}
    try:
        components = {
            str(item["component"])
            for item in service.check()
            if item.get("component")
        }
        _write_pending_components(components)
        return {
            "enabled": True,
            "queued": sorted(components),
            "restart_required": bool(components),
        }
    finally:
        service.client.close()


def configured_service() -> "ComponentUpdateService | None":
    target = detect_target()
    manifest_url = os.environ.get(
        "QWENPAW_COMPONENT_MANIFEST_URL",
        f"{_DEFAULT_COMPONENT_BASE_URL}/metadata/components/stable/"
        f"{target}.current.json",
    ).strip()
    public_key = os.environ.get(
        "QWENPAW_COMPONENT_PUBLIC_KEY",
        _DEFAULT_COMPONENT_PUBLIC_KEY,
    ).strip()
    managed_raw = os.environ.get("QWENPAW_COMPONENT_MANAGED", "").strip()
    managed = (
        {item.strip() for item in managed_raw.split(",") if item.strip()}
        if managed_raw
        else _default_managed_components()
    )
    if not manifest_url or not public_key or not managed:
        return None
    bundled_records = {
        component: record
        for component, record in _bundled_directory_records().items()
        if component in managed
    }
    directory_components = managed & set(DIRECTORY_COMPONENT_IDS)
    # A packaged desktop can carry an older active.json whose runtime
    # directory version is not parseable (the b9 macOS JDK case).  Do not let
    # that one malformed local record turn every component check into HTTP
    # 500, and do not offer a phantom runtime update.  Keep the component
    # disabled until a newer desktop bundle supplies a valid active record.
    if os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip():
        valid_local = set(bundled_records) | _valid_active_component_ids()
        invalid_local = directory_components - valid_local
        if invalid_local:
            logger.warning(
                "Skipping directory components without a valid local "
                "version record: %s",
                ", ".join(sorted(invalid_local)),
            )
            managed -= invalid_local
            directory_components -= invalid_local
    updater = ComponentUpdater(
        public_key_b64=public_key,
        managed_components=managed,
        core_version=__version__,
        active_path=WORKING_DIR / "components" / "active.json",
        backup_root=WORKING_DIR / "components" / "backups",
        defer_activation_cleanup=True,
        directory_components=directory_components,
        bundled_directory_records=bundled_records,
    )
    manifest_host = (urlparse(manifest_url).hostname or "").strip().lower()
    return ComponentUpdateService(
        updater,
        ComponentClient(
            updater,
            WORKING_DIR / "components" / "cache",
            default_allowed_host=manifest_host or None,
        ),
        manifest_url,
    )


class ComponentUpdateService:
    def __init__(
        self,
        updater: ComponentUpdater,
        client: ComponentClient,
        manifest_url: str,
    ):
        self.updater = updater
        self.client = client
        self.manifest_url = manifest_url
        self._lock = threading.RLock()

    def _adopt_signed_new_components(
        self,
        manifest: dict[str, Any],
        plugins: Path,
    ) -> set[str]:
        """Adopt signed new plugins without taking over local plugins."""
        entries = manifest.get("components")
        if not isinstance(entries, dict):
            return set()
        additions: set[str] = set()
        adopted = _read_adopted_components()
        for raw_component in entries:
            component = str(raw_component).strip()
            if (
                not component
                or component in _MANAGED_PLUGIN_DENYLIST
                or component in self.updater.managed_components
            ):
                continue
            try:
                destination = resolve_component_destination(
                    plugins,
                    component,
                )
            except ComponentUpdateError as exc:
                logger.warning(
                    "Ignoring signed component %s because its local "
                    "destination is ambiguous or occupied: %s",
                    component,
                    exc,
                )
                continue
            if destination.exists() and component not in adopted:
                logger.warning(
                    "Ignoring signed component %s because an unmanaged local "
                    "plugin already occupies %s",
                    component,
                    destination,
                )
                continue
            additions.add(component)
        if additions:
            self.updater.extend_managed_components(additions)
        return additions

    def check(self) -> list[dict[str, Any]]:
        with self._lock:
            manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        self._adopt_signed_new_components(manifest, plugins)
        plans: list[dict[str, Any]] = []
        for component in sorted(self.updater.managed_components):
            installed = (
                _resolve_installed_directory(self.updater, component)
                if self.updater.is_directory_component(component)
                else resolve_component_destination(plugins, component)
            )
            plan = self.updater.plan(
                manifest,
                component,
                (
                    installed
                    if installed is not None and installed.is_dir()
                    else None
                ),
                plugins_root=(
                    None
                    if self.updater.is_directory_component(component)
                    else plugins
                ),
            )
            if plan is not None:
                plans.append(asdict(plan))
        return plans

    def snapshot(self) -> tuple[dict[str, Any], list[dict[str, Any]]]:
        """Fetch one manifest and derive plans from that snapshot."""
        with self._lock:
            manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        self._adopt_signed_new_components(manifest, plugins)
        plans: list[dict[str, Any]] = []
        for component in sorted(self.updater.managed_components):
            installed = (
                _resolve_installed_directory(self.updater, component)
                if self.updater.is_directory_component(component)
                else resolve_component_destination(plugins, component)
            )
            plan = self.updater.plan(
                manifest,
                component,
                (
                    installed
                    if installed is not None and installed.is_dir()
                    else None
                ),
                plugins_root=(
                    None
                    if self.updater.is_directory_component(component)
                    else plugins
                ),
            )
            if plan is not None:
                plans.append(asdict(plan))
        return manifest, plans

    def install(self, component: str) -> dict[str, Any]:
        return self._install(component, manifest=None)

    def _install_from_manifest(
        self,
        component: str,
        manifest: dict[str, Any],
    ) -> dict[str, Any]:
        return self._install(component, manifest=manifest)

    def _install(
        self,
        component: str,
        *,
        manifest: dict[str, Any] | None,
    ) -> dict[str, Any]:
        token = os.environ.get("QWENPAW_COMPONENT_INSTALL_TOKEN", "").strip()
        presented = os.environ.get(
            "QWENPAW_COMPONENT_INSTALL_AUTH",
            "",
        ).strip()
        if token and token != presented:
            raise ComponentUpdateError(
                "component installation authorization failed",
            )
        with self._lock:
            # Cross-process mutual exclusion spanning plan -> download ->
            # apply -> activate/finalize. ``self._lock`` is process-local and
            # the artifact download lease is released before activation, so
            # without this lock two backend processes (e.g. an orphaned
            # backend plus a fresh launch) could race ``_atomic_activate``
            # over .previous/marker/destination. Component activation is
            # safety-first: if the lock cannot be acquired, leave the durable
            # pending record for a later startup instead of proceeding
            # unlocked.
            with plugin_install_lock(
                _component_install_lock_path(component),
                timeout=_COMPONENT_INSTALL_LOCK_TIMEOUT,
            ) as acquired:
                if not acquired:
                    raise ComponentUpdateError(
                        "component installation is already in progress",
                    )
                return self._install_locked(component, manifest=manifest)

    def _install_locked(
        self,
        component: str,
        *,
        manifest: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        try:
            return self._install_component(component, manifest=manifest)
        except Exception as exc:
            self.client.record_failure(component, exc)
            raise

    def _install_component(
        self,
        component: str,
        *,
        manifest: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if manifest is None:
            manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        newly_signed = self._adopt_signed_new_components(manifest, plugins)
        if component not in self.updater.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
            )
        entry = manifest["components"].get(component)
        if not isinstance(entry, dict):
            raise ComponentUpdateError(
                f"component is missing from manifest: {component}",
            )
        if component in newly_signed:
            # Reaching the install path means the user queued/approved this
            # signed new plugin. Persist that trust decision before touching
            # its files: if download or activation fails, the durable pending
            # record can retry on a later startup; after a successful install,
            # a fresh service will not misclassify the directory as an
            # unmanaged local plugin and silently stop offering updates.
            set_component_update_adoption(component, True)
        directory_component = self.updater.is_directory_component(component)
        installed = (
            _resolve_installed_directory(self.updater, component)
            if directory_component
            else resolve_component_destination(plugins, component)
        )
        destination = (
            _resolve_managed_directory(
                self.updater,
                component,
                target_version=str(entry.get("version", "")),
            )
            if directory_component
            else installed
        )
        if destination is None:
            raise ComponentUpdateError("managed component destination missing")
        if not directory_component and is_plugin_uninstalled(
            component,
            plugins_dir=plugins,
            plugin_dir=destination,
        ):
            return {
                "component": component,
                "updated": False,
                "reason": "uninstalled",
            }
        if not directory_component:
            self.updater.recover_interrupted_activation(
                component,
                destination,
                expected_files=(
                    entry.get("files")
                    if isinstance(entry.get("files"), dict)
                    else None
                ),
                expected_version=(
                    str(entry.get("version"))
                    if isinstance(entry.get("version"), str)
                    else None
                ),
                preserve_paths=tuple(
                    entry.get("preserve") or DEFAULT_PRESERVE_PATHS,
                ),
            )
            installed = destination if destination.is_dir() else None
        else:
            # Directory components finalize inline after apply, so a crash
            # between _atomic_activate and finalize leaves a stale marker +
            # previous tree that would otherwise block every future update of
            # this version. The plugin-oriented recover path (restore /
            # _commit_active) does not apply here: a directory component's
            # current version is owned by active.json, and ``destination`` is
            # the not-yet-active target-version tree. We only clear leftover
            # activation artifacts so the version can be retried.
            self.updater.recover_interrupted_directory_activation(
                component,
                destination,
                expected_files=(
                    entry.get("files")
                    if isinstance(entry.get("files"), dict)
                    else None
                ),
                expected_version=(
                    str(entry.get("version"))
                    if isinstance(entry.get("version"), str)
                    else None
                ),
                preserve_paths=tuple(
                    entry.get("preserve") or DEFAULT_PRESERVE_PATHS,
                ),
            )
        plan = self.updater.plan(
            manifest,
            component,
            installed,
            plugins_root=None if directory_component else plugins,
        )
        if plan is None:
            if self.updater.activation_pending(destination):
                return {
                    "component": component,
                    "updated": True,
                    "activation_pending": True,
                    "version": str(entry.get("version", "")),
                    "kind": "pending",
                }
            return {
                "component": component,
                "updated": False,
                "reason": "up-to-date",
            }
        if plan.artifact_kind == "delta":
            try:
                artifact = self.client.download_artifact(
                    plan.artifact_url,
                    sha256=plan.artifact_sha256,
                    size=int(
                        next(
                            item
                            for item in entry.get("deltas", [])
                            if item.get("from") == plan.from_version
                        )["size"],
                    ),
                    name=f"{component}-{plan.target_version}-delta.zip",
                )
                if installed is None:
                    raise ComponentUpdateError(
                        "delta update requires an installed base",
                    )
                self.updater.apply_delta(
                    plan,
                    installed,
                    artifact,
                    destination,
                )
                if directory_component:
                    self.updater.finalize_activation(component, destination)
                return {
                    "component": component,
                    "updated": True,
                    "version": plan.target_version,
                    "kind": "delta",
                }
            except ComponentUpdateError as exc:
                if "already in progress" in str(exc):
                    # Download-lease contention is not a delta failure: a peer
                    # process is fetching the same artifact. Falling back to
                    # the full artifact here would let both processes proceed
                    # through DIFFERENT artifact leases into a racing
                    # activation — exactly what the contention is preventing.
                    raise
                logger.warning(
                    "Delta update failed for %s; falling back to full: %s",
                    component,
                    exc,
                )
        full = entry.get("full")
        if not isinstance(full, dict):
            raise ComponentUpdateError(
                f"component has no full artifact for fallback: {component}",
            )
        full_plan = ComponentUpdatePlan(
            component,
            plan.from_version,
            plan.target_version,
            "full",
            str(full["url"]),
            str(full["sha256"]),
            str(full.get("signature", "")),
            plan.preserve_paths,
            plan.migration,
        )
        artifact = self.client.download_artifact(
            full_plan.artifact_url,
            sha256=full_plan.artifact_sha256,
            size=int(full["size"]),
            name=f"{component}-{plan.target_version}-full.zip",
        )
        self.updater.apply_full(
            full_plan,
            artifact,
            destination,
            expected_files=entry["files"],
            preserve_from=installed,
        )
        if directory_component:
            self.updater.finalize_activation(component, destination)
        return {
            "component": component,
            "updated": True,
            "version": plan.target_version,
            "kind": "full",
        }


def run_startup_updates() -> dict[str, Any]:
    """Activate only updates explicitly queued by the desktop update UI.

    Startup must never perform a fresh remote update on its own. The version
    icon owns discovery and consent; restart merely consumes its durable queue.
    """
    pending_records = {
        component: record
        for component, record in _load_pending_records().items()
        if not _pending_expired(record)
    }
    _store_pending_records(pending_records)
    pending_components = sorted(pending_records)
    if not pending_components:
        return {"enabled": False, "updated": [], "errors": []}
    service = configured_service()
    if service is None:
        for record in pending_records.values():
            _record_pending_failure(
                record,
                "component updates are not configured",
            )
        _store_pending_records(
            {
                component: record
                for component, record in pending_records.items()
                if not _pending_expired(record)
            },
        )
        return {
            "enabled": False,
            "updated": [],
            "errors": ["component updates are not configured"],
        }
    updated: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    remaining_pending = dict(pending_records)
    try:
        manifest: dict[str, Any] | None = None
        if hasattr(service, "snapshot"):
            manifest, plans = service.snapshot()
        else:
            plans = service.check()
        available = {str(plan["component"]) for plan in plans}
        selected = available & set(pending_components)
        # A successful manifest/plan snapshot is authoritative. A queued
        # component absent from plans is already current, was withdrawn, or is
        # no longer managed; retaining it would cause an OSS request forever.
        for component in set(pending_components) - available:
            remaining_pending.pop(component, None)
        for component in sorted(selected):
            try:
                if manifest is not None and hasattr(
                    service,
                    "_install_from_manifest",
                ):
                    # pylint: disable-next=protected-access
                    result = service._install_from_manifest(
                        component,
                        manifest,
                    )
                else:
                    result = service.install(component)
                updated.append(result)
                remaining_pending.pop(component, None)
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "Startup component update failed for %s",
                    component,
                    exc_info=True,
                )
                errors.append({"component": component, "error": str(exc)})
                # Download-lease contention means another update process is
                # mid-download; it is not a real attempt and must not consume
                # the limited retry budget.
                is_contention = isinstance(
                    exc,
                    ComponentUpdateError,
                ) and "already in progress" in str(exc)
                _record_pending_failure(
                    remaining_pending[component],
                    exc,
                    count_attempt=not is_contention,
                )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Startup component update check failed", exc_info=True)
        errors.append({"component": "manifest", "error": str(exc)})
        for record in remaining_pending.values():
            _record_pending_failure(record, exc)
    finally:
        service.client.close()
        _store_pending_records(
            {
                component: record
                for component, record in remaining_pending.items()
                if not _pending_expired(record)
            },
        )
    return {"enabled": True, "updated": updated, "errors": errors}
