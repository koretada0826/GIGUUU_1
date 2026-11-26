"""Render the KINETIC TELEMO hero still (3D "TELEMO" in a bright white glass space) in Blender.

Usage (from the project root):

    # quick look (40 % scale, low samples) -> $TELEMO_WORK_DIR/preview.png (default /tmp/giguuu_telemo_kinetic)
    blender -b --python scripts/build_telemo_kinetic_hero.py -- preview

    # master + web versions + .blend -> assets/telemo-blender/
    blender -b --python scripts/build_telemo_kinetic_hero.py -- final

Final outputs (2880x1120, sRGB, no alpha):
    assets/telemo-blender/telemo-kinetic-hero.png
    assets/telemo-blender/telemo-kinetic-hero-2880.webp   (2880x1120)
    assets/telemo-blender/telemo-kinetic-hero-1440.webp   (1440x560)
    assets/telemo-blender/telemo-kinetic-hero.blend

Only the 3D scene is rendered (no UI text). The bottom ~14 % fades to #FFFFFF in a numpy
post-pass so HTML text can sit on it.

Camera: horizontal (no tilt) at ~0.15x cap height above the floor, framed with lens shift, so the
letter bottoms read as one straight line while the tops rise to the right. The camera pose is
solved numerically so the wordmark hits the composition targets in COMPOSITION below.

"EMO" front faces show assets/telemo-hero-city.webp through a camera (Window-coordinate)
projection, so the photo runs continuously across E, M and O; the man is placed in the M.

View transform: "Standard" (keeps the photo's sRGB colours 1:1 on the emission faces and keeps
the navy dark; AgX washed navy to lavender in the earlier TELEMO render).
Overrides (env): TELEMO_SCALE (render %), TELEMO_SAMPLES, TELEMO_WORK_DIR, TELEMO_LENS.
"""

import math
import os
import sys
import time
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

T0 = time.time()
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "telemo-blender"
PHOTO = ROOT / "assets" / "telemo-hero-city.webp"
FONT = Path("/System/Library/Fonts/Supplemental/Arial Black.ttf")

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = "final" if ARGS and ARGS[0] == "final" else "preview"
WORK = Path(os.environ.get("TELEMO_WORK_DIR", "/tmp/giguuu_telemo_kinetic"))
WORK.mkdir(parents=True, exist_ok=True)

RES_X, RES_Y = 2880, 1120
ASPECT = RES_X / RES_Y
SCALE = int(os.environ.get("TELEMO_SCALE", "100" if MODE == "final" else "40"))
SAMPLES = int(os.environ.get("TELEMO_SAMPLES", "320" if MODE == "final" else "48"))
LENS = float(os.environ.get("TELEMO_LENS", "40"))
SENSOR = 36.0

# Composition targets, fractions of the frame (y measured from the top).
COMPOSITION = {
    "left": 0.040,     # left edge of T
    "right": 0.960,    # right edge of O
    "t_top": 0.370,    # top of T
    "o_top": 0.270,    # top of O
    "t_base": 0.772,   # bottom of T
    "o_base": 0.788,   # bottom of O (nearest letter -> lowest)
}

# Photo placement relative to the projected M (fractions of the M's projected box).
PHOTO_MAN = {"x": 1342, "head": 377, "hip": 548}  # in photo px (2084x754 source)
# Arial Black's M has a deep top V and two lower notches; the solid wedge between the lower
# notches (under the V's tip) is where the man stands, so no notch cuts through him.
MAN_X_IN_M = 0.488       # centre of that wedge (the M's centre vertex)
MAN_HEAD_IN_M = 0.575    # head top just below the V's tip
MAN_HIP_IN_M = 1.0       # jacket hem at the baseline (legs hidden, as in the reference)

# EMO photo grade (gentle): saturation, contrast, graduated sky toward the top of the letters
PHOTO_GRADE = {"saturation": 1.25, "gamma": 1.3, "contrast": 0.05, "from": 0.62, "to": 0.27,
               "top_tint": (0.74, 0.86, 0.98)}

# Light / floor
SUN_ELEV = math.radians(10.5)
VP_U = 0.74          # shadows radiate from this frame x on the horizon (sun behind-right)
SUN_STRENGTH = 16.0  # floor sun
RIM_STRENGTH = 2.5   # same sun on the letters only
SKY_HEX, SKY_STRENGTH = "BFD3EF", 0.95
FLOOR_GLOSS, FLOOR_ROUGH = 0.32, 0.12


def srgb_to_linear(hex_color):
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


# ---------------------------------------------------------------- scene / render setup
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    has_gpu = False
    for dev in prefs.devices:
        dev.use = dev.type == "METAL"
        has_gpu = has_gpu or dev.use
    scene.cycles.device = "GPU" if has_gpu else "CPU"
