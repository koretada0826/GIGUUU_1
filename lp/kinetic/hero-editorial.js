(() => {
  const hero = document.querySelector('.editorial-hero');
  if (!hero) return;
  if (window.gsap) {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(hero.querySelectorAll('.editorial-hero__title span, .editorial-hero__lead, .editorial-hero__description, .editorial-hero__cta'), {
        opacity: 0, y: 12, duration: .9, stagger: .12, ease: 'power2.out', clearProps: 'all'
      });
      const photos = [...hero.querySelectorAll('.editorial-hero__photo-stack figure')];
      const camera = gsap.to(hero.querySelectorAll('.editorial-hero__photo-stack img'), {
        scale: 1.025, xPercent: -.35, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'
      });
      const fade = gsap.timeline({ repeat: -1 });
      if (photos.length > 1) fade.to(photos[1], { opacity: 1, duration: 1.6, ease: 'sine.inOut' }, 6)
        .to(photos[1], { opacity: 0, duration: 1.6, ease: 'sine.inOut' }, 13.6);
      const pause = hero.querySelector('.editorial-hero__pause');
      let userPaused = false;
      let visible = true;
      const sync = () => {
        const paused = userPaused || !visible || document.hidden;
        camera.paused(paused);
        fade.paused(paused);
      };
      const toggle = () => {
        userPaused = !userPaused;
        pause.setAttribute('aria-pressed', String(userPaused));
        pause.textContent = userPaused ? '背景を再生' : '背景を一時停止';
        sync();
      };
      pause.hidden = false;
      pause.addEventListener('click', toggle);
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      visibility.observe(hero);
      document.addEventListener('visibilitychange', sync);
      return () => {
        visibility.disconnect();
        document.removeEventListener('visibilitychange', sync);
        pause.removeEventListener('click', toggle);
        pause.hidden = true;
      };
    });
  }
  const links = [...hero.querySelectorAll('.editorial-hero__numbers a')];
  const observer = new IntersectionObserver(entries => {
    const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    links.forEach(link => {
      if (link.hash === '#' + active.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-10% 0px -45% 0px', threshold: [0, .1, .5] });
  links.forEach(link => { const target = document.querySelector(link.hash); if (target) observer.observe(target); });
})();
