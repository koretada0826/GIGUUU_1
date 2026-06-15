"use client";

import { useEffect, useRef, ElementType } from "react";
import { gsap, ScrollTrigger, registerGsap, splitWords } from "@/lib/animations";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** start trigger position, defaults to "top 82%" */
  start?: string;
};

/**
 * Masked word reveal — words rise out of a clip like light catching them.
 * Falls back to a plain static render under prefers-reduced-motion.
 */
export default function RevealText({
  text,
  as: Tag = "p",
  className = "",
  delay = 0,
  stagger = 0.06,
  start = "top 82%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const words = splitWords(el);
      gsap.set(words, { yPercent: 110 });
      gsap.to(words, {
        yPercent: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: { trigger: el, start },
      });
    }, el);

    return () => ctx.revert();
  }, [text, delay, stagger, start]);

  return (
    <Tag ref={ref as never} className={className}>
      {text}
    </Tag>
  );
}
