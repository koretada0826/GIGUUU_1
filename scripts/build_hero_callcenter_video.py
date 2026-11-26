"""Build the GIGUUU top-page hero video (call center, camera-projection 2.5D) in Blender.

The source is one still (assets/hero/source/callcenter-mock.png, 1811x868, a mockup with the
headline / lead / buttons burned in on the left). Nothing is painted in: the photo is projected from a
fixed "projector" camera onto four proxy layers, and a second camera moves a little in front of it, so
the layers slide past each other the way they would in a real slider / dolly shot.

  layer            geometry                                   depth (man = 1)
  wall   (far)     full-frame plane                           3.2   background, colleagues, monitors
  woman  (mid)     vertical board, soft rough silhouette      1.75
  man    (front)   vertical board, soft rough silhouette      1.0   includes the chair on the right
  desk   (near)    plane tilted back like a floor             0.75 (bottom edge) .. 1.45 (row 470)
                   (foreground monitor backs, tray, papers)

Usage (from the project root; Blender 5.2):

    BL=/Applications/Blender.app/Contents/MacOS/Blender
    $BL -b --factory-startup --python scripts/build_hero_callcenter_video.py -- plates      # textures + debug overlays only
    $BL -b --factory-startup --python scripts/build_hero_callcenter_video.py -- stills 1 150
    $BL -b --factory-startup --python scripts/build_hero_callcenter_video.py -- frames      # 288 PNG frames
    $BL -b --factory-startup --python scripts/build_hero_callcenter_video.py -- encode      # MP4 + WebM + poster

Work files (debug plates, stills, PNG frames, raw encodes) go to $HERO_WORK_DIR
(default /tmp/giguuu_hero_callcenter). Every mode except "encode" also saves
assets/hero/blender/callcenter-hero.blend (layer textures packed in).
Outputs of "encode": assets/hero/callcenter-hero.mp4 (H.264), callcenter-hero.webm (VP9),
callcenter-hero-poster.jpg (frame 1, JPEG quality 82).

Colour: every layer is an emission shader of the photo, view transform "Standard", no look,
exposure 0, dither 0 -> pixel values are the photo's own (no grading, no glow, no added noise).
"""

import math
import os
import shutil
import sys
import time
from pathlib import Path

import bpy
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "hero" / "source" / "callcenter-mock.png"
OUT = ROOT / "assets" / "hero"
BLEND = OUT / "blender" / "callcenter-hero.blend"
WORK = Path(os.environ.get("HERO_WORK_DIR", "/tmp/giguuu_hero_callcenter"))

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = ARGS[0] if ARGS else "stills"

# ---------------------------------------------------------------- constants
W, H = 1811, 868                 # source pixels
RES_X, RES_Y = 1920, 1080
FPS, FRAMES = 24, 288            # 12 s loop; frame 289 would equal frame 1
LOOP = FRAMES / FPS
SAMPLES = int(os.environ.get("HERO_SAMPLES", "64"))

SENSOR_H = 24.0                  # mm, vertical sensor fit
LENS = 60.0                      # mm -> tan(half vertical fov) = 0.2
TAN = SENSOR_H / 2.0 / LENS
OVERSCAN = 1.006                 # render lens 0.6 % longer than the projector: plate borders never show
SHIFT_PX = 90                    # frame the 16:9 render 90 source px right of centre (keeps the man's shoulder)

D_MAN = 3.5                      # m. Scene scale chosen so f/2.0 gives a natural amount of blur
D_WOMAN = D_MAN * 1.75
D_WALL = D_MAN * 3.2
DESK_ROWS = (868.0, 470.0)       # tilted desk plane: depth at the bottom row and at row 470
DESK_DEPTHS = (D_MAN * 0.75, D_MAN * 1.45)
FSTOP = 2.0

