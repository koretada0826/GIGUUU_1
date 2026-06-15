"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Presents a real product photo as the focal jewel: a transparent PNG floating
 * over the WebGL atmosphere, with a mouse-driven 3D tilt, a slow float, a
 * travelling specular light-sweep, gold motes and a soft halo.
 *
 * The photo is a plain <Image> so its alpha composites perfectly — the Three.js
 * "wow" lives in the global shader atmosphere behind it.
 */
export default function RingShowcase({
  src,
  alt,
  className = "",
  priority = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!fine || reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setTilt({ x: -y * 12, y: x * 16, px: x * 26, py: y * 18 })
      );
    };
    const onLeave = () => setTilt({ x: 0, y: 0, px: 0, py: 0 });
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: "1400px" }}
    >
      {/* soft halo */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(42%_42%_at_50%_46%,rgba(200,164,93,0.28),rgba(11,95,120,0.14)_45%,transparent_72%)] blur-2xl" />

      {/* floating jewel with parallax tilt */}
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          x: tilt.px,
          y: tilt.py,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 18, mass: 0.6 }}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ y: [0, -14, 0, 10, 0], rotate: [0, 0.6, 0, -0.6, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 78vw, 520px"
            className="select-none object-contain drop-shadow-[0_40px_70px_rgba(0,0,0,0.65)]"
            draggable={false}
          />

          {/* travelling specular light-sweep, clipped to the image box */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ring-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/22 to-transparent mix-blend-screen blur-[2px]" />
          </div>
        </motion.div>
      </motion.div>

      {/* gold motes drifting around the jewel */}
      <Motes />

      <style jsx>{`
        .ring-sweep {
          animation: ringSweep 5.5s ease-in-out infinite;
        }
        @keyframes ringSweep {
          0% {
            transform: translateX(0) skewX(-12deg);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          45% {
            opacity: 1;
          }
          60%,
          100% {
            transform: translateX(360%) skewX(-12deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ring-sweep {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function Motes() {
  const motes = [
    { l: "18%", t: "24%", d: "0s", s: 3 },
    { l: "78%", t: "30%", d: "1.2s", s: 2 },
    { l: "30%", t: "70%", d: "0.6s", s: 4 },
    { l: "84%", t: "62%", d: "1.9s", s: 2 },
    { l: "60%", t: "20%", d: "2.4s", s: 3 },
    { l: "46%", t: "82%", d: "1.5s", s: 2 },
    { l: "12%", t: "52%", d: "0.9s", s: 2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-[5]" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/80 mix-blend-screen"
          style={{
            left: m.l,
            top: m.t,
            width: m.s,
            height: m.s,
            boxShadow: "0 0 10px 2px rgba(200,164,93,0.55)",
            animation: `mote 8s ease-in-out ${m.d} infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes mote {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-22px) scale(1.5);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
