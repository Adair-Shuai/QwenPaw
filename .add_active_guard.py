# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
from pathlib import Path

p = Path("tests/unit/tauri/test_component_updater.py")
t = p.read_text(encoding="utf-8")
assert "test_directory_recovery_never_deletes_live_tree" not in t

guard = '''

def test_directory_recovery_never_deletes_live_tree(tmp_path):
    """P1-2 safety: recovery must never delete the tree active.json runs."""
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    live = tmp_path / "managed" / "backend" / "2.0.0"
    live.mkdir(parents=True)
    (live / "runtime.dat").write_bytes(b"edited")  # differs from manifest
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {"version": "2.0.0", "path": str(live)},
                },
            },
        ),
        encoding="utf-8",
    )
    _, updater = _p1_dir_updater(tmp_path, active_path=active)
    marker = live.parent / f".{live.name}.activation.json"
    marker.write_text(
        '{"schema_version": 1, "component": "backend", "version": "2.0.0"}',
        encoding="utf-8",
    )
    # Manifest expects different content -> looks "partial", but it is live.
    expected = {
        "runtime.dat": {
            "size": 7,
            "sha256": hashlib.sha256(b"runtime").hexdigest(),
        },
    }
    updater.recover_interrupted_directory_activation(
        "backend",
        live,
        expected_files=expected,
        expected_version="2.0.0",
    )
    # Live tree and its marker are left untouched.
    assert (live / "runtime.dat").read_bytes() == b"edited"
    assert marker.exists()
'''

p.write_text(t.rstrip("\n") + "\n" + guard, encoding="utf-8", newline="\n")
print("appended")