except Exception:  # pragma: no cover - CPU fallback
    scene.cycles.device = "CPU"
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.008 if MODE == "final" else 0.03
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 8
scene.cycles.glossy_bounces = 4
scene.cycles.transparent_max_bounces = 16
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.cycles.seed = 11
scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.resolution_percentage = SCALE
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.color_depth = "8"
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.view_settings.exposure = 0.0
scene.view_settings.gamma = 1.0

# ---------------------------------------------------------------- helpers


def new_material(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    return mat, nt, out


def ramp_node(nt, stops):
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    while len(els) > 1:
        els.remove(els[-1])
    els[0].position = stops[0][0]
    els[0].color = (*stops[0][1], 1)
    for pos, col in stops[1:]:
        e = els.new(pos)
        e.color = (*col, 1)
    return ramp


def math_node(nt, op, a=None, b=None, clamp=False):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    n.use_clamp = clamp
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            nt.links.new(v, n.inputs[i])
    return n.outputs[0]


def set_visibility(obj, camera=True, diffuse=True, glossy=True, transmission=True, shadow=True):
    obj.visible_camera = camera
    obj.visible_diffuse = diffuse
    obj.visible_glossy = glossy
    obj.visible_transmission = transmission
    obj.visible_shadow = shadow


# ---------------------------------------------------------------- letters
CAP = 2.0          # cap height (T/E/L/M), scene units
DEPTH = 0.30       # shallow extrusion
BEVEL = 0.02
GAP = 0.17         # gap between neighbouring glyphs before the solve's horizontal squeeze
FACE_CAMERA = 0.85  # each letter turns this much of the way toward the camera (keeps returns slim)

font = bpy.data.fonts.load(str(FONT)) if FONT.exists() else None


def glyph_mesh(ch, size):
    curve = bpy.data.curves.new(f"glyph {ch}", "FONT")
    curve.body = ch
    if font:
        curve.font = font
    curve.size = size
    curve.extrude = DEPTH / 2 - BEVEL
    curve.bevel_depth = BEVEL
    curve.bevel_resolution = 3
    curve.resolution_u = 22
    obj = bpy.data.objects.new(f"tmp {ch}", curve)
    scene.collection.objects.link(obj)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    bpy.data.objects.remove(obj)
    bpy.data.curves.remove(curve)
    me.transform(Matrix.Rotation(math.radians(90), 4, "X"))  # stand up, front faces -> -Y
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(me)
    bm.free()
    co = np.array([v.co[:] for v in me.vertices])
    lo, hi = co.min(0), co.max(0)
    # pivot = bottom centre of the glyph
    me.transform(Matrix.Translation((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2])))
    # smooth returns/bevels, but flat caps (smoothed cap normals tilt and mirror the floor)
    for p in me.polygons:
        p.use_smooth = abs(p.normal.y) < 0.98
    try:
        me.set_sharp_from_angle(angle=math.radians(38))
    except Exception:
        pass
    return me, hi - lo


# size so that the T's cap height is CAP
probe, dims = glyph_mesh("T", 1.0)
bpy.data.meshes.remove(probe)
FONT_SIZE = CAP / dims[2]

letters = []  # (object, char, pivot x along the word before squeeze, size)
x_cursor = 0.0
for i, ch in enumerate("TELEMO"):
    me, size = glyph_mesh(ch, FONT_SIZE)
    obj = bpy.data.objects.new(f"TELEMO {i + 1} {ch}", me)
    scene.collection.objects.link(obj)
    letters.append([obj, ch, x_cursor + size[0] / 2, size])
    x_cursor += size[0] + GAP
WORD_W = x_cursor - GAP
TEL_END = letters[2][2] + letters[2][3][0] / 2
for L in letters:
    L[2] -= WORD_W / 2  # word origin = centre of the baseline
TEL_END -= WORD_W / 2
print("[glyphs] width/cap: " + ", ".join(f"{ch}={size[0] / CAP:.3f}" for _o, ch, _x, size in letters)
      + f"; word {WORD_W / CAP:.3f} caps")

# ---------------------------------------------------------------- camera solve
# Camera at (0, -D, h) looking along +Y with no tilt; letter pivots lie on a straight floor line
# yawed by -theta (right end nearer the camera), and each letter turns FACE_CAMERA of the way
# toward the camera. Unknowns: theta, D, h, lens shift x/y and a horizontal squeeze q of the glyphs.
local_pts = [np.array([v.co[:] for v in L[0].data.vertices]) for L in letters]
K = LENS / SENSOR


