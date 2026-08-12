# -*- coding: utf-8 -*-
"""Manual-first component update orchestration.

No network request is performed unless the OSS endpoint, public key, and
managed allowlist are all explicitly configured.
"""

from __future__ import annotations

import os
from dataclasses import asdict
from pathlib import Path
from typing import Any
import logging
import threading

from ..__version__ import __version__
from ..config.utils import get_plugins_dir
from ..constant import WORKING_DIR
from .client import ComponentClient
from .update import ComponentUpdateError, ComponentUpdater

logger = logging.getLogger(__name__)


def configured_service() -> "ComponentUpdateService | None":
    manifest_url = os.environ.get("QWENPAW_COMPONENT_MANIFEST_URL", "").strip()
    public_key = os.environ.get("QWENPAW_COMPONENT_PUBLIC_KEY", "").strip()
    managed = {item.strip() for item in os.environ.get("QWENPAW_COMPONENT_MANAGED", "").split(",") if item.strip()}
    if not manifest_url or not public_key or not managed:
        return None
    updater = ComponentUpdater(
        public_key_b64=public_key,
        managed_components=managed,
        core_version=__version__,
        active_path=WORKING_DIR / "components" / "active.json",
    )
    return ComponentUpdateService(updater, ComponentClient(updater, WORKING_DIR / "components" / "cache"), manifest_url)


class ComponentUpdateService:
    def __init__(self, updater: ComponentUpdater, client: ComponentClient, manifest_url: str):
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
            plan = self.updater.plan(manifest, component, installed if installed.is_dir() else None)
            if plan is not None:
                plans.append(asdict(plan))
        return plans

    def install(self, component: str) -> dict[str, Any]:
        with self._lock:
            return self._install_locked(component)

    def _install_locked(self, component: str) -> dict[str, Any]:
        if component not in self.updater.managed_components:
            raise ComponentUpdateError(f"component is not managed: {component}")
        manifest = self.client.fetch_manifest(self.manifest_url)
        plugins = get_plugins_dir()
        destination = plugins / component
        installed = destination if destination.is_dir() else None
        if installed is not None and (installed / ".uninstalled").exists():
            return {"component": component, "updated": False, "reason": "uninstalled"}
        plan = self.updater.plan(manifest, component, installed)
        if plan is None:
            return {"component": component, "updated": False, "reason": "up-to-date"}
        entry = manifest["components"][component]
        artifact_meta = entry["full"] if plan.artifact_kind == "full" else next(
            item for item in entry.get("deltas", []) if item.get("from") == plan.from_version
        )
        artifact = self.client.download_artifact(
            plan.artifact_url,
            sha256=plan.artifact_sha256,
            size=int(artifact_meta["size"]),
            name=f"{component}-{plan.target_version}-{plan.artifact_kind}.zip",
        )
        if plan.artifact_kind == "delta":
            if installed is None:
                raise ComponentUpdateError("delta update requires an installed base")
            self.updater.apply_delta(plan, installed, artifact, destination)
        else:
            self.updater.apply_full(
                plan,
                artifact,
                destination,
                expected_files=entry["files"],
                preserve_from=installed,
            )
        return {"component": component, "updated": True, "version": plan.target_version, "kind": plan.artifact_kind}


def run_startup_updates() -> dict[str, Any]:
    """Run explicitly enabled startup updates without propagating failures."""
    mode = os.environ.get("QWENPAW_COMPONENT_UPDATES", "disabled").strip().lower()
    if mode != "startup":
        return {"enabled": False, "updated": [], "errors": []}
    service = configured_service()
    if service is None:
        return {"enabled": False, "updated": [], "errors": ["component updates are not configured"]}
    updated: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    try:
        for plan in service.check():
            component = str(plan["component"])
            try:
                updated.append(service.install(component))
            except Exception as exc:  # noqa: BLE001
                logger.warning("Startup component update failed for %s", component, exc_info=True)
                errors.append({"component": component, "error": str(exc)})
    except Exception as exc:  # noqa: BLE001
        logger.warning("Startup component update check failed", exc_info=True)
        errors.append({"component": "manifest", "error": str(exc)})
    finally:
        service.client.close()
    return {"enabled": True, "updated": updated, "errors": errors}
