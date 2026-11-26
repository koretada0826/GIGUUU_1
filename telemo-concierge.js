(() => {
  const booking = document.querySelector('.telemo-booking');
  if (booking) {
    const button = booking.querySelector('.telemo-booking__button');
    const url = booking.dataset.bookingUrl;
    if (url && /^https:\/\/(?:www\.)?timerex\.net\//.test(url)) {
      button.href = url;
      button.target = '_blank';
      button.rel = 'noopener';
      button.removeAttribute('aria-disabled');
      const bubbleButton = document.querySelector('.telemo-concierge__booking');
      if (bubbleButton) {
        bubbleButton.href = url;
        bubbleButton.target = '_blank';
        bubbleButton.rel = 'noopener';
      }
      booking.querySelector('.telemo-booking__status').textContent = 'TimeRexで空いている日時を選べます。';
    } else {
      button.addEventListener('click', (event) => event.preventDefault());
    }
  }
  const widget = document.querySelector('.telemo-concierge');
  if (!widget) return;
  const comments = {
    hero: [
      '採用して、育てて、また採用。営業の人手、ずっと悩んでいませんか？',
      '人を1人採用する前に、TELEMOを1台、一緒に育ててみませんか？',
      '商品には自信がある。でも、売る人が足りない。そんな会社さんにも。',
    ],
    'telemo-listen': [
      'まずは実際の営業トークを、聴いてみてください。声の自然さや、切り返しにも注目です。',
      'どんな会話をするのか、音声で確かめてみませんか？',
    ],
    founder: [
      '営業の現場で培ったノウハウを、TELEMOに込めています。',
      '営業の悩み、僕と一緒に考えてみませんか？',
    ],
    'telemo-how': [
      '人を1人採用する前に、TELEMOを1台、一緒に育ててみませんか？',
      '電話をかけるだけでなく、その先の営業トークまで。ぜひ音声も聴いてみてください。',
    ],
    'telemo-cases': [
      '大量の営業リスト、電話しきれていますか？TELEMOと分担してみませんか？',
      'その見込み客リスト、眠らせていませんか？もう一度、アプローチしてみましょう。',
      '営業代行を使っているなら、まず1席をTELEMOにする選択肢も。',
      '新しい商品を売りたい。でも営業部隊を作るほどではない。そんなときにも。',
    ],
    'telemo-compare': [
      '月35万円で22,000コール。人を雇う場合と、一度比較してみませんか？',
      'TELEMOは1コール約15.9円。月額35万円・22,000コールでの計算です。',
    ],
    'telemo-core': [
      '電話の量だけでは、営業は強くならない。声・トーク設計・改善までが大事なんです。',
    ],
    'telemo-support': [
      '実際の通話を聴いて、課題を見つけて、また改善。営業の現場と同じですね。',
    ],
    'telemo-support-accompaniment': [
      '導入して終わりじゃありません。結果を見ながら、一緒に育てていくんです。',
      '最初から完璧な営業担当はいませんよね。AIも、改善を重ねていくんです。',
    ],
    'telemo-plan': [
      '月35万円で22,000コール。人を雇う場合と、一度比較してみませんか？',
      '初期費用20万円・月額35万円、いずれも税別です。御社での使い方も相談しましょう。',
    ],
    contact: [
      '御社ならどう使えるか、僕と一緒に考えてみませんか？',
      'まだ検討中でも大丈夫。まずは、営業のお悩みから聞かせてください。',
    ],
  };
  const copy = widget.querySelector('.telemo-concierge__comment');
  if (!copy) return;
  const scene = widget.querySelector('.telemo-concierge__scene');
  const minimize = widget.querySelector('[data-concierge-minimize]');
  const restore = widget.querySelector('[data-concierge-restore]');
  let current = 'hero';
  let index = 0;
  const update = () => {
    copy.textContent = comments[current][index];
    widget.dataset.section = current;
    widget.dispatchEvent(new CustomEvent('telemo:guide-comment', { detail: { id: current } }));
  };
  const next = () => { index = (index + 1) % comments[current].length; update(); };
  update();
  widget.querySelector('[data-concierge-next]')?.addEventListener('click', next);
  if (scene && minimize && restore) {
    const collapse = (value) => {
      widget.classList.toggle('is-collapsed', value);
      scene.hidden = value;
      restore.setAttribute('aria-expanded', String(!value));
      widget.dispatchEvent(new CustomEvent('telemo:guide-collapse', { detail: { collapsed: value } }));
      try { sessionStorage.setItem('telemo-concierge-collapsed', String(value)); } catch (_) {}
    };
    minimize.addEventListener('click', () => { collapse(true); restore.focus(); });
    restore.addEventListener('click', () => { collapse(false); minimize.focus(); });
    try { collapse(sessionStorage.getItem('telemo-concierge-collapsed') === 'true'); } catch (_) {}
  }
  // Read section positions in a single animation frame as the visitor scrolls.
  const sections = Object.keys(comments).map((id) => document.getElementById(id)).filter(Boolean);
  let scheduled = false;
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const threshold = innerHeight * .55;
      let active = 'hero';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) active = section.id;
      }
      if (active !== current) { current = active; index = 0; update(); }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  // A still guide changes its bubble only when the section changes.
  if (widget.dataset.guideFollow !== 'fixed' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      if (document.hidden || widget.matches(':hover, :focus-within') || widget.classList.contains('is-collapsed')) return;
      next();
    }, 16000);
  }
})();
