(() => {
  const items = window.TELEMO_HERO_CATALOG?.items || [];
  const target = document.body.classList.contains('page-recruit') ? 'recruit' : 'home';
  const requested = new URLSearchParams(location.search).get('hero');
  let saved;
  try { saved = localStorage.getItem('telemo.hero.' + target); } catch {}
  const selected = items.find(item => item.id === (requested || saved));
  const image = document.querySelector(target === 'recruit' ? '.rc-illustrated__art img' : '.kinetic-hero__image');
  if (selected && image) {
    image.removeAttribute('srcset'); image.removeAttribute('sizes');
    image.src = './' + selected.src; image.alt = selected.title;
    image.width = selected.width; image.height = selected.height;
    document.body.classList.add('has-hero-option');
  }
  if (!requested) return;
  const bar = document.createElement('aside'); bar.className = 'hero-preview-bar'; bar.setAttribute('aria-label', 'ヒーロー画像のプレビュー');
  const title = document.createElement('span'); title.textContent = selected ? selected.title : '候補が見つかりません';
  const back = document.createElement('a'); back.href = './hero-options.html'; back.textContent = '全案を見る';
  bar.append(title, back);
  const status = document.createElement('span'); status.className = 'hero-preview-bar__status'; status.setAttribute('role', 'status');
  if (selected) {
    const save = document.createElement('button'); save.type = 'button'; save.textContent = 'この画像を使う';
    save.addEventListener('click', () => {
      try { localStorage.setItem('telemo.hero.' + target, selected.id); status.textContent = 'このブラウザに保存しました'; }
      catch { status.textContent = '保存できません。プレビューURLから表示できます'; }
    });
    bar.append(save);
  }
  const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = '元の画像に戻す';
  reset.addEventListener('click', () => {
    try { localStorage.removeItem('telemo.hero.' + target); } catch {}
    const url = new URL(location.href); url.searchParams.delete('hero'); location.assign(url.href);
  });
  bar.append(reset, status); document.body.append(bar);
})();