def layout(params):
    """Pivot positions along the yawed line + per-letter yaw.

    Letters turned toward the camera would overlap where the line is seen obliquely (the T end),
    so each pair's spacing is divided by the cosine of the line's obliqueness at that pair; this
    keeps the gaps looking even from the camera.
    """
    theta, D, h, sx, sy, q = params
    c, s = math.cos(theta), math.sin(theta)
    widths = [q * L[3][0] for L in letters]
    need = [widths[i] / 2 + widths[i + 1] / 2 + GAP for i in range(5)]
    pos = np.concatenate([[0.0], np.cumsum(need)])
    for _ in range(4):
        pos = pos - (pos[0] - widths[0] / 2 + pos[-1] + widths[-1] / 2) / 2
        new = [0.0]
        for i in range(5):
            pm = (pos[i] + pos[i + 1]) / 2
            ang = math.atan2(-c * pm, D - s * pm) + theta  # view direction vs. the line's normal
            new.append(new[-1] + need[i] / max(math.cos(ang), 0.35))
        pos = np.array(new)
    pos = pos - (pos[0] - widths[0] / 2 + pos[-1] + widths[-1] / 2) / 2
    poses = []
    for px in pos:
        Px, Py = c * px, -s * px
        rho_cam = math.atan2(-Px, D + Py)  # yaw that would face the camera exactly
        poses.append((Px, Py, -theta + FACE_CAMERA * (rho_cam + theta), px))
    return poses


def letter_pose(params, i):
    return layout(params)[i][:3]


def project_letter(params, i):
    theta, D, h, sx, sy, q = params
    Px, Py, rho = letter_pose(params, i)
    pts = local_pts[i]
    x = pts[:, 0] * q
    c, s = math.cos(rho), math.sin(rho)
    X = c * x - s * pts[:, 1] + Px
    Y = s * x + c * pts[:, 1] + Py
    dy = Y + D
    u = 0.5 - sx + K * X / dy  # Blender lens shift moves the frame, so the image moves the other way
    v_up = -sy + K * (pts[:, 2] - h) / dy
    return u, 0.5 - v_up * ASPECT


def metrics(params):
    uT, vT = project_letter(params, 0)
    uO, vO = project_letter(params, 5)
    return {
        "left": uT.min(), "right": uO.max(),
        "t_top": vT.min(), "o_top": vO.min(),
        "t_base": vT.max(), "o_base": vO.max(),
    }


def cost(params):
    theta, D, h, sx, sy, q = params
    if h < 0.04 or D < WORD_W * 0.5 or not (0.0 <= theta <= 0.9) or not (0.8 <= q <= 1.05):
        return 1e6
    m = metrics(params)
    err = sum((m[k] - COMPOSITION[k]) ** 2 for k in COMPOSITION) * 1e4
    return err + 50 * (q - 1) ** 2


def nelder_mead(f, x0, step, iters=2500):
    pts = [np.array(x0, float)]
    for i in range(len(x0)):
        p = np.array(x0, float)
        p[i] += step[i]
        pts.append(p)
    vals = [f(p) for p in pts]
    for _ in range(iters):
        order = np.argsort(vals)
        pts = [pts[i] for i in order]
        vals = [vals[i] for i in order]
        c = np.mean(pts[:-1], axis=0)
        xr = c + (c - pts[-1])
        fr = f(xr)
        if fr < vals[0]:
            xe = c + 2 * (c - pts[-1])
            fe = f(xe)
            pts[-1], vals[-1] = (xe, fe) if fe < fr else (xr, fr)
        elif fr < vals[-2]:
            pts[-1], vals[-1] = xr, fr
        else:
            xc = c + 0.5 * (pts[-1] - c)
            fc = f(xc)
            if fc < vals[-1]:
                pts[-1], vals[-1] = xc, fc
            else:
                for i in range(1, len(pts)):
                    pts[i] = pts[0] + 0.5 * (pts[i] - pts[0])
                    vals[i] = f(pts[i])
    i = int(np.argmin(vals))
    return pts[i], vals[i]


best = None
for th0 in (0.15, 0.3, 0.45):
    for d0 in (WORD_W * 0.9, WORD_W * 1.3):
        p, val = nelder_mead(cost, [th0, d0, 0.3, 0.0, 0.09, 0.95], [0.05, 1.0, 0.1, 0.02, 0.02, 0.03])
        p, val = nelder_mead(cost, p, [0.02, 0.3, 0.05, 0.01, 0.01, 0.01])  # restart to polish
        if best is None or val < best[1]:
            best = (p, val)
PARAMS = best[0]
THETA, CAM_D, CAM_H, SHIFT_X, SHIFT_Y, SQUEEZE = PARAMS
M_SOLVED = metrics(PARAMS)
print("[solve] theta=%.2fdeg D=%.3f h=%.3f shift=(%.4f, %.4f) squeeze=%.3f cost=%.5f" % (
    math.degrees(THETA), CAM_D, CAM_H, SHIFT_X, SHIFT_Y, SQUEEZE, best[1]))
print("[solve] " + ", ".join(f"{k}={100 * v:.1f}%" for k, v in M_SOLVED.items()))

# apply the solved layout
for i, L in enumerate(letters):
    obj = L[0]
    obj.data.transform(Matrix.Diagonal((SQUEEZE, 1, 1, 1)))
    Px, Py, rho = letter_pose(PARAMS, i)
    obj.location = (Px, Py, 0)
    obj.rotation_euler = (0, 0, rho)
