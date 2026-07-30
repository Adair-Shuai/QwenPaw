# -*- coding: utf-8 -*-
"""Contract tests for responsibilities extracted from the plugin entry."""

from plugins.bundle.ugsci.avatar import AvatarService
from plugins.bundle.ugsci.engine.api import EngineRequest
from plugins.bundle.ugsci.plugin import (
    PLUGIN_DIR,
    PLUGIN_ID,
    _build_avatar_router,
    _build_engine_router,
    _build_sim_router,
)


def test_engine_request_collection_defaults_are_not_shared() -> None:
    first = EngineRequest()
    second = EngineRequest()

    first.extra_paths.append("/tmp/engine")
    first.modules.append("IMEX")
    first.module_paths["IMEX"] = "/tmp/imex"

    assert second.extra_paths == []
    assert second.modules == []
    assert second.module_paths == {}


def test_legacy_router_factories_delegate_to_extracted_modules() -> None:
    assert {route.path for route in _build_engine_router().routes} >= {
        "/list",
        "/detect",
        "/{engine_id}",
    }
    assert {route.path for route in _build_avatar_router().routes} == {
        "/{seed}",
        "/team/{team_id}",
    }
    assert {route.path for route in _build_sim_router().routes} == {
        "/jobs",
        "/jobs/{job_id}/stream",
    }


def test_avatar_cache_names_are_safe_and_deterministic() -> None:
    service = AvatarService(PLUGIN_ID, PLUGIN_DIR)

    first = service.seed_to_filename("../../储层 专家")
    second = service.seed_to_filename("../../储层 专家")

    assert first == second
    assert first.startswith("Avatar_")
    assert "/" not in first
    assert "\\" not in first
    assert first.endswith(".png")
