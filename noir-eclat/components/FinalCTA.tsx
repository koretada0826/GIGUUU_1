"use client";

import { motion } from "framer-motion";
import RevealText from "./ui/RevealText";
import LuxuryButton from "./ui/LuxuryButton";

export default function FinalCTA() {
  return (
    <section
      id="cta"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden py-40"
    >
      {/* gathering light */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(200,164,93,0.14),transparent_65%)]" />
      <motion.div
        aria-hidden
        initial={{ opacity: 0.2, scale: 0.9 }}
        whileInView={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.05, 0.9] }}
        viewport={{ once: false }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,164,93,0.18),transparent_60%)] blur-2xl"
      />

      <div className="relative z-10 px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="eyebrow"
        >
          By Private Preview
        </motion.span>

        <div className="mt-8 space-y-1">
          {["ENTER THE", "PRIVATE COLLECTION"].map((line, i) => (
            <RevealText
              key={line}
              text={line}
              as="h2"
              start="top 85%"
              className={`display text-[clamp(2.4rem,8vw,7rem)] leading-[0.95] ${
                i === 1 ? "text-gold-foil italic" : "text-diamond"
              }`}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-10 max-w-sm text-sm font-light leading-relaxed tracking-wide text-smoke"
        >
          NOIR ÉCLAT is shown by appointment only. Light, in private.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <LuxuryButton href="#contact" data-glow>
            Request Private Preview
          </LuxuryButton>
          <LuxuryButton href="#contact" variant="ghost">
            Contact Maison
          </LuxuryButton>
        </motion.div>
      </div>
    </section>
  );
}
