// =============================================================
// TELEMO LP — 新規JS
// 各セクション root の内側だけを操作する。グローバル変数は作らない。
// =============================================================
(function () {
  "use strict";

  // ---- Header：SP のハンバーガー（aria-expanded 同期 / Escape で閉じてボタンへフォーカス） ----
  var header = document.querySelector(".ta-header");
  if (header) {
    var burger = header.querySelector(".ta-header__burger");
    var nav = header.querySelector("#ta-header-nav");
    if (burger && nav) {
      var setOpen = function (open) {
        header.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      };
      burger.addEventListener("click", function () {
        setOpen(burger.getAttribute("aria-expanded") !== "true");
      });
      header.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
          setOpen(false);
          burger.focus();
        }
      });
      nav.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest("a")) setOpen(false);
      });
    }
  }

  // ---- Hero：管理画面の「今月の発信数」をカウントアップ（reduced-motion では最終値のまま） ----
  var hero = document.querySelector(".ta-hero");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hero && !reduceMotion && window.requestAnimationFrame) {
    var countEl = hero.querySelector("[data-ta-count]");
    var target = countEl ? parseInt(countEl.getAttribute("data-ta-count"), 10) : NaN;
    if (countEl && !isNaN(target)) {
      var startTs = null;
      var duration = 1600;
      countEl.textContent = "0";
      var tick = function (ts) {
        if (startTs === null) startTs = ts;
        var p = Math.min((ts - startTs) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        countEl.textContent = Math.round(target * eased).toLocaleString("ja-JP");
        if (p < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    }
  }
})();
