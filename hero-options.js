(() => {
  const items = window.TELEMO_HERO_CATALOG?.items || [];
  const grid = document.getElementById('heroGrid');
  const search = document.getElementById('heroSearch');
  const group = document.getElementById('heroGroup');
  const viewer = document.getElementById('heroViewer');
  let filtered = items;
  let active = null;
  const url = (item, target) => `./${target === 'home' ? 'index' : 'recruit'}.html?hero=${encodeURIComponent(item.id)}`;
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const groups = new Map(items.map(item => [item.group, item.groupLabel]));
  for (const [value, label] of groups) {
    const option = element('option', '', label); option.value = value; group.append(option);
  }
  const open = item => {
    active = item;
    document.getElementById('viewerTitle').textContent = item.title;
    const image = document.getElementById('viewerImage'); image.src = './' + item.src; image.alt = item.title;
    document.getElementById('viewerInfo').textContent = `${item.width} × ${item.height} ｜ ${item.src}`;
    document.getElementById('viewerRecruit').href = url(item, 'recruit');
    document.getElementById('viewerHome').href = url(item, 'home');
    document.getElementById('viewerDownload').href = './' + item.src;
    if (!viewer.open) viewer.showModal();
  };
  const render = () => {
    const term = search.value.trim().toLowerCase();
    filtered = items.filter(item => (group.value === 'all' || group.value === item.group) && `${item.title} ${item.files.join(' ')}`.toLowerCase().includes(term));
    document.getElementById('heroCount').textContent = `${filtered.length}案を表示 / 全${items.length}案`;
    document.getElementById('heroEmpty').hidden = !!filtered.length;
    grid.replaceChildren();
    const fragment = document.createDocumentFragment();
    filtered.forEach(item => {
      const card = element('article', 'options-card');
      const button = element('button', 'options-card__image'); button.type = 'button'; button.setAttribute('aria-label', item.title + 'を拡大');
      const image = element('img'); image.src = './' + item.src; image.alt = item.title; image.loading = 'lazy'; image.decoding = 'async'; image.width = item.width; image.height = item.height;
      button.append(image); button.addEventListener('click', () => open(item));
      const body = element('div', 'options-card__body');
      body.append(element('p', 'options-card__series', item.groupLabel), element('h2', '', item.title), element('p', 'options-card__file', item.src));
      const actions = element('div', 'options-card__actions');
      const primary = item.target; const secondary = primary === 'home' ? 'recruit' : 'home';
      for (const target of [primary, secondary]) {
        const link = element('a', '', target === 'home' ? 'トップページで見る' : '採用ページで見る'); link.href = url(item, target); actions.append(link);
      }
      body.append(actions); card.append(button, body); fragment.append(card);
    });
    grid.append(fragment);
  };
  search.addEventListener('input', render); group.addEventListener('change', render);
  document.getElementById('viewerClose').addEventListener('click', () => viewer.close());
  const move = offset => { const index = filtered.indexOf(active); if (filtered.length) open(filtered[(index + offset + filtered.length) % filtered.length]); };
  document.getElementById('viewerPrev').addEventListener('click', () => move(-1));
  document.getElementById('viewerNext').addEventListener('click', () => move(1));
  viewer.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); });
  document.getElementById('heroReset').addEventListener('click', () => {
    try { localStorage.removeItem('telemo.hero.home'); localStorage.removeItem('telemo.hero.recruit'); document.getElementById('heroCount').textContent = '保存した選択をリセットしました。元のヒーロー画像で表示します。'; }
    catch { document.getElementById('heroCount').textContent = 'ブラウザの保存領域を利用できません。'; }
  });
  render();
})();
