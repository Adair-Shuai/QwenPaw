"""Verify native icon pixels in source assets and compiled desktop packages."""

import argparse
from contextlib import contextmanager
import ctypes
from ctypes import wintypes
from io import BytesIO
from pathlib import Path
import plistlib
import struct
import sys

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
WINDOWS_SIZES = {
    16,
    20,
    24,
    28,
    30,
    32,
    36,
    40,
    44,
    48,
    56,
    60,
    64,
    72,
    80,
    96,
    128,
    160,
    192,
    256,
}
MAC_SIZES = {
    (size, size, scale) for size in (16, 32, 128, 256, 512) for scale in (1, 2)
}


def frames(data):
    with Image.open(BytesIO(data)) as image:
        if image.format == "ICO":
            return {
                size: image.ico.getimage(size).convert("RGBA")
                for size in image.ico.sizes()
            }
        if image.format == "ICNS":
            return {
                size: image.icns.getimage(size).convert("RGBA")
                for size in image.info["sizes"]
            }
        raise ValueError("Expected ICO or ICNS image")


def verify_pixels(actual, expected):
    actual_frames = frames(actual)
    expected_frames = frames(expected)
    if actual_frames.keys() != expected_frames.keys():
        raise ValueError(
            "Native icon representations differ from the approved assets"
        )
    for size, reference in expected_frames.items():
        image = actual_frames[size]
        if (
            image.size != reference.size
            or image.tobytes() != reference.tobytes()
        ):
            raise ValueError(f"Native icon pixels differ at {size}")


def verify_sources(root=ROOT):
    assets = root / "scripts/pack/assets"
    ico = (assets / "icon.ico").read_bytes()
    windows_frames = frames(ico)
    if set(windows_frames) != {(size, size) for size in WINDOWS_SIZES}:
        raise ValueError(
            "Windows icon is missing required DPI representations"
        )
    if struct.unpack_from("<BB", ico, 6) != (0, 0):
        raise ValueError("The first ICO representation must be 256px")
    if set(frames((assets / "icon.icns").read_bytes())) != MAC_SIZES:
        raise ValueError(
            "macOS icon is missing standard or Retina representations"
        )
    icons = root / "console/src-tauri/icons"
    for extension in ("ico", "icns"):
        verify_pixels(
            (icons / f"icon.{extension}").read_bytes(),
            (assets / f"icon.{extension}").read_bytes(),
        )
    with Image.open(icons / "runtime-window.png") as image:
        if (
            image.size != (256, 256)
            or image.convert("RGBA").tobytes()
            != windows_frames[(256, 256)].tobytes()
        ):
            raise ValueError(
                "Runtime window icon must use the full 256px representation"
            )
    tray_frames = frames((assets / "tray.ico").read_bytes())
    if set(tray_frames) != set(windows_frames):
        raise ValueError("Tray icon is missing required DPI representations")
    for size in WINDOWS_SIZES:
        with Image.open(icons / f"tray/{size}.png") as image:
            if (
                image.size != (size, size)
                or image.convert("RGBA").tobytes()
                != tray_frames[(size, size)].tobytes()
            ):
                raise ValueError(
                    f"Tray image differs from the native ICO at {size}px"
                )
    with Image.open(icons / "tray/template.png") as image:
        rgba = image.convert("RGBA")
        if image.size != (72, 72) or rgba.getchannel("A").getextrema() != (
            0,
            255,
        ):
            raise ValueError(
                "macOS tray template must contain transparent and opaque pixels"
            )
        if rgba.convert("RGB").getbbox() is not None:
            raise ValueError(
                "macOS tray template must contain a black glyph without a background"
            )


