// =============================================================
// 再利用できる glTF ビューア
//   <div class="model-viewer" data-model-viewer data-src="./assets/models/telemo.glb"
//        data-label="TELEMO のロゴ（3D）" data-poster="./assets/...jpg"></div>
// を自動で探してマウントする。ドラッグでモデルをその場で回転（カメラは固定）。
// =============================================================
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// 調整用パラメータ（角度はラジアン、rate は 1/秒 の指数追従係数）
export const CONFIG = {
  dragSensitivity: 0.0055,          // ドラッグ 1px あたりの回転量
  pitchLimit: THREE.MathUtils.degToRad(28), // 縦回転のクランプ（data-pitch-limit で上書き、度）
  followRate: 9,                    // 目標角度への追従の速さ（大きいほど機敏）
  inertiaScale: 0.35,               // 離した瞬間の速度に掛ける係数（慣性の残し具合）
  inertiaMax: 1.4,                  // 慣性速度の上限 rad/s
  inertiaDecay: 7,                  // 慣性の指数減衰（大きいほど早く止まる）
  touchLockPx: 8,                   // タッチで方向判定するまでの移動量
  keyStep: THREE.MathUtils.degToRad(12), // ←→ キー 1 回の回転量
  idleAmplitude: THREE.MathUtils.degToRad(9), // アイドルの揺れ幅
  idlePeriod: 9,                    // アイドル 1 往復の秒数
  idleCycles: 0,                    // 連続してゆっくり回転（0 で止めない）
  tiltMax: THREE.MathUtils.degToRad(3.5), // カーソル追従チルトの最大角
  tiltRate: 3,                      // チルトの遅れ追従
  fov: 22,                          // 縦の画角。小さいほどパースが弱く、回転時の手前の膨らみが減る
  maxHFov: 38.5,                    // 横の画角の上限（横長の枠でもパースが強くなりすぎないように縦の画角を絞る）
  fitPadding: 1.1,                  // 1 より大きいほど余白が増える
  toneMapping: "aces",              // "aces" | "agx"（data-tone-mapping で上書き）
  exposure: 0.9,                    // data-exposure で上書き
  envIntensity: 0.4,                // 環境光の反射の強さ（data-env-intensity で上書き）
  keyIntensity: 3.0,
  keyPosition: [-5.5, 4.5, 5],      // キーライト（やや左上・手前）
  fillIntensity: 1.0,
  fillPosition: [6, 1, 1.5],        // 右側面を起こす弱いフィル
  initialYaw: 14,                   // 初期の向き（度、data-yaw / data-pitch で上書き）。側面が見える角度
  initialPitch: 3,
  pixelRatioMax: 2,
};

const EPS = 0.0004;
const DEBUG = new URLSearchParams(location.search).has("debug");
const DRACO_PATH = new URL("./reference/vendor/three/examples/jsm/libs/draco/gltf/", import.meta.url).href;

const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarseMQ = window.matchMedia("(hover: none), (pointer: coarse)");
const instances = new Map();

