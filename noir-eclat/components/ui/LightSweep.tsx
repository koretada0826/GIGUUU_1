"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animations";

type Props = {
  /** seconds between sweeps; 0 = only on parent hover (controlled by CSS group) */
  interval?: number;
  className?: string;
};

/**
 * A thin light streak that travels across its positioned parent.
 * Used over rings / CTAs. Parent must be `relative overflow-hidden`.
 */
export default function LightSweep({ interval = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interval) return;
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: interval });
    tl.fromTo(
      el,
      { xPercent: 0, opacity: 0 },
      {
        xPercent: 460,
        opacity: 1,
        duration: 1.6,
        ease: "power2.inOut",
        keyframes: { opacity: [0, 1, 1, 0] },
      }
    );
    return () => {
      tl.kill();
    };
  }, [interval]);

  return <div ref={ref} className={`sweep ${className}`} aria-hidden />;
}
