"""Extract editable vector paths from the supplied TELEMO logo reference.

Requires Pillow for reading the reference JPEG. The SVG build itself uses only
Python's standard library; see build_telemo_logo.py.
"""

import argparse
import json
import math
from collections import defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def simplify(points, tolerance=1.6):
    """Simplify a closed pixel boundary without dropping its corners."""
    def reduce_line(line):
        if len(line) <= 2:
            return line
        x, y = line[0]
        dx, dy = line[-1][0] - x, line[-1][1] - y
        length_squared = dx * dx + dy * dy
        distances = []
        for px, py in line[1:-1]:
            t = max(0, min(1, ((px - x) * dx + (py - y) * dy) / length_squared)) if length_squared else 0
            distances.append((px - x - t * dx) ** 2 + (py - y - t * dy) ** 2)
        distance = max(distances)
        if distance <= tolerance * tolerance:
            return [line[0], line[-1]]
        split = distances.index(distance) + 1
        return reduce_line(line[:split + 1])[:-1] + reduce_line(line[split:])

    split = max(range(1, len(points)), key=lambda i: (points[i][0] - points[0][0]) ** 2 + (points[i][1] - points[0][1]) ** 2)
    return reduce_line(points[:split + 1])[:-1] + reduce_line(points[split:] + points[:1])[:-1]


def path_from_contour(points):
    """Keep lettering corners sharp and fit cubic tangents to curved edges."""
    tangents = []
    lengths = []
    for i, point in enumerate(points):
        before, after = points[i - 1], points[(i + 1) % len(points)]
        incoming = (point[0] - before[0], point[1] - before[1])
        outgoing = (after[0] - point[0], after[1] - point[1])
        a, b = math.hypot(*incoming), math.hypot(*outgoing)
        dot = (incoming[0] * outgoing[0] + incoming[1] * outgoing[1]) / (a * b)
        if dot < 0.55:
            tangents.append(None)
        else:
            direction = (incoming[0] / a + outgoing[0] / b, incoming[1] / a + outgoing[1] / b)
            length = math.hypot(*direction)
            tangents.append((direction[0] / length, direction[1] / length))
        lengths.append(min(a, b))

    def pair(point):
        return f"{point[0]:.2f} {point[1]:.2f}"

    commands = [f"M{pair(points[0])}"]
    for i, point in enumerate(points):
        j = (i + 1) % len(points)
        end = points[j]
        if tangents[i] is None and tangents[j] is None:
            commands.append(f"L{pair(end)}")
            continue
        distance = math.dist(point, end)
        straight = ((end[0] - point[0]) / distance, (end[1] - point[1]) / distance)
        a, b = tangents[i] or straight, tangents[j] or straight
        control_a = tuple(point[k] + a[k] * min(distance, lengths[i]) / 3 for k in range(2))
        control_b = tuple(end[k] - b[k] * min(distance, lengths[j]) / 3 for k in range(2))
        commands.append(f"C{pair(control_a)} {pair(control_b)} {pair(end)}")
    return " ".join(commands) + " Z"


def trace(pixels):
    edges = defaultdict(list)
    for x, y in sorted(pixels, key=lambda p: (p[1], p[0])):
        if (x, y - 1) not in pixels:
            edges[(x, y)].append((x + 1, y))
        if (x + 1, y) not in pixels:
            edges[(x + 1, y)].append((x + 1, y + 1))
        if (x, y + 1) not in pixels:
            edges[(x + 1, y + 1)].append((x, y + 1))
        if (x - 1, y) not in pixels:
            edges[(x, y + 1)].append((x, y))

    directions = {(1, 0): 0, (0, 1): 1, (-1, 0): 2, (0, -1): 3}
    contours = []
    while edges:
        start = next(iter(edges))
        point = start
        direction = 0
        contour = []
        while True:
            contour.append(point)
            choices = edges[point]
            end = min(choices, key=lambda p: {1: 0, 0: 1, 3: 2, 2: 3}[(directions[(p[0] - point[0], p[1] - point[1])] - direction) % 4])
            choices.remove(end)
            if not choices:
                del edges[point]
            direction = directions[(end[0] - point[0], end[1] - point[1])]
            point = end
            if point == start:
                break
        area = abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(contour, contour[1:] + contour[:1]))) / 2
        if area >= 8:
            contours.append(simplify(contour))

    return " ".join(path_from_contour(contour) for contour in contours)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "assets/telemo-logo-white.jpg")
    parser.add_argument("--output", type=Path, default=ROOT / "assets/telemo-logo.json")
    args = parser.parse_args()
    image = Image.open(args.source).convert("RGB")
    masks = {name: set() for name in ("wordmark", "wave", "tagline")}
    green_colors = []
    for y in range(image.height):
        for x in range(image.width):
            r, g, b = image.getpixel((x, y))
            if max(r, g, b) < 128 and max(r, g, b) - min(r, g, b) < 45:
                masks["wordmark" if y < 220 else "tagline"].add((x, y))
            elif g > r + 25 and g > b + 15 and g > 100:
                masks["wave"].add((x, y))
                if g > r + 40 and g > b + 20 and 140 < g < 210:
                    green_colors.append((r, g, b))
    green = tuple(sorted(c[i] for c in green_colors)[len(green_colors) // 2] for i in range(3))
    data = {
        "version": 1,
        "name": "TELEMO",
        "description": "提供されたロゴ画像から輪郭を抽出したベクター再構成。公式のベクターデータではありません。",
        "viewBox": [0, 0, image.width, image.height],
        "palette": {"ink": "#000000", "wave": "#%02x%02x%02x" % green},
        "background": None,
        "layers": [
            {"id": name, "label": label, "fill": fill, "fillRule": "evenodd", "paths": [trace(masks[name])]}
            for name, label, fill in [
                ("wordmark", "TELEMO lettering and speech-bubble O", "ink"),
                ("wave", "Green voice waveform", "wave"),
                ("tagline", "AI SALES AUTOMATION", "ink"),
            ]
        ],
    }
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted {len(data['layers'])} layers to {args.output}")


if __name__ == "__main__":
    main()