word = bpy.data.objects.new("TELEMO word frame", None)  # x along the word line, z up
scene.collection.objects.link(word)
word.rotation_euler = (0, 0, -THETA)
_lay = layout(PARAMS)
WORD_HALF = -(_lay[0][3] - SQUEEZE * letters[0][3][0] / 2)  # word centre -> T's left edge
TEL_SPAN = _lay[2][3] + SQUEEZE * letters[2][3][0] / 2 + WORD_HALF  # T's left edge -> L's right edge

cam_data = bpy.data.cameras.new("Hero camera")
cam_data.lens = LENS
cam_data.sensor_fit = "HORIZONTAL"
cam_data.sensor_width = SENSOR
cam_data.shift_x = SHIFT_X
cam_data.shift_y = SHIFT_Y
cam_data.clip_start = 0.05
cam_data.clip_end = 1000
camera = bpy.data.objects.new("Hero camera", cam_data)
scene.collection.objects.link(camera)
CAM_X = 0.0
camera.location = (CAM_X, -CAM_D, CAM_H)
camera.rotation_euler = (math.radians(90), 0, 0)
scene.camera = camera


def screen_to_world(u, v_top, depth):
    """Frame point (u from left, v from top, 0..1) at camera depth -> world position."""
    v_up = (0.5 - v_top) / ASPECT
    return Vector((CAM_X + (u - 0.5 + SHIFT_X) / K * depth, depth - CAM_D, CAM_H + (v_up + SHIFT_Y) / K * depth))


def projected_box(idx):
    u, v = project_letter(PARAMS, idx)
    return u.min() * RES_X, u.max() * RES_X, v.min() * RES_Y, v.max() * RES_Y


# ---------------------------------------------------------------- materials
# TEL: deep navy at the foot -> vivid blue at the top, brightening toward the L.
# The colour is carried by emission (exact navy under the Standard view) plus a thin clear coat
# that picks up the light card above the camera and the low sun on the bevels.
tel, nt, out = new_material("TEL navy-to-blue face")
tc = nt.nodes.new("ShaderNodeTexCoord")
tc.object = word
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(tc.outputs["Object"], sep.inputs[0])
zf = math_node(nt, "DIVIDE", sep.outputs["Z"], CAP)
xf = math_node(nt, "DIVIDE", math_node(nt, "ADD", sep.outputs["X"], WORD_HALF), TEL_SPAN)
fac = math_node(nt, "ADD", math_node(nt, "MULTIPLY", zf, 0.80),
                math_node(nt, "MULTIPLY", xf, 0.34))
fac = math_node(nt, "ADD", fac, -0.06, clamp=True)
TEL_STOPS = [
    (0.00, srgb_to_linear("021230")),
    (0.22, srgb_to_linear("021A44")),
    (0.55, srgb_to_linear("033272")),
    (0.80, srgb_to_linear("064A9E")),
    (1.00, srgb_to_linear("0A62C2")),
]
ramp = ramp_node(nt, TEL_STOPS)
nt.links.new(fac, ramp.inputs[0])
emit = nt.nodes.new("ShaderNodeEmission")
emit.inputs["Strength"].default_value = 1.0
nt.links.new(ramp.outputs[0], emit.inputs["Color"])
coat = nt.nodes.new("ShaderNodeBsdfGlossy")
coat.inputs["Roughness"].default_value = 0.16
lw = nt.nodes.new("ShaderNodeLayerWeight")
lw.inputs["Blend"].default_value = 0.12
coat_amt = math_node(nt, "ADD", math_node(nt, "MULTIPLY", lw.outputs["Fresnel"], 0.3), 0.006)
coat_col = nt.nodes.new("ShaderNodeCombineColor")
for i, tint in enumerate((0.12, 0.4, 1.0)):  # blue-tinted sheen: no grey lift on the navy
    nt.links.new(math_node(nt, "MULTIPLY", coat_amt, tint), coat_col.inputs[i])
nt.links.new(coat_col.outputs[0], coat.inputs["Color"])
add = nt.nodes.new("ShaderNodeAddShader")
nt.links.new(emit.outputs[0], add.inputs[0])
nt.links.new(coat.outputs[0], add.inputs[1])
nt.links.new(add.outputs[0], out.inputs["Surface"])
tel.diffuse_color = (*TEL_STOPS[2][1], 1)

# EMO: one photo, projected from the camera (Window coords) -> continuous across E, M, O.
photo_img = bpy.data.images.load(str(PHOTO))
photo_img.colorspace_settings.name = "sRGB"
PW_SRC, PH_SRC = photo_img.size
mx0, mx1, my0, my1 = projected_box(4)  # M (pixels, y from top)
m_w, m_h = mx1 - mx0, my1 - my0
head_y = my0 + MAN_HEAD_IN_M * m_h
hip_y = my0 + MAN_HIP_IN_M * m_h
PHOTO_S = (hip_y - head_y) / (PHOTO_MAN["hip"] - PHOTO_MAN["head"])
PX0 = mx0 + MAN_X_IN_M * m_w - PHOTO_MAN["x"] * PHOTO_S
PY0 = head_y - PHOTO_MAN["head"] * PHOTO_S
PW, PH = PW_SRC * PHOTO_S, PH_SRC * PHOTO_S
ex0 = projected_box(3)[0]
ox1 = projected_box(5)[1]
print("[photo] scale=%.3f (photo px -> frame px), placed x %.0f..%.0f y %.0f..%.0f; EMO spans x %.0f..%.0f" % (
    PHOTO_S, PX0, PX0 + PW, PY0, PY0 + PH, ex0, ox1))
