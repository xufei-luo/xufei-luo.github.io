(() => {
  const years = [...document.querySelectorAll('.research-activity .activity-year')];
  const selection = document.getElementById('activity-selection');
  if (!selection || !years.length) return;
  let selected;

  years.forEach((bar, index) => {
    const counts = bar.querySelector('title').textContent;
    const year = counts.split(':', 1)[0];
    bar.setAttribute('role', 'button');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-label', 'Show publication counts for ' + year);
    bar.setAttribute('aria-pressed', 'false');

    const hitArea = document.createElementNS(bar.namespaceURI, 'rect');
    hitArea.setAttribute('class', 'activity-hit-area');
    hitArea.setAttribute('x', 9 + index * 30);
    hitArea.setAttribute('y', '3');
    hitArea.setAttribute('width', '28');
    hitArea.setAttribute('height', '111');
    hitArea.setAttribute('aria-hidden', 'true');
    bar.append(hitArea);

    const showCounts = () => {
      selected?.setAttribute('aria-pressed', 'false');
      selected = bar;
      bar.setAttribute('aria-pressed', 'true');
      selection.textContent = counts;
    };
    bar.addEventListener('click', showCounts);
    bar.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showCounts();
      }
    });
  });
})();
