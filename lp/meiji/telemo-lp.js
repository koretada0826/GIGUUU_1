/* =============================================================
   TELEMO LP — 新デザイン用スクリプト
   各機能は対象セクションの root 内だけを操作する。IIFE でグローバル変数を作らない。
   ============================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header：SP メニュー（button / aria-expanded / Escape） ---------- */
  (function (root) {
    if (!root) return;
    var btn = root.querySelector(".tm-header__toggle");
    var nav = root.querySelector(".tm-header__nav");
    if (!btn || !nav) return;
    root.classList.add("tm-header--js");
    function setOpen(open, returnFocus) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      nav.classList.toggle("tm-is-open", open);
      if (!open && returnFocus) btn.focus();
    }
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true", false);
    });
    root.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && btn.getAttribute("aria-expanded") === "true") {
        e.preventDefault();
        setOpen(false, true);
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setOpen(false, false);
    });
  })(document.querySelector(".tm-header"));

  /* ---------- Hero：管理画面カルーセル（自動送り 5s・フェード 1.5s）とカウントアップ ---------- */
  (function (root) {
    if (!root) return;
    var slides = root.querySelectorAll(".tm-hero__slide");
    var thumbs = root.querySelectorAll(".tm-hero__thumb");
    var cur = 0;
    function show(i) {
      cur = i;
      Array.prototype.forEach.call(slides, function (s, k) {
        s.classList.toggle("tm-is-active", k === i);
        if (k === i) s.removeAttribute("aria-hidden");
        else s.setAttribute("aria-hidden", "true");
      });
      Array.prototype.forEach.call(thumbs, function (t, k) {
        t.classList.toggle("tm-is-active", k === i);
        if (k === i) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
    }
    Array.prototype.forEach.call(thumbs, function (t, k) {
      t.addEventListener("click", function () { if (k !== cur) show(k); });
      // 進捗バーが伸び切ったら次へ（一時停止中はバーも止まる）
      var fill = t.querySelector(".tm-hero__fill");
      if (fill) fill.addEventListener("animationend", function () {
        if (t.classList.contains("tm-is-active")) show((cur + 1) % slides.length);
      });
    });
    // 初期状態：表示中以外のスライドを支援技術から隠す（JS が無いときは全スライドが読める）
    show(0);
    // 自動送りはページの読み込み完了後に開始（読み込み中に1枚目が切り替わらないように）
    var stopped = false;
    if (!reduce && slides.length > 1) {
      var startAutoplay = function () { root.classList.add("tm-is-autoplay"); };
      if (document.readyState === "complete") startAutoplay();
      else window.addEventListener("load", startAutoplay);
      // 利用者が止めるまで止まったままにする停止／再開ボタン
      var thumbsBox = root.querySelector(".tm-hero__thumbs");
      if (thumbsBox) {
        var pauseBtn = document.createElement("button");
        pauseBtn.type = "button";
        pauseBtn.className = "tm-hero__pause";
        var setPauseLabel = function () {
          pauseBtn.setAttribute("aria-pressed", stopped ? "true" : "false");
          pauseBtn.innerHTML = stopped
            ? '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>再開'
            : '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2v8H2zM6 1h2v8H6z"/></svg>停止';
          pauseBtn.setAttribute("aria-label", stopped ? "画面の自動切り替えを再開" : "画面の自動切り替えを停止");
        };
        setPauseLabel();
        pauseBtn.addEventListener("click", function () { stopped = !stopped; setPauseLabel(); sync(); });
        thumbsBox.appendChild(pauseBtn);
      }
    }
    // ホバー／フォーカス中、または停止ボタンで止めている間は一時停止
    var areas = [root.querySelector(".tm-hero__visual"), root.querySelector(".tm-hero__thumbs")];
    var hover = 0, focus = false;
    function sync() { root.classList.toggle("tm-is-paused", stopped || hover > 0 || focus); }
    areas.forEach(function (a) {
      if (!a) return;
      a.addEventListener("mouseenter", function () { hover++; sync(); });
      a.addEventListener("mouseleave", function () { hover = Math.max(0, hover - 1); sync(); });
      a.addEventListener("focusin", function () { focus = true; sync(); });
      a.addEventListener("focusout", function (e) {
        if (!e.relatedTarget || !areas.some(function (x) { return x && x.contains(e.relatedTarget); })) { focus = false; sync(); }
      });
    });

    // 今月の発信数のカウントアップ（JS が無い・動きを減らす設定では最終値のまま）
    var num = root.querySelector("[data-tm-count]");
    if (num && !reduce && window.requestAnimationFrame) {
      var target = parseInt(num.getAttribute("data-tm-count"), 10) || 0;
      var fmt = function (n) { return n.toLocaleString("ja-JP"); };
      num.textContent = fmt(0);
      var t0 = null, delay = 500, dur = 1800;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(Math.max((ts - t0 - delay) / dur, 0), 1);
        num.textContent = fmt(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  })(document.querySelector(".tm-hero"));

  /* ---------- SP スライダー（CSS scroll-snap＋ドット＋四角いボタン。[data-tm-slider] 内だけ） ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".tm-root [data-tm-slider]"), function (root) {
    var track = root.querySelector(".tm-slider__track");
    if (!track) return;
    var items = track.children, n = items.length;
    var mq = window.matchMedia("(max-width: 767px)");
    var arrow = function (dir, label, d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tm-slider__arrow tm-slider__arrow--" + dir;
      b.setAttribute("aria-label", label);
      b.innerHTML = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="' + d + '" /></svg>';
      return b;
    };
    var prev = arrow("prev", "前へ", "M9 2 4 7l5 5");
    var next = arrow("next", "次へ", "M5 2l5 5-5 5");
    var dots = document.createElement("div");
    dots.className = "tm-slider__dots";
    var dotBtns = [];
    for (var i = 0; i < n; i++) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "tm-slider__dot";
      d.setAttribute("aria-label", (i + 1) + "枚目を表示（全" + n + "枚）");
      d.setAttribute("aria-controls", track.id || "");
      dots.appendChild(d);
      dotBtns.push(d);
    }
    if (!track.id) dotBtns.forEach(function (x) { x.removeAttribute("aria-controls"); });
    root.appendChild(prev);
    root.appendChild(next);
    root.appendChild(dots);
    var index = function () {
      var best = 0, min = Infinity;
      for (var k = 0; k < n; k++) {
        var dist = Math.abs(items[k].offsetLeft - items[0].offsetLeft - track.scrollLeft);
        if (dist < min) { min = dist; best = k; }
      }
      return best;
    };
    var go = function (k) {
      k = Math.max(0, Math.min(n - 1, k));
      track.scrollTo({ left: items[k].offsetLeft - items[0].offsetLeft, behavior: reduce ? "auto" : "smooth" });
    };
    var update = function () {
      var k = index();
      dotBtns.forEach(function (x, j) { if (j === k) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
      prev.disabled = k === 0;
      next.disabled = k === n - 1;
    };
    prev.addEventListener("click", function () { go(index() - 1); });
    next.addEventListener("click", function () { go(index() + 1); });
    dotBtns.forEach(function (x, j) { x.addEventListener("click", function () { go(j); }); });
    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    var mode = function () {
      // SP のときだけスクロール領域をキーボードで操作できるようにする
      if (mq.matches) track.setAttribute("tabindex", "0");
      else track.removeAttribute("tabindex");
      update();
    };
    if (mq.addEventListener) mq.addEventListener("change", mode);
    else if (mq.addListener) mq.addListener(mode);
    mode();
  });

  /* ---------- スクロールで現れる（[data-tm-rv]） ---------- */
  (function () {
    if (reduce || !("IntersectionObserver" in window)) return;
    var els = document.querySelectorAll(".tm-root [data-tm-rv]");
    if (!els.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("tm-is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    Array.prototype.forEach.call(els, function (el) {
      el.classList.add("tm-rv");
      io.observe(el);
    });
  })();
})();
