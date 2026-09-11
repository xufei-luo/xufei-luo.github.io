document.getElementById('year').textContent = new Date().getFullYear();

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
