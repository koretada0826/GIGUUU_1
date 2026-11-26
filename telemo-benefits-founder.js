(() => {
  const root = document.querySelector('#telemo-core [data-lpsr-founder]');
  if (!root) return;
  const section = root.closest('#telemo-core');
  const replay = root.querySelector('.lpsr-benefits-founder__replay');
  // Hand the floating guide, including the fixed hero guide, over to this stage.
  const guide = document.querySelector('.telemo-concierge');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let stageVisible = false;
  let departed = false;
  let arrived = false;
  let generation = 0;
  let departureTimer;
  let finishTimer;
  let nextFrame;
  let ready;
  let previousInert;
  let previousAriaHidden;
  const announceArrival = delay => root.dispatchEvent(new CustomEvent('telemo:president-arrive', { detail: { delay } }));

  const reduced = () => {
    try { return motion.matches || sessionStorage.getItem('telemo-guide-motion') === 'paused'; }
    catch (_) { return motion.matches; }
  };
  const stop = () => {
    clearTimeout(finishTimer);
    cancelAnimationFrame(nextFrame);
    root.classList.remove('is-playing');
  };
  const load = () => {
    if (!ready) ready = new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = new URL('./assets/concierge/president-cutout/wave.webp', document.baseURI).href;
    });
    return ready;
  };
  const play = async () => {
    const current = generation;
    if (!active || document.hidden) return;
    stop();
    if (reduced()) {
      root.classList.remove('is-awaiting-guide');
      announceArrival(0);
      return;
    }
    const canAnimate = await load();
    if (!active || current !== generation || document.hidden) return;
    if (!canAnimate || reduced()) {
      root.classList.remove('is-awaiting-guide');
      announceArrival(0);
      return;
    }
    // Start below the visible window, then settle in the original center stage.
    const distance = Math.max(48, innerHeight - replay.getBoundingClientRect().top + 40);
    root.style.setProperty('--lpsr-founder-rise', `${Math.round(distance)}px`);
    root.classList.add('is-awaiting-guide');
    nextFrame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        if (!active || current !== generation) return;
        root.classList.remove('is-awaiting-guide');
        root.classList.add('is-playing');
        announceArrival(900);
        finishTimer = setTimeout(stop, 2200);
      });
    });
  };
  const maybeArrive = () => {
    if (!active || !stageVisible || !departed || arrived || document.hidden) return;
    arrived = true;
    play();
  };
  const updateControl = () => {
    const still = reduced();
    replay.disabled = still || !active;
    replay.setAttribute('aria-label', still ? '営業を案内するミニ社長' : '社長の登場アニメーションをもう一度再生');
    replay.title = still ? '営業を案内するミニ社長' : 'クリックしてもう一度再生';
  };
  const setActive = next => {
    if (active === next) return;
    active = next;
    generation++;
    arrived = false;
    departed = false;
    clearTimeout(departureTimer);
    stop();
    root.classList.add('is-awaiting-guide');
    updateControl();
    if (!next) {
      if (guide) {
        guide.classList.remove('lpsr-benefits-guide--departing', 'lpsr-benefits-guide--docked');
        guide.inert = previousInert;
        if (previousAriaHidden === null) guide.removeAttribute('aria-hidden');
        else guide.setAttribute('aria-hidden', previousAriaHidden);
      }
      root.dispatchEvent(new CustomEvent('telemo:president-leave'));
      return;
    }
    root.dispatchEvent(new CustomEvent('telemo:president-depart'));
    if (guide) {
      previousInert = guide.inert;
      previousAriaHidden = guide.getAttribute('aria-hidden');
      if (guide.contains(document.activeElement)) {
        // The stage is still hidden, so keep focus on its visible caption.
        root.tabIndex = -1;
        root.focus({ preventScroll: true });
      }
      guide.inert = true;
      guide.setAttribute('aria-hidden', 'true');
      guide.classList.add('lpsr-benefits-guide--departing');
    }
    const finishDeparture = () => {
      if (!active) return;
      guide?.classList.add('lpsr-benefits-guide--docked');
      departed = true;
      maybeArrive();
    };
    if (!guide || reduced()) finishDeparture();
    else {
      load();
      departureTimer = setTimeout(finishDeparture, 580);
    }
  };
  const updateMotion = () => {
    updateControl();
    if (!reduced()) return;
    stop();
    if (active) {
      clearTimeout(departureTimer);
      guide?.classList.add('lpsr-benefits-guide--docked');
      departed = true;
      arrived = false;
      maybeArrive();
    }
  };

  replay.addEventListener('click', play);
  motion.addEventListener('change', updateMotion);
  guide?.querySelector('[data-guide-motion]')?.addEventListener('click', updateMotion);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else {
      if (root.classList.contains('is-awaiting-guide')) arrived = false;
      maybeArrive();
    }
  });
  updateControl();
  if (!('IntersectionObserver' in window)) return;
  root.classList.add('is-awaiting-guide');
  guide?.classList.add('lpsr-benefits-guide--transition');
  let sectionObserver;
  let stageObserver;
  let resizeFrame;
  const watch = () => {
    sectionObserver?.disconnect();
    stageObserver?.disconnect();
    // Pixel margins follow the window height, including wide desktop screens.
    const inset = Math.round(innerHeight * .35);
    sectionObserver = new IntersectionObserver(entries => {
      setActive(entries.some(entry => entry.isIntersecting));
    }, { rootMargin: `-${inset}px 0px -${inset}px 0px`, threshold: 0 });
    stageObserver = new IntersectionObserver(entries => {
      stageVisible = entries.some(entry => entry.isIntersecting);
      maybeArrive();
    }, { threshold: .1, rootMargin: `0px 0px -${Math.round(innerHeight * .05)}px 0px` });
    sectionObserver.observe(section);
    stageObserver.observe(replay);
  };
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(watch);
  }, { passive: true });
  watch();
})();