@contextmanager
def windows_resources(path):
    """Map PE resources as data, without executing the packaged program."""
    if sys.platform != "win32":
        raise ValueError("Executable resource verification requires Windows")
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.LoadLibraryExW.argtypes = [
        wintypes.LPCWSTR,
        wintypes.HANDLE,
        wintypes.DWORD,
    ]
    kernel.LoadLibraryExW.restype = wintypes.HMODULE
    kernel.FindResourceW.argtypes = [
        wintypes.HMODULE,
        ctypes.c_void_p,
        ctypes.c_void_p,
    ]
    kernel.FindResourceW.restype = wintypes.HRSRC
    kernel.LoadResource.argtypes = [wintypes.HMODULE, wintypes.HRSRC]
    kernel.LoadResource.restype = wintypes.HGLOBAL
    kernel.LockResource.argtypes = [wintypes.HGLOBAL]
    kernel.LockResource.restype = ctypes.c_void_p
    kernel.SizeofResource.argtypes = [wintypes.HMODULE, wintypes.HRSRC]
    kernel.SizeofResource.restype = wintypes.DWORD
    kernel.FreeLibrary.argtypes = [wintypes.HMODULE]
    module = kernel.LoadLibraryExW(str(path.resolve()), None, 0x22)
    if not module:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        yield kernel, module
    finally:
        kernel.FreeLibrary(module)


def executable_icon(path):
    with windows_resources(path) as (kernel, module):
        callback_type = ctypes.WINFUNCTYPE(
            wintypes.BOOL,
            wintypes.HMODULE,
            ctypes.c_void_p,
            ctypes.c_void_p,
            ctypes.c_ssize_t,
        )
        names = []

        @callback_type
        def collect(_module, _kind, name, _parameter):
            names.append(name if name <= 65535 else ctypes.wstring_at(name))
            return True

        kernel.EnumResourceNamesW.argtypes = [
            wintypes.HMODULE,
            ctypes.c_void_p,
            callback_type,
            ctypes.c_ssize_t,
        ]
        if (
            not kernel.EnumResourceNamesW(
                module, ctypes.c_void_p(14), collect, 0
            )
            or not names
        ):
            raise ValueError(f"Executable has no icon group: {path}")

        def read_resource(kind, name):
            identifier = (
                ctypes.c_void_p(name)
                if isinstance(name, int)
                else ctypes.cast(ctypes.c_wchar_p(name), ctypes.c_void_p)
            )
            resource = kernel.FindResourceW(
                module, identifier, ctypes.c_void_p(kind)
            )
            if not resource:
                raise ValueError(f"Missing executable icon resource {name}")
            size = kernel.SizeofResource(module, resource)
            address = kernel.LockResource(
                kernel.LoadResource(module, resource)
            )
            if not address or not size:
                raise ValueError(f"Empty executable icon resource {name}")
            return ctypes.string_at(address, size)

        # The native DPI loader addresses this same standard application ID.
        if 32512 not in names:
            raise ValueError(
                "Executable is missing the runtime application icon group 32512"
            )
        group = read_resource(14, 32512)
        count = struct.unpack_from("<H", group, 4)[0]
        entries = []
        payload = []
        offset = 6 + count * 16
        for index in range(count):
            (
                width,
                height,
                colors,
                reserved,
                planes,
                bits,
                _size,
                resource_id,
            ) = struct.unpack_from("<BBBBHHIH", group, 6 + index * 14)
            data = read_resource(3, resource_id)
            entries.append(
                struct.pack(
                    "<BBBBHHII",
                    width,
                    height,
                    colors,
                    reserved,
                    planes,
                    bits,
                    len(data),
                    offset,
                )
            )
            payload.append(data)
            offset += len(data)
        return group[:6] + b"".join(entries + payload)


def verify_windows(path, root=ROOT):
    verify_sources(root)
    verify_pixels(
        executable_icon(path),
        (root / "scripts/pack/assets/icon.ico").read_bytes(),
    )


def verify_macos(app, root=ROOT):
    verify_sources(root)
    with (app / "Contents/Info.plist").open("rb") as stream:
        metadata = plistlib.load(stream)
    name = metadata.get("CFBundleIconFile", "")
    if not name or Path(name).name != name:
        raise ValueError(
            "Application bundle must declare its native icon filename"
        )
    if not name.endswith(".icns"):
        name += ".icns"
    verify_pixels(
        (app / "Contents/Resources" / name).read_bytes(),
        (root / "scripts/pack/assets/icon.icns").read_bytes(),
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--windows-exe", type=Path)
    parser.add_argument("--macos-app", type=Path)
    args = parser.parse_args()
    verify_sources()
    if args.windows_exe:
        verify_windows(args.windows_exe)
    if args.macos_app:
        verify_macos(args.macos_app)
    print("Desktop icon dimensions and pixel content verified.")


if __name__ == "__main__":
    main()
