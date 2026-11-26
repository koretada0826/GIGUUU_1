// =============================================================
// TELEMO LP — 小さなバニラJS（メニュー / 表示演出 / デモ再生ボタン / 導入ステップ / 川柳マーキー）
// フォーム送信は site.js が担当
// =============================================================
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- 1. SP ハンバーガー（aria-expanded / aria-controls / Esc で閉じる） ----
  var btn = document.getElementById("tw-menu-btn");
  var menu = document.getElementById("tw-menu");
  var spQuery = window.matchMedia("(max-width: 767px)");
  function setMenu(open, returnFocus) {
    if (!btn || !menu) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    menu.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("tw-menu-open", open);
    if (open) {
      var first = menu.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      btn.focus();
    }
  }
  if (btn && menu) {
    btn.addEventListener("click", function () {
      setMenu(btn.getAttribute("aria-expanded") !== "true", false);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false, false);
    });
    document.addEventListener("keydown", function (e) {
      if (btn.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") { setMenu(false, true); return; }
      // メニューを開いている間は Tab をメニュー内（ボタン＋リンク）で循環させる
      if (e.key === "Tab") {
        var links = menu.querySelectorAll("a");
        var last = links[links.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); btn.focus(); }
        else if (e.shiftKey && document.activeElement === btn) { e.preventDefault(); last.focus(); }
      }
    });
    var onChange = function () { if (!spQuery.matches) setMenu(false, false); };
    if (spQuery.addEventListener) spQuery.addEventListener("change", onChange);
  }

  // ---- 2. 表示演出（site.js が無い場合の保険。.reveal → .in） ----
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---- 4. 導入の流れ：START → STEP 表示（JS無効・reduced-motion 時は全STEPの一覧のまま） ----
  var stage = document.getElementById("tw-flow-stage");
  if (stage && !reduce.matches) {
    var steps = stage.querySelectorAll(".tw-flow-step");
    var list = document.getElementById("tw-flow-list");
    var startBtn = document.getElementById("tw-flow-start");
    var nav = document.getElementById("tw-flow-nav");
    var prevBtn = document.getElementById("tw-flow-prev");
    var nextBtn = document.getElementById("tw-flow-next");
    var skipBtn = document.getElementById("tw-flow-skip");
    var resetBtn = document.getElementById("tw-flow-reset");
    var live = document.getElementById("tw-flow-live");
    var progress = document.getElementById("tw-flow-progress");
    var total = steps.length;
    var cur = 0;
    if (startBtn && nav && prevBtn && nextBtn && skipBtn && resetBtn && total) {
      stage.classList.add("is-stepper");
      startBtn.hidden = false;
      for (var i = 0; i < total; i++) progress.appendChild(document.createElement("i"));
      var dots = progress.querySelectorAll("i");

      var render = function (focusEl) {
        steps.forEach(function (s, i) {
          var on = i === cur;
          s.classList.toggle("is-current", on);
          if (on) s.setAttribute("aria-current", "step");
          else s.removeAttribute("aria-current");
        });
        dots.forEach(function (d, i) { d.classList.toggle("is-on", i <= cur); });
        prevBtn.disabled = cur === 0;
        nextBtn.hidden = cur === total - 1;
        resetBtn.hidden = cur !== total - 1;
        var txt = steps[cur].querySelector(".tw-flow-text");
        live.textContent = "STEP " + (cur + 1) + " / " + total + "：" + (txt ? txt.textContent : "");
        if (focusEl) focusEl.focus();
      };
      startBtn.addEventListener("click", function () {
        stage.classList.add("is-started");
        startBtn.hidden = true;
        nav.hidden = false;
        progress.hidden = false;
        cur = 0;
        render(nextBtn);
      });
      prevBtn.addEventListener("click", function () {
        if (cur > 0) cur--;
        render(cur === 0 ? nextBtn : null);
      });
      nextBtn.addEventListener("click", function () {
        if (cur < total - 1) cur++;
        render(cur === total - 1 ? resetBtn : null);
      });
      resetBtn.addEventListener("click", function () {
        cur = 0;
        render(nextBtn);
      });
      skipBtn.addEventListener("click", function () {
        stage.classList.remove("is-stepper", "is-started");
        nav.hidden = true;
        progress.hidden = true;
        startBtn.hidden = true;
        steps.forEach(function (s) { s.classList.remove("is-current"); s.removeAttribute("aria-current"); });
        live.textContent = "全" + total + "ステップを一覧で表示しました";
        list.focus();
      });
      stage.addEventListener("keydown", function (e) {
        if (!stage.classList.contains("is-started")) return;
        if (e.target.closest && e.target.closest("input, textarea")) return;
        if (e.key === "ArrowRight" && !nextBtn.hidden) { e.preventDefault(); nextBtn.click(); nextBtn.focus(); }
        if (e.key === "ArrowLeft" && !prevBtn.disabled) { e.preventDefault(); prevBtn.click(); if (!prevBtn.disabled) prevBtn.focus(); }
      });
    }
  }

  // ---- 5. 川柳マーキーの一時停止（WCAG 2.2.2） ----
  var pauseBtn = document.getElementById("tw-marquee-pause");
  var marquees = document.getElementById("tw-marquees");
  if (pauseBtn && marquees) {
    var sec = marquees.closest("section");
    var label = pauseBtn.querySelector(".tw-marquee-pause-label");
    pauseBtn.addEventListener("click", function () {
      var paused = pauseBtn.getAttribute("aria-pressed") !== "true";
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      marquees.classList.toggle("is-paused", paused);
      if (sec) sec.classList.toggle("is-paused", paused);
      if (label) label.textContent = paused ? "流れを再開" : "流れを一時停止";
    });
  }

  // ---- 3. デモ音声ボタン（音源未受領のため案内のみ） ----
  var demo = document.getElementById("tw-demo-btn");
  var demoNote = document.getElementById("tw-demo-note");
  if (demo && demoNote) {
    demo.addEventListener("click", function () {
      demoNote.textContent = "デモ音声は現在準備中です。";
    });
  }
})();
