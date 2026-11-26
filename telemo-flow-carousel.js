(() => {
  const root = document.querySelector('[data-flow-carousel]');
  if (!root) return;
  const viewport = root.querySelector('.telemo-flow__viewport');
  const cards = [...root.querySelectorAll('.telemo-plan__step')];
  const controls = root.querySelector('.lpsr-flow-carousel__controls');
  const previous = root.querySelector('[data-flow-prev]');
  const next = root.querySelector('[data-flow-next]');
  const status = root.querySelector('[data-flow-status]');
  if (!viewport || !cards.length || !controls || !previous || !next || !status) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let pending = null;
  let scheduled = false;
  let wheelLocked = false;
  let wheelAmount = 0;
  let wheelTimer;

  const centerDistance = card => {
    const view = viewport.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    return (box.left + box.right - view.left - view.right) / 2;
  };

  const mark = index => {
    current = index;
    cards.forEach((card, i) => {
      card.classList.toggle('is-current', i === index);
      if (i === index) card.setAttribute('aria-current', 'step');
      else card.removeAttribute('aria-current');
    });
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  };

  const go = (index, instant = false) => {
    index = Math.max(0, Math.min(cards.length - 1, index));
    pending = index;
    mark(index);
    viewport.scrollTo({
      left: viewport.scrollLeft + centerDistance(cards[index]),
      behavior: instant || reducedMotion.matches ? 'auto' : 'smooth',
    });
    if (Math.abs(centerDistance(cards[index])) < 1) pending = null;
  };

  const readPosition = () => {
    scheduled = false;
    if (pending !== null) {
      if (Math.abs(centerDistance(cards[pending])) >= 1) return;
      pending = null;
    }
    let nearest = 0;
    cards.forEach((card, i) => {
      if (Math.abs(centerDistance(card)) < Math.abs(centerDistance(cards[nearest]))) nearest = i;
    });
    if (nearest !== current) mark(nearest);
  };

  viewport.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(readPosition);
  }, { passive: true });

  viewport.addEventListener('pointerdown', () => { pending = null; }, { passive: true });
  viewport.addEventListener('scrollend', () => { pending = null; readPosition(); });
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));

  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(cards.length - 1);
    else go(current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  // One wheel/trackpad gesture advances one step. Outward gestures at either
  // end continue normal page scrolling; pinch-to-zoom remains browser-owned.
  viewport.addEventListener('wheel', event => {
    if (event.ctrlKey || event.defaultPrevented) return;
    const dominant = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!dominant) return;
    const direction = Math.sign(dominant);
    if (!wheelLocked && ((current === 0 && direction < 0) || (current === cards.length - 1 && direction > 0))) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelLocked = false; wheelAmount = 0; }, 180);
    if (wheelLocked) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
    if (Math.sign(wheelAmount) !== direction) wheelAmount = 0;
    wheelAmount += dominant * unit;
    if (Math.abs(wheelAmount) < 24) return;
    wheelLocked = true;
    wheelAmount = 0;
    go(current + direction);
  }, { passive: false });

  const align = () => go(current, true);
  reducedMotion.addEventListener('change', align);
  if ('ResizeObserver' in window) new ResizeObserver(align).observe(viewport);
  else window.addEventListener('resize', align, { passive: true });
  root.classList.add('is-ready');
  controls.hidden = false;
  go(0, true);
  document.fonts?.ready.then(align);
})();
