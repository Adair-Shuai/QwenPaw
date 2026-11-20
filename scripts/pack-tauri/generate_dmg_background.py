# -*- coding: utf-8 -*-
"""Render the DMG's instruction layer, leaving file icons to Finder."""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "scripts/pack/assets"
INSTRUCTION = "将 UGSci 拖入“应用程序”以安装。"
SIZE = (640, 400)


def render(font_path: Path, scale: int) -> Image.Image:
    """Use pixel-aligned artwork at each shipped display density."""
    image = Image.new("RGB", (SIZE[0] * scale, SIZE[1] * scale), "white")
    draw = ImageDraw.Draw(image)
    arrow = [(294, 170), (346, 170), (336, 160), (346, 170), (336, 180)]
    draw.line(
        [(x * scale, y * scale) for x, y in arrow],
        fill=(145, 145, 145),
        width=2 * scale,
        joint="curve",
    )
    font = ImageFont.truetype(str(font_path), 14 * scale)
    draw.text(
        (320 * scale, 316 * scale),
        INSTRUCTION,
        font=font,
        fill=(105, 105, 105),
        anchor="mm",
    )
    return image


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--font", type=Path, required=True)
    args = parser.parse_args()
    for scale, suffix in ((1, ""), (2, "@2x")):
        render(args.font, scale).save(
            ASSETS / f"dmg-background{suffix}.png",
            dpi=(72 * scale, 72 * scale),
        )


if __name__ == "__main__":
    main()
