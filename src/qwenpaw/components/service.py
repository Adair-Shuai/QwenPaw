# -*- coding: utf-8 -*-
"""Manual-first component update orchestration.

No network request is performed unless the OSS endpoint, public key, and
managed allowlist are all explicitly configured.
"""

from __future__ import annotations

import os
import json
from dataclasses import asdict
from typing import Any
import logging
import threading

from ..__version__ import __version__
from ..config.utils import get_plugins_dir
from ..constant import WORKING_DIR
from .client import ComponentClient
from .update import ComponentUpdateError, ComponentUpdater

logger = logging.getLogger(__name__)
_PENDING_UPDATES_PATH = WORKING_DIR / "components" / "pending.json"
_PENDING_LOCK = threading.RLock()


def queue_component_update(component: str) -> dict[str, Any]:
    token = os.environ.get("QWENPAW_COMPONENT_INSTALL_TOKEN", "").strip()
    presented = os.environ.get("QWENPAW_COMPONENT_INSTALL_AUTH", "").strip()
    if token and token != presented:
        raise ComponentUpdateError(
            "component installation authorization failed",
        )
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
                {str(item) for item in pending["components"]} | {component},
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
        return {
            "component": component,
            "queued": True,
            "restart_required": True,
        }
    finally:
        service.client.close()


def configured_service() -> "ComponentUpdateService | None":
    manifest_url = os.environ.get("QWENPAW_COMPONENT_MANIFEST_URL", "").strip()
    public_key = os.environ.get("QWENPAW_COMPONENT_PUBLIC_KEY", "").strip()
    managed = {
        item.strip()
        for item in os.environ.get("QWENPAW_COMPONENT_MANAGED", "").split(",")
        if item.strip()
    }
    if not manifest_url or not public_key or not managed:
        return None
    updater = ComponentUpdater(
        public_key_b64=public_key,
        managed_components=managed,
        core_version=__version__,
        active_path=WORKING_DIR / "components" / "active.json",
        backup_root=WORKING_DIR / "components" / "backups",
    )
    return ComponentUpdateService(
        updater,
        ComponentClient(updater, WORKING_DIR / "components" / "cache"),
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

    def install(self, component: str) -> dict[str, Any]:
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
            return self._install_locked(component)

    def _install_locked(self, component: str) -> dict[str, Any]:
        try:
            return self._install_component(component)
        except Exception as exc:
            self.client.record_failure(component, exc)
            raise

    def _install_component(self, component: str) -> dict[str, Any]:
        if component not in self.updater.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
            )
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
            expected_files=entry.get("files")
            if isinstance(entry.get("files"), dict)
            else None,
            preserve_paths=tuple(entry.get("preserve") or ("engines",)),
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
        artifact_meta = (
            entry["full"]
            if plan.artifact_kind == "full"
            else next(
                item
                for item in entry.get("deltas", [])
                if item.get("from") == plan.from_version
            )
        )
        artifact = self.client.download_artifact(
            plan.artifact_url,
            sha256=plan.artifact_sha256,
            size=int(artifact_meta["size"]),
            name=f"{component}-{plan.target_version}-{plan.artifact_kind}.zip",
        )
        if plan.artifact_kind == "delta":
            if installed is None:
                raise ComponentUpdateError(
                    "delta update requires an installed base",
                )
            self.updater.apply_delta(plan, installed, artifact, destination)
        else:
            self.updater.apply_full(
                plan,
                artifact,
                destination,
                expected_files=entry["files"],
                preserve_from=installed,
            )
        return {
            "component": component,
            "updated": True,
            "version": plan.target_version,
            "kind": plan.artifact_kind,
        }


def run_startup_updates() -> dict[str, Any]:
    """Run explicitly enabled startup updates without propagating failures."""
    mode = (
        os.environ.get("QWENPAW_COMPONENT_UPDATES", "disabled").strip().lower()
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
        available = {str(plan["component"]) for plan in service.check()}
        selected = (
            available
            if mode == "startup"
            else available & set(pending_components)
        )
        for component in sorted(selected):
            try:
                updated.append(service.install(component))
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
