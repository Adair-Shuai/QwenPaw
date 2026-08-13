# -*- coding: utf-8 -*-
"""Startup component update orchestration.

The production OSS endpoint, embedded verification key, and bundled-plugin
allowlist are safe defaults. Startup checks are enabled by default and can be
disabled with ``QWENPAW_COMPONENT_UPDATES=disabled``. Queued updates are
always honored.
All three values can be overridden with environment variables for testing.
"""

# pylint: disable=too-many-branches

from __future__ import annotations

import os
import json
from dataclasses import asdict
from typing import Any
import logging
import threading
from urllib.parse import urlparse

from ..__version__ import __version__
from ..config.utils import get_plugins_dir
from ..constant import WORKING_DIR
from .update import detect_target
from .client import ComponentClient
from .update import (
    DEFAULT_PRESERVE_PATHS,
    ComponentUpdateError,
    ComponentUpdatePlan,
    ComponentUpdater,
)

logger = logging.getLogger(__name__)
_PENDING_UPDATES_PATH = WORKING_DIR / "components" / "pending.json"
_PENDING_LOCK = threading.RLock()

# The component signing public key is deliberately public and is embedded in
# the client.  The private key remains a GitHub Actions secret and must never
# be shipped with the application.
_DEFAULT_COMPONENT_PUBLIC_KEY = "T0VO6V4iNHzSxU3eV68N4nifjq2CqtDfMO0QPtH72mw="
_DEFAULT_COMPONENT_BASE_URL = (
    "https://ugsci-download.oss-cn-beijing.aliyuncs.com"
)
_MANAGED_PLUGIN_DENYLIST = frozenset({"cloudpaw", "qwenpaw-pet"})


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
        return managed
    except Exception:  # pragma: no cover - packaging discovery is best effort
        logger.warning(
            "Failed to discover bundled managed components",
            exc_info=True,
        )
        return set()


def _authorize_component_install() -> None:
    token = os.environ.get("QWENPAW_COMPONENT_INSTALL_TOKEN", "").strip()
    presented = os.environ.get("QWENPAW_COMPONENT_INSTALL_AUTH", "").strip()
    if token and token != presented:
        raise ComponentUpdateError(
            "component installation authorization failed",
        )


