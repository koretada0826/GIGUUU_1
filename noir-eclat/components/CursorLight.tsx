"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A faint light that trails the cursor (PC only). Brightens near elements
 * marked with [data-glow]. Uses rAF + CSS vars — no React re-renders per move.
 */
export default function CursorLight() {
  const lightRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!fine || reduced) return;
    setEnabled(true);

    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    current.current = { ...target.current };

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      const el = (e.target as HTMLElement)?.closest?.("[data-glow]");
      if (lightRef.current) {
        lightRef.current.style.opacity = el ? "1.6" : "1";
      }
    };

    let raf = 0;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      const root = document.documentElement;
      root.style.setProperty("--mx", `${current.current.x}px`);
      root.style.setProperty("--my", `${current.current.y}px`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!enabled) return null;
  return <div ref={lightRef} className="cursor-light" aria-hidden />;
}
