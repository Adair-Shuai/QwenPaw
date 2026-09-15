# -*- coding: utf-8 -*-
"""Independent Run Center plugin with a read-only UGSci legacy bridge."""

from __future__ import annotations

import logging
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from .runtime.api import build_router
from .runtime.executors import RunExecutorService
from .runtime.research import ResearchRepository
from .runtime.research_api import build_research_router
from .runtime.repository import RunRepository

logger = logging.getLogger("qwenpaw").getChild("plugin.run_center")

PLUGIN_ID = "qwenpaw-run-center"
PLUGIN_DIR = Path(__file__).parent


class RunCenterPlugin:
    """Register the platform-level run center without importing UGSci."""

    def __init__(self) -> None:
        self.repository = RunRepository()
        self.research = ResearchRepository(self.repository)
        self.executor_service = RunExecutorService(
            self.repository,
            review_checker=self._has_approved_review,
        )
        self._internal_executors: dict[tuple[str, str | None], Any] = {}
        self._api = None

    def _has_approved_review(self, run: dict[str, Any]) -> bool:
        """Check a review against the Run's immutable input snapshot."""
        try:
            return self.research.require_review_for_run(run) is not None
        except (KeyError, ValueError):
            return False

    def register(self, api) -> None:  # type: ignore[no-untyped-def]
        # Keep the host API reference only for startup metadata sync.  Other
        # plugins register operation descriptors during their own ``register``
        # calls; all plugin registration completes before startup hooks run.
        self._api = api
        # PluginRegistry reserves one HTTP prefix per plugin.  Compose the
        # platform and research routes into one router before registering it;
        # this keeps the public namespace unified while allowing the research
        # services to remain a separate internal module.
        router = build_router(
            self.repository,
            self._sync_operations,
            self.executor_service,
            self.research,
        )
        router.routes.extend(build_research_router(self.research).routes)
        api.register_http_router(
            router,
            prefix="/run-center",
            tags=["run-center", "run-center-research"],
        )
        api.register_startup_hook(
            hook_name="run_center_initialize",
            callback=self._on_startup,
            priority=70,
        )
        api.register_uninstall_hook(
            hook_name="run_center_shutdown",
            callback=self._on_uninstall,
        )
        logger.info("[%s] Run Center registered at /api/run-center", PLUGIN_ID)

    def _on_startup(self) -> None:
        self.repository.initialize()
        self.research.initialize()
        self._sync_operations()
        self._sync_executors()
        self.executor_service.start()

    def register_executor(
        self,
        operation: str,
        handler,
        *,
        provider_id: str | None = None,
        executor=None,
    ) -> None:
        """Register a domain execution adapter without importing its plugin.

        This method is the narrow runtime integration point until the host
        PluginApi grows a first-class executable Operation registration.
        """
        self.executor_service.register(
            operation,
            handler,
            provider_id=provider_id,
            executor=executor,
        )
        key = (str(operation).strip(), str(provider_id).strip() if provider_id else None)
        self._internal_executors[key] = SimpleNamespace(
            operation=key[0],
            provider_id=key[1],
            handler=handler,
            executor=executor,
        )

    def _sync_operations(self) -> None:
        """Persist the current host registry, including runtime reloads."""
        api = self._api
        get_operations = getattr(api, "get_operations", None)
        if not callable(get_operations):
            return
        try:
            registrations = get_operations()
        except Exception as exc:  # pragma: no cover - defensive plugin boundary
            logger.warning("[%s] Operation metadata sync unavailable: %s", PLUGIN_ID, exc)
            return
        snapshot = [
            {
                "operation": registration.operation,
                "descriptor": registration.descriptor,
                "provider_id": registration.provider_id,
                "contract_version": registration.contract_version,
            }
            for registration in registrations
        ]
        try:
            self.repository.replace_operations(snapshot)
        except Exception as exc:  # pragma: no cover - defensive plugin boundary
            logger.warning("[%s] Failed to persist Operation registry: %s", PLUGIN_ID, exc)
        self._sync_executors()

    def _sync_executors(self) -> None:
        """Attach runtime handlers contributed through the host PluginApi."""
        api = self._api
        get_executors = getattr(api, "get_run_executors", None)
        if not callable(get_executors):
            return
        try:
            registrations = list(get_executors())
        except Exception as exc:  # pragma: no cover - defensive plugin boundary
            logger.warning("[%s] Run executor discovery unavailable: %s", PLUGIN_ID, exc)
            return
        try:
            # Preserve direct Run Center integrations while replacing the
            # host-owned snapshot so unloaded plugin handlers cannot survive.
            host_keys = {
                (str(getattr(item, "operation", "")).strip(),
                 str(getattr(item, "provider_id", "")).strip()
                 if getattr(item, "provider_id", None) else None)
                for item in registrations
            }
            registrations.extend(
                item
                for key, item in self._internal_executors.items()
                if key not in host_keys
            )
            self.executor_service.replace_registrations(registrations)
        except Exception as exc:  # pragma: no cover - isolate provider failures
            logger.warning("[%s] Failed to refresh run executors: %s", PLUGIN_ID, exc)

    def _on_uninstall(self, **_kwargs) -> None:
        # Run data is user-owned and must survive plugin removal.
        self.executor_service.stop(wait=False)
        logger.info("[%s] Run Center unloaded; durable run data preserved", PLUGIN_ID)


plugin = RunCenterPlugin()
