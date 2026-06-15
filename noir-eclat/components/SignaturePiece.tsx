"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/animations";
import { IMAGES } from "@/lib/constants";
import SectionLabel from "./ui/SectionLabel";
import LightSweep from "./ui/LightSweep";

const RingShowcase = dynamic(() => import("./three/RingShowcase"), {
  ssr: false,
});

const STEPS = [
  {
    k: "Overture",
    title: "MIDNIGHT BLOOM",
    body: "A deep blue sapphire held in a bloom of gold and diamond.",
  },
  {
    k: "Material",
    title: "Rose Gold",
    body: "Vine-worked shoulders drawn with architectural precision.",
  },
  {
    k: "Light",
    title: "Diamond Halo",
    body: "A scalloped corona of facets, composed to hold what the eye almost misses.",
  },
];

export default function SignaturePiece() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    registerGsap();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=260%",
        pin: ".piece-stage",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setStep(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
        },
      });

      gsap.fromTo(
        ring.current,
        { scale: 0.85, rotate: -4 },
        {
          scale: 1.15,
          rotate: 4,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=260%",
            scrub: 1,
          },
        }
      );

      // background warms from black to charcoal
      gsap.fromTo(
        ".piece-stage",
        { backgroundColor: "rgba(3,3,3,0)" },
        {
          backgroundColor: "rgba(17,17,17,0.6)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=260%",
            scrub: 1,
          },
        }
      );

      return () => st.kill();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="piece" ref={root} className="relative">
      <div className="piece-stage relative flex min-h-[100svh] items-center overflow-hidden">
        {/* spotlight */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_38%_50%,rgba(200,164,93,0.10),transparent_70%)]" />

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:px-12">
          {/* pinned ring */}
          <div className="relative order-2 md:order-1">
            <div
              ref={ring}
              className="relative mx-auto aspect-[3/4] w-[min(76vw,500px)] will-change-transform"
            >
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_45%,rgba(200,164,93,0.18),rgba(11,95,120,0.10)_45%,transparent_72%)] blur-xl" />
              <RingShowcase
                src={IMAGES.ringRealBlueGold}
                alt="MIDNIGHT BLOOM — blue sapphire ring in rose gold with a diamond halo"
                className="absolute inset-0 h-full w-full"
              />
              <LightSweep interval={3.5} />
            </div>
          </div>

          {/* stepped text */}
          <div className="order-1 md:order-2">
            <SectionLabel index="03" className="mb-10">
              Signature Piece
            </SectionLabel>

            <div className="relative min-h-[18rem]">
              {STEPS.map((s, i) => (
                <div
                  key={s.k}
                  aria-hidden={step !== i}
                  className={`absolute inset-0 transition-all duration-700 ease-luxe ${
                    step === i
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-4 opacity-0"
                  }`}
                >
                  <span className="eyebrow text-gold/80">{s.k}</span>
                  <h3 className="display mt-4 text-[clamp(2.4rem,6vw,4.5rem)] text-diamond">
                    {s.title}
                  </h3>
                  <p className="mt-6 max-w-md text-sm font-light leading-relaxed tracking-wide text-smoke">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            {/* step indicator */}
            <div className="mt-10 flex gap-3">
              {STEPS.map((s, i) => (
                <span
                  key={s.k}
                  className={`h-px transition-all duration-500 ${
                    step === i ? "w-12 bg-gold" : "w-6 bg-platinum/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
