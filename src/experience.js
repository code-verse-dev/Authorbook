// ══════════════════════════════════════════════════════════
// THE CONSCIOUSNESS EXPERIENCE — Three.js world
// One camera, one endless dolly through eight scene-worlds:
// stars → genesis → randy → books → galaxy library → DNA →
// consciousness network → the golden egg.
// ══════════════════════════════════════════════════════════
import * as THREE from 'three';
import { BOOKS, paintCover, paintSpine } from './covers.js';

const SCENE_SPACING = 120;
export const SCENES = ['arrival', 'genesis', 'randy', 'books', 'library', 'dna', 'network', 'egg'];
const SCENE_Z = Object.fromEntries(SCENES.map((s, i) => [s, -i * SCENE_SPACING]));

const GOLD = new THREE.Color('#d4af5f');
const GOLD_BRIGHT = new THREE.Color('#f4d488');

// ── soft round sprite texture, shared by every particle system ──
function makeDotTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function makeGlowTexture(color = '#d4af5f') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 4, 128, 128, 126);
  g.addColorStop(0, color);
  g.addColorStop(0.4, color.replace(')', '') + '');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  // canvas gradients need rgba strings — rebuild properly:
  const col = new THREE.Color(color);
  const rgba = (a) => `rgba(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0},${a})`;
  const g2 = ctx.createRadialGradient(128, 128, 4, 128, 128, 126);
  g2.addColorStop(0, rgba(0.9));
  g2.addColorStop(0.35, rgba(0.35));
  g2.addColorStop(1, rgba(0));
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// ── sample a human silhouette (head + shoulders) into 3D points ──
function samplePortraitPoints(count = 4200) {
  const W = 220, H = 300;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  // head
  ctx.beginPath();
  ctx.ellipse(W / 2, 92, 46, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  // neck
  ctx.fillRect(W / 2 - 17, 140, 34, 34);
  // shoulders / torso
  ctx.beginPath();
  ctx.moveTo(W / 2 - 96, H);
  ctx.quadraticCurveTo(W / 2 - 92, 182, W / 2 - 30, 168);
  ctx.lineTo(W / 2 + 30, 168);
  ctx.quadraticCurveTo(W / 2 + 92, 182, W / 2 + 96, H);
  ctx.closePath();
  ctx.fill();

  const img = ctx.getImageData(0, 0, W, H).data;
  const pts = [];
  let guard = 0;
  while (pts.length / 3 < count && guard++ < count * 60) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = img[((y | 0) * W + (x | 0)) * 4 + 3];
    if (a > 128) {
      // map canvas → world (portrait ~16 units tall), slight z-depth shell
      const px = (x - W / 2) * 0.075;
      const py = (H * 0.62 - y) * 0.075;
      const pz = (Math.random() - 0.5) * 1.6 * (1 - Math.abs(px) / 9);
      pts.push(px, py, pz);
    }
  }
  return new Float32Array(pts);
}

// ── crack pattern for the golden egg (unique per visitor) ──
function makeCrackCanvas() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 512, 512);
  return { canvas: c, ctx, cracks: [] };
}

export class Experience {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = opts; // { onBook(book), onEggClick(), onBeat() }
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerPx = new THREE.Vector2(-100, -100);
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.journeyP = 0;
    this.crackProgress = 0;
    this.hatched = false;
    this.hoverBook = null;

    this._initRenderer();
    this._initScene();
    this._buildStars();
    this._buildGenesis();
    this._buildRandy();
    this._buildBooks();
    this._buildLibrary();
    this._buildDNA();
    this._buildNetwork();
    this._buildEgg();
    this._events();