let loader = null;
function getLoader() {
  if (loader) return loader;
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

let webglOk = null;
function webglAvailable() {
  if (webglOk !== null) return webglOk;
  try {
    const c = document.createElement("canvas");
    const gl = window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"));
    webglOk = !!gl;
    if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch (e) {
    webglOk = false;
  }
  return webglOk;
}

// ウィンドウ上のカーソル位置（全インスタンス共通、-1〜1）
const cursor = { x: 0, y: 0, inside: false };
function wakeAll() { instances.forEach(v => v.wake()); }
window.addEventListener("pointermove", e => {
  if (e.pointerType === "touch") return;
  cursor.x = (e.clientX / window.innerWidth) * 2 - 1;
  cursor.y = (e.clientY / window.innerHeight) * 2 - 1;
  cursor.inside = true;
  wakeAll();
}, { passive: true });
const leave = () => { cursor.inside = false; wakeAll(); };
document.addEventListener("mouseleave", leave);
document.addEventListener("pointerout", e => { if (e.relatedTarget === null && e.pointerType !== "touch") leave(); });
window.addEventListener("blur", leave);
document.addEventListener("visibilitychange", () => instances.forEach(v => (document.hidden ? v.stop() : v.wake())));
reducedMQ.addEventListener("change", () => instances.forEach(v => v.onMotionPref()));
coarseMQ.addEventListener("change", wakeAll);

const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function fallback(el) {
  el.classList.remove("is-loading", "is-ready");
  el.classList.add("is-fallback");
  const poster = el.dataset.poster;
  if (poster && !el.querySelector(".model-viewer__poster")) {
    const img = new Image();
    img.className = "model-viewer__poster";
    img.src = poster;
    img.alt = "";
    img.decoding = "async";
    el.appendChild(img);
  }
}

// data-face-color / data-side-color で文字の表面・側面の色を差し替える。
// data-accent-letter="4" data-accent-color="#..." で指定した文字だけ表面色を変える。
// data-face-gradient="#上,#下" で表面を縦グラデーションにする(頂点カラー)。
function recolor(root, ds) {
  if (!ds.faceColor && !ds.sideColor && !ds.accentColor && !ds.faceGradient) return;
  if (ds.faceGradient) {
    const [top, bottom] = ds.faceGradient.split(",").map(c => new THREE.Color(c.trim()));
    root.traverse(o => {
      if (!o.isMesh || !o.material || !/face/i.test(o.material.name)) return;
      const pos = o.geometry.attributes.position;
      o.geometry.computeBoundingBox();
      const { min, max } = o.geometry.boundingBox;
      const colors = new Float32Array(pos.count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        c.copy(bottom).lerp(top, (pos.getY(i) - min.y) / (max.y - min.y || 1));
        colors.set([c.r, c.g, c.b], i * 3);
      }
      o.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      o.material = o.material.clone();
      o.material.color.set(0xffffff);
      o.material.vertexColors = true;
    });
  }
  const accentName = ds.accentLetter ? `TELEMO_letter_${ds.accentLetter}` : null;
  root.traverse(o => {
    if (!o.isMesh || !o.material) return;
    let isAccent = false;
    for (let p = o; p; p = p.parent) if (accentName && p.name.replace(/\s/g, "_") === accentName) { isAccent = true; break; }
    const isFace = /face/i.test(o.material.name);
    const color = isFace ? (isAccent && ds.accentColor) || ds.faceColor : ds.sideColor;
    if (!color) return;
    o.material = o.material.clone();
    o.material.color.set(color);
  });
}

function disposeObject(root) {
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    mats.forEach(m => {
      Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); });
      m.dispose();
    });
  });
}

