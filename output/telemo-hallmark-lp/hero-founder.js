(() => {
  const portrait = document.querySelector('.founder-portrait');
  if (!portrait || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sprite = new Image();
  sprite.onload = () => {
    if (document.hidden) return;
    window.setTimeout(() => {
      if (!document.hidden) portrait.classList.add('is-talking');
    }, 1300);
  };
  sprite.src = './media/talk.webp';

  portrait.querySelector('.founder-talk')?.addEventListener('animationend', () => {
    portrait.classList.remove('is-talking');
  });
})();
