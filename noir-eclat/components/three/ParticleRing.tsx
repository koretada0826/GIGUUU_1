"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { gsap } from "@/lib/animations";

type Props = {
  className?: string;
  /** "gold" | "silver" particle palette */
  variant?: "gold" | "silver";
  count?: number;
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uForm;     // 0 = dust cloud, 1 = formed ring
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3  uMouse;    // world-space, on z=0 plane
  uniform float uBurst;    // mouse ripple energy

  attribute vec3  aTarget;
  attribute vec3  aScatter;
  attribute float aRand;

  varying float vRand;
  varying float vGlow;

  vec3 swirl(vec3 p){
    return vec3(
      sin(p.y * 1.3 + uTime * 0.45),
      sin(p.z * 1.1 + uTime * 0.38),
      sin(p.x * 1.7 + uTime * 0.55)
    );
  }

  void main(){
    vRand = aRand;
    float form = smoothstep(0.0, 1.0, uForm);
    vec3 pos = mix(aScatter, aTarget, form);

    // residual drift — strong as dust, faint once formed
    float drift = (1.0 - form) * 1.1 + 0.08;
    pos += swirl(aTarget * 0.7 + aRand * 12.0) * drift * (0.35 + aRand * 0.65);

    // breathing shimmer along the ring once formed
    pos += normalize(vec3(aTarget.xy, 0.0001)) *
           sin(uTime * 0.9 + aRand * 6.2831) * 0.02 * form;

    // mouse ripple — push particles outward near the cursor
    float md = distance(pos, uMouse);
    float push = smoothstep(0.9, 0.0, md) * (0.45 + uBurst * 0.8);
    pos += normalize(pos - uMouse + 0.0001) * push;
    vGlow = push;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = uSize * (0.55 + aRand * 0.9);
    gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA;  // deep gold
  uniform vec3 uColorB;  // bright highlight
  varying float vRand;
  varying float vGlow;

  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    vec3 col = mix(uColorA, uColorB, clamp(vRand * 0.7 + vGlow, 0.0, 1.0));
    col += vGlow * vec3(0.5, 0.35, 0.15);
    gl_FragColor = vec4(col, a);
  }
`;

const PALETTES = {
  gold: { a: new THREE.Color(0x6e4f1f), b: new THREE.Color(0xffe9b0) },
  silver: { a: new THREE.Color(0x6a7180), b: new THREE.Color(0xf4f8ff) },
} as const;

export default function ParticleRing({
  className = "",
  variant = "gold",
  count = 14000,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const container = mount.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFallback(true);
      return;
    }

    const getSize = () => {
      const r = container.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    };
    let { w, h } = getSize();
    const dpr = Math.min(window.devicePixelRatio, 2);

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    // ---- build the ring + scatter buffers ----
    const N = reduced ? Math.min(count, 6000) : count;
    const targets = new Float32Array(N * 3);
    const scatter = new Float32Array(N * 3);
    const rand = new Float32Array(N);
    const R = 1.3; // ring radius
    const tube = 0.14; // band thickness

    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const tubeA = Math.random() * Math.PI * 2;
      const tr = tube * Math.sqrt(Math.random());
      const rr = R + tr * Math.cos(tubeA);
      targets[i * 3] = Math.cos(theta) * rr;
      targets[i * 3 + 1] = Math.sin(theta) * rr;
      targets[i * 3 + 2] = tr * Math.sin(tubeA);

      // scatter: a soft cloud in a sphere
      const u = Math.random();
      const v = Math.random();
      const sphi = Math.acos(2 * u - 1);
      const sthe = 2 * Math.PI * v;
      const srad = 2.4 + Math.random() * 1.6;
      scatter[i * 3] = srad * Math.sin(sphi) * Math.cos(sthe);
      scatter[i * 3 + 1] = srad * Math.sin(sphi) * Math.sin(sthe) * 0.7;
      scatter[i * 3 + 2] = srad * Math.cos(sphi);

      rand[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(targets.slice(), 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const pal = PALETTES[variant];
    const uniforms = {
      uTime: { value: 0 },
      uForm: { value: 0 },
      uSize: { value: 7.5 },
      uPixelRatio: { value: dpr },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uBurst: { value: 0 },
      uColorA: { value: pal.a.clone() },
      uColorB: { value: pal.b.clone() },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    const group = new THREE.Group();
    group.rotation.x = -0.5; // tilt the ring toward the viewer
    group.add(points);
    scene.add(group);

    // ---- post: bloom makes the dust glow ----
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.9,
      0.6,
      0.0
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ---- coalesce on load ----
    if (reduced) {
      uniforms.uForm.value = 1;
    } else {
      gsap.to(uniforms.uForm, {
        value: 1,
        duration: 3.2,
        ease: "power2.inOut",
        delay: 0.2,
      });
    }

    // ---- interaction ----
    const halfH = Math.tan((34 * Math.PI) / 360) * camera.position.z;
    const worldMouse = new THREE.Vector3(99, 99, 0);
    const targetMouse = new THREE.Vector3(99, 99, 0);
    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        targetMouse.set(99, 99, 0);
        return;
      }
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const halfW = halfH * (w / h);
      // account for the group tilt so the ripple sits on the ring plane
      targetMouse.set(nx * halfW, ny * halfH, 0);
      gsap.to(uniforms.uBurst, {
        value: 1,
        duration: 0.3,
        overwrite: true,
        onComplete: () => {
          gsap.to(uniforms.uBurst, { value: 0, duration: 1.2 });
        },
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let scrollT = 0;
    const onScroll = () => {
      scrollT = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      const s = getSize();
      w = s.w;
      h = s.h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      // ease mouse
      worldMouse.lerp(targetMouse, 0.12);
      uniforms.uMouse.value.copy(worldMouse);
      // slow auto rotation + scroll-coupled spin
      group.rotation.y = t * 0.12 + scrollT * 0.0008;
      group.rotation.z = Math.sin(t * 0.15) * 0.04;
      composer.render();
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container)
        container.removeChild(renderer.domElement);
    };
  }, [variant, count]);

  if (fallback) {
    return (
      <div className={className}>
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-1/2 w-1/2 rounded-full border border-gold/40 [box-shadow:0_0_80px_rgba(200,164,93,0.4)]" />
        </div>
      </div>
    );
  }

  return <div ref={mount} className={className} role="img" aria-label="A ring of light forming from gold dust" />;
}
