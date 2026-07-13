// Procedurally painted book covers — no image assets required.
// Each cover echoes the design mock: near-black field, gold serif type, a glowing emblem.

export const BOOKS = [
  {
    id: 'quantum',
    title: 'The Quantum Consciousness Bridge',
    lines: ['THE QUANTUM', 'CONSCIOUSNESS', 'BRIDGE'],
    tag: "HUMANITY'S NEXT EVOLUTION",
    accent: '#6fa8ff',
    emblem: 'head',
    blurb: 'Where physics ends and awareness begins. A journey across the bridge between quantum reality and the conscious mind — and what waits for humanity on the other side.',
    quote: '"The observer was never outside the experiment. The observer IS the experiment."',
    excerpt: 'The bridge did not announce itself. It appeared the way all true thresholds do — quietly, in the space between one thought and the next. Dr. Elias Hart had spent twenty years measuring the universe, and in a single evening the universe began measuring him.',
    excerpt2: 'What he found on the other side was not an equation. It was a mirror — and it was awake.',
    chapters: ['The Observer Effect', 'The Space Between Thoughts', 'Crossing', 'The Mirror That Measures Back', "Humanity's Next Evolution"]
  },
  {
    id: 'force',
    title: 'Consciousness: The Fundamental Force',
    lines: ['CONSCIOUSNESS', 'THE FUNDAMENTAL', 'FORCE'],
    tag: 'THE TRUE NATURE OF REALITY',
    accent: '#f4d488',
    emblem: 'figure',
    blurb: 'Gravity bends space. Light defines time. But one force writes the laws for all the others. An exploration of consciousness as the true nature of reality and awareness.',
    quote: '"Consciousness is not something we create. It is the force that creates everything."',
    excerpt: 'Before there was light, there was the noticing of light. Science calls it emergence. The mystics called it breath. This book calls it what it has always been — the fundamental force.',
    excerpt2: 'Gravity holds the planets. Consciousness holds gravity.',
    chapters: ['The Missing Constant', 'Breath Before Light', 'The Laws That Watch', 'Everything, Aware', 'The Force That Creates']
  },
  {
    id: 'july',
    title: 'Fourth of July: A Rebirth of the World',
    lines: ['FOURTH', 'OF JULY:', 'A REBIRTH OF', 'THE WORLD'],
    tag: 'A NOVEL OF AWAKENING & FREEDOM',
    accent: '#ff8d6b',
    emblem: 'flag',
    blurb: 'A novel about awakening, freedom, and a new beginning — the day the world remembered what it was meant to become.',
    quote: '"Freedom was never given. It was remembered."',
    excerpt: 'The fireworks that year did not end. They hung in the sky like questions, and the whole town stood beneath them, remembering — all at once — what they had agreed to forget.',
    excerpt2: 'Freedom, it turned out, was not a document. It was a decision, renewed each morning like the sun.',
    chapters: ['The Longest Night', 'Sparks', 'The Town That Remembered', 'A New Declaration', 'Rebirth of the World']
  },
  {
    id: 'egg',
    title: 'The Golden Egg',
    lines: ['The', 'Golden', 'Egg'],
    tag: 'A CHRONICLE OF CONSCIOUSNESS & CREATION',
    accent: '#f4d488',
    emblem: 'egg',
    blurb: 'A chronicle of consciousness and creation. Inside every ending sleeps a beginning — and inside this one, something is about to hatch.',
    quote: '"Everything that ever mattered began inside a shell it had to break."',
    excerpt: 'In the beginning there was a shell, and the shell was patient. It held its light the way a promise holds its word — completely, and in the dark.',
    excerpt2: 'Everything that ever mattered began inside something it had to break.',
    chapters: ['The Shell', 'The Listening Dark', 'First Crack', 'Golden', 'What Hatches']
  }
];

