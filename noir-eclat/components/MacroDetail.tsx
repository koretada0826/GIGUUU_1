"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/animations";
import { IMAGES } from "@/lib/constants";

export default function MacroDetail() {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img.current,
        { scale: 1, clipPath: "inset(12% 12% 12% 12%)" },
        {
          scale: 1.18,
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
      gsap.to(".macro-streak", {
        xPercent: 220,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top center",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="macro"
      ref={root}
      className="relative flex min-h-[120svh] items-center justify-center overflow-hidden py-20"
    >
      {/* full-bleed macro */}
      <div ref={img} className="absolute inset-0 -z-10 will-change-transform">
        <Image
          src={IMAGES.ringBlueGoldMacro}
          alt="Macro study of a sapphire facet catching the light"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-base/45" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_40%,rgba(3,3,3,0.85)_100%)]" />
      </div>

      {/* diagonal light streak */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="macro-streak absolute -left-1/3 top-0 h-full w-[18%] -skew-x-[18deg] bg-gradient-to-r from-transparent via-gold/15 to-transparent blur-md mix-blend-screen" />
      </div>

      {/* drifting particles */}
      <Particles />

      <div className="relative z-10 px-6 text-center">
        <h2 className="display text-[clamp(2.6rem,9vw,7rem)] leading-[0.95] text-diamond">
          DETAILS
          <br />
          THAT HOLD
          <br />
          <span className="text-gold-foil italic">THE LIGHT</span>
        </h2>
        <p className="mx-auto mt-8 max-w-md text-xs font-light leading-relaxed tracking-[0.2em] text-smoke">
          Every facet is designed to catch what the eye almost misses.
        </p>
      </div>
    </section>
  );
}

/** A handful of slow gold motes — CSS-animated, cheap. */
function Particles() {
  const motes = [
    { l: "20%", t: "30%", d: "0s", s: 3 },
    { l: "70%", t: "25%", d: "1.4s", s: 2 },
    { l: "40%", t: "65%", d: "0.8s", s: 4 },
    { l: "82%", t: "60%", d: "2.1s", s: 2 },
    { l: "55%", t: "45%", d: "1.1s", s: 3 },
    { l: "30%", t: "78%", d: "2.6s", s: 2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/70 mix-blend-screen"
          style={{
            left: m.l,
            top: m.t,
            width: m.s,
            height: m.s,
            boxShadow: "0 0 8px 2px rgba(200,164,93,0.5)",
            animation: `mote 7s ease-in-out ${m.d} infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes mote {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-24px) scale(1.6); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          span { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
