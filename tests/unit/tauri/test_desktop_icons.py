# -*- coding: utf-8 -*-
"""Real raster, native executable, and macOS bundle icon regressions."""

from io import BytesIO
from pathlib import Path
import plistlib
import runpy
import shutil
import subprocess
import sys

from PIL import Image
import pytest

ROOT = Path(__file__).resolve().parents[3]
GENERATOR = runpy.run_path(str(ROOT / "scripts/pack/generate_brand_assets.py"))
VERIFY = runpy.run_path(str(ROOT / "scripts/pack/verify_desktop_icons.py"))


@pytest.fixture(name="source_tree")
def _source_tree(tmp_path):
    for name in ("scripts/pack/assets", "console/src-tauri/icons"):
        shutil.copytree(ROOT / name, tmp_path / name)
    return tmp_path


def test_actual_desktop_icon_inventory_and_pixel_content():
    VERIFY["verify_sources"]()
    source = (ROOT / "scripts/pack/assets/icon.ico").read_bytes()
    ico_frames = VERIFY["frames"](source)
    assert len(ico_frames) == 20
    assert (256, 256) in ico_frames
    assert (20, 20) in ico_frames
    assert (40, 40) in ico_frames


def test_each_size_is_rendered_directly_from_the_approved_vector(tmp_path):
    sizes = (16, 20, 24, 40, 256, 1024)
    GENERATOR["render"](ROOT / "scripts/pack/assets/icon.svg", tmp_path, sizes)
    GENERATOR["render"](
        ROOT / "scripts/pack/assets/icon-small.svg",
        tmp_path,
        (16, 20, 24),
    )
    for size in sizes:
        with Image.open(tmp_path / f"{size}x{size}.png") as actual:
            with Image.open(
                ROOT / f"console/src-tauri/icons/app/{size}.png",
            ) as shipped:
                assert actual.size == shipped.size == (size, size)
                assert (
                    actual.convert("RGBA").tobytes()
                    == shipped.convert("RGBA").tobytes()
                )


def test_small_representations_keep_two_high_contrast_eye_cutouts():
    with Image.open(ROOT / "console/src-tauri/icons/app/16.png") as windows:
        windows = windows.convert("RGBA")
    with Image.open(ROOT / "scripts/pack/assets/icon.icns") as icns:
        macos = icns.icns.getimage((16, 16, 1)).convert("RGBA")
    for image in (windows, macos):
        eyes = min(image.getpixel(point)[0] for point in ((6, 7), (9, 7)))
        gap = max(image.getpixel(point)[0] for point in ((7, 7), (8, 7)))
        assert eyes - gap >= 180


def test_missing_dpi_frame_is_rejected_even_when_copies_agree(source_tree):
    source = (source_tree / "scripts/pack/assets/icon.ico").read_bytes()
    images = {}
    for (width, _height), image in VERIFY["frames"](source).items():
        if width == 20:
            continue
        output = BytesIO()
        image.save(output, format="PNG")
        images[width] = output.getvalue()
    incomplete = GENERATOR["pack_ico"](images)
    for name in (
        "scripts/pack/assets/icon.ico",
        "console/src-tauri/icons/icon.ico",
    ):
        (source_tree / name).write_bytes(incomplete)
    with pytest.raises(ValueError, match="required DPI representations"):
        VERIFY["verify_sources"](source_tree)


def test_macos_bundle_uses_declared_retina_icon_and_rejects_stale_pixels(
    tmp_path,
):
    app = tmp_path / "UGSci Desktop.app"
    resources = app / "Contents/Resources"
    resources.mkdir(parents=True)
    with (app / "Contents/Info.plist").open("wb") as stream:
        plistlib.dump({"CFBundleIconFile": "UGSci"}, stream)
    icon = resources / "UGSci.icns"
    shutil.copyfile(ROOT / "scripts/pack/assets/icon.icns", icon)
    VERIFY["verify_macos"](app)
    frames = VERIFY["frames"](icon.read_bytes())
    retina = frames[(512, 512, 2)]
    assert retina.size == (1024, 1024)
    assert retina.getchannel("A").getbbox() == (100, 100, 924, 924)
    # Valid ICNS with old full-bleed artwork must fail content checks.
    with Image.open(ROOT / "console/src-tauri/icons/app/1024.png") as image:
        image.save(icon, format="ICNS")
    with pytest.raises(
        ValueError,
        match="pixels differ|representations differ",
    ):
        VERIFY["verify_macos"](app)


def test_compiled_windows_executable_embeds_every_approved_icon_frame(
    tmp_path,
):
    if sys.platform != "win32":
        pytest.skip("Native Windows PE resource test")
    compiler = Path("C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe")
    assert (
        compiler.is_file()
    ), "Windows icon verification requires the .NET compiler"
    source = tmp_path / "IconFixture.cs"
    source.write_text(
        "class IconFixture { static void Main() {} }",
        encoding="utf-8",
    )
    program = tmp_path / "IconFixture.exe"
    subprocess.run(
        [
            str(compiler),
            "/nologo",
            f"/out:{program}",
            f"/win32icon:{ROOT / 'scripts/pack/assets/icon.ico'}",
            str(source),
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=60,
    )
    VERIFY["verify_windows"](program)
    # The real compiler can also create a valid but incomplete icon.
    small = tmp_path / "small.ico"
    with Image.open(ROOT / "console/src-tauri/icons/app/32.png") as image:
        image.save(small, sizes=[(32, 32)])
    subprocess.run(
        [
            str(compiler),
            "/nologo",
            f"/out:{program}",
            f"/win32icon:{small}",
            str(source),
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=60,
    )
    with pytest.raises(ValueError, match="representations differ"):
        VERIFY["verify_windows"](program)


def test_native_icons_remain_part_of_host_identity_and_packaging_gates():
    host = runpy.run_path(str(ROOT / "scripts/pack-tauri/component_host.py"))
    rust = (ROOT / "console/src-tauri/build.rs").read_text(encoding="utf-8")
    for name in (
        "console/src-tauri/icons/runtime-window.png",
        "console/src-tauri/icons/tray",
        "scripts/pack/assets/icon-macos.svg",
    ):
        assert name in host["HOST_INPUTS"]
        assert f'"{name}"' in rust
    windows = (
        ROOT / "scripts/pack-tauri/build_win_pyinstaller.ps1"
    ).read_text(
        encoding="utf-8",
    )
    macos = (ROOT / "scripts/pack-tauri/build_macos_pyinstaller.sh").read_text(
        encoding="utf-8",
    )
    assert windows.index(
        "verify_desktop_icons.py --windows-exe",
    ) > windows.index(
        "Copy-Item -Force $AppExe.FullName",
    )
    assert windows.index(
        "verify_desktop_icons.py --windows-exe",
    ) < windows.index(
        'create_windows_portable_installer.ps1") `',
        windows.index("Copy-Item -Force $AppExe.FullName"),
    )
    assert macos.index("verify_desktop_icons.py --macos-app") < macos.index(
        'verify_frozen_plugins.py "${APP_PLUGIN_ROOT}"',
    )
    main = (ROOT / "console/src-tauri/src/lib.rs").read_text(encoding="utf-8")
    tray = (ROOT / "console/src-tauri/src/tray.rs").read_text(encoding="utf-8")
    assert (
        "context.set_default_window_icon(Some(desktop_icons::window_icon()))"
        in main
    )
    assert "desktop_icons::on_window_event(window, event)" in main
    assert 'icon_as_template(cfg!(target_os = "macos"))' in tray
    assert "app.default_window_icon()" not in tray
