(() => {
  const players = [...document.querySelectorAll('.telemo-listen audio')];
  players.forEach((player) => {
    player.addEventListener('play', () => {
      players.forEach((other) => {
        if (other !== player) other.pause();
      });
    });
    const showError = () => {
      player.closest('article').querySelector('.telemo-listen__error').hidden = false;
    };
    player.addEventListener('error', showError);
    player.querySelector('source').addEventListener('error', showError);
  });
})();
