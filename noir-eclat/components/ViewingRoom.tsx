"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { VIEWING_ROOM } from "@/lib/constants";
import SectionLabel from "./ui/SectionLabel";

export default function ViewingRoom() {
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const x = px / r.width - 0.5;
    const y = py / r.height - 0.5;
    setTilt({ x: -y * 8, y: x * 10 });
    setCursor({ x: px, y: py });
  };

  const piece = VIEWING_ROOM[active];

  return (
    <section
      id="viewing"
      className="relative overflow-hidden py-32 md:py-40"
    >
      {/* exhibition room gradient floor/walls */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_50%_35%,rgba(20,20,20,0.9),#030303_75%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 -z-10 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel index="07" className="mb-6">
              Viewing Room
            </SectionLabel>
            <h2 className="display text-[clamp(2.2rem,5vw,3.8rem)] text-diamond">
              A room for looking,
              <br />
              <span className="text-gold-foil italic">not for buying.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm font-light leading-relaxed text-smoke">
            Each piece is presented alone, under its own light. Move between
            them as you would in a private gallery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
          {/* left labels */}
          <ul className="order-2 flex flex-col gap-1 md:order-1 md:col-span-3">
            {VIEWING_ROOM.map((p, i) => (
              <li key={p.name}>
                <button
                  data-glow
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className="group flex w-full items-center justify-between border-b border-platinum/10 py-4 text-left transition-colors duration-500"
                >
                  <span
                    className={`text-sm uppercase tracking-[0.18em] transition-all duration-500 ${
                      active === i
                        ? "text-diamond"
                        : "text-smoke/70 group-hover:text-platinum"
                    }`}
                  >
                    {p.name}
                  </span>
                  <span
                    className={`h-px transition-all duration-500 ${
                      active === i
                        ? "w-8 bg-gold"
                        : "w-3 bg-platinum/20 group-hover:w-5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* center stage */}
          <div className="order-1 md:order-2 md:col-span-6">
            <div
              ref={stage}
              data-glow
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => {
                setHovering(false);
                setTilt({ x: 0, y: 0 });
              }}
              onMouseMove={onMove}
              className="relative mx-auto aspect-square w-full max-w-[560px] cursor-none"
              style={{ perspective: "1200px" }}
            >
              <motion.div
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* soft reflection */}
                <div className="absolute inset-x-10 bottom-0 h-1/3 scale-y-[-1] opacity-20 blur-md">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={piece.name + "r"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={piece.image}
                        alt=""
                        fill
                        sizes="560px"
                        className="object-contain mix-blend-screen"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={piece.name}
                    initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={piece.image}
                      alt={`${piece.name} — ${piece.meta}`}
                      fill
                      sizes="560px"
                      className="object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.65)]"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* cursor VIEW tag */}
              <motion.span
                animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ left: cursor.x, top: cursor.y }}
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40 bg-base/40 px-4 py-2 text-[0.55rem] uppercase tracking-[0.3em] text-gold backdrop-blur-sm"
              >
                View
              </motion.span>
            </div>
          </div>

          {/* right meta */}
          <div className="order-3 md:col-span-3 md:pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={piece.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <span className="eyebrow text-gold/70">
                  Piece 0{active + 1} / 0{VIEWING_ROOM.length}
                </span>
                <h3 className="display mt-4 text-3xl text-diamond">
                  {piece.name}
                </h3>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-smoke">
                  {piece.meta}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