FRAME_W_AT_MAN = 2 * TAN * D_MAN / OVERSCAN * RES_X / RES_Y
DOLLY = 0.035 * D_MAN            # forward 3.5 % of the distance to the man (he grows ~3.6 %)
TRUCK = 0.015 * FRAME_W_AT_MAN   # sideways: the man slides 1.5 % of the frame width
BREATH = 0.003                   # +-0.3 % scale
SWAY = 0.002                     # +-0.2 % of the frame height

# rough silhouettes (source px). Slightly outside the subject; the soft edge extends further out.
MAN = [(1080, 163), (1110, 122), (1165, 96), (1250, 82), (1335, 85), (1405, 105), (1460, 150), (1497, 205),
       (1508, 270), (1504, 340), (1497, 400), (1524, 436), (1590, 448), (1660, 460), (1720, 455), (1811, 448),
       (1900, 448), (1900, 940), (868, 940), (872, 760), (903, 690), (948, 615), (1003, 560), (1058, 534),
       (1108, 519), (1143, 505), (1144, 488), (1136, 471), (1128, 457), (1110, 444), (1100, 425), (1106, 400),
       (1112, 378), (1108, 353), (1090, 331), (1064, 300), (1050, 255), (1056, 200)]
WOMAN = [(543, 235), (560, 174), (598, 126), (655, 103), (714, 110), (760, 158), (802, 238), (832, 313),
         (864, 383), (895, 453), (917, 510), (920, 580), (908, 665), (600, 665), (588, 520), (578, 470),
         (553, 420), (537, 380), (525, 330), (527, 280)]
DESK = [(-60, 520), (560, 520), (600, 525), (726, 530), (730, 645), (800, 642), (950, 650), (952, 776),
        (1000, 780), (1100, 792), (1250, 787), (1360, 777), (1460, 761), (1560, 747), (1612, 749),
        (1662, 774), (1712, 814), (1756, 868), (1762, 960), (-60, 960)]

# burned-in mockup copy (measured): glyph block and the two pill buttons (x0, x1, y0, y1)
COPY_BLOCK = (50, 660, 300, 615)
PILLS = [(71, 315, 641, 703), (342, 549, 641, 702)]
LAMP = (410, 396, 15)            # (x, y, r) small lamp highlight under the comma
PILL_SOURCE_DY = 110             # pills are cloned from the desk / partition texture 110 px below them
                                 # (far enough that the ring around each pill maps to clean pixels too)


# ---------------------------------------------------------------- numpy image helpers
def load_png(path):
    img = bpy.data.images.load(str(path), check_existing=False)
    w, h = img.size
    a = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    return a.reshape(h, w, 4)[::-1, :, :3].copy()     # top-down, sRGB-encoded values


def to_image(name, arr, non_color=False):
    """numpy (top-down) -> packed bpy image."""
    arr = np.asarray(arr, dtype=np.float32)
    if arr.ndim == 2:
        arr = np.repeat(arr[..., None], 3, axis=2)
    h, w = arr.shape[:2]
    rgba = np.concatenate([arr, np.ones((h, w, 1), np.float32)], axis=2)
    img = bpy.data.images.new(name, w, h, alpha=False)
    img.colorspace_settings.name = "Non-Color" if non_color else "sRGB"   # before the pixels: changing it regenerates the buffer
    flat = np.clip(rgba[::-1], 0, 1).ravel()
    img.pixels.foreach_set(flat)
    img.pack()
    check = np.empty(flat.size, np.float32)
    img.pixels.foreach_get(check)
    assert img.packed_file and np.abs(check - flat).max() < 1 / 255 + 1e-6, "image %s lost its pixels" % name
    return img


def save_png(arr, path):
    arr = np.asarray(arr, dtype=np.float32)
    if arr.ndim == 2:
        arr = np.repeat(arr[..., None], 3, axis=2)
    h, w = arr.shape[:2]
    rgba = np.concatenate([arr, np.ones((h, w, 1), np.float32)], axis=2)
    img = bpy.data.images.new("tmp_save", w, h, alpha=False)
    img.pixels.foreach_set(np.clip(rgba[::-1], 0, 1).ravel())
    img.filepath_raw = str(path)
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def box_blur(a, r, axis):
    if r <= 0:
        return a
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis, dtype=np.float64)
    n = a.shape[axis]
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return ((hi - lo) / (2 * r + 1)).astype(np.float32)


