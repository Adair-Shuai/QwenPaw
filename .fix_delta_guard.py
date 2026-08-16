# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
from pathlib import Path

p = Path("tests/unit/tauri/test_component_updater.py")
t = p.read_text(encoding="utf-8")

start = t.find("def test_delta_directory_component_base_may_be_bundled")
assert start != -1
# Find the end of the file (this test is the last one we appended)
head = t[:start]

new_test = '''def test_delta_directory_component_base_may_be_bundled(tmp_path):
    """P0-1: delta base may live in the resource dir for directory components.

    Same scenario as test_delta_directory_component_activation but with the
    base tree under a DIFFERENT parent than the destination (the bundled
    resource dir), which the pre-fix sibling check rejected.
    """
    private, public = _p0_keypair()
    bundled = tmp_path / "resources" / "backend"
    bundled.mkdir(parents=True)
    (bundled / "runtime.dat").write_bytes(b"old")
    new_bytes = b"new"
    final_files = {
        "runtime.dat": {
            "size": len(new_bytes),
            "sha256": hashlib.sha256(new_bytes).hexdigest(),
        },
    }
    archive = tmp_path / "delta.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(
            "delta.json",
            json.dumps(
                {
                    "component": "backend",
                    "base_version": "1.0.0",
                    "target_version": "2.0.0",
                    "base_files": component_update._inventory(bundled, ()),
                    "delete": [],
                    "add": [],
                    "replace": ["runtime.dat"],
                    "final_files": final_files,
                },
            ),
        )
        bundle.writestr("files/runtime.dat", new_bytes)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    plan = ComponentUpdatePlan(
        "backend",
        "1.0.0",
        "2.0.0",
        "delta",
        "https://oss/delta.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        (),
    )

    updater.apply_delta(plan, bundled, archive, destination)

    assert (destination / "runtime.dat").read_bytes() == new_bytes
    assert (bundled / "runtime.dat").read_bytes() == b"old"
    pointer = json.loads(active.read_text(encoding="utf-8"))
    assert pointer["components"]["backend"]["version"] == "2.0.0"
'''

p.write_text(head + new_test, encoding="utf-8", newline="\n")
print("rewritten")
