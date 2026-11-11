# -*- coding: utf-8 -*-
"""Tests for the b7 versioned desktop runtime layout."""

from importlib.util import module_from_spec, spec_from_file_location
import base64
import csv
import hashlib
import io
import json
import re
from pathlib import Path
import sys
import tomllib
import zipfile

from packaging.requirements import Requirement
from packaging.version import Version
import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER = REPO_ROOT / "scripts" / "pack-tauri" / "assemble_desktop_layout.py"
PYTHON_LAYERS = REPO_ROOT / "scripts" / "pack-tauri" / "build_python_layers.py"
sys.path.insert(0, str(HELPER.parent))


def test_desktop_lock_tracks_the_declared_classifier_sdk():
    project = tomllib.loads(
        (REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8"),
    )
    sdk = next(
        requirement
        for value in project["project"]["dependencies"]
        if (requirement := Requirement(value)).name == "agentscope"
    )
    lock = (REPO_ROOT / "requirements-desktop.lock").read_text(
        encoding="utf-8",
    )
    pinned = re.search(r"(?m)^agentscope==([^\s;\\]+)", lock)
    assert pinned, "Desktop dependency lock omits the required AgentScope SDK"
    assert Version(pinned.group(1)) in sdk.specifier
    assert "classifier-jev" in sdk.extras
    assert re.search(r"(?m)^typesafe-sdk==", lock)


def test_desktop_lock_satisfies_required_bundled_spreadsheet_readers():
    lock = (REPO_ROOT / "requirements-desktop.lock").read_text(
        encoding="utf-8",
    )
    requirements = (
        REPO_ROOT / "plugins/bundle/ugsci/requirements.txt"
    ).read_text(encoding="utf-8")
    for line in requirements.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        required = Requirement(line)
        pinned = re.search(
            rf"(?m)^{re.escape(required.name)}==([^\s;\\]+)",
            lock,
        )
        assert pinned, f"Desktop lock omits bundled dependency {required}"
        assert Version(pinned.group(1)) in required.specifier


def _load():
    spec = spec_from_file_location("assemble_desktop_layout", HELPER)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_python_layers():
    spec = spec_from_file_location("build_python_layers", PYTHON_LAYERS)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_python_layer_prunes_modelscope_dataset_trees(tmp_path):
    helper = _load_python_layers()
    root = tmp_path / "python-packages" / "0+sha.0123456789abcdef"
    datasets = root / "modelscope" / "msdatasets" / "dataset_cls"
    datasets.mkdir(parents=True)
    (datasets / "marker.py").write_text("unused", encoding="utf-8")
    hub = root / "modelscope" / "hub"
    hub.mkdir(parents=True)
    (hub / "api.py").write_text("ok", encoding="utf-8")
    bytecode = hub / "__pycache__"
    bytecode.mkdir()
    (bytecode / "api.cpython-311.pyc").write_bytes(b"cache")
    debug_symbols = root / "PyObjCTest" / "extension.so.dSYM" / "Contents"
    debug_symbols.mkdir(parents=True)
    (debug_symbols / "debug.yml").write_text("debug", encoding="utf-8")
    unused_trees = [
        root / "jedi/third_party/typeshed/stubs/oauthlib/oauth2.pyi",
        root / "lark_oapi/api/security_and_compliance/v2/model.py",
        root / "twilio/rest/api/v2010/account/sip/domain.py",
    ]
    for unused in unused_trees:
        unused.parent.mkdir(parents=True)
        unused.write_text("unused", encoding="utf-8")

    removed = helper.prune_python_packages(root)
    assert removed == [
        "jedi/third_party/typeshed/stubs/oauthlib",
        "lark_oapi/api/security_and_compliance",
        "modelscope/msdatasets",
        "twilio/rest/api/v2010/account/sip",
        "PyObjCTest/extension.so.dSYM",
        "modelscope/hub/__pycache__",
    ]
    assert not (root / "modelscope" / "msdatasets").exists()
    assert not bytecode.exists()
    assert not debug_symbols.parent.exists()
    assert all(not unused.exists() for unused in unused_trees)
    assert (hub / "api.py").is_file()

    helper.assert_portable_relative_paths(
        root,
        packaged_prefix=(
            "payload/binaries/runtimes/python-packages/"
            "0+sha.0123456789abcdef"
        ),
    )


def test_python_layer_rejects_windows_breaking_payload_paths(tmp_path):
    helper = _load_python_layers()
    root = tmp_path / "python-packages" / "0+sha.0123456789abcdef"
    nested = root / "pkg"
    nested.mkdir(parents=True)
    (nested / "module.py").write_text("x", encoding="utf-8")

    try:
        helper.assert_portable_relative_paths(
            root,
            packaged_prefix=(
                "payload/binaries/runtimes/python-packages/"
                "0+sha.0123456789abcdef"
            ),
            limit=40,
        )
    except RuntimeError as error:
        assert "over 40 characters" in str(error)
        assert "Windows Explorer will drop them" in str(error)
    else:
        raise AssertionError("overlong packaged path was accepted")


def test_dependency_layer_digest_is_a_valid_component_version():
    # pylint: disable=protected-access
    helper = _load_python_layers()
    value = helper._dependency_version("e3028883b2090145" + "0" * 48)
    assert value == "0+sha.e3028883b2090145"
    assert str(Version(value)) == value


def _write_layer_fixture_wheel(directory, name, version, files):
    """Create an offline wheel consumed by the real pip installer."""
    metadata = f"{name}-{version}.dist-info"
    files = {
        **files,
        f"{metadata}/METADATA": (
            f"Metadata-Version: 2.1\nName: {name}\nVersion: {version}\n"
        ).encode(),
        f"{metadata}/WHEEL": (
            "Wheel-Version: 1.0\nGenerator: layer-regression\n"
            "Root-Is-Purelib: true\nTag: py3-none-any\n"
        ).encode(),
    }
    records = io.StringIO(newline="")
    writer = csv.writer(records, lineterminator="\n")
    for relative, content in sorted(files.items()):
        digest = base64.urlsafe_b64encode(
            hashlib.sha256(content).digest(),
        ).rstrip(b"=")
        writer.writerow((relative, f"sha256={digest.decode()}", len(content)))
    writer.writerow((f"{metadata}/RECORD", "", ""))
    files[f"{metadata}/RECORD"] = records.getvalue().encode()
    destination = directory / f"{name}-{version}-py3-none-any.whl"
    with zipfile.ZipFile(destination, "w") as archive:
        for relative, content in sorted(files.items()):
            info = zipfile.ZipInfo(relative, (1980, 1, 1, 0, 0, 0))
            archive.writestr(info, content)
    return destination


def _write_layer_fixture_plugins(repo):
    for identifier in (
        "flowforge",
        "qwenpaw-run-center",
        "ugsci",
        "ugsci_research",
        "qwenpaw-data",
    ):
        category = "apps" if identifier == "qwenpaw-data" else "bundle"
        root = repo / "plugins" / category / identifier
        (root / "ui/dist").mkdir(parents=True)
        (root / "ui/dist/index.js").write_text(
            f"window.{identifier.replace('-', '_')} = 1;\n",
            encoding="utf-8",
        )
        (root / "backend.py").write_text("VALUE = 1\n", encoding="utf-8")
        (root / "required.json").write_text("{}", encoding="utf-8")
        (root / "plugin.json").write_text(
            json.dumps(
                {
                    "id": identifier,
                    "version": "1.0.0",
                    "entry": {
                        "backend": "backend.py",
                        "frontend": "ui/dist/index.js",
                    },
                    "pack_requires": ["required.json"],
                    "pack_exclude": ["visualization/data"],
                },
            ),
            encoding="utf-8",
        )
    local_data = repo / "plugins/bundle/ugsci/visualization/data"
    local_data.mkdir(parents=True)
    (local_data / "local.csv").write_text(
        "must remain local",
        encoding="utf-8",
    )


def test_python_layers_real_installs_stay_stable_after_import_validation(
    tmp_path,
    monkeypatch,
):
    """Identical local wheels produce reusable layers without build caches."""
    helper = _load_python_layers()
    repo = tmp_path / "repo"
    _write_layer_fixture_plugins(repo)
    console = repo / "console/dist"
    console.mkdir(parents=True)
    (console / "index.html").write_text("console", encoding="utf-8")
    (repo / "src/qwenpaw").mkdir(parents=True)
    wheelhouse = repo / "wheelhouse"
    wheelhouse.mkdir()
    dependencies = _write_layer_fixture_wheel(
        wheelhouse,
        "qwenpaw_layer_fixture",
        "1.0",
        {
            "xlrd.py": b"VALUE = 1\n",
            "modelscope/__init__.py": b"",
            "modelscope/hub/__init__.py": b"",
            "modelscope/hub/api.py": b"VALUE = 2\n",
        },
    )
    dependency_hash = hashlib.sha256(dependencies.read_bytes()).hexdigest()
    (repo / "requirements-desktop.lock").write_text(
        "--no-index\n"
        f"--find-links {wheelhouse.as_uri()}\n"
        "qwenpaw-layer-fixture==1.0 "
        f"--hash=sha256:{dependency_hash}\n",
        encoding="utf-8",
    )
    original_run = helper._run  # pylint: disable=protected-access
    validations = []
    wheel_paths = []

    def run_with_fixture_wheel(command, *, cwd, env=None):
        if command[1:3] == ["-m", "build"]:
            wheels = Path(command[command.index("--outdir") + 1])
            wheel_paths.append(
                _write_layer_fixture_wheel(
                    wheels,
                    "qwenpaw",
                    "2.2.2b9",
                    {
                        "qwenpaw/__init__.py": b"",
                        "qwenpaw/tauri/__init__.py": b"",
                        "qwenpaw/tauri/entry.py": b"import xlrd\n",
                        "qwenpaw/cli/__init__.py": b"",
                        "qwenpaw/cli/init_cmd.py": b"import xlrd\n",
                        "qwenpaw/app/__init__.py": b"",
                        "qwenpaw/app/_app.py": b"import modelscope.hub.api\n",
                        "qwenpaw/console/index.html": (
                            repo / "src/qwenpaw/console/index.html"
                        ).read_bytes(),
                        "qwenpaw/plugins_bundle/obsolete/plugin.json": b"{}",
                    },
                ),
            )
            return
        if command[1:2] == ["-c"]:
            validations.append(dict(env))
        original_run(command, cwd=cwd, env=env)

    # Windows callers do not normally set this globally. The builder must
    # protect its own validation subprocess instead of relying on its caller.
    monkeypatch.delenv("PYTHONDONTWRITEBYTECODE", raising=False)
    monkeypatch.setattr(helper, "_run", run_with_fixture_wheel)
    inventories = []
    for index in range(2):
        output = tmp_path / f"build-{index}"
        metadata = helper.build_layers(
            repo,
            Path(sys.executable),
            Path(sys.executable),
            output,
            "2.2.2b9",
        )
        backend = output / "app/backend/2.2.2b9"
        plugins = backend / "qwenpaw/plugins_bundle"
        assert set(metadata["bundledPlugins"]) == {
            "flowforge",
            "qwenpaw-run-center",
            "ugsci",
            "ugsci_research",
            "qwenpaw-data",
        }
        assert not (plugins / "obsolete").exists()
        assert not (plugins / "ugsci/visualization/data").exists()
        assert (plugins / "qwenpaw-data/ui/dist/index.js").is_file()
        record = next(backend.glob("qwenpaw-*.dist-info/RECORD"))
        with record.open(encoding="utf-8", newline="") as stream:
            rows = {row[0]: row[1:] for row in csv.reader(stream)}
        delivered = {
            path.relative_to(backend).as_posix()
            for path in plugins.rglob("*")
            if path.is_file()
        }
        assert {
            name for name in rows if name.startswith("qwenpaw/plugins_bundle/")
        } == delivered
        for name in delivered:
            content = (backend / name).read_bytes()
            digest = (
                base64.urlsafe_b64encode(
                    hashlib.sha256(content).digest(),
                )
                .rstrip(b"=")
                .decode("ascii")
            )
            assert rows[name] == [f"sha256={digest}", str(len(content))]
        assert (
            repo / "plugins/bundle/ugsci/visualization/data/local.csv"
        ).read_text("utf-8") == "must remain local"
        assert not list(output.rglob("__pycache__"))
        assert not list(output.rglob("*.pyc"))
        assert not list(output.rglob("direct_url.json"))
        inventories.append(
            {
                path.relative_to(output)
                .as_posix(): hashlib.sha256(
                    path.read_bytes(),
                )
                .hexdigest()
                for path in output.rglob("*")
                if path.is_file()
            },
        )
    assert wheel_paths[0].parent != wheel_paths[1].parent
    assert len(validations) == 2
    assert all(env["PYTHONDONTWRITEBYTECODE"] == "1" for env in validations)
    assert inventories[0] == inventories[1]


@pytest.mark.parametrize("missing", ["ui/dist/index.js", "required.json"])
def test_backend_plugin_staging_rejects_incomplete_canonical_payload(
    tmp_path,
    missing,
):
    # pylint: disable=protected-access
    helper = _load_python_layers()
    repo = tmp_path / "repo"
    _write_layer_fixture_plugins(repo)
    (repo / "plugins/apps/qwenpaw-data" / missing).unlink()
    backend = tmp_path / "backend"
    record = backend / "qwenpaw-2.2.2b9.dist-info/RECORD"
    record.parent.mkdir(parents=True)
    record.write_text("qwenpaw-2.2.2b9.dist-info/RECORD,,\n", encoding="utf-8")
    with pytest.raises(ValueError, match="qwenpaw-data is missing"):
        helper._stage_backend_plugins(repo, backend)


def test_python_layer_console_staging_requires_built_console(tmp_path):
    helper = _load_python_layers()
    repo = tmp_path / "repo"
    (repo / "src/qwenpaw").mkdir(parents=True)

    try:
        with helper._staged_console(repo):  # pylint: disable=protected-access
            pass
    except FileNotFoundError as error:
        assert "built console is missing index.html" in str(error)
    else:
        raise AssertionError("missing console build was accepted")


def test_python_layer_console_staging_restores_existing_files(tmp_path):
    helper = _load_python_layers()
    repo = tmp_path / "repo"
    dist = repo / "console/dist"
    destination = repo / "src/qwenpaw/console"
    dist.mkdir(parents=True)
    destination.mkdir(parents=True)
    (dist / "index.html").write_text("new console", encoding="utf-8")
    (dist / "assets.js").write_text("bundle", encoding="utf-8")
    (destination / "old.txt").write_text("existing", encoding="utf-8")

    with helper._staged_console(repo):  # pylint: disable=protected-access
        staged_index = (destination / "index.html").read_text(encoding="utf-8")
        assert staged_index == "new console"
        assert not (destination / "old.txt").exists()

    assert (destination / "old.txt").read_text(encoding="utf-8") == "existing"
    assert not (destination / "index.html").exists()
    assert not list(repo.glob(".ugsci-console-backup-*"))


def test_python_layer_main_preserves_virtualenv_interpreter_symlink(
    monkeypatch,
    tmp_path,
):
    helper = _load_python_layers()
    repo = tmp_path / "repo"
    output = tmp_path / "output"
    runtime = tmp_path / "runtime-python"
    venv_python = tmp_path / "venv" / "bin" / "python"
    repo.mkdir()
    output.mkdir()
    runtime.write_text("runtime", encoding="utf-8")
    venv_python.parent.mkdir(parents=True)
    try:
        venv_python.symlink_to(Path(sys.executable))
    except OSError:
        # Windows developer machines may not permit symlink creation.  The
        # production regression covered here is the macOS virtualenv path.
        return

    captured = {}

    def fake_build_layers(
        repo_arg,
        host_arg,
        runtime_arg,
        output_arg,
        version,
    ):
        captured.update(
            repo=repo_arg,
            host=host_arg,
            runtime=runtime_arg,
            output=output_arg,
            version=version,
        )
        return {}

    monkeypatch.setattr(helper, "build_layers", fake_build_layers)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "build_python_layers.py",
            "--repo",
            str(repo),
            "--host-python",
            str(venv_python),
            "--runtime-python",
            str(runtime),
            "--output",
            str(output),
            "--version",
            "2.1.1b7",
        ],
    )

    assert helper.main() == 0
    assert captured["host"] == venv_python.absolute()
    assert captured["host"] != venv_python.resolve()