def gauss(a, sigma):
    r = max(1, int(round((math.sqrt(4 * sigma * sigma + 1) - 1) / 2)))   # 3 box passes ~ gaussian
    out = a.astype(np.float32)
    for _ in range(3):
        out = box_blur(box_blur(out, r, 0), r, 1)
    return out


def dilate(mask, r):
    return box_blur(box_blur(mask.astype(np.float32), r, 0), r, 1) > 1e-4


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def poly_mask(pts):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5
    inside = np.zeros((H, W), bool)
    for i in range(len(pts)):
        (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % len(pts)]
        if y1 == y2:
            continue
        cond = ((y1 <= yy) & (yy < y2)) | ((y2 <= yy) & (yy < y1))
        xint = x1 + (yy - y1) * (x2 - x1) / (y2 - y1)
        inside ^= cond & (xx < xint)
    return inside


def pill_mask(x0, x1, y0, y1, margin):
    x0, x1, y0, y1 = x0 - margin, x1 + margin, y0 - margin, y1 + margin
    r, cy = (y1 - y0) / 2.0, (y0 + y1) / 2.0
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5
    cx = np.clip(xx, x0 + r, x1 - r)
    return (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r


def upsample(a, shape):
    h, w = shape
    ys = np.clip((np.arange(h) + 0.5) / 2 - 0.5, 0, a.shape[0] - 1)
    xs = np.clip((np.arange(w) + 0.5) / 2 - 0.5, 0, a.shape[1] - 1)
    y0 = np.floor(ys).astype(int); y1 = np.minimum(y0 + 1, a.shape[0] - 1); fy = (ys - y0)[:, None, None]
    x0 = np.floor(xs).astype(int); x1 = np.minimum(x0 + 1, a.shape[1] - 1); fx = (xs - x0)[None, :, None]
    top = a[y0][:, x0] * (1 - fx) + a[y0][:, x1] * fx
    bot = a[y1][:, x0] * (1 - fx) + a[y1][:, x1] * fx
    return top * (1 - fy) + bot * fy


def pushpull(img, valid):
    """Fill the invalid pixels from the valid ones (multi-scale push-pull, i.e. a smooth membrane)."""
    levels = []
    c = img * valid[..., None]
    w = valid.astype(np.float32)
    while min(w.shape) > 2:
        levels.append((c, w))
        h2, w2 = (w.shape[0] + 1) // 2, (w.shape[1] + 1) // 2
        cp = np.pad(c, ((0, h2 * 2 - c.shape[0]), (0, w2 * 2 - c.shape[1]), (0, 0)))
        wp = np.pad(w, ((0, h2 * 2 - w.shape[0]), (0, w2 * 2 - w.shape[1])))
        c = cp.reshape(h2, 2, w2, 2, -1).sum((1, 3))
        w = wp.reshape(h2, 2, w2, 2).sum((1, 3))
        k = 1.0 / np.maximum(w, 1.0)
        c, w = c * k[..., None], w * k
    filled = c / np.maximum(w, 1e-6)[..., None]
    for c_l, w_l in reversed(levels):
        filled = c_l + (1 - w_l)[..., None] * upsample(filled, w_l.shape)
    return filled.astype(np.float32)


# ---------------------------------------------------------------- plates: remove the burned-in copy, layer textures
def build_plates(save_debug):
    src = load_png(SRC)
    assert src.shape[:2] == (H, W), src.shape
    mn = src.min(2)
    x0, x1, y0, y1 = COPY_BLOCK
    block = np.zeros((H, W), bool)
    block[y0:y1, x0:x1] = True
    # glyphs: white cores, plus clearly brighter pixels right next to them (anti-aliasing), grown by 3 px.
    # Highlights of the photo itself (the woman's phone, a lamp) are not near any core and stay untouched.
    local = gauss(mn, 6)
    cores = block & (mn > 0.82)
    glyph = cores | (block & dilate(cores, 6) & (mn > 0.35) & (mn - local > 0.05))
    glyph = dilate(glyph, 4) & dilate(block, 4)
    pills = np.zeros((H, W), bool)
    for p in PILLS:
        pills |= pill_mask(*p, margin=5)
    # the round lamp highlight that the headline's comma sits on: half of it would be left as a crescent
    yy, xx = np.mgrid[0:H, 0:W]
    glyph |= (xx - LAMP[0]) ** 2 + (yy - LAMP[1]) ** 2 <= LAMP[2] ** 2
    hole = glyph | pills

    # 1) glyph strokes: smooth fill from the surrounding (out-of-focus) monitors / partitions
    plate = pushpull(src, ~hole)
    # 2) pills (large): clone the dark desk texture from below, matched to the edges (seamless clone)
    dy = PILL_SOURCE_DY
    shifted = np.empty_like(src)
    shifted[:-dy] = src[dy:]
    shifted[-dy:] = src[-1:]
    shifted_ok = np.zeros((H, W), bool)
    shifted_ok[:-dy] = ~hole[dy:]
    diff = pushpull(src - shifted, ~hole & shifted_ok)
    plate[pills] = (shifted + diff)[pills]

    h_desk, h_man, h_woman = poly_mask(DESK), poly_mask(MAN), poly_mask(WOMAN)

    def alpha(h):       # opaque on the silhouette + 6 px, soft for ~11 px beyond
        return smoothstep(0.08, 0.55, gauss(dilate(h, 6).astype(np.float32), 8))

    a_desk, a_man, a_woman = alpha(h_desk), alpha(h_man), alpha(h_woman)
    # what each layer shows where a nearer layer moves away: its own surroundings, never a copy of the nearer object
    t_wall = pushpull(plate, ~dilate(h_desk | h_man | h_woman, 4))
    t_mid = pushpull(plate, ~dilate(h_desk, 4))      # man + woman boards (only the desk is in front of them)

    if save_debug:
        WORK.mkdir(parents=True, exist_ok=True)
        save_png(plate, WORK / "plate.png")
        save_png(t_wall, WORK / "plate-wall.png")
        save_png(t_mid, WORK / "plate-mid.png")
        ov = plate * 0.55
        ov[..., 0] += 0.45 * a_desk
        ov[..., 1] += 0.45 * a_woman
        ov[..., 2] += 0.45 * a_man
        save_png(ov, WORK / "masks-overlay.png")
        hv = src.copy()
        hv[hole] = hv[hole] * 0.3 + np.array([1, 0, 1]) * 0.7
        save_png(hv, WORK / "copy-hole.png")
        print("[plates] glyph px %d, pill px %d" % (int(glyph.sum()), int(pills.sum())))

    masks = np.stack([a_desk, a_woman, a_man], axis=2)
    return {
        "plate": to_image("plate_front", plate),
        "wall": to_image("plate_wall", t_wall),
        "mid": to_image("plate_mid", t_mid),
        "mask": to_image("layer_masks", masks, non_color=True),
    }


# ---------------------------------------------------------------- scene
def ray(x, y):
    """source px -> direction on the projector image plane (tan units)."""
    return (x - W / 2.0) / (H / 2.0) * TAN, (H / 2.0 - y) / (H / 2.0) * TAN


def world(x, y, d):
    u, v = ray(x, y)
    return np.array([u * d, d, v * d])


def desk_depth(y):
    (r0, r1), (d0, d1) = DESK_ROWS, DESK_DEPTHS
    inv = 1 / d0 + (y - r0) * (1 / d1 - 1 / d0) / (r1 - r0)       # 1/depth linear in the row -> a plane
    return 1.0 / inv


def make_layer(name, depth_fn, rect, grid, pivot, material):
    x0, x1, y0, y1 = rect
    nx, ny = grid
    pw = world(pivot[0], pivot[1], depth_fn(*pivot))
    verts, uvs = [], []
    for j in range(ny + 1):
        y = y0 + (y1 - y0) * j / ny
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx
            verts.append(tuple(world(x, y, depth_fn(x, y)) - pw))
            uvs.append((x / W, 1.0 - y / H))                    # projector UVs, fixed at rest
    faces = []
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append((a, a + nx + 1, a + nx + 2, a + 1))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    uv = mesh.uv_layers.new(name="projector")
    for loop in mesh.loops:
        uv.data[loop.index].uv = uvs[loop.vertex_index]
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    obj.location = tuple(pw)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def make_material(name, color_img, mask_img=None, channel=None):
    mat = bpy.data.materials.new(name)
    try:
        mat.use_nodes = True
    except Exception:
        pass
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    uvn = nt.nodes.new("ShaderNodeUVMap")
    uvn.uv_map = "projector"
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image, tex.interpolation, tex.extension = color_img, "Linear", "EXTEND"
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = 1.0
    nt.links.new(uvn.outputs["UV"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], emit.inputs["Color"])
    if mask_img is None:
        nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
    else:
        mtex = nt.nodes.new("ShaderNodeTexImage")
        mtex.image, mtex.interpolation, mtex.extension = mask_img, "Linear", "EXTEND"
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        transp = nt.nodes.new("ShaderNodeBsdfTransparent")
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(uvn.outputs["UV"], mtex.inputs["Vector"])
        nt.links.new(mtex.outputs["Color"], sep.inputs["Color"])
        nt.links.new(sep.outputs[channel], mix.inputs["Fac"])
        nt.links.new(transp.outputs["BSDF"], mix.inputs[1])
        nt.links.new(emit.outputs["Emission"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    mat.surface_render_method = "DITHERED"
    return mat


def cam_ease(t):          # 0 -> 1 (t = 6 s) -> 0 (t = 12 s), ease in/out, seamless
    return 0.5 - 0.5 * math.cos(2 * math.pi * t / LOOP)


def focus_weight(t):      # 0 = man, 1 = woman: hold, 3 s pull, hold, 3 s pull back
    t %= LOOP
    if t < 1.5 or t >= 10.5:
        return 0.0
    if t < 4.5:
        return 0.5 - 0.5 * math.cos(math.pi * (t - 1.5) / 3.0)
    if t < 7.5:
        return 1.0
    return 0.5 + 0.5 * math.cos(math.pi * (t - 7.5) / 3.0)


def build_scene(imgs):
    scene = bpy.context.scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"

    # projector (reference only: UVs are computed from it) and render camera
    def camera(name, lens, shift_x):
        data = bpy.data.cameras.new(name)
        data.sensor_fit, data.sensor_height, data.sensor_width = "VERTICAL", SENSOR_H, SENSOR_H * W / H
        data.lens, data.shift_x, data.clip_start, data.clip_end = lens, shift_x, 0.1, 100.0
        obj = bpy.data.objects.new(name, data)
        obj.rotation_euler = (math.radians(90), 0, 0)          # look along +Y, +Z up
        scene.collection.objects.link(obj)
        return obj

    camera("Projector", LENS, 0.0)
    cam = camera("Camera", LENS * OVERSCAN, SHIFT_PX / (H / OVERSCAN))
    scene.camera = cam
    dof = cam.data.dof
    dof.use_dof, dof.aperture_fstop, dof.aperture_blades = True, FSTOP, 0

    m_wall = make_material("wall", imgs["wall"])
    m_desk = make_material("desk", imgs["plate"], imgs["mask"], "Red")
    m_woman = make_material("woman", imgs["mid"], imgs["mask"], "Green")
    m_man = make_material("man", imgs["mid"], imgs["mask"], "Blue")
    full = (-120, W + 120, -100, H + 100)
    make_layer("L_wall", lambda x, y: D_WALL, full, (1, 1), (W / 2, H / 2), m_wall)
    make_layer("L_desk", lambda x, y: desk_depth(y), (-120, W + 120, 380, H + 100), (40, 48), (W / 2, H), m_desk)
    woman = make_layer("L_woman", lambda x, y: D_WOMAN, full, (1, 1), (720, 650), m_woman)
    man = make_layer("L_man", lambda x, y: D_MAN, full, (1, 1), (1400, H), m_man)

    sway_w, sway_m = (SWAY * 2 * TAN * d / OVERSCAN for d in (D_WOMAN, D_MAN))
    base_w, base_m = woman.location.copy(), man.location.copy()
    for f in range(1, FRAMES + 1):
        t = (f - 1) / FPS
        e = cam_ease(t)
        cam.location = (TRUCK * e, DOLLY * e, 0.0)
        cam.keyframe_insert("location", frame=f)
        w = focus_weight(t)
        dm, dw = D_MAN - DOLLY * e, D_WOMAN - DOLLY * e
        dof.focus_distance = 1.0 / ((1 - w) / dm + w / dw)      # interpolate in dioptres
        dof.keyframe_insert("focus_distance", frame=f)
        ph = 2 * math.pi * t / LOOP
        s = 1 + BREATH * math.sin(3 * ph)                       # man: breath 4 s, sway 6 s
        man.scale = (s, 1, s)
        man.location = (base_m.x, base_m.y, base_m.z + sway_m * math.sin(2 * ph + 0.9))
        s = 1 + BREATH * math.sin(4 * ph + 1.7)                 # woman: breath 3 s, sway 12 s
        woman.scale = (s, 1, s)
        woman.location = (base_w.x, base_w.y, base_w.z + sway_w * math.sin(ph + 2.3))
        for obj in (man, woman):
            obj.keyframe_insert("scale", frame=f)
            obj.keyframe_insert("location", frame=f)

    world_ = bpy.data.worlds.new("black")
    try:
        world_.use_nodes = True
    except Exception:
        pass
    bg = world_.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0, 0, 0, 1)
        bg.inputs["Strength"].default_value = 0.0
    scene.world = world_

    r = scene.render
    r.engine = "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y, r.resolution_percentage = RES_X, RES_Y, 100
    r.fps, r.fps_base = FPS, 1.0
    scene.frame_start, scene.frame_end = 1, FRAMES
    r.film_transparent = False
    r.filter_size = 1.0
    r.dither_intensity = 0.0
    r.use_motion_blur = False
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGB"
    r.image_settings.color_depth = "8"
    r.image_settings.compression = 15
    ee = scene.eevee
    ee.taa_render_samples = SAMPLES
    ee.use_bokeh_jittered = True     # accumulate real lens positions: the post-process DOF drew a dark line
                                     # along the outer edge of the soft masks when the man was out of focus
    ee.bokeh_max_size = 100.0
    ee.use_overscan, ee.overscan_size = True, 3.0
    ee.use_shadows = False
    ee.use_raytracing = False
    scene.display_settings.display_device = "sRGB"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0
    return scene


def save_blend():
    BLEND.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.preferences.filepaths.save_version = 0      # no callcenter-hero.blend1 backup next to it
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
    print("[blend] saved %s (%.1f MB)" % (BLEND, BLEND.stat().st_size / 1e6))


# ---------------------------------------------------------------- encode (VSE: PNG frames -> MP4 / WebM, poster)
def encode():
    frames = WORK / "frames"
    first = frames / "frame_0001.png"
    assert first.exists(), "render the frames first"
    scene = bpy.data.scenes.new("encode")
    r = scene.render
    r.resolution_x, r.resolution_y, r.resolution_percentage = RES_X, RES_Y, 100
    r.fps, r.fps_base = FPS, 1.0
    scene.frame_start, scene.frame_end = 1, FRAMES
    scene.display_settings.display_device = "sRGB"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    r.dither_intensity = 0.0
    se = scene.sequence_editor_create()
    strip = se.strips.new_image(name="frames", filepath=str(first), channel=1, frame_start=1)
    for i in range(2, FRAMES + 1):
        strip.elements.append("frame_%04d.png" % i)
    strip.colorspace_settings.name = "sRGB"
    r.use_sequencer, r.use_compositing = True, False

    def run(fmt, codec, crf, dest):
        tmpdir = WORK / ("enc_" + dest.suffix[1:])
        shutil.rmtree(tmpdir, ignore_errors=True)
        tmpdir.mkdir(parents=True)
        r.image_settings.media_type = "VIDEO"
        r.image_settings.file_format = "FFMPEG"
        r.image_settings.color_mode = "RGB"
        ff = r.ffmpeg
        ff.format, ff.codec = fmt, codec
        ff.constant_rate_factor = "CUSTOM"
        ff.custom_constant_rate_factor = crf
        ff.ffmpeg_preset = "BEST"
        ff.gopsize = 48
        ff.use_max_b_frames, ff.max_b_frames = (True, 2) if codec == "H264" else (False, 0)
        ff.audio_codec = "NONE"
        r.filepath = str(tmpdir / ("hero" + dest.suffix))
        t0 = time.time()
        bpy.ops.render.render(animation=True, scene=scene.name)
        made = sorted(tmpdir.iterdir())
        assert made, "no %s written" % dest.suffix
        shutil.copyfile(made[0], dest)
        print("[encode] %s %s crf %d -> %s (%.2f MB, %.0fs)" % (fmt, codec, crf, dest, dest.stat().st_size / 1e6, time.time() - t0))

    crf_mp4 = int(os.environ.get("HERO_CRF_MP4", "23"))
    crf_webm = int(os.environ.get("HERO_CRF_WEBM", "33"))
    run("MPEG4", "H264", crf_mp4, OUT / "callcenter-hero.mp4")
    try:
        run("WEBM", "WEBM", crf_webm, OUT / "callcenter-hero.webm")
    except Exception as exc:                                      # report and keep the MP4
        print("[encode] WebM failed:", exc)

    img = bpy.data.images.load(str(first))
    s = bpy.data.scenes.new("poster")
    s.display_settings.display_device = "sRGB"
    s.view_settings.view_transform = "Standard"
    s.view_settings.look = "None"
    s.render.image_settings.file_format = "JPEG"
    s.render.image_settings.color_mode = "RGB"
    s.render.image_settings.quality = 82
    poster = OUT / "callcenter-hero-poster.jpg"
    img.save_render(str(poster), scene=s)
    print("[encode] poster %s (%.0f KB)" % (poster, poster.stat().st_size / 1e3))


# ---------------------------------------------------------------- main
def main():
    WORK.mkdir(parents=True, exist_ok=True)
    if MODE == "encode":
        encode()
        return
    t0 = time.time()
    imgs = build_plates(save_debug=MODE in ("plates", "stills"))
    print("[plates] %.1fs" % (time.time() - t0))
    if MODE == "plates":
        return
    scene = build_scene(imgs)
    save_blend()
    if MODE == "stills":
        for f in [int(a) for a in ARGS[1:]] or [1, 150]:
            scene.frame_set(f)
            scene.render.filepath = str(WORK / ("still_%04d.png" % f))
            t1 = time.time()
            bpy.ops.render.render(write_still=True)
            print("[still] frame %d %.1fs -> %s" % (f, time.time() - t1, scene.render.filepath))
    elif MODE == "frames":
        (WORK / "frames").mkdir(parents=True, exist_ok=True)
        scene.render.filepath = str(WORK / "frames" / "frame_")
        t1 = time.time()
        bpy.ops.render.render(animation=True)
        print("[frames] %d frames %.0fs" % (FRAMES, time.time() - t1))
    else:
        raise SystemExit("unknown mode %r" % MODE)


main()
