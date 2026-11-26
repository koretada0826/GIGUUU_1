"""Generate the TELEMO SVG from assets/telemo-logo.json using the standard library.

Usage: python3 scripts/build_telemo_logo.py
Edit the JSON palette or layer paths, then run this command to rebuild the logo.
"""

import argparse
import json
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
NS = "http://www.w3.org/2000/svg"


def build(data):
    ET.register_namespace("", NS)
    x, y, width, height = data["viewBox"]
    svg = ET.Element(f"{{{NS}}}svg", {
        "viewBox": f"{x} {y} {width} {height}",
        "width": str(width), "height": str(height),
        "role": "img", "aria-labelledby": "logo-title",
    })
    ET.SubElement(svg, "title", {"id": "logo-title"}).text = data["name"] + " — AI SALES AUTOMATION"
    if data.get("background"):
        ET.SubElement(svg, "rect", {"x": str(x), "y": str(y), "width": str(width), "height": str(height), "fill": data["background"]})
    for layer in data["layers"]:
        group = ET.SubElement(svg, "g", {
            "id": layer["id"], "fill": data["palette"][layer["fill"]],
            "fill-rule": layer["fillRule"],
        })
        for path in layer["paths"]:
            ET.SubElement(group, "path", {"d": path})
    ET.indent(svg, space="  ")
    return ET.tostring(svg, encoding="unicode") + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "assets/telemo-logo.json")
    parser.add_argument("--output", type=Path, default=ROOT / "assets/telemo-logo.svg")
    args = parser.parse_args()
    data = json.loads(args.source.read_text(encoding="utf-8"))
    args.output.write_text(build(data), encoding="utf-8")
    print(f"Generated {args.output}")


if __name__ == "__main__":
    main()
