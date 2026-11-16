(() => {
  const byId = name => document.getElementById('collaborations-' + name);
  const map = byId('map');
  const select = byId('region');
  const detail = byId('detail');
  const status = byId('status');
  const larger = byId('zoom-in');
  const smaller = byId('zoom-out');
  const reset = byId('reset');
  const world = { w: 720, h: 306 };
  const svgNode = (tag, attrs) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
  };
  const element = (tag, content) => {
    const node = document.createElement(tag);
    if (content) node.textContent = content;
    return node;
  };
  const count = (n, noun) => n + ' ' + noun + (n === 1 ? '' : 's');
  let view = { x: 0, y: 0, ...world };
  let selected;
  let drag;

  function setView(x, y, w) {
    const h = world.h * w / world.w;
    view = { x: Math.max(0, Math.min(world.w - w, x)), y: Math.max(0, Math.min(world.h - h, y)), w, h };
    map.setAttribute('viewBox', [view.x, view.y, w, h].join(' '));
    larger.disabled = w <= 120;
    smaller.disabled = reset.disabled = w === world.w;
  }

  function zoom(factor) {
    const w = Math.min(world.w, Math.max(120, view.w * factor));
    const h = world.h * w / world.w;
    const [x, y] = selected?.point ?? [view.x + view.w / 2, view.y + view.h / 2];
    setView(x - w / 2, y - h / 2, w);
  }

  function render(data) {
    const markers = new Map();
    function show(code) {
      selected = data.regions.find(region => region.code === code);
      select.value = code;
      for (const [key, marker] of markers) marker.setAttribute('aria-pressed', key === code);
      detail.replaceChildren();
      if (!selected) return;
      const { name, papers, institutions } = selected;
      detail.append(element('p', name + ' · ' + count(papers.length, 'shared paper') + ' · ' + count(institutions.length, 'institution')));
      if (institutions.length) {
        const group = element('details');
        group.append(element('summary', 'Institutions and publications'));
        const listing = element('ul');
        for (const [institution, ids] of institutions) {
          const item = element('li');
          const section = element('details');
          section.append(element('summary', institution + ' (' + ids.length + ')'));
          const references = element('ul');
          for (const id of ids) {
            const [title, url] = data.papers[id];
            const reference = element('li');
            const link = element('a', title);
            link.href = url;
            reference.append(link);
            references.append(reference);
          }
          section.append(references);
          item.append(section);
          listing.append(item);
        }
        group.append(listing);
        detail.append(group);
      }
      if (view.w !== world.w) zoom(1);
    }

    map.append(svgNode('path', { d: data.shape, class: 'map-land', 'fill-rule': 'evenodd' }));
    select.append(new Option('Select a country or territory', ''));
    for (const region of data.regions) {
      select.append(new Option(region.name + ' (' + region.papers.length + ')', region.code));
    }
    for (const region of data.regions) {
      const label = region.name + ', ' + count(region.papers.length, 'shared paper');
      const marker = svgNode('circle', {
        cx: region.point[0], cy: region.point[1], r: Math.min(17, 5 + Math.sqrt(region.papers.length)),
        class: 'map-dot', tabindex: 0, role: 'button', 'aria-label': label, 'aria-pressed': 'false'
      });
      const tooltip = svgNode('title', {});
      tooltip.textContent = label;
      marker.append(tooltip);
      marker.addEventListener('click', () => show(region.code));
      marker.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          show(region.code);
        }
      });
      map.append(marker);
      markers.set(region.code, marker);
    }
    select.addEventListener('change', () => show(select.value));
    larger.addEventListener('click', () => zoom(1 / 1.5));
    smaller.addEventListener('click', () => zoom(1.5));
    reset.addEventListener('click', () => setView(0, 0, world.w));
    map.addEventListener('pointerdown', event => {
      if (view.w === world.w || event.target.closest('.map-dot') || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, view };
      map.setPointerCapture(event.pointerId);
    });
    map.addEventListener('pointermove', event => {
      if (!drag) return;
      const scale = drag.view.w / map.getBoundingClientRect().width;
      setView(drag.view.x + (drag.x - event.clientX) * scale, drag.view.y + (drag.y - event.clientY) * scale, drag.view.w);
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      map.addEventListener(name, () => { drag = null; });
    }
    setView(0, 0, world.w);
    status.textContent = data.regions.length + ' countries and territories · ' + data.mapped + ' of ' + data.total + ' papers mapped';
    byId('method').textContent = 'The map uses co-authors’ publication affiliations, excluding Xufei Luo’s own affiliations. Each paper counts once per country or territory. Where a location in a byline conflicted with an institution’s indexed country, the byline location took priority. Papers ' + data.missing.join(' and ') + ' lacked usable geography. Some co-author institutions were missing from ' + data.incomplete + ' mapped records.';
    byId('controls').hidden = false;
  }

  fetch('collaborations-data.json')
    .then(response => {
      if (!response.ok) throw Error('Unable to load affiliation records');
      return response.json();
    })
    .then(render)
    .catch(() => { status.textContent = 'The collaboration map is currently unavailable.'; });
})();
