"""Render a transparent, physically lit TELEMO sign for the existing hero.

blender -b --python scripts/build_telemo_realistic_wordmark.py -- --preview
blender -b --python scripts/build_telemo_realistic_wordmark.py
"""

from pathlib import Path
import math
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/telemo-blender"
PREVIEW = "--preview" in sys.argv
OUT.mkdir(parents=True, exist_ok=True)
STEM = "telemo-wordmark-realistic-teal-v2"


def linear_color(hex_color):
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb)


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for device in prefs.devices:
        device.use = device.type == "METAL"
    scene.cycles.device = "GPU" if any(d.use for d in prefs.devices) else "CPU"
except Exception:
    scene.cycles.device = "CPU"
scene.cycles.samples = 40 if PREVIEW else 192
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = .025 if PREVIEW else .008
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.cycles.glossy_bounces = 4
scene.cycles.seed = 24
scene.render.resolution_x = 2560
scene.render.resolution_y = 720
scene.render.resolution_percentage = 50 if PREVIEW else 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = 0


def material(name, color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*linear_color(color), 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return mat, shader


# Calibrated for the supplied screenshot's sRGB teal, #01657B, under these lights.
face, face_shader = material("Teal enamel, reference #01657B", "004953", .55, .23)
face_shader.inputs["Coat Weight"].default_value = .16
face_shader.inputs["Coat Roughness"].default_value = .2
noise = face.node_tree.nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 190
noise.inputs["Detail"].default_value = 2
bump = face.node_tree.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = .035
bump.inputs["Distance"].default_value = .001
face.node_tree.links.new(noise.outputs["Fac"], bump.inputs["Height"])
face.node_tree.links.new(bump.outputs["Normal"], face_shader.inputs["Normal"])

metal, metal_shader = material("Satin aluminium returns", "C3D3D7", .78, .3)
anisotropy = metal_shader.inputs.get("Anisotropic IOR Level")
if anisotropy:
    anisotropy.default_value = .35
coords = metal.node_tree.nodes.new("ShaderNodeTexCoord")
stretch = metal.node_tree.nodes.new("ShaderNodeVectorMath")
stretch.operation = "MULTIPLY"
stretch.inputs[1].default_value = (3, 220, 3)
metal.node_tree.links.new(coords.outputs["Generated"], stretch.inputs[0])
grain = metal.node_tree.nodes.new("ShaderNodeTexNoise")
grain.inputs["Scale"].default_value = 16
grain.inputs["Detail"].default_value = 2
metal.node_tree.links.new(stretch.outputs[0], grain.inputs["Vector"])
metal_bump = metal.node_tree.nodes.new("ShaderNodeBump")
metal_bump.inputs["Strength"].default_value = .065
metal_bump.inputs["Distance"].default_value = .0015
metal.node_tree.links.new(grain.outputs["Fac"], metal_bump.inputs["Height"])
metal.node_tree.links.new(metal_bump.outputs["Normal"], metal_shader.inputs["Normal"])

font = bpy.data.fonts.load("/System/Library/Fonts/Supplemental/Arial Black.ttf")
letters = []
cursor = 0
for index, character in enumerate("TELEMO"):
    curve = bpy.data.curves.new(f"Sign letter {character}", "FONT")
    curve.font = font
    curve.body = character
    curve.size = 2.7
    curve.extrude = .32
    curve.bevel_depth = .017
    curve.bevel_resolution = 5
    curve.resolution_u = 24
    original = bpy.data.objects.new(f"Letter {index + 1}", curve)
    scene.collection.objects.link(original)
    mesh = bpy.data.meshes.new_from_object(original.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    mesh.transform(Matrix.Rotation(math.pi / 2, 4, "X"))
    mesh.transform(Matrix.Diagonal((.78, 1, 1, 1)))
    bpy.data.objects.remove(original, do_unlink=True)
    bpy.data.curves.remove(curve)
    low = Vector(tuple(min(v.co[axis] for v in mesh.vertices) for axis in range(3)))
    high = Vector(tuple(max(v.co[axis] for v in mesh.vertices) for axis in range(3)))
    mesh.transform(Matrix.Translation((-low.x, 0, -low.z)))
    obj = bpy.data.objects.new(f"TELEMO {character} {index + 1}", mesh)
    scene.collection.objects.link(obj)
    obj.location = (cursor, 0, .018)
    mesh.materials.append(face)
    mesh.materials.append(metal)
    for polygon in mesh.polygons:
        polygon.material_index = 0 if polygon.normal.y < -.65 else 1
        polygon.use_smooth = .01 < abs(polygon.normal.y) < .98 or (character == "O" and abs(polygon.normal.y) < .98)
    mesh.set_sharp_from_angle(angle=math.radians(35))
    letters.append(obj)
    cursor += high.x - low.x + .1
word_width = cursor - .1
for obj in letters:
    obj.location.x -= word_width / 2

# A real ground plane catches only contact shadows in the transparent render.
floor_mat, _ = material("Shadow catcher cyan floor", "60CDE7", 0, .7)
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
floor = bpy.context.object
floor.name = "Transparent contact shadow"
floor.data.materials.append(floor_mat)
floor.is_shadow_catcher = True

world = bpy.data.worlds.new("Neutral cool studio")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (.72, .83, .87, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = .18
scene.world = world


def area(name, location, power, size, size_y, target=(0, 0, 1)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.shape = "RECTANGLE"
    data.size = size
    data.size_y = size_y
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


area("Large softbox above left", (-4, -5, 8), 1000, 7, 4)
area("Gentle frontal fill", (4, -8, 3.5), 160, 7, 5)
area("Rear edge light", (1, 4, 7), 1700, 9, 3)
area("Long overhead reflection", (0, -2, 6), 500, 9, .7)

# The reflected dark studio card gives the enamel a natural change in tone.
card_mat, _ = material("Dark studio reflection card", "04181D", 0, 1)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -9, 1.0), rotation=(math.pi / 2, 0, 0))
card = bpy.context.object
card.name = "Dark reflection card (not visible to camera)"
card.scale = (32, 5, 1)
card.data.materials.append(card_mat)
card.visible_camera = False
card.visible_diffuse = False
card.visible_shadow = False
card.visible_transmission = False

camera_data = bpy.data.cameras.new("Product photograph camera")
camera_data.type = "ORTHO"
camera_data.ortho_scale = 13
camera = bpy.data.objects.new("Product photograph camera", camera_data)
scene.collection.objects.link(camera)
camera.location = (-7, -27, 7.6)
camera.rotation_euler = (Vector((0, 0, 1)) - camera.location).to_track_quat("-Z", "Y").to_euler()
scene.camera = camera
bpy.context.view_layer.update()

# Fit the actual geometry, reserving a little room below it for the contact shadow.
points = [obj.matrix_world @ v.co for obj in letters for v in obj.data.vertices]
local = [camera.matrix_world.inverted() @ p for p in points]
center_x = (min(p.x for p in local) + max(p.x for p in local)) / 2
center_y = (min(p.y for p in local) + max(p.y for p in local)) / 2 - .1
camera.location += camera.matrix_world.to_quaternion() @ Vector((center_x, center_y, 0))
bpy.context.view_layer.update()
projected = [world_to_camera_view(scene, camera, p) for p in points]
span_x = max(p.x for p in projected) - min(p.x for p in projected)
span_y = max(p.y for p in projected) - min(p.y for p in projected)
camera_data.ortho_scale *= max(span_x / .95, span_y / .90)
bpy.context.view_layer.update()

if not PREVIEW:
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f"{STEM}.blend"), compress=True)
scene.render.filepath = str(OUT / f"{STEM}{'-preview' if PREVIEW else ''}.png")
bpy.ops.render.render(write_still=True)
if not PREVIEW:
    # Retain the foreground silhouette while feathering only the shadow pass.
    # This avoids a rectangular edge where the transparent studio floor is cropped.
    beauty = bpy.data.images.load(scene.render.filepath)
    width, height = beauty.size
    pixels = np.empty(width * height * 4, dtype=np.float32)
    beauty.pixels.foreach_get(pixels)
    pixels = pixels.reshape(height, width, 4)
    floor.visible_camera = False
    scene.cycles.samples = 40
    foreground_path = ROOT / "output/campaign-realistic-logo/wordmark-foreground.png"
    foreground_path.parent.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(foreground_path)
    bpy.ops.render.render(write_still=True)
    foreground = bpy.data.images.load(str(foreground_path))
    silhouette = np.empty(width * height * 4, dtype=np.float32)
    foreground.pixels.foreach_get(silhouette)
    silhouette = silhouette.reshape(height, width, 4)[..., 3]
    x = (np.arange(width, dtype=np.float32) + .5) / width
    y = (np.arange(height, dtype=np.float32) + .5) / height

    def smooth(value):
        t = np.clip(value, 0, 1)
        return t * t * (3 - 2 * t)

    feather = smooth(x / .07)[None, :] * smooth((1 - x) / .07)[None, :]
    feather = feather * smooth(y / .16)[:, None] * smooth((1 - y) / .035)[:, None]
    shadow_alpha = np.maximum(pixels[..., 3] - silhouette, 0)
    pixels[..., 3] = silhouette + shadow_alpha * feather
    exported = bpy.data.images.new(f"{STEM} web export", width, height, alpha=True)
    exported.pixels.foreach_set(np.ascontiguousarray(pixels).ravel())
    exported.filepath_raw = str(OUT / f"{STEM}.png")
    exported.file_format = "PNG"
    exported.save()
    exported.file_format = "WEBP"
    exported.save(filepath=str(OUT / f"{STEM}.webp"), quality=94)
print(f"[wordmark] {scene.render.filepath}; device={scene.cycles.device}", flush=True)
