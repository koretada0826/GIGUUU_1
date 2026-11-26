(() => {
  const root = document.querySelector('#telemo-core [data-lpsr-founder]');
  if (!root) return;
  const line = root.querySelector('[data-guide-line]');
  const next = root.querySelector('[data-guide-next]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const lines = [
    'ここからは6つの仕組みをご案内します。',
    '声も、トーク設計も。営業現場の知見を詰め込んでいます。',
    '結果を見て、一緒に改善。その積み重ねが大切なんです。',
  ];
  let centered = false;
  let index = 0;
  let startTimer;
  let gestureTimer;
  let advanceTimer;
  const paused = () => {
    try { return motion.matches || sessionStorage.getItem('telemo-guide-motion') === 'paused'; }
    catch (_) { return motion.matches; }
  };
  const stop = () => {
    clearTimeout(startTimer);
    clearTimeout(gestureTimer);
    clearTimeout(advanceTimer);
    root.classList.remove('lpsr-guide-is-talking');
  };
  const show = (nextIndex, delay = 0, advance = false) => {
    stop();
    index = nextIndex;
    line.textContent = lines[index];
    startTimer = setTimeout(() => {
      if (!centered || document.hidden || paused()) return;
      root.classList.add('lpsr-guide-is-talking');
      gestureTimer = setTimeout(() => root.classList.remove('lpsr-guide-is-talking'), 3500);
      if (advance && index < lines.length - 1) {
        advanceTimer = setTimeout(() => show(index + 1, 0, true), 8000);
      }
    }, delay);
  };
  const updateMotion = () => {
    root.classList.toggle('lpsr-guide-motion-paused', paused());
    if (paused()) stop();
  };
  const sprite = new Image();
  sprite.onload = () => root.classList.add('lpsr-guide-has-talk');
  sprite.src = new URL('./assets/concierge/president-cutout/talk.webp', document.baseURI).href;
  next.addEventListener('click', () => show((index + 1) % lines.length));
  root.addEventListener('telemo:president-arrive', event => {
    centered = true;
    show(0, event.detail.delay, true);
  });
  for (const name of ['telemo:president-depart', 'telemo:president-leave']) {
    root.addEventListener(name, () => { centered = false; stop(); });
  }
  motion.addEventListener('change', updateMotion);
  document.querySelector('.telemo-concierge [data-guide-motion]')?.addEventListener('click', updateMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  updateMotion();
})();
