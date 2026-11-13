# -*- coding: utf-8 -*-
"""Cross-platform guards for the Mac drag-install release path."""

import importlib.util
import hashlib
import json
from pathlib import Path
import plistlib
import struct
import subprocess
import sys
import zipfile

from PIL import Image
import pytest
import yaml

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "ugsci_macos_dmg",
    ROOT / "scripts/pack-tauri/macos_dmg.py",
)
assert SPEC is not None and SPEC.loader is not None
DMG = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DMG)


def _envelope(path: Path) -> None:
    data = b"compressed image data"
    metadata = plistlib.dumps(
        {"resource-fork": {"blkx": [{"Data": b"block"}]}},
    )
    trailer = bytearray(512)
    struct.pack_into(">4sII", trailer, 0, b"koly", 4, 512)
    struct.pack_into(">QQ", trailer, 24, 0, len(data))
    struct.pack_into(">QQ", trailer, 216, len(data), len(metadata))
    path.write_bytes(data + metadata + trailer)


def test_dmg_rejects_truncated_and_out_of_bounds_images(tmp_path):
    path = tmp_path / "UGSci.dmg"
    _envelope(path)
    DMG.verify_envelope(path)
    original = path.read_bytes()
    for data in (original[:400], b"not-a-dmg" * 100, original[:-1]):
        path.write_bytes(data)
        with pytest.raises(ValueError):
            DMG.verify_envelope(path)
    damaged = bytearray(original)
    struct.pack_into(">Q", damaged, len(damaged) - 512 + 224, 2**63)
    path.write_bytes(damaged)
    with pytest.raises(ValueError, match="resource map"):
        DMG.verify_envelope(path)


def test_dmg_settings_keep_live_icons_and_retina_instruction_artwork(tmp_path):
    app = tmp_path / "UGSci.app"
    (app / "Contents").mkdir(parents=True)
    (app / "Contents/Info.plist").write_bytes(
        plistlib.dumps({"CFBundleName": "UGSci"}),
    )
    settings = DMG.settings(app)
    assert settings["symlinks"] == {"应用程序": "/Applications"}
    assert settings["icon_locations"] == {
        "UGSci.app": (190, 170),
        "应用程序": (450, 170),
    }
    assert settings["window_rect"] == ((200, 120), (640, 400))
    assert settings["files"] == [str(app.resolve())]
    assert settings["hide_extensions"] == ["UGSci.app"]
    for name, size in (
        ("dmg-background.png", (640, 400)),
        ("dmg-background@2x.png", (1280, 800)),
    ):
        with Image.open(DMG.ASSETS / name) as image:
            assert image.size == size
            scale = size[0] // 640
            assert image.getpixel((320 * scale, 170 * scale)) != (
                255,
                255,
                255,
            )
            # App and folder remain interactive Finder entries.
            assert image.getpixel((190 * scale, 170 * scale)) == (
                255,
                255,
                255,
            )
            assert image.getpixel((450 * scale, 170 * scale)) == (
                255,
                255,
                255,
            )


def test_dmg_payload_comparison_detects_missing_changed_and_empty_paths(
    tmp_path,
):
    app = tmp_path / "UGSci.app"
    (app / "Contents/empty").mkdir(parents=True)
    source = app / "Contents/cafe\u0301.txt"
    source.write_bytes(b"signed payload")
    expected = DMG.app_inventory(app)
    assert "Contents/café.txt" in expected
    assert expected["Contents/empty"][0] == "directory"
    source.write_bytes(b"changed payload")
    assert DMG.app_inventory(app) != expected
    source.unlink()
    assert DMG.app_inventory(app) != expected


def test_dmg_capacity_accounts_for_allocation_and_empty_directories(tmp_path):
    app = tmp_path / "UGSci.app"
    contents = app / "Contents"
    contents.mkdir(parents=True)
    (contents / "Info.plist").write_bytes(
        plistlib.dumps({"CFBundleName": "UGSci"}),
    )
    initial = int(DMG.settings(app)["size"][:-1])
    for number in range(512):
        (contents / f"small-{number}").write_bytes(b"x")
        (contents / f"empty-{number}").mkdir()
    with_entries = int(DMG.settings(app)["size"][:-1])
    assert with_entries >= initial + 16
    large_file = contents / "runtime.bin"
    large_file.write_bytes(b"x" * (2 * 1024 * 1024 + 1))
    with_runtime = int(DMG.settings(app)["size"][:-1])
    assert with_runtime >= with_entries + 2
    assert DMG.settings(app)["size"].endswith("m")


