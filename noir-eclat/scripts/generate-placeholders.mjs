// Generates dark, luxurious placeholder PNGs so the project runs before the
// real photography is dropped in. Replace files in /public/images with the
// same names to swap assets — no code changes needed.
//
// Pure Node (zlib) PNG encoder — no dependencies.
import zlib from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images");
mkdirSync(OUT, { recursive: true });

// ---- minimal PNG encoder ---------------------------------------------------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // rest 0
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- drawing helpers -------------------------------------------------------
const clamp = (v) => Math.max(0, Math.min(255, v | 0));
function makeCanvas(w, h) {
  return { w, h, buf: Buffer.alloc(w * h * 4) };
}
function setPx(cv, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= cv.w || y >= cv.h) return;
  const i = (y * cv.w + x) * 4;
  const ea = a / 255;
  const ia = 1 - ea;
  cv.buf[i] = clamp(cv.buf[i] * ia + r * ea);
  cv.buf[i + 1] = clamp(cv.buf[i + 1] * ia + g * ea);
  cv.buf[i + 2] = clamp(cv.buf[i + 2] * ia + b * ea);
  cv.buf[i + 3] = clamp(Math.max(cv.buf[i + 3], a));
}
function save(name, cv) {
  writeFileSync(join(OUT, name), encodePNG(cv.w, cv.h, cv.buf));
  console.log("✓", name, `${cv.w}x${cv.h}`);
}
// deterministic pseudo-random
let seed = 1337;
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

// ---- ring cutout (transparent bg) -----------------------------------------
function ringCutout(name, opts) {
  const S = 1000;
  const cv = makeCanvas(S, S);
  const cx = S / 2;
  const cy = S * 0.52;
  const R = S * 0.30; // band centre radius
  const tube = S * 0.052; // band thickness
  const { metalA, metalB, gem } = opts;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - cx;
      const dy = (y - cy) * 1.06;
      const d = Math.sqrt(dx * dx + dy * dy);
      const off = Math.abs(d - R);
      if (off < tube) {
        const t = 1 - off / tube; // 0..1 across the band
        const ang = Math.atan2(dy, dx);
        // anisotropic metallic sheen
        const sheen =
          0.5 +
          0.5 * Math.sin(ang * 3 + 0.6) * Math.cos(ang * 1.3) +
          0.25 * Math.sin(ang * 9);
        const lift = Math.pow(t, 0.6);
        const m = 0.35 + 0.65 * Math.min(1, Math.max(0, sheen));
        const r = metalA[0] * (1 - m) + metalB[0] * m;
        const g = metalA[1] * (1 - m) + metalB[1] * m;
        const b = metalA[2] * (1 - m) + metalB[2] * m;
        const a = 255 * Math.min(1, lift * 1.3);
        setPx(cv, x, y, r * lift + 40, g * lift + 36, b * lift + 30, a);
        // specular hotspots
        if (sheen > 1.15 && t > 0.3) setPx(cv, x, y, 255, 252, 244, 210);
      }
    }
  }
  // gem at the crown
  if (gem) {
    const gx = cx;
    const gy = cy - R - tube * 0.2;
    const gr = S * 0.062;
    for (let y = -gr * 1.4; y < gr * 1.4; y++) {
      for (let x = -gr * 1.4; x < gr * 1.4; x++) {
        const d = Math.sqrt(x * x + y * y * 1.25);
        if (d < gr) {
          const t = 1 - d / gr;
          const facet =
            0.5 + 0.5 * Math.sin(x * 0.22) * Math.cos(y * 0.22) +
            0.3 * Math.sin((x + y) * 0.18);
          const m = Math.min(1, Math.max(0, facet));
          const r = gem[0] * (0.4 + 0.6 * m) + 60 * Math.pow(t, 3);
          const g = gem[1] * (0.4 + 0.6 * m) + 70 * Math.pow(t, 3);
          const b = gem[2] * (0.4 + 0.6 * m) + 80 * Math.pow(t, 3);
          setPx(cv, gx + x, gy + y, r, g, b, 240);
          if (facet > 1.05) setPx(cv, gx + x, gy + y, 255, 255, 255, 230);
        }
      }
    }
  } else {
    // small diamond on silver ring
    const gx = cx;
    const gy = cy - R - tube * 0.2;
    const gr = S * 0.05;
    for (let y = -gr * 1.4; y < gr * 1.4; y++) {
      for (let x = -gr * 1.4; x < gr * 1.4; x++) {
        const d = Math.sqrt(x * x + y * y * 1.3);
        if (d < gr) {
          const t = 1 - d / gr;
          const facet = 0.5 + 0.5 * Math.sin(x * 0.3) * Math.cos(y * 0.3);
          const v = 180 + 70 * facet + 90 * Math.pow(t, 3);
          setPx(cv, gx + x, gy + y, v, v, clamp(v + 6), 235);
          if (facet > 1.0) setPx(cv, gx + x, gy + y, 255, 255, 255, 240);
        }
      }
    }
  }
  save(name, cv);
}

