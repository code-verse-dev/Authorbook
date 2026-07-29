// RANDY FISH — static author site
// Light, dependency-free interactions only.
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
const sections = ['home', 'about', 'books', 'philosophy', 'join', 'footer']
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
$$('.card').forEach((el) => el.classList.add('reveal'));
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => reveal.observe(el));

// ── books row arrows (scroll the row when it overflows) ──
const row = $('#books-row');
$('#books-prev')?.addEventListener('click', () => row.scrollBy({ left: -row.clientWidth * 0.7, behavior: 'smooth' }));
$('#books-next')?.addEventListener('click', () => row.scrollBy({ left: row.clientWidth * 0.7, behavior: 'smooth' }));

// ── newsletter ──
$('#join-form').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#join-ok').classList.add('show');
  e.target.querySelector('input').value = '';
});

// ── book PDF preview modal ──
const pdfModal = $('#pdf-modal');
const pdfFrame = $('#pdf-frame');
const pdfTitle = $('#pdf-modal-title');
const pdfOpen = $('#pdf-open');

function openPdfPreview(pdf, title) {
  pdfTitle.textContent = title || 'Book preview';
  pdfFrame.src = pdf;
  pdfOpen.href = pdf;
  pdfModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePdfPreview() {
  pdfModal.hidden = true;
  pdfFrame.src = '';
  document.body.style.overflow = '';
}

$$('.js-book-preview').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openPdfPreview(btn.dataset.pdf, btn.dataset.title);
  });
});

pdfModal?.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-pdf]')) closePdfPreview();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && pdfModal && !pdfModal.hidden) closePdfPreview();
});
