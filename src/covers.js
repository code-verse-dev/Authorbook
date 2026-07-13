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

// ── Stylized placeholder art for the photo slots in the final page.
//    Swap the generated <img data-art="…"> sources for real photography
//    whenever assets are available — the layout won't change.
function starField(ctx, W, H, n = 110) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.55})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() < 0.1 ? 2 : 1, 1);
  }
}

function silhouetteBust(ctx, cx, headY, scale, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); // head
  ctx.ellipse(cx, headY, 46 * scale, 58 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 18 * scale, headY + 44 * scale, 36 * scale, 34 * scale); // neck
  ctx.beginPath(); // shoulders
  ctx.moveTo(cx - 118 * scale, headY + 240 * scale);
  ctx.quadraticCurveTo(cx - 112 * scale, headY + 92 * scale, cx - 34 * scale, headY + 72 * scale);
  ctx.lineTo(cx + 34 * scale, headY + 72 * scale);
  ctx.quadraticCurveTo(cx + 112 * scale, headY + 92 * scale, cx + 118 * scale, headY + 240 * scale);
  ctx.closePath();
  ctx.fill();
}

export function paintHeroArt(W = 640, H = 760) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0c16');
  bg.addColorStop(1, '#04040a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  starField(ctx, W, H, 150);

  // glowing globe behind the figure
  const gx = W * 0.62, gy = H * 0.34, gr = W * 0.42;
  const aura = ctx.createRadialGradient(gx, gy, 10, gx, gy, gr * 1.5);
  aura.addColorStop(0, 'rgba(212,175,95,0.4)');
  aura.addColorStop(0.5, 'rgba(95,127,212,0.14)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(212,175,95,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
  // network dots + chords on the globe
  const nodes = [];
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, r = gr * Math.sqrt(Math.random());
    const x = gx + Math.cos(a) * r, y = gy + Math.sin(a) * r;
    nodes.push([x, y]);
    ctx.fillStyle = 'rgba(244,212,136,0.9)';
    ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(212,175,95,0.16)';
  for (let i = 0; i < 20; i++) {
    const [x1, y1] = nodes[(Math.random() * nodes.length) | 0];
    const [x2, y2] = nodes[(Math.random() * nodes.length) | 0];
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }

  // figure with golden rim light
  ctx.save();
  ctx.shadowColor = 'rgba(244,212,136,0.85)';
  ctx.shadowBlur = 26;
  silhouetteBust(ctx, W * 0.46, H * 0.36, 2.1, '#07070d');
  ctx.restore();
  silhouetteBust(ctx, W * 0.46, H * 0.36, 2.06, '#0b0b13');
  return c;
}

export function paintDeskArt(W = 620, H = 700) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0d18');
  bg.addColorStop(1, '#050409');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  starField(ctx, W, H, 120);

  // constellation rings top-left (as in the mock)
  ctx.strokeStyle = 'rgba(127,160,232,0.4)';
  [46, 30, 60].forEach((r, i) => {
    const x = 70 + i * 60, y = 80 + (i % 2) * 46;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(180,200,255,0.9)';
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  });

  // warm desk glow
  const glow = ctx.createRadialGradient(W * 0.42, H * 0.8, 10, W * 0.42, H * 0.8, W * 0.55);
  glow.addColorStop(0, 'rgba(244,212,136,0.35)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // seated writing figure (leaning head, arm to page)
  ctx.save();
  ctx.shadowColor = 'rgba(244,212,136,0.7)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#08080f';
  ctx.beginPath(); // tilted head
  ctx.ellipse(W * 0.52, H * 0.42, 52, 62, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath(); // hunched torso
  ctx.moveTo(W * 0.24, H * 0.98);
  ctx.quadraticCurveTo(W * 0.26, H * 0.55, W * 0.46, H * 0.5);
  ctx.lineTo(W * 0.62, H * 0.52);
  ctx.quadraticCurveTo(W * 0.82, H * 0.6, W * 0.84, H * 0.98);
  ctx.closePath();
  ctx.fill();
  // writing arm
  ctx.beginPath();
  ctx.moveTo(W * 0.66, H * 0.62);
  ctx.quadraticCurveTo(W * 0.78, H * 0.72, W * 0.6, H * 0.84);
  ctx.lineTo(W * 0.52, H * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // open book on desk
  ctx.fillStyle = '#d9d2bd';
  ctx.beginPath();
  ctx.moveTo(W * 0.3, H * 0.88);
  ctx.quadraticCurveTo(W * 0.44, H * 0.83, W * 0.56, H * 0.88);
  ctx.lineTo(W * 0.56, H * 0.94);
  ctx.quadraticCurveTo(W * 0.44, H * 0.9, W * 0.3, H * 0.94);
  ctx.closePath();
  ctx.fill();
  // pen highlight
  ctx.strokeStyle = '#f4d488';
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(W * 0.56, H * 0.8); ctx.lineTo(W * 0.6, H * 0.86); ctx.stroke();

  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
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
