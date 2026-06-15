"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { IMAGES } from "@/lib/constants";
import SectionLabel from "./ui/SectionLabel";

const ITEMS = [
  {
    n: "01",
    k: "Stone",
    body: "A cut designed to hold silence and light in equal measure.",
  },
  {
    n: "02",
    k: "Metal",
    body: "Mirror-polished curves shaped with architectural precision.",
  },
  {
    n: "03",
    k: "Light",
    body: "Each reflection is composed, never accidental.",
  },
];

export default function Craftsmanship() {
  return (
    <section
      id="craft"
      className="relative overflow-hidden py-40"
    >
      {/* marble texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden>
        <Image
          src={IMAGES.bgBlackMarble}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-base/60" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <SectionLabel index="06" className="mb-6">
          Craftsmanship
        </SectionLabel>
        <h2 className="display max-w-2xl text-[clamp(2rem,4.5vw,3.4rem)] text-diamond">
          The value of a piece lives in what you cannot see at a glance.
        </h2>

        <div className="mt-24 grid grid-cols-1 gap-px md:grid-cols-3">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative px-2 py-10 md:px-10"
            >
              {/* drawn top line */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.2,
                  delay: 0.2 + i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute left-0 top-0 h-px w-full origin-left bg-gradient-to-r from-gold/60 to-transparent"
              />
              <span className="font-serif text-6xl text-gold/30 transition-colors duration-500 group-hover:text-gold/70">
                {it.n}
              </span>
              <h3 className="mt-8 text-sm uppercase tracking-[0.32em] text-platinum">
                {it.k}
              </h3>
              <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-smoke">
                {it.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
