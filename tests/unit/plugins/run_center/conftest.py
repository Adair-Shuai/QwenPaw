# -*- coding: utf-8 -*-
"""Restore test runtime aliases after real loader isolation tests."""

import sys
from types import ModuleType

import pytest


_COLLECTED_RUNTIMES: dict[str, ModuleType] = {}
_RUNTIME_PREFIXES = ("test_run_center_runtime", "test_queue_resources_runtime")


def pytest_collection_finish():
    """Retain the actual modules referenced by collection-time test globals."""
    _COLLECTED_RUNTIMES.update(
        (name, module)
        for name, module in sys.modules.copy().items()
        if any(
            name == prefix or name.startswith(prefix + ".")
            for prefix in _RUNTIME_PREFIXES
        )
    )


@pytest.fixture(autouse=True)
def collected_runtime_packages(monkeypatch):
    """Rebind test aliases; loader cleanup remains active inside each case."""
    for name, module in _COLLECTED_RUNTIMES.items():
        monkeypatch.setitem(sys.modules, name, module)