def test_dmg_notary_credentials_and_failures_do_not_expose_secrets(
    monkeypatch,
):
    secret = "private-notary-password"
    args = DMG.notary_credentials(
        {
            "APPLE_ID": "account@example.invalid",
            "APPLE_TEAM_ID": "team",
            "APPLE_PASSWORD": secret,
        },
    )
    assert args == [
        "--apple-id",
        "account@example.invalid",
        "--password",
        secret,
        "--team-id",
        "team",
    ]
    assert DMG.notary_credentials({"APPLE_PASSWORD": secret}) == []
    monkeypatch.setattr(
        DMG.subprocess,
        "run",
        lambda *a, **k: subprocess.CompletedProcess(
            a,
            1,
            b"",
            secret.encode(),
        ),
    )
    with pytest.raises(RuntimeError) as failure:
        DMG.run_tool(["xcrun", "notarytool", *args])
    assert secret not in str(failure.value)


def test_dmg_codesign_errors_preserve_signature_diagnostics(monkeypatch):
    detail = b"UGSci.app: a sealed resource is missing or invalid"
    monkeypatch.setattr(
        DMG.subprocess,
        "run",
        lambda *args, **kwargs: subprocess.CompletedProcess(
            args,
            1,
            b"",
            detail,
        ),
    )
    with pytest.raises(RuntimeError, match="sealed resource is missing"):
        DMG.run_tool(
            ["codesign", "--verify", "--deep", "--strict", "UGSci.app"],
        )


@pytest.mark.parametrize(
    "folder",
    [
        "private_keys",
        "home/private_keys",
        "home/.private_keys",
        "home/.appstoreconnect/private_keys",
    ],
)
def test_dmg_accepts_existing_tauri_notary_key_locations(
    tmp_path,
    monkeypatch,
    folder,
):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(DMG.Path, "home", lambda: tmp_path / "home")
    key = tmp_path / folder / "AuthKey_TESTKEY.p8"
    key.parent.mkdir(parents=True)
    key.write_bytes(b"isolated key-location fixture")
    environment = {"APPLE_API_KEY": "TESTKEY", "APPLE_API_ISSUER": "issuer"}
    args = DMG.notary_credentials(environment)
    assert Path(args[1]).resolve() == key.resolve()
    assert args[2:] == ["--key-id", "TESTKEY", "--issuer", "issuer"]
    explicit = {**environment, "APPLE_API_KEY_PATH": str(key)}
    assert DMG.notary_credentials(explicit) == [
        "--key",
        str(key),
        "--key-id",
        "TESTKEY",
        "--issuer",
        "issuer",
    ]
    key.unlink()
    assert DMG.notary_credentials(environment) == []


def test_dmg_release_checks_use_the_release_infrastructure_checkout():
    for name in ("desktop-publish.yml", "desktop-promote.yml"):
        document = yaml.safe_load(
            (ROOT / ".github/workflows" / name).read_text(encoding="utf-8"),
        )
        checks = [
            step["run"]
            for job in document["jobs"].values()
            for step in job.get("steps", [])
            if "verify-envelope --dmg" in step.get("run", "")
        ]
        assert checks
        assert all(
            'python "$RELEASE_INFRA/scripts/pack-tauri/macos_dmg.py"' in script
            for script in checks
        )


