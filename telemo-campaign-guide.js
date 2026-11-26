(() => {
  const guide = document.querySelector('.lpsr-campaign-concierge');
  if (!guide) return;

  // Hide the entire floating guide before it can cover any footer link.
  // Native hidden also works when an older copy of the stylesheet is cached.
  const footer = document.querySelector('footer');
  const setFooterVisibility = (visible) => {
    guide.hidden = visible;
    guide.classList.toggle('is-footer-visible', visible);
  };
  const syncFooterVisibility = () => {
    const box = footer?.getBoundingClientRect();
    setFooterVisibility(Boolean(box && box.top <= innerHeight + 24 && box.bottom >= 0));
  };
  syncFooterVisibility();
  window.addEventListener('pageshow', syncFooterVisibility);
  window.addEventListener('resize', syncFooterVisibility, { passive: true });
  if (footer && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(([entry]) => {
      setFooterVisibility(entry.isIntersecting);
    }, { rootMargin: '0px 0px 24px 0px' });
    footerObserver.observe(footer);
  } else if (footer) {
    window.addEventListener('scroll', syncFooterVisibility, { passive: true });
  }

  const anchor = document.querySelector('[data-campaign-guide-anchor]');
  if (!anchor) return;
  const header = document.querySelector('header.ggh');
  let initialBottom = 12;
  let scrollScheduled = false;

  const updateHeroVisibility = (box = anchor.getBoundingClientRect()) => {
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0);
    const visible = box.bottom > headerBottom && box.top < innerHeight &&
      box.right > 0 && box.left < document.documentElement.clientWidth;
    guide.classList.toggle('is-hero-portrait-visible', visible);
  };

  const updateBottom = () => {
    const offset = Math.min(64, Math.max(0, scrollY) * .35);
    guide.style.setProperty('--campaign-guide-bottom', `${Math.max(12, initialBottom - offset)}px`);
  };

  // Preserve the approved hero position, then settle slightly lower on scroll.
  // Resize observations keep the portrait aligned with its hero anchor.
  const place = () => {
    const box = anchor.getBoundingClientRect();
    guide.style.setProperty('--campaign-guide-width', `${box.width}px`);
    guide.style.setProperty('--campaign-guide-right', `${Math.max(12, document.documentElement.clientWidth - box.right)}px`);
    initialBottom = Math.max(12, innerHeight - box.bottom - scrollY);
    updateHeroVisibility(box);
    updateBottom();
  };
  place();
  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      updateHeroVisibility();
      updateBottom();
    });
  }, { passive: true });
  window.addEventListener('resize', place, { passive: true });
  window.addEventListener('load', place);
  document.fonts?.ready.then(place);
  if ('ResizeObserver' in window) {
    // Late images and fonts can move the anchor without resizing the hero itself.
    const observer = new ResizeObserver(place);
    const hero = anchor.closest('#hero');
    [hero, ...hero.querySelectorAll('*')].forEach(element => observer.observe(element));
  }
})();
