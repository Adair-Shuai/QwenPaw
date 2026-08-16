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
    (packages / ".ugsci-component.json").write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "backendVersion": "2.1.1b7",
                "backendWheel": "qwenpaw-2.1.1b7.whl",
                "backendWheelSha256": "a" * 64,
                "dependencyVersion": "0+sha.lock",
                "desktopRequirementsSha256": "b" * 64,
            },
        ),
        encoding="utf-8",
    )
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
    assert descriptor["version"].startswith("0+sha.")
    assert descriptor["install_scope"] == "desktop-runtime"
    dependency_metadata = json.loads(
        (
            tmp_path / "staged/python-packages/.ugsci-component.json"
        ).read_text(),
    )
    assert dependency_metadata == {
        "schemaVersion": 2,
        "dependencyVersion": "0+sha.lock",
        "desktopRequirementsSha256": "b" * 64,
    }


def test_python_package_version_ignores_backend_build_metadata(tmp_path):
    helper = _load()

    def staged_version(root: Path, backend_version: str) -> str:
        binaries = root / "resources/binaries"
        packages = binaries / "runtimes/python-packages/lock-version"
        packages.mkdir(parents=True)
        (packages / "dependency.py").write_text("same", encoding="utf-8")
        (packages / ".ugsci-component.json").write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "backendVersion": backend_version,
                    "backendWheel": f"qwenpaw-{backend_version}.whl",
                    "backendWheelSha256": backend_version * 8,
                    "dependencyVersion": "0+sha.lock",
                    "desktopRequirementsSha256": "c" * 64,
                },
            ),
            encoding="utf-8",
        )
        (binaries / "state").mkdir()
        (binaries / "state/active.json").write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "components": {
                        "python-packages": {
                            "version": "0+sha.lock",
                            "path": (
                                "binaries/runtimes/python-packages/"
                                "lock-version"
                            ),
                        },
                    },
                },
            ),
            encoding="utf-8",
        )
        return helper.stage(
            binaries,
            root / "staged",
            backend_version,
        )[
            0
        ]["version"]

    assert staged_version(tmp_path / "one", "2.1.1b7") == staged_version(
        tmp_path / "two",
        "2.1.1b8",
    )


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
