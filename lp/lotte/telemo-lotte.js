/* =============================================================
   TELEMO LP（参考サイトの構図を取り入れたデザイン）用スクリプト
   - 各セクションの処理は、そのセクションの root 要素以下に限定する
   - グローバル変数を作らない（IIFE）
   ============================================================= */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1. Header：SP の MENU ドロワー ---------- */
  function initHeader() {
    var root = document.getElementById("tl-header");
    if (!root) return;
    var btn = root.querySelector("#tl-menu-btn");
    var nav = root.querySelector("#tl-gnav");
    if (!btn || !nav) return;
    var sp = window.matchMedia("(max-width: 767px)");

    function isOpen() {
      return btn.getAttribute("aria-expanded") === "true";
    }
    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      root.classList.toggle("is-open", open);
    }

    btn.addEventListener("click", function () {
      setOpen(!isOpen());
    });
    // Esc で閉じて、フォーカスをボタンへ戻す
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && isOpen()) {
        setOpen(false);
        btn.focus();
      }
    });
    // ドロワー内のリンクを押したら閉じる
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setOpen(false);
    });
    // PC 幅に戻ったら閉じた状態にそろえる
    var onChange = function () {
      if (!sp.matches) setOpen(false);
    };
    if (sp.addEventListener) sp.addEventListener("change", onChange);
    else if (sp.addListener) sp.addListener(onChange);
  }

  /* ---------- 2. Hero：管理画面ビジュアルの自動送り ----------
     参考サイトのメインビジュアルと同じ動き：6.5 秒ごとに自動送り、0.5 秒でスライド、
     hover／フォーカス中は停止、末尾から先頭へループ。一時停止ボタンあり。
     prefers-reduced-motion では自動送りせず、切り替えも瞬時。タブ非表示中は止める。 */
  function initHero() {
    var root = document.getElementById("hero");
    if (!root || !root.classList.contains("tl-hero")) return;
    var visual = root.querySelector(".tl-hero__visual");
    var track = root.querySelector(".tl-app__track");
    var controls = root.querySelector(".tl-hero__controls");
    if (!visual || !track || !controls) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll(".tl-app__slide"));
    var dots = Array.prototype.slice.call(controls.querySelectorAll(".tl-hero__dot"));
    var prevBtn = controls.querySelector(".tl-hero__arrow--prev");
    var nextBtn = controls.querySelector(".tl-hero__arrow--next");
    var pauseBtn = controls.querySelector(".tl-hero__pause");
    var sideItems = Array.prototype.slice.call(root.querySelectorAll("[data-tl-side]"));
    var titleEl = root.querySelector("[data-tl-title]");
    var n = slides.length;
    if (n < 2) return;

    var INTERVAL = 6500;
    var SPEED = 500;
    var EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

    // ループ用に先頭のスライドを末尾へ複製（読み上げ対象外）
    var clone = slides[0].cloneNode(true);
    clone.classList.remove("is-active");
    clone.classList.add("is-clone");
    clone.removeAttribute("role");
    clone.removeAttribute("aria-roledescription");
    clone.removeAttribute("aria-label");
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);

    var current = 0; // 表示中のスライド（0..n-1）
    var pos = 0; // トラック上の位置（0..n、n は複製）
    var moving = false;
    var arriveTimer = null;
    var autoTimer = null;
    var userPaused = reducedMotion.matches;
    var hoverPaused = false;
    var focusPaused = false;

    /* ① コール数のカウントアップ（複製側も同じ値にそろえる） */
    var countEls = Array.prototype.slice.call(track.querySelectorAll("[data-tl-count]"));
    var remainEls = Array.prototype.slice.call(track.querySelectorAll("[data-tl-remain]"));
    var countTarget = countEls.length ? parseInt(countEls[0].getAttribute("data-tl-count"), 10) : 0;
    var countMax = countEls.length ? parseInt(countEls[0].getAttribute("data-tl-max"), 10) : 0;
    var countRaf = null;
    function renderCount(value) {
      var v = Math.round(value);
      var text = v.toLocaleString("ja-JP");
      var remain = Math.max(countMax - v, 0).toLocaleString("ja-JP");
      countEls.forEach(function (el) { el.textContent = text; });
      remainEls.forEach(function (el) { el.textContent = remain; });
      if (countMax) track.style.setProperty("--tl-meter", (v / countMax).toFixed(4));
    }
    function startCount() {
      if (!countEls.length) return;
      cancelAnimationFrame(countRaf);
      if (reducedMotion.matches) { renderCount(countTarget); return; }
      var start = null;
      var dur = 1600;
      var from = 0;
      renderCount(from);
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        renderCount(from + (countTarget - from) * eased);
        if (p < 1) countRaf = requestAnimationFrame(step);
      }
      countRaf = requestAnimationFrame(step);
    }
    function resetCount() {
      if (!countEls.length || reducedMotion.matches) return;
      cancelAnimationFrame(countRaf);
      renderCount(0);
    }

    function setPos(p, animate) {
      track.style.transition = animate ? "transform " + SPEED + "ms " + EASE : "none";
      track.style.transform = "translateX(" + -100 * p + "%)";
      pos = p;
    }

    function updateState() {
      slides.forEach(function (s, i) {
        if (i === current) s.removeAttribute("aria-hidden");
        else s.setAttribute("aria-hidden", "true");
      });
      dots.forEach(function (d, i) {
        if (i === current) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      sideItems.forEach(function (el) {
        el.classList.toggle("is-current", el.getAttribute("data-tl-side") === String(current));
      });
      if (titleEl) titleEl.textContent = slides[current].getAttribute("data-tl-name") || "";
    }

    // スライドが止まった時点の処理（複製から本物へ戻す・画面ごとの演出）
    function arrive() {
      clearTimeout(arriveTimer);
      moving = false;
      if (pos === n) setPos(0, false);
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === current); });
      clone.classList.toggle("is-active", false);
      if (current === 0) startCount();
      else resetCount();
    }

    function goTo(index, dir) {
      if (moving) arrive();
      var from = current;
      var to = ((index % n) + n) % n;
      if (to === from) return;
      current = to;
      updateState();
      if (reducedMotion.matches) {
        setPos(to, false);
        arrive();
      } else {
        var target = to;
        if (dir > 0 && to === 0 && from === n - 1) target = n; // 末尾→先頭は複製へ進めてから戻す
        if (dir < 0 && to === n - 1 && from === 0) {
          setPos(n, false); // 先頭→末尾は複製の位置から戻る
          void track.offsetWidth;
        }
        moving = true;
        setPos(target, true);
        arriveTimer = setTimeout(arrive, SPEED + 150); // transitionend が来ない場合の保険
      }
      schedule();
    }

    track.addEventListener("transitionend", function (e) {
      if (e.target === track && e.propertyName === "transform" && moving) arrive();
    });

    /* 自動送り */
    function playing() {
      return !userPaused && !hoverPaused && !focusPaused && !document.hidden;
    }
    function schedule() {
      clearTimeout(autoTimer);
      autoTimer = null;
      if (playing()) {
        autoTimer = setTimeout(function () { goTo(current + 1, 1); }, INTERVAL);
      }
    }
    function setUserPaused(p) {
      userPaused = p;
      pauseBtn.classList.toggle("is-paused", p);
      pauseBtn.setAttribute("aria-label", p ? "自動切り替えを再生" : "自動切り替えを停止");
      track.setAttribute("aria-live", p ? "polite" : "off");
      if (!p) { hoverPaused = false; focusPaused = false; }
      schedule();
    }

    prevBtn.addEventListener("click", function () { goTo(current - 1, -1); });
    nextBtn.addEventListener("click", function () { goTo(current + 1, 1); });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { goTo(i, i > current ? 1 : -1); });
    });
    pauseBtn.addEventListener("click", function () { setUserPaused(!userPaused); });

    [visual, controls].forEach(function (el) {
      el.addEventListener("mouseenter", function () { hoverPaused = true; schedule(); });
      el.addEventListener("mouseleave", function () { hoverPaused = false; schedule(); });
    });
    controls.addEventListener("focusin", function () { focusPaused = true; schedule(); });
    controls.addEventListener("focusout", function (e) {
      if (!controls.contains(e.relatedTarget)) { focusPaused = false; schedule(); }
    });
    document.addEventListener("visibilitychange", schedule);

    root.classList.add("is-ready");
    setPos(0, false);
    updateState();
    setUserPaused(userPaused);
    arrive();
  }

  initHeader();
  initHero();
})();
