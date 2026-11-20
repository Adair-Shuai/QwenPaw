"""Regenerate shipped brand assets from icon.svg using Tauri and Pillow.

Run after installing console dependencies with the project Python environment.
"""

import hashlib
from io import BytesIO
import json
from pathlib import Path
import struct
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
WINDOWS_SIZES = (
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
)
EXPORT_SIZES = tuple(sorted({*WINDOWS_SIZES, 512, 1024, 2048}))


def render(source, output, sizes=()):
    command = [
        "node",
        str(ROOT / "console/node_modules/@tauri-apps/cli/tauri.js"),
        "icon",
        str(source),
        "--output",
        str(output),
    ]
    for size in sizes:
        command.extend(("--png", str(size)))
    subprocess.run(command, check=True, cwd=ROOT / "console")


def platform_svg(source, *, inset=0, glyph_scale=1, transparent=False):
    """Adapt the approved vector without rasterizing or tracing its artwork."""
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    document = ET.fromstring(source)
    group = ET.Element("{http://www.w3.org/2000/svg}g")
    if inset:
        group.set(
            "transform", f"translate({inset} {inset}) scale({1 - inset / 32})"
        )
    for child in list(document):
        tag = child.tag.rsplit("}", 1)[-1]
        if tag == "title":
            continue
        document.remove(child)
        if transparent and tag == "rect":
            continue
        if glyph_scale != 1 and tag == "path":
            child.set(
                "transform",
                f"translate(32 32) scale({glyph_scale}) translate(-32 -32)",
            )
        group.append(child)
    document.append(group)
    return ET.tostring(document, encoding="utf-8") + b"\n"


def small_artwork(source):
    """Keep the approved silhouette, widening the eye cutouts for 16–24px."""
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    document = ET.fromstring(source)
    for element in document.iter():
        geometry = element.get("d", "")
        prefix, eyes, _tail = geometry.partition("M24.25 26.9")
        if eyes:
            element.set(
                "d",
                prefix + "M22 27a3 3 0 0 1 6 0v3a3 3 0 0 1 -6 0Z"
                "M36 27a3 3 0 0 1 6 0v3a3 3 0 0 1 -6 0Z",
            )
            return ET.tostring(document, encoding="utf-8") + b"\n"
    raise ValueError(
        "The approved glyph changed; update its small-size eye cutouts"
    )


def icns_chunks(data):
    if data[:4] != b"icns" or int.from_bytes(data[4:8], "big") != len(data):
        raise ValueError("Invalid generated ICNS header")
    chunks = {}
    offset = 8
    while offset < len(data):
        size = int.from_bytes(data[offset + 4 : offset + 8], "big")
        if size < 8 or offset + size > len(data):
            raise ValueError("Invalid generated ICNS chunk")
        chunks[data[offset : offset + 4]] = data[offset : offset + size]
        offset += size
    return chunks


def pack_ico(images):
    # Largest first also protects consumers that decode only the first entry.
    entries = []
    payload = []
    offset = 6 + len(images) * 16
    for size, data in sorted(images.items(), reverse=True):
        with Image.open(BytesIO(data)) as image:
            if image.size != (size, size) or image.mode != "RGBA":
                raise ValueError(f"Invalid {size}px ICO image")
        entries.append(
            struct.pack(
                "<BBBBHHII",
                size % 256,
                size % 256,
                0,
                0,
                1,
                32,
                len(data),
                offset,
            )
        )
        payload.append(data)
        offset += len(data)
    return struct.pack("<HHH", 0, 1, len(images)) + b"".join(entries + payload)


def write_asset(target, data):
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and target.read_bytes() == data:
        return
    # Replacing a new file also works when Explorer has mapped the old PNG.
    with tempfile.NamedTemporaryFile(
        dir=target.parent,
        prefix=".brand-",
        delete=False,
    ) as output:
        pending = Path(output.name)
        output.write(data)
    try:
        pending.replace(target)
    finally:
        pending.unlink(missing_ok=True)


