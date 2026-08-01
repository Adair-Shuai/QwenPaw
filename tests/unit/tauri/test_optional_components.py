# -*- coding: utf-8 -*-
# pylint: disable=protected-access,missing-module-docstring
# pylint: disable=missing-function-docstring
from __future__ import annotations

import json
import os
import sys

from qwenpaw.tauri import optional_components


def test_selected_components_filters_unknown_and_duplicates(
    monkeypatch,
    tmp_path,
):
    selection = tmp_path / "optional-components" / "pending.txt"
    selection.parent.mkdir()
    selection.write_text(
        "science\nunknown\nwhisper\nscience\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("QWENPAW_TAURI_RESOURCE_DIR", str(tmp_path))

    assert optional_components._selected_components() == [
        "science",
        "whisper",
    ]


def test_activate_installed_component_uses_runtime_bucket(
    monkeypatch,
    tmp_path,
):
    monkeypatch.setenv("QWENPAW_OPTIONAL_COMPONENTS_DIR", str(tmp_path))
    monkeypatch.setenv("PYTHONPATH", "existing-site")
    component_dir = (
        tmp_path / optional_components._runtime_bucket() / "science"
    )
    site_dir = component_dir / "site"
    site_dir.mkdir(parents=True)
    (component_dir / "status.json").write_text(
        json.dumps(
            {
                "component": "science",
                "revision": 1,
                "runtime": optional_components._runtime_bucket(),
            },
        ),
        encoding="utf-8",
    )

    optional_components.activate_installed_components()

    assert str(site_dir) in sys.path
    assert os.environ["PYTHONPATH"].split(os.pathsep) == [
        "existing-site",
        str(site_dir),
    ]
    sys.path.remove(str(site_dir))


def test_stale_component_status_is_not_activated(monkeypatch, tmp_path):
    monkeypatch.setenv("QWENPAW_OPTIONAL_COMPONENTS_DIR", str(tmp_path))
    component_dir = (
        tmp_path / optional_components._runtime_bucket() / "science"
    )
    site_dir = component_dir / "site"
    site_dir.mkdir(parents=True)
    (component_dir / "status.json").write_text(
        json.dumps(
            {
                "component": "science",
                "revision": 0,
                "runtime": optional_components._runtime_bucket(),
            },
        ),
        encoding="utf-8",
    )

    optional_components.activate_installed_components()

    assert str(site_dir) not in sys.path
