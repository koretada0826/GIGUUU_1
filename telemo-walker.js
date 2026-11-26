(() => {
  const guide = document.querySelector('.telemo-concierge');
  if (!guide) return;
  const avatar = guide.querySelector('.telemo-concierge__avatar');
  const motionButton = guide.querySelector('[data-guide-motion]');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const states = ['idle', 'talk', 'wave'];
  const illustratedPreview = new URLSearchParams(location.search).get('president') === 'illustrated';
  const spriteBase = illustratedPreview ? './assets/concierge/president-cutout-illustrated' : guide.dataset.spriteBase || './assets/concierge/president-cutout';
  if (illustratedPreview) {
    guide.querySelector('.telemo-concierge__character').src = './assets/concierge/president-walker/president-static-v2.png';
  }
  let ready = false;
  let paused = motionQuery.matches;
  try { paused = paused || sessionStorage.getItem('telemo-guide-motion') === 'paused'; } catch (_) {}
  let settleTimer;
  let section = guide.dataset.section || 'hero';
  const reduced = () => paused || motionQuery.matches;
  const setState = (state) => {
    avatar.dataset.state = reduced() ? 'still' : state;
  };
  const speak = () => {
    clearTimeout(settleTimer);
    if (!ready || guide.classList.contains('is-collapsed')) return;
    setState(section === 'hero' || section === 'contact' ? 'wave' : 'talk');
    settleTimer = setTimeout(() => setState('idle'), 3500);
  };
  const updateMotionButton = () => {
    guide.classList.toggle('is-motion-paused', reduced());
    if (!motionButton) return;
    motionButton.textContent = motionQuery.matches ? '動きを抑えて表示中' : reduced() ? '動きを再開' : '動きを止める';
    motionButton.disabled = motionQuery.matches;
    motionButton.setAttribute('aria-pressed', String(reduced()));
  };
  motionButton?.addEventListener('click', () => {
    paused = !reduced();
    // The OS preference takes priority; comments and controls remain available.
    if (motionQuery.matches) paused = true;
    try { sessionStorage.setItem('telemo-guide-motion', paused ? 'paused' : 'playing'); } catch (_) {}
    updateMotionButton();
    speak();
  });
  guide.addEventListener('telemo:guide-comment', (event) => {
    section = event.detail.id;
    speak();
  });
  guide.addEventListener('telemo:guide-collapse', () => {
    clearTimeout(settleTimer);
    setState('idle');
    speak();
  });
  document.addEventListener('visibilitychange', () => {
    guide.classList.toggle('is-page-hidden', document.hidden);
    if (document.hidden) clearTimeout(settleTimer);
    else speak();
  });
  motionQuery.addEventListener('change', () => { updateMotionButton(); speak(); });
  updateMotionButton();
  // Fall back to the existing portrait if a generated animation cannot load.
  Promise.all(states.map((state) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = `${spriteBase}/${state}.webp`;
  }))).then(() => {
    ready = true;
    states.forEach((state) => guide.style.setProperty(`--guide-${state}`, `url("${spriteBase}/${state}.webp")`));
    guide.classList.add('has-walker');
    speak();
  }).catch(() => { if (motionButton) motionButton.hidden = true; });
})();
