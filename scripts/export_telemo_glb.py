"""Export only the TELEMO letters from telemo-hero.blend to assets/models/telemo.glb.

Usage (from the project root):

    blender -b assets/telemo-blender/telemo-hero.blend --python scripts/export_telemo_glb.py

- Floor / wall / lights / camera are excluded (only objects named "TELEMO letter *").
- Transforms are baked into the meshes and the whole word is re-centred on its bounding-box centre.
- Mix-shader wrappers (orange gloss tweak) are bypassed so the exporter sees the plain
  Principled BSDF -> glTF PBR (metallicRoughness, clearcoat, ...).
- Base colours can be overridden for the web look (sRGB hex, see WEB_COLORS; env TELEMO_BLUE /
  TELEMO_ORANGE win). three.js ACES tone mapping pushes orange towards yellow, so the orange is
  exported slightly redder than in the .blend to match the hero video (assets/telemo-blender/telemo-poster.png).
- Output path: env TELEMO_GLB_OUT (default assets/models/telemo.glb).
- The .blend file is NOT saved; changes live only in this Blender session.
"""

import os
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("TELEMO_GLB_OUT", ROOT / "assets" / "models" / "telemo.glb"))

# sRGB hex; None = keep the .blend colour (.blend: blue 1670E6 / orange FF8C1C).
# Tuned against model-viewer.js defaults (ACES, exposure 0.9) -> face ~#2470DD, sides ~#EA7C1B
WEB_COLORS = {
    "TELEMO blue face": os.environ.get("TELEMO_BLUE", "1266EA") or None,
    "TELEMO orange sides": os.environ.get("TELEMO_ORANGE", "FF700C") or None,
}


def srgb_to_linear(hex_color):
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)

OUT.parent.mkdir(parents=True, exist_ok=True)

letters = [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith("TELEMO letter")]
assert letters, "no TELEMO letter objects found"

# Mix Shader -> connect Principled BSDF straight to the output
for mat in {s.material for o in letters for s in o.material_slots if s.material}:
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
    if bsdf and out:
        nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
    if bsdf and WEB_COLORS.get(mat.name):
        bsdf.inputs["Base Color"].default_value = (*srgb_to_linear(WEB_COLORS[mat.name]), 1)

# bake transforms
for o in letters:
    o.data = o.data.copy()  # never mutate shared mesh data
    o.data.transform(o.matrix_world)
    o.matrix_world = Matrix.Identity(4)

# centre the word on its bounding box
pts = [v.co for o in letters for v in o.data.vertices]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
centre = (lo + hi) / 2
for o in letters:
    o.data.transform(Matrix.Translation(-centre))

bpy.ops.object.select_all(action="DESELECT")
for o in letters:
    o.select_set(True)
bpy.context.view_layer.objects.active = letters[0]

bpy.ops.export_scene.gltf(
    filepath=str(OUT),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_materials="EXPORT",
)
size = hi - lo
print(f"exported {len(letters)} letters -> {OUT} ({OUT.stat().st_size} bytes), size {size.x:.3f} x {size.y:.3f} x {size.z:.3f}")
