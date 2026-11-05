# -*- coding: utf-8 -*-
"""Local runtimes never invoke dependency package managers."""

# pylint: disable=protected-access
from unittest.mock import Mock

import pytest

from qwenpaw.plugins.loader import PluginLoader


def test_local_runtime_rejects_dependency_installation(tmp_path, monkeypatch):
    monkeypatch.setenv("QWENPAW_RUNTIME_PROVISIONER", "local")
    loader = PluginLoader([tmp_path])
    installer = Mock()
    monkeypatch.setattr(
        loader,
        "_run_subprocess_with_streaming_log",
        installer,
    )
    requirements = tmp_path / "requirements.txt"
    requirements.write_text(
        "qwenpaw-local-policy-missing-regression==0.0.0\n",
        encoding="utf8",
    )
    with pytest.raises(RuntimeError, match="administrator"):
        loader._install_requirements(requirements, "app")
    installer.assert_not_called()
