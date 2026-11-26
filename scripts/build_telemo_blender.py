"""Build and render the looping TELEMO hero (3D extruded type in a white studio) in Blender.

Usage (from the project root):

    # 1 still (loop frame 1) -> /tmp/giguuu_telemo_blender_frames/preview.png
    blender -b --python scripts/build_telemo_blender.py -- preview

    # optional: preview a specific frame
    blender -b --python scripts/build_telemo_blender.py -- preview 37

    # full loop (frames 1..144) -> /tmp/giguuu_telemo_blender_frames/frame_0001.png ...
    blender -b --python scripts/build_telemo_blender.py -- animation

Then encode (frame 145 would equal frame 1, so 1..144 loops seamlessly):

    ffmpeg -y -framerate 24 -i /tmp/giguuu_telemo_blender_frames/frame_%04d.png \
      -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart -an \
      assets/telemo-blender/telemo-hero-loop.mp4
    cp /tmp/giguuu_telemo_blender_frames/frame_0001.png assets/telemo-blender/telemo-poster.png
    ffmpeg -y -i assets/telemo-blender/telemo-poster.png -q:v 3 assets/telemo-blender/telemo-poster.jpg

Both modes also save assets/telemo-blender/telemo-hero.blend.
Output: 1920x720, 24fps, 144 frames (6 s), Cycles on Metal GPU (falls back to CPU).
View transform: "Khronos PBR Neutral" (filmic-type tone mapper; AgX washed the blue to lavender
#6089c9 and the orange to salmon). Exposure -1.0.
Tuning overrides (env): TELEMO_VIEW, TELEMO_LOOK, TELEMO_EXPOSURE, TELEMO_SCALE (render %).
Camera orbit / key light motion are sin/cos of t = 2*pi*(frame-1)/144, keyed on every frame.
"""

import math
import os
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "telemo-blender"
OUT.mkdir(parents=True, exist_ok=True)
FRAMES = Path("/tmp/giguuu_telemo_blender_frames")
FRAMES.mkdir(parents=True, exist_ok=True)

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = ARGS[0] if ARGS and ARGS[0] in {"preview", "animation"} else "preview"
PREVIEW_FRAME = int(ARGS[1]) if MODE == "preview" and len(ARGS) > 1 else 1

FPS = 24
LOOP_FRAMES = 144  # 6 s; frame LOOP_FRAMES + 1 == frame 1
RES_X, RES_Y = 1920, 720


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
scene.cycles.samples = 160 if MODE == "preview" else 128
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.01
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 8
scene.cycles.glossy_bounces = 4
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.cycles.seed = 7  # fixed noise pattern -> less shimmer between frames
scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.render.fps = FPS
scene.frame_start = 1
scene.frame_end = LOOP_FRAMES
scene.view_settings.view_transform = os.environ.get("TELEMO_VIEW", "Khronos PBR Neutral")
scene.view_settings.look = os.environ.get("TELEMO_LOOK", "None")
scene.view_settings.exposure = float(os.environ.get("TELEMO_EXPOSURE", "-1.0"))
scene.render.resolution_percentage = int(os.environ.get("TELEMO_SCALE", "100"))

