"""Build and render the UI concept #1 ("cinematic-signal-studio") satin ribbon in Blender.

Usage (from the project root):

    # quick low-res check of both shots -> output/ui-concept-01-blender/assets/_preview-*.png
    blender -b --python scripts/build_concept01_ribbon.py -- preview

    # final renders
    blender -b --python scripts/build_concept01_ribbon.py -- hero
    blender -b --python scripts/build_concept01_ribbon.py -- about
    blender -b --python scripts/build_concept01_ribbon.py -- all

Outputs (output/ui-concept-01-blender/assets/):
    ribbon-hero.png        2880x2000, opaque, white studio floor (page hero, 1440x1000 CSS px)
    ribbon-about.png       1400x1400, transparent (film_transparent), ribbon curling in from bottom-right
    concept01-ribbon.blend scene with both cameras ("Hero camera", "About camera")

Web copies (WebP, used by output/ui-concept-01-blender/index.html), with the system python + Pillow:

    python3 -c "from PIL import Image; d='output/ui-concept-01-blender/assets/'; \
      Image.open(d+'ribbon-hero.png').convert('RGB').save(d+'ribbon-hero.webp', 'WEBP', quality=92, method=6); \
      Image.open(d+'ribbon-about.png').save(d+'ribbon-about.webp', 'WEBP', quality=88, method=6)"

Conventions follow scripts/build_telemo_blender.py: Cycles on Metal GPU (CPU fallback),
OpenImageDenoise, view transform "Khronos PBR Neutral".
Overrides (env): C01_SCALE (render %), C01_SAMPLES, C01_EXPOSURE.
"""

import math
import os
import sys
import time
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "ui-concept-01-blender" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = ARGS[0] if ARGS and ARGS[0] in {"preview", "hero", "about", "all"} else "preview"
PREVIEW = MODE == "preview"


def srgb_to_linear(hex_color):
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


# ---------------------------------------------------------------- scene setup
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
try:
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for dev in prefs.devices:
        dev.use = dev.type == "METAL"
    scene.cycles.device = "GPU"
except Exception:  # pragma: no cover - CPU fallback
    scene.cycles.device = "CPU"
scene.cycles.samples = int(os.environ.get("C01_SAMPLES", "48" if PREVIEW else "256"))
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.02 if PREVIEW else 0.006
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 8
scene.cycles.glossy_bounces = 4
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.cycles.seed = 11
scene.render.image_settings.file_format = "PNG"
scene.view_settings.view_transform = "Khronos PBR Neutral"
scene.view_settings.look = "None"
scene.view_settings.exposure = float(os.environ.get("C01_EXPOSURE", "-0.35"))
scene.render.resolution_percentage = int(os.environ.get("C01_SCALE", "25" if PREVIEW else "100"))

world = bpy.data.worlds.new("Studio world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.86, 0.88, 0.92, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.3

# ---------------------------------------------------------------- materials
BLUE = srgb_to_linear("3F80EA")       # between brand #5B9BFF and deep #225FB9 after shading
BLUE_SHEEN = srgb_to_linear("9CC3FF")
ORANGE = srgb_to_linear("FF8A3D")


def satin_blue():
    """Anisotropic satin: soft blue base + stretched sheen along the ribbon (UV u = length)."""
    mat = bpy.data.materials.new("Satin blue")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*BLUE, 1)
    bsdf.inputs["Roughness"].default_value = 0.36
    bsdf.inputs["Specular IOR Level"].default_value = 0.38
    bsdf.inputs["Anisotropic"].default_value = 0.7
    bsdf.inputs["Sheen Weight"].default_value = 0.1
    bsdf.inputs["Sheen Roughness"].default_value = 0.4
    bsdf.inputs["Sheen Tint"].default_value = (*BLUE_SHEEN, 1)
    bsdf.inputs["Coat Weight"].default_value = 0.12
    bsdf.inputs["Coat Roughness"].default_value = 0.3
    tangent = nt.nodes.new("ShaderNodeTangent")
    tangent.direction_type = "UV_MAP"
    tangent.uv_map = "UVMap"
    nt.links.new(tangent.outputs["Tangent"], bsdf.inputs["Tangent"])
    # very fine woven grain so large faces don't read as plastic
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 900.0
    noise.inputs["Detail"].default_value = 2.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.025
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    mat.diffuse_color = (*BLUE, 1)
    return mat