def _write_pending_components(components: set[str]) -> None:
    if not components:
        return
    with _PENDING_LOCK:
        _PENDING_UPDATES_PATH.parent.mkdir(parents=True, exist_ok=True)
        pending: dict[str, Any] = {"schema_version": 1, "components": []}
        if _PENDING_UPDATES_PATH.is_file():
            try:
                existing = json.loads(
                    _PENDING_UPDATES_PATH.read_text(encoding="utf-8"),
                )
                if isinstance(existing, dict) and isinstance(
                    existing.get("components"),
                    list,
                ):
                    pending = existing
            except (OSError, json.JSONDecodeError):
                pass
        pending["components"] = sorted(
            {str(item) for item in pending["components"]} | components,
        )
        temporary = _PENDING_UPDATES_PATH.with_name(
            f".{_PENDING_UPDATES_PATH.name}.{os.getpid()}."
            f"{threading.get_ident()}.tmp",
        )
        temporary.write_text(
            json.dumps(pending, ensure_ascii=False, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        os.replace(temporary, _PENDING_UPDATES_PATH)


def queue_component_update(component: str) -> dict[str, Any]:
    _authorize_component_install()
    service = configured_service()
    if service is None:
        raise ComponentUpdateError("component updates are not configured")
    try:
        if component not in service.updater.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
            )
        plans = {str(item["component"]): item for item in service.check()}
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
    updater = ComponentUpdater(
        public_key_b64=public_key,
        managed_components=managed,
        core_version=__version__,
        active_path=WORKING_DIR / "components" / "active.json",
        backup_root=WORKING_DIR / "components" / "backups",
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

    def check(self) -> list[dict[str, Any]]:
        with self._lock:
            manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        plans: list[dict[str, Any]] = []
        for component in sorted(self.updater.managed_components):
            installed = plugins / component
            plan = self.updater.plan(
                manifest,
                component,
                installed if installed.is_dir() else None,
            )
            if plan is not None:
                plans.append(asdict(plan))
        return plans

    def snapshot(self) -> tuple[dict[str, Any], list[dict[str, Any]]]:
        """Fetch one manifest and derive plans from that snapshot."""
        with self._lock:
            manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        plans: list[dict[str, Any]] = []
        for component in sorted(self.updater.managed_components):
            installed = plugins / component
            plan = self.updater.plan(
                manifest,
                component,
                installed if installed.is_dir() else None,
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
        if component not in self.updater.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
            )
        if manifest is None:
            manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        destination = plugins / component
        entry = manifest["components"].get(component)
        if not isinstance(entry, dict):
            raise ComponentUpdateError(
                f"component is missing from manifest: {component}",
            )
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
        if installed is not None and (installed / ".uninstalled").exists():
            return {
                "component": component,
                "updated": False,
                "reason": "uninstalled",
            }
        plan = self.updater.plan(manifest, component, installed)
        if plan is None:
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
                return {
                    "component": component,
                    "updated": True,
                    "version": plan.target_version,
                    "kind": "delta",
                }
            except ComponentUpdateError as exc:
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
        return {
            "component": component,
            "updated": True,
            "version": plan.target_version,
            "kind": "full",
        }


def run_startup_updates() -> dict[str, Any]:
    """Run explicitly enabled startup updates without propagating failures."""
    mode = (
        os.environ.get("QWENPAW_COMPONENT_UPDATES", "startup").strip().lower()
    )
    pending_components: list[str] = []
    if _PENDING_UPDATES_PATH.is_file():
        try:
            payload = json.loads(
                _PENDING_UPDATES_PATH.read_text(encoding="utf-8"),
            )
            if isinstance(payload, dict) and isinstance(
                payload.get("components"),
                list,
            ):
                pending_components = [
                    str(item) for item in payload["components"]
                ]
        except (OSError, json.JSONDecodeError):
            logger.warning(
                "Pending component update queue is invalid",
                exc_info=True,
            )
    if mode != "startup" and not pending_components:
        return {"enabled": False, "updated": [], "errors": []}
    service = configured_service()
    if service is None:
        return {
            "enabled": False,
            "updated": [],
            "errors": ["component updates are not configured"],
        }
    updated: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    remaining_pending = set(pending_components)
    try:
        manifest: dict[str, Any] | None = None
        if hasattr(service, "snapshot"):
            manifest, plans = service.snapshot()
        else:
            plans = service.check()
        available = {str(plan["component"]) for plan in plans}
        selected = (
            available
            if mode == "startup"
            else available & set(pending_components)
        )
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
                remaining_pending.discard(component)
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "Startup component update failed for %s",
                    component,
                    exc_info=True,
                )
                errors.append({"component": component, "error": str(exc)})
    except Exception as exc:  # noqa: BLE001
        logger.warning("Startup component update check failed", exc_info=True)
        errors.append({"component": "manifest", "error": str(exc)})
    finally:
        service.client.close()
        if pending_components:
            if remaining_pending:
                temporary = _PENDING_UPDATES_PATH.with_name(
                    f".{_PENDING_UPDATES_PATH.name}.{os.getpid()}.tmp",
                )
                temporary.write_text(
                    json.dumps(
                        {
                            "schema_version": 1,
                            "components": sorted(remaining_pending),
                        },
                        sort_keys=True,
                    )
                    + "\n",
                    encoding="utf-8",
                )
                os.replace(temporary, _PENDING_UPDATES_PATH)
            else:
                _PENDING_UPDATES_PATH.unlink(missing_ok=True)
    return {"enabled": True, "updated": updated, "errors": errors}
