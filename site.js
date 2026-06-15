// =============================================================
// GIGUUU — UI インタラクション
// ローダー / ナビ / スクロール演出 / カウントアップ / フォーム
// =============================================================
(function () {
  "use strict";

  // ---- ローダー：読み込み後に消す ----
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) setTimeout(() => loader.classList.add("hide"), 600);
  });

  // ---- ナビ：スクロールで背景を付ける ----
  const nav = document.getElementById("nav");
  const scrollBar = document.getElementById("scrollBar");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    if (scrollBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      scrollBar.style.height = (p * 100).toFixed(2) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- ハンバーガーメニュー ----
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }

  // ---- スクロール演出（IntersectionObserver） ----
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ---- ヒーローの数字カウントアップ（1000万件＋） ----
  const counter = document.querySelector("[data-count]");
  if (counter) {
    const target = parseInt(counter.getAttribute("data-count"), 10);
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.disconnect();
        const dur = 1600;
        let start = null;
        function step(ts) {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          counter.textContent = Math.floor(eased * target).toLocaleString("ja-JP");
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    });
    cio.observe(counter);
  }

  // ---- マウス追従グロー ----
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    let gx = -200, gy = -200, cx = -200, cy = -200;
    window.addEventListener("mousemove", (e) => {
      gx = e.clientX;
      gy = e.clientY;
    });
    (function follow() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(follow);
    })();
  }

  // ---- FAQ アコーディオン（事業紹介ページ） ----
  document.querySelectorAll(".faq__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq__item");
      const open = item.classList.contains("open");
      // 一度に1つだけ開く
      document.querySelectorAll(".faq__item.open").forEach((el) => {
        el.classList.remove("open");
        el.querySelector(".faq__a").style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("open");
        const a = item.querySelector(".faq__a");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  // ---- お問い合わせフォーム（デモ送信） ----
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.style.color = "var(--magenta)";
        status.textContent = "▸ 必須項目（お名前・メール・内容）をご確認ください。";
        return;
      }
      status.style.color = "var(--cyan)";
      status.textContent = "▸ 送信中...";
      setTimeout(() => {
        status.textContent =
          "✓ 送信ありがとうございます。担当より折り返しご連絡いたします。（※デモ：実際の送信は行われません）";
        form.reset();
      }, 900);
    });
  }
})();
