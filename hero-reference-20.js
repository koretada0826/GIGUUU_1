(() => {
  'use strict';

  const references = JSON.parse(document.querySelector('#reference-data').textContent);
  const cards = Array.from(document.querySelectorAll('.option'));
  const byId = new Map(references.map(item => [item.id, item]));
  const storageKey = 'telemo-webdesignclip-hero-candidates-20261030';
  let saved = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) saved = new Set(stored.filter(id => byId.has(id)));
  } catch { /* The comparison board also works when storage is unavailable. */ }

  const search = document.querySelector('#search');
  const selectedOnly = document.querySelector('#selected-only');
  const dialog = document.querySelector('#detail-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  let category = 'all';
  let onlySaved = false;
  let currentId = null;
  let modalIds = [];
  let trigger = null;

  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ja').trim();

  function filterCards() {
    const query = normalize(search.value);
    let visible = 0;
    cards.forEach(card => {
      const matches = (category === 'all' || card.dataset.group === category)
        && (!query || normalize(card.dataset.search).includes(query))
        && (!onlySaved || saved.has(card.dataset.id));
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    document.querySelector('#result-count').textContent = `${visible} / ${cards.length} 案`;
    document.querySelector('#empty').hidden = visible !== 0;
  }

  function updateSelection() {
    cards.forEach(card => {
      const chosen = saved.has(card.dataset.id);
      card.classList.toggle('is-selected', chosen);
      const button = card.querySelector('[data-save]');
      button.setAttribute('aria-pressed', String(chosen));
      button.setAttribute('aria-label', `案${card.dataset.id}を${chosen ? '候補から外す' : '候補に入れる'}`);
      button.textContent = chosen ? '候補に保存済み' : '候補に入れる';
    });
    document.querySelector('#selection-count').textContent = `候補 ${saved.size}件`;
    document.querySelector('#selection-ids').textContent = saved.size
      ? Array.from(saved).sort().map(id => `#${id}`).join(' ・ ')
      : '気になる案を「候補に入れる」で保存';
    try { localStorage.setItem(storageKey, JSON.stringify(Array.from(saved))); } catch { /* Session-only selection. */ }
    filterCards();
  }

  function setDialogMode(mode) {
    dialogContent.dataset.mode = mode;
    document.querySelectorAll('[data-dialog-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.dialogMode === mode));
    });
  }

  function renderDialog(id, mode) {
    const item = byId.get(id);
    if (!item) return;
    currentId = id;
    document.querySelector('#dialog-title').textContent = `${id} — ${item.concept}`;
    document.querySelector('#dialog-eyebrow').textContent = `REFERENCE: ${item.name}`;
    const pair = document.querySelector(`#option-${id} .pair`).cloneNode(true);
    const referenceButton = pair.querySelector('.reference-frame');
    const frame = document.createElement('div');
    frame.className = 'reference-frame';
    const referenceImage = referenceButton.querySelector('img').cloneNode(true);
    referenceImage.loading = 'eager';
    frame.append(referenceImage);
    referenceButton.replaceWith(frame);
    pair.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    dialogContent.replaceChildren(pair);
    document.querySelector('#dialog-note').textContent = `${item.referencePoint} ${item.adaptation}`;
    document.querySelector('#dialog-clip').href = item.clipUrl;
    document.querySelector('#dialog-site').href = item.siteUrl;
    document.querySelector('#dialog-original').href = item.image;
    const index = modalIds.indexOf(id);
    document.querySelector('#dialog-position').textContent = `${index + 1} / ${modalIds.length}`;
    document.querySelector('#previous-option').disabled = index <= 0;
    document.querySelector('#next-option').disabled = index >= modalIds.length - 1;
    setDialogMode(mode);
  }

  function openDialog(id, mode, opener) {
    trigger = opener;
    modalIds = cards.filter(card => !card.hidden).map(card => card.dataset.id);
    if (!modalIds.includes(id)) modalIds = references.map(item => item.id);
    renderDialog(id, mode);
    dialog.showModal();
    document.querySelector('#close-dialog').focus();
  }

  document.querySelector('.option-grid').addEventListener('click', event => {
    const save = event.target.closest('[data-save]');
    if (save) {
      const id = save.dataset.save;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      updateSelection();
      return;
    }
    const opener = event.target.closest('[data-open]');
    if (opener) openDialog(opener.dataset.open, opener.dataset.initialMode || 'compare', opener);
  });

  document.querySelectorAll('.controls [data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      document.body.dataset.mode = button.dataset.mode;
      document.querySelectorAll('.controls [data-mode]').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });
    });
  });

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      filterCards();
    });
  });

  search.addEventListener('input', filterCards);
  selectedOnly.addEventListener('click', () => {
    onlySaved = !onlySaved;
    selectedOnly.setAttribute('aria-pressed', String(onlySaved));
    filterCards();
    document.querySelector('#board').scrollIntoView({ block: 'start' });
  });
  document.querySelector('#clear-selection').addEventListener('click', () => {
    saved.clear();
    updateSelection();
  });
  document.querySelector('#reset').addEventListener('click', () => {
    category = 'all';
    onlySaved = false;
    search.value = '';
    selectedOnly.setAttribute('aria-pressed', 'false');
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'));
    });
    filterCards();
    search.focus();
  });

  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (trigger && !trigger.closest('[hidden]')) trigger.focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-dialog-mode]').forEach(button => {
    button.addEventListener('click', () => setDialogMode(button.dataset.dialogMode));
  });
  for (const [selector, offset] of [['#previous-option', -1], ['#next-option', 1]]) {
    document.querySelector(selector).addEventListener('click', () => {
      const next = modalIds[modalIds.indexOf(currentId) + offset];
      if (next) renderDialog(next, dialogContent.dataset.mode);
    });
  }

  updateSelection();
})();