    this.renderer.setAnimationLoop(() => this._tick());
  }

  // ═════════ setup ═════════
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030304');
    this.scene.fog = new THREE.Fog('#030304', 55, 235);

    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(0, 0, 14);
    this.camRig = new THREE.Group();
    this.camRig.add(this.camera);
    this.scene.add(this.camRig);

    this.scene.add(new THREE.AmbientLight('#8d8a80', 0.9));
    const key = new THREE.DirectionalLight('#f4e2b0', 2.2);
    key.position.set(6, 10, 8);
    this.camRig.add(key);
    const fill = new THREE.DirectionalLight('#7f96d4', 0.5);
    fill.position.set(-8, -4, 6);
    this.camRig.add(fill);

    this.dotTex = makeDotTexture();
    this.glowGold = makeGlowTexture('#d4af5f');
    this.glowBlue = makeGlowTexture('#5f7fd4');
  }

  // ═════════ stars (follow the camera forever) ═════════
  _buildStars() {
    const mk = (count, rMin, rMax, size, color, opacity) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin);
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        size, color, map: this.dotTex, transparent: true, opacity,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
      });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      return pts;
    };
    this.starsFar = mk(5200, 160, 700, 1.6, '#cdd6ff', 0.9);
    this.starsGold = mk(900, 120, 500, 2.2, '#f4d488', 0.6);
    this.starsNear = mk(500, 30, 130, 1.1, '#ffffff', 0.8);
    this.starsGroup = new THREE.Group();
    this.starsGroup.add(this.starsFar, this.starsGold, this.starsNear);
    this.starsGroup.visible = false; // revealed at arrival
    this.camRig.add(this.starsGroup); // stars travel with us — infinite space
  }

  // ═════════ scene 2 — genesis: the visitor creates the universe ═════════
  _buildGenesis() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.genesis;
    this.scene.add(g);
    this.genesis = g;

    // the golden seed that follows the cursor
    const seed = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    seed.scale.setScalar(4);
    g.add(seed);
    this.seed = seed;

    // creation pool — particles born at the cursor.
    // Lives in WORLD space on the scene root so books/egg can borrow it too.
    const N = 3800;
    this.genN = N;
    this.genPos = new Float32Array(N * 3).fill(99999);
    this.genVel = new Float32Array(N * 3);
    this.genLife = new Float32Array(N); // 0 = dead
    this.genCol = new Float32Array(N * 3);
    this.genCursor = 0;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.genPos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.genCol, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.5, map: this.dotTex, vertexColors: true, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    this.scene.add(pts);
    this.genPts = pts;

    // nebula backdrops
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: i % 2 ? this.glowBlue : this.glowGold, transparent: true, opacity: 0.16,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
      s.position.set((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 50, -20 - Math.random() * 40);
      s.scale.setScalar(40 + Math.random() * 50);
      g.add(s);
    }
  }

  _spawnGenesis(origin, amount = 14) {
    const palette = [GOLD_BRIGHT, GOLD, new THREE.Color('#8fb4ff'), new THREE.Color('#b98fff')];
    for (let n = 0; n < amount; n++) {
      const i = this.genCursor = (this.genCursor + 1) % this.genN;
      this.genPos[i * 3] = origin.x;
      this.genPos[i * 3 + 1] = origin.y;
      this.genPos[i * 3 + 2] = origin.z;
      const sp = 2.5 + Math.random() * 7;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      this.genVel[i * 3] = sp * Math.sin(ph) * Math.cos(th);
      this.genVel[i * 3 + 1] = sp * Math.sin(ph) * Math.sin(th);
      this.genVel[i * 3 + 2] = sp * Math.cos(ph) * 0.4;
      this.genLife[i] = 1;
      const c = palette[(Math.random() * palette.length) | 0];
      this.genCol[i * 3] = c.r; this.genCol[i * 3 + 1] = c.g; this.genCol[i * 3 + 2] = c.b;
    }
  }

  // ═════════ scene 3 — randy materializes from particles ═════════
  _buildRandy() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.randy;
    this.scene.add(g);
    this.randy = g;

    const target = samplePortraitPoints(4200);
    const N = target.length / 3;
    const scatter = new Float32Array(N * 3);
    const rand = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = 30 + Math.random() * 60;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      scatter[i * 3] = r * Math.sin(ph) * Math.cos(th);
      scatter[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      scatter[i * 3 + 2] = r * Math.cos(ph);
      rand[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(target, 3));
    geo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

    this.randyMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uTex: { value: this.dotTex }
      },
      vertexShader: /* glsl */`
        attribute vec3 aScatter;
        attribute float aRand;
        uniform float uProgress;
        uniform float uTime;
        varying float vRand;
        varying float vP;
        void main() {
          vRand = aRand;
          // staggered easing — every particle arrives at its own moment
          float p = clamp(uProgress * 1.6 - aRand * 0.6, 0.0, 1.0);
          p = p * p * (3.0 - 2.0 * p);
          vP = p;
          vec3 pos = mix(aScatter, position, p);
          // breathing + hair/cloth drift once formed
          float breathe = sin(uTime * 1.4) * 0.06 * p;
          pos.y += breathe * (0.4 + position.y * 0.05);
          pos.x += sin(uTime * 0.8 + position.y * 1.7 + aRand * 6.28) * 0.05 * p;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (0.9 + aRand * 1.4) * (72.0 / -mv.z) * (0.35 + 0.65 * p);
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D uTex;
        varying float vRand;
        varying float vP;
        void main() {
          float a = texture2D(uTex, gl_PointCoord).a;
          vec3 gold = vec3(0.956, 0.831, 0.533);
          vec3 blue = vec3(0.42, 0.55, 0.95);
          vec3 col = mix(blue, gold, smoothstep(0.2, 0.9, vP + vRand * 0.2));
          gl_FragColor = vec4(col, a * (0.25 + 0.75 * vP));
        }`
    });
    const pts = new THREE.Points(geo, this.randyMat);
    pts.frustumCulled = false;
    g.add(pts);

    // eyes — two lights that open when he forms
    this.eyes = [];
    [-1.35, 1.35].forEach((x) => {
      const eye = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowGold, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
      eye.position.set(x, 4.9, 1.2);
      eye.scale.setScalar(0.001);
      g.add(eye);
      this.eyes.push(eye);
    });

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, opacity: 0.18,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    halo.position.set(0, 2, -6);
    halo.scale.setScalar(34);
    g.add(halo);
  }

  // ═════════ scene 5 — living books ═════════
  _buildBooks() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.books;
    this.scene.add(g);
    this.booksGroup = g;
    this.bookMeshes = [];

    BOOKS.forEach((book, i) => {
      const cover = new THREE.CanvasTexture(paintCover(book));
      const spine = new THREE.CanvasTexture(paintSpine(book));
      cover.colorSpace = THREE.SRGBColorSpace;
      spine.colorSpace = THREE.SRGBColorSpace;
      const pageMat = new THREE.MeshStandardMaterial({ color: '#e8e0cc', roughness: 0.9 });
      const backMat = new THREE.MeshStandardMaterial({ color: '#0a0a12', roughness: 0.6 });
      const coverMat = new THREE.MeshStandardMaterial({
        map: cover, roughness: 0.45, metalness: 0.15,
        emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3, emissiveMap: cover
      });
      const spineMat = new THREE.MeshStandardMaterial({ map: spine, roughness: 0.5 });
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 6.4, 0.55),
        [pageMat, spineMat, pageMat, pageMat, coverMat, backMat]
      );
      const holder = new THREE.Group();
      holder.position.set((i - 1.5) * 7.4, 0, 0);
      holder.add(mesh);
      holder.userData.book = book;
      holder.userData.baseY = 0;
      holder.userData.i = i;

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowGold, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
      glow.scale.setScalar(11);
      glow.position.z = -1.4;
      holder.add(glow);
      holder.userData.glow = glow;

      g.add(holder);
      this.bookMeshes.push(mesh);
    });

    const pedestalGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, opacity: 0.14,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    pedestalGlow.position.set(0, -6, -4);
    pedestalGlow.scale.set(46, 12, 1);
    g.add(pedestalGlow);
  }

  // ═════════ scene 6 — the galaxy library ═════════
  _buildLibrary() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.library;
    this.scene.add(g);
    this.library = g;
    this.planets = [];

    // spiral of planet-books
    const arms = 3, perArm = 14;
    for (let a = 0; a < arms; a++) {
      for (let i = 0; i < perArm; i++) {
        const t = i / perArm;
        const angle = a * ((Math.PI * 2) / arms) + t * 3.4;
        const rad = 4 + t * 22;
        // gold and deep-blue worlds only — keep the palette of the design
        const hue = Math.random() < 0.6 ? 0.1 + Math.random() * 0.04 : 0.58 + Math.random() * 0.06;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.22 + Math.random() * 0.34, 16, 16),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(hue, 0.85, 0.5),
            emissive: new THREE.Color().setHSL(hue, 0.95, 0.42),
            emissiveIntensity: 1.1, roughness: 0.4
          })
        );
        mesh.position.set(Math.cos(angle) * rad, (Math.random() - 0.5) * 2.2, Math.sin(angle) * rad * 0.55 - 4);
        mesh.userData.book = BOOKS[(a * perArm + i) % BOOKS.length];
        mesh.userData.orbit = { angle, rad, speed: 0.01 + (1 - t) * 0.025, y: mesh.position.y };
        g.add(mesh);
        this.planets.push(mesh);
      }
    }
    // galactic core
    const core = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, opacity: 0.65,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    core.position.set(0, 0, -4);
    core.scale.setScalar(16);
    g.add(core);
    this.libraryCore = core;

    const dust = new THREE.Points(
      (() => {
        const N = 2200, pos = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          const t = Math.random();
          const angle = Math.random() * Math.PI * 2 + t * 3.4;
          const rad = 3 + t * 24 + (Math.random() - 0.5) * 3;
          pos[i * 3] = Math.cos(angle) * rad;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
          pos[i * 3 + 2] = Math.sin(angle) * rad * 0.55 - 4;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
      })(),
      new THREE.PointsMaterial({
        size: 0.7, color: '#e8cf9a', map: this.dotTex, transparent: true, opacity: 0.5,
        depthWrite: false, blending: THREE.AdditiveBlending
      })
    );
    g.add(dust);
    this.libraryDust = dust;
  }

  // ═════════ scene 7 — DNA timeline ═════════
  _buildDNA() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.dna;
    this.scene.add(g);
    this.dna = g;

    const N = 900, height = 34, turns = 5.5, radius = 4.2;
    const mkStrand = (phase, color) => {
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const t = i / N;
        const a = t * Math.PI * 2 * turns + phase;
        pos[i * 3] = Math.cos(a) * radius;
        pos[i * 3 + 1] = (t - 0.5) * height;
        pos[i * 3 + 2] = Math.sin(a) * radius;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.45, color, map: this.dotTex, transparent: true, opacity: 0.85,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
    };
    g.add(mkStrand(0, '#f4d488'));
    g.add(mkStrand(Math.PI, '#7fa0e8'));

    // rungs
    const rungs = 46;
    const rungPos = new Float32Array(rungs * 2 * 3);
    for (let i = 0; i < rungs; i++) {
      const t = i / rungs;
      const a = t * Math.PI * 2 * turns;
      rungPos[i * 6] = Math.cos(a) * radius;
      rungPos[i * 6 + 1] = (t - 0.5) * height;
      rungPos[i * 6 + 2] = Math.sin(a) * radius;
      rungPos[i * 6 + 3] = Math.cos(a + Math.PI) * radius;
      rungPos[i * 6 + 4] = (t - 0.5) * height;
      rungPos[i * 6 + 5] = Math.sin(a + Math.PI) * radius;
    }
    const rungGeo = new THREE.BufferGeometry();
    rungGeo.setAttribute('position', new THREE.BufferAttribute(rungPos, 3));
    g.add(new THREE.LineSegments(rungGeo, new THREE.LineBasicMaterial({
      color: '#8a7340', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending
    })));

    // six era-markers along the helix
    this.dnaMarkers = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowGold, transparent: true, opacity: 0.0,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
      const t = 0.08 + (i / 5) * 0.84;
      const a = t * Math.PI * 2 * turns;
      m.position.set(Math.cos(a) * radius, (t - 0.5) * height, Math.sin(a) * radius);
      m.scale.setScalar(3.5);
      g.add(m);
      this.dnaMarkers.push(m);
    }
  }

  // ═════════ scene 9 — consciousness network (earth) ═════════
  _buildNetwork() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.network;
    this.scene.add(g);
    this.network = g;

    const R = 9;
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(R, 48, 48),
      new THREE.MeshStandardMaterial({ color: '#060a16', roughness: 0.85, metalness: 0.1 })
    );
    g.add(globe);
    g.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 24, 24),
      new THREE.MeshBasicMaterial({ color: '#1c2c55', wireframe: true, transparent: true, opacity: 0.16 })
    ));

    // minds — light dots clustered like population
    const N = 2400;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const cAlt = new THREE.Color('#7fb2ff');
    for (let i = 0; i < N; i++) {
      // clustered sampling: pick a cluster center then scatter around it
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const jitter = 0.06 + Math.random() * 0.12;
      const th2 = th + (Math.random() - 0.5) * jitter * 6;
      const ph2 = ph + (Math.random() - 0.5) * jitter * 3;
      const r = R * 1.01;
      pos[i * 3] = r * Math.sin(ph2) * Math.cos(th2);
      pos[i * 3 + 1] = r * Math.cos(ph2);
      pos[i * 3 + 2] = r * Math.sin(ph2) * Math.sin(th2);
      const c = Math.random() < 0.72 ? GOLD_BRIGHT : cAlt;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const minds = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.65, vertexColors: true, map: this.dotTex, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    g.add(minds);

    // connection arcs + travelling pulses
    this.pulses = [];
    const arcMat = new THREE.LineBasicMaterial({
      color: '#d4af5f', transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending
    });
    for (let i = 0; i < 16; i++) {
      const p1 = randomOnSphere(R * 1.01);
      const p2 = randomOnSphere(R * 1.01);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.3 + Math.random() * 0.6));
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
      g.add(new THREE.Line(lineGeo, arcMat));
      const pulse = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowGold, transparent: true, opacity: 0.95,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
      pulse.scale.setScalar(1.1);
      g.add(pulse);
      this.pulses.push({ sprite: pulse, curve, t: Math.random(), speed: 0.12 + Math.random() * 0.25 });
    }

    // "YOU" — the visitor's own node
    const you = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, opacity: 1,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    you.position.copy(randomOnSphere(R * 1.03));
    you.scale.setScalar(2.4);
    g.add(you);
    this.youNode = you;

    const atmo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowBlue, transparent: true, opacity: 0.4,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    atmo.scale.setScalar(R * 3.4);
    g.add(atmo);
  }

  // ═════════ scene 11 — the golden egg ═════════
  _buildEgg() {
    const g = new THREE.Group();
    g.position.z = SCENE_Z.egg;
    this.scene.add(g);
    this.eggGroup = g;

    // egg profile via lathe — circular arc, slightly tapered toward the top
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const u = (t - 0.5) * 2; // -1 … 1 bottom→top
      const y = u * 4.6;
      const r = 3.3 * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.18 * u);
      pts.push(new THREE.Vector2(Math.max(r, 0.001), y));
    }
    this.crack = makeCrackCanvas();
    this.crackTex = new THREE.CanvasTexture(this.crack.canvas);

    this.eggMat = new THREE.MeshStandardMaterial({
      color: '#d4af5f', metalness: 0.55, roughness: 0.32,
      emissive: new THREE.Color('#ffb830'),
      emissiveMap: this.crackTex, emissiveIntensity: 0.0
    });
    const egg = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), this.eggMat);
    g.add(egg);
    this.egg = egg;

    // warm key light so the shell always reads as gold
    const eggKey = new THREE.PointLight('#ffdf9a', 220, 80);
    eggKey.position.set(8, 9, 14);
    g.add(eggKey);
    const eggRim = new THREE.PointLight('#7f96d4', 90, 60);
    eggRim.position.set(-10, -4, -8);
    g.add(eggRim);

    // inner light — the life inside
    this.eggLight = new THREE.PointLight('#ffcf6a', 0, 40);
    this.eggLight.position.set(0, 0, 4);
    g.add(this.eggLight);

    const under = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, opacity: 0.25,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    under.position.y = -6.4;
    under.scale.set(18, 6, 1);
    g.add(under);

    this.eggHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowGold, transparent: true, opacity: 0.3,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    this.eggHalo.scale.setScalar(22);
    this.eggHalo.position.z = -3;
    g.add(this.eggHalo);

    // burst particles for the hatch
    const N = 1600;
    this.burstPos = new Float32Array(N * 3);
    this.burstVel = new Float32Array(N * 3);
    this.burstN = N;
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(this.burstPos, 3));
    this.burstPts = new THREE.Points(bg, new THREE.PointsMaterial({
      size: 1.8, color: '#ffe9b0', map: this.dotTex, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    this.burstPts.frustumCulled = false;
    g.add(this.burstPts);
  }

  // grow the visitor-unique crack pattern; p ∈ [0,1]
  setCrackProgress(p) {
    if (this.hatched) return;
    const prev = this.crackProgress;
    this.crackProgress = p;
    const { ctx, cracks } = this.crack;
    const want = Math.floor(p * 46);
    while (cracks.length < want) {
      // each crack: a jagged polyline wandering from a random start
      let x = Math.random() * 512, y = Math.random() * 512;
      let a = Math.random() * Math.PI * 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 1 + Math.random() * 1.6;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const segs = 5 + (Math.random() * 9 | 0);
      for (let s = 0; s < segs; s++) {
        a += (Math.random() - 0.5) * 1.5;
        const len = 8 + Math.random() * 26;
        x += Math.cos(a) * len;
        y += Math.sin(a) * len;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      cracks.push(1);
    }
    if (want !== Math.floor(prev * 46)) this.crackTex.needsUpdate = true;
    this.eggMat.emissiveIntensity = 0.15 + p * 2.6;
    this.eggLight.intensity = p * 60;
  }

  hatch(onFlashPeak) {
    if (this.hatched) return;
    this.hatched = true;
    // arm the burst
    for (let i = 0; i < this.burstN; i++) {
      this.burstPos[i * 3] = 0;
      this.burstPos[i * 3 + 1] = 0;
      this.burstPos[i * 3 + 2] = 0;
      const sp = 6 + Math.random() * 26;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      this.burstVel[i * 3] = sp * Math.sin(ph) * Math.cos(th);
      this.burstVel[i * 3 + 1] = sp * Math.sin(ph) * Math.sin(th);
      this.burstVel[i * 3 + 2] = sp * Math.cos(ph);
    }
    this.burstPts.material.opacity = 1;
    this.burstActive = true;
    this.eggMat.emissiveIntensity = 6;
    this.eggLight.intensity = 400;
    setTimeout(() => { this.egg.visible = false; }, 550);
    if (onFlashPeak) setTimeout(onFlashPeak, 600);
  }

  // ═════════ input ═════════
  _events() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener('pointermove', (e) => {
      this.pointerPx.set(e.clientX, e.clientY);
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    });
    window.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, .chat, .bookview, .site')) return;
      this._raycastClick();
    });
  }

  _pointerWorldAt(z) {
    // where the cursor ray crosses the plane at world-z
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const t = (z - this.raycaster.ray.origin.z) / this.raycaster.ray.direction.z;
    return this.raycaster.ray.origin.clone().add(this.raycaster.ray.direction.clone().multiplyScalar(t));
  }

  _raycastClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    // books
    const hitB = this.raycaster.intersectObjects(this.bookMeshes, false)[0];
    if (hitB) {
      const holder = hitB.object.parent;
      this.opts.onBook?.(holder.userData.book);
      return;
    }
    // library planets
    const hitP = this.raycaster.intersectObjects(this.planets, false)[0];
    if (hitP) {
      this.opts.onPlanet?.(hitP.object.userData.book, hitP.object);
      return;
    }
    // the egg
    if (!this.hatched && this.egg.visible) {
      const hitE = this.raycaster.intersectObject(this.egg, false)[0];
      if (hitE) this.opts.onEggClick?.();
    }
  }

  // camera pulse on heartbeat (called from main on each audible beat)
  onBeat() {
    this.beatPulse = 1;
  }

  setJourneyProgress(p) {
    this.journeyP = p;
  }

  revealStars() { this.starsGroup.visible = true; }

  sceneActivity(name) {
    // 1 when the camera sits at the scene, fading over ±88 units
    const camZ = this.camRig.position.z;
    return THREE.MathUtils.clamp(1 - Math.abs(camZ - SCENE_Z[name]) / 88, 0, 1);
  }

  // ═════════ frame loop ═════════
  _tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // ── camera dolly along the journey (slow, weighted glide) ──
    const targetZ = 14 - this.journeyP * (SCENE_SPACING * (SCENES.length - 1) + 4);
    this.camRig.position.z += (targetZ - this.camRig.position.z) * Math.min(1, dt * 2);

    // parallax look — the cursor bends the view
    this.camera.position.x += (this.pointer.x * 2.2 - this.camera.position.x) * dt * 2.4;
    this.camera.position.y += (this.pointer.y * 1.4 - this.camera.position.y) * dt * 2.4;
    this.camera.lookAt(this.camRig.position.x, this.camRig.position.y, this.camRig.position.z - 30);

    // heartbeat pulse → tiny push-in + star glow
    if (this.beatPulse > 0) {
      this.beatPulse = Math.max(0, this.beatPulse - dt * 3);
      const k = Math.sin(this.beatPulse * Math.PI);
      this.camera.fov = 58 - k * 1.2;
      this.camera.updateProjectionMatrix();
      this.starsGold.material.opacity = 0.6 + k * 0.3;
    }

    // stars drift
    this.starsFar.rotation.y += dt * 0.004;
    this.starsGold.rotation.y -= dt * 0.006;
    this.starsNear.rotation.z += dt * 0.002;

    this._tickGenesis(dt, t);
    this._tickRandy(dt, t);
    this._tickBooks(dt, t);
    this._tickLibrary(dt, t);
    this._tickDNA(dt, t);
    this._tickNetwork(dt, t);
    this._tickEgg(dt, t);

    this.renderer.render(this.scene, this.camera);
  }

  _tickGenesis(dt, t) {
    const act = this.sceneActivity('genesis');
    this.genesis.visible = act > 0.01;

    if (this.genesis.visible) {
      // seed follows the cursor on the genesis plane
      const target = this._pointerWorldAt(SCENE_Z.genesis + 6);
      this.seed.position.lerp(new THREE.Vector3(target.x, target.y, 6), Math.min(1, dt * 6));
      this.seed.material.opacity = act;
      this.seed.scale.setScalar(3.4 + Math.sin(t * 3) * 0.7);

      // moving the cursor creates matter
      if (act > 0.35) {
        const moved = this.pointerPx.distanceTo(this._lastPx || this.pointerPx);
        this._lastPx = this.pointerPx.clone();
        const amount = THREE.MathUtils.clamp(moved * 0.35, 2, 26) | 0;
        const world = this.seed.position.clone();
        world.z += SCENE_Z.genesis;
        this._spawnGenesis(world, amount);
      }
    }

    // integrate pool (always — books & egg borrow it for sparkles)
    for (let i = 0; i < this.genN; i++) {
      if (this.genLife[i] <= 0) continue;
      this.genLife[i] -= dt * 0.35;
      this.genPos[i * 3] += this.genVel[i * 3] * dt;
      this.genPos[i * 3 + 1] += this.genVel[i * 3 + 1] * dt;
      this.genPos[i * 3 + 2] += this.genVel[i * 3 + 2] * dt;
      // slow into orbit — newborn galaxies settle
      this.genVel[i * 3] *= (1 - dt * 0.5);
      this.genVel[i * 3 + 1] *= (1 - dt * 0.5);
      this.genVel[i * 3 + 2] *= (1 - dt * 0.5);
      if (this.genLife[i] <= 0) {
        this.genPos[i * 3] = 99999; // park dead particles far away
      }
    }
    this.genPts.geometry.attributes.position.needsUpdate = true;
  }

  _tickRandy(dt, t) {
    const act = this.sceneActivity('randy');
    this.randy.visible = act > 0.01;
    if (!this.randy.visible) return;
    this.randyMat.uniforms.uTime.value = t;
    this.randyMat.uniforms.uProgress.value = act;
    // eyes open at the very end of formation
    const eyeK = THREE.MathUtils.clamp((act - 0.85) / 0.15, 0, 1);
    this.eyes.forEach((e) => {
      e.material.opacity = eyeK;
      e.scale.setScalar(0.9 * eyeK + 0.001);
      // eye tracking — he watches your cursor
      e.position.x += this.pointer.x * 0.003;
    });
    // he faces the visitor slightly
    this.randy.rotation.y = this.pointer.x * 0.14;
    this.randy.rotation.x = -this.pointer.y * 0.06;
  }

  _tickBooks(dt, t) {
    const act = this.sceneActivity('books');
    this.booksGroup.visible = act > 0.01;
    if (!this.booksGroup.visible) return;

    // hover detection
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.bookMeshes, false)[0];
    const hovered = hit ? hit.object.parent : null;
    if (hovered !== this.hoverBook) {
      this.hoverBook = hovered;
      this.opts.onHoverChange?.(!!hovered);
    }

    this.booksGroup.children.forEach((holder) => {
      if (!holder.userData.book) return;
      const i = holder.userData.i;
      const isHover = holder === this.hoverBook;
      const targetY = (isHover ? 1.6 : 0) + Math.sin(t * 1.1 + i * 1.7) * 0.35;
      holder.position.y += (targetY - holder.position.y) * dt * 6;
      const mesh = holder.children[0];
      const targetRotY = isHover ? Math.sin(t * 0.9) * 0.35 : Math.sin(t * 0.4 + i) * 0.12;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * dt * 4;
      mesh.rotation.x = Math.sin(t * 0.5 + i * 2) * 0.04;
      const glowTarget = isHover ? 0.75 : 0.12;
      holder.userData.glow.material.opacity += (glowTarget - holder.userData.glow.material.opacity) * dt * 6;
      const cover = mesh.material[4];
      cover.emissiveIntensity += ((isHover ? 0.85 : 0.3) - cover.emissiveIntensity) * dt * 6;
      // hovered books shed golden particles
      if (isHover && Math.random() < 0.5) this._spawnBookSparkle(holder);
    });
  }

  _spawnBookSparkle(holder) {
    // reuse the world-space pool: sparkles rise off the hovered book
    const world = holder.getWorldPosition(new THREE.Vector3());
    world.x += (Math.random() - 0.5) * 4.2;
    world.y += (Math.random() - 0.5) * 6;
    this._spawnGenesis(world, 2);
  }

  _tickLibrary(dt, t) {
    const act = this.sceneActivity('library');
    this.library.visible = act > 0.01;
    if (!this.library.visible) return;
    this.libraryDust.rotation.y += dt * 0.05;
    this.planets.forEach((p) => {
      const o = p.userData.orbit;
      o.angle += dt * o.speed;
      p.position.x = Math.cos(o.angle) * o.rad;
      p.position.z = Math.sin(o.angle) * o.rad * 0.55 - 4;
      p.position.y = o.y + Math.sin(t * 0.8 + o.rad) * 0.3;
    });
    this.libraryCore.material.opacity = 0.5 + Math.sin(t * 1.6) * 0.15;
  }

  _tickDNA(dt, t) {
    const act = this.sceneActivity('dna');
    this.dna.visible = act > 0.01;
    if (!this.dna.visible) return;
    this.dna.rotation.y += dt * 0.13;
    // era markers glow in sequence as the scene plays
    this.dnaMarkers.forEach((m, i) => {
      const phase = THREE.MathUtils.clamp(act * 7 - i, 0, 1);
      m.material.opacity = phase * (0.55 + Math.sin(t * 2.4 + i) * 0.25);
    });
  }

  _tickNetwork(dt, t) {
    const act = this.sceneActivity('network');
    this.network.visible = act > 0.01;
    if (!this.network.visible) return;
    this.network.rotation.y += dt * 0.045;
    this.pulses.forEach((p) => {
      p.t = (p.t + dt * p.speed) % 1;
      p.curve.getPoint(p.t, p.sprite.position);
      p.sprite.material.opacity = Math.sin(p.t * Math.PI);
    });
    this.youNode.scale.setScalar(2 + Math.sin(t * 4) * 0.5);
  }

  _tickEgg(dt, t) {
    const act = this.sceneActivity('egg');
    this.eggGroup.visible = act > 0.01;
    if (!this.eggGroup.visible) return;

    if (!this.hatched) {
      // the egg leans toward your cursor and shivers as cracks spread
      this.egg.rotation.y += ((this.pointer.x * 0.5) - this.egg.rotation.y) * dt * 2;
      this.egg.rotation.z += ((-this.pointer.x * 0.15) - this.egg.rotation.z) * dt * 2;
      const shiver = this.crackProgress * 0.06;
      this.egg.position.x = (Math.random() - 0.5) * shiver;
      this.egg.position.y = Math.sin(t * 1.2) * 0.25 + (Math.random() - 0.5) * shiver;
      // heartbeat swell
      const beat = 1 + Math.max(0, Math.sin(t * 5.4)) * 0.018 * (1 + this.crackProgress * 2);
      this.egg.scale.set(beat, 1 / beat * beat * beat, beat); // subtle squash
      this.eggHalo.material.opacity = 0.22 + this.crackProgress * 0.4 + Math.sin(t * 5.4) * 0.05;
    }

    if (this.burstActive) {
      let alive = false;
      for (let i = 0; i < this.burstN; i++) {
        this.burstPos[i * 3] += this.burstVel[i * 3] * dt;
        this.burstPos[i * 3 + 1] += this.burstVel[i * 3 + 1] * dt;
        this.burstPos[i * 3 + 2] += this.burstVel[i * 3 + 2] * dt;
        this.burstVel[i * 3 + 1] -= dt * 2.2; // gold falls like embers
      }
      this.burstPts.geometry.attributes.position.needsUpdate = true;
      this.burstPts.material.opacity = Math.max(0, this.burstPts.material.opacity - dt * 0.18);
      alive = this.burstPts.material.opacity > 0;
      if (!alive) this.burstActive = false;
    }
  }
}

function randomOnSphere(r) {
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    r * Math.sin(ph) * Math.cos(th),
    r * Math.cos(ph),
    r * Math.sin(ph) * Math.sin(th)
  );
}
