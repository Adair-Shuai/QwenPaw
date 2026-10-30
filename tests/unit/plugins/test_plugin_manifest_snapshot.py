# -*- coding: utf-8 -*-
"""Runtime metadata cannot rewrite the admitted static source identity."""

import json

import pytest

from qwenpaw.plugins.architecture import PluginManifest
from qwenpaw.plugins.execution.errors import ProtocolValidationError
from qwenpaw.plugins.python_backend import PythonBackend, _read_source_identity


def test_runtime_metadata_keeps_source_snapshot_and_rejects_disk_changes(
    tmp_path,
):
    data = {
        "id": "snapshot-probe",
        "version": "1.0.0",
        "entry": {"backend": "main.py"},
        "meta": {"tools": []},
    }
    path = tmp_path / "plugin.json"
    path.write_text(json.dumps(data), encoding="utf8")
    manifest = PluginManifest.model_validate(data)
    description = PythonBackend(None).describe(tmp_path, manifest)
    before = _read_source_identity(description)
    manifest.meta["tools"].append({"name": "runtime-tool"})
    assert description.manifest.meta["tools"] == []
    assert _read_source_identity(description) == before
    data["meta"]["tools"].append({"name": "disk-change"})
    path.write_text(json.dumps(data), encoding="utf8")
    with pytest.raises(
        ProtocolValidationError,
        match="DEPENDENCY_ORIGIN_INVALID",
    ):
        _read_source_identity(description)
