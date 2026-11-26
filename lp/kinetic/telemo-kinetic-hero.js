(() => {
  const photoLetters = document.querySelector(".kinetic-hero__wordmark-photo");
  if (!photoLetters || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let queued = false;
  const update = () => {
    const shift = Math.min(30, Math.max(0, window.scrollY * 0.08));
    photoLetters.style.setProperty("--photo-shift", `${shift}px`);
    queued = false;
  };
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
})();