def generate_native_icons(icons):
    source = ROOT / "scripts/pack/assets/icon.svg"
    artwork = source.read_bytes()
    mac_source = ROOT / "scripts/pack/assets/icon-macos.svg"
    tray_source = ROOT / "scripts/pack/assets/icon-tray.svg"
    template_source = ROOT / "scripts/pack/assets/icon-tray-template.svg"
    small_source = ROOT / "scripts/pack/assets/icon-small.svg"
    mac_small_source = ROOT / "scripts/pack/assets/icon-macos-small.svg"
    tray_small_source = ROOT / "scripts/pack/assets/icon-tray-small.svg"
    optical = small_artwork(artwork)
    write_asset(mac_source, platform_svg(artwork, inset=6.25))
    write_asset(tray_source, platform_svg(artwork, glyph_scale=1.08))
    write_asset(
        template_source,
        platform_svg(optical, transparent=True, glyph_scale=1.08),
    )
    write_asset(small_source, optical)
    write_asset(mac_small_source, platform_svg(optical, inset=6.25))
    write_asset(tray_small_source, platform_svg(optical, glyph_scale=1.08))
    render(source, icons)
    # Each target size is rendered from vectors; no raster-to-raster resizing.
    render(source, icons / "app", EXPORT_SIZES)
    render(small_source, icons / "app", (16, 20, 24))
    render(mac_source, icons / "macos")
    render(mac_small_source, icons / "macos-small")
    render(tray_source, icons / "tray", WINDOWS_SIZES)
    render(tray_small_source, icons / "tray", (16, 20, 24))
    render(template_source, icons / "template", (36, 72))
    (icons / "icon.png").write_bytes(
        (icons / "app/1024x1024.png").read_bytes()
    )
    (icons / "icon.ico").write_bytes(
        pack_ico(
            {
                size: (icons / f"app/{size}x{size}.png").read_bytes()
                for size in WINDOWS_SIZES
            }
        )
    )
    (icons / "icon.icns").write_bytes((icons / "macos/icon.icns").read_bytes())
    # Tauri emits ICNS chunks in hash-map order. Canonicalize that order so
    # regenerating unchanged artwork preserves release content digests.
    icns = icons / "icon.icns"
    chunks = icns_chunks(icns.read_bytes())
    small_chunks = icns_chunks((icons / "macos-small/icon.icns").read_bytes())
    for kind in (b"is32", b"s8mk", b"il32", b"l8mk", b"ic11"):
        chunks[kind] = small_chunks[kind]
    content = b"".join(chunks[kind] for kind in sorted(chunks))
    icns.write_bytes(struct.pack(">4sI", b"icns", len(content) + 8) + content)
    return [
        source,
        mac_source,
        tray_source,
        template_source,
        small_source,
        mac_small_source,
        tray_small_source,
    ]


def generate(icons):
    files = generate_native_icons(icons)

    def copy(source, destination):
        target = ROOT / destination
        write_asset(target, source.read_bytes())
        files.append(target)

    def png(destination, size):
        copy(icons / f"app/{size}x{size}.png", destination)

    for generated in sorted(icons.rglob("*")):
        relative = generated.relative_to(icons)
        if generated.is_file() and relative.parts[0] not in {
            "app",
            "macos",
            "macos-small",
            "tray",
            "template",
        }:
            copy(generated, f"console/src-tauri/icons/{relative.as_posix()}")
    for size in EXPORT_SIZES:
        copy(
            icons / f"app/{size}x{size}.png",
            f"console/src-tauri/icons/app/{size}.png",
        )
    for size in WINDOWS_SIZES:
        copy(
            icons / f"tray/{size}x{size}.png",
            f"console/src-tauri/icons/tray/{size}.png",
        )
    copy(
        icons / "template/72x72.png",
        "console/src-tauri/icons/tray/template.png",
    )
    png("console/src-tauri/icons/runtime-window.png", 256)
    png("scripts/pack/assets/icon-2048.png", 2048)
    write_asset(
        ROOT / "scripts/pack/assets/tray.ico",
        pack_ico(
            {
                size: (icons / f"tray/{size}x{size}.png").read_bytes()
                for size in WINDOWS_SIZES
            }
        ),
    )
    files.append(ROOT / "scripts/pack/assets/tray.ico")
    for extension in ("ico", "icns"):
        copy(
            icons / f"icon.{extension}",
            f"scripts/pack/assets/icon.{extension}",
        )
    png("console/public/qwenpaw.png", 256)
    brand = ROOT / "console/public/ugsci-mono/brand"
    copy(icons / "icon.ico", "console/public/ugsci-mono/brand/web/favicon.ico")
    copy(brand / "lockup-white.svg", "console/public/logo-dark.svg")
    copy(brand / "lockup-black.svg", "console/public/logo-light.svg")
    copy(brand / "web/favicon.svg", "console/public/online.svg")
    copy(brand / "web/favicon.svg", "website/public/qwenpaw-symbol.svg")
    copy(brand / "mark.svg", "website/public/logo.svg")
    png("website/public/logo.png", 256)
    png("website/public/evaluation/logos/qwenpaw.png", 128)
    for plugin in ("plugins/bundle/ugsci", "src/qwenpaw/plugins_bundle/ugsci"):
        copy(
            ROOT / "scripts/pack/assets/icon.svg",
            f"{plugin}/ui/ugsci-icon.svg",
        )
    for size in (16, 32, 48, 128):
        png(
            "plugins/bundle/chrome/assets/extensions/chrome/icons/"
            f"logo-{size}.png",
            size,
        )
    files.extend(
        path
        for path in (ROOT / "console/public/ugsci-mono").rglob("*")
        if path.is_file()
    )
    for asset in set(files):
        if asset.suffix in (".svg", ".xml"):
            write_asset(asset, asset.read_bytes().replace(b"\r\n", b"\n"))
    manifest = {
        path.relative_to(ROOT)
        .as_posix(): hashlib.sha256(path.read_bytes())
        .hexdigest()
        for path in sorted(set(files))
    }
    write_asset(
        ROOT / "console/brand-assets.json",
        (json.dumps(manifest, indent=2) + "\n").encode("utf-8"),
    )
    print(f"Generated and recorded {len(manifest)} brand assets.")


if __name__ == "__main__":
    with tempfile.TemporaryDirectory(prefix="ugsci-brand-") as directory:
        generate(Path(directory))
