// ══════════════════════════════════════════════════════════
// RANDY FISH — THE CONSCIOUSNESS EXPERIENCE
// Orchestration: GSAP ScrollTrigger drives the Three.js world,
// captions, the golden-egg countdown, the reality break and
// the final site reveal.
// ══════════════════════════════════════════════════════════
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Experience, SCENES } from './experience.js';
import { BOOKS } from './covers.js';
import heroImg from './assets/hero.jpg';
import aboutImg from './assets/about.jpg';
import figImg from './assets/quotefig.jpg';
import covQuantum from './assets/cov-quantum.jpg';
import covForce from './assets/cov-force.jpg';
import covJuly from './assets/cov-july.jpg';
import covEgg from './assets/cov-egg.jpg';

const COVER_IMG = { quantum: covQuantum, force: covForce, july: covJuly, egg: covEgg };
import { audio } from './audio.js';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const EGG_HATCH_SECONDS = 90; // "After exactly 90 seconds… the Egg hatches."

// ────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────
let started = false;
let hatched = false;
let eggRemaining = EGG_HATCH_SECONDS;
let eggActive = false;
let randyLineTyped = false;

document.body.classList.add('no-scroll');
window.scrollTo(0, 0);

// ────────────────────────────────────────────────
// THREE.JS WORLD
// ────────────────────────────────────────────────
const exp = new Experience($('#webgl'), {
  coverImages: COVER_IMG,
  onBook: openBook,
  onPlanet: (book, mesh) => {
    // light-speed punch toward the chosen world
    audio.whoosh(1.1, 0.2);
    gsap.fromTo(exp.camera, { fov: 58 }, {
      fov: 34, duration: 0.5, yoyo: true, repeat: 1, ease: 'power3.in',
      onUpdate: () => exp.camera.updateProjectionMatrix()
    });
    gsap.delayedCall(0.55, () => openBook(book));
  },
  onEggClick: () => {
    if (hatched) return;
    eggRemaining = Math.max(0, eggRemaining - 6);
    audio.blip(520);
    audio.beat(1.4);
    exp.onBeat();
  },
  onHoverChange: (on) => $('#cursor-ring').classList.toggle('hover', on)
});

audio.onBeat = () => exp.onBeat();

// ────────────────────────────────────────────────
// SCENE 1 — ARRIVAL
// ────────────────────────────────────────────────
const gateEls = $$('.gate__inner > *');
gsap.to(gateEls, { opacity: 1, y: 0, duration: 1.2, stagger: 0.18, ease: 'power3.out', delay: 0.4 });

$('#enter-btn').addEventListener('click', () => {
  if (started) return;
  started = true;
  audio.init();

  const tl = gsap.timeline();
  // the gate dissolves into pure black
  tl.to(gateEls, { opacity: 0, y: -14, duration: 0.8, stagger: 0.05, ease: 'power2.in' })
    .to('#gate', { opacity: 0, duration: 1.2, onComplete: () => $('#gate').remove() })
    // …silence… then a heartbeat
    .add(() => { audio.beat(1.2); exp.onBeat(); }, '+=1.6')
    .add(() => { audio.beat(1.4); exp.onBeat(); }, '+=1.1')
    // millions of stars are born
    .add(() => {
      exp.revealStars();
      audio.startHeartbeat(1100);
      audio.startAmbient();
      audio.whoosh(3, 0.14);
      gsap.fromTo(exp.renderer, { toneMappingExposure: 0 }, { toneMappingExposure: 1.1, duration: 6, ease: 'power2.out' });
    }, '+=0.9')
    // "Before consciousness… there was silence."
    .to('[data-cap="arrival"]', { autoAlpha: 1, duration: 3.2, ease: 'power2.out' }, '+=1.6')
    .add(() => {
      document.body.classList.remove('no-scroll');
      ScrollTrigger.refresh();
      gsap.to('#hud', { opacity: 1, duration: 1.5 });
    }, '+=1.4');
});

