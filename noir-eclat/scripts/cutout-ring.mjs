// Remove the flat white background from a product photo and write a clean
// transparent PNG. Flood-fills white from the borders so interior white
// (diamonds, gem glints) is preserved, then feathers the 1px edge.
//
//   node scripts/cutout-ring.mjs <in.png> <out.png>
//
// Pure Node (zlib) — decoder + encoder, no dependencies.
import zlib from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";

const [, , INP, OUTP] = process.argv;
if (!INP || !OUTP) {
  console.error("usage: node cutout-ring.mjs <in.png> <out.png>");
  process.exit(1);
}

// ---- decode (8-bit, colorType 2 RGB or 6 RGBA, non-interlaced) -------------
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a png");
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6))
    throw new Error(`unsupported png: depth ${bitDepth} color ${colorType}`);
  const channels = colorType === 6 ? 4 : 3;

  // gather IDAT
  let p = 8;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("ascii", p + 4, p + 8);
    if (type === "IDAT") idat.push(buf.subarray(p + 8, p + 8 + len));
    if (type === "IEND") break;
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));

  const stride = w * channels;
  const out = Buffer.alloc(w * h * 4);
  const prev = Buffer.alloc(stride);
  let pos = 0;
  const cur = Buffer.alloc(stride);

  const paeth = (a, b, c) => {
    const pp = a + b - c;
    const pa = Math.abs(pp - a),
      pb = Math.abs(pp - b),
      pc = Math.abs(pp - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };

  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    for (let i = 0; i < stride; i++) {
      const x = raw[pos++];
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v;
      switch (filter) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error("bad filter " + filter);
      }
      cur[i] = v & 0xff;
    }
    for (let x = 0; x < w; x++) {
      const si = x * channels;
      const di = (y * w + x) * 4;
      out[di] = cur[si];
      out[di + 1] = cur[si + 1];
      out[di + 2] = cur[si + 2];
      out[di + 3] = channels === 4 ? cur[si + 3] : 255;
    }
    cur.copy(prev);
  }
  return { w, h, data: out };
}

// ---- encode RGBA -----------------------------------------------------------
function crc32(b) {
  let c = ~0;
  for (let i = 0; i < b.length; i++) {
    c ^= b[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const rowLen = w * 4 + 1;
  const raw = Buffer.alloc(rowLen * h);
  for (let y = 0; y < h; y++) {
    raw[y * rowLen] = 0;
    rgba.copy(raw, y * rowLen + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- process ---------------------------------------------------------------
const { w, h, data } = decodePNG(readFileSync(INP));
const isWhite = (i) => data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238;

// flood fill from the border
const visited = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) {
  stack.push(x, (h - 1) * w + x);
}
for (let y = 0; y < h; y++) {
  stack.push(y * w, y * w + (w - 1));
}
while (stack.length) {
  const idx = stack.pop();
  if (visited[idx]) continue;
  visited[idx] = 1;
  const di = idx * 4;
  if (!isWhite(di)) continue;
  // transparent AND black, so the removed background can never leak as white
  // even if alpha sampling is imperfect at the GPU.
  data[di] = 0;
  data[di + 1] = 0;
  data[di + 2] = 0;
  data[di + 3] = 0;
  const x = idx % w;
  const y = (idx / w) | 0;
  if (x > 0) stack.push(idx - 1);
  if (x < w - 1) stack.push(idx + 1);
  if (y > 0) stack.push(idx - w);
  if (y < h - 1) stack.push(idx + w);
}

// feather: soften 1px opaque pixels that border transparency and are light
const out = Buffer.from(data);
for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const idx = y * w + x;
    const di = idx * 4;
    if (data[di + 3] === 0) continue;
    let nearClear = false;
    for (const n of [idx - 1, idx + 1, idx - w, idx + w]) {
      if (data[n * 4 + 3] === 0) nearClear = true;
    }
    if (!nearClear) continue;
    const minc = Math.min(data[di], data[di + 1], data[di + 2]);
    if (minc > 215) {
      // the lighter it is, the more transparent
      const a = Math.max(0, Math.min(255, (255 - minc) * 6));
      out[di + 3] = a;
      // darken toward black proportionally so the edge never reads white
      const k = a / 255;
      out[di] = Math.round(data[di] * k);
      out[di + 1] = Math.round(data[di + 1] * k);
      out[di + 2] = Math.round(data[di + 2] * k);
    }
  }
}

let cleared = 0;
for (let i = 0; i < w * h; i++) if (out[i * 4 + 3] < 250) cleared++;
writeFileSync(OUTP, encodePNG(w, h, out));
console.log(
  `✓ ${OUTP}  ${w}x${h}  — ${((cleared / (w * h)) * 100).toFixed(1)}% pixels made (semi)transparent`
);
