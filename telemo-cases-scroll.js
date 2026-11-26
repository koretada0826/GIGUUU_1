(() => {
  'use strict';
  const section = document.getElementById('telemo-cases');
  const track = section?.querySelector('.lpsr-cases-scroll');
  if (!track) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  track.tabIndex = 0;
  track.setAttribute('aria-label', '活用シーンを横にスクロール');

  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const behavior = reducedMotion.matches ? 'instant' : 'smooth';
    if (event.key === 'Home' || event.key === 'End') {
      track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth, behavior});
      return;
    }
    const card = track.querySelector('.telemo-cases__card');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    track.scrollBy({left: event.key === 'ArrowRight' ? step : -step, behavior});
  });
})();