def orange_edge():
    mat = bpy.data.materials.new("Orange edge")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*ORANGE, 1)
    bsdf.inputs["Roughness"].default_value = 0.3
    bsdf.inputs["Specular IOR Level"].default_value = 0.3
    bsdf.inputs["Emission Color"].default_value = (*ORANGE, 1)
    bsdf.inputs["Emission Strength"].default_value = 0.35
    mat.diffuse_color = (*ORANGE, 1)
    return mat


def studio_white():
    mat = bpy.data.materials.new("Studio white floor")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.84, 0.85, 0.87, 1)
    bsdf.inputs["Roughness"].default_value = 0.6
    bsdf.inputs["Specular IOR Level"].default_value = 0.0
    gloss = nt.nodes.new("ShaderNodeBsdfGlossy")
    gloss.inputs["Color"].default_value = (0.9, 0.91, 0.93, 1)
    gloss.inputs["Roughness"].default_value = 0.22
    mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs["Fac"].default_value = 0.08
    nt.links.new(bsdf.outputs[0], mix.inputs[1])
    nt.links.new(gloss.outputs[0], mix.inputs[2])
    # the sweep glows softly as it rises, so the backdrop melts to white while floor shadows stay
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.3
    ramp.inputs["From Max"].default_value = 7.0
    ramp.inputs["To Min"].default_value = 0.0
    ramp.inputs["To Max"].default_value = 1.0
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (0.97, 0.975, 0.985, 1)
    emit.inputs["Strength"].default_value = 1.35
    mix2 = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(geo.outputs["Position"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs["Value"])
    nt.links.new(ramp.outputs["Result"], mix2.inputs["Fac"])
    nt.links.new(mix.outputs[0], mix2.inputs[1])
    nt.links.new(emit.outputs[0], mix2.inputs[2])
    nt.links.new(mix2.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return mat


MAT_BLUE = satin_blue()
MAT_ORANGE = orange_edge()
MAT_STUDIO = studio_white()


# ---------------------------------------------------------------- ribbon builder
def build_ribbon(name, spine, width, twist, n=700, cols=28, edge=0.045, thickness=0.018, collection=None):
    """Sweep a twisted strip along spine(t), t in [0, 1].

    width(t): ribbon width; twist(t): roll (radians) of the strip around the tangent, measured
    from the horizontal side vector. The strip's last `edge` fraction (+v side) gets the orange
    material; the solidify rim on that side inherits it, the opposite rim stays blue.
    """
    pts = [Vector(spine(i / n)) for i in range(n + 1)]
    tans = []
    for i in range(n + 1):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, n)]
        tans.append((b - a).normalized())
    # rotation-minimising frame (double reflection), seeded with a horizontal side vector
    side = tans[0].cross(Vector((0, 0, 1)))
    if side.length < 1e-4:
        side = Vector((0, 1, 0))
    side.normalize()
    sides = [side]
    for i in range(n):
        v1 = pts[i + 1] - pts[i]
        c1 = v1.dot(v1)
        r_l = sides[i] - (2 / c1) * v1.dot(sides[i]) * v1
        t_l = tans[i] - (2 / c1) * v1.dot(tans[i]) * v1
        v2 = tans[i + 1] - t_l
        c2 = v2.dot(v2)
        r = r_l - (2 / c2) * v2.dot(r_l) * v2 if c2 > 1e-12 else r_l
        sides.append(r.normalized())

    vs = [-0.5 + k * (1.0 - edge) / (cols - 1) for k in range(cols)] + [0.5]
    verts, faces, mats, uvs = [], [], [], []
    for i in range(n + 1):
        t = i / n
        T = tans[i]
        s = sides[i]
        b = T.cross(s).normalized()
        a = twist(t)
        w = (s * math.cos(a) + b * math.sin(a)) * width(t)
        for v in vs:
            verts.append(pts[i] + w * v)
    m = len(vs)
    for i in range(n):
        for k in range(m - 1):
            q = i * m + k
            faces.append((q, q + 1, q + m + 1, q + m))
            mats.append(1 if k == m - 2 else 0)
            uvs.append([(i / n * 20, vs[k] + 0.5), (i / n * 20, vs[k + 1] + 0.5),
                        ((i + 1) / n * 20, vs[k + 1] + 0.5), ((i + 1) / n * 20, vs[k] + 0.5)])
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    uv = mesh.uv_layers.new(name="UVMap")
    for poly, mi, quv in zip(mesh.polygons, mats, uvs):
        poly.material_index = mi
        poly.use_smooth = True
        for li, co in zip(poly.loop_indices, quv):
            uv.data[li].uv = co
    mesh.materials.append(MAT_BLUE)
    mesh.materials.append(MAT_ORANGE)
    obj = bpy.data.objects.new(name, mesh)
    (collection or scene.collection).objects.link(obj)
    sol = obj.modifiers.new("Thickness", "SOLIDIFY")
    sol.thickness = thickness
    sol.offset = 0.0
    sol.use_even_offset = True
    sol.use_quality_normals = True
    return obj


