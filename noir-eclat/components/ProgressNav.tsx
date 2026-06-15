"use client";

import { useEffect, useState } from "react";
import { NAV_SECTIONS, SectionId } from "@/lib/constants";

/**
 * Vertical progress navigation pinned to the right edge.
 * Tracks the active section via IntersectionObserver and grows a thin line
 * with overall scroll progress. Hidden on small screens.
 */
export default function ProgressNav() {
  const [active, setActive] = useState<SectionId>("hero");
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
        setVisible(window.scrollY > window.innerHeight * 0.6);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className={`fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-5 transition-opacity duration-700 lg:flex ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* progress rail */}
      <div className="absolute right-[3px] top-0 h-full w-px bg-platinum/10">
        <div
          className="absolute left-0 top-0 w-px bg-gold/80"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {NAV_SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            aria-label={`Go to ${s.label}`}
            aria-current={on ? "true" : undefined}
            className="group relative flex items-center gap-3 pr-5 text-right"
          >
            <span
              className={`whitespace-nowrap text-[0.58rem] uppercase tracking-[0.3em] transition-all duration-500 ${
                on
                  ? "text-platinum opacity-100"
                  : "text-smoke opacity-0 group-hover:opacity-70"
              }`}
            >
              <span className="text-gold/70">{s.index}</span>&nbsp;&nbsp;{s.label}
            </span>
            <span
              className={`block h-px transition-all duration-500 ${
                on ? "w-6 bg-gold" : "w-3 bg-platinum/30 group-hover:w-4"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
