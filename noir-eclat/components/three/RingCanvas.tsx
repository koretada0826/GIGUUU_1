"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

type Variant = "silver" | "gold";

type Props = {
  variant?: Variant;
  /** PNG shown for reduced-motion / no-WebGL fallback */
  fallbackSrc: string;
  fallbackAlt: string;
  className?: string;
  /** spin speed multiplier */
  spin?: number;
};

const PALETTE: Record<Variant, { metal: number; gem: number; ior: number }> = {
  silver: { metal: 0xeef0f4, gem: 0xcfe6ff, ior: 2.4 },
  gold: { metal: 0xcea863, gem: 0x2a93b8, ior: 1.77 },
};

/** Builds a dark studio environment (canvas → PMREM) for metallic reflections. */
function buildEnv(renderer: THREE.WebGLRenderer) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  // base vertical gradient — a dark studio with a luminous ceiling so the
  // metal has bright sources to reflect (otherwise it reads as pure black).
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#8f8f97");
  g.addColorStop(0.32, "#3a3a42");
  g.addColorStop(0.55, "#121215");
  g.addColorStop(0.78, "#040405");
  g.addColorStop(1, "#161619");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // soft-box key light (top) — a clean highlight band for the metal to catch
  const key = ctx.createRadialGradient(180, 28, 8, 180, 28, 170);
  key.addColorStop(0, "rgba(244,244,248,0.92)");
  key.addColorStop(1, "rgba(244,244,248,0)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, 512, 256);
  // warm gold rim light
  const gold = ctx.createRadialGradient(400, 70, 8, 400, 70, 150);
  gold.addColorStop(0, "rgba(214,180,118,0.85)");
  gold.addColorStop(1, "rgba(200,164,93,0)");
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, 512, 256);
  // cool teal accent
  const teal = ctx.createRadialGradient(60, 150, 8, 60, 150, 140);
  teal.addColorStop(0, "rgba(34,128,156,0.7)");
  teal.addColorStop(1, "rgba(11,95,120,0)");
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, 512, 256);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return env;
}

/** A handful of gold motes drifting around the ring. */
function buildParticles() {
  const COUNT = 90;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 1.4 + Math.random() * 1.6;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc8a45d,
    size: 0.03,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

export default function RingCanvas({
  variant = "silver",
  fallbackSrc,
  fallbackAlt,
  className = "",
  spin = 1,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setFallback(true);
      return;
    }

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const env = buildEnv(renderer);
    scene.environment = env;

    const pal = PALETTE[variant];

    // ---- the ring group ----
    const ring = new THREE.Group();
    ring.rotation.x = -0.42;
    scene.add(ring);

    // band
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.17, 96, 320),
      new THREE.MeshPhysicalMaterial({
        color: pal.metal,
        metalness: 1,
        roughness: 0.3,
        envMapIntensity: 1.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
      })
    );
    ring.add(band);

    // gem — faceted brilliant cut. A crisp reflective dielectric with flat
    // facets + a faint inner glow, rather than transmission (which renders to
    // a separate target and can streak through the bloom composer).
    const gemGeo = new THREE.OctahedronGeometry(0.32, 0);
    gemGeo.scale(1, 1.35, 1);
    const gem = new THREE.Mesh(
      gemGeo,
      new THREE.MeshPhysicalMaterial({
        color: pal.gem,
        metalness: 0,
        roughness: 0.05,
        ior: pal.ior,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.8,
        reflectivity: 1,
        flatShading: true,
        emissive: new THREE.Color(pal.gem),
        emissiveIntensity: 0.12,
      })
    );
    gem.position.set(0, 1.18, 0);
    gem.rotation.y = Math.PI / 4;
    ring.add(gem);

    // prongs holding the gem
    const prongMat = new THREE.MeshPhysicalMaterial({
      color: pal.metal,
      metalness: 1,
      roughness: 0.18,
      envMapIntensity: 1.4,
    });
    for (let i = 0; i < 4; i++) {
      const prong = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.04, 0.34, 12),
        prongMat
      );
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      prong.position.set(Math.cos(a) * 0.22, 1.02, Math.sin(a) * 0.22);
      prong.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      ring.add(prong);
    }

    // lights to add crisp speculars on top of the env
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbfd4dd, 0.5);
    fill.position.set(-4, 1, 3);
    scene.add(fill);
    const warm = new THREE.PointLight(0xc8a45d, 10, 14);
    warm.position.set(-3, 2, 2);
    scene.add(warm);
    const cool = new THREE.PointLight(0x1a7fa0, 8, 14);
    cool.position.set(3, -2, 1);
    scene.add(cool);

    // particles
    const particles = buildParticles();
    scene.add(particles);

    // ---- post: bloom for the sparkle ----
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.32, // strength — gentle, only the brightest glints glow
      0.5, // radius
      0.92 // threshold — keep the metal body crisp, not blooming
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ---- interaction ----
    const pointer = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // scroll adds a slow extra rotation
    let scrollT = 0;
    const onScroll = () => {
      scrollT = window.scrollY * 0.0006;
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

    // pause when off-screen
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    let curRotX = -0.42;
    let curRotY = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      const t = clock.getElapsedTime();

      const targetY = pointer.x * 0.5 + t * 0.18 * spin + scrollT;
      const targetX = -0.42 + pointer.y * 0.3;
      curRotY += (targetY - curRotY) * 0.06;
      curRotX += (targetX - curRotX) * 0.06;
      ring.rotation.y = curRotY;
      ring.rotation.x = curRotX;

      gem.rotation.y += 0.004;
      particles.rotation.y = t * 0.04;
      particles.rotation.x = Math.sin(t * 0.2) * 0.1;

      composer.render();
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      env.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container)
        container.removeChild(renderer.domElement);
    };
  }, [variant, spin]);

  if (fallback) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={fallbackSrc}
          alt={fallbackAlt}
          fill
          sizes="(max-width: 768px) 80vw, 540px"
          className="ring-cutout object-contain"
        />
      </div>
    );
  }

  return (
    <div
      ref={mount}
      className={className}
      role="img"
      aria-label={fallbackAlt}
    />
  );
}
