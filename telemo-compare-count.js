// #telemo-compare の数字(40 / 4,400 / 約5倍 / 35 / 22,000)を、画面に入ったとき一度だけカウントアップする。
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll("#telemo-compare .num[data-num]").forEach(el => {
    if (el.dataset.counted) return;
    const final = el.textContent;
    const target = parseFloat(el.dataset.num);
    if (isNaN(target)) return;
    const fmt = v => Math.round(v).toLocaleString("en-US");
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => {
        if (el.dataset.counted) return;
        el.dataset.counted = "1";
        el.textContent = fmt(0);
        gsap.to(o, {
          v: target, duration: 1.4, ease: "power3.out",
          onUpdate: () => { el.textContent = fmt(o.v); },
          onComplete: () => { el.textContent = final; }
        });
      }
    });
  });
})();
