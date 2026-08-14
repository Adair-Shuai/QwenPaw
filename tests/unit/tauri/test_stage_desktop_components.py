# -*- coding: utf-8 -*-
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts" / "pack-tauri" / "stage_desktop_components.py"


def _load():
    spec = spec_from_file_location("stage_desktop_components", SCRIPT)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_stages_every_active_layer_with_release_metadata(tmp_path):
    helper = _load()
    resources = tmp_path / "resources"
    binaries = resources / "binaries"
    backend = binaries / "app" / "backend" / "2.1.1b7"
    packages = binaries / "runtimes" / "python-packages" / "abcdef"
    backend.mkdir(parents=True)
    packages.mkdir(parents=True)
    (backend / "backend.py").write_text("ok", encoding="utf-8")
    (packages / "dependency.py").write_text("ok", encoding="utf-8")
    (binaries / "state").mkdir()
    (binaries / "state" / "active.json").write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "components": {
                    "backend": {
                        "version": "2.1.1b7",
                        "path": "binaries/app/backend/2.1.1b7",
                        "kind": "python",
                    },
                    "python-packages": {
                        "version": "abcdef",
                        "path": "binaries/runtimes/python-packages/abcdef",
                    },
                },
            },
        ),
        encoding="utf-8",
    )

    staged = helper.stage(binaries, tmp_path / "staged", "2.1.1b7")

    assert {item["id"] for item in staged} == {"backend", "python-packages"}
    descriptor = json.loads(
        (tmp_path / "staged/python-packages/component.json").read_text(),
    )
    assert descriptor["version"].startswith("2.1.1b7+sha.")
    assert descriptor["install_scope"] == "desktop-runtime"


def test_rejects_active_path_escape(tmp_path):
    helper = _load()
    binaries = tmp_path / "resources" / "binaries"
    (binaries / "state").mkdir(parents=True)
    (binaries / "state/active.json").write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "components": {
                    "backend": {"version": "1", "path": "../outside"},
                },
            },
        ),
        encoding="utf-8",
    )

    try:
        helper.stage(binaries, tmp_path / "staged", "2.1.1b7")
    except ValueError as error:
        assert "unsafe active component path" in str(error)
    else:
        raise AssertionError("path traversal was accepted")
