document.getElementById('year').textContent = new Date().getFullYear();

const namePattern = /(Xufei Luo|Luo Xufei|Luo X|X\. Luo|罗旭飞)/g;

function emphasizeNames(root = document.body) {
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, .name-emphasis')) return NodeFilter.FILTER_REJECT;
      namePattern.lastIndex = 0;
      return namePattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.nodeValue.split(namePattern).forEach((part) => {
      if (!part) return;
      namePattern.lastIndex = 0;
      if (namePattern.test(part)) {
        const emphasis = document.createElement('strong');
        emphasis.className = 'name-emphasis';
        emphasis.textContent = part;
        fragment.append(emphasis);
      } else {
        fragment.append(document.createTextNode(part));
      }
    });
    node.replaceWith(fragment);
  });
}

emphasizeNames();

const navLinks = [...document.querySelectorAll('nav a')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.removeAttribute('aria-current'));
    const active = navLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
    if (active) active.setAttribute('aria-current', 'page');
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

sections.forEach((section) => observer.observe(section));