// ---- macro (full-bleed close up) ------------------------------------------
function macro(name, base, accent) {
  const W = 1600;
  const H = 1100;
  const cv = makeCanvas(W, H);
  const cx = W * 0.5;
  const cy = H * 0.5;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / W;
      const dy = (y - cy) / H;
      const d = Math.sqrt(dx * dx + dy * dy);
      const vig = 1 - Math.min(1, d * 1.5);
      // sweeping metallic curve
      const curve =
        0.5 +
        0.5 * Math.sin((x * 0.004 + y * 0.002) + Math.sin(y * 0.003) * 2);
      const m = Math.pow(curve, 1.6) * vig;
      let r = base[0] * (0.3 + 0.9 * m);
      let g = base[1] * (0.3 + 0.9 * m);
      let b = base[2] * (0.3 + 0.9 * m);
      // accent glints
      const glint = Math.pow(Math.max(0, Math.sin(x * 0.05) * Math.cos(y * 0.045)), 6);
      r += accent[0] * glint;
      g += accent[1] * glint;
      b += accent[2] * glint;
      setPx(cv, x, y, r, g, b, 255);
    }
  }
  // fine sparkle dust
  for (let i = 0; i < 1400; i++) {
    const x = (rnd() * W) | 0;
    const y = (rnd() * H) | 0;
    const s = rnd();
    setPx(cv, x, y, 255, 250 - 40 * s, 235 - 80 * s, 120 + 130 * s);
  }
  save(name, cv);
}

// ---- abstract backgrounds --------------------------------------------------
function bgGoldDust(name) {
  const W = 1600;
  const H = 1600;
  const cv = makeCanvas(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - W * 0.5) / W;
      const dy = (y - H * 0.42) / H;
      const d = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - d * 2.2);
      const v = 3 + 26 * Math.pow(glow, 2.2);
      setPx(cv, x, y, v * 1.5, v * 1.2, v * 0.7, 255);
    }
  }
  for (let i = 0; i < 5200; i++) {
    const x = (rnd() * W) | 0;
    const y = (rnd() * H) | 0;
    const dx = (x - W * 0.5) / W;
    const dy = (y - H * 0.42) / H;
    const d = Math.sqrt(dx * dx + dy * dy);
    const near = Math.max(0, 1 - d * 1.8);
    const a = 30 + 200 * near * rnd();
    setPx(cv, x, y, 200 + 55 * rnd(), 165 + 40 * rnd(), 93, a);
  }
  save(name, cv);
}
function bgMarble(name) {
  const W = 1600;
  const H = 1600;
  const cv = makeCanvas(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n =
        Math.sin(x * 0.006 + Math.sin(y * 0.01) * 3) *
        Math.cos(y * 0.005 + Math.sin(x * 0.008) * 2);
      const v = 6 + 14 * (0.5 + 0.5 * n);
      setPx(cv, x, y, v, v, clamp(v + 2), 255);
    }
  }
  // faint gold veins
  for (let v = 0; v < 7; v++) {
    let x = rnd() * W;
    let y = rnd() * H;
    let a = rnd() * Math.PI * 2;
    for (let s = 0; s < 1400; s++) {
      a += (rnd() - 0.5) * 0.3;
      x += Math.cos(a) * 1.4;
      y += Math.sin(a) * 1.4;
      setPx(cv, x | 0, y | 0, 180, 150, 90, 26);
      setPx(cv, (x + 1) | 0, y | 0, 150, 122, 70, 16);
    }
  }
  save(name, cv);
}

// ---- run -------------------------------------------------------------------
ringCutout("ring-silver-cutout.png", {
  metalA: [120, 122, 130],
  metalB: [225, 228, 236],
  gem: null,
});
ringCutout("ring-blue-gold-cutout.png", {
  metalA: [120, 92, 40],
  metalB: [222, 184, 110],
  gem: [16, 110, 140],
});
macro("ring-silver-macro.png", [150, 156, 168], [255, 255, 255]);
macro("ring-blue-gold-macro.png", [150, 120, 64], [90, 200, 230]);
bgGoldDust("bg-gold-dust.png");
bgMarble("bg-black-marble.png");
console.log("\nPlaceholders written to public/images/");
