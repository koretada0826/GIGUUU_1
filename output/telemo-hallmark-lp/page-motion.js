(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const selector = [
    '.stage-heading > *',
    '.register-flow > span',
    '.call-heading > *',
    '.audio-row',
    '.handoff-heading > *',
    '.handoff-ledger > div',
    '.footer-contact > *',
  ].join(', ');
  const elements = [...document.querySelectorAll(selector)];
  document.documentElement.classList.add('js');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.reveal = 'shown';
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  for (const element of elements) {
    element.dataset.reveal = 'pending';
    observer.observe(element);
  }
})();