print("[photo] man centre x=%.0f (%.1f%%), head top y=%.0f (%.1f%%), hem y=%.0f" % (
    PX0 + PHOTO_MAN["x"] * PHOTO_S, 100 * (PX0 + PHOTO_MAN["x"] * PHOTO_S) / RES_X, head_y, 100 * head_y / RES_Y, hip_y))
if PX0 > ex0 or PX0 + PW < ox1:
    print("[photo] WARNING: photo does not cover EMO horizontally (edge pixels are extended)")

emo, nt, out = new_material("EMO city photo face")
tc = nt.nodes.new("ShaderNodeTexCoord")
mapping = nt.nodes.new("ShaderNodeMapping")
mapping.inputs["Scale"].default_value = (RES_X / PW, RES_Y / PH, 1)
mapping.inputs["Location"].default_value = (-PX0 / PW, -(RES_Y - PY0 - PH) / PH, 0)
nt.links.new(tc.outputs["Window"], mapping.inputs["Vector"])
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = photo_img
tex.interpolation = "Cubic"
tex.extension = "EXTEND"
nt.links.new(mapping.outputs[0], tex.inputs["Vector"])
# gentle, natural grade: a touch more saturation/contrast and a graduated sky (deeper at the top)
hsv = nt.nodes.new("ShaderNodeHueSaturation")
hsv.inputs["Saturation"].default_value = PHOTO_GRADE["saturation"]
hsv.inputs["Value"].default_value = 1.0
nt.links.new(tex.outputs["Color"], hsv.inputs["Color"])
gam = nt.nodes.new("ShaderNodeGamma")
gam.inputs["Gamma"].default_value = PHOTO_GRADE["gamma"]
nt.links.new(hsv.outputs[0], gam.inputs["Color"])
bc = nt.nodes.new("ShaderNodeBrightContrast")
bc.inputs["Contrast"].default_value = PHOTO_GRADE["contrast"]
nt.links.new(gam.outputs[0], bc.inputs["Color"])
wsep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(tc.outputs["Window"], wsep.inputs[0])
# window y (0 bottom .. 1 top): grad 0 below the skyline, 1 at the top of the O
g0, g1 = 1 - PHOTO_GRADE["from"], 1 - PHOTO_GRADE["to"]
grad = math_node(nt, "DIVIDE", math_node(nt, "SUBTRACT", wsep.outputs["Y"], g0), g1 - g0)
grad = math_node(nt, "MINIMUM", math_node(nt, "MAXIMUM", grad, 0.0), 1.0)
grad = math_node(nt, "POWER", grad, 1.3)
nd = nt.nodes.new("ShaderNodeMix")
nd.data_type = "RGBA"
nd.blend_type = "MULTIPLY"
nt.links.new(grad, nd.inputs["Factor"])
nt.links.new(bc.outputs[0], nd.inputs[6])
nd.inputs[7].default_value = (*PHOTO_GRADE["top_tint"], 1)
emit = nt.nodes.new("ShaderNodeEmission")
emit.inputs["Strength"].default_value = 1.0
nt.links.new(nd.outputs[2], emit.inputs["Color"])
gloss = nt.nodes.new("ShaderNodeBsdfGlossy")
gloss.inputs["Color"].default_value = (0.03, 0.03, 0.03, 1)
gloss.inputs["Roughness"].default_value = 0.12
add = nt.nodes.new("ShaderNodeAddShader")
nt.links.new(emit.outputs[0], add.inputs[0])
nt.links.new(gloss.outputs[0], add.inputs[1])
nt.links.new(add.outputs[0], out.inputs["Surface"])
emo.diffuse_color = (0.2, 0.45, 0.85, 1)

# Returns / sides: dark navy lacquer; only the rim sun and the sky light them.
side, nt, out = new_material("Letter sides navy")
bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Base Color"].default_value = (*srgb_to_linear("0A2658"), 1)
bsdf.inputs["Roughness"].default_value = 0.34
bsdf.inputs["Specular IOR Level"].default_value = 0.3
nt.links.new(bsdf.outputs[0], out.inputs["Surface"])

for idx, (obj, ch, *_rest) in enumerate(letters):
    me = obj.data
    me.materials.append(tel if idx < 3 else emo)
    me.materials.append(side)
    for p in me.polygons:
        p.material_index = 0 if p.normal.y < -0.5 else 1

