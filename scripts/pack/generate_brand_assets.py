"""Regenerate shipped brand assets from icon.svg using Tauri and Pillow.

Run after installing console dependencies with the project Python environment.
"""

import hashlib
from io import BytesIO
import json
from pathlib import Path
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]


def write_asset(target, data):
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file() and target.read_bytes() == data:
        return
    # Replacing a new file also works when Explorer has mapped the old PNG.
    with tempfile.NamedTemporaryFile(
        dir=target.parent, prefix=".brand-", delete=False,
    ) as output:
        pending = Path(output.name)
        output.write(data)
    try:
        pending.replace(target)
    finally:
        pending.unlink(missing_ok=True)


def generate(icons):
    subprocess.run(
        [
            "node",
            str(ROOT / "console/node_modules/@tauri-apps/cli/tauri.js"),
            "icon",
            str(ROOT / "scripts/pack/assets/icon.svg"),
            "--output",
            str(icons),
        ],
        check=True,
        cwd=ROOT / "console",
    )
    # Tauri emits ICNS chunks in hash-map order. Canonicalize that order so
    # regenerating unchanged artwork preserves release content digests.
    icns = icons / "icon.icns"
    data = icns.read_bytes()
    chunks = []
    offset = 8
    while offset < len(data):
        size = int.from_bytes(data[offset + 4 : offset + 8], "big")
        if size < 8 or offset + size > len(data):
            raise ValueError("Invalid generated ICNS chunk")
        chunks.append(data[offset : offset + size])
        offset += size
    icns.write_bytes(data[:8] + b"".join(sorted(chunks)))
    files = [ROOT / "scripts/pack/assets/icon.svg"]

    def copy(source, destination):
        target = ROOT / destination
        write_asset(target, source.read_bytes())
        files.append(target)

    def png(destination, size):
        target = ROOT / destination
        with Image.open(icons / "icon.png") as image:
            output = BytesIO()
            image.resize((size, size), Image.Resampling.LANCZOS).save(
                output, format="PNG",
            )
        write_asset(target, output.getvalue())
        files.append(target)

    for source in sorted(icons.rglob("*")):
        if source.is_file():
            copy(source, f"console/src-tauri/icons/{source.relative_to(icons).as_posix()}")
    for extension in ("ico", "icns"):
        copy(icons / f"icon.{extension}", f"scripts/pack/assets/icon.{extension}")
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
        copy(ROOT / "scripts/pack/assets/icon.svg", f"{plugin}/ui/ugsci-icon.svg")
    for size in (16, 32, 48, 128):
        png(
            "plugins/bundle/chrome/assets/extensions/chrome/icons/" f"logo-{size}.png",
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
        path.relative_to(ROOT).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
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