def test_dmg_is_published_and_selected_after_updater_metadata():
    publish = (ROOT / ".github/workflows/desktop-publish.yml").read_text(
        encoding="utf-8",
    )
    promote = (ROOT / ".github/workflows/desktop-promote.yml").read_text(
        encoding="utf-8",
    )
    build = (ROOT / ".github/workflows/desktop-build.yml").read_text(
        encoding="utf-8",
    )
    assert "dist/UGSci-Tauri-*-macOS.dmg.sha256" in build
    assert '"UGSci-Tauri-${VERSION}-macOS.dmg"' in publish
    assert '"UGSci-Tauri-latest-macOS.dmg"' in promote
    builder = (
        ROOT / "scripts/pack-tauri/build_macos_pyinstaller.sh"
    ).read_text(
        encoding="utf-8",
    )
    assert builder.index("requirements-macos-dmg.txt") < builder.index(
        "scripts/pack/verify_desktop_icons.py",
    )
    dependencies = (
        ROOT / "scripts/pack-tauri/requirements-macos-dmg.txt"
    ).read_text(encoding="utf-8")
    assert "Pillow==12.3.0" in dependencies
    workflow = yaml.safe_load(promote)
    script = next(
        step["run"]
        for step in workflow["jobs"]["promote-oss"]["steps"]
        if step.get("name") == "Update desktop index"
    )
    assert script.index('"mac-tauri-updater-metadata.json"') < script.index(
        '"mac-tauri-metadata.json"',
    )
    verifier = (ROOT / "scripts/pack/verify_desktop_artifacts.py").read_text(
        encoding="utf-8",
    )
    assert (
        '"macos-dmg": "UGSci-Desktop-Tauri-macOS-*/UGSci-Tauri-*-macOS.dmg"'
        in verifier
    )
    launch = (ROOT / "scripts/verify/launch_tauri_macos.sh").read_text(
        encoding="utf-8",
    )
    assert "install-for-verification" in launch
    assert '"$APP_EXECUTABLE"' in launch


def test_dmg_cli_rejects_bad_images_without_native_tools(tmp_path):
    image = tmp_path / "invalid.dmg"
    image.write_bytes(b"invalid")
    result = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts/pack-tauri/macos_dmg.py"),
            "verify-envelope",
            "--dmg",
            str(image),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode != 0
    assert "Truncated DMG" in result.stderr


def test_dmg_artifact_gate_preserves_zip_callers_and_checks_dmg_bytes(
    tmp_path,
):
    directory = tmp_path / "UGSci-Desktop-Tauri-macOS-test"
    directory.mkdir()
    archive = directory / "UGSci-Tauri-1.0-macOS.zip"
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr("UGSci.app/Contents/Info.plist", b"fixture")
    checksum = (
        f"{hashlib.sha256(archive.read_bytes()).hexdigest()}  {archive.name}\n"
    )
    Path(f"{archive}.sha256").write_text(checksum, encoding="ascii")
    command = [
        sys.executable,
        str(ROOT / "scripts/pack/verify_desktop_artifacts.py"),
        "--root",
        str(tmp_path),
        "--brand",
        "ugsci",
        "--require",
        "macos",
    ]
    legacy = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )
    assert legacy.returncode == 0, legacy.stderr
    image = directory / "UGSci-Tauri-1.0-macOS.dmg"
    _envelope(image)
    checksum = (
        f"{hashlib.sha256(image.read_bytes()).hexdigest()}  {image.name}\n"
    )
    Path(f"{image}.sha256").write_text(checksum, encoding="ascii")
    command.extend(["--require", "macos-dmg"])
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    image.write_bytes(b"tampered" + image.read_bytes()[8:])
    damaged = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )
    assert damaged.returncode != 0
    assert "SHA-256 mismatch" in damaged.stderr


def test_dmg_metadata_generates_the_public_installer_download(tmp_path):
    image = tmp_path / "UGSci-Tauri-1.0-macOS.dmg"
    _envelope(image)
    metadata, index = tmp_path / "metadata.json", tmp_path / "index.json"
    result = subprocess.run(
        [
            sys.executable,
            "-X",
            "utf8",
            str(ROOT / "scripts/pack/generate_oss_metadata.py"),
            "--file",
            str(image),
            "--product",
            "desktop",
            "--platform",
            "mac-tauri",
            "--version",
            "1.0",
            "--output",
            str(metadata),
            "--merge-index",
            str(index),
            "--output-index",
            str(index),
        ],
        capture_output=True,
        encoding="utf-8",
        check=False,
    )
    assert result.returncode == 0, result.stderr
    document = json.loads(index.read_text(encoding="utf-8"))
    current = document["files"][document["platforms"]["mac-tauri"]["latest"]]
    assert current["type"] == "dmg"
    assert current["filename"] == image.name
    assert current["url"].endswith(f"/mac-tauri/{image.name}")
