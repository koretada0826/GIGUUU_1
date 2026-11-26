// Local copy: Direction A interaction layer. Existing form messages and destination are preserved.
(function () {
  "use strict";
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  const panel = document.getElementById("gghPanel");
  const mobile = window.matchMedia("(max-width: 900px)");
  // <=900px the burger opens the collapsed nav; wider, the nav is inline and the burger opens the small panel.
  function syncControls() {
    if (burger) burger.setAttribute("aria-controls", mobile.matches || !panel ? "navLinks" : "gghPanel");
  }
  function closeMenu(restoreFocus = false) {
    if (!burger || !links) return;
    links.classList.remove("open");
    if (panel) panel.hidden = true;
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "メニューを開く");
    if (restoreFocus) burger.focus();
  }
  if (burger && links) {
    syncControls();
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", () => {
      const opening = burger.getAttribute("aria-expanded") !== "true";
      if (mobile.matches || !panel) {
        links.classList.toggle("open", opening);
        document.body.classList.toggle("menu-open", opening);
      } else {
        panel.hidden = !opening;
      }
      burger.setAttribute("aria-expanded", String(opening));
      burger.setAttribute("aria-label", opening ? "メニューを閉じる" : "メニューを開く");
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => closeMenu()));
    if (panel) panel.querySelectorAll("a").forEach(a => a.addEventListener("click", () => closeMenu()));
    document.addEventListener("click", event => {
      if (!event.target.closest("#nav")) closeMenu();
    });
    document.addEventListener("keydown", event => {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      if (event.key === "Escape") { event.preventDefault(); closeMenu(true); }
      if (event.key === "Tab" && mobile.matches) {
        const controls = [...document.querySelectorAll("#nav a, #nav button")].filter(el => el.getClientRects().length);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    mobile.addEventListener("change", () => { closeMenu(); syncControls(); });
  }
  // Header is transparent over the hero image; once scrolled it gets a translucent bar.
  const nav = document.getElementById("nav");
  if (nav) {
    const syncNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", syncNav, { passive: true });
    syncNav();
  }
  const heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncHeroVideo = () => {
      if (reducedMotion.matches || document.hidden) heroVideo.pause();
      else heroVideo.play().catch(() => {});
    };
    reducedMotion.addEventListener("change", syncHeroVideo);
    document.addEventListener("visibilitychange", syncHeroVideo);
    syncHeroVideo();
  }
  const questions = [...document.querySelectorAll(".faq__q")];
  function setQuestion(question, open) {
    question.setAttribute("aria-expanded", String(open));
    question.closest(".faq__item").classList.toggle("open", open);
    document.getElementById(question.getAttribute("aria-controls")).hidden = !open;
  }
  questions.forEach((question, index) => {
    const answer = question.closest(".faq__item").querySelector(".faq__a");
    question.id = question.id || `faq-question-${index + 1}`;
    answer.id = answer.id || `faq-answer-${index + 1}`;
    question.setAttribute("aria-controls", answer.id);
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", question.id);
    question.setAttribute("type", "button");
    setQuestion(question, false);
    question.addEventListener("click", () => {
      const open = question.getAttribute("aria-expanded") !== "true";
      questions.forEach(q => setQuestion(q, q === question && open));
    });
  });
  document.querySelectorAll(".compare-scroll").forEach(wrapper => {
    function updateOverflow() {
      if (wrapper.scrollWidth > wrapper.clientWidth + 1) wrapper.setAttribute("tabindex", "0");
      else wrapper.removeAttribute("tabindex");
    }
    new ResizeObserver(updateOverflow).observe(wrapper);
    updateOverflow();
  });
  document.documentElement.classList.add("ui-ready");
  // ---- お問い合わせフォーム（Web3Forms 送信） ----
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.querySelectorAll("[required]").forEach(field => {
      field.addEventListener("input", () => {
        if (field.validity.valid) field.removeAttribute("aria-invalid");
      });
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.querySelectorAll("[required]").forEach(field => field.setAttribute("aria-invalid", String(!field.validity.valid)));
        form.querySelector(":invalid")?.focus();
        status.style.color = "var(--magenta)";
        status.textContent = "▸ 必須項目（お名前・メール・内容）をご確認ください。";
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      status.style.color = "var(--cyan)";
      status.textContent = "▸ 送信中...";
      if (btn) btn.disabled = true;
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        const data = await res.json();
        if (data.success) {
          status.style.color = "var(--cyan)";
          status.textContent =
            "✓ 送信ありがとうございます。担当より折り返しご連絡いたします。";
          form.reset();
        } else {
          status.style.color = "var(--magenta)";
          status.textContent =
            "▸ 送信に失敗しました。お手数ですが時間をおいて再度お試しください。";
        }
      } catch (err) {
        status.style.color = "var(--magenta)";
        status.textContent =
          "▸ 通信エラーが発生しました。時間をおいて再度お試しください。";
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }
})();

