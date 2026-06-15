"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import RevealText from "./ui/RevealText";
import SectionLabel from "./ui/SectionLabel";
import { IMAGES } from "@/lib/constants";

const LINES = [
  "A jewel is not worn.",
  "It is revealed.",
  "In darkness, light finds its shape.",
];

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative flex min-h-[110svh] items-center justify-center overflow-hidden py-40"
    >
      {/* faint gold dust drift */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30" aria-hidden>
        <Image
          src={IMAGES.bgGoldDust}
          alt=""
          fill
          sizes="100vw"
          className="object-cover mix-blend-screen"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(0,0,0,0)_30%,rgba(3,3,3,0.9)_100%)]" />

      <div className="mx-auto max-w-5xl px-6 text-center">
        <SectionLabel index="02" align="center" className="mb-16">
          Manifesto
        </SectionLabel>

        <div className="space-y-2 md:space-y-3">
          {LINES.map((line, i) => (
            <RevealText
              key={line}
              text={line}
              as="p"
              stagger={0.07}
              start="top 78%"
              className={`display text-[clamp(1.8rem,5.2vw,4rem)] ${
                i === 1 ? "text-gold-foil italic" : "text-diamond"
              }`}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 max-w-xl text-sm font-light leading-loose tracking-wide text-smoke"
        >
          NOIR ÉCLAT is a private study of reflection, silence, and desire —
          where each piece is composed to be witnessed, not displayed.
        </motion.p>
      </div>
    </section>
  );
}