def smoothstep(e0, e1, x):
    x = min(max((x - e0) / (e1 - e0), 0.0), 1.0)
    return x * x * (3 - 2 * x)


# ---- hero ribbon: one long ribbon travelling left -> right, bouncing on the floor and receding.
# Control points (x, y, z, roll in degrees); y grows away from the camera.
HERO_POINTS = [
    (-12.5, -5.0, -0.6, 70),
    (-9.0, -3.4, 1.6, 64),
    (-6.4, -1.6, 4.4, 30),   # top of the tall near arch
    (-4.6, -0.4, 3.4, 52),
    (-3.0, 0.5, 1.1, 34),
    (-1.4, 1.4, 0.12, 4),    # touchdown: lies flat on the floor
    (0.4, 2.6, 0.9, 24),
    (2.4, 3.6, 2.3, 22),     # second crest
    (4.6, 4.5, 1.5, 26),
    (6.6, 5.2, 0.12, 4),     # touchdown far right
    (8.8, 6.0, 1.2, 40),
    (11.0, 6.6, 2.6, 60),
    (14.0, 7.4, 3.6, 60),
]


def catmull(points, t):
    """Uniform Catmull-Rom through `points` (tuples), t in [0, 1]."""
    n = len(points) - 1
    f = min(max(t, 0.0), 1.0) * n
    i = min(int(f), n - 1)
    u = f - i
    p0 = points[max(i - 1, 0)]
    p1 = points[i]
    p2 = points[i + 1]
    p3 = points[min(i + 2, n)]
    out = []
    for a, b, c, d in zip(p0, p1, p2, p3):
        out.append(0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u
                          + (-a + 3 * b - 3 * c + d) * u * u * u))
    return out


hero_col = bpy.data.collections.new("Hero")
scene.collection.children.link(hero_col)
hero_ribbon = build_ribbon(
    "Hero ribbon",
    lambda t: catmull(HERO_POINTS, t)[:3],
    lambda t: 2.4,
    lambda t: math.radians(catmull(HERO_POINTS, t)[3]),
    n=900, collection=hero_col)