// Progressive motion: visible by default, one entrance per visit, no scroll takeover.
(function () {
  "use strict";
  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const active = new Map();
  const played = new WeakSet();
  const easing = "cubic-bezier(.22, 1, .36, 1)";
  let observer;
  let heroPlayed = false;

  function play(element, { distance = 16, axis = "Y", duration = 600, delay = 0, line = false } = {}) {
    if (!element || reduce.matches || document.hidden || element.contains(document.activeElement)) return;
    const frames = line
      ? [{ transform: "scaleX(0)", transformOrigin: "left" }, { transform: "scaleX(1)", transformOrigin: "left" }]
      : [{ opacity: .9, transform: `translate${axis}(${distance}px)` }, { opacity: 1, transform: "none" }];
    try {
      const animation = element.animate(frames, { duration, delay, easing, fill: "backwards" });
      active.set(animation, element);
      animation.finished.then(() => active.delete(animation), () => active.delete(animation));
    } catch (_) {
      // An unavailable animation must never prevent reading or interacting.
    }
  }

  const selector = [
    ".sec__head", ".panel--split", ".statement", ".story", ".domain", ".telemo",
    ".prose", ".aruaru__card", ".why__item", ".reason", ".infobox", ".infogrid",
    ".path", ".metric", ".step", ".news__item", ".recruit", ".policy__item"
  ].join(",");
  // Avoid nested entrances; comparison cells, FAQ controls and form fields stay still.
  const candidates = [...document.querySelectorAll(selector)].filter(element => !element.parentElement.closest(selector));

  function stop() {
    observer?.disconnect();
    active.forEach((_, animation) => animation.cancel());
    active.clear();
    document.documentElement.classList.remove("motion-ready", "motion-intro");
  }

  function start() {
    if (reduce.matches) { stop(); return; }
    document.documentElement.classList.add("motion-ready");
    observer?.disconnect();
    observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      visible.forEach((entry, index) => {
        const element = entry.target;
        observer.unobserve(element);
        if (played.has(element)) return;
        played.add(element);
        // Hash navigation and keyboard users can read their destination immediately.
        const rect = element.getBoundingClientRect();
        if (rect.top < 0 || element.contains(document.activeElement)) return;
        play(element, { delay: Math.min(index, 2) * 60 });
        const line = element.querySelector(".sec__line");
        if (line) play(line, { line: true, duration: 600, delay: 80 });
      });
    }, { threshold: 0, rootMargin: "0px 0px -4% 0px" });
    candidates.forEach(element => { if (!played.has(element)) observer.observe(element); });

    if (!heroPlayed && !location.hash && scrollY < 40) {
      heroPlayed = true;
      document.documentElement.classList.add("motion-intro");
      play(document.querySelector(".hero__inner > .eyebrow, .subhero > .eyebrow"), { distance: 10, duration: 500 });
      play(document.querySelector(".hero__line1, .subhero__title"), { distance: 16, duration: 650 });
      play(document.querySelector(".hero__line2"), { axis: "X", distance: -24, duration: 800, delay: 70 });
      document.querySelectorAll(".hero__stats li").forEach((element, index) => play(element, { distance: 12, duration: 500, delay: 100 + index * 60 }));
    }
  }

  // Reaching an element always cancels its entrance rather than moving the focus target.
  function settleTarget(event) {
    document.getAnimations().forEach(animation => {
      const element = animation.effect?.target;
      if (element instanceof Element && element.contains(event.target)) animation.cancel();
    });
  }
  document.addEventListener("focusin", settleTarget);
  document.addEventListener("pointerdown", settleTarget, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) active.forEach((_, animation) => animation.cancel());
  });
  window.addEventListener("hashchange", () => active.forEach((_, animation) => animation.cancel()));
  reduce.addEventListener("change", () => reduce.matches ? stop() : start());
  start();
})();
