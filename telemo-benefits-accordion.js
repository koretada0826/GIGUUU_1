(() => {
  const mobile = matchMedia('(max-width: 767px)');
  const cards = document.querySelectorAll('#telemo-core .telemo-benefits__card');
  const items = [...cards].map((card, index) => {
    const heading = card.querySelector('h3');
    const body = card.querySelector('.telemo-benefits__body');
    const titleNodes = [...heading.childNodes];
    const button = document.createElement('button');
    const title = document.createElement('span');
    const indicator = document.createElement('span');
    body.id ||= `telemo-benefit-description-${index + 1}`;
    button.type = 'button';
    button.className = 'telemo-benefits__toggle';
    button.setAttribute('aria-controls', body.id);
    indicator.className = 'telemo-benefits__toggle-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    button.append(title, indicator);

    const item = { card, heading, body, titleNodes, button, title, expanded: false };
    button.addEventListener('click', () => {
      item.expanded = !item.expanded;
      render(item);
    });
    return item;
  });

  const render = item => {
    if (mobile.matches) {
      item.title.replaceChildren(...item.titleNodes);
      item.heading.replaceChildren(item.button);
      item.button.setAttribute('aria-expanded', String(item.expanded));
    } else {
      item.heading.replaceChildren(...item.titleNodes);
    }
    item.body.hidden = mobile.matches && !item.expanded;
    item.card.classList.toggle('is-description-collapsed', item.body.hidden);
  };

  const updateLayout = () => items.forEach(render);
  mobile.addEventListener('change', updateLayout);
  updateLayout();
})();