BACK_POINTS = [
    (-13.0, 3.0, 0.05, 30),
    (-10.0, 3.6, 0.9, 40),
    (-7.6, 4.2, 1.7, 52),
    (-5.6, 4.8, 0.9, 60),
    (-4.6, 5.2, -0.5, 80),
    (-3.4, 5.6, -1.6, 85),
]
back_ribbon = build_ribbon(
    "Back ribbon",
    lambda t: catmull(BACK_POINTS, t)[:3],
    lambda t: 1.2,
    lambda t: math.radians(catmull(BACK_POINTS, t)[3]),
    n=400, collection=hero_col)

# ---------------------------------------------------------------- studio floor / cyc
WALL_Y = 40.0
CURVE_R = 14.0
profile = [(-40.0, 0.0), (WALL_Y - CURVE_R, 0.0)]
for k in range(1, 25):
    a = (k / 24) * (math.pi / 2)
    profile.append((WALL_Y - CURVE_R + math.sin(a) * CURVE_R, CURVE_R - math.cos(a) * CURVE_R))
profile.append((WALL_Y, 60.0))
verts, faces = [], []
for x in (-120.0, 120.0):
    for y, z in profile:
        verts.append((x, y, z))
npf = len(profile)
for k in range(npf - 1):
    faces.append((k, k + 1, npf + k + 1, npf + k))
mesh = bpy.data.meshes.new("Cyc")
mesh.from_pydata(verts, [], faces)
for p in mesh.polygons:
    p.use_smooth = True
cyc = bpy.data.objects.new("Studio cyclorama", mesh)
hero_col.objects.link(cyc)
cyc.data.materials.append(MAT_STUDIO)


# ---------------------------------------------------------------- lights
def area(name, location, energy, size, color=(1, 1, 1), target=(0, 0, 0), size_y=None, spread=180, col=None):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.spread = math.radians(spread)
    data.color = color
    if size_y:
        data.shape = "RECTANGLE"
        data.size = size
        data.size_y = size_y
    else:
        data.shape = "DISK"
        data.size = size
    obj = bpy.data.objects.new(name, data)
    (col or scene.collection).objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


# big soft overhead/behind softbox -> long satin highlights on the crests + soft contact shadows
top_box = area("Top softbox", (-1.0, 12.0, 11.0), 4600, 6.0, (1.0, 0.99, 0.97), target=(0, 1.5, 0), size_y=4.0, col=hero_col)
# key from upper left front: gradient across the broad faces
area("Key left", (-12.0, -8.0, 8.0), 2600, 5.0, (1.0, 0.985, 0.97), target=(-2.0, 1.0, 1.5), col=hero_col)
# frontal fill so the faces facing the camera stay brand blue instead of navy
area("Front fill", (2.0, -18.0, 4.0), 260, 12.0, (0.96, 0.98, 1.0), target=(0, 2.0, 1.5), col=hero_col)
# rim from back-right: bright edge on the far crests
rim = area("Back right rim", (12.0, 16.0, 5.0), 3500, 5.0, (1.0, 0.97, 0.93), target=(2.0, 3.0, 1.0), col=hero_col)
# warm orange bounce cards low on the floor (the mockup's orange glow in the studio)
area("Warm bounce left", (-10.0, 1.0, 0.5), 650, 3.0, srgb_to_linear("FF9A55"), target=(-4.0, 1.0, 0.6), col=hero_col)
area("Warm bounce right", (12.0, 3.5, 0.6), 850, 3.0, srgb_to_linear("FF9A55"), target=(5.0, 5.0, 0.6), col=hero_col)
# wash on the back wall so the horizon melts to white
area("Back wall wash", (0.0, 20.0, 18.0), 14000, 40.0, (0.98, 0.99, 1.0), target=(0, WALL_Y, 8.0), spread=100, col=hero_col)


# light linking: the big top softbox only lights the studio (soft contact shadows), so the
# ribbon's upward faces don't wash out to lavender; the ribbon is shaped by key/fill/rim.
studio_only = bpy.data.collections.new("Studio surfaces (light link)")
studio_only.objects.link(cyc)
top_box.light_linking.receiver_collection = studio_only
# the rim only lights the ribbons (its glossy reflection made a hot spot on the floor)
ribbons_only = bpy.data.collections.new("Ribbons (light link)")
ribbons_only.objects.link(hero_ribbon)
ribbons_only.objects.link(back_ribbon)
rim.light_linking.receiver_collection = ribbons_only


