# -*- coding: utf-8 -*-
"""Build and verify the UGSci drag-install disk image."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import plistlib
import stat
import struct
import subprocess
import sys
import tempfile
import time
import unicodedata

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "scripts/pack/assets"
APP_NAME = "UGSci.app"
APPLICATIONS = "应用程序"
POSITIONS = {APP_NAME: (190, 170), APPLICATIONS: (450, 170)}
WINDOW = ((200, 120), (640, 400))


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def app_inventory(root: Path) -> dict:
    """Compare real file content, modes, empty directories and bundle links."""
    inventory = {}
    for path in sorted(root.rglob("*")):
        relative = unicodedata.normalize(
            "NFC",
            path.relative_to(root).as_posix(),
        )
        if relative in inventory:
            raise ValueError(f"Duplicate normalized bundle path: {relative}")
        if path.is_symlink():
            path.resolve().relative_to(root.resolve())
            value: tuple = (
                "link",
                unicodedata.normalize("NFC", os.readlink(path)),
            )
        elif path.is_dir():
            value = ("directory", stat.S_IMODE(path.stat().st_mode))
        elif path.is_file():
            value = ("file", stat.S_IMODE(path.stat().st_mode), digest(path))
        else:
            raise ValueError(f"Unsupported bundle entry: {relative}")
        inventory[relative] = value
    if not inventory:
        raise ValueError("The app bundle is empty")
    return inventory


def validate_app_name(app: Path) -> None:
    if app.name != APP_NAME or not (app / "Contents/Info.plist").is_file():
        raise ValueError("DMG input must be a complete UGSci.app bundle")
    info = plistlib.loads((app / "Contents/Info.plist").read_bytes())
    if info.get("CFBundleName") != "UGSci":
        raise ValueError("DMG app must have the UGSci product name")


def settings(app: Path) -> dict:
    validate_app_name(app)
    # HFS+ allocation and catalog metadata exceed logical file sizes for the
    # many small files in the Python runtime. Reserve space per entry as well
    # as proportional filesystem headroom before copying the signed bundle.
    allocation_unit = 16 * 1024
    allocated_bytes = 0
    for path in app.rglob("*"):
        size = path.lstat().st_size
        blocks = max(1, (size + allocation_unit - 1) // allocation_unit)
        allocated_bytes += blocks * allocation_unit
    image_bytes = allocated_bytes + max(
        256 * 1024 * 1024,
        allocated_bytes // 4,
    )
    mebibyte = 1024 * 1024
    image_mebibytes = (image_bytes + mebibyte - 1) // mebibyte
    return {
        "format": "UDZO",
        "filesystem": "HFS+",
        "size": f"{image_mebibytes}m",
        "files": [str(app.resolve())],
        "symlinks": {APPLICATIONS: "/Applications"},
        "icon": str(ASSETS / "icon.icns"),
        "background": str(ASSETS / "dmg-background.png"),
        "window_rect": WINDOW,
        "icon_locations": POSITIONS,
        "icon_size": 96,
        "text_size": 13,
        "default_view": "icon-view",
        "include_icon_view_settings": True,
        "include_list_view_settings": False,
        "show_toolbar": False,
        "show_sidebar": False,
        "show_status_bar": False,
        "show_pathbar": False,
        "show_tab_view": False,
        "show_icon_preview": False,
        # SetFile extension flags add forbidden FinderInfo to a signed bundle.
        "hide_extensions": [],
    }


def verify_envelope(path: Path) -> None:
    """Validate the UDIF envelope as well as the transfer checksum on any OS."""
    size = path.stat().st_size
    if size <= 512:
        raise ValueError("Truncated DMG")
    with path.open("rb") as stream:
        stream.seek(-512, 2)
        trailer = stream.read(512)
        if trailer[:4] != b"koly" or struct.unpack_from(">II", trailer, 4) != (
            4,
            512,
        ):
            raise ValueError("Invalid UDIF trailer")
        data_offset, data_size = struct.unpack_from(">QQ", trailer, 24)
        xml_offset, xml_size = struct.unpack_from(">QQ", trailer, 216)
        if not data_size or data_offset + data_size > size - 512:
            raise ValueError("DMG data fork is outside the file")
        if (
            not 0 < xml_size <= 64 * 1024 * 1024
            or xml_offset + xml_size > size - 512
        ):
            raise ValueError("DMG resource map is outside the file")
        stream.seek(xml_offset)
        metadata = plistlib.loads(stream.read(xml_size))
        if not isinstance(metadata, dict) or not isinstance(
            metadata.get("resource-fork"),
            dict,
        ):
            raise ValueError("DMG resource map is invalid")
        if not metadata["resource-fork"].get("blkx"):
            raise ValueError("DMG block map is missing")


def run_tool(arguments: list[str]) -> bytes:
    try:
        result = subprocess.run(
            arguments,
            capture_output=True,
            check=False,
            timeout=1800,
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"{Path(arguments[0]).name} timed out") from None
    if result.returncode:
        # Notary credentials may be command arguments. Keep them out of errors.
        detail = ""
        if Path(arguments[0]).name == "codesign":
            detail = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(
            f"{Path(arguments[0]).name} failed with exit code {result.returncode}"
            + (f"\n{detail}" if detail else ""),
        )
    return result.stdout


def require_macos() -> None:
    if sys.platform != "darwin":
        raise RuntimeError("Creating or mounting DMGs requires macOS")


@contextmanager
def mounted(path: Path):
    require_macos()
    mount = Path(tempfile.mkdtemp(prefix="ugsci-dmg-verify-"))
    attached = False
    try:
        run_tool(
            [
                "hdiutil",
                "attach",
                "-readonly",
                "-nobrowse",
                "-noautoopen",
                "-mountpoint",
                str(mount),
                "-plist",
                str(path.resolve()),
            ],
        )
        attached = True
        yield mount
    finally:
        if attached or os.path.ismount(mount):
            for attempt in range(3):
                result = subprocess.run(
                    ["hdiutil", "detach", str(mount)],
                    capture_output=True,
                    check=False,
                )
                if result.returncode == 0:
                    break
                time.sleep(attempt + 1)
            else:
                raise RuntimeError(
                    f"Could not detach verification volume: {mount}",
                )
        # Never recursively remove a mount point, including after detach failure.
        mount.rmdir()


def verify_layout(volume: Path) -> None:
    from ds_store import DSStore  # pylint: disable=import-outside-toplevel
    from mac_alias import Alias  # pylint: disable=import-outside-toplevel

    with DSStore.open(str(volume / ".DS_Store"), "r") as store:
        for name, position in POSITIONS.items():
            if tuple(store[name]["Iloc"]) != position:
                raise ValueError(f"DMG icon position is incorrect: {name}")
        window, icons = store["."]["bwsp"], store["."]["icvp"]
        for key in (
            "ShowToolbar",
            "ShowSidebar",
            "ShowStatusBar",
            "ShowPathbar",
            "ShowTabView",
        ):
            if window[key]:
                raise ValueError(f"DMG window setting is incorrect: {key}")
        if window["WindowBounds"] != "{{200, 120}, {640, 400}}":
            raise ValueError("DMG window size is incorrect")
        if (
            icons["iconSize"] != 96
            or icons["textSize"] != 13
            or icons["backgroundType"] != 2
        ):
            raise ValueError(
                "DMG icon, text or background settings are incorrect",
            )
        alias = Alias.from_bytes(icons["backgroundImageAlias"])
        if alias.target.filename != ".background.tiff":
            raise ValueError("DMG background alias is incorrect")


def verify_background(volume: Path) -> None:
    from PIL import Image  # pylint: disable=import-outside-toplevel

    with Image.open(volume / ".background.tiff") as background:
        seen = set()
        for index in range(background.n_frames):
            background.seek(index)
            scale = {(640, 400): 1, (1280, 800): 2}.get(background.size)
            if scale is None or scale in seen:
                raise ValueError("Unexpected DMG background resolution")
            seen.add(scale)
            suffix = "@2x" if scale == 2 else ""
            with Image.open(
                ASSETS / f"dmg-background{suffix}.png",
            ) as expected:
                if (
                    background.convert("RGB").tobytes()
                    != expected.convert("RGB").tobytes()
                ):
                    raise ValueError(
                        "DMG background pixels do not match the approved artwork",
                    )
        if seen != {1, 2}:
            raise ValueError(
                "DMG background must include 1x and Retina representations",
            )


def verify_volume(volume: Path, source: Path | None = None) -> Path:
    visible = {
        path.name for path in volume.iterdir() if not path.name.startswith(".")
    }
    if visible != {APP_NAME, APPLICATIONS}:
        raise ValueError(
            "DMG must contain UGSci.app and the Applications shortcut",
        )
    link, app = volume / APPLICATIONS, volume / APP_NAME
    if not link.is_symlink() or os.readlink(link) != "/Applications":
        raise ValueError("DMG Applications link is invalid")
    if app.is_symlink() or not (app / "Contents/Info.plist").is_file():
        raise ValueError("DMG application bundle is missing or redirected")
    validate_app_name(app)
    verify_layout(volume)
    verify_background(volume)
    if (volume / ".VolumeIcon.icns").read_bytes() != (
        ASSETS / "icon.icns"
    ).read_bytes():
        raise ValueError("DMG volume icon does not match UGSci")
    run_tool(["codesign", "--verify", "--deep", "--strict", str(app)])
    if source is not None and app_inventory(app) != app_inventory(source):
        raise ValueError("DMG app differs from the signed source app")
    return app


def verify_dmg(path: Path, source: Path | None = None) -> None:
    verify_envelope(path)
    run_tool(["hdiutil", "verify", str(path)])
    with mounted(path) as volume:
        verify_volume(volume, source)


def notary_credentials(environment: dict) -> list[str]:
    profile = environment.get("APPLE_NOTARY_KEYCHAIN_PROFILE")
    if profile:
        return ["--keychain-profile", profile]
    keys = ("APPLE_ID", "APPLE_PASSWORD", "APPLE_TEAM_ID")
    if all(environment.get(key) for key in keys):
        return [
            "--apple-id",
            environment[keys[0]],
            "--password",
            environment[keys[1]],
            "--team-id",
            environment[keys[2]],
        ]
    key_id = environment.get("APPLE_API_KEY")
    issuer = environment.get("APPLE_API_ISSUER")
    if key_id and issuer:
        key_path = environment.get("APPLE_API_KEY_PATH")
        if not key_path:
            folders = (
                Path("private_keys"),
                Path.home() / "private_keys",
                Path.home() / ".private_keys",
                Path.home() / ".appstoreconnect/private_keys",
            )
            key_path = next(
                (
                    str(folder / f"AuthKey_{key_id}.p8")
                    for folder in folders
                    if (folder / f"AuthKey_{key_id}.p8").is_file()
                ),
                None,
            )
        if key_path:
            return ["--key", key_path, "--key-id", key_id, "--issuer", issuer]
    return []


def enabled(name: str) -> bool:
    return os.environ.get(name, "").lower() in {"1", "true", "yes"}


def finalize(path: Path) -> None:
    identity = os.environ.get("APPLE_SIGNING_IDENTITY") or "-"
    required = enabled("QWENPAW_REQUIRE_NOTARIZATION")
    if identity == "-" and (
        required or enabled("QWENPAW_REQUIRE_PLATFORM_SIGNING")
    ):
        raise ValueError(
            "Release DMG requires a configured Developer ID identity",
        )
    if identity != "-":
        run_tool(["codesign", "--sign", identity, "--timestamp", str(path)])
        run_tool(["codesign", "--verify", "--strict", str(path)])
    credentials = notary_credentials(dict(os.environ))
    if required and not credentials:
        raise ValueError("DMG notarization credentials are missing")
    if credentials and identity != "-":
        response = json.loads(
            run_tool(
                [
                    "xcrun",
                    "notarytool",
                    "submit",
                    str(path),
                    "--wait",
                    "--output-format",
                    "json",
                    *credentials,
                ],
            ),
        )
        if response.get("status") != "Accepted":
            raise ValueError(
                "Apple did not accept the DMG notarization request",
            )
        run_tool(["xcrun", "stapler", "staple", str(path)])
        run_tool(["xcrun", "stapler", "validate", str(path)])
    run_tool(["hdiutil", "verify", str(path)])


def build(app: Path, output: Path) -> None:
    require_macos()
    import dmgbuild  # pylint: disable=import-outside-toplevel

    output = output.resolve()
    app = app.resolve()
    if output == app or app in output.parents or output.suffix != ".dmg":
        raise ValueError("DMG output must be a separate .dmg file")
    options = settings(app)
    print(
        f"Creating DMG with {options['size']} of filesystem capacity",
        flush=True,
    )
    run_tool(["codesign", "--verify", "--deep", "--strict", str(app)])
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(
        prefix=".ugsci-dmg-",
        dir=output.parent,
    ) as work:
        candidate = Path(work) / output.name
        dmgbuild.build_dmg(
            str(candidate),
            "UGSci",
            settings=options,
            lookForHiDPI=True,
        )
        verify_dmg(candidate, app)
        finalize(candidate)
        os.replace(candidate, output)


def install_for_verification(dmg: Path, destination: Path) -> Path:
    destination.mkdir(parents=True, exist_ok=True)
    app = destination / APP_NAME
    if app.exists() or app.is_symlink():
        raise ValueError("Verification destination already contains UGSci.app")
    verify_envelope(dmg)
    run_tool(["hdiutil", "verify", str(dmg)])
    with mounted(dmg) as volume:
        source = verify_volume(volume)
        run_tool(["ditto", str(source), str(app)])
        if app_inventory(source) != app_inventory(app):
            raise ValueError(
                "Drag-install verification changed application contents",
            )
    run_tool(["codesign", "--verify", "--deep", "--strict", str(app)])
    return app


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "action",
        choices=(
            "build",
            "verify",
            "install-for-verification",
            "verify-envelope",
        ),
    )
    parser.add_argument("--app", type=Path)
    parser.add_argument("--dmg", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--destination", type=Path)
    args = parser.parse_args()
    if args.action == "build" and args.app and args.output:
        build(args.app, args.output)
    elif args.action == "verify" and args.dmg:
        verify_dmg(args.dmg, args.app)
    elif args.action == "verify-envelope" and args.dmg:
        verify_envelope(args.dmg)
    elif (
        args.action == "install-for-verification"
        and args.dmg
        and args.destination
    ):
        print(install_for_verification(args.dmg, args.destination))
    else:
        parser.error("Required paths are missing for the selected action")


if __name__ == "__main__":
    main()
