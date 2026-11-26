// ドキュメンタリー調ヒーロー（hero-documentary.css の補助）。
// 映像（assets/hero/callcenter-hero.*：写真1枚から Blender で作った 12 秒のループ）を、
// 画面外・タブ非表示では一時停止し、戻ったら再生する。
// prefers-reduced-motion: reduce のときは止めて先頭（ポスターと同じ静止画）に戻し、設定の変更も監視する。
// スクロール中は映像を 0.1 倍だけ遅らせて奥行きを出す。
(function () {
  "use strict";
  const hero = document.querySelector(".doc-hero");
  if (!hero) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layer = hero.querySelector(".doc-hero__parallax");
  const video = hero.querySelector(".doc-hero__video");
  let inView = true;

  function update() {
    if (!video) return;
    if (reduce.matches) {
      video.pause();
      video.currentTime = 0;
    } else if (inView && !document.hidden) {
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {}); // 自動再生を拒否されたらポスターのまま
    } else {
      video.pause();
    }
  }

  // ---- スクロール連動の奥行き ----
  let ticking = false;
  function parallax() {
    ticking = false;
    if (!layer || reduce.matches || !inView) return;
    const y = Math.min(window.scrollY, hero.offsetHeight);
    layer.style.transform = "translate3d(0, " + (y * 0.1).toFixed(1) + "px, 0)";
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });

  // ---- 画面外・タブ非表示・設定変更 ----
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      hero.classList.toggle("is-offscreen", !inView);
      update();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", update);
  reduce.addEventListener("change", () => {
    if (reduce.matches && layer) layer.style.transform = "";
    update();
  });

  update();
  parallax();
})();
