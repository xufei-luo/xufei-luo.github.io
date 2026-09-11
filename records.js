const recordDetails = document.querySelectorAll('[data-record]');
let recordDataPromise;

function getRecordData() {
  if (!recordDataPromise) {
    recordDataPromise = fetch('records.json').then((response) => {
      if (!response.ok) throw new Error('Unable to load record data');
      return response.json();
    });
  }
  return recordDataPromise;
}

function renderRecord(container, record) {
  container.replaceChildren();
  record.pages.forEach((page) => {
    const section = document.createElement('section');
    section.className = 'record-page';

    const label = document.createElement('p');
    label.className = 'record-page-label';
    label.textContent = `${record.title} · source page ${page.sourcePage}`;

    const content = document.createElement('pre');
    content.textContent = page.text;

    section.append(label, content);
    container.append(section);
  });
}

recordDetails.forEach((details) => {
  details.addEventListener('toggle', async () => {
    if (!details.open || details.dataset.loaded === 'true') return;

    const output = details.querySelector('.record-output');
    output.textContent = 'Loading complete record…';
    try {
      const data = await getRecordData();
      renderRecord(output, data[details.dataset.record]);
      details.dataset.loaded = 'true';
    } catch {
      output.textContent = 'The complete record could not be loaded. Please refresh and try again.';
    }
  });
});
