"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/animations";
import { COLLECTION } from "@/lib/constants";
import { useIsMobile } from "@/lib/useIsMobile";
import SectionLabel from "./ui/SectionLabel";

export default function HorizontalCollection() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    registerGsap();
    if (isMobile) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".h-panel");
      const distance = () => track.current!.scrollWidth - window.innerWidth;

      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) =>
            setCurrent(
              Math.round(self.progress * (panels.length - 1))
            ),
        },
      });

      // parallax on each ring image
      panels.forEach((panel) => {
        const img = panel.querySelector(".h-img");
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -8, rotate: -3 },
            {
              xPercent: 8,
              rotate: 3,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: () => `+=${distance()}`,
                scrub: 1,
              },
            }
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, [isMobile]);

  // ---- MOBILE: vertical stack with fades --------------------------------
  if (isMobile) {
    return (
      <section id="collection" className="relative px-6 py-28">
        <SectionLabel index="04" className="mb-14">
          The Collection
        </SectionLabel>
        <div className="space-y-28">
          {COLLECTION.map((c) => (
            <motion.article
              key={c.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className="relative mx-auto aspect-[4/5] w-full overflow-hidden"
                style={{
                  background: `radial-gradient(60% 60% at 50% 45%, ${c.tint}33, transparent 70%)`,
                }}
              >
                <Image
                  src={c.image}
                  alt={`${c.name} — NOIR ÉCLAT collection`}
                  fill
                  sizes="100vw"
                  className="object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
                />
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <span className="font-serif text-2xl text-gold/80">{c.n}</span>
                <span className="eyebrow">0{COLLECTION.indexOf(c) + 1}</span>
              </div>
              <h3 className="display mt-2 text-3xl text-diamond">{c.name}</h3>
              <p className="mt-3 text-sm font-light text-smoke">{c.line}</p>
            </motion.article>
          ))}
        </div>
      </section>
    );
  }

  // ---- DESKTOP: horizontal pinned scroll --------------------------------
  return (
    <section id="collection" ref={root} className="relative overflow-hidden">
      {/* heading floats over the first panel */}
      <div className="pointer-events-none absolute left-12 top-12 z-20">
        <SectionLabel index="04">The Collection</SectionLabel>
      </div>
      {/* live panel counter */}
      <div className="pointer-events-none absolute bottom-10 right-12 z-20 flex items-end gap-2">
        <span className="font-serif text-5xl leading-none text-gold-foil">
          0{current + 1}
        </span>
        <span className="eyebrow mb-1">/ 0{COLLECTION.length}</span>
      </div>

      <div ref={track} className="h-track">
        {COLLECTION.map((c, i) => (
          <article
            key={c.name}
            className="h-panel relative flex items-center justify-center"
          >
            {/* per-panel light wash */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(45% 55% at 50% 50%, ${c.tint}40, transparent 70%)`,
              }}
            />
            <div className="relative z-10 grid w-full max-w-[1300px] grid-cols-12 items-center gap-8 px-16">
              <div className="col-span-5">
                <span className="font-serif text-6xl text-gold/70">{c.n}</span>
                <h3 className="display mt-4 text-[clamp(3rem,6vw,6rem)] text-diamond">
                  {c.name}
                </h3>
                <p className="mt-6 max-w-sm text-sm font-light leading-relaxed tracking-wide text-smoke">
                  {c.line}
                </p>
                <span className="mt-8 inline-block eyebrow text-gold/70">
                  0{i + 1} — NOIR ÉCLAT
                </span>
              </div>
              <div className="col-span-7">
                <div className="relative mx-auto aspect-square w-[min(40vw,560px)]">
                  <Image
                    src={c.image}
                    alt={`${c.name} — NOIR ÉCLAT collection`}
                    fill
                    sizes="40vw"
                    className="h-img object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
