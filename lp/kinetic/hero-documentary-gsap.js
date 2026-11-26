(() => {
  "use strict";
  const hero = document.querySelector(".doc-hero");
  const gsap = window.gsap;
  if (!hero || !gsap) return;
  const camera = hero.querySelector(".doc-hero__camera");
  const photo = hero.querySelector(".doc-hero__photo");
  if (!camera || !photo) return;
  const media = gsap.matchMedia();
  let hasRevealed = false;
  function start() {
    media.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)", reduced: "(prefers-reduced-motion: reduce)" }, context => {
      if (context.conditions.reduced) return;
      let onscreen = false;
      // Full outward-and-back cycle: eight seconds; no reset at loop boundaries.
      const drift = gsap.fromTo(camera, { xPercent: -.3, scale: 1 }, {
        xPercent: .3, scale: context.conditions.mobile ? 1.02 : 1.03,
        duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut", force3D: true, paused: true
      });
      const reveal = gsap.timeline({ paused: true });
      const targets = [hero.querySelector(".doc-hero__eyebrow"), ...hero.querySelectorAll(".doc-hero__title span"), hero.querySelector(".doc-hero__lead"), ...hero.querySelectorAll(".doc-hero__actions a"), hero.querySelector(".doc-hero__signature")].filter(Boolean);
      const showEntrance = !hasRevealed && !location.hash && window.scrollY < hero.offsetHeight;
      if (showEntrance) reveal.from(targets, { opacity: 0, y: 10, duration: .8, stagger: .1, ease: "power2.out", clearProps: "opacity,transform", immediateRender: false });
      const sync = () => {
        const active = onscreen && !document.hidden;
        hero.classList.toggle("is-camera-active", active);
        if (active) {
          drift.resume();
          if (showEntrance && !hasRevealed) { hasRevealed = true; reveal.play(); }
          else if (reveal.progress() > 0 && reveal.progress() < 1) reveal.resume();
        } else { drift.pause(); reveal.pause(); }
      };
      const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => { onscreen = entries[0].isIntersecting; sync(); }, { threshold: 0 }) : null;
      if (observer) observer.observe(hero); else { onscreen = true; sync(); }
      const settle = () => reveal.progress(1);
      const hide = () => { drift.pause(); reveal.pause(); };
      hero.addEventListener("focusin", settle);
      hero.addEventListener("pointerdown", settle);
      document.addEventListener("visibilitychange", sync);
      window.addEventListener("pagehide", hide);
      window.addEventListener("pageshow", sync);
      return () => {
        observer?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("pagehide", hide);
        window.removeEventListener("pageshow", sync);
        hero.removeEventListener("focusin", settle);
        hero.removeEventListener("pointerdown", settle);
        hero.classList.remove("is-camera-active");
      };
    }, hero);
  }
  if (photo.complete) start();
  else { photo.addEventListener("load", start, { once: true }); photo.addEventListener("error", start, { once: true }); }
})();
