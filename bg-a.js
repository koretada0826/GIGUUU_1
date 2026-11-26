// =============================================================
// GIGUUU — 近未来 3D 背景「フローフィールド」
// 無数の粒子が、見えない曲線（カールノイズの流れ場）に沿って
// 絹のように流れる生成アート風の背景。緑を主役に紙吹雪色を散らす。
// 全ページ共通の全画面固定キャンバス。
// =============================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";

// ふんわり光テクスチャ（奥のボケ玉に使用）
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0.0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.4)");
  grd.addColorStop(1.0, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const glowTex = makeGlowTexture();

// -------------------------------------------------------------
// シーン / 背景グラデ / 霧
// -------------------------------------------------------------
const scene = new THREE.Scene();

const bgCanvas = document.createElement("canvas");
bgCanvas.width = 2;
bgCanvas.height = 512;
const bgCtx = bgCanvas.getContext("2d");
const grad = bgCtx.createLinearGradient(0, 0, 0, 512);
grad.addColorStop(0, "#04080c"); // 上：漆黒
grad.addColorStop(0.6, "#05110d");
grad.addColorStop(1, "#071a14"); // 下：深い緑（クローバー寄り）
bgCtx.fillStyle = grad;
bgCtx.fillRect(0, 0, 2, 512);
scene.background = new THREE.CanvasTexture(bgCanvas);
scene.fog = new THREE.FogExp2(0x04080c, 0.018);

// -------------------------------------------------------------
// カメラ / レンダラー（固定背景キャンバス）
// -------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  80
);
camera.position.set(0, 0, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const canvasEl = renderer.domElement;
canvasEl.id = "bg-canvas";
document.body.prepend(canvasEl);

// =============================================================
// フローフィールド（流れ場）
//   ある地点の「流れる向き」を、安価なノイズ（sin/cosの重ね）で決める
// =============================================================
const SP = 0.072; // 空間周波数（小さいほど大きくゆったり渦巻く＝滑らかな川になる）
function flowDir(x, y, z, t, out) {
  // 低周波の滑らかな場：近くの粒子がほぼ平行に流れて“絹の川”になる
  const ang =
    (Math.sin(x * SP + t * 0.1) + Math.cos(y * SP * 1.05 - t * 0.08)) * 1.3 +
    t * 0.02;
  out[0] = Math.cos(ang);
  out[1] = Math.sin(ang);
  out[2] = Math.sin((x + y) * SP * 0.5 + t * 0.04) * 0.28; // 奥行きへ緩やかに
}

// 配置範囲
const BX = 20,
  BY = 12,
  BZ_NEAR = 5,
  BZ_FAR = -12;

// 色：緑を主役（白/ティール含む）＋ 紙吹雪のアクセントをまばらに
const GREENS = [0x2ed16b, 0x35d894, 0x16d0b4, 0x7dffbf, 0xffffff, 0xeafff3];
const ACCENTS = [0xffc23c, 0xff5147, 0x2f9bff, 0x9b5cff, 0xf0457f];
const tmpCol = new THREE.Color();
function pickColor() {
  if (Math.random() < 0.8) return GREENS[(Math.random() * GREENS.length) | 0];
  return ACCENTS[(Math.random() * ACCENTS.length) | 0];
}

// 各粒子を「短い流れの筋（ストリーク）」で描く＝絹のような流線になる
const N = 1900;
const TAIL = 1.5; // 流線の長さ（長め＝滑らかな筋に）
const segPos = new Float32Array(N * 2 * 3); // 先頭 + 尾 の2頂点
const segCol = new Float32Array(N * 2 * 3);
const pPos = new Float32Array(N * 3); // 粒子の現在位置
const pLife = new Float32Array(N);
const pMax = new Float32Array(N);
const pBright = new Float32Array(N); // 基本の明るさ
const pBaseCol = new Float32Array(N * 3); // 基本色

function seed(i, freshLife) {
  pPos[i * 3 + 0] = (Math.random() - 0.5) * BX * 2;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * BY * 2;
  pPos[i * 3 + 2] = BZ_FAR + Math.random() * (BZ_NEAR - BZ_FAR);
  pMax[i] = 7 + Math.random() * 11; // 寿命（秒）
  pLife[i] = freshLife ? Math.random() * pMax[i] : 0;
  const hex = pickColor();
  tmpCol.setHex(hex);
  pBaseCol[i * 3 + 0] = tmpCol.r;
  pBaseCol[i * 3 + 1] = tmpCol.g;
  pBaseCol[i * 3 + 2] = tmpCol.b;
  const isBright = hex === 0xffffff || hex === 0xeafff3 || hex === 0x7dffbf;
  pBright[i] = isBright ? 1.05 : 0.62; // 白系をきらめかせ、緑は控えめ
}
for (let i = 0; i < N; i++) seed(i, true);

const segGeo = new THREE.BufferGeometry();
segGeo.setAttribute("position", new THREE.BufferAttribute(segPos, 3));
segGeo.setAttribute("color", new THREE.BufferAttribute(segCol, 3));
const segMat = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.62,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const streaks = new THREE.LineSegments(segGeo, segMat);
scene.add(streaks);
const segPosAttr = segGeo.attributes.position;
const segColAttr = segGeo.attributes.color;

// =============================================================
// 奥のボケ玉（被写界深度っぽい深みを足す）
// =============================================================
const bokeh = new THREE.Group();
const bokehColors = [0x2ed16b, 0x16d0b4, 0x1f9e6e, 0x2f7acc];
for (let i = 0; i < 9; i++) {
  const mat = new THREE.SpriteMaterial({
    map: glowTex,
    color: bokehColors[(Math.random() * bokehColors.length) | 0],
    transparent: true,
    opacity: 0.06 + Math.random() * 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: true,
  });
  const s = new THREE.Sprite(mat);
  s.position.set(
    (Math.random() - 0.5) * 38,
    (Math.random() - 0.5) * 24,
    -16 - Math.random() * 22
  );
  const sc = 8 + Math.random() * 16;
  s.scale.set(sc, sc, 1);
  s.userData.sp = 0.2 + Math.random() * 0.5;
  bokeh.add(s);
}
scene.add(bokeh);

// =============================================================
// ポストプロセス（ブルーム + ビネット）
// =============================================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5, // strength
  0.85, // radius（広く柔らかく）
  0.1 // threshold（低め＝流れがしっとり光る）
);
composer.addPass(bloomPass);
const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms.offset.value = 1.0;
vignettePass.uniforms.darkness.value = 1.3;
composer.addPass(vignettePass);
composer.addPass(new OutputPass());

