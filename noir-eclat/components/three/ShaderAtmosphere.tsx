"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A fixed full-viewport GLSL plane: slow flowing black smoke with gold dust
 * and a soft spotlight that follows the cursor. Replaces flat CSS gradients
 * with something alive. Cheap — a single fragment shader, capped DPR, paused
 * off-tab. Static dark gradient under prefers-reduced-motion.
 */
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;
  uniform float uScroll;

  // hash / value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, amp = 0.5;
    for(int i=0;i<5;i++){ v += amp*noise(p); p *= 2.02; amp *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = uv * vec2(uRes.x/uRes.y, 1.0);
    float t = uTime * 0.03;

    // drifting smoke
    vec2 q = vec2(fbm(p*1.5 + vec2(t, -t*0.6)), fbm(p*1.5 + vec2(-t*0.5, t)));
    float smoke = fbm(p*2.0 + q*1.6 + vec2(0.0, uScroll*0.0006));

    // base near-black with a warm gold core up top
    vec3 col = vec3(0.012, 0.012, 0.014);
    float topGlow = smoothstep(0.9, 0.0, distance(uv, vec2(0.5, 1.05)));
    col += vec3(0.22, 0.16, 0.08) * pow(topGlow, 2.2) * (0.5 + 0.5*smoke);

    // gold dust threads
    float dust = smoothstep(0.55, 0.95, smoke);
    col += vec3(0.5, 0.38, 0.18) * dust * 0.5;

    // teal counter-glow at lower left
    float teal = smoothstep(0.9, 0.0, distance(uv, vec2(0.12, 0.05)));
    col += vec3(0.03, 0.16, 0.20) * pow(teal, 2.5) * (0.4 + 0.6*smoke);

    // cursor spotlight
    float spot = smoothstep(0.35, 0.0, distance(uv, uMouse));
    col += vec3(0.18, 0.14, 0.08) * spot * 0.6;

    // sparse twinkling motes
    float m = noise(p*60.0 + t*4.0);
    col += vec3(0.6,0.5,0.3) * smoothstep(0.985, 1.0, m) * (0.5+0.5*sin(uTime*3.0));

    // vignette + film
    float vig = smoothstep(1.2, 0.2, length(uv-0.5));
    col *= vig;
    col += (hash(uv*uTime) - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`;

export default function ShaderAtmosphere() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const container = mount.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    } catch {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const w = () => window.innerWidth;
    const h = () => window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w(), h());
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(w(), h()) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
    };
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        depthTest: false,
        depthWrite: false,
      })
    );
    scene.add(quad);

    const target = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: MouseEvent) => {
      target.set(e.clientX / w(), 1 - e.clientY / h());
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    const onScroll = () => (uniforms.uScroll.value = window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      renderer.setSize(w(), h());
      uniforms.uRes.value.set(w(), h());
    };
    window.addEventListener("resize", onResize);

    let vis = true;
    const onVis = () => (vis = !document.hidden);
    document.addEventListener("visibilitychange", onVis);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!vis) return;
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uMouse.value.lerp(target, 0.05);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      quad.geometry.dispose();
      (quad.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container)
        container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mount}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden
    />
  );
}
