"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/animations";
import { IMAGES } from "@/lib/constants";
import LuxuryButton from "./ui/LuxuryButton";

const RingShowcase = dynamic(() => import("./three/RingShowcase"), {
  ssr: false,
});

const HERO_LINES = ["JEWELRY", "IN THE", "DARK"];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const ringWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.to(ringWrap.current, {
        yPercent: 12,
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".hero-copy", {
        yPercent: -28,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={root}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* top meta row */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-7 md:px-12 md:pt-9">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="eyebrow"
        >
          <span className="text-gold/80">N° 2026</span>
          <span className="mx-3 text-platinum/30">/</span>
          The Private Collection
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="eyebrow hidden md:block"
        >
          Est.&nbsp;MMXXVI — Paris
        </motion.span>
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-center gap-6 px-6 md:grid-cols-12 md:px-12">
        {/* copy */}
        <div className="hero-copy relative z-10 order-2 md:order-1 md:col-span-6">
          <h1 className="display text-[clamp(3.2rem,11vw,9.5rem)]">
            {HERO_LINES.map((line, i) => (
              <span key={line} className="reveal-line">
                <motion.span
                  initial={{ y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 1.3,
                    delay: 0.5 + i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`inline-block ${
                    i === 2 ? "italic text-gold-foil" : "text-diamond"
                  }`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.05 }}
            className="mt-9 max-w-md text-sm font-light leading-relaxed tracking-[0.16em] text-smoke"
          >
            A private collection of light, silence, and desire.
            <br className="hidden sm:block" />
            A jewel is not worn — it is revealed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.25 }}
            className="mt-11 flex flex-wrap items-center gap-4"
          >
            <LuxuryButton href="#collection" data-glow>
              View Collection
            </LuxuryButton>
            <LuxuryButton href="#piece" variant="ghost">
              Discover the Piece
            </LuxuryButton>
          </motion.div>
        </div>

        {/* the real jewel, rendered in Three.js */}
        <div className="relative order-1 md:order-2 md:col-span-6">
          <motion.div
            ref={ringWrap}
            data-glow
            initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto aspect-[3/4] w-[min(78vw,520px)] will-change-transform"
          >
            {/* glow halo behind the jewel */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_45%,rgba(200,164,93,0.22),rgba(11,95,120,0.12)_45%,transparent_72%)] blur-xl" />
            <RingShowcase
              src={IMAGES.ringRealBlueGold}
              alt="NOIR ÉCLAT — Midnight Bloom, a blue sapphire in a halo of gold and diamonds"
              className="absolute inset-0 h-full w-full"
            />
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center"
      >
        <span className="eyebrow block">Scroll</span>
        <span className="mx-auto mt-3 block h-10 w-px overflow-hidden bg-platinum/15">
          <span className="block h-3 w-px animate-[scrollCue_2s_ease-in-out_infinite] bg-gold" />
        </span>
      </motion.div>

      <style jsx>{`
        @keyframes scrollCue {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(333%);
          }
        }
      `}</style>
    </section>
  );
}
