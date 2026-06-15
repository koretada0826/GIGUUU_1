"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Opening light-reveal. A point of light gathers, the wordmark resolves,
 * then the overlay lifts to Hero. Locks scroll until done (~2.4s).
 *
 * The fade-out is a CSS transition and the unmount is timer-driven, so the
 * overlay always clears even if the tab is backgrounded mid-intro (where
 * rAF-based exit animations would otherwise freeze).
 */
export default function Intro() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";

    const hold = reduced ? 400 : 2400;
    const unlock = () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
    };

    const t1 = setTimeout(() => {
      setLeaving(true);
      unlock();
    }, hold);
    const t2 = setTimeout(() => setGone(true), hold + 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      unlock();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base transition-opacity duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : "auto" }}
      aria-hidden={leaving}
    >
      {/* gathering light */}
      <motion.div
        className="pointer-events-none absolute h-[2px] w-[2px] rounded-full bg-diamond"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 60, 240],
          opacity: [0, 1, 0],
          boxShadow: [
            "0 0 0px 0px rgba(200,164,93,0)",
            "0 0 40px 12px rgba(200,164,93,0.5)",
            "0 0 120px 40px rgba(200,164,93,0)",
          ],
        }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h1
          className="display text-gold-foil text-[clamp(2.4rem,8vw,5.2rem)] tracking-[0.12em]"
          initial={{ opacity: 0, letterSpacing: "0.5em", filter: "blur(14px)" }}
          animate={{ opacity: 1, letterSpacing: "0.12em", filter: "blur(0px)" }}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          NOIR&nbsp;ÉCLAT
        </motion.h1>
        <motion.p
          className="eyebrow mt-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          Private Jewelry Maison
        </motion.p>
      </div>
    </div>
  );
}
