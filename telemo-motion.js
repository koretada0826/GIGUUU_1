// Kio's sequential entrances and Casa Malka's image masks, adapted to TELEMO.
(() => {
  'use strict';
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const hero = document.querySelector('#hero.telemo-office-hero');
  const wordmark = hero?.querySelector('.telemo-office-hero__wordmark img');
  const photoFrame = document.querySelector('.telemo-support-redesign__photo');
  const photo = photoFrame?.querySelector('img');
  const armedClass = 'lpsr-motion-armed';
  const easing = 'cubic-bezier(.22, 1, .36, 1)';
  const played = new WeakSet();
  const pending = new Map();
  const animations = new Set();
  let observer;
  let scrubObserver;
  let heroActive = false;
  let photoActive = false;
  let heroPlayed = false;
  let scrubFrame = 0;
  let navigating = false;
  let navTimer;

  const shift = (x, y = 0) => ({ opacity: [0, 1], translate: [`${x}px ${y}px`, '0 0'] });
  const coreCard = element => innerWidth <= 600 ? shift(0, 10) : shift(element.matches(':nth-of-type(odd)') ? -18 : 18);
  const groups = [
    ['.telemo-how__grid li', () => shift(0, 14)],
    ['.telemo-cases__card', () => ({ opacity: [0, 1], scale: [.96, 1] })],
    ['.telemo-compare__card--human', () => shift(-20)],
    ['.telemo-compare__card--ai', () => shift(20)],
    ['.telemo-benefits__card', coreCard],
    ['.telemo-support__step', () => shift(-10)],
  ];

  const animate = (element, frames, duration, delay = 0, animationEasing = easing) => {
    if (!element || document.hidden || reduce.matches) return;
    try {
      const animation = element.animate(frames, { duration, delay, easing: animationEasing, fill: 'backwards' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    } catch {
      // Unsupported keyframes leave the element in its readable static state.
      element.classList.remove(armedClass);
    }
  };

  const reveal = element => {
    played.add(element);
    pending.delete(element);
    element.classList.remove(armedClass);
    observer?.unobserve(element);
  };

  const playHero = () => {
    if (!hero || heroPlayed || (location.hash && location.hash !== '#hero') || scrollY > 40) return;
    heroPlayed = true;
    const mobile = innerWidth < 768;
    const sequence = [
      { selector: '.telemo-office-hero__intro', peak: 1.12 },
      { selector: '.telemo-office-hero__headline', peak: mobile ? 1.04 : 1.06 },
      { selector: '.telemo-office-hero__wordmark', peak: mobile ? 1.08 : 1.15, prominent: true },
      { selector: '.telemo-office-hero__president img', peak: mobile ? 1.12 : 1.25, prominent: true, origin: '50% 100%' },
      { selector: '.telemo-office-hero__speech', peak: mobile ? 1.05 : 1.15, origin: '90% 85%' },
    ];
    sequence.forEach((item, index) => {
      animate(hero.querySelector(item.selector), {
        opacity: [0, 1, 1],
        scale: [item.prominent ? .15 : .3, item.peak, 1],
        transformOrigin: [item.origin || '50% 50%', item.origin || '50% 50%', item.origin || '50% 50%'],
        offset: [0, item.prominent ? .55 : .6, 1],
      }, item.prominent ? 950 : 750, 300 + index * 350,
      item.prominent ? 'cubic-bezier(.18, .89, .32, 1.35)' : 'cubic-bezier(.18, .89, .32, 1.28)');
    });
  };

  const updateScrub = () => {
    scrubFrame = 0;
    if (document.hidden || reduce.matches) return;
    const heroBox = heroActive ? hero.getBoundingClientRect() : null;
    const photoBox = photoActive ? photoFrame.getBoundingClientRect() : null;
    if (heroBox && wordmark) {
      const progress = Math.min(1, Math.max(0, -heroBox.top / heroBox.height));
      hero.style.setProperty('--office-wordmark-shift', `${progress * (innerWidth < 768 ? 8 : 18)}px`);
    }
    if (photoBox && photo) {
      const progress = Math.min(1, Math.max(0, (innerHeight - photoBox.top) / ((innerHeight + photoBox.height) / 2)));
      photo.style.scale = progress >= 1 ? '' : String(1 + .08 * (1 - progress));
      photoFrame.style.clipPath = progress >= 1 ? '' : `inset(${(1 - progress) * 9}%)`;
    }
  };
  const requestScrub = () => {
    if (!document.hidden && (heroActive || photoActive) && !scrubFrame) scrubFrame = requestAnimationFrame(updateScrub);
  };

  const cancelAnimations = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  const stop = () => {
    observer?.disconnect();
    scrubObserver?.disconnect();
    cancelAnimations();
    pending.forEach((_, element) => element.classList.remove(armedClass));
    pending.clear();
    root.classList.remove('lpsr-motion-ready');
    cancelAnimationFrame(scrubFrame);
    scrubFrame = 0;
    heroActive = false;
    photoActive = false;
    hero?.style.removeProperty('--office-wordmark-shift');
    if (photo) photo.style.scale = '';
    if (photoFrame) photoFrame.style.clipPath = '';
    window.removeEventListener('scroll', requestScrub);
  };

  const start = () => {
    if (reduce.matches || document.hidden) return;
    observer?.disconnect();
    scrubObserver?.disconnect();
    observer = new IntersectionObserver(entries => {
      const counts = new Map();
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const item = pending.get(entry.target);
        if (!item) return;
        reveal(entry.target);
        if (navigating || entry.boundingClientRect.top < -40 || entry.target.contains(document.activeElement)) return;
        const order = counts.get(item.index) ?? 0;
        counts.set(item.index, order + 1);
        animate(entry.target, item.frames(entry.target), 620, Math.min(order * 65, 260));
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    root.classList.add('lpsr-motion-ready');
    groups.forEach(([selector, frames], index) => {
      document.querySelectorAll(selector).forEach(element => {
        if (played.has(element)) return;
        element.classList.add(armedClass);
        pending.set(element, { frames, index });
        observer.observe(element);
      });
    });
    scrubObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) heroActive = entry.isIntersecting;
        if (entry.target === photoFrame) {
          photoActive = entry.isIntersecting;
          if (!photoActive) {
            photo.style.scale = '';
            photoFrame.style.clipPath = '';
          }
        }
      });
      requestScrub();
    });
    if (hero && wordmark) scrubObserver.observe(hero);
    if (photoFrame && photo) scrubObserver.observe(photoFrame);
    window.addEventListener('scroll', requestScrub, { passive: true });
    playHero();
  };

  const startNavigation = () => {
    navigating = true;
    cancelAnimations();
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navigating = false; }, 1600);
  };
  const settle = event => {
    for (const animation of animations) {
      if (animation.effect?.target?.contains(event.target)) animation.cancel();
    }
    for (let element = event.target; element && element !== document.body; element = element.parentElement) {
      if (pending.has(element)) reveal(element);
    }
  };
  if (location.hash) startNavigation();
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="#"]');
    if (link?.getAttribute('href').length > 1) startNavigation();
  }, true);
  window.addEventListener('hashchange', startNavigation);
  window.addEventListener('scrollend', () => {
    if (!navigating) return;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navigating = false; }, 120);
  });
  document.addEventListener('focusin', settle);
  document.addEventListener('pointerdown', settle, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  window.addEventListener('beforeprint', stop);
  window.addEventListener('afterprint', start);
  window.addEventListener('pageshow', start);
  window.addEventListener('resize', requestScrub, { passive: true });
  reduce.addEventListener('change', () => reduce.matches ? stop() : start());
  start();
})();