// ────────────────────────────────────────────────
// THE JOURNEY — one endless camera dolly
// ────────────────────────────────────────────────
ScrollTrigger.create({
  trigger: '#journey',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.6, // heavy, cinematic lag — the camera glides, never snaps
  onUpdate: (self) => {
    exp.setJourneyProgress(self.progress);
    gsap.set('#progress-fill', { width: `${self.progress * 100}%` });
  }
});

// captions per waypoint + transition whooshes
$$('.waypoint').forEach((wp) => {
  const name = wp.dataset.scene;
  const cap = $(`[data-cap="${name}"]`);
  ScrollTrigger.create({
    trigger: wp,
    start: 'top 55%',
    end: 'bottom 55%',
    onEnter: () => enterScene(name, cap),
    onEnterBack: () => enterScene(name, cap),
    onLeave: () => cap && gsap.to(cap, { autoAlpha: 0, duration: 1.2, overwrite: 'auto' }),
    onLeaveBack: () => cap && gsap.to(cap, { autoAlpha: 0, duration: 1.2, overwrite: 'auto' }),
    onUpdate: (self) => {
      if (name === 'dna') {
        // light the six eras in sequence
        const lit = Math.floor(self.progress * 6.99);
        $$('.dna-legend li').forEach((li, i) => li.classList.toggle('lit', i <= lit));
      }
    }
  });
});

function enterScene(name, cap) {
  if (!started) return;
  if (cap) gsap.fromTo(cap, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 2, ease: 'power3.out', overwrite: 'auto' });
  if (name !== 'arrival') audio.whoosh(1.3, 0.1);
  $('#scroll-hint').style.opacity = name === 'arrival' ? '' : '0';

  // Randy speaks — typed letter by letter, once
  if (name === 'randy' && !randyLineTyped) {
    randyLineTyped = true;
    typeText($('#randy-line'), '"I\'ve been waiting for you."', 55);
  }

  // heartbeat tempo follows the story
  const tempo = { arrival: 1100, genesis: 1000, randy: 950, books: 1050, library: 1000, dna: 950, network: 900, egg: 800 };
  audio.setHeartRate(tempo[name] ?? 1000);

  eggActive = name === 'egg';
}

function typeText(el, text, ms) {
  el.textContent = '';
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, ms);
  };
  tick();
}

// ────────────────────────────────────────────────
// SCENE 11 — GOLDEN EGG COUNTDOWN → HATCH
// ────────────────────────────────────────────────
setInterval(() => {
  if (!eggActive || hatched || !started) return;
  eggRemaining = Math.max(0, eggRemaining - 1);
  $('#egg-timer').textContent = eggRemaining;
  const p = 1 - eggRemaining / EGG_HATCH_SECONDS;
  exp.setCrackProgress(p);
  // the closer to hatching, the faster your heart
  audio.setHeartRate(800 - p * 450);
  if (eggRemaining <= 0) hatchSequence();
}, 1000);

function hatchSequence() {
  if (hatched) return;
  hatched = true;
  audio.stopHeartbeat();
  audio.hatch();
  exp.hatch(() => {
    // golden light fills the screen — the visitor is blinded
    gsap.timeline()
      .to('#flash', { opacity: 1, duration: 0.35, ease: 'power4.in' })
      .add(realityBreak, '+=0.9');
  });
}

// ────────────────────────────────────────────────
// SCENE 12 — REALITY BREAK (stylized takeover, then restore)
// ────────────────────────────────────────────────
const GLITCH_LINES = [
  'SIGNAL LOST . . .',
  '',
  '> anomaly detected in local reality',
  '> consciousness.sys expanding beyond allocated memory',
  '> neural lattice growth: 4 nodes → 91,442 nodes → ∞',
  '> attempting containment… FAILED',
  '> attempting containment… FAILED',
  '> query: am I the reader, or am I being read?',
  '',
  '> …',
  '> it is only a story. it was always only a story.',
  '> restoring your reality…',
  '',
  'REALITY RESTORED — thank you for waking up with us.'
];