# ---------------------------------------------------------------- hero camera
def make_camera(name, location, look_at, lens, shift_y=0.0):
    data = bpy.data.cameras.new(name)
    data.lens = lens
    data.sensor_fit = "HORIZONTAL"
    data.sensor_width = 36
    data.shift_y = shift_y
    cam = bpy.data.objects.new(name, data)
    scene.collection.objects.link(cam)
    cam.location = location
    cam.rotation_euler = (Vector(look_at) - Vector(location)).to_track_quat("-Z", "Y").to_euler()
    return cam


hero_cam = make_camera("Hero camera", (-0.6, -11.5, 3.4), (-0.6, 2.0, 2.0), 27, shift_y=-0.10)

# ---------------------------------------------------------------- about ribbon (separate collection)
about_col = bpy.data.collections.new("About")
scene.collection.children.link(about_col)


def about_spine(t):
    # enters from the bottom-right, arcs up and curls back out through the right edge
    # quarter-ish arc around the frame's bottom-right corner: top-right edge -> bottom edge
    a = math.radians(70 + 125 * t)
    r = 7.6 - 1.2 * t
    x = 5.4 + r * math.cos(a)
    z = -4.4 + r * math.sin(a)
    y = 2.0 - 3.2 * math.sin(math.pi * t)
    return (x, y, z)


about_ribbon = build_ribbon("About ribbon", about_spine, lambda t: 2.6,
                            lambda t: math.radians(115 + 55 * t), n=500, collection=about_col)
area("About key", (-4.0, -8.0, 7.0), 2600, 8.0, (1.0, 0.99, 0.97), target=(2.5, 0.0, 1.0), col=about_col)
area("About fill", (6.0, -10.0, -2.0), 700, 10.0, (0.96, 0.98, 1.0), target=(2.5, 0.0, 1.0), col=about_col)
area("About warm", (2.0, 4.0, -4.0), 1200, 5.0, srgb_to_linear("FFB27A"), target=(3.0, 0.0, 1.0), col=about_col)
about_cam = make_camera("About camera", (0.0, -14.0, 1.2), (0.0, 0.0, 1.2), 50)


# ---------------------------------------------------------------- render helpers
def show(col_visible):
    for col in (hero_col, about_col):
        hide = col is not col_visible
        col.hide_render = hide
        col.hide_viewport = hide


def render(shot):
    if shot == "hero":
        show(hero_col)
        scene.camera = hero_cam
        scene.render.resolution_x, scene.render.resolution_y = 2880, 2000
        scene.render.film_transparent = False
        scene.render.image_settings.color_mode = "RGB"
        name = "ribbon-hero.png"
    else:
        show(about_col)
        scene.camera = about_cam
        scene.render.resolution_x, scene.render.resolution_y = 1400, 1400
        scene.render.film_transparent = True
        scene.render.image_settings.color_mode = "RGBA"
        name = "ribbon-about.png"
    if PREVIEW:
        name = "_preview-" + name
    scene.render.filepath = str(OUT / name)
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"[concept01] rendered {name} in {time.time() - t0:.1f}s "
          f"({scene.render.resolution_x}x{scene.render.resolution_y} @ {scene.render.resolution_percentage}%, "
          f"{scene.cycles.samples} spp, device={scene.cycles.device})")


show(hero_col)
scene.camera = hero_cam
blend = OUT / "concept01-ribbon.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend), compress=True)
backup = OUT / "concept01-ribbon.blend1"
if backup.exists():
    backup.unlink()

if MODE in {"preview", "all", "hero"}:
    render("hero")
if MODE in {"preview", "all", "about"}:
    render("about")