def _stage_test_channel_runtime(binaries, interpreter):
    from qwenpaw.__version__ import __version__

    python = binaries / "python-runtime" / interpreter
    python.parent.mkdir(parents=True)
    python.write_bytes(b"interpreter")
    support = binaries / "channel-runtime/site"
    index = support / "qwenpaw/official_channels/index.json"
    index.parent.mkdir(parents=True)
    index.write_bytes(b"{}")
    manifest = binaries / "channel-runtime/runtime.json"
    original = {
        "schema_version": 1,
        "host_version": __version__,
        "preset": "light",
        "python_executable": python.relative_to(binaries.parent).as_posix(),
        "support_root": support.relative_to(binaries.parent).as_posix(),
        "dependency_paths": [support.relative_to(binaries.parent).as_posix()],
        "python": {
            "version": [3, 12],
            "implementation": "cpython",
            "cache_tag": "cpython-312",
            "sys_platform": "darwin",
            "system": "Darwin",
            "machine": "arm64",
            "supported_tags": ["py3-none-any"],
        },
        "python_runtime_release": "python-3.12-sha",
        "host_wheel_sha256": "0" * 64,
        "official_index_sha256": hashlib.sha256(
            index.read_bytes(),
        ).hexdigest(),
    }
    manifest.write_text(json.dumps(original), encoding="utf-8")

    return manifest, support, original