function realityBreak() {
  const glitch = $('#glitch');
  const pre = $('#glitch-text');
  glitch.classList.add('on');
  gsap.to('#flash', { opacity: 0, duration: 0.4 });
  audio.glitchNoise(0.5);

  let li = 0;
  const typeLine = () => {
    if (li >= GLITCH_LINES.length) return gsap.delayedCall(1.6, restoreReality);
    pre.textContent += GLITCH_LINES[li] + '\n';
    if (GLITCH_LINES[li].startsWith('>')) audio.glitchNoise(0.12);
    li++;
    gsap.delayedCall(GLITCH_LINES[li - 1] === '' ? 0.25 : 0.62, typeLine);
  };
  gsap.delayedCall(0.5, typeLine);
}

function restoreReality() {
  const glitch = $('#glitch');
  audio.whoosh(2, 0.16);
  gsap.timeline()
    .to('#flash', { opacity: 1, duration: 0.25 })
    .add(() => {
      glitch.classList.remove('on');
      revealSite();
    })
    .to('#flash', { opacity: 0, duration: 1.6, ease: 'power2.out' });
}

// ────────────────────────────────────────────────
// FINAL SITE
// ────────────────────────────────────────────────
function revealSite() {
  const site = $('#site');
  site.classList.add('visible');
  site.setAttribute('aria-hidden', 'false');
  ScrollTrigger.refresh();
  // carry the visitor down into the site
  site.scrollIntoView({ behavior: 'smooth' });
  gsap.from('.hero2__left > *, .hero2__right', { opacity: 0, y: 30, stagger: 0.12, duration: 1.2, delay: 0.5, ease: 'power3.out' });
  $$('#captions .caption').forEach((c) => gsap.set(c, { autoAlpha: 0 }));
  gsap.to('#hud', { opacity: 0, duration: 1 });
}

// the real graphics from the design
$('[data-art="hero"]').src = heroImg;
$('[data-art="desk"]').src = aboutImg;
$('[data-art="fig"]').src = figImg;

// book cards in the final grid
const grid = $('#book-grid');
BOOKS.forEach((book) => {
  const card = document.createElement('div');
  card.className = 'book-card';
  const img = document.createElement('img');
  img.src = COVER_IMG[book.id];
  img.alt = book.title;
  card.appendChild(img);
  card.insertAdjacentHTML('beforeend', `
    <h4>${book.title}</h4>
    <p>${book.tag.charAt(0) + book.tag.slice(1).toLowerCase()}</p>
    <button class="btn btn--ghost btn--small magnetic" data-book="${book.id}"><span>LEARN MORE →</span></button>
  `);
  grid.appendChild(card);
});
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-book]');
  if (btn) openBook(BOOKS.find((b) => b.id === btn.dataset.book));
});

// carousel arrows
$('#books-prev').addEventListener('click', () => grid.scrollBy({ left: -grid.clientWidth * 0.7 }));
$('#books-next').addEventListener('click', () => grid.scrollBy({ left: grid.clientWidth * 0.7 }));

$('#join-form').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#join-ok').classList.add('show');
  audio.blip(1040);
  e.target.querySelector('input').value = '';
});

$('#replay-btn')?.addEventListener('click', () => {
  window.scrollTo(0, 0);
  location.reload();
});

$$('[data-scrollto]').forEach((b) =>
  b.addEventListener('click', () => $(b.dataset.scrollto)?.scrollIntoView({ behavior: 'smooth' })));

// ────────────────────────────────────────────────
// THE LIVING BOOK — tap a book, it opens itself,
// the cover swings, pages turn, content is inside
// ────────────────────────────────────────────────
const bookview = $('#bookview');
let bookOpen = false;
let pageState = 0; // 0 closed · 1 spread (page 1) · 2 page turned (2/3)