function createViewer(el) {
  el.classList.add("is-loading");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", el.dataset.label || "3Dモデル");
  if (!el.hasAttribute("tabindex") && el.dataset.keyboard !== "false") el.tabIndex = 0;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    fallback(el);
    return { destroy() {}, wake() {}, stop() {}, onMotionPref() {} };
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const ds = el.dataset;
  const num = (v, d) => (v !== undefined && v !== "" && isFinite(+v) ? +v : d);
  const tone = (ds.toneMapping || CONFIG.toneMapping).toLowerCase();
  renderer.toneMapping = tone === "agx" ? THREE.AgXToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = num(ds.exposure, CONFIG.exposure);
  const envIntensity = num(ds.envIntensity, CONFIG.envIntensity);
  const fitPadding = num(ds.fitPadding, CONFIG.fitPadding);
  const pitchLimit = ds.pitchLimit ? THREE.MathUtils.degToRad(num(ds.pitchLimit, 28)) : CONFIG.pitchLimit;
  const canvas = renderer.domElement;
  canvas.className = "model-viewer__canvas";
  canvas.setAttribute("aria-hidden", "true");
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  let pmrem, envTarget;
  try {
    pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment(renderer);
    envTarget = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = envTarget.texture;
  } catch (e) {
    pmrem?.dispose();
    renderer.dispose();
    canvas.remove();
    fallback(el);
    return { destroy() {}, wake() {}, stop() {}, onMotionPref() {} };
  }

  const key = new THREE.DirectionalLight(0xffffff, num(ds.keyIntensity, CONFIG.keyIntensity));
  key.position.set(...CONFIG.keyPosition);
  const fill = new THREE.DirectionalLight(0xdfe8ff, num(ds.fillIntensity, CONFIG.fillIntensity));
  fill.position.set(...CONFIG.fillPosition);
  scene.add(key, fill);

  const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.05, 200);
  const tiltGroup = new THREE.Group();
  const spinGroup = new THREE.Group();
  tiltGroup.add(spinGroup);
  scene.add(tiltGroup);

  const yaw0 = THREE.MathUtils.degToRad(num(ds.yaw, CONFIG.initialYaw));
  const pitch0 = clamp(THREE.MathUtils.degToRad(num(ds.pitch, CONFIG.initialPitch)), -pitchLimit, pitchLimit);
  const s = {
    yaw: yaw0, pitch: pitch0, targetYaw: yaw0, targetPitch: pitch0, velYaw: 0, velPitch: 0,
    tiltX: 0, tiltY: 0, idle: !reducedMQ.matches, idleTime: 0, idleOffset: 0,
    dragging: false, ready: false, running: false, visible: true, frames: 0, destroyed: false,
  };
  let model = null;
  let size = new THREE.Vector3(1, 1, 1);
  let raf = 0;
  let last = 0;

  function fit() {
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatioMax));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    let vHalf = THREE.MathUtils.degToRad(CONFIG.fov / 2);
    const hMax = THREE.MathUtils.degToRad(CONFIG.maxHFov / 2);
    if (Math.tan(vHalf) * camera.aspect > Math.tan(hMax)) vHalf = Math.atan(Math.tan(hMax) / camera.aspect);
    camera.fov = THREE.MathUtils.radToDeg(vHalf * 2);
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const dist = Math.max(
      (size.x / 2) * fitPadding / Math.tan(hHalf),
      (size.y / 2) * fitPadding / Math.tan(vHalf)
    ) + size.z / 2;
    camera.position.set(0, 0, dist);
    camera.near = Math.max(0.01, dist / 100);
    camera.far = dist * 4 + size.length();
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function stopIdle() {
    if (!s.idle) return;
    s.yaw += s.idleOffset;
    s.targetYaw = s.yaw;
    s.idleOffset = 0;
    s.idle = false;
  }

  const tiltEnabled = () => !reducedMQ.matches && !coarseMQ.matches;

  function step(dt) {
    const reduced = reducedMQ.matches;
    if (!s.dragging && !reduced) {
      if (s.velYaw || s.velPitch) {
        s.targetYaw += s.velYaw * dt;
        s.targetPitch += s.velPitch * dt;
        if (Math.abs(s.targetPitch) > pitchLimit) {
          s.targetPitch = clamp(s.targetPitch, -pitchLimit, pitchLimit);
          s.velPitch = 0;
        }
        const k = Math.exp(-CONFIG.inertiaDecay * dt);
        s.velYaw *= k;
        s.velPitch *= k;
        if (Math.abs(s.velYaw) < 0.03) s.velYaw = 0;
        if (Math.abs(s.velPitch) < 0.03) s.velPitch = 0;
      }
    }
    if (reduced) {
      s.yaw = s.targetYaw;
      s.pitch = s.targetPitch;
    } else {
      const k = damp(CONFIG.followRate, dt);
      s.yaw += (s.targetYaw - s.yaw) * k;
      s.pitch += (s.targetPitch - s.pitch) * k;
      if (Math.abs(s.targetYaw - s.yaw) < EPS) s.yaw = s.targetYaw;
      if (Math.abs(s.targetPitch - s.pitch) < EPS) s.pitch = s.targetPitch;
    }

    if (s.idle && !reduced) {
      s.idleTime += dt;
      const end = CONFIG.idleCycles * CONFIG.idlePeriod;
      if (end && s.idleTime >= end) {
        // 往復の終点（sin=0）で揺れ幅も 0 になっているので、そのまま静止させる
        s.idle = false;
        s.idleOffset = 0;
      } else {
        const ramp = 1 - Math.exp(-s.idleTime / 1.6);
        const fade = end ? THREE.MathUtils.smoothstep(end - s.idleTime, 0, CONFIG.idlePeriod * 0.5) : 1;
        s.idleOffset = Math.sin((s.idleTime / CONFIG.idlePeriod) * Math.PI * 2) * CONFIG.idleAmplitude * ramp * fade;
      }
    } else {
      s.idleOffset = 0;
    }

    if (!s.dragging) {
      const on = tiltEnabled() && cursor.inside;
      const tx = on ? cursor.y * CONFIG.tiltMax : 0;
      const ty = on ? cursor.x * CONFIG.tiltMax : 0;
      if (reduced) {
        s.tiltX = tx;
        s.tiltY = ty;
      } else {
        const k = damp(CONFIG.tiltRate, dt);
        s.tiltX += (tx - s.tiltX) * k;
        s.tiltY += (ty - s.tiltY) * k;
        if (Math.abs(tx - s.tiltX) < EPS * 0.5) s.tiltX = tx;
        if (Math.abs(ty - s.tiltY) < EPS * 0.5) s.tiltY = ty;
      }
      s.tiltTargetX = tx;
      s.tiltTargetY = ty;
    }

    spinGroup.rotation.set(s.pitch, s.yaw + s.idleOffset, 0);
    tiltGroup.rotation.set(s.tiltX, s.tiltY, 0);
  }

  function settled() {
    return !s.dragging && !(s.idle && !reducedMQ.matches) && !s.velYaw && !s.velPitch &&
      s.yaw === s.targetYaw && s.pitch === s.targetPitch &&
      s.tiltX === s.tiltTargetX && s.tiltY === s.tiltTargetY;
  }

  function render() {
    renderer.render(scene, camera);
    s.frames++;
  }

  function loop(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt);
    render();
    if (settled()) { s.running = false; return; }
    raf = requestAnimationFrame(loop);
  }

  function wake() {
    if (s.destroyed || !s.ready || !s.visible || document.hidden || raf) return;
    s.running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    s.running = false;
  }

  function onMotionPref() {
    if (reducedMQ.matches) {
      stopIdle();
      s.velYaw = s.velPitch = 0;
    }
    wake();
  }

  // ---------------- ポインター
  let active = null; // { id, type, mode: 'pending'|'drag'|'scroll', x, y, sx, sy, samples }
  const pointers = new Set();

  function beginDrag(e) {
    stopIdle();
    active.mode = "drag";
    s.dragging = true;
    s.velYaw = s.velPitch = 0;
    el.classList.add("is-dragging");
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    wake();
  }

  function endDrag(withInertia) {
    if (!active) return;
    if (active.mode === "drag") {
      s.dragging = false;
      el.classList.remove("is-dragging");
      // 直近 60ms 以上の区間で速度を出す（指を止めてから離した場合は慣性なし）
      const now = performance.now();
      const sm = active.samples;
      const b = sm[sm.length - 1];
      let a = b;
      for (let i = sm.length - 2; i >= 0; i--) { a = sm[i]; if (b.t - a.t >= 60) break; }
      if (withInertia && !reducedMQ.matches && a !== b && now - b.t < 120 && b.t - a.t < 250) {
        const span = Math.max(16, b.t - a.t) / 1000;
        const lim = CONFIG.inertiaMax;
        s.velYaw = clamp(((b.yaw - a.yaw) / span) * CONFIG.inertiaScale, -lim, lim);
        s.velPitch = clamp(((b.pitch - a.pitch) / span) * CONFIG.inertiaScale, -lim, lim);
      }
      try { el.releasePointerCapture(active.id); } catch (err) { /* noop */ }
      wake();
    }
    active = null;
  }

  function onDown(e) {
    // ピンチ判定用。タッチは暗黙キャプチャで up/cancel が必ず届くのでタッチだけ数える
    if (e.pointerType === "touch") pointers.add(e.pointerId);
    if (!s.ready) return;
    if (pointers.size > 1) { endDrag(false); return; } // ピンチ等の複数指は無視
    if (e.pointerType === "mouse" && e.button !== 0) return;
    active = { id: e.pointerId, type: e.pointerType, mode: "pending", x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, samples: [] };
    if (e.pointerType === "mouse") {
      e.preventDefault();
      beginDrag(e);
      active.samples.push({ t: performance.now(), yaw: s.targetYaw, pitch: s.targetPitch });
    }
  }

  function onMove(e) {
    if (!active || e.pointerId !== active.id) return;
    if (active.mode === "pending") {
      const dx = e.clientX - active.sx;
      const dy = e.clientY - active.sy;
      if (Math.hypot(dx, dy) < CONFIG.touchLockPx) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        beginDrag(e);
        active.x = e.clientX;
        active.y = e.clientY;
        active.samples.push({ t: performance.now(), yaw: s.targetYaw, pitch: s.targetPitch });
      } else {
        active.mode = "scroll";
      }
      return;
    }
    if (active.mode !== "drag") return;
    const dx = e.clientX - active.x;
    const dy = e.clientY - active.y;
    active.x = e.clientX;
    active.y = e.clientY;
    s.targetYaw += dx * CONFIG.dragSensitivity;
    s.targetPitch = clamp(s.targetPitch + dy * CONFIG.dragSensitivity, -pitchLimit, pitchLimit);
    const now = performance.now();
    active.samples.push({ t: now, yaw: s.targetYaw, pitch: s.targetPitch });
    if (active.samples.length > 12) active.samples.shift();
    wake();
  }

  function onUp(e) {
    // canvas の暗黙キャプチャがコンテナへ移るときの lostpointercapture（バブル）は無視
    if (e.type === "lostpointercapture" && e.target !== el) return;
    pointers.delete(e.pointerId);
    if (active && e.pointerId === active.id) endDrag(e.type === "pointerup");
  }

  // 横ドラッグ確定後はタッチのスクロールを止める（iOS 対策）
  function onTouchMove(e) {
    if (active && active.mode === "drag" && e.cancelable) e.preventDefault();
  }

  function onKey(e) {
    if (!s.ready || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    stopIdle();
    s.targetYaw += (e.key === "ArrowRight" ? 1 : -1) * CONFIG.keyStep;
    wake();
  }

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("lostpointercapture", onUp);
  el.addEventListener("touchmove", onTouchMove, { passive: false });
  el.addEventListener("keydown", onKey);

  // ---------------- 監視
  const ro = new ResizeObserver(() => {
    fit();
    if (s.ready && !raf && s.visible && !document.hidden) render();
  });
  ro.observe(el);
  const io = new IntersectionObserver(entries => {
    s.visible = entries[entries.length - 1].isIntersecting;
    if (s.visible) wake(); else stop();
  });
  io.observe(el);

  canvas.addEventListener("webglcontextlost", () => {
    if (s.destroyed) return; // destroy() の forceContextLoss 由来
    destroy();
    fallback(el);
  });

  // ---------------- 読み込み
  getLoader().load(
    el.dataset.src,
    gltf => {
      if (s.destroyed) { disposeObject(gltf.scene); return; }
      model = gltf.scene;
      recolor(model, el.dataset);
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      model.traverse(o => {
        if (!o.material) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
          if ("envMapIntensity" in m) m.envMapIntensity = envIntensity;
          Object.values(m).forEach(v => { if (v && v.isTexture) v.anisotropy = Math.min(8, maxAniso); });
        });
      });
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      spinGroup.add(model);
      fit();
      s.ready = true;
      el.classList.remove("is-loading");
      el.classList.add("is-ready");
      step(0);
      render();
      wake();
    },
    undefined,
    err => {
      if (s.destroyed) return;
      console.warn("[model-viewer] failed to load", el.dataset.src, err);
      destroy();
      fallback(el);
    }
  );

  function destroy() {
    if (s.destroyed) return;
    s.destroyed = true;
    stop();
    ro.disconnect();
    io.disconnect();
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onUp);
    el.removeEventListener("lostpointercapture", onUp);
    el.removeEventListener("touchmove", onTouchMove);
    el.removeEventListener("keydown", onKey);
    if (model) disposeObject(model);
    envTarget.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    el.classList.remove("is-loading", "is-ready", "is-dragging");
    instances.delete(el);
  }

  return { destroy, wake, stop, onMotionPref, state: s };
}

export function mount(el) {
  if (instances.has(el)) return instances.get(el);
  if (!el.dataset.src || !webglAvailable()) {
    fallback(el);
    return null;
  }
  const v = createViewer(el);
  instances.set(el, v);
  return v;
}

export function destroy(el) {
  const v = instances.get(el);
  if (v) v.destroy();
}

export function mountAll(root = document) {
  return [...root.querySelectorAll("[data-model-viewer]")].map(mount);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mountAll(), { once: true });
} else {
  mountAll();
}

if (DEBUG) {
  window.__modelViewer = {
    instances,
    state: (i = 0) => {
      const v = [...instances.values()][i];
      return v && v.state ? { ...v.state } : null;
    },
  };
}
