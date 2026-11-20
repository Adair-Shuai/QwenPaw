# -*- coding: utf-8 -*-
"""Execute macOS packaging scripts with controlled platform commands."""

import os
from pathlib import Path
import plistlib
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
    return subprocess.run(
        ["bash", str(ROOT / script), *map(str, args)],
        cwd=tmp_path,
        env={
            **os.environ,
            "PATH": f"{tmp_path / 'bin'}{os.pathsep}{os.environ['PATH']}",
            "HOME": str(tmp_path / "home"),
            "GITHUB_ENV": str(tmp_path / "github-env"),
            "COMMAND_LOG": str(tmp_path / "commands.log"),
            "RUNNER_TEMP": str(tmp_path),
            "REAL_PYTHON": sys.executable,
        },
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
    _command(bin_dir, "uuidgen", "echo 01234567-89ab-cdef-0123-456789abcdef\n")
    for name in ("xattr", "sleep", "ps", "curl"):
        _command(bin_dir, name, "exit 0\n")
    # The native DMG suite validates the real mount, copy and signatures.
    # This shell fixture exercises the verified-app handoff and real launch.
    _command(
        bin_dir,
        "python3",
        "set -eu\n"
        'if [ "$1" = "scripts/pack-tauri/macos_dmg.py" ] && '
        '[ "$2" = "install-for-verification" ]; then\n'
        '  test "$3" = "--dmg"\n'
        '  test "$4" = "dist/UGSci-Tauri-test-macOS.dmg"\n'
        '  test "$5" = "--destination"\n'
        '  printf "%s\\n" "$@" > "$RUNNER_TEMP/dmg-handoff.log"\n'
        '  unzip -q dist/UGSci-Tauri-test-macOS.zip -d "$6"\n'
        '  printf "%s/UGSci.app\\n" "$6"\n'
        "else\n"
        '  exec "$REAL_PYTHON" "$@"\n'
        "fi\n",
    )
    app = "UGSci.app"
    dist = tmp_path / "dist"
    dist.mkdir()
    (dist / "UGSci-Tauri-test-macOS.dmg").write_bytes(
        b"controlled native mount fixture",
    )
    with zipfile.ZipFile(
        dist / "UGSci-Tauri-test-macOS.zip",
        "w",
    ) as archive:
        archive.writestr(f"__MACOSX/{app}/._Contents", b"metadata")
        if missing != "app":
            archive.writestr(
                f"{app}/Contents/Info.plist",
                plistlib.dumps(
                    {
                        "CFBundleName": "UGSci",
                        "CFBundleExecutable": "qwenpaw-desktop",
                    },
                ),
            )
            if missing != "executable":
                executable = zipfile.ZipInfo(
                    f"{app}/Contents/MacOS/qwenpaw-desktop",
                )
                executable.external_attr = 0o100755 << 16
                archive.writestr(
                    executable,
                    "#!/usr/bin/env bash\n"
                    'printf "%s\\n" "$0" >> "$COMMAND_LOG"\n'
                    'printf "%s\\n" "$QWENPAW_UI_VERIFY_NONCE" '
                    '>> "$COMMAND_LOG"\n'
                    'mkdir -p "$HOME/.qwenpaw"\n'
                    'echo 12345 > "$HOME/.qwenpaw/desktop_port"\n',
                )
    port = tmp_path / "home/.qwenpaw/desktop_port"
    port.parent.mkdir(parents=True)
    port.write_text("12345")

    result = _run(tmp_path, "scripts/verify/launch_tauri_macos.sh")

    log = tmp_path / "commands.log"
    if missing:
        assert result.returncode != 0, result.stdout + result.stderr
        assert not log.exists(), "invalid bundle must not be launched"
    else:
        assert result.returncode == 0, result.stdout + result.stderr
        environment = dict(
            line.split("=", 1)
            for line in (tmp_path / "github-env").read_text().splitlines()
        )
        verify_root = Path(environment["TAURI_VERIFY_ROOT"])
        assert verify_root.parent == tmp_path
        assert (tmp_path / "dmg-handoff.log").read_text().splitlines() == [
            "scripts/pack-tauri/macos_dmg.py",
            "install-for-verification",
            "--dmg",
            "dist/UGSci-Tauri-test-macOS.dmg",
            "--destination",
            str(verify_root),
        ]
        assert log.read_text().splitlines() == [
            str(verify_root / app / "Contents/MacOS/qwenpaw-desktop"),
            "0123456789abcdef0123456789abcdef",
        ]
        assert environment["BASE_URL"] == "http://127.0.0.1:12345"
        assert environment["QWENPAW_UI_VERIFY_NONCE"] == (
            "0123456789abcdef0123456789abcdef"
        )
        assert environment["QWENPAW_UI_VERIFY_REPORT_PATH"] == str(
            tmp_path / "qwenpaw-native-ui-report.json",
        )