world = bpy.data.worlds.new("Studio world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.8, 0.82, 0.86, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.2


def principled(name, color, roughness, coat=0.0, spec=0.5, spec_tint=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Specular IOR Level"].default_value = spec
    if spec_tint:
        bsdf.inputs["Specular Tint"].default_value = (*spec_tint, 1)
    if coat:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.12
    mat.diffuse_color = (*color, 1)
    return mat


FLOOR_GLOSS = 0.1
BLUE = srgb_to_linear("1670E6")
ORANGE = srgb_to_linear("FF8C1C")
blue = principled("TELEMO blue face", BLUE, 0.3, coat=0.6)
orange = principled("TELEMO orange sides", ORANGE, 0.45, spec=0.0)
# Principled's Fresnel turns grazing-angle sides white/pink; add an orange-tinted gloss instead.
_nt = orange.node_tree
_gloss = _nt.nodes.new("ShaderNodeBsdfGlossy")
_gloss.inputs["Color"].default_value = (*ORANGE, 1)
_gloss.inputs["Roughness"].default_value = 0.25
_mix = _nt.nodes.new("ShaderNodeMixShader")
_mix.inputs["Fac"].default_value = 0.22
_out = _nt.nodes["Material Output"]
_nt.links.new(_nt.nodes["Principled BSDF"].outputs[0], _mix.inputs[1])
_nt.links.new(_gloss.outputs[0], _mix.inputs[2])
_nt.links.new(_mix.outputs[0], _out.inputs["Surface"])
studio = principled("Studio white cyc", (0.82, 0.83, 0.85), 0.6, spec=0.0)
# faint, Fresnel-free reflection on the floor (Principled's grazing Fresnel made it a mirror)
_nt = studio.node_tree
_gloss = _nt.nodes.new("ShaderNodeBsdfGlossy")
_gloss.inputs["Color"].default_value = (0.9, 0.91, 0.93, 1)
_gloss.inputs["Roughness"].default_value = 0.12
_mix = _nt.nodes.new("ShaderNodeMixShader")
_mix.inputs["Fac"].default_value = FLOOR_GLOSS
_nt.links.new(_nt.nodes["Principled BSDF"].outputs[0], _mix.inputs[1])
_nt.links.new(_gloss.outputs[0], _mix.inputs[2])
_nt.links.new(_mix.outputs[0], _nt.nodes["Material Output"].inputs["Surface"])

# ---------------------------------------------------------------- type
LETTER_SIZE = 2.2
DEPTH = 0.8  # total extrusion depth (letter cap height ~1.6)
bpy.ops.object.text_add(location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
text = bpy.context.object
text.data.body = "TELEMO"
font = Path("/System/Library/Fonts/Supplemental/Arial Black.ttf")
if font.exists():
    text.data.font = bpy.data.fonts.load(str(font))
text.data.size = LETTER_SIZE
text.data.space_character = 1.0
text.data.extrude = DEPTH / 2
text.data.bevel_depth = 0.014
text.data.bevel_resolution = 2
text.data.resolution_u = 24
bpy.ops.object.convert(target="MESH")
word = bpy.context.object
word.data.materials.append(blue)
word.data.materials.append(orange)
for face in word.data.polygons:
    face.material_index = 0 if face.normal.z > 0.6 else 1
for face in word.data.polygons:
    face.use_smooth = False
# bake the 90deg X rotation into the mesh so letters stand on the floor
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.remove_doubles(threshold=0.0005)  # weld caps to sides so each glyph is one piece
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")
letters = sorted(bpy.context.selected_objects, key=lambda o: min((o.matrix_world @ Vector(c)).x for c in o.bound_box))

assert len(letters) == 6, f"expected 6 glyphs, got {len(letters)}"
all_pts = [o.matrix_world @ v.co for o in letters for v in o.data.vertices]
min_x = min(p.x for p in all_pts)
max_x = max(p.x for p in all_pts)
min_z = min(p.z for p in all_pts)
max_z = max(p.z for p in all_pts)
WIDTH = max_x - min_x
HEIGHT = max_z - min_z
cx = (min_x + max_x) / 2

ARC_FORWARD = 0.5  # end letters sit slightly closer to camera (gentle concave arc)
ARC_YAW = math.radians(20.0)  # end letters turn their outer side toward camera
for o in letters:
    o.select_set(False)
for i, o in enumerate(letters):
    o.name = f"TELEMO letter {i + 1}"
    pts = [o.matrix_world @ v.co for v in o.data.vertices]
    lx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2
    ly = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    # origin at the letter's bottom centre, then stand it on z=0
    for v in o.data.vertices:
        v.co.x -= lx
        v.co.y -= ly
        v.co.z -= min_z
    x = lx - cx
    u = x / (WIDTH / 2)
    o.location = (x, -ARC_FORWARD * u * u, 0)
    o.rotation_euler = (0, 0, -ARC_YAW * u)

# ---------------------------------------------------------------- studio cyc (floor + curved wall)
WALL_Y = 9.0
CURVE_R = 4.0
verts, faces = [], []
profile = [(-30.0, 0.0), (WALL_Y - CURVE_R, 0.0)]
for k in range(1, 25):
    a = (k / 24) * (math.pi / 2)
    profile.append((WALL_Y - CURVE_R + math.sin(a) * CURVE_R, CURVE_R - math.cos(a) * CURVE_R))
profile.append((WALL_Y, 30.0))
for x in (-60.0, 60.0):
    for y, z in profile:
        verts.append((x, y, z))
n = len(profile)
for k in range(n - 1):
    faces.append((k, k + 1, n + k + 1, n + k))
mesh = bpy.data.meshes.new("Cyc")
mesh.from_pydata(verts, [], faces)
for p in mesh.polygons:
    p.use_smooth = True
cyc = bpy.data.objects.new("Studio cyclorama", mesh)
scene.collection.objects.link(cyc)
cyc.data.materials.append(studio)

# ---------------------------------------------------------------- lights
TARGET = Vector((0, 0, HEIGHT * 0.45))


def area(name, location, energy, size, color=(1, 1, 1), target=TARGET, size_y=None, spread=180):
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
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


KEY_BASE = Vector((-6.5, -5.5, 6.0))
key = area("Key softbox upper left", KEY_BASE, 1500, 2.5, (1.0, 0.98, 0.95))
fill = area("Front fill", (3.0, -14.0, 3.5), 160, 9.0, (0.97, 0.98, 1.0))
window = area("Window light on cyc", (-14.0, 2.0, 10.0), 3000, 4.0, (1.0, 0.97, 0.92),
              target=Vector((-3.0, WALL_Y, 4.0)), size_y=9.0, spread=35)
# high, slightly frontal softbox that lights only the studio: soft contact shadows under/behind the type
shadow_caster = area("Floor shadow softbox", (-3.0, -3.0, 9.0), 3200, 3.0, (1.0, 0.99, 0.97), target=Vector((0, 1.5, 0)))
back = area("Back wall wash", (8.0, 0.0, 9.0), 3000, 14.0, (0.96, 0.98, 1.0), target=Vector((8.0, WALL_Y, 7.0)))

# Light linking: the key shapes the letters only; the shadow caster lights only the studio,
# so the floor shadows stay crisp-soft instead of being washed out by the key.
letters_col = bpy.data.collections.new("TELEMO letters")
studio_col = bpy.data.collections.new("Studio surfaces")
for o in letters:
    letters_col.objects.link(o)
studio_col.objects.link(cyc)
key.light_linking.receiver_collection = letters_col
shadow_caster.light_linking.receiver_collection = studio_col

# ---------------------------------------------------------------- camera
cam_data = bpy.data.cameras.new("Hero camera")
cam_data.lens = 35
cam_data.sensor_fit = "HORIZONTAL"
cam_data.sensor_width = 36
camera = bpy.data.objects.new("Slow orbit camera", cam_data)
scene.collection.objects.link(camera)
scene.camera = camera

CAM_DIST = 9.8
CAM_HEIGHT = 0.95
CAM_BASE_YAW = math.radians(-11.0)  # slightly from the left
ORBIT_YAW = math.radians(4.0)
LOOK_AT = Vector((0, 0.0, HEIGHT * 0.42))


def pose(frame):
    t = 2 * math.pi * ((frame - 1) % LOOP_FRAMES) / LOOP_FRAMES
    yaw = CAM_BASE_YAW + ORBIT_YAW * math.sin(t)
    h = CAM_HEIGHT + 0.05 * math.sin(2 * t)
    d = CAM_DIST + 0.2 * math.cos(t)
    camera.location = (math.sin(yaw) * d, -math.cos(yaw) * d, h)
    camera.rotation_euler = (LOOK_AT - camera.location).to_track_quat("-Z", "Y").to_euler()
    key.location = KEY_BASE + Vector((0.6 * math.sin(t + 0.8), 0.0, 0.25 * math.cos(t)))
    key.rotation_euler = (TARGET - key.location).to_track_quat("-Z", "Y").to_euler()


for f in range(1, LOOP_FRAMES + 2):
    pose(f)
    camera.keyframe_insert("location", frame=f)
    camera.keyframe_insert("rotation_euler", frame=f)
    key.keyframe_insert("location", frame=f)
    key.keyframe_insert("rotation_euler", frame=f)
for obj in (camera, key):
    for fc in obj.animation_data.action.fcurves if hasattr(obj.animation_data.action, "fcurves") else []:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"

scene.frame_set(PREVIEW_FRAME if MODE == "preview" else 1)
blend = OUT / "telemo-hero.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend), compress=True)
backup = OUT / "telemo-hero.blend1"
if backup.exists():
    backup.unlink()
print(f"TELEMO bounds: width={WIDTH:.3f}, height={HEIGHT:.3f}, depth={DEPTH:.3f}")

if MODE == "preview":
    scene.frame_set(PREVIEW_FRAME)
    scene.render.filepath = str(FRAMES / "preview.png")
    bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = str(FRAMES / "frame_")
    bpy.ops.render.render(animation=True)
