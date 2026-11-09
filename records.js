const recordDetails = document.querySelectorAll('[data-record]');
const recordLists = document.querySelectorAll('[data-record-list]');
let recordDataPromise;

const latestEnglishPublications = [
  'Chen Y, Luo X, Zhang L. The second step: Making medical AI answerable to evidence. AI Evidence-Based Medicine. 2026;1(2):53-55. doi:10.1097/ai9.0000000000000015. (editorial)',
  'Wang L, Luo X, Zhang J, Wu M, Wang X, Zhao J, Estill J, Shao R. What can artificial intelligence do for randomized controlled trials?: A scoping review. AI Evidence-Based Medicine. 2026;1(2):76-86. doi:10.1097/ai9.0000000000000019. (review)',
  'Wang Q, Luo X, Ma Y, Wang Z, Zhang L, Chen Y. Artificial intelligence in the guideline enterprise: insights from GIN 2026. AI Evidence-Based Medicine. Published online October 12, 2026. doi:10.1097/ai9.0000000000000025. (editorial)',
  'Wang B, Luo X, Chen Y, Estill J. Encouraging Versus Neutral Prompts in Large Language Model-Based Appraisal of Clinical Guidelines Using AGREE II. J Evid Based Med. 2026;19(3):e70190. doi:10.1111/jebm.70190. (IF=4.7, letter)',
  'Zhang J, Shi Q, Liu H, Luo X, Yang Z, Li Z, Wang B, Qin Y, Lai H, Chen Y; ADVANCED Working Group. A Comparative Study of ad^Writer and Human Evaluations of Guideline Reporting Quality: Performance of ChatGPT and DeepSeek. J Evid Based Med. 2026 Oct 6:e70193. doi:10.1111/jebm.70193. (IF=4.7, research)',
  'Liu J, Zhang Y, Lai H, Han M, Ma N, Du S, Zhao W, Xia D, Tong B, Liu Y, Pan B, Wang X, Wang B, Luo X, Li Y, Estill J, Li S, Cui H, Xiao L, Ge L. Impact of LLM-supported patient education on patient perspectives and patient-reported outcomes: a mixed-methods systematic review. npj Digital Medicine. 2026 Sep 10. doi:10.1038/s41746-026-03228-7. (IF=18.0, research)',
  'Duan Y, Shi L, He X, Moher D, Bian Z, Lee MS, Alraek T, Lee YS, Kim TH, Lee H, Spruyt K, Liu J, Liu C, Guo Y, Yan S, Lee B, Negh E, Poini A, Giovanardi CM, Zaslawski C, Estill J, Matsuura Y, Birch S, Sng KS, Lopes L, Min LS, Xu Z, Luo X, Chen Y, Yu L. CONSORT-A 2026: An Extended Reporting Guideline for Acupuncture Randomized Controlled Trials. Integrative Medicine Research. 2026 Oct 10:101405. doi:10.1016/j.imr.2026.101405. (IF=4.9, reporting guideline)'
];

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
  let publicationNumber = null;
  let insertedLatestPublications = false;

  const appendCurrent = () => {
    if (!current.length) return;
    const item = document.createElement('p');
    item.className = 'record-item';
    const text = current.join(' ');
    item.textContent = publicationNumber === null
      ? text
      : `${++publicationNumber}. ${text.replace(/^\d{1,3}\.\s+/, '')}`;
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
        category.textContent = line.replace(/\s*\(n=\d+\)/i, '');
        items.append(category);
        publicationNumber = /^Publications \(in/i.test(line) ? 0 : null;
      } else if (/^(\d{1,3}\.\s+(?=[A-Z\u4e00-\u9fff])|⚫)/.test(line)) {
        if (record.title === 'Full publication record' && !insertedLatestPublications && /^46\.\s/.test(line)) {
          appendCurrent();
          latestEnglishPublications.forEach((publication) => {
            current = [publication];
            appendCurrent();
          });
          insertedLatestPublications = true;
        }
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

recordLists.forEach(async (output) => {
  try {
    const data = await getRecordData();
    renderRecord(output, data[output.dataset.recordList]);
  } catch {
    output.textContent = 'The complete record could not be loaded. Please refresh and try again.';
  }
});