# ---------------------------------------------------------------- floor
floor_mat, nt, out = new_material("Glossy white floor")
diff = nt.nodes.new("ShaderNodeBsdfDiffuse")
diff.inputs["Color"].default_value = (0.9, 0.92, 0.95, 1)
gl = nt.nodes.new("ShaderNodeBsdfGlossy")
gl.inputs["Color"].default_value = (0.96, 0.98, 1.0, 1)
gl.inputs["Roughness"].default_value = FLOOR_ROUGH
mix = nt.nodes.new("ShaderNodeMixShader")
mix.inputs["Fac"].default_value = FLOOR_GLOSS
nt.links.new(diff.outputs[0], mix.inputs[1])
nt.links.new(gl.outputs[0], mix.inputs[2])
nt.links.new(mix.outputs[0], out.inputs["Surface"])

bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 150 - CAM_D - 20, 0))
floor = bpy.context.object
floor.name = "Floor"
floor.scale = (600, 300, 1)
floor.data.materials.append(floor_mat)

# ---------------------------------------------------------------- world
# camera & glossy rays see a near-white void; diffuse rays see a soft blue sky (-> blue shadows)
world = bpy.data.worlds.new("Bright morning void")
scene.world = world
world.use_nodes = True
wnt = world.node_tree
for n in list(wnt.nodes):
    wnt.nodes.remove(n)
wout = wnt.nodes.new("ShaderNodeOutputWorld")
lp = wnt.nodes.new("ShaderNodeLightPath")
bg_white = wnt.nodes.new("ShaderNodeBackground")
bg_white.inputs["Color"].default_value = (*srgb_to_linear("FCFDFF"), 1)
bg_white.inputs["Strength"].default_value = 1.0
bg_sky = wnt.nodes.new("ShaderNodeBackground")
bg_sky.inputs["Color"].default_value = (*srgb_to_linear(SKY_HEX), 1)
bg_sky.inputs["Strength"].default_value = SKY_STRENGTH
wmix = wnt.nodes.new("ShaderNodeMixShader")
see_white = wnt.nodes.new("ShaderNodeMath")
see_white.operation = "MAXIMUM"
wnt.links.new(lp.outputs["Is Camera Ray"], see_white.inputs[0])
wnt.links.new(lp.outputs["Is Glossy Ray"], see_white.inputs[1])
wnt.links.new(see_white.outputs[0], wmix.inputs[0])
wnt.links.new(bg_sky.outputs[0], wmix.inputs[1])
wnt.links.new(bg_white.outputs[0], wmix.inputs[2])
wnt.links.new(wmix.outputs[0], wout.inputs["Surface"])

# ---------------------------------------------------------------- lights
letters_col = bpy.data.collections.new("TELEMO letters")
scene.collection.children.link(letters_col)
for obj, *_ in letters:
    letters_col.objects.link(obj)
    scene.collection.objects.unlink(obj)
room_col = bpy.data.collections.new("Floor")
scene.collection.children.link(room_col)
room_col.objects.link(floor)
scene.collection.objects.unlink(floor)

SUN_AZ = math.atan((VP_U - 0.5 + SHIFT_X) / K)  # sun azimuth (right of straight-behind)
to_sun = Vector((math.sin(SUN_AZ) * math.cos(SUN_ELEV), math.cos(SUN_AZ) * math.cos(SUN_ELEV), math.sin(SUN_ELEV)))


def sun_light(name, energy, angle_deg, color, receivers):
    data = bpy.data.lights.new(name, "SUN")
    data.energy = energy
    data.angle = math.radians(angle_deg)
    data.color = color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()
    obj.light_linking.receiver_collection = receivers
    return obj


# low morning sun behind-right: lights the floor (long shadows toward the front-left) ...
sun = sun_light("Early morning sun (floor)", SUN_STRENGTH, 6.0, (1.0, 0.96, 0.9), room_col)
# ... and, much weaker, the letters (warm rim on the bevels/right returns without greying the navy)
rim = sun_light("Early morning sun (letter rim)", RIM_STRENGTH, 2.0, (1.0, 0.93, 0.82), letters_col)
print("[sun] azimuth %.1f deg right of straight-behind, elevation %.1f deg" % (math.degrees(SUN_AZ), math.degrees(SUN_ELEV)))

# light card above/behind the camera: only seen in reflections (gives the letters a soft top sheen)
card_me = bpy.data.meshes.new("Reflection card")
card_me.from_pydata([(-30, 0, 2.5), (30, 0, 2.5), (30, 0, 22), (-30, 0, 22)], [], [(0, 1, 2, 3)])
card = bpy.data.objects.new("Reflection card (glossy only)", card_me)
scene.collection.objects.link(card)
card.location = (CAM_X, -CAM_D - 8.0, 0)
card_mat, nt, out = new_material("Reflection card")
em = nt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (*srgb_to_linear("DCE8F8"), 1)
em.inputs["Strength"].default_value = 1.0
nt.links.new(em.outputs[0], out.inputs["Surface"])
card_me.materials.append(card_mat)
set_visibility(card, camera=False, diffuse=False, glossy=True, transmission=False, shadow=False)

