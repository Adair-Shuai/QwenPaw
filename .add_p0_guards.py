# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
"""One-shot: append P0-1 regression guards to test_component_updater.py."""
from pathlib import Path

p = Path("tests/unit/tauri/test_component_updater.py")
t = p.read_text(encoding="utf-8")
assert "test_full_directory_component_preserves_from_bundled" not in t

guard = '''

def _p0_keypair():
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    return private, public


def _p0_full_plan(private, archive, component="backend", target="2.0.0"):
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    return ComponentUpdatePlan(
        component,
        "1.0.0",
        target,
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        (),
    )


def test_full_directory_component_preserves_from_bundled_resource(tmp_path):
    """P0-1: first update after install must accept a preserve source inside
    the Tauri resource dir (a different parent than the managed destination).
    """
    private, public = _p0_keypair()
    archive = tmp_path / "backend.zip"
    payload = b"new backend"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("qwenpaw/__init__.py", payload)
    expected = {
        "qwenpaw/__init__.py": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    bundled = tmp_path / "resources" / "binaries" / "backend"
    (bundled / "data").mkdir(parents=True)
    (bundled / "data" / "user.json").write_text("user-data", encoding="utf-8")
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = _p0_full_plan(private, archive)

    # No preserve paths: nothing is copied, but the call must not reject the
    # bundled source merely for living outside the destination's parent.
    updater.apply_full(
        plan,
        archive,
        destination,
        expected_files=expected,
        preserve_from=bundled,
    )
    assert (destination / "qwenpaw" / "__init__.py").is_file()


def test_full_plugin_preserve_source_outside_plugins_still_rejected(tmp_path):
    """P0-1 guard rail: plugin components keep the strict sibling check."""
    private, public = _p0_keypair()
    archive = tmp_path / "demo.zip"
    payload = b"plugin"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", b'{"id": "demo", "version": "2.0.0"}')
        bundle.writestr("keep.py", payload)
    expected = {
        "plugin.json": {
            "size": 31,
            "sha256": hashlib.sha256(
                b'{"id": "demo", "version": "2.0.0"}'
            ).hexdigest(),
        },
        "keep.py": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    plugins = tmp_path / "plugins"
    destination = plugins / "demo"
    outside = tmp_path / "elsewhere" / "demo"
    outside.mkdir(parents=True)
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = _p0_full_plan(private, archive, component="demo")

    with pytest.raises(ComponentUpdateError, match="preserve source"):
        updater.apply_full(
            plan,
            archive,
            destination,
            expected_files=expected,
            preserve_from=outside,
        )


def test_delta_directory_component_base_may_be_bundled(tmp_path):
    """P0-1: delta base may live in the resource dir for directory components."""
    private, public = _p0_keypair()
    bundled = tmp_path / "resources" / "backend"
    (bundled / "bin").mkdir(parents=True)
    plugin_json = b'{"id": "backend", "version": "1.0.0"}'
    (bundled / "plugin.json").write_bytes(plugin_json)
    old_payload = b"old"
    (bundled / "bin" / "runtime.dat").write_bytes(old_payload)
    new_payload = b"new"
    delta_meta = {
        "schema": "qwenpaw.component-delta/1",
        "component": "backend",
        "from": "1.0.0",
        "to": "2.0.0",
        "base_files": {
            "plugin.json": "sha256:" + hashlib.sha256(plugin_json).hexdigest(),
            "bin/runtime.dat": "sha256:" + hashlib.sha256(old_payload).hexdigest(),
        },
        "target_files": {
            "plugin.json": "sha256:" + hashlib.sha256(plugin_json).hexdigest(),
            "bin/runtime.dat": "sha256:" + hashlib.sha256(new_payload).hexdigest(),
        },
        "add": [],
        "replace": ["bin/runtime.dat"],
        "delete": [],
    }
    archive = tmp_path / "delta.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("delta.json", json.dumps(delta_meta))
        bundle.writestr("files/bin/runtime.dat", new_payload)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
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
    destination = tmp_path / "managed" / "backend" / "2.0.0"

    updater.apply_delta(plan, bundled, archive, destination)
    assert (destination / "bin" / "runtime.dat").read_bytes() == new_payload
'''

p.write_text(t.rstrip("\n") + "\n" + guard, encoding="utf-8", newline="\n")
print(
    "appended:",
    "test_delta_directory_component_base_may_be_bundled"
    in p.read_text(encoding="utf-8"),
)
