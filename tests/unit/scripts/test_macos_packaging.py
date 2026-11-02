# -*- coding: utf-8 -*-
"""Execute macOS packaging scripts with controlled platform commands."""

import json
import os
import plistlib
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import zipfile

import pytest


ROOT = Path(__file__).resolve().parents[3]
pytestmark = pytest.mark.skipif(
    os.name == "nt" or shutil.which("bash") is None,
    reason="requires POSIX Bash",
)


def _command(bin_dir, name, body):
    path = bin_dir / name
    path.write_text("#!/usr/bin/env bash\n" + body, encoding="utf-8")
    path.chmod(0o755)


def _run(tmp_path, script, *args):
    runtime = tmp_path / "runtime"
    runtime.mkdir(exist_ok=True)
    environment = {
        **os.environ,
        "PATH": f"{tmp_path / 'bin'}{os.pathsep}{os.environ['PATH']}",
        "HOME": str(tmp_path / "home"),
        "RUNNER_TEMP": str(runtime),
        "GITHUB_ENV": str(tmp_path / "github-env"),
        "COMMAND_LOG": str(tmp_path / "commands.log"),
    }
    bash_env = tmp_path / "bash-env"
    if bash_env.is_file():
        environment["BASH_ENV"] = str(bash_env)
    return subprocess.run(
        ["bash", str(ROOT / script), *map(str, args)],
        cwd=tmp_path,
        env=environment,
        capture_output=True,
        text=True,
        timeout=10,
        check=False,
    )


@pytest.mark.parametrize("app", [True, False], ids=["app", "backend"])
def test_signing_skips_debug_symbols_and_keeps_native_signatures(
    tmp_path,
    app,
):
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    _command(bin_dir, "uname", "echo Darwin\n")
    _command(bin_dir, "file", "echo 'Mach-O 64-bit bundle arm64'\n")
    _command(bin_dir, "codesign", 'printf "%s\\n" "$*" >> "$COMMAND_LOG"\n')
    target = tmp_path / ("Desktop.app" if app else "backend")
    native = target / "native.so"
    debug = target / "native.so.dSYM/Contents/Resources/DWARF/native.so"
    framework = target / "Python.framework"
    for path in (native, debug, framework / "Python"):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.touch()

    result = _run(tmp_path, "scripts/pack-tauri/sign_macos_bundle.sh", target)

    assert result.returncode == 0, result.stdout + result.stderr
    calls = (tmp_path / "commands.log").read_text().splitlines()
    assert all(".dSYM" not in call for call in calls)
    assert f"--force --sign - --timestamp=none {native}" in calls
    assert f"--force --sign - --timestamp=none {framework}" in calls
    assert not any(call.endswith(str(framework / "Python")) for call in calls)
    if app:
        assert calls[-2:] == [
            f"--force --sign - --timestamp=none {target}",
            f"--verify --deep --strict --verbose=2 {target}",
        ]
    else:
        assert f"--verify --verbose=2 {native}" in calls
        assert f"--verify --verbose=2 {framework}" in calls


@pytest.mark.parametrize("missing", [None, "app", "executable"])
def test_launcher_uses_real_top_level_app(tmp_path, missing):
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    for name in ("xattr", "ps", "curl"):
        _command(bin_dir, name, "exit 0\n")
    _command(bin_dir, "sleep", "/bin/sleep 0.02\n")
    _command(bin_dir, "uuidgen", "echo 12345678-1234-5678-1234-567812345678\n")
    reader = tmp_path / "read-plist.py"
    reader.write_text(
        "import plistlib, sys\n"
        "assert sys.argv[1:3] == ['-c', 'Print :CFBundleExecutable']\n"
        "with open(sys.argv[3], 'rb') as source:\n"
        "    print(plistlib.load(source)['CFBundleExecutable'])\n",
        encoding="utf-8",
    )
    # Bash functions can cover this fixed macOS command on Linux too. The
    # fixture still parses a real plist rather than returning a canned name.
    (tmp_path / "bash-env").write_text(
        "function /usr/libexec/PlistBuddy() {\n"
        f'  {shlex.quote(sys.executable)} {shlex.quote(str(reader))} "$@"\n'
        "}\n",
        encoding="utf-8",
    )
    app = "UGSci Desktop.app"
    dist = tmp_path / "dist"
    dist.mkdir()
    with zipfile.ZipFile(dist / "UGSci-Tauri-test-macOS.zip", "w") as archive:
        archive.writestr(f"__MACOSX/{app}/._Contents", b"metadata")
        if missing != "app":
            archive.writestr(
                f"{app}/Contents/Info.plist",
                plistlib.dumps({"CFBundleExecutable": "qwenpaw-desktop"}),
            )
            if missing != "executable":
                executable = zipfile.ZipInfo(
                    f"{app}/Contents/MacOS/qwenpaw-desktop",
                )
                executable.create_system = 3
                executable.external_attr = 0o100755 << 16
                archive.writestr(
                    executable,
                    f"#!{sys.executable}\n"
                    "import json, os\n"
                    "from pathlib import Path\n"
                    "port = Path(os.environ['HOME']) / "
                    "'.qwenpaw/desktop_port'\n"
                    "port.parent.mkdir(parents=True, exist_ok=True)\n"
                    "record = {\n"
                    "    'path': str(Path(__file__).resolve()),\n"
                    "    'nonce': os.environ['QWENPAW_UI_VERIFY_NONCE'],\n"
                    "    'report': "
                    "os.environ['QWENPAW_UI_VERIFY_REPORT_PATH'],\n"
                    "}\n"
                    "Path(record['report']).write_text(\n"
                    "    json.dumps(record), encoding='utf-8')\n"
                    "Path(os.environ['COMMAND_LOG']).write_text(\n"
                    "    json.dumps(record) + '\\n', encoding='utf-8')\n"
                    "port.write_text('12345', encoding='utf-8')\n",
                )

    result = _run(tmp_path, "scripts/verify/launch_tauri_macos.sh")

    log = tmp_path / "commands.log"
    if missing:
        assert result.returncode != 0, result.stdout + result.stderr
        assert not log.exists(), "invalid bundle must not be launched"
    else:
        assert result.returncode == 0, result.stdout + result.stderr
        entries = log.read_text(encoding="utf-8").splitlines()
        assert len(entries) == 1
        launched = json.loads(entries[0])
        environment = dict(
            line.split("=", 1)
            for line in (tmp_path / "github-env")
            .read_text(
                encoding="utf-8",
            )
            .splitlines()
        )
        extraction_root = Path(environment["TAURI_VERIFY_ROOT"])
        assert extraction_root.parent == tmp_path / "runtime"
        assert Path(launched["path"]) == (
            extraction_root / app / "Contents/MacOS/qwenpaw-desktop"
        )
        assert environment["BASE_URL"] == "http://127.0.0.1:12345"
        assert launched["nonce"] == environment["QWENPAW_UI_VERIFY_NONCE"]
        assert launched["nonce"] == "12345678123456781234567812345678"
        assert (
            launched["report"] == environment["QWENPAW_UI_VERIFY_REPORT_PATH"]
        )
        assert Path(launched["report"]) == (
            tmp_path / "runtime/qwenpaw-native-ui-report.json"
        )
        assert (
            json.loads(Path(launched["report"]).read_text(encoding="utf-8"))
            == launched
        )
        assert environment["TAURI_PID"].isdigit()