# dark navy surround for everything else the letter fronts mirror (keeps the navy from greying)
dark_me = bpy.data.meshes.new("Reflection surround")
dark_me.from_pydata([(-60, 0, -5), (60, 0, -5), (60, 0, 2.5), (-60, 0, 2.5)], [], [(0, 1, 2, 3)])
dark = bpy.data.objects.new("Reflection surround (glossy only)", dark_me)
scene.collection.objects.link(dark)
dark.location = (CAM_X, -CAM_D - 8.0, 0)
dark_mat, nt, out = new_material("Reflection surround")
em = nt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (*srgb_to_linear("1A2E52"), 1)
nt.links.new(em.outputs[0], out.inputs["Surface"])
dark_me.materials.append(dark_mat)
set_visibility(dark, camera=False, diffuse=False, glossy=True, transmission=False, shadow=False)

# ---------------------------------------------------------------- glass architecture
glass_col = bpy.data.collections.new("Glass architecture")
scene.collection.children.link(glass_col)


def glass_material(name, tint, gloss=0.08, rough=0.04):
    mat, nt, out = new_material(name)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    tr.inputs["Color"].default_value = (*tint, 1)
    g = nt.nodes.new("ShaderNodeBsdfGlossy")
    g.inputs["Color"].default_value = (0.85, 0.92, 1.0, 1)
    g.inputs["Roughness"].default_value = rough
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.3
    f = math_node(nt, "MULTIPLY", lw.outputs["Fresnel"], gloss / 0.3)
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(f, mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(g.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"])
    mat.diffuse_color = (*tint, 0.3)
    return mat


def screen_panel(name, corners, mat, uv=False):
    """corners: [(u, v_top, depth), ...] in frame space; builds a planar-ish quad in the world."""
    verts = [screen_to_world(u, v, d)[:] for u, v, d in corners]
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], [tuple(range(len(verts)))])
    if uv:
        layer = me.uv_layers.new()
        for li, (uvx, uvy) in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
            layer.data[li].uv = (uvx, uvy)
    me.materials.append(mat)
    obj = bpy.data.objects.new(name, me)
    glass_col.objects.link(obj)
    set_visibility(obj, shadow=False)
    return obj


D_BACK = CAM_D * 1.35
faint = glass_material("Faint blue acrylic", srgb_to_linear("F0F5FC"), gloss=0.04)
pale = glass_material("Pale blue acrylic", srgb_to_linear("E6EEF9"))
edge = glass_material("Blue glass edge", srgb_to_linear("DDE8F7"), gloss=0.08)

# upper right: big angled sheets seen from below (kept light where the HTML copy sits)
screen_panel("Glass sheet upper right A", [(0.63, 0.42, D_BACK * 1.25), (0.75, -0.02, D_BACK * 1.1),
                                           (1.04, -0.02, D_BACK * 0.85), (1.04, 0.55, D_BACK * 0.9)], faint)
screen_panel("Glass sheet upper right B", [(0.84, 0.34, D_BACK * 1.1), (0.91, 0.12, D_BACK),
                                           (1.04, 0.10, D_BACK * 0.8), (1.04, 0.66, D_BACK * 0.85)], pale)
# right edge: tall slab beside the O
screen_panel("Glass slab right edge", [(0.962, 0.16, CAM_D * 0.95), (1.03, 0.13, CAM_D * 0.9),
                                       (1.03, 0.80, CAM_D * 0.9), (0.962, 0.79, CAM_D * 0.95)], edge)
# left: soft blue haze (fades out toward the top and the right) that the light shafts read against
haze, nt, out = new_material("Soft blue haze")
tch = nt.nodes.new("ShaderNodeTexCoord")
sph = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(tch.outputs["UV"], sph.inputs[0])
down = math_node(nt, "POWER", sph.outputs["Y"], 1.6)
right_fade = math_node(nt, "SUBTRACT", 1.0, math_node(nt, "POWER", sph.outputs["X"], 3.0))
hfac = math_node(nt, "MULTIPLY", down, right_fade, clamp=True)
hmix = nt.nodes.new("ShaderNodeMix")
hmix.data_type = "RGBA"
nt.links.new(hfac, hmix.inputs["Factor"])
hmix.inputs[6].default_value = (1, 1, 1, 1)
hmix.inputs[7].default_value = (*srgb_to_linear("E2EAF5"), 1)
htr = nt.nodes.new("ShaderNodeBsdfTransparent")
nt.links.new(hmix.outputs[2], htr.inputs["Color"])
nt.links.new(htr.outputs[0], out.inputs["Surface"])
screen_panel("Haze sheet left", [(-0.03, -0.02, D_BACK * 1.2), (0.36, -0.02, D_BACK * 1.3),
                                 (0.40, 0.80, D_BACK * 1.3), (-0.03, 0.80, D_BACK * 1.2)], haze, uv=True)

