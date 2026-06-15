// Shared GSAP setup + easing/animation primitives used across sections.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins once (client only). */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export const EASE = {
  luxe: "power3.out",
  inOut: "power2.inOut",
  expo: "expo.out",
} as const;

export { gsap, ScrollTrigger };

/** Splits a string into <span> word wrappers for masked reveals (no plugin). */
export function splitWords(el: HTMLElement) {
  const text = el.textContent ?? "";
  el.innerHTML = "";
  const words: HTMLElement[] = [];
  text.split(/(\s+)/).forEach((token) => {
    if (token.trim() === "") {
      el.appendChild(document.createTextNode(token));
      return;
    }
    const outer = document.createElement("span");
    outer.className = "reveal-word";
    const inner = document.createElement("span");
    inner.className = "reveal-word__inner";
    inner.textContent = token;
    outer.appendChild(inner);
    el.appendChild(outer);
    words.push(inner);
  });
  return words;
}
