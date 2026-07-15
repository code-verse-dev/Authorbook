// RANDY FISH — static author site
// No WebGL, no animation journey: just light, dependency-free interactions.
import './style.css';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// ── mobile menu ──
const burger = $('#burger');
const links = $('#nav-links');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// ── active nav link follows the section in view ──
const sections = ['home', 'about', 'philosophy', 'books', 'join', 'footer']
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navAnchors = $$('.nav__links a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach((a) =>
      a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach((s) => spy.observe(s));

// ── subtle reveal-on-scroll for cards ──
$$('.card, .hero__shelf').forEach((el) => el.classList.add('reveal'));
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => reveal.observe(el));

// ── newsletter ──
$('#join-form').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#join-ok').classList.add('show');
  e.target.querySelector('input').value = '';
});

// ── back to top ──
$('#to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
