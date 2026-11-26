(() => {
  const flow = document.querySelector('[data-telemo-flow]');
  if (!flow) return;
  const pin = flow.querySelector('.telemo-flow__pin');
  const viewport = flow.querySelector('.telemo-flow__viewport');
  const steps = [...flow.querySelectorAll('.telemo-plan__step')];
  const hint = flow.querySelector('.telemo-flow__hint');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let distance = 0;
  let top = 0;
  let linked = false;
  let scheduled = false;
  let progress = 0;

  const mark = value => {
    progress = clamp(value);
    flow.style.setProperty('--flow-progress', String(progress));
    const current = Math.round(progress * (steps.length - 1));
    steps.forEach((step, index) => {
      step.classList.toggle('is-current', index === current);
      step.classList.toggle('is-complete', index < current);
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  };

  const update = () => {
    scheduled = false;
    if (!linked) return;
    const value = clamp((top - flow.getBoundingClientRect().top) / distance);
    viewport.scrollLeft = value * distance;
    mark(value);
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  const layout = () => {
    top = (document.querySelector('#nav')?.getBoundingClientRect().height || 64) + 16;
    flow.style.setProperty('--flow-top', `${top}px`);
    distance = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    linked = !reduce.matches && distance > 1 && pin.offsetHeight + top + 16 <= innerHeight;
    flow.classList.toggle('is-scroll-linked', linked);
    flow.style.height = linked ? `${pin.offsetHeight + distance}px` : '';
    hint.textContent = linked
      ? '下へスクロールすると、次のステップへ進みます。'
      : '横へスクロールして、次のステップへ →';
    if (linked) update();
    else mark(distance ? viewport.scrollLeft / distance : 0);
  };

  viewport.addEventListener('scroll', () => {
    if (!linked) mark(distance ? viewport.scrollLeft / distance : 0);
  }, { passive: true });

  viewport.addEventListener('keydown', event => {
    if (!linked || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const increment = 1 / Math.max(1, steps.length - 1);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1
      : clamp(progress + (event.key === 'ArrowRight' ? increment : -increment));
    window.scrollTo({ top: scrollY + flow.getBoundingClientRect().top - top + next * distance, behavior: 'auto' });
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', layout, { passive: true });
  reduce.addEventListener('change', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(pin);
  document.fonts?.ready.then(layout);
  layout();
})();