function drawEmblem(ctx, W, H, book) {
  const cx = W / 2, cy = H * 0.56, r = W * 0.26;
  ctx.save();

  // aura
  const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 2.1);
  aura.addColorStop(0, hexA(book.accent, 0.55));
  aura.addColorStop(0.5, hexA(book.accent, 0.14));
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = hexA(book.accent, 0.9);
  ctx.lineWidth = 2.4;
  ctx.shadowColor = book.accent;
  ctx.shadowBlur = 22;

  if (book.emblem === 'egg') {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.62, r * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.4, r * 0.58, 0, 0, Math.PI * 2);
    ctx.strokeStyle = hexA(book.accent, 0.4);
    ctx.stroke();
  } else if (book.emblem === 'head') {
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.15, r * 0.5, r * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
    // circuit lines
    ctx.strokeStyle = hexA(book.accent, 0.5);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r * 0.55, cy - r * 0.15 + Math.sin(a) * r * 0.68);
      ctx.lineTo(cx + Math.cos(a) * r * 1.05, cy - r * 0.15 + Math.sin(a) * r * 1.18);
      ctx.stroke();
    }
  } else if (book.emblem === 'figure') {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2); // halo ring
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.5, r * 0.16, 0, Math.PI * 2); ctx.stroke(); // head
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.32); ctx.lineTo(cx, cy + r * 0.3); // body
    ctx.moveTo(cx - r * 0.35, cy - r * 0.05); ctx.lineTo(cx + r * 0.35, cy - r * 0.05); // arms
    ctx.moveTo(cx, cy + r * 0.3); ctx.lineTo(cx - r * 0.22, cy + r * 0.75);
    ctx.moveTo(cx, cy + r * 0.3); ctx.lineTo(cx + r * 0.22, cy + r * 0.75);
    ctx.stroke();
  } else if (book.emblem === 'flag') {
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = cy - r * 0.55 + i * (r * 0.24);
      ctx.strokeStyle = i % 2 ? hexA('#ffffff', 0.55) : hexA(book.accent, 0.85);
      ctx.beginPath();
      for (let x = 0; x <= r * 1.5; x += 6) {
        const wy = y + Math.sin(x * 0.045 + i) * 5;
        x === 0 ? ctx.moveTo(cx - r * 0.75 + x, wy) : ctx.lineTo(cx - r * 0.75 + x, wy);
      }
      ctx.stroke();
    }
    // skyline glow
    ctx.fillStyle = hexA(book.accent, 0.5);
    for (let i = 0; i < 9; i++) {
      const bw = 8 + (i * 37) % 16;
      const bh = 14 + (i * 53) % 34;
      ctx.fillRect(cx - r + i * (r * 0.24), cy + r * 0.8 - bh, bw, bh);
    }
  }
  ctx.restore();
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function paintCover(book, W = 512, H = 736) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // field
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0c14');
  bg.addColorStop(0.55, '#05060c');
  bg.addColorStop(1, '#0a0910');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // starfield
  for (let i = 0; i < 130; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
    ctx.fillRect(x, y, Math.random() < 0.12 ? 2 : 1, 1);
  }

  drawEmblem(ctx, W, H, book);

  // frame
  ctx.strokeStyle = 'rgba(212,175,95,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4d488';
  ctx.shadowColor = 'rgba(244,212,136,0.6)';
  ctx.shadowBlur = 16;
  const serif = book.id === 'egg';
  const size = serif ? 64 : 40;
  ctx.font = `${serif ? 'italic 500' : '600'} ${size}px ${serif ? 'Georgia, serif' : 'Georgia, serif'}`;
  book.lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, 96 + i * (size * 1.08), W - 70);
  });

  // tagline
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(230,225,210,0.8)';
  ctx.font = '400 17px Arial';
  ctx.fillText(book.tag, W / 2, H - 108, W - 80);

  // author
  ctx.fillStyle = '#d4af5f';
  ctx.font = '600 24px Arial';
  ctx.fillText('R A N D Y   F I S H', W / 2, H - 52);

  return c;
}

export function paintSpine(book, W = 96, H = 736) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, W, 0);
  bg.addColorStop(0, '#07070d');
  bg.addColorStop(0.5, '#12101a');
  bg.addColorStop(1, '#07070d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d4af5f';
  ctx.font = '600 26px Georgia, serif';
  ctx.fillText(book.title.toUpperCase().slice(0, 34), 0, 10, H - 60);
  ctx.restore();
  return c;
}