// =============================================================
// マウス視差 + スクロール連動
// =============================================================
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

let scrollN = 0;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollN = max > 0 ? window.scrollY / max : 0;
}
window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

const clock = new THREE.Clock();
let visible = true;
document.addEventListener("visibilitychange", () => {
  visible = document.visibilityState === "visible";
  if (visible) clock.getDelta();
});

// =============================================================
// アニメーションループ
// =============================================================
const dir = [0, 0, 0];
function animate() {
  requestAnimationFrame(animate);
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // スクロールで流れを少し速める＝勢いが増す
  const speed = 1.3 * (1 + scrollN * 0.8);

  for (let i = 0; i < N; i++) {
    const ix = i * 3;
    let x = pPos[ix],
      y = pPos[ix + 1],
      z = pPos[ix + 2];

    flowDir(x, y, z, t, dir);
    x += dir[0] * speed * dt;
    y += dir[1] * speed * dt;
    z += dir[2] * speed * dt;

    pLife[i] += dt;
    // 寿命切れ or 画面外で再配置
    if (
      pLife[i] > pMax[i] ||
      x < -BX ||
      x > BX ||
      y < -BY ||
      y > BY ||
      z > BZ_NEAR ||
      z < BZ_FAR
    ) {
      seed(i, false);
      x = pPos[ix];
      y = pPos[ix + 1];
      z = pPos[ix + 2];
      flowDir(x, y, z, t, dir);
    }
    pPos[ix] = x;
    pPos[ix + 1] = y;
    pPos[ix + 2] = z;

    // 寿命に応じてフェードイン/アウト（ポップを防ぐ）
    const k = pLife[i] / pMax[i];
    const fade = Math.min(1, k / 0.12) * Math.min(1, (1 - k) / 0.25);
    const b = pBright[i] * Math.max(0, fade);

    // 先頭頂点＝現在位置 / 尾頂点＝流れの後方（TAIL分だけ戻す）
    const v0 = i * 6;
    segPos[v0 + 0] = x;
    segPos[v0 + 1] = y;
    segPos[v0 + 2] = z;
    segPos[v0 + 3] = x - dir[0] * TAIL;
    segPos[v0 + 4] = y - dir[1] * TAIL;
    segPos[v0 + 5] = z - dir[2] * TAIL;
    // 色：先頭は明るく、尾は暗く（＝後ろへ消えていく流線）
    const cr = pBaseCol[ix],
      cg = pBaseCol[ix + 1],
      cb = pBaseCol[ix + 2];
    segCol[v0 + 0] = cr * b;
    segCol[v0 + 1] = cg * b;
    segCol[v0 + 2] = cb * b;
    segCol[v0 + 3] = cr * b * 0.04;
    segCol[v0 + 4] = cg * b * 0.04;
    segCol[v0 + 5] = cb * b * 0.04;
  }
  segPosAttr.needsUpdate = true;
  segColAttr.needsUpdate = true;

  // ボケ玉：ゆっくり漂う
  bokeh.rotation.z = t * 0.01;
  for (const s of bokeh.children) {
    s.position.x += Math.sin(t * 0.1 + s.position.y) * s.userData.sp * dt;
  }

  // カメラ：漂い + マウス視差 + スクロールで少し引く
  const driftX = Math.sin(t * 0.08) * 0.6;
  const driftY = Math.cos(t * 0.1) * 0.4;
  const tx = driftX + mouse.x * 1.2;
  const ty = driftY - mouse.y * 0.9;
  camera.position.x += (tx - camera.position.x) * 0.03;
  camera.position.y += (ty - camera.position.y) * 0.03;
  camera.position.z += (16 + scrollN * 4 - camera.position.z) * 0.04;
  camera.lookAt(scene.position);

  composer.render();
}
animate();

// =============================================================
// リサイズ
// =============================================================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  updateScroll();
});