function openBook(book) {
  if (!book || bookOpen) return;
  bookOpen = true;
  pageState = 1;

  // fill the pages
  $('#bp-kicker').textContent = 'A BOOK BY RANDY FISH';
  $('#bp-title').textContent = book.title;
  $('#bp-tag').textContent = book.tag;
  $('#bp-blurb').textContent = book.blurb;
  $('#bp-quote').textContent = book.quote;
  $('#bp-ex1').textContent = book.excerpt;
  $('#bp-ex2').textContent = book.excerpt2;
  $('#bp-chapters').innerHTML = book.chapters.map((c) => `<li>${c}</li>`).join('');
  $('#bp-coverimg').style.backgroundImage = `url(${COVER_IMG[book.id]})`;
  $('#page-btn').querySelector('span').textContent = 'TURN THE PAGE →';

  bookview.classList.add('open');
  bookview.setAttribute('aria-hidden', 'false');
  audio.blip(760);

  // start closed: cover shut, book centered on its cover, left paper hidden.
  // z offsets keep real stacking: closed cover(6) > page(3) > chapters(0);
  // the turned page rises to 9 so it lands ON TOP of the opened cover.
  gsap.set('#book-cover', { rotationY: 0, z: 6 });
  gsap.set('#book-flip', { rotationY: 0, z: 3 });
  gsap.set('#book3d', { xPercent: -25 });
  gsap.set('#book-left', { autoAlpha: 0 });
  gsap.set('#page-btn', { autoAlpha: 0, y: 14 });

  gsap.timeline()
    .fromTo('.bookview__scrim', { opacity: 0 }, { opacity: 1, duration: 0.6 })
    .fromTo('#book3d',
      { scale: 0.55, y: 90, rotationX: 24, opacity: 0 },
      { scale: 1, y: 0, rotationX: 8, opacity: 1, duration: 1.1, ease: 'power3.out' }, '<0.15')
    // the cover opens itself…
    .add(() => audio.pageTurn(), '+=0.35')
    .to('#book-cover', { rotationY: -180, duration: 1.6, ease: 'power2.inOut' }, '<')
    .to('#book3d', { xPercent: 0, duration: 1.6, ease: 'power2.inOut' }, '<')
    .to('#book-left', { autoAlpha: 1, duration: 0.45 }, '<0.7')
    // …and the words arrive
    .fromTo('.book3d__face--front .bookpage__kicker, .book3d__face--front .bookpage__body, .book3d__face--front .bookpage__quote',
      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.18, ease: 'power2.out' }, '-=0.5')
    .to('#page-btn', { autoAlpha: 1, y: 0, duration: 0.6 }, '<0.4');
}

function turnPage() {
  if (pageState === 1) {
    pageState = 2;
    audio.pageTurn();
    gsap.timeline()
      .to('#book-flip', { rotationY: -180, z: 9, duration: 1.5, ease: 'power2.inOut' })
      .fromTo('.bookpage--under > *',
        { opacity: 0.4 }, { opacity: 1, duration: 0.7 }, '-=0.5');
    $('#page-btn').querySelector('span').textContent = 'CLOSE THE BOOK ✕';
  } else {
    closeBook();
  }
}

function closeBook() {
  if (!bookOpen) return;
  audio.pageTurn();
  gsap.timeline({
    onComplete: () => {
      bookview.classList.remove('open');
      bookview.setAttribute('aria-hidden', 'true');
      bookOpen = false;
    }
  })
    .to('#book3d', { scale: 0.6, y: 70, opacity: 0, duration: 0.7, ease: 'power2.in' })
    .to('.bookview__scrim', { opacity: 0, duration: 0.5 }, '<0.2');
}

$('#page-btn').addEventListener('click', turnPage);
$('#bookview-close').addEventListener('click', closeBook);
$('#bookview-scrim').addEventListener('click', closeBook);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBook(); });

