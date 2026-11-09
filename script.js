document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
document.querySelectorAll('.site-header .brand').forEach((brand) => {
  brand.style.setProperty('color', '#fff', 'important');
  brand.style.fontWeight = '700';
});
const pageTitles = {
  'research.html': 'Research',
  'awards.html': 'Awards & Grants',
  'guidelines.html': 'Guidelines',
  'publications.html': 'Publications',
  'books.html': 'Books & Patents',
  'conference.html': 'Conference',
  'contact.html': 'Contact'
};
const pageName = window.location.pathname.split('/').pop() || 'index.html';
const pageTitle = document.querySelector('.page-title');
if (pageTitle && pageTitles[pageName]) pageTitle.textContent = pageTitles[pageName];
const namePattern = /(Xufei Luo|Luo Xufei|Luo X|X\. Luo|罗旭飞)/g;
function emphasizeNames(root = document.body) {
  const nodes = []; const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) {
    const parent = node.parentElement; if (!parent || parent.closest('script, style, .name-emphasis, .brand')) return NodeFilter.FILTER_REJECT;
    namePattern.lastIndex = 0; return namePattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }});
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { const fragment = document.createDocumentFragment(); node.nodeValue.split(namePattern).forEach((part) => {
    if (!part) return; namePattern.lastIndex = 0;
    if (namePattern.test(part)) { const strong = document.createElement('strong'); strong.className = 'name-emphasis'; strong.textContent = part; fragment.append(strong); }
    else fragment.append(document.createTextNode(part));
  }); node.replaceWith(fragment); });
}
emphasizeNames();
