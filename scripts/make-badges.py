#!/usr/bin/env python3
"""Draw the badge for each course.

One rule decides everything here: the mark is the real one. The icon is read
from the press kit and placed as it is, never redrawn and never traced, so a
badge and the logo in the header are the same artwork. To the right of it goes
the name of the badge, in the face the brand uses, and nothing else.

Two files per badge, light and dark, because the site already carries its logo
that way and a badge that only reads on one ground is half a badge.

    python3 scripts/make-badges.py

Needs rsvg-convert and ImageMagick, and the Outfit face installed. It writes
the SVG it drew beside the PNG, so the source of a badge is readable and can be
regenerated rather than being a picture somebody made once.
"""

import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICON = ROOT / "static/presskit/icon/cpak-icon.svg"
OUT = ROOT / "static/learn/badges"

# Keyed by course slug, so the account page can find a badge from progress
# alone. The name is the course's own title: a badge for finishing a course is
# not a different thing with a different name.
BADGES = {
    "start": "Start here",
    "packaging": "Packaging an application",
    "administration": "Running cpak on machines you look after",
}

INK = {"light": "#0F172A", "dark": "#F8FAFC"}

# Wide enough for the longest name; the render is trimmed afterwards, so the
# number only has to be generous rather than right.
CANVAS = (1800, 320)
ICON_HEIGHT = 132
GAP = 40
TYPE_SIZE = 60
LINE = 74
WRAP_AT = 26


def icon() -> str:
    svg = ICON.read_text()
    head = re.match(r"<svg[^>]*>", svg).group(0)
    box = re.search(r'viewBox="([^"]+)"', head).group(1)
    width, height = (float(n) for n in box.split()[2:4])
    scale = ICON_HEIGHT / height
    inner = svg[len(head) : svg.rindex("</svg>")]
    return (
        f'<g transform="translate(0 0) scale({scale:.6f})">{inner}</g>',
        width * scale,
    )


def lines(name: str) -> list[str]:
    out, row = [], ""
    for word in name.split():
        candidate = f"{row} {word}".strip()
        if len(candidate) > WRAP_AT and row:
            out.append(row)
            row = word
        else:
            row = candidate
    if row:
        out.append(row)
    return out


def draw(name: str, ground: str) -> str:
    art, art_width = icon()
    rows = lines(name)
    top = (CANVAS[1] - len(rows) * LINE) / 2 + TYPE_SIZE
    text = "".join(
        f'<text x="{art_width + GAP:.1f}" y="{top + i * LINE:.1f}" '
        f'font-family="Outfit" font-size="{TYPE_SIZE}" font-weight="700" '
        f'fill="{INK[ground]}">{row}</text>'
        for i, row in enumerate(rows)
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS[0]}" '
        f'height="{CANVAS[1]}" viewBox="0 0 {CANVAS[0]} {CANVAS[1]}" fill="none">'
        f'<g transform="translate(0 {(CANVAS[1] - ICON_HEIGHT) / 2:.1f})">{art}</g>'
        f"{text}</svg>"
    )


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, name in BADGES.items():
        for ground in ("light", "dark"):
            stem = slug if ground == "light" else f"{slug}-dark"
            svg = OUT / f"{stem}.svg"
            png = OUT / f"{stem}.png"
            svg.write_text(draw(name, ground))
            subprocess.run(
                ["rsvg-convert", "-w", str(CANVAS[0] * 2), str(svg), "-o", str(png)],
                check=True,
            )
            # Trim to the artwork, then give it back an even margin, so every
            # badge is tight to its own name rather than to the widest one.
            subprocess.run(
                ["magick", str(png), "-trim", "+repage", "-bordercolor", "none",
                 "-border", "48", str(png)],
                check=True,
            )
            print(f"  {png.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