# light shafts (soft emissive strips) slanting down from the upper left
shaft_mat, nt, out = new_material("Light shaft")
tcs = nt.nodes.new("ShaderNodeTexCoord")
sp = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(tcs.outputs["UV"], sp.inputs[0])
across = math_node(nt, "SINE", math_node(nt, "MULTIPLY", sp.outputs["X"], math.pi))
across = math_node(nt, "POWER", across, 2.0)
along = math_node(nt, "SINE", math_node(nt, "MULTIPLY", sp.outputs["Y"], math.pi))
alpha = math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", across, along), 0.8, clamp=True)
tr = nt.nodes.new("ShaderNodeBsdfTransparent")
em = nt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (1.0, 0.995, 0.98, 1)
em.inputs["Strength"].default_value = 1.05
mx = nt.nodes.new("ShaderNodeMixShader")
nt.links.new(alpha, mx.inputs[0])
nt.links.new(tr.outputs[0], mx.inputs[1])
nt.links.new(em.outputs[0], mx.inputs[2])
nt.links.new(mx.outputs[0], out.inputs["Surface"])
for j, (u0, w) in enumerate([(-0.05, 0.035), (0.04, 0.05), (0.16, 0.03)]):
    d = D_BACK * 1.15
    s = screen_panel(f"Light shaft {j + 1}", [(u0, 0.12, d), (u0 + w, 0.12, d),
                                              (u0 + w + 0.15, 0.80, d), (u0 + 0.15, 0.80, d)], shaft_mat, uv=True)
    set_visibility(s, diffuse=False, glossy=False, transmission=False, shadow=False)

# ---------------------------------------------------------------- verify projection with Blender's camera
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
check = {}
for idx, (obj, ch, *_r) in enumerate(letters):
    pts = [world_to_camera_view(scene, camera, obj.matrix_world @ v.co) for v in obj.data.vertices]
    xs = [p.x for p in pts]
    ys = [1 - p.y for p in pts]
    check[f"{idx}{ch}"] = (min(xs), max(xs), min(ys), max(ys))
print("[check] per-letter x0,x1,top,bottom (%): " + "; ".join(
    f"{k}: {100 * a:.1f},{100 * b:.1f},{100 * c:.1f},{100 * d:.1f}" for k, (a, b, c, d) in check.items()))

# ---------------------------------------------------------------- save + render
if MODE == "final":
    OUT.mkdir(parents=True, exist_ok=True)
    blend = OUT / "telemo-kinetic-hero.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend), compress=True)
    bak = OUT / "telemo-kinetic-hero.blend1"
    if bak.exists():
        bak.unlink()

raw_path = WORK / ("raw-final.png" if MODE == "final" else "raw-preview.png")
scene.render.filepath = str(raw_path)
t_render = time.time()
bpy.ops.render.render(write_still=True)
print("[render] %s %dx%d @%d%%, %d samples, %.1fs" % (
    scene.cycles.device, RES_X, RES_Y, SCALE, SAMPLES, time.time() - t_render))

# ---------------------------------------------------------------- post: bottom fade to #FFFFFF
src = bpy.data.images.load(str(raw_path))
w, h = src.size
px = np.empty(w * h * 4, dtype=np.float32)
src.pixels.foreach_get(px)
px = px.reshape(h, w, 4)  # row 0 = bottom
y_from_top = 1.0 - (np.arange(h, dtype=np.float32) + 0.5) / h
FADE_START, FADE_END = 0.86, 0.985
t = np.clip((y_from_top - FADE_START) / (FADE_END - FADE_START), 0, 1)
fade = (t * t * (3 - 2 * t))[:, None, None]
px[..., :3] = px[..., :3] * (1 - fade) + fade
px[..., 3] = 1.0


def save_image(arr, path, fmt, quality=90):
    hh, ww = arr.shape[:2]
    img = bpy.data.images.new(path.stem, ww, hh, alpha=False)
    img.pixels.foreach_set(np.ascontiguousarray(arr, dtype=np.float32).ravel())
    img.filepath_raw = str(path)
    img.file_format = fmt
    if fmt == "PNG":
        img.save()
    else:
        img.save(filepath=str(path), quality=quality)
    bpy.data.images.remove(img)
    print(f"[out] {path} {ww}x{hh} {path.stat().st_size / 1024:.0f} KB")


if MODE == "final":
    save_image(px, OUT / "telemo-kinetic-hero.png", "PNG")
    save_image(px, OUT / "telemo-kinetic-hero-2880.webp", "WEBP", quality=82)
    half = px.reshape(h // 2, 2, w // 2, 2, 4).mean(axis=(1, 3))
    save_image(half, OUT / "telemo-kinetic-hero-1440.webp", "WEBP", quality=82)
else:
    save_image(px, WORK / "preview.png", "PNG")
print("[done] %.1fs total" % (time.time() - T0))
