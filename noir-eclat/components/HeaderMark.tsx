"use client";

import { useEffect, useState } from "react";

/**
 * Persistent wordmark, top-left. Hidden over the Hero (where the giant
 * headline already carries the brand) and fades in once you scroll past it,
 * avoiding a collision with the Hero eyebrow.
 */
export default function HeaderMark() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`pointer-events-none fixed left-6 top-6 z-50 transition-opacity duration-700 md:left-10 md:top-8 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <a
        href="#hero"
        className="pointer-events-auto font-serif text-lg tracking-[0.22em] text-diamond/90 transition-colors hover:text-gold"
      >
        NOIR&nbsp;ÉCLAT
      </a>
    </header>
  );
}
