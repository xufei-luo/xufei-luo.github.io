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
  const items = document.createElement('div');
  items.className = 'record-items';
  let current = [];
  let skippingBooks = false;
  let skippingConferenceSupplement = false;

  const appendCurrent = () => {
    if (!current.length) return;
    const item = document.createElement('p');
    item.className = 'record-item';
    item.textContent = current.join(' ');
    emphasizeNames(item);
    items.append(item);
    current = [];
  };

  record.pages.forEach((page) => {
    page.text.split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => {
      if (/^Books \(n=\d+\)/i.test(line)) {
        appendCurrent();
        skippingBooks = true;
        return;
      }
      if (skippingBooks) return;
      if (record.title === 'Full conference abstract record' && /^(Programs|Patents and Software Copyrights)$/i.test(line)) {
        appendCurrent();
        skippingConferenceSupplement = true;
        return;
      }
      if (skippingConferenceSupplement) return;
      if (/^(Publications \(in|Conference Abstracts|Projects \(Most)/i.test(line)) {
        appendCurrent();
        const category = document.createElement('p');
        category.className = 'record-category';
        category.textContent = line;
        items.append(category);
      } else if (/^(\d+\.\s+(?=[A-Z\u4e00-\u9fff])|⚫)/.test(line)) {
        appendCurrent();
        current = [line];
      } else if (current.length) {
        current.push(line);
      }
    });
  });
  appendCurrent();
  container.append(items);
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