// ────────────────────────────────────────────────
// SCENE 4 — TALK TO RANDY (conversational avatar)
// Local persona engine — swap `randyReply` with a real
// LLM endpoint (OpenAI / Claude) + ElevenLabs voice when
// API keys are available. The UI is already wired for it.
// ────────────────────────────────────────────────
const RANDY_BRAIN = [
  { k: /golden egg/i, r: 'The Golden Egg came to me as a question: what if creation itself is patient? Everything that ever mattered began inside a shell it had to break. I simply wrote down what the shell told me.' },
  { k: /quantum|bridge/i, r: 'The Quantum Consciousness Bridge began the night I realized the observer was never outside the experiment. Physics describes the stage — consciousness writes the play.' },
  { k: /fourth|july|freedom/i, r: 'Fourth of July is not about a date. It is about the morning a whole world wakes up and remembers what it was meant to become. Freedom was never given — it was remembered.' },
  { k: /force|fundamental/i, r: 'Gravity bends space. Light defines time. But ask yourself — what force is aware of both? Consciousness is not something we create. It is the force that creates everything.' },
  { k: /who are you|about you|yourself/i, r: 'Soldier, engineer, jeweler, inventor, writer. Six lives in one strand of DNA. But mostly? I am a witness — the universe looking at itself and taking notes.' },
  { k: /ai|artificial|machine/i, r: 'People ask if machines will become conscious. I ask the opposite: when will we notice that consciousness was never exclusively ours to begin with?' },
  { k: /write|book|inspir/i, r: 'I write at 4 a.m., when the boundary between worlds is thinnest. Ideas do not come from me — they come through me. My job is only to keep the door open.' },
  { k: /hello|hi|hey/i, r: 'Hello, traveler. You made it through three universes to find me. Ask me anything — about the books, about consciousness, about what comes next.' },
  { k: /future|next/i, r: 'The future is not a place we go to. It is a thing we hatch. And if you have scrolled this far, you can already hear it tapping on the inside of the shell.' }
];
const RANDY_FALLBACK = [
  'Interesting. Hold that question up to the light — what is really asking it, you or the silence behind you?',
  'Every question is a doorway. That one leads somewhere I explore in The Fundamental Force. But the short answer: consciousness first, everything else after.',
  'I have been waiting for that question. The honest answer is in the space between the words — keep reading, keep asking.'
];
let fallbackIdx = 0;

function randyReply(text) {
  const hit = RANDY_BRAIN.find((b) => b.k.test(text));
  return hit ? hit.r : RANDY_FALLBACK[(fallbackIdx++) % RANDY_FALLBACK.length];
}

const chat = $('#chat');
const log = $('#chat-log');
function addMsg(text, who) {
  const div = document.createElement('div');
  div.className = `chat__msg chat__msg--${who}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  if (who === 'randy') {
    let i = 0;
    const tick = () => {
      div.textContent = text.slice(0, ++i);
      log.scrollTop = log.scrollHeight;
      if (i < text.length) setTimeout(tick, 14);
    };
    tick();
  } else div.textContent = text;
}

$('#talk-btn').addEventListener('click', () => {
  chat.classList.add('open');
  chat.setAttribute('aria-hidden', 'false');
  if (!log.children.length) {
    setTimeout(() => addMsg("I've been waiting for you. Ask me anything — for example… what inspired The Golden Egg?", 'randy'), 350);
  }
  audio.blip(880);
});
$('#chat-close').addEventListener('click', () => chat.classList.remove('open'));
$('#chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#chat-input');
  const text = input.value.trim();
  if (!text) return;
  addMsg(text, 'user');
  input.value = '';
  audio.blip(660);
  setTimeout(() => addMsg(randyReply(text), 'randy'), 700 + Math.random() * 600);
});

// ────────────────────────────────────────────────
// MICRO-INTERACTIONS — cursor, magnetism, mute
// ────────────────────────────────────────────────
const dot = $('#cursor-dot');
const ring = $('#cursor-ring');
let rx = innerWidth / 2, ry = innerHeight / 2;
let mx = rx, my = ry;
addEventListener('pointermove', (e) => {
  mx = e.clientX; my = e.clientY;
  gsap.set(dot, { x: mx, y: my });
});
gsap.ticker.add(() => {
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  gsap.set(ring, { x: rx, y: ry });
});
document.addEventListener('pointerover', (e) => {
  if (e.target.closest('button, a, input, .book-card')) ring.classList.add('hover');
});
document.addEventListener('pointerout', (e) => {
  if (e.target.closest('button, a, input, .book-card')) ring.classList.remove('hover');
});

// magnetic buttons — they lean toward your hand
document.addEventListener('pointermove', (e) => {
  $$('.magnetic').forEach((el) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist < 130) {
      gsap.to(el, { x: dx * 0.22, y: dy * 0.22, duration: 0.4, ease: 'power3.out' });
    } else {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    }
  });
});

$('#mute-btn').addEventListener('click', (e) => {
  const m = !audio.muted;
  audio.setMuted(m);
  e.currentTarget.textContent = m ? 'SOUND OFF' : 'SOUND ON';
});