@pytest.mark.parametrize(
    "interpreter",
    ["python/bin/python3", "python/python.exe"],
)
def test_assemble_moves_stable_resources_into_versioned_boundaries(
    tmp_path,
    monkeypatch,
    interpreter,
):
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker, version in (
        ("python-runtime", ".python-runtime-version", "python-3.12-sha"),
        ("node-runtime", ".node-runtime-version", "node-22-sha"),
        ("java-runtime", ".java-runtime-version", "java-21-sha"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text(version, encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw/tauri").mkdir(parents=True)
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper.exe").write_bytes(b"MZ")

    from qwenpaw.plugins.channel_bootstrap import runtime_manifest

    manifest, support, original = _stage_test_channel_runtime(
        binaries,
        interpreter,
    )

    active = helper.assemble(binaries, "2.1.1b7", "windows-x86_64")

    relocated_python = (
        binaries / "runtimes/python/python-3.12-sha" / interpreter
    )
    for name, value in {
        "QWENPAW_TAURI_RESOURCE_DIR": binaries.parent,
        "QWENPAW_CHANNEL_RUNTIME_MANIFEST": manifest,
        "QWENPAW_DESKTOP_PY_RUNTIME": relocated_python,
        "QWENPAW_CHANNEL_SUPPORT_ROOT": support,
        "QWENPAW_CHANNEL_DEPENDENCY_PATHS": json.dumps([str(support)]),
        "QWENPAW_CHANNEL_PRESET": "light",
    }.items():
        monkeypatch.setenv(name, str(value))
    executable, actual_support, sites, identity, preset = runtime_manifest()
    assert executable == relocated_python.resolve()
    assert actual_support == support.resolve()
    assert sites == (support.resolve(),)
    assert identity == original["python"]
    assert preset == "light"
    updated = json.loads(manifest.read_text(encoding="utf-8"))
    assert (
        updated.pop("python_executable")
        == relocated_python.relative_to(
            binaries.parent,
        ).as_posix()
    )
    original.pop("python_executable")
    assert updated == original

    assert not (binaries / "python-runtime").exists()
    assert (binaries / "runtimes/python/python-3.12-sha").is_dir()
    assert (binaries / "runtimes/node/node-22-sha").is_dir()
    assert (binaries / "runtimes/java/java-21-sha").is_dir()
    assert (binaries / "tools/officecli/2.1.1b7").is_dir()
    assert active["components"]["backend"]["kind"] == "python"
    assert active["target"] == "windows-x86_64"
    assert active["components"]["backend"]["path"].startswith(
        "binaries/app/backend/",
    )
    written = json.loads((binaries / "state/active.json").read_text())
    assert written == active

    from stage_desktop_components import stage
    from component_common import file_inventory

    staging = tmp_path / "update-staging"
    descriptors = stage(binaries, staging, "2.1.1b7")
    for descriptor in descriptors:
        record = active["components"][descriptor["id"]]
        bundled = binaries.parent / record["path"]
        staged = staging / descriptor["id"]
        assert descriptor["version"] == record["version"]
        assert file_inventory(bundled, ()) == file_inventory(staged, ())
        assert b"\r\n" not in (bundled / "component.json").read_bytes()


@pytest.mark.parametrize(
    "executable",
    [
        "binaries/python-runtime/../../outside/python",
        "binaries/python-runtime",
        "binaries/other/python",
        "/outside/python",
        "binaries/python-runtime/C:/outside/python",
        "binaries/python-runtime/..\\outside\\python",
    ],
)
def test_channel_interpreter_relocation_rejects_unsafe_paths(
    tmp_path,
    executable,
):
    helper = _load()
    binaries = tmp_path / "binaries"
    manifest = binaries / "channel-runtime/runtime.json"
    manifest.parent.mkdir(parents=True)
    manifest.write_text(
        json.dumps({"python_executable": executable}),
        encoding="utf-8",
    )
    with pytest.raises(ValueError):
        # pylint: disable=protected-access
        helper._relocate_channel_interpreter(
            binaries,
            binaries / "python-runtime",
            binaries / "runtimes/python/version",
        )


def test_assemble_flattens_macos_java_home_for_component_signing(tmp_path):
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker, version in (
        ("python-runtime", ".python-runtime-version", "python-3.12-sha"),
        ("node-runtime", ".node-runtime-version", "node-22-sha"),
        ("java-runtime", ".java-runtime-version", "java-21-sha"),
    ):
        source = binaries / name
        source.mkdir(parents=True)
        (source / marker).write_text(version, encoding="utf-8")
    java_home = binaries / "java-runtime/Contents/Home"
    (java_home / "bin").mkdir(parents=True)
    (java_home / "bin/java").write_bytes(b"java")
    (java_home / "lib").mkdir()
    (java_home / "lib/libjvm.dylib").write_bytes(b"native runtime")
    (java_home / "legal").mkdir()
    (java_home / "legal/LICENSE").write_text("license", encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.2.2b7/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.2.2b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper").write_bytes(b"helper")

    active = helper.assemble(binaries, "2.2.2b7", "macos-aarch64")
    java_root = binaries.parent / active["components"]["java-runtime"]["path"]
    assert (java_root / "bin/java").read_bytes() == b"java"
    assert (java_root / "lib/libjvm.dylib").read_bytes() == b"native runtime"
    assert (java_root / "legal/LICENSE").read_text() == "license"
    assert (java_root / "component.json").is_file()
    assert not (java_root / "Contents").exists()
    assert not (binaries / "java-runtime").exists()


def test_assemble_materializes_internal_runtime_symlinks(tmp_path):
    if sys.platform == "win32":
        return
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker, version in (
        ("python-runtime", ".python-runtime-version", "python-3.12-sha"),
        ("node-runtime", ".node-runtime-version", "node-22-sha"),
        ("java-runtime", ".java-runtime-version", "java-21-sha"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text(version, encoding="utf-8")
    link_target = binaries / "python-runtime" / "bin" / "2to3-3.12"
    link_target.parent.mkdir(parents=True)
    link_target.write_text("python", encoding="utf-8")
    link = link_target.with_name("2to3")
    try:
        link.symlink_to(link_target.name)
    except OSError:
        return
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw/tauri").mkdir(
        parents=True,
    )
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper").write_bytes(b"helper")

    helper.assemble(binaries, "2.1.1b7", "macos-aarch64")

    materialized = (
        binaries / "runtimes/python/python-3.12-sha" / "bin" / "2to3"
    )
    assert materialized.read_text(encoding="utf-8") == "python"
    assert not materialized.is_symlink()


def test_assemble_shortens_hash_heavy_runtime_directories(tmp_path):
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    full_hash = "b" * 64
    versions = {
        "python-runtime": f"3.12-x86_64-pc-windows-msvc-release-{full_hash}",
        "node-runtime": f"v22.20.0-win-x64-{full_hash}",
        "java-runtime": f"jdk-21.0.12+8-windows-x64-{full_hash}",
    }
    markers = {
        "python-runtime": ".python-runtime-version",
        "node-runtime": ".node-runtime-version",
        "java-runtime": ".java-runtime-version",
    }
    for name, version in versions.items():
        root = binaries / name
        root.mkdir(parents=True)
        (root / markers[name]).write_text(version, encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper.exe").write_bytes(b"MZ")

    active = helper.assemble(binaries, "2.1.1b7", "windows-x86_64")

    for component_id in (
        "python-runtime",
        "node-runtime",
        "java-runtime",
    ):
        component = active["components"][component_id]
        assert component["version"].startswith("2.1.1b7+sha.")
        assert str(Version(component["version"])) == component["version"]
        directory = Path(component["path"]).name
        assert len(directory) <= 45
        assert full_hash not in directory
        assert (tmp_path / "src-tauri" / component["path"]).is_dir()


def test_assemble_requires_exactly_one_dependency_layer(tmp_path):
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker in (
        ("python-runtime", ".python-runtime-version"),
        ("node-runtime", ".node-runtime-version"),
        ("java-runtime", ".java-runtime-version"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text("version", encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/one").mkdir(parents=True)
    (binaries / "runtimes/python-packages/two").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper.exe").write_bytes(b"MZ")

    try:
        helper.assemble(binaries, "2.1.1b7", "windows-x86_64")
    except ValueError as error:
        assert "exactly one Python dependency layer" in str(error)
    else:
        raise AssertionError("multiple dependency layers were accepted")


def test_assemble_accepts_extensionless_macos_helper(tmp_path, monkeypatch):
    helper = _load()
    monkeypatch.setattr(helper.sys, "platform", "darwin")
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker in (
        ("python-runtime", ".python-runtime-version"),
        ("node-runtime", ".node-runtime-version"),
        ("java-runtime", ".java-runtime-version"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text("version", encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper").write_bytes(b"Mach-O")

    active = helper.assemble(binaries, "2.1.1b7", "macos-aarch64")

    assert active["components"]["computer-use-helper"]["path"].endswith(
        "/tools/computer-use/2.1.1b7",
    )
    assert active["target"] == "macos-aarch64"


def test_runtime_manifest_accepts_equivalent_windows_path_spellings(
    tmp_path,
    monkeypatch,
):
    from qwenpaw.plugins.channel_bootstrap import runtime_manifest

    binaries = tmp_path / "binaries"
    manifest, support, _data = _stage_test_channel_runtime(
        binaries,
        "python/python.exe",
    )
    executable = binaries / "python-runtime/python/python.exe"
    prefix = "\\\\?\\" if sys.platform == "win32" else ""
    for name, value in {
        "QWENPAW_TAURI_RESOURCE_DIR": prefix + str(tmp_path),
        "QWENPAW_CHANNEL_RUNTIME_MANIFEST": prefix + str(manifest),
        "QWENPAW_DESKTOP_PY_RUNTIME": str(executable),
        "QWENPAW_CHANNEL_SUPPORT_ROOT": prefix + str(support),
        "QWENPAW_CHANNEL_DEPENDENCY_PATHS": json.dumps([str(support)]),
        "QWENPAW_CHANNEL_PRESET": "light",
    }.items():
        monkeypatch.setenv(name, value)
    actual, actual_support, sites, _identity, _preset = runtime_manifest()
    assert actual.samefile(executable)
    assert actual_support.samefile(support)
    assert sites[0].samefile(support)
