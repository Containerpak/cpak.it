#!/usr/bin/env python3
"""Draw the badge for each cpak course.

Certification badges have a settled anatomy, and it is worth following rather
than inventing: a contained shape, the product's own mark inside it, two or
three tiers of small stacked capitals, flat colour, square canvas. CKA is a
Kubernetes helm turned into a frame with CERTIFIED / kubernetes / ADMINISTRATOR
stacked inside it; the HashiCorp ones are a shield with the same three tiers.
They are square because that is what a profile page renders, and flat because
they have to survive 64 pixels and a printer.

Two things here are cpak's rather than borrowed.

The shape is a hexagon, because the cube in the cpak mark seen from above is a
hexagon. The frame is not a shape chosen for a badge, it is the mark's own
silhouette, so the badge and the logo are the same geometry at two sizes.

The bottom tier says COURSE and never says certified. A badge here is awarded
for marking the lessons done and nothing checked that they were read, so it may
carry the look of the convention but not its claim. The word the convention
uses is the one word this badge has not earned.

    python3 scripts/make-badges.py

Needs rsvg-convert and the Outfit face. Writes the SVG beside the PNG so the
badge stays a drawing that can be redrawn, not a picture somebody made once.
"""

import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICON = ROOT / "static/presskit/icon/cpak-icon.svg"
OUT = ROOT / "static/learn/badges"

# The role a badge names, not the title of the course that leads to it. Every
# certification badge worth the name says what you can do, and a course title
# says what you sat through.
BADGES = {
    "start": "Foundations",
    "packaging": "Packager",
    "administration": "Administrator",
}

# From the project binding: the cpak palette.
DEEP = "#1E3A9A"
MID = "#4670EC"
LIGHT = "#99B5FA"
PAPER = "#FFFFFF"

SIZE = 512
CENTRE = SIZE / 2
RADIUS = 236  # a pointy-top hexagon, the cube's own silhouette


def hexagon(radius: float) -> str:
    from math import cos, pi, sin

    points = [
        (
            CENTRE + radius * cos(pi / 2 + i * pi / 3),
            CENTRE - radius * sin(pi / 2 + i * pi / 3),
        )
        for i in range(6)
    ]
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in points)


def mark(height: float, x: float, y: float) -> str:
    svg = ICON.read_text()
    head = re.match(r"<svg[^>]*>", svg).group(0)
    box = re.search(r'viewBox="([^"]+)"', head).group(1)
    width, tall = (float(n) for n in box.split()[2:4])
    scale = height / tall
    inner = svg[len(head) : svg.rindex("</svg>")]
    return (
        f'<g transform="translate({x - width * scale / 2:.2f} {y:.2f}) '
        f'scale({scale:.6f})">{inner}</g>'
    )


def draw(role: str) -> str:
    tiers = "".join(
        [
            f'<text x="{CENTRE}" y="322" text-anchor="middle" font-family="Outfit" '
            f'font-size="52" font-weight="700" fill="{PAPER}">cpak</text>',
            f'<text x="{CENTRE}" y="374" text-anchor="middle" font-family="Outfit" '
            f'font-size="34" font-weight="700" letter-spacing="2.5" '
            f'fill="{LIGHT}">{role.upper()}</text>',
            f'<text x="{CENTRE}" y="424" text-anchor="middle" font-family="Outfit" '
            # Same tint as the tier above it: at 2.25 to 1 the mid blue was
            # unreadable on this ground, and the hierarchy is carried by size
            # and tracking rather than by a colour that cannot be seen.
            f'font-size="20" font-weight="600" letter-spacing="6" '
            f'fill="{LIGHT}" fill-opacity="0.85">COURSE</text>',
        ]
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" '
        f'viewBox="0 0 {SIZE} {SIZE}" fill="none">'
        f'<polygon points="{hexagon(RADIUS)}" fill="{DEEP}"/>'
        f'<polygon points="{hexagon(RADIUS - 14)}" fill="none" stroke="{MID}" '
        f'stroke-width="3"/>'
        f"{mark(150, CENTRE, 112)}"
        f"{tiers}</svg>"
    )


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*-dark.*"):
        old.unlink()
    for slug, role in BADGES.items():
        svg = OUT / f"{slug}.svg"
        png = OUT / f"{slug}.png"
        svg.write_text(draw(role))
        subprocess.run(
            ["rsvg-convert", "-w", "1024", "-h", "1024", str(svg), "-o", str(png)],
            check=True,
        )
        print(f"  {png.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
