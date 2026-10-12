import * as THREE from 'three';

/* ============================================================
   NEON GENESIS EVANGELION: EVA COMBAT PROTOCOL
   Pilot EVA-00 / 01 / 02 vs Angels in anime ascending order.
   Desktop 3D — Three.js, no external assets (all procedural).
   ============================================================ */

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------------- DATA ---------------- */
const EVAS = [
  { id: 0, name: 'EVA-00', pilot: 'REI AYANAMI', color: 0xE8A200, color2: 0x9AA2AC, dark: 0x2E3138,
    hp: 1000, punch: 52, speed: 22, atMax: 130, atRegen: 16, roarDmg: 70, desc: 'Prototype' },
  { id: 1, name: 'EVA-01', pilot: 'SHINJI IKARI', color: 0x7A30D8, color2: 0x27E427, dark: 0x241040,
    hp: 1150, punch: 62, speed: 24, atMax: 100, atRegen: 13, roarDmg: 110, desc: 'Test Type — BERSERK' },
  { id: 2, name: 'EVA-02', pilot: 'ASUKA L. SORYU', color: 0xD62B1F, color2: 0xFF8A1F, dark: 0x55100C,
    hp: 950, punch: 78, speed: 28, atMax: 80, atRegen: 11, roarDmg: 85, desc: 'Production' },
];

// Angels in ascending anime order (3rd -> 17th). 9 waves.
const ANGELS = [
  { key: 'sachiel', num: '3rd', name: 'SACHIEL', hp: 650, speed: 9, keepDist: 10, size: 1.0,
    color: 0x2a2a33, glow: 0xff2222, attackCd: 2.6, dmg: 55,
    brief: 'Giant of Light. Bone-white mask, twin AMBAC blades. It walks straight at Tokyo-3.',
    abilities: ['AT BLAST — glowing cross explosion (dodge or A.T. Field it)', 'LEAP STOMP — jumps and slams the ground around you'] },
  { key: 'shamshel', num: '4th', name: 'SHAMSHEL', hp: 800, speed: 11, keepDist: 22, size: 1.05,
    color: 0x3a2a5a, glow: 0xffaa00, attackCd: 2.4, dmg: 60,
    brief: 'Floating horror with two searing energy whips. Keeps its distance and lashes.',
    abilities: ['WHIP LASH — long-range tentacle bolts (hold A.T. Field)', 'HOVER SLAM — dives at you when close'] },
  { key: 'ramiel', num: '5th', name: 'RAMIEL', hp: 950, speed: 2.5, keepDist: 55, size: 1.2,
    color: 0x1a4dff, glow: 0x88ccff, attackCd: 3.0, dmg: 85,
    brief: 'Screaming blue octahedron. Does not move much — it drills you with a particle beam.',
    abilities: ['PARTICLE BEAM — sustained piercing drill (strafe sideways!)', 'ROTATING SHARDS — radial bullet ring'] },
  { key: 'gaghiel', num: '6th', name: 'GAGHIEL', hp: 1050, speed: 16, keepDist: 8, size: 1.25,
    color: 0x7a3a1a, glow: 0xffe08a, attackCd: 2.2, dmg: 75,
    brief: 'Sea-beast Angel. It charges in straight lines and bites. Listen for the roar before it rushes.',
    abilities: ['CHARGE BITE — telegraphed high-speed ram', 'SPOUT BURST — close-range water cannon spray'] },
  { key: 'israfel', num: '7th', name: 'ISRAFEL', hp: 1250, speed: 12, keepDist: 16, size: 1.1,
    color: 0x8a8a2a, glow: 0xaaffaa, attackCd: 2.3, dmg: 70,
    brief: 'The twin Angel. It SPLITS into two bodies (Alpha & Beta) that attack in coordination.',
    abilities: ['SPLIT — fights as two coordinated bodies', 'DUAL BEAM — synchronized crossing lasers'] },
  { key: 'sandalphon', num: '8th', name: 'SANDALPHON', hp: 1350, speed: 8, keepDist: 14, size: 1.3,
    color: 0x5a1a2a, glow: 0xff6600, attackCd: 2.0, dmg: 80,
    brief: 'Emuwomb horror wreathed in magma. Breathes fire and hurls molten rock.',
    abilities: ['MAGMA BREATH — wide cone of flame', 'METEOR HURL — arcing fireballs (watch the shadows)'] },
  { key: 'zeruel', num: '14th', name: 'ZERUEL', hp: 1700, speed: 13, keepDist: 12, size: 1.45,
    color: 0x1a1a1a, glow: 0xffee88, attackCd: 1.9, dmg: 110,
    brief: 'The strongest frontal assault Angel. Ribbon arms slice EVAs in half. Its cross-blast leveled the Geofront.',
    abilities: ['ARM SLASH — instant double ribbon cut at close range', 'CROSS BLAST — giant burning cross nuke (RUN or A.T. Field!)'] },
  { key: 'arael', num: '15th', name: 'ARAEL', hp: 1500, speed: 6, keepDist: 48, size: 1.35,
    color: 0xe8e8ff, glow: 0xffff88, attackCd: 2.5, dmg: 70,
    brief: 'Winged light in orbit. It invades your MIND — beams that slow you and drain sync.',
    abilities: ['MIND RAY — drains AT energy + slows you', 'HALO DIVE — swooping light spear'] },
  { key: 'tabris', num: '17th', name: 'TABRIS (KAWORU)', hp: 1900, speed: 14, keepDist: 18, size: 1.0,
    color: 0x666677, glow: 0xff3333, attackCd: 1.7, dmg: 95,
    brief: 'Final messenger. Human form, godlike A.T. Field. "I must return to Adam." Stop him.',
    abilities: ['AT CRUSH — grabs and crushes through your field', 'MOONFALL — falling light pillars from the sky'] },
];

/* ---------------- AUDIO (synthesized, no files) ---------------- */
let AC = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(freq, dur, type = 'sawtooth', vol = 0.15, slide = 0) {
  const ac = audio(); if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, ac.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), ac.currentTime + dur);
  g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
}
function noise(dur = 0.3, vol = 0.3, low = 400) {
  const ac = audio(); if (!ac) return;
  const n = ac.createBufferSource(); const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  n.buffer = buf; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = low;
  const g = ac.createGain(); g.gain.value = vol; n.connect(f).connect(g).connect(ac.destination); n.start();
}
const SFX = {
  click: () => tone(880, 0.08, 'square', 0.08),
  punch: () => { noise(0.18, 0.4, 300); tone(90, 0.2, 'sine', 0.35, -40); },
  hit: () => { noise(0.12, 0.25, 900); tone(200, 0.12, 'square', 0.12, -100); },
  beam: () => tone(1400, 0.5, 'sawtooth', 0.07, -900),
  boom: () => { noise(0.7, 0.5, 200); tone(55, 0.7, 'sine', 0.4, -25); },
  roar: () => { tone(70, 1.2, 'sawtooth', 0.3, 60); tone(105, 1.1, 'square', 0.15, -30); noise(0.9, 0.25, 500); },
  at: () => tone(220, 0.4, 'sine', 0.1, 110),
  alarm: () => { tone(660, 0.18, 'square', 0.1); setTimeout(() => tone(440, 0.18, 'square', 0.1), 200); },
  pickup: () => { tone(520, 0.1, 'square', 0.12); setTimeout(() => tone(780, 0.12, 'square', 0.12), 100); },
  shoot: () => { noise(0.1, 0.3, 2500); tone(300, 0.1, 'square', 0.15, -150); },
  launch: () => { noise(1.2, 0.4, 600); tone(80, 1.2, 'sawtooth', 0.25, 200); },
};

/* ---------------- GAME STATE ---------------- */
const G = {
  phase: 'title', evaIndex: 1, wave: 0,
  hp: 1000, maxHp: 1000, at: 100, atMax: 100, sync: 42,
  hasGun: false, ammo: 0, kills: 0, startTime: 0,
  atActive: false, punchCd: 0, roarCd: 0, shootCd: 0, berserkT: 0,
  angelHp: 1, angelMax: 1, over: false,
};

/* ---------------- THREE SETUP ---------------- */
let renderer, scene, camera, clock;
let player, playerParts, atShield, angelGroup, angelCore, angelMeta;
let angelState = { hp: 100, max: 100, t: 0, atkT: 2, mode: 'chase', split: null, stun: 0 };
let projectiles = [], beams = [], particles = [], tracers = [], stations = [];
let camYaw = 0, camPitch = 0.32, shake = 0;
let keys = {};
let cityColliders = [];
let roarRing = null, punchArmT = 0, muzzleT = 0;
let walkPhase = 0;

function initThree() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  $('game-root').appendChild(renderer.domElement);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d1a);
  scene.fog = new THREE.Fog(0x0a0d1a, 80, 420);
  camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1200);
  clock = new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0x99aaff, 0x332211, 1.15));
  const sun = new THREE.DirectionalLight(0xffd9a0, 1.4); sun.position.set(60, 120, 40); scene.add(sun);
  const red = new THREE.PointLight(0xff2200, 2, 200); red.position.set(0, 30, 0); scene.add(red);
  buildCity();
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
}

function windowTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const x = c.getContext('2d'); x.fillStyle = '#101018'; x.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 40; i++) { x.fillStyle = Math.random() < 0.5 ? '#ffd77a' : '#222'; x.fillRect(4 + (i % 4) * 15, 4 + Math.floor(i / 4) * 12, 9, 6); }
  const t = new THREE.CanvasTexture(c); return t;
}
let winTex = null;

function buildCity() {
  winTex = windowTexture();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900),
    new THREE.MeshStandardMaterial({ color: 0x14161f, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const grid = new THREE.GridHelper(400, 40, 0xff5a00, 0x223344);
  grid.position.y = 0.05; grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
  // roads
  for (let i = -3; i <= 3; i++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), new THREE.MeshBasicMaterial({ color: 0x0a0c12 }));
    r.rotation.x = -Math.PI / 2; r.position.set(i * 50, 0.06, 0); scene.add(r);
    const r2 = r.clone(); r2.rotation.z = Math.PI / 2; r2.position.set(0, 0.06, i * 50); scene.add(r2);
  }
  // buildings ring (leave center arena clear r<45)
  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 150; i++) {
    const a = rand(0, Math.PI * 2), r = rand(60, 190);
    const w = rand(8, 20), h = rand(12, 70), d = rand(8, 20);
    const m = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.6, 0.15, rand(0.08, 0.2)), emissive: 0xffc46a, emissiveMap: winTex, emissiveIntensity: 0.55, roughness: 0.8 }));
    m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    m.scale.set(w, h, d); scene.add(m);
    cityColliders.push({ x: m.position.x, z: m.position.z, r: Math.max(w, d) * 0.6 });
  }
  // mountains backdrop
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(rand(50, 90), rand(60, 130), 5),
      new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 1 }));
    cone.position.set(Math.cos(a) * 330, 20, Math.sin(a) * 330); scene.add(cone);
  }
  // red sky glow ring (Tokyo-3 siren mood)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.4),
    new THREE.MeshBasicMaterial({ color: 0x30101a, side: THREE.BackSide, transparent: true, opacity: 0.9 }));
  sky.position.y = -20; scene.add(sky);
  // weapon stations
  const spots = [[34, 20], [-36, 14], [6, -38]];
  stations = [];
  spots.forEach(([x, z], i) => {
    const g = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x0d3a2a, emissive: 0x00ff88, emissiveIntensity: 0.35 }));
    pad.position.y = 0.6; g.add(pad);
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 4), new THREE.MeshStandardMaterial({ color: 0x2a2f3a }));
    bunker.position.y = 2.4; g.add(bunker);
    const rifle = buildRifleMesh(); rifle.position.set(0, 4.6, 0); rifle.rotation.z = 0.2; g.add(rifle);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.4, 60, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
    beam.position.y = 32; g.add(beam);
    const label = makeSprite(`STATION ${i + 1} [E]`, '#00ff88');
    label.position.y = 9; label.scale.set(16, 4, 1); g.add(label);
    g.position.set(x, 0, z); scene.add(g);
    stations.push({ group: g, x, z, used: false, beam, rifle });
  });
}

function makeSprite(text, color = '#fff') {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,0.65)'; x.fillRect(0, 0, 512, 128);
  x.strokeStyle = color; x.lineWidth = 6; x.strokeRect(4, 4, 504, 120);
  x.fillStyle = color; x.font = 'bold 52px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 66);
  const t = new THREE.CanvasTexture(c);
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
}

/* ---- model detail helpers: armor panel textures, decals, glows ---- */
const _texCache = {};
function canvasTex(key, w, h, draw) {
  if (_texCache[key]) return _texCache[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _texCache[key] = t; return t;
}
function css(hex) { return '#' + hex.toString(16).padStart(6, '0'); }
function armorTex(id, baseHex, lineHex) {
  return canvasTex('armor' + id + '_' + baseHex.toString(16), 256, 256, (x, w, h) => {
    x.fillStyle = css(baseHex); x.fillRect(0, 0, w, h);
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = css(lineHex); x.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
      x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke();
      x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke();
    }
    x.lineWidth = 2;
    x.strokeRect(30, 96, 90, 60); x.strokeRect(150, 30, 70, 110); x.strokeRect(40, 180, 150, 44);
    x.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 60; i++) { x.beginPath(); x.arc((i * 53) % w, (i * 91) % h, 1.6, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const sx = (i * 37) % w, sy = (i * 61) % h; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 20, sy + 6); x.stroke(); }
  });
}
function decalTex(text) {
  return canvasTex('decal' + text, 128, 128, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.font = '900 64px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 10; x.strokeStyle = 'rgba(0,0,0,0.85)'; x.strokeText(text, 64, 66);
    x.fillStyle = '#f2f2f2'; x.fillText(text, 64, 66);
  });
}
function glowTex() {
  return canvasTex('glow', 128, 128, (x, w, h) => {
    const g = x.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
}
function featherTex() {
  return canvasTex('feather', 128, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,252,240,0.95)';
    x.beginPath(); x.moveTo(64, 4); x.quadraticCurveTo(120, 90, 96, 250); x.quadraticCurveTo(64, 226, 32, 250); x.quadraticCurveTo(8, 90, 64, 4); x.fill();
    x.strokeStyle = 'rgba(150,130,100,0.55)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(64, 8); x.lineTo(64, 248); x.stroke();
    x.lineWidth = 1;
    for (let i = 0; i < 22; i++) { const y = 20 + i * 10; x.beginPath(); x.moveTo(64, y); x.lineTo(20, y + 26); x.stroke(); x.beginPath(); x.moveTo(64, y); x.lineTo(108, y + 26); x.stroke(); }
  });
}
function glowSprite(color, size, opacity = 0.8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1); return s;
}
function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.55, metalness: o.m ?? 0.3, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, flatShading: !!o.flat, transparent: !!o.t, opacity: o.o ?? 1 });
}
function BX(parent, w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; parent.add(m); return m;
}
function CYL(parent, rt, rb, h, mat, x, y, z, rx = 0, ry = 0, rz = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; parent.add(m); return m;
}
function CONE(parent, r, h, mat, x, y, z, rx = 0, ry = 0, rz = 0, seg = 8) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; parent.add(m); return m;
}
function SPH(parent, r, mat, x, y, z, ws = 12, hs = 12) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat);
  m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
}

function buildRifleMesh() {
  // NERV pallet rifle — long slab-sided kinetic rifle
  const g = new THREE.Group();
  const gunmetal = M(0x3a3f4a, { r: 0.45, m: 0.65 });
  const dark = M(0x1c1e24, { r: 0.6, m: 0.4 });
  BX(g, 3.2, 0.8, 0.8, gunmetal, 0, 0, 0);                       // receiver
  BX(g, 2.6, 0.5, 0.5, dark, 2.8, 0.05, 0);                      // barrel shroud
  CYL(g, 0.14, 0.14, 1.0, dark, 4.4, 0.05, 0, 0, 0, Math.PI / 2); // muzzle
  BX(g, 0.5, 0.35, 0.35, gunmetal, 4.9, 0.05, 0);                // muzzle brake
  BX(g, 1.6, 0.25, 0.3, dark, 0.4, 0.55, 0);                     // top rail
  BX(g, 0.5, 0.4, 0.4, dark, -0.4, 0.75, 0);                     // scope
  CYL(g, 0.12, 0.12, 0.5, dark, -0.4, 1.0, 0);                   // scope lens ring
  BX(g, 0.5, 1.2, 0.55, gunmetal, 0.3, -0.9, 0, 0, 0, 0.25);      // curved magazine
  BX(g, 0.45, 1.0, 0.5, dark, -1.2, -0.7, 0);                    // grip
  BX(g, 1.1, 0.9, 0.7, gunmetal, -2.0, -0.1, 0);                 // stock
  BX(g, 1.2, 0.35, 0.6, dark, 1.6, -0.55, 0);                    // foregrip
  BX(g, 0.9, 0.9, 0.25, M(0x7a2020, { r: 0.5 }), -1.0, 0, 0.5);  // NERV ammo drum badge
  return g;
}

/* ---------------- EVA BUILDER (show-accurate) ---------------- */
function buildEVA(eva) {
  const id = eva.id;
  const g = new THREE.Group();
  // armor uses baked panel-line texture; lines darker version of base
  const armorMap = armorTex(id, eva.color, eva.dark);
  const armor = new THREE.MeshStandardMaterial({ map: armorMap, roughness: 0.45, metalness: 0.35, emissive: eva.color, emissiveIntensity: 0.16, emissiveMap: armorMap });
  const armorFlat = M(eva.color, { r: 0.45, m: 0.35, e: eva.color, ei: 0.12 });
  const stripe = M(id === 2 ? 0xF2EFE4 : eva.color2, { r: 0.45, m: 0.2, e: id === 2 ? 0xF2EFE4 : eva.color2, ei: 0.15 });
  const accent = new THREE.MeshStandardMaterial({ map: armorTex('a' + id, eva.color2, 0x222222), roughness: 0.5, metalness: 0.25 });
  const dark = M(eva.dark, { r: 0.7, m: 0.15 });
  const suit = M(0x4a443c, { r: 0.85, m: 0.05 });          // grey-brown muscle undersuit
  const muscle = M(0x6b5a48, { r: 0.85, m: 0.05 });
  const bone = M(0xd8d2c2, { r: 0.4, m: 0.1 });            // horn / teeth / plug white
  const strap = M(0x4a2f14, { r: 0.9, m: 0 });             // brown restraint straps (as in show)
  const gumetal = M(0x2a2d34, { r: 0.45, m: 0.7 });
  const eyeCol = [0xff4422, 0xd8ff3a, 0x7dff4a][id];
  const P = {};
  const num = ['00', '01', '02'][id];

  /* ---- legs: heel-spur feet, plated shins, knee spikes ---- */
  function leg(side) {
    const s = new THREE.Group(); s.position.set(side * 1.3, 6.4, 0); g.add(s);
    SPH(s, 0.85, suit, 0, -0.2, 0);                                   // hip joint
    BX(s, 1.7, 3.0, 2.0, armor, 0, -1.8, 0);                          // thigh
    BX(s, 1.76, 0.4, 2.06, stripe, 0, -2.4, 0);                       // thigh stripe band
    BX(s, 0.4, 2.6, 2.1, armorFlat, side * 1.0, -1.8, 0);             // outer thigh plate
    BX(s, 2.0, 0.5, 2.2, strap, 0, -3.1, 0);                          // thigh restraint band
    SPH(s, 0.7, gumetal, 0, -3.5, 0.2);                               // knee joint
    BX(s, 1.5, 1.1, 0.7, armor, 0, -3.4, 1.0);                         // knee plate
    CONE(s, 0.28, 1.0, bone, 0, -3.5, 1.6, Math.PI / 2);               // knee spike
    BX(s, 1.35, 3.0, 1.5, muscle, 0, -5.0, -0.1);                      // calf muscle
    BX(s, 1.1, 2.8, 0.6, armor, 0, -5.0, 0.9, -0.12);                  // shin guard (slanted)
    BX(s, 1.42, 0.35, 1.57, stripe, 0, -5.9, 0.1);                     // shin stripe band
    BX(s, 1.6, 0.5, 1.8, strap, 0, -6.0, 0);                           // ankle restraint
    BX(s, 1.6, 0.8, 2.4, armor, 0, -6.7, 0.5);                         // foot
    BX(s, 1.2, 0.55, 1.0, armorFlat, 0, -6.8, 2.0);                    // toe
    CONE(s, 0.35, 1.2, armorFlat, 0, -6.6, -1.2, -Math.PI / 2);        // heel spur
    return s;
  }
  P.legL = leg(-1); P.legR = leg(1);

  /* ---- pelvis + torso: skirt armor, straps, pecs, core ---- */
  BX(g, 3.2, 1.7, 2.1, suit, 0, 7.2, 0);                              // pelvis
  BX(g, 3.5, 1.0, 2.3, armor, 0, 7.9, 0);                             // waist armor
  BX(g, 3.7, 0.45, 2.4, strap, 0, 7.35, 0);                           // waist restraint
  BX(g, 2.2, 1.6, 0.5, armor, 0, 6.3, 1.1, 0.25);                      // front skirt
  BX(g, 2.2, 1.4, 0.5, armor, 0, 6.4, -1.1, -0.25);                    // rear skirt
  BX(g, 0.5, 1.5, 1.8, armor, -1.85, 6.5, 0, 0, 0, 0.15);              // side skirts
  BX(g, 0.5, 1.5, 1.8, armor, 1.85, 6.5, 0, 0, 0, -0.15);
  BX(g, 2.6, 1.4, 1.9, muscle, 0, 8.9, 0);                            // abdomen
  BX(g, 2.8, 0.4, 2.0, strap, 0, 9.3, 0);                             // chest restraint band
  const torso = BX(g, 4.3, 2.6, 2.7, armor, 0, 10.4, 0); P.torso = torso;
  BX(g, 1.9, 1.9, 0.5, armor, -1.15, 10.6, 1.35);                      // pec plates
  BX(g, 1.9, 1.9, 0.5, armor, 1.15, 10.6, 1.35);
  // center chest stripe per unit (01 green V / 02 white / 00 blue-grey)
  const stripeCol = [0x5a6a7a, 0x1db31f, 0xf2f2f2][id];
  BX(g, 0.5, 1.7, 0.2, M(stripeCol, { r: 0.5 }), -0.35, 10.5, 1.62, 0, 0, 0.35);
  BX(g, 0.5, 1.7, 0.2, M(stripeCol, { r: 0.5 }), 0.35, 10.5, 1.62, 0, 0, -0.35);
  BX(g, 4.5, 0.9, 2.9, armor, 0, 11.8, 0); P.chest = BX(g, 0.1, 0.1, 0.1, armor, 0, -99, 0);
  CYL(g, 1.7, 1.7, 0.7, gumetal, 0, 12.15, 0);                         // neck collar restraint
  // S2 core + housing ring
  CYL(g, 1.0, 1.0, 0.4, gumetal, 0, 9.9, 1.45, Math.PI / 2);
  const core = SPH(g, 0.72, new THREE.MeshBasicMaterial({ color: 0xff1822 }), 0, 9.9, 1.55);
  const coreGlow = glowSprite(0xff2233, 3.2); coreGlow.position.set(0, 9.9, 1.7); g.add(coreGlow);

  /* ---- shoulder pylons: tall armor boxes, intakes, unit decals ---- */
  function pylon(side) {
    const p = new THREE.Group(); p.position.set(side * 3.55, 11.9, 0); g.add(p);
    BX(p, 1.7, 4.4, 2.7, armor, 0, 0, 0);                              // main pylon
    BX(p, 1.75, 1.4, 2.0, armorFlat, 0, 2.5, -0.2, -0.18);              // top fin (raked)
    BX(p, 0.4, 2.6, 1.8, gumetal, 0, -0.4, 1.15);                      // front intake (dark)
    for (let v = 0; v < 3; v++) BX(p, 0.42, 0.28, 1.7, M(0x0c0d10, { r: 0.8 }), 0, -1.2 + v * 0.7, 1.15); // intake slats
    BX(p, 0.14, 3.4, 0.35, stripe, side * 0.82, 0.1, 1.15);             // outer front-edge stripe
    BX(p, 0.14, 0.7, 0.35, bone, side * 0.82, 2.2, 1.15);                // white top marking
    BX(p, 1.2, 0.5, 0.3, accent, 0, 1.2, 1.42);                        // intake accent stripe
    BX(p, 1.0, 1.6, 1.9, gumetal, 0, -2.5, 0);                         // lower thruster block
    const dec = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: decalTex(num), transparent: true }));
    dec.position.set(side * 0.96, 0.4, 0); dec.rotation.y = side * Math.PI / 2; p.add(dec);
    return p;
  }
  P.pylL = pylon(-1); P.pylR = pylon(1);
  // prog-knife sheath + blade on right pylon
  BX(g, 0.5, 2.6, 0.7, gumetal, 4.65, 12.6, -0.6);
  const knife = BX(g, 0.22, 2.2, 0.45, M(0xcccccc, { r: 0.2, m: 0.9 }), 4.65, 14.6, -0.6);

  /* ---- arms: shoulder balls, plated upper, muscled forearm, fingered fists ---- */
  function arm(side) {
    const s = new THREE.Group(); s.position.set(side * 2.9, 11.2, 0); g.add(s);
    SPH(s, 0.95, suit, 0, -0.3, 0);                                   // shoulder joint
    BX(s, 1.5, 3.0, 1.7, armor, 0, -1.9, 0);                          // upper-arm armor
    BX(s, 1.56, 0.4, 1.76, stripe, 0, -2.9, 0);                       // upper-arm stripe band
    BX(s, 1.7, 0.45, 1.9, strap, 0, -3.1, 0);                         // bicep restraint
    SPH(s, 0.6, gumetal, 0, -3.6, 0);                                 // elbow
    CONE(s, 0.25, 0.9, armorFlat, 0, -3.6, -0.8, -Math.PI / 2);        // elbow spike
    BX(s, 1.25, 2.6, 1.4, muscle, 0, -5.0, 0);                        // forearm muscle
    BX(s, 1.0, 2.2, 0.5, armor, side * 0.15, -5.0, 0.75);              // forearm guard
    BX(s, 1.32, 0.35, 1.47, stripe, 0, -4.1, 0);                      // forearm stripe band
    const fist = new THREE.Group(); fist.position.set(0, -6.7, 0.1); s.add(fist);
    BX(fist, 1.3, 1.1, 1.3, suit, 0, 0, 0);                           // palm
    BX(fist, 1.4, 0.5, 1.4, armorFlat, 0, 0.5, 0);                    // knuckle plate
    for (let f = 0; f < 4; f++) BX(fist, 0.26, 1.0, 0.3, muscle, -0.45 + f * 0.3, -0.9, 0.15); // fingers
    BX(fist, 0.28, 0.8, 0.3, muscle, side * -0.75, -0.3, 0.3, 0, 0, side * 0.5); // thumb
    return s;
  }
  P.armL = arm(-1); P.armR = arm(1);

  /* ---- heads: per-unit show variants ---- */
  const headG = new THREE.Group(); headG.position.y = 13.55; g.add(headG); P.head = headG;
  CYL(headG, 0.8, 0.9, 1.0, suit, 0, -1.2, 0);                        // neck
  if (id === 0) {
    // EVA-00: rounded ochre dome, single cyclops eye
    const dome = SPH(headG, 1.25, armor, 0, 0.1, 0, 14, 12); dome.scale.set(1, 1.05, 1.05);
    BX(headG, 2.0, 0.9, 1.9, armorFlat, 0, -0.9, 0.1);                // lower face block
    BX(headG, 1.7, 0.35, 0.3, M(0x3a4a5a, { r: 0.5 }), 0, -0.55, 1.05); // vent mouth
    const lens = SPH(headG, 0.68, new THREE.MeshBasicMaterial({ color: 0xff6a2a }), 0, 0.35, 1.15);
    CYL(headG, 0.85, 0.85, 0.25, gumetal, 0, 0.35, 1.05, Math.PI / 2); // lens housing
    const eg = glowSprite(0xff7733, 3.2); eg.position.set(0, 0.35, 1.6); headG.add(eg);
    BX(headG, 1.4, 0.4, 0.4, accent, 0, 1.15, 0.6);                   // brow plate
    BX(headG, 1.5, 0.8, 0.5, M(0xe8e8e8, { r: 0.5 }), 0, -1.35, 0.35); // white chin guard
  } else if (id === 1) {
    // EVA-01: angular helm, brow ridge, twin eyes, long forehead horn, toothed jaw
    BX(headG, 1.9, 1.7, 2.2, armor, 0, 0.1, 0);                       // cranium
    BX(headG, 2.1, 0.6, 2.3, armorFlat, 0, -0.6, 0);                  // brow ridge
    BX(headG, 1.7, 0.5, 0.4, gumetal, 0, 0.0, 1.05);                  // visor surround
    BX(headG, 0.72, 0.34, 0.15, new THREE.MeshBasicMaterial({ color: 0xf4ff5a }), -0.44, 0.02, 1.2, 0, 0, 0.16);
    BX(headG, 0.72, 0.34, 0.15, new THREE.MeshBasicMaterial({ color: 0xf4ff5a }), 0.44, 0.02, 1.2, 0, 0, -0.16);
    const eg = glowSprite(0xccff33, 2.6, 0.65); eg.position.set(0, 0.05, 1.6); headG.add(eg);
    const horn = CONE(headG, 0.3, 3.2, M(0xE8F0E0, { r: 0.35, m: 0.05 }), 0, 2.2, 0.85, 0.5); // long forehead horn, raked forward
    BX(headG, 0.5, 0.5, 1.6, bone, 0, 0.75, 0.9, 0, 0, 0);             // horn base
    BX(headG, 1.5, 0.9, 1.9, suit, 0, -1.25, 0.15);                   // jaw muscle
    for (let t = -2; t <= 2; t++) {                                   // upper + lower teeth
      BX(headG, 0.18, 0.35, 0.18, bone, t * 0.28, -0.85, 1.05);
      BX(headG, 0.18, 0.3, 0.18, bone, t * 0.28, -1.6, 0.95);
    }
    BX(headG, 1.0, 0.3, 0.3, accent, 0, -1.75, 0.9);                  // green chin stripe
    BX(headG, 0.4, 1.2, 2.0, armorFlat, -1.05, 0.1, -0.2);            // side head armor
    BX(headG, 0.4, 1.2, 2.0, armorFlat, 1.05, 0.1, -0.2);
  } else {
    // EVA-02: red helm, FOUR eyes, head fins, white jaw
    BX(headG, 1.9, 1.8, 2.2, armor, 0, 0.1, 0);
    BX(headG, 2.0, 0.5, 0.4, M(0xf2f2f2, { r: 0.5 }), 0, 0.75, 0.9);  // white crown stripe
    BX(headG, 1.7, 0.45, 0.35, gumetal, 0, 0.15, 1.08);               // visor band
    for (const [ex, ey] of [[-0.45, 0.28], [0.45, 0.28], [-0.4, -0.12], [0.4, -0.12]])
      BX(headG, 0.6, 0.28, 0.14, new THREE.MeshBasicMaterial({ color: 0xc2ff55 }), ex, ey, 1.2);
    const eg = glowSprite(0xaaff55, 2.8, 0.65); eg.position.set(0, 0.1, 1.6); headG.add(eg);
    CONE(headG, 0.22, 1.4, bone, 0, 1.7, 0.3, 0.3);                   // short forehead horn
    BX(headG, 0.3, 1.6, 1.4, armorFlat, -1.2, 0.2, -0.3, 0, 0, 0.35);  // side head fins
    BX(headG, 0.3, 1.6, 1.4, armorFlat, 1.2, 0.2, -0.3, 0, 0, -0.35);
    BX(headG, 1.6, 1.0, 1.9, bone, 0, -1.2, 0.2);                     // white jaw block
    for (let t = -2; t <= 2; t++) {
      BX(headG, 0.18, 0.32, 0.18, M(0x883333, { r: 0.5 }), t * 0.28, -0.78, 1.05);
      BX(headG, 0.18, 0.28, 0.18, M(0x883333, { r: 0.5 }), t * 0.28, -1.62, 1.0);
    }
    CONE(headG, 0.25, 0.9, bone, 0, -1.9, 0.6, Math.PI);              // chin spike
  }

  /* ---- dorsal: spine plates, entry plug, umbilical ---- */
  for (let i = 0; i < 3; i++) BX(g, 1.6 - i * 0.2, 0.5, 0.4, armorFlat, 0, 10.8 - i * 0.9, -1.55);
  CYL(g, 0.55, 0.55, 3.6, bone, 0, 10.6, -2.5, Math.PI / 2);          // entry plug tube
  CYL(g, 0.68, 0.68, 0.35, M(0xaa1818, { r: 0.5 }), 0, 10.6, -1.6, Math.PI / 2);
  CYL(g, 0.68, 0.68, 0.35, M(0xaa1818, { r: 0.5 }), 0, 10.6, -3.4, Math.PI / 2);
  const plugTip = glowSprite(0xff3333, 1.6, 0.7); plugTip.position.set(0, 10.6, -4.4); g.add(plugTip);
  BX(g, 1.6, 2.2, 0.4, gumetal, 0, 10.6, -1.45);                      // plug hatch frame
  CYL(g, 0.45, 0.6, 1.6, gumetal, -1.4, 6.6, -1.6);                   // umbilical socket
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.4, 6.4, -1.8), new THREE.Vector3(-2.6, 4.0, -4.5),
    new THREE.Vector3(-2.2, 1.4, -7.5), new THREE.Vector3(-3.4, 0.3, -11),
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 20, 0.32, 8), dark);
  g.add(cable);

  /* ---- AT shield + gun mount (same API) ---- */
  const shield = new THREE.Mesh(new THREE.OctahedronGeometry(11, 0),
    new THREE.MeshBasicMaterial({ color: 0x66ffee, transparent: true, opacity: 0.0, wireframe: true }));
  shield.position.y = 8; g.add(shield);
  g.userData.shield = shield;
  const gun = buildRifleMesh(); gun.scale.setScalar(1.9); gun.position.set(4.4, 4.6, 1.6); gun.rotation.y = -0.15; gun.visible = false; g.add(gun);
  g.userData.gun = gun;
  return { group: g, parts: P };
}

/* ---------------- ANGEL BUILDERS (show-accurate) ---------------- */
function angelCoreMesh(r = 1.1) {
  const grp = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0x550000, roughness: 0.3, emissive: 0xff1122, emissiveIntensity: 0.9 }));
  grp.add(shell);
  const hot = new THREE.Mesh(new THREE.SphereGeometry(r * 0.55, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff6677 }));
  grp.add(hot);
  const gl = glowSprite(0xff2233, r * 5); grp.add(gl);
  grp.userData.r = r;
  return grp;
}
function angelAtField(g, size, color, y = 8) {
  const at = new THREE.Mesh(new THREE.OctahedronGeometry(10 * size, 0),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, wireframe: true }));
  at.position.y = y; g.add(at); g.userData.at = at; return at;
}
function angelTag(g, meta) {
  const tag = makeSprite(`${meta.num} ANGEL: ${meta.name}`, '#ff6666');
  tag.position.y = 20 * meta.size + 4; tag.scale.set(22, 5.5, 1); g.add(tag);
}
function buildAngel(meta) {
  const g = new THREE.Group();
  const flesh = M(meta.color, { r: 0.5, m: 0.25 });
  const boneW = M(0xe8e2d0, { r: 0.45, m: 0.05 });   // Sachiel/Zeruel bone-white
  const glowM = new THREE.MeshBasicMaterial({ color: meta.glow });
  let core = null;
  const H = 14 * meta.size;
  const S = meta.size;

  if (meta.key === 'ramiel') {
    // Perfect mirror-blue octahedron + inner geometric heart + emitter crystal
    const outer = new THREE.Mesh(new THREE.OctahedronGeometry(8, 0),
      new THREE.MeshPhysicalMaterial({ color: 0x2a6dff, metalness: 0.9, roughness: 0.12, emissive: 0x0a2aff, emissiveIntensity: 0.55, transparent: true, opacity: 0.94, flatShading: true }));
    outer.position.y = H; g.add(outer); g.userData.spin = outer;
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(3.6, 0),
      new THREE.MeshBasicMaterial({ color: 0xbfe0ff, wireframe: true }));
    inner.position.y = H; g.add(inner); g.userData.inner = inner;
    core = angelCoreMesh(1.5); core.position.y = H; g.add(core);
    CONE(g, 1.6, 4.5, glowM, 0, H - 9.5, 0, Math.PI, 0, 0, 4);   // emitter crystal below
    const eglow = glowSprite(0x88ccff, 9); eglow.position.y = H - 10; g.add(eglow);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.35, 8, 40), glowM);
    ring.position.y = H; ring.rotation.x = Math.PI / 2; g.add(ring); g.userData.ring = ring;
    // vertex spikes (Ramiel's geometric nodes)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      SPH(g, 0.8, glowM, Math.cos(a) * 8, H + (i % 2 ? 8 : -8), Math.sin(a) * 8, 8, 8);
    }
    angelAtField(g, S, meta.glow, H);
  } else if (meta.key === 'shamshel') {
    // Floating mollusk stalk, glowing eye, two crackling energy whips
    const fleshP = M(0x8a4a72, { r: 0.55, m: 0.1 });
    const fleshB = M(0xd8b89a, { r: 0.6, m: 0.05 });
    CYL(g, 3.2, 4.6, 4.5, fleshP, 0, H + 2, 0, 0, 0, 0, 12);      // crown
    CYL(g, 4.6, 3.4, 4.0, fleshB, 0, H - 2, 0, 0, 0, 0, 12);      // mid band
    CYL(g, 3.4, 1.6, 4.5, fleshP, 0, H - 6, 0, 0, 0, 0, 12);      // taper
    for (const ry of [H + 3.5, H - 0.5, H - 4.5]) {
      const ridge = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.35, 8, 20), fleshP);
      ridge.position.y = ry; ridge.rotation.x = Math.PI / 2; g.add(ridge);
    }
    SPH(g, 2.2, fleshB, 0, H + 4.6, 1.2, 12, 10);                 // head capsule
    SPH(g, 1.1, glowM, 0, H + 4.8, 3.0, 10, 10);                  // great amber eye
    const eg = glowSprite(meta.glow, 6); eg.position.set(0, H + 4.8, 3.4); g.add(eg);
    core = angelCoreMesh(1.2); core.position.set(0, H - 2, 3.9); g.add(core);
    for (let i = 0; i < 2; i++) {                                 // energy whips with barbs
      const sx = i ? 1 : -1;
      const w = new THREE.Group(); w.position.set(sx * 3.6, H - 3, 0); g.add(w);
      const lash = CYL(w, 0.32, 0.55, 15, new THREE.MeshBasicMaterial({ color: meta.glow }), 0, -7, 0);
      for (let b = 0; b < 4; b++) CONE(w, 0.5, 1.1, glowM, (b % 2 ? 0.5 : -0.5), -3 - b * 3, 0, 0, 0, sx * 1.2, 4);
      const tip = glowSprite(meta.glow, 4); tip.position.y = -14.5; w.add(tip);
      w.rotation.z = sx * 0.45; g.userData['whip' + i] = w; g.userData['whipBase' + i] = sx * 0.45;
    }
    const under = glowSprite(0xff66aa, 12, 0.35); under.position.y = H - 10; g.add(under);
    angelAtField(g, S, meta.glow, H - 1);
  } else if (meta.key === 'sachiel') {
    // Bone-masked giant: beaked mask, ribbed torso, arm blades, digitigrade legs
    const hide = M(0x1e1626, { r: 0.6, m: 0.2 });
    BX(g, 3.6, 2.0, 2.2, hide, 0, 7.0, 0);                        // pelvis
    BX(g, 4.0, 2.6, 2.6, hide, 0, 9.2, 0);                        // abdomen
    BX(g, 4.6, 2.8, 3.0, hide, 0, 11.4, 0);                       // chest
    for (let r = 0; r < 3; r++) {                                 // exposed ribs
      const rib = new THREE.Mesh(new THREE.TorusGeometry(2.5 - r * 0.25, 0.22, 8, 18, Math.PI), boneW);
      rib.position.set(0, 10.6 - r * 0.9, 0.4); rib.rotation.y = Math.PI / 2; rib.rotation.z = Math.PI / 2; g.add(rib);
    }
    core = angelCoreMesh(1.2); core.position.set(0, 10.4, 1.9); g.add(core);
    CYL(g, 0.75, 0.9, 1.2, hide, 0, 12.9, 0);                     // neck
    const maskG = new THREE.Group(); maskG.position.set(0, 14.3, 0.3); g.add(maskG);
    BX(maskG, 2.0, 2.2, 2.0, boneW, 0, 0.4, 0);                   // cranium
    BX(maskG, 1.1, 2.8, 0.9, boneW, 0, -1.2, 0.9, 0.5);           // beak sloping down
    CONE(maskG, 0.35, 1.6, boneW, 0, 1.9, -0.3, -0.4);            // head crest spike
    BX(maskG, 1.6, 0.35, 0.2, new THREE.MeshBasicMaterial({ color: 0x111111 }), 0, 0.6, 1.02); // eye band
    SPH(maskG, 0.22, glowM, -0.45, 0.6, 1.05, 8, 8);              // burning eyes
    SPH(maskG, 0.22, glowM, 0.45, 0.6, 1.05, 8, 8);
    for (const s of [-1, 1]) {                                    // arms + AMBAC blades
      const sh = SPH(g, 0.8, hide, s * 2.9, 11.6, 0, 10, 8);
      CONE(g, 0.5, 2.2, boneW, s * 3.3, 13.0, 0);                 // shoulder spike
      CYL(g, 0.45, 0.4, 3.2, hide, s * 3.0, 9.6, 0);
      const blade = BX(g, 0.28, 8.5, 1.1, M(0xf0ead8, { r: 0.3, m: 0.1, e: meta.glow, ei: 0.25 }), s * 3.1, 5.6, 0.3, 0, 0, s * 0.08);
      g.userData['blade' + (s < 0 ? 0 : 1)] = blade;
    }
    for (const s of [-1, 1]) {                                    // digitigrade legs + claws
      BX(g, 1.3, 3.0, 1.6, hide, s * 1.1, 5.2, 0);
      BX(g, 1.0, 2.8, 1.2, hide, s * 1.1, 2.4, 0.6, 0.5);
      BX(g, 1.1, 0.6, 2.2, hide, s * 1.1, 0.5, 1.0);
      for (let c = -1; c <= 1; c++) CONE(g, 0.18, 0.8, boneW, s * 1.1 + c * 0.4, 0.35, 2.1, Math.PI / 2);
    }
    angelAtField(g, S, meta.glow);
  } else if (meta.key === 'israfel') {
    // Twin gold/silver bodies sharing one stump — the splitting Angel
    const gold = M(0xc8a028, { r: 0.35, m: 0.75 });
    const silver = M(0xb8bcc8, { r: 0.35, m: 0.75 });
    BX(g, 5.2, 2.0, 2.6, flesh, 0, 6.8, 0);                       // shared stump
    for (const [s, mat, nm] of [[-1, gold, 'Α'], [1, silver, 'Β']]) {
      BX(g, 3.2, 4.6, 2.4, mat, s * 2.0, 10.2, 0);                // torso
      BX(g, 3.4, 0.8, 2.6, M(0x333333, { r: 0.6 }), s * 2.0, 8.2, 0); // waist band
      const mg = new THREE.Group(); mg.position.set(s * 2.0, 13.6, 0.2); g.add(mg);
      BX(mg, 1.8, 2.0, 1.8, mat, 0, 0.3, 0);                      // mask face
      BX(mg, 1.4, 0.3, 0.15, glowM, 0, 0.5, 0.95);                // visor eyes
      BX(mg, 0.9, 1.8, 0.7, mat, 0, -1.4, 0.5, 0.4);              // chin beak
      BX(g, 1.2, 2.8, 1.5, mat, s * 2.0, 5.0, 0);                 // legs
      BX(g, 1.3, 0.6, 2.0, mat, s * 2.0, 0.4, 0.4);
      const blade = BX(g, 0.3, 7.5, 1.0, M(0xf0f0e0, { r: 0.3, e: meta.glow, ei: 0.3 }), s * 4.1, 9.5, 0.2, 0, 0, s * 0.1);
      g.userData['blade' + (s < 0 ? 0 : 1)] = blade;
    }
    core = angelCoreMesh(1.2); core.position.set(-2.0, 10.4, 1.6); g.add(core);  // Alpha's core
    const dim = SPH(g, 0.9, M(0x442222, { e: 0x661111, ei: 0.6 }), 2.0, 10.4, 1.6, 10, 10); // Beta's dormant core
    angelAtField(g, S, meta.glow);
  } else if (meta.key === 'gaghiel') {
    // Reef shark horror: jaw, dorsal fin, triple eyes, mottled hide
    const hide = M(0x7a4a22, { r: 0.6, m: 0.15 });
    const belly = M(0xd8c4a8, { r: 0.65, m: 0.05 });
    const bodyG = new THREE.Group(); g.add(bodyG); g.userData.body = bodyG;
    const torsoM = CYL(bodyG, 2.2, 3.8, 14, hide, 0, 5.5, -1, Math.PI / 2 - 0.12, 0, 0, 10);
    CYL(bodyG, 1.8, 2.0, 3.5, belly, 0, 4.3, -1, Math.PI / 2 - 0.12, 0, 0, 10); // pale underside
    CONE(bodyG, 2.0, 5.0, hide, 0, 5.9, 7.5, Math.PI / 2 - 0.15, 0, 0, 8);     // snout
    BX(bodyG, 0.5, 3.2, 2.2, hide, 0, 9.0, -2.5, -0.3);            // dorsal fin
    BX(bodyG, 0.4, 2.4, 1.6, hide, -3.4, 4.4, -3.5, 0, 0, 0.5);   // pectoral fins
    BX(bodyG, 0.4, 2.4, 1.6, hide, 3.4, 4.4, -3.5, 0, 0, -0.5);
    BX(bodyG, 0.4, 3.4, 1.8, hide, 0, 7.6, -8.6);                 // tail stalk
    BX(bodyG, 0.35, 4.6, 2.4, hide, 0, 9.6, -9.2);               // tail fluke (vertical)
    const jawG = new THREE.Group(); jawG.position.set(0, 4.4, 6.5); bodyG.add(jawG); g.userData.jaw = jawG;
    BX(jawG, 2.6, 0.9, 5.5, M(0x2a1a12, { r: 0.7 }), 0, -0.6, 1.0, 0.12); // lower jaw
    for (let t = 0; t < 7; t++) {                                 // fangs upper + lower
      CONE(bodyG, 0.22, 0.9, boneW, -1.2 + t * 0.4, 4.9, 5.2 + (t % 2) * 0.5, Math.PI, 0, 0, 5);
      CONE(jawG, 0.2, 0.8, boneW, -1.1 + t * 0.37, 0.1, 0.6 + (t % 2) * 0.5, 0, 0, 0, 5);
    }
    for (const s of [-1, 1]) for (let e = 0; e < 3; e++) {       // triple eyes each side
      SPH(bodyG, 0.42 - e * 0.07, glowM, s * (1.9 - e * 0.15), 6.6 - e * 0.3, 4.6 - e * 0.9, 8, 8);
    }
    const eg = glowSprite(meta.glow, 5); eg.position.set(0, 6.6, 5.2); bodyG.add(eg);
    for (let sl = 0; sl < 4; sl++) BX(bodyG, 0.15, 1.6, 0.5, M(0x3a2412, { r: 0.8 }), -3.1, 5.6 - sl * 0.2, -0.5 - sl * 1.1); // gill slits
    core = angelCoreMesh(1.2); core.position.set(0, 7.6, 3.4); bodyG.add(core);
    angelAtField(g, S, meta.glow, 6);
  } else if (meta.key === 'sandalphon') {
    // Volcano embryo: veined chrysalis, shut eye, lava cradle
    const eggM = M(0x9a4a3a, { r: 0.5, m: 0.1, e: 0xff4400, ei: 0.35 });
    const bodyG = new THREE.Group(); g.add(bodyG); g.userData.body = bodyG;
    const segY = [3.5, 6.0, 8.6, 11.0, 13.0], segR = [3.6, 3.2, 2.7, 2.1, 1.4];
    segY.forEach((y, i) => {
      SPH(bodyG, segR[i], eggM, 0, y, 0, 14, 12);
      const vein = new THREE.Mesh(new THREE.TorusGeometry(segR[i] * 0.99, 0.14, 6, 22),
        new THREE.MeshBasicMaterial({ color: 0xff7722 }));
      vein.position.y = y; vein.rotation.x = Math.PI / 2 + 0.25; bodyG.add(vein);
    });
    BX(bodyG, 2.6, 0.5, 0.4, new THREE.MeshBasicMaterial({ color: 0xffcc44 }), 0, 11.2, 2.2); // shut glowing eye
    BX(bodyG, 2.8, 0.35, 0.3, eggM, 0, 11.7, 2.2);
    BX(bodyG, 2.8, 0.35, 0.3, eggM, 0, 10.7, 2.2);
    BX(bodyG, 0.5, 2.6, 1.6, eggM, -3.4, 7.5, -0.5, 0, 0, 0.5);   // side fins
    BX(bodyG, 0.5, 2.6, 1.6, eggM, 3.4, 7.5, -0.5, 0, 0, -0.5);
    core = angelCoreMesh(1.2); core.position.set(0, 6.0, 3.0); bodyG.add(core);
    const rock = CYL(g, 7.5, 9.5, 2.5, M(0x1a1214, { r: 0.95 }), 0, 0.4, 0, 0, 0, 0, 12); // lava rock cradle
    const lava = new THREE.Mesh(new THREE.RingGeometry(7.6, 10.5, 26),
      new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    lava.rotation.x = -Math.PI / 2; lava.position.y = 0.15; g.add(lava);
    const up = glowSprite(0xff6600, 16, 0.4); up.position.y = 5; g.add(up);
    angelAtField(g, S, meta.glow, 8);
  } else if (meta.key === 'zeruel') {
    // Skull-faced fortress: folding white mask, ribbon cutter arms, belly plates
    const hide = M(0x141118, { r: 0.55, m: 0.35 });
    BX(g, 9.0, 7.0, 6.0, hide, 0, 7.5, 0);                        // massive torso
    for (let p = 0; p < 3; p++) BX(g, 9.4 - p * 0.3, 0.9, 6.3, M(0x241e28, { r: 0.6 }), 0, 5.2 + p * 1.7, 0); // belly plates
    BX(g, 7.0, 3.0, 5.0, hide, 0, 12.2, -0.5);                    // upper mass
    for (const s of [-1, 1, 0]) CONE(g, 0.7, 2.6, hide, s * 3.0, 14.5, -1.5, -0.3); // back spikes
    for (const s of [-1, 1]) {                                    // stub legs + feet
      BX(g, 2.4, 4.5, 2.8, hide, s * 2.6, 2.2, 0);
      BX(g, 2.6, 1.0, 3.8, hide, s * 2.6, 0.5, 0.5);
    }
    for (let i = 0; i < 2; i++) {                                 // ribbon cutter arms
      const s = i ? 1 : -1;
      SPH(g, 1.1, hide, s * 5.0, 11.5, 0, 10, 8);
      const rib = BX(g, 0.9, 15, 0.35, M(0xf2ecd0, { r: 0.35, e: 0xffeeaa, ei: 0.35 }), s * 5.6, 6.5, 1.2, 0.1, 0, s * -0.12);
      g.userData['arm' + i] = rib; g.userData['armBase' + i] = s * -0.12;
    }
    const faceG = new THREE.Group(); faceG.position.set(0, 11.8, 3.0); g.add(faceG);
    BX(faceG, 5.2, 3.6, 0.9, boneW, 0, 0.3, 0);                   // skull mask
    BX(faceG, 5.6, 0.8, 1.0, boneW, 0, 2.2, 0);                   // brow overhang
    BX(faceG, 1.8, 0.5, 0.3, new THREE.MeshBasicMaterial({ color: 0x330000 }), -1.2, 0.6, 0.5); // sockets
    BX(faceG, 1.8, 0.5, 0.3, new THREE.MeshBasicMaterial({ color: 0x330000 }), 1.2, 0.6, 0.5);
    SPH(faceG, 0.3, glowM, -1.2, 0.6, 0.6, 8, 8);                 // pinprick eyes
    SPH(faceG, 0.3, glowM, 1.2, 0.6, 0.6, 8, 8);
    BX(faceG, 3.4, 1.0, 0.7, boneW, 0, -1.8, 0);                  // jaw plate
    for (let t = -3; t <= 3; t++) BX(faceG, 0.2, 0.5, 0.2, M(0x555555, { r: 0.5 }), t * 0.4, -1.2, 0.45);
    core = angelCoreMesh(1.4); core.position.set(0, 8.6, 2.6); g.add(core); // core glimpsed under mask
    const cglow = glowSprite(0xff3344, 7, 0.7); cglow.position.set(0, 8.6, 3.2); g.add(cglow);
    angelAtField(g, S, meta.glow, 8);
  } else if (meta.key === 'arael') {
    // Being of light: robed seed, feathered wing array, burning halo
    const robeM = M(0xf0e8d8, { r: 0.5, m: 0.1, e: 0xffeeaa, ei: 0.35 });
    CYL(g, 1.2, 2.6, 7.0, robeM, 0, H - 1, 0, 0, 0, 0, 10);        // luminous robe cone
    SPH(g, 1.3, robeM, 0, H + 3.2, 0, 12, 10);                    // head
    BX(g, 1.1, 0.28, 0.2, glowM, 0, H + 3.4, 1.15);               // visor of light
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.3, 10, 30), glowM);
    halo.position.y = H + 5.6; halo.rotation.x = Math.PI / 2; g.add(halo);
    const hglow = glowSprite(0xffffaa, 10); hglow.position.y = H + 5.6; g.add(hglow);
    const fmat = new THREE.MeshBasicMaterial({ map: featherTex(), transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    for (let ringI = 0; ringI < 2; ringI++) {                     // two wing rings, 6 + 6
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + ringI * 0.5;
        const wing = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 11), fmat);
        wing.position.set(Math.cos(a) * (5.5 + ringI * 2.5), H + (ringI ? -3 : 1), Math.sin(a) * (5.5 + ringI * 2.5));
        wing.lookAt(wing.position.x * 2, H + 6, wing.position.z * 2);
        wing.rotateX(0.5); g.add(wing);
        if (!g.userData.wings) g.userData.wings = [];
        g.userData.wings.push({ m: wing, base: wing.rotation.z, off: a });
      }
    }
    core = angelCoreMesh(1.1); core.position.set(0, H - 1, 1.8); g.add(core);
    const aura = glowSprite(0xfff2bb, 26, 0.5); aura.position.y = H; g.add(aura);
    angelAtField(g, S, meta.glow, H);
  } else if (meta.key === 'tabris') {
    // Kaworu: silver-haired boy, grey plugsuit, vast white AT wings
    const suitM = M(0x232838, { r: 0.5, m: 0.3 });                // dark navy plugsuit
    const trimM = M(0x0E1014, { r: 0.5, m: 0.3 });
    const skinM = M(0xf0d8c4, { r: 0.6, m: 0 });
    BX(g, 1.5, 2.6, 1.1, trimM, -0.85, 1.3, 0);                   // legs
    BX(g, 1.5, 2.6, 1.1, trimM, 0.85, 1.3, 0);
    BX(g, 1.1, 0.7, 1.6, suitM, -0.85, 0.35, 0.2);                // boots
    BX(g, 1.1, 0.7, 1.6, suitM, 0.85, 0.35, 0.2);
    BX(g, 3.0, 1.6, 1.6, suitM, 0, 3.4, 0);                       // hips
    BX(g, 2.6, 3.4, 1.7, suitM, 0, 5.9, 0);                       // torso
    BX(g, 2.7, 0.5, 1.8, trimM, 0, 4.6, 0);                       // plugsuit band
    BX(g, 0.5, 2.2, 0.3, M(0xaa2222, { r: 0.5 }), 0, 6.0, 0.9);    // red chest stripe
    BX(g, 2.8, 1.2, 1.9, suitM, 0, 8.0, 0);                       // shoulders/chest
    for (const s of [-1, 1]) {
      BX(g, 0.9, 3.0, 1.0, suitM, s * 1.9, 6.4, 0);               // slim arms
      BX(g, 0.8, 0.9, 0.9, skinM, s * 1.9, 4.6, 0);               // hands
    }
    SPH(g, 0.95, skinM, 0, 9.6, 0, 14, 12);                       // face
    BX(g, 0.42, 0.22, 0.12, new THREE.MeshBasicMaterial({ color: 0xcc2222 }), -0.35, 9.65, 0.88); // red eyes
    BX(g, 0.42, 0.22, 0.12, new THREE.MeshBasicMaterial({ color: 0xcc2222 }), 0.35, 9.65, 0.88);
    const hair = SPH(g, 1.05, M(0xb8bcc4, { r: 0.6 }), 0, 9.85, -0.25, 14, 12); // silver hair mass
    hair.scale.set(1, 1.05, 1);
    BX(g, 1.7, 2.2, 0.8, M(0xb8bcc4, { r: 0.6 }), 0, 8.6, -0.8);  // hair falling down back
    BX(g, 2.1, 0.5, 1.6, M(0xE8E8E8, { r: 0.5 }), 0, 8.75, 0);     // white plugsuit collar
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.18, 8, 26), glowM);
    halo.position.y = 11.2; halo.rotation.x = Math.PI / 2; g.add(halo);
    const fmat = new THREE.MeshBasicMaterial({ map: featherTex(), transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    g.userData.wings = [];
    for (const s of [-1, 1]) {                                    // vast AT wings
      for (let fI = 0; fI < 3; fI++) {
        const wing = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 13 - fI * 2), fmat);
        wing.position.set(s * (4.5 + fI * 1.6), 7.5 - fI * 0.6, -2.5 - fI);
        wing.rotation.set(0.15, s * (0.5 + fI * 0.25), s * -0.35);
        g.add(wing); g.userData.wings.push({ m: wing, base: wing.rotation.z, off: s * fI });
      }
    }
    core = angelCoreMesh(0.8); core.position.set(0, 6.4, 1.0); g.add(core);
    for (let rI = 0; rI < 2; rI++) {                              // AT rings at feet
      const r = new THREE.Mesh(new THREE.TorusGeometry(3 + rI * 1.5, 0.18, 8, 30),
        new THREE.MeshBasicMaterial({ color: meta.glow, transparent: true, opacity: 0.7 }));
      r.position.y = 0.4 + rI * 0.5; r.rotation.x = Math.PI / 2; g.add(r);
    }
    const aura = glowSprite(0xff8888, 14, 0.35); aura.position.y = 6; g.add(aura);
    angelAtField(g, S, meta.glow, 6);
  } else {
    // fallback (unused) — keep simple humanoid
    BX(g, 4, 6, 3, flesh, 0, 9, 0);
    core = angelCoreMesh(1.2); core.position.set(0, 9, 1.9); g.add(core);
    angelAtField(g, S, meta.glow);
  }
  angelTag(g, meta);
  return { group: g, core };
}

/* ---------------- FX ---------------- */
function spawnParticles(pos, color, n = 24, spd = 18, life = 0.7, size = 0.7) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(size * rand(0.5, 1.4), 6, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true }));
    m.position.copy(pos);
    const v = new THREE.Vector3(rand(-1, 1), rand(0, 1.4), rand(-1, 1)).normalize().multiplyScalar(rand(spd * 0.4, spd));
    particles.push({ m, v, life, max: life }); scene.add(m);
  }
}
function spawnTracer(a, b, color = 0x88ffaa) {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true }));
  tracers.push({ m: l, life: 0.12, max: 0.12 }); scene.add(l);
}
function fireProjectile(from, dir, { speed = 55, dmg = 30, color = 0xff5533, size = 0.9, enemy = true, arc = 0, homing = 0 } = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 10),
    new THREE.MeshBasicMaterial({ color }));
  const glow = new THREE.PointLight(color, 1.5, 30); m.add(glow);
  m.position.copy(from);
  projectiles.push({ m, v: dir.clone().normalize().multiplyScalar(speed), dmg, enemy, life: 5, arc, homing });
  scene.add(m);
}
function fireBeam(from, to, { dmg = 40, color = 0xffee88, width = 1.2, life = 0.5, enemy = true } = {}) {
  const len = from.distanceTo(to);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(width, width, len, 8, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }));
  m.position.copy(from).lerp(to, 0.5);
  m.lookAt(to); m.rotateX(Math.PI / 2);
  beams.push({ m, life, max: life, dmg, enemy, from: from.clone(), to: to.clone(), tick: 0 });
  scene.add(m);
  spawnParticles(to, color, 10, 14, 0.4, 0.8);
}
function explode(pos, color = 0xff6600, big = 1) {
  spawnParticles(pos, color, Math.floor(30 * big), 26 * big, 0.8, 1.0);
  spawnParticles(pos, 0xffffff, Math.floor(12 * big), 16 * big, 0.4, 0.8);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(2 * big, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
  flash.position.copy(pos); scene.add(flash);
  tracers.push({ m: flash, life: 0.25, max: 0.25, grow: 6 * big });
  SFX.boom(); shake = Math.min(1.4, shake + 0.5 * big);
}
function msg(t, ms = 1800) {
  const el = $('hud-msg'); el.textContent = t; el.style.opacity = 1;
  clearTimeout(msg._t); msg._t = setTimeout(() => el.style.opacity = 0, ms);
}
function dmgFlash() { const v = $('dmg-vignette'); v.classList.add('hit'); setTimeout(() => v.classList.remove('hit'), 160); }

/* ---------------- PLAYER ACTIONS ---------------- */
function playerPos() { return player.group.position; }
function angelPos() { return angelGroup.position; }

function doPunch() {
  if (G.punchCd > 0 || G.phase !== 'combat') return;
  const eva = EVAS[G.evaIndex];
  G.punchCd = eva.id === 2 ? 0.42 : 0.6;
  punchArmT = 1; SFX.punch();
  playerParts.armR.rotation.x = -2.2;
  setTimeout(() => { if (playerParts.armR) playerParts.armR.rotation.x = 0; }, 220);
  const d = playerPos().distanceTo(angelPos());
  const range = 13;
  if (d < range) {
    let dmg = eva.punch * rand(0.9, 1.15) * (G.berserkT > 0 ? 2 : 1);
    // AT neutralize: full damage only if player AT active near angel, else reduced
    const neutralized = G.atActive && d < 26;
    if (!neutralized) dmg *= 0.35;
    // core crit if aiming at core height (random 25%)
    const crit = Math.random() < 0.25;
    if (crit) dmg *= 1.6;
    hurtAngel(dmg, crit ? 'CORE CRITICAL!' : (neutralized ? 'AT NEUTRALIZED!' : 'PUNCH (AT BLOCKED!)'));
    const dir = angelPos().clone().sub(playerPos()).setY(0).normalize();
    angelGroup.position.add(dir.multiplyScalar(2.2));
    spawnParticles(angelPos().clone().add(new THREE.Vector3(0, 9, 0)), 0xffcc66, 16, 20, 0.5, 0.8);
    shake = Math.min(1, shake + 0.3);
    G.sync = clamp(G.sync + 1.5, 0, 100);
  } else {
    // whiff: air gust
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(player.group.quaternion);
    spawnTracer(playerPos().clone().add(new THREE.Vector3(0, 7, 0)), playerPos().clone().add(new THREE.Vector3(0, 7, 0)).add(fwd.multiplyScalar(9)), 0xffffff);
  }
}

function doRoar() {
  if (G.roarCd > 0 || G.phase !== 'combat') return;
  const eva = EVAS[G.evaIndex];
  G.roarCd = 18; SFX.roar();
  msg('🐲 EVA ROARS — "GYAAAH!!"');
  playerParts.head.rotation.x = -0.6;
  setTimeout(() => { if (playerParts.head) playerParts.head.rotation.x = 0; }, 900);
  // shockwave ring
  if (roarRing) scene.remove(roarRing);
  roarRing = new THREE.Mesh(new THREE.TorusGeometry(2, 1.2, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.9 }));
  roarRing.rotation.x = Math.PI / 2; roarRing.position.copy(playerPos()).y = 2; scene.add(roarRing);
  roarRing.userData.t = 0;
  const d = playerPos().distanceTo(angelPos());
  if (d < 34) {
    let dmg = eva.roarDmg * (G.berserkT > 0 ? 1.5 : 1);
    hurtAngel(dmg, 'ROAR SHOCK!');
    angelState.stun = 3;
  }
  spawnParticles(playerPos().clone().add(new THREE.Vector3(0, 12, 0)), 0xffaa00, 40, 30, 0.9, 1.1);
  shake = Math.min(1.4, shake + 0.6);
  G.sync = clamp(G.sync + 6, 0, 100);
  // berserk trigger at low HP
  if (G.hp < G.maxHp * 0.35 && G.evaIndex === 1) {
    G.berserkT = 10; $('berserk-banner').classList.remove('hidden');
    msg('⚡ EVA-01 BERSERK — UNCHAINED! 2x DAMAGE ⚡', 2500);
    setTimeout(() => $('berserk-banner').classList.add('hidden'), 10000);
  }
}

function tryPickup() {
  if (G.hasGun || G.phase !== 'combat') return;
  for (const s of stations) {
    const d = Math.hypot(playerPos().x - s.x, playerPos().z - s.z);
    if (d < 9 && !s.used) {
      s.used = true; s.rifle.visible = false;
      G.hasGun = true; G.ammo = 24;
      player.group.userData.gun.visible = true;
      SFX.pickup(); msg('🔫 PALLET RIFLE ACQUIRED — [F/CLICK] TO FIRE (24 RDS)');
      $('has-gun').textContent = 'EQUIPPED';
      return;
    }
  }
  msg('NO WEAPON STATION IN RANGE — FIND GREEN BEACON', 1500);
}

function doShoot() {
  if (!G.hasGun || G.ammo <= 0 || G.shootCd > 0 || G.phase !== 'combat') return;
  G.shootCd = 0.22; G.ammo--; SFX.shoot(); muzzleT = 1;
  const origin = playerPos().clone().add(new THREE.Vector3(0, 8, 0));
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(player.group.quaternion);
  fwd.y += 0.02; fwd.normalize();
  const end = origin.clone().add(fwd.clone().multiplyScalar(160));
  // raycast to angel (sphere approx at y 4..16)
  const toA = angelPos().clone().add(new THREE.Vector3(0, 9, 0)).sub(origin);
  const along = toA.dot(fwd);
  let hit = false;
  if (along > 0 && along < 170) {
    const perp = toA.clone().sub(fwd.clone().multiplyScalar(along)).length();
    if (perp < 7 * angelMeta.size + 2) {
      hit = true;
      let dmg = 24 * (G.berserkT > 0 ? 1.5 : 1);
      const neutralized = G.atActive && playerPos().distanceTo(angelPos()) < 30;
      if (!neutralized) dmg *= 0.4;
      hurtAngel(dmg, null);
      spawnParticles(angelPos().clone().add(new THREE.Vector3(0, 9, 0)), 0xffee88, 8, 12, 0.35, 0.6);
      end.copy(origin).add(fwd.multiplyScalar(along));
    }
  }
  spawnTracer(origin, end, 0xaaffee);
  spawnParticles(origin.clone().add(fwd.clone().multiplyScalar(3)), 0xffffaa, 3, 8, 0.15, 0.4);
  if (G.ammo <= 0) {
    G.hasGun = false; player.group.userData.gun.visible = false;
    msg('RIFLE DEPLETED — RETURN TO A STATION [E]', 2000); $('has-gun').textContent = '';
    // stations refill after a while
    setTimeout(() => stations.forEach(s => { s.used = false; s.rifle.visible = true; }), 8000);
  }
  updateHUD();
}

/* ---------------- DAMAGE ---------------- */
function hurtAngel(dmg, label) {
  if (G.over || G.phase !== 'combat') return;
  angelState.hp -= dmg;
  SFX.hit();
  if (label) msg(`${label}  -${Math.round(dmg)}`, 1200);
  if (angelState.split) { /* shared hp pool */ }
  updateHUD();
  if (angelState.hp <= 0) winWave();
}
function hurtPlayer(dmg, label) {
  if (G.over || G.phase !== 'combat') return;
  if (G.atActive && G.at > 0) { dmg *= 0.15; G.at -= dmg * 0.35; SFX.at(); }
  G.hp -= dmg; dmgFlash(); SFX.hit();
  G.sync = clamp(G.sync - dmg * 0.02, 5, 100);
  shake = Math.min(1.2, shake + 0.35);
  if (label) msg(label, 1300);
  updateHUD();
  if (G.hp <= 0) { G.hp = 0; loseWave(); }
}

/* ---------------- ANGEL AI ---------------- */
function angelAttack() {
  const key = angelMeta.key;
  const ap = angelPos().clone(); ap.y += 9;
  const pp = playerPos().clone(); pp.y += 7;
  const d = playerPos().distanceTo(angelPos());
  const dir = pp.clone().sub(ap).normalize();
  if (key === 'sachiel') {
    if (d < 16 || Math.random() < 0.5) { // leap stomp
      msg('⚠ SACHIEL: LEAP STOMP — MOVE!', 1400); SFX.alarm();
      setTimeout(() => {
        if (G.phase !== 'combat') return;
        explode(playerPos().clone(), 0xff4422, 1.2);
        if (playerPos().distanceTo(angelPos()) < 18) hurtPlayer(angelMeta.dmg, 'STOMPED!');
        angelGroup.position.copy(playerPos()).add(new THREE.Vector3(rand(-4, 4), 0, rand(-4, 4)));
      }, 800);
    } else { // AT blast cross
      msg('⚠ SACHIEL: AT BLAST!', 1200);
      fireBeam(ap, pp, { dmg: angelMeta.dmg * 0.7, color: 0xff5533, width: 1.4, enemy: true });
      setTimeout(() => { if (G.phase === 'combat' && playerPos().distanceTo(angelPos()) < 60) hurtPlayer(angelMeta.dmg * 0.7, 'AT BLAST HITS!'); }, 500);
    }
  } else if (key === 'shamshel') {
    msg('⚠ SHAMSHEL: WHIP LASH!', 1100);
    for (let i = 0; i < 3; i++)
      setTimeout(() => { if (G.phase !== 'combat') return; fireProjectile(ap, dir.clone().add(new THREE.Vector3(rand(-.15, .15), rand(-.05, .1), rand(-.15, .15))), { speed: 60, dmg: angelMeta.dmg * 0.45, color: 0xffaa00, size: 0.8, homing: 2 }); }, i * 180);
    if (d < 14) setTimeout(() => { if (G.phase === 'combat' && playerPos().distanceTo(angelPos()) < 16) { explode(pp, 0xffaa00, 1); hurtPlayer(angelMeta.dmg, 'HOVER SLAM!'); } }, 600);
  } else if (key === 'ramiel') {
    if (Math.random() < 0.6) {
      msg('⚠ RAMIEL: PARTICLE BEAM — STRAFE!', 1500); SFX.beam();
      const target = pp.clone();
      fireBeam(ap, target, { dmg: 0, color: 0x88ccff, width: 2.2, life: 1.4, enemy: true });
      let ticks = 0;
      const iv = setInterval(() => {
        if (G.phase !== 'combat' || ticks++ > 6) { clearInterval(iv); return; }
        const p = playerPos().clone(); p.y += 7;
        if (p.distanceTo(target) < 9) hurtPlayer(angelMeta.dmg * 0.28, 'DRILLED BY PARTICLE BEAM!');
        spawnParticles(p, 0x88ccff, 4, 10, 0.3, 0.6);
      }, 220);
    } else {
      msg('⚠ RAMIEL: SHARD RING!', 1200);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        fireProjectile(ap, new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), { speed: 30, dmg: 25, color: 0x88ccff, size: 0.9 });
      }
    }
  } else if (key === 'gaghiel') {
    if (Math.random() < 0.55) {
      msg('⚠ GAGHIEL CHARGES — DODGE!', 1300); SFX.alarm();
      const start = angelPos().clone(); const target = playerPos().clone();
      const ch = { t: 0, from: start, to: target };
      angelState.charge = ch;
      setTimeout(() => {
        if (G.phase !== 'combat') return;
        if (playerPos().distanceTo(angelPos()) < 12) { explode(pp, 0xffcc88, 1); hurtPlayer(angelMeta.dmg, 'BITTEN!'); }
      }, 700);
    } else {
      msg('⚠ GAGHIEL: SPOUT BURST!', 1100);
      for (let i = 0; i < 5; i++) setTimeout(() => { if (G.phase === 'combat') fireProjectile(ap, dir, { speed: 70, dmg: 22, color: 0x88ddff, size: 1.0 }); }, i * 120);
    }
  } else if (key === 'israfel') {
    msg('⚠ ISRAFEL: DUAL BEAM!', 1200);
    const l = ap.clone().add(new THREE.Vector3(-5, 0, 0)), r = ap.clone().add(new THREE.Vector3(5, 0, 0));
    fireBeam(l, pp, { dmg: angelMeta.dmg * 0.5, color: 0xaaffaa, width: 1.0, enemy: true });
    fireBeam(r, pp, { dmg: angelMeta.dmg * 0.5, color: 0xaaffaa, width: 1.0, enemy: true });
    setTimeout(() => { if (G.phase === 'combat' && !G.atActive) hurtPlayer(angelMeta.dmg, 'DUAL BEAM HITS!'); else if (G.phase === 'combat') hurtPlayer(angelMeta.dmg * 0.15, 'BEAM BLOCKED BY AT FIELD'); }, 500);
  } else if (key === 'sandalphon') {
    if (Math.random() < 0.5) {
      msg('⚠ SANDALPHON: MAGMA BREATH!', 1200);
      for (let i = 0; i < 6; i++) setTimeout(() => { if (G.phase === 'combat') fireProjectile(ap, dir.clone().add(new THREE.Vector3(rand(-.2, .2), rand(-.05, .15), rand(-.2, .2))), { speed: 48, dmg: 20, color: 0xff6600, size: 1.1 }); }, i * 130);
    } else {
      msg('⚠ SANDALPHON: METEOR HURL — WATCH SHADOWS!', 1400);
      for (let i = 0; i < 4; i++) {
        const t = playerPos().clone().add(new THREE.Vector3(rand(-14, 14), 0, rand(-14, 14)));
        const marker = new THREE.Mesh(new THREE.RingGeometry(2, 3, 20), new THREE.MeshBasicMaterial({ color: 0xff3300, side: THREE.DoubleSide, transparent: true }));
        marker.rotation.x = -Math.PI / 2; marker.position.set(t.x, 0.1, t.z); scene.add(marker);
        tracers.push({ m: marker, life: 1.1, max: 1.1 });
        setTimeout(() => { if (G.phase !== 'combat') return; explode(t.clone().setY(2), 0xff4400, 1.3); if (playerPos().distanceTo(t) < 9) hurtPlayer(angelMeta.dmg * 0.8, 'METEOR IMPACT!'); }, 1100);
      }
    }
  } else if (key === 'zeruel') {
    if (d < 20 && Math.random() < 0.6) {
      msg('⚠ ZERUEL: ARM SLASH!', 1000); SFX.beam();
      fireBeam(ap.clone().add(new THREE.Vector3(-4, 0, 0)), pp, { dmg: 0, color: 0xfff0a0, width: 0.8, life: 0.4, enemy: true });
      fireBeam(ap.clone().add(new THREE.Vector3(4, 0, 0)), pp, { dmg: 0, color: 0xfff0a0, width: 0.8, life: 0.4, enemy: true });
      setTimeout(() => { if (G.phase === 'combat' && playerPos().distanceTo(angelPos()) < 22) hurtPlayer(angelMeta.dmg, 'SLICED BY RIBBON ARMS!'); }, 350);
    } else {
      msg('⚠☢ ZERUEL: CROSS BLAST — RUN OR A.T. FIELD! ☢⚠', 1800); SFX.alarm();
      const target = playerPos().clone();
      setTimeout(() => {
        if (G.phase !== 'combat') return;
        explode(target.clone().setY(4), 0xffee88, 2.2);
        const cross1 = new THREE.Mesh(new THREE.BoxGeometry(4, 40, 4), new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.8 }));
        cross1.position.copy(target).setY(18); scene.add(cross1);
        const cross2 = new THREE.Mesh(new THREE.BoxGeometry(24, 4, 4), cross1.material.clone()); cross2.position.copy(target).setY(18); scene.add(cross2);
        tracers.push({ m: cross1, life: 0.8, max: 0.8, grow: 1 }); tracers.push({ m: cross2, life: 0.8, max: 0.8, grow: 1 });
        if (playerPos().distanceTo(target) < 26) hurtPlayer(angelMeta.dmg * 1.1, 'CROSS BLAST!');
      }, 1000);
    }
  } else if (key === 'arael') {
    if (Math.random() < 0.6) {
      msg('⚠ ARAEL: MIND RAY — SYNC ATTACK!', 1400);
      fireBeam(ap, pp, { dmg: 0, color: 0xffffaa, width: 1.6, life: 1.0, enemy: true });
      let t = 0; const iv = setInterval(() => {
        if (G.phase !== 'combat' || t++ > 4) { clearInterval(iv); return; }
        G.at = Math.max(0, G.at - 12); G.sync = clamp(G.sync - 3, 5, 100);
        hurtPlayer(12, 'MIND INVADED… SYNC FALLING');
        updateHUD();
      }, 400);
    } else {
      msg('⚠ ARAEL: HALO DIVE!', 1100);
      angelState.charge = { t: 0, from: angelPos().clone(), to: playerPos().clone() };
      setTimeout(() => { if (G.phase === 'combat' && playerPos().distanceTo(angelPos()) < 13) hurtPlayer(angelMeta.dmg, 'SPEARED BY LIGHT!'); }, 700);
    }
  } else { // tabris
    if (d < 20 && Math.random() < 0.5) {
      msg('⚠ TABRIS: A.T. CRUSH!', 1200);
      setTimeout(() => { if (G.phase !== 'combat') return; G.at = Math.max(0, G.at - 40); hurtPlayer(angelMeta.dmg * 0.9, 'FIELD CRUSHED THROUGH!'); updateHUD(); }, 600);
    } else {
      msg('⚠ TABRIS: MOONFALL PILLARS!', 1300);
      for (let i = 0; i < 5; i++) {
        const t = playerPos().clone().add(new THREE.Vector3(rand(-18, 18), 0, rand(-18, 18)));
        setTimeout(() => {
          if (G.phase !== 'combat') return;
          fireBeam(t.clone().setY(60), t.clone().setY(2), { dmg: 0, color: 0xff3333, width: 1.6, life: 0.5, enemy: true });
          setTimeout(() => { if (G.phase === 'combat' && playerPos().distanceTo(t) < 8) hurtPlayer(angelMeta.dmg * 0.7, 'STRUCK BY LIGHT!'); explode(t.clone().setY(2), 0xff3333, 1); }, 450);
        }, i * 260);
      }
    }
  }
}

function updateAngel(dt) {
  if (!angelGroup || G.phase !== 'combat') return;
  angelState.t += dt;
  if (angelState.stun > 0) { angelState.stun -= dt; angelGroup.position.y = Math.sin(angelState.t * 20) * 0.5; return; }
  const pp = playerPos(), ap = angelPos();
  const toP = pp.clone().sub(ap); toP.y = 0;
  const dist = toP.length();
  const dir = toP.clone().normalize();
  // face player
  angelGroup.rotation.y = Math.atan2(dir.x, dir.z);
  // charge override (gaghiel/arael dash)
  if (angelState.charge) {
    const c = angelState.charge; c.t += dt * 1.6;
    ap.lerpVectors(c.from, c.to, Math.min(1, c.t));
    spawnParticles(ap.clone().setY(4), angelMeta.glow, 2, 10, 0.3, 0.7);
    if (c.t >= 1) angelState.charge = null;
  } else {
    const want = angelMeta.keepDist;
    let mv = 0;
    if (dist > want + 4) mv = angelMeta.speed;
    else if (dist < want - 4) mv = -angelMeta.speed * 0.7;
    else { // strafe
      const s = Math.sin(angelState.t * 0.7) > 0 ? 1 : -1;
      ap.x += -dir.z * s * angelMeta.speed * 0.5 * dt;
      ap.z += dir.x * s * angelMeta.speed * 0.5 * dt;
    }
    ap.add(dir.multiplyScalar(mv * dt));
    // hover bob
    if (['shamshel', 'ramiel', 'arael'].includes(angelMeta.key)) ap.y = Math.sin(angelState.t * 1.5) * 2;
    else ap.y = 0;
  }
  // arena clamp + building pushout
  const r = Math.hypot(ap.x, ap.z);
  if (r > 150) ap.multiplyScalar(150 / r).setY(ap.y);
  pushOutOfBuildings(ap, 5);
  // spin bits
  if (angelGroup.userData.spin) angelGroup.userData.spin.rotation.y += dt * 2;
  if (angelGroup.userData.ring) angelGroup.userData.ring.rotation.z += dt * 1.5;
  const aud = angelGroup.userData;
  if (aud.inner) { aud.inner.rotation.y -= dt * 1.6; aud.inner.rotation.x += dt * 0.8; aud.inner.scale.setScalar(1 + Math.sin(angelState.t * 4) * 0.06); }
  if (aud.jaw) aud.jaw.rotation.x = -0.12 + (Math.sin(angelState.t * 1.4) * 0.5 + 0.5) * 0.45;
  for (let i = 0; i < 2; i++) {
    if (aud['whip' + i] && aud['whipBase' + i] !== undefined)
      aud['whip' + i].rotation.z = aud['whipBase' + i] + Math.sin(angelState.t * 2.1 + i * 2.4) * 0.28;
    if (aud['arm' + i] && aud['armBase' + i] !== undefined)
      aud['arm' + i].rotation.z = aud['armBase' + i] + Math.sin(angelState.t * 1.1 + i * 3.1) * 0.07;
  }
  if (aud.wings) for (const w of aud.wings) w.m.rotation.z = w.base + Math.sin(angelState.t * 2.2 + (w.off || 0)) * 0.16;
  if (angelGroup.userData.at) { angelGroup.userData.at.rotation.y += dt; angelGroup.userData.at.material.opacity = 0.1 + Math.sin(angelState.t * 3) * 0.05; }
  // attack timer
  angelState.atkT -= dt;
  if (angelState.atkT <= 0) { angelState.atkT = angelMeta.attackCd * rand(0.85, 1.2); angelAttack(); }
}

function pushOutOfBuildings(p, rad) {
  for (const c of cityColliders) {
    const dx = p.x - c.x, dz = p.z - c.z;
    const d = Math.hypot(dx, dz), min = c.r + rad;
    if (d < min && d > 0.01) { p.x = c.x + dx / d * min; p.z = c.z + dz / d * min; }
  }
}

/* ---------------- WAVE FLOW ---------------- */
function startWave(i) {
  G.wave = i; angelMeta = ANGELS[i];
  G.over = false;
  if (angelGroup) scene.remove(angelGroup);
  const built = buildAngel(angelMeta);
  angelGroup = built.group; angelCore = built.core;
  const a = rand(0, Math.PI * 2);
  angelGroup.position.set(Math.cos(a) * 70, 0, Math.sin(a) * 70);
  scene.add(angelGroup);
  angelState = { hp: angelMeta.hp, max: angelMeta.hp, t: 0, atkT: 2.5, mode: 'chase', split: null, stun: 0, charge: null };
  G.angelHp = angelState.hp; G.angelMax = angelState.max;
  // reset player pos, partial heal between waves
  playerPos().set(0, 0, 30); camYaw = Math.PI;
  G.hp = clamp(G.hp + G.maxHp * 0.25, 0, G.maxHp);
  G.at = G.atMax; G.hasGun = false; G.ammo = 0;
  player.group.userData.gun.visible = false;
  stations.forEach(s => { s.used = false; s.rifle.visible = true; });
  SFX.alarm();
  updateHUD();
}
function winWave() {
  if (G.over) return; G.over = true;
  explode(angelPos().clone().setY(9), 0xff3322, 2.5);
  explode(angelPos().clone().setY(5), 0xffee88, 2);
  SFX.boom();
  scene.remove(angelGroup); angelGroup = null;
  G.kills++;
  G.phase = 'result';
  document.exitPointerLock?.();
  setTimeout(() => showResult(true), 1600);
}
function loseWave() {
  if (G.over) return; G.over = true;
  explode(playerPos().clone().setY(8), 0xff3322, 2);
  G.phase = 'result';
  document.exitPointerLock?.();
  setTimeout(() => showResult(false), 1600);
}
function showResult(won) {
  $('screen-result').classList.add('active');
  $('hud').classList.add('hidden');
  $('result-title').textContent = won ? `✔ ${angelMeta.num} ANGEL ${angelMeta.name} DEFEATED` : `✖ EVA-${['00', '01', '02'][G.evaIndex]} DISABLED`;
  $('result-title').style.color = won ? '#39ff6a' : '#ff4444';
  $('result-body').innerHTML = won
    ? `S2 engine secured. Sync ratio ${G.sync.toFixed(1)}%. Hull ${Math.round(G.hp)}/${G.maxHp}.<br/>MAGI verdict: <b>VICTORY</b>. ${G.wave + 1 < ANGELS.length ? 'Next pattern detected in orbit…' : 'That was the last Angel.'}`
    : `Entry plug emergency ejection. The Angel still walks toward Tokyo-3.<br/>MAGI suggests: hold <b>K (A.T. Field)</b> to neutralize, punch the <b>red core</b>, grab the <b>rifle at green beacons</b>.`;
  $('btn-next').classList.toggle('hidden', !won);
  $('btn-next').textContent = G.wave + 1 < ANGELS.length ? `NEXT ANGEL ≫ (${ANGELS[G.wave + 1].num} ${ANGELS[G.wave + 1].name})` : 'FINISH ≫';
  $('btn-retry').classList.toggle('hidden', won);
}

/* ---------------- HUD ---------------- */
function updateHUD() {
  $('bar-hp').style.width = (100 * G.hp / G.maxHp) + '%';
  $('bar-at').style.width = (100 * G.at / G.atMax) + '%';
  $('bar-sync').style.width = G.sync + '%';
  $('bar-angel').style.width = angelState.max ? (100 * Math.max(0, angelState.hp) / angelState.max) + '%' : '0%';
  $('angel-name').textContent = `${angelMeta.num} ANGEL: ${angelMeta.name}`;
  $('wave-label').textContent = `WAVE ${G.wave + 1} / ${ANGELS.length}`;
  $('hud-eva-name').textContent = `${EVAS[G.evaIndex].name} — ${EVAS[G.evaIndex].pilot}`;
  $('ammo-count').textContent = G.hasGun ? G.ammo + ' rds' : '— go to green beacon + [E]';
}

/* ---------------- ENTRY SEQUENCE ---------------- */
const ENTRY_SCRIPT = [
  [400, 'NERV CAGE 7 — EVA RESTRAINTS RELEASED', 'ENTRY PLUG INSERTION'],
  [1400, '> Entry plug sliding into dorsal socket…', 'ENTRY PLUG INSERTION'],
  [2400, '> LCL filling plug… breathe normally, Pilot.', 'LCL FILLING — OXYGENATED LIQUID'],
  [3600, '> "The smell of blood…" — ignore it. That is LCL.', 'LCL FILLING'],
  [4700, '> Neural handshake… A10 nerve connection…', 'NEURAL HANDSHAKE'],
  [5800, '> SYNC RATIO climbing… 12%… 28%…', 'SYNC RATIO'],
  [7000, '> Harmonics normal. No contamination.', 'SYNC RATIO'],
  [8100, '> EVA soul resonance stable. You feel the giant breathe.', 'SOUL RESONANCE'],
  [9200, '> CATAPULT LOCKED. LAUNCH READY.', 'READY — LAUNCH!!'],
];
function runEntrySequence() {
  showScreen('screen-entry');
  $('btn-launch').classList.add('hidden');
  $('entry-log').innerHTML = ''; $('entry-bar').style.width = '0%';
  document.querySelector('#screen-entry .lcl-fill').style.height = '0%';
  const t0 = performance.now();
  const evaName = EVAS[G.evaIndex].name;
  // stage EVA in cage for the cutscene camera
  placePlayerForCutscene();
  const iv = setInterval(() => {
    const el = performance.now() - t0;
    const total = 9800;
    const frac = clamp(el / total, 0, 1);
    $('entry-bar').style.width = (frac * 100) + '%';
    document.querySelector('#screen-entry .lcl-fill').style.height = (frac * 55) + '%';
    const sync = frac * (G.evaIndex === 0 ? 58 : G.evaIndex === 1 ? 74 : 66) + Math.sin(el / 300) * 2;
    $('entry-sync').textContent = `SYNC RATIO: ${Math.max(0, sync).toFixed(2)}%`;
    G.sync = clamp(sync, 0, 100);
    for (const [t, line, phase] of ENTRY_SCRIPT) {
      if (el >= t && ![...$('entry-log').children].some(d => d.textContent === line)) {
        const d = document.createElement('div'); d.textContent = line; $('entry-log').appendChild(d);
        $('entry-phase').textContent = phase; tone(300 + Math.random() * 300, 0.1, 'square', 0.06);
      }
    }
    if (el >= total) {
      clearInterval(iv);
      $('entry-phase').textContent = `${evaName} — LAUNCH!!`;
      $('btn-launch').classList.remove('hidden');
      SFX.launch();
    }
  }, 100);
  runEntrySequence._iv = iv;
}
function showBrief() {
  showScreen('screen-brief');
  const m = ANGELS[G.wave];
  $('brief-body').innerHTML = `
    <div class="angel-big">${m.num} ANGEL: ${m.name}</div>
    <p>${m.brief}</p>
    <div style="color:#ff8080;letter-spacing:2px;margin:8px 0">— ANGEL ABILITIES —</div>
    ${m.abilities.map(a => `<div class="angel-ability">◆ ${a}</div>`).join('')}
    <p style="margin-top:10px;color:#8affc1">TIPS: hold <b>K</b> A.T. Field to neutralize & block · <b>J</b> punch the red core · <b>L</b> roar stuns · grab rifle at <b style="color:#0f8">green beacons [E]</b>, fire <b>F</b>.</p>`;
}

/* ---------------- SCREENS ---------------- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (id) $(id).classList.add('active');
}

/* ---------------- MAIN LOOP ---------------- */
const vel = new THREE.Vector3();
function updatePlayer(dt) {
  const eva = EVAS[G.evaIndex];
  const sp = eva.speed * (keys['shift'] ? 1.6 : 1) * (G.berserkT > 0 ? 1.25 : 1);
  const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const wish = new THREE.Vector3();
  if (keys['w']) wish.add(fwd); if (keys['s']) wish.sub(fwd);
  if (keys['d']) wish.add(right); if (keys['a']) wish.sub(right);
  if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(sp);
  vel.x += (wish.x - vel.x) * Math.min(1, dt * 8);
  vel.z += (wish.z - vel.z) * Math.min(1, dt * 8);
  // jump / gravity-lite (EVAs leap)
  if (keys[' '] && playerPos().y < 0.5) { vel.y = 16; tone(180, 0.2, 'sine', 0.1, 120); }
  vel.y -= 38 * dt;
  playerPos().add(new THREE.Vector3(vel.x * dt, vel.y * dt, vel.z * dt));
  if (playerPos().y < 0) { playerPos().y = 0; vel.y = 0; }
  const r = Math.hypot(playerPos().x, playerPos().z);
  if (r > 150) { playerPos().x *= 150 / r; playerPos().z *= 150 / r; }
  pushOutOfBuildings(playerPos(), 3);
  // face movement or camera
  if (wish.lengthSq() > 0.1) {
    const target = Math.atan2(wish.x, wish.z);
    let d = target - player.group.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    player.group.rotation.y += d * Math.min(1, dt * 10);
    walkPhase += dt * 10;
    const sw = Math.sin(walkPhase) * 0.5;
    playerParts.legL.rotation.x = sw; playerParts.legR.rotation.x = -sw;
    playerParts.armL.rotation.x = -sw * 0.7;
  } else {
    playerParts.legL.rotation.x *= 0.9; playerParts.legR.rotation.x *= 0.9;
  }
  // AT field
  const wantAT = !!keys['k'] && G.at > 1;
  G.atActive = wantAT;
  if (wantAT) G.at = Math.max(0, G.at - 22 * dt);
  else G.at = Math.min(G.atMax, G.at + eva.atRegen * dt);
  const sh = player.group.userData.shield;
  sh.material.opacity += ((wantAT ? 0.35 : 0) - sh.material.opacity) * Math.min(1, dt * 8);
  sh.rotation.y += dt * (wantAT ? 2.5 : 0.4);
  player.group.userData.gun.visible = G.hasGun;
  // cooldowns
  G.punchCd = Math.max(0, G.punchCd - dt);
  G.roarCd = Math.max(0, G.roarCd - dt);
  G.shootCd = Math.max(0, G.shootCd - dt);
  G.berserkT = Math.max(0, G.berserkT - dt);
  if (G.berserkT <= 0) $('berserk-banner').classList.add('hidden');
  // ability UI cooldowns
  $('ab-punch').classList.toggle('active', G.punchCd <= 0);
  $('ab-at').classList.toggle('active', G.atActive);
  $('ab-roar').classList.toggle('active', G.roarCd <= 0);
  $('ab-gun').classList.toggle('active', G.hasGun);
  document.querySelector('#ab-punch .cd').style.width = (100 * (1 - G.punchCd / 0.6)) + '%';
  document.querySelector('#ab-roar .cd').style.width = (100 * (1 - G.roarCd / 18)) + '%';
  // station prompt
  let nearStation = false;
  for (const s of stations) if (!s.used && Math.hypot(playerPos().x - s.x, playerPos().z - s.z) < 9) nearStation = true;
  if (nearStation && !G.hasGun) {
    if (!updatePlayer._p) { msg('PRESS [E] — TAKE PALLET RIFLE', 1500); updatePlayer._p = true; setTimeout(() => updatePlayer._p = false, 4000); }
  }
  updateHUDLite();
}
let hudT = 0;
function updateHUDLite() {
  hudT += 1;
  if (hudT % 6 !== 0) return;
  $('bar-hp').style.width = (100 * G.hp / G.maxHp) + '%';
  $('bar-at').style.width = (100 * G.at / G.atMax) + '%';
  $('bar-sync').style.width = G.sync + '%';
  $('bar-angel').style.width = angelState.max ? (100 * Math.max(0, angelState.hp) / angelState.max) + '%' : '0%';
  $('ammo-count').textContent = G.hasGun ? G.ammo + ' rds' : '— green beacon + [E]';
}

function updateCamera(dt) {
  const pp = playerPos();
  const dist = 34, h = 17;
  const cx = pp.x + Math.sin(camYaw) * dist;
  const cz = pp.z + Math.cos(camYaw) * dist;
  const cy = pp.y + h + camPitch * 18;
  const target = new THREE.Vector3(cx, cy, cz);
  camera.position.lerp(target, Math.min(1, dt * 6));
  const look = pp.clone().add(new THREE.Vector3(0, 9, 0)).add(new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw)).multiplyScalar(-14));
  if (shake > 0) {
    camera.position.x += rand(-1, 1) * shake; camera.position.y += rand(-1, 1) * shake;
    shake = Math.max(0, shake - dt * 2.2);
  }
  camera.lookAt(look);
}

function updateFx(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]; p.life -= dt;
    if (p.homing && p.enemy) {
      const t = playerPos().clone().setY(7).sub(p.m.position).normalize();
      p.v.lerp(t.multiplyScalar(p.v.length()), Math.min(1, dt * p.homing));
    }
    p.m.position.add(p.v.clone().multiplyScalar(dt));
    p.m.position.y += (p.arc || 0) * dt;
    let dead = p.life <= 0 || p.m.position.y < 0 || p.m.position.length() > 400;
    if (p.enemy) {
      if (p.m.position.distanceTo(playerPos().clone().setY(7)) < 4.5) {
        hurtPlayer(p.dmg, null); explode(p.m.position.clone(), 0xff6644, 0.6); dead = true;
      }
    } else {
      if (angelGroup && p.m.position.distanceTo(angelPos().clone().setY(9)) < 7) {
        hurtAngel(p.dmg, null); explode(p.m.position.clone(), 0xffee88, 0.6); dead = true;
      }
    }
    if (dead) { scene.remove(p.m); projectiles.splice(i, 1); }
  }
  for (let i = beams.length - 1; i >= 0; i--) {
    const b = beams[i]; b.life -= dt; b.tick += dt;
    b.m.material.opacity = Math.max(0, b.life / b.max) * 0.85;
    if (b.life <= 0) { scene.remove(b.m); beams.splice(i, 1); }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt;
    p.m.position.add(p.v.clone().multiplyScalar(dt)); p.v.y -= 20 * dt; p.v.multiplyScalar(0.98);
    p.m.material.opacity = Math.max(0, p.life / p.max);
    p.m.scale.setScalar(Math.max(0.01, p.life / p.max));
    if (p.life <= 0) { scene.remove(p.m); particles.splice(i, 1); }
  }
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt;
    if (t.m.material) t.m.material.opacity = Math.max(0, t.life / t.max);
    if (t.grow) t.m.scale.multiplyScalar(1 + dt * 8);
    if (t.life <= 0) { scene.remove(t.m); tracers.splice(i, 1); }
  }
  if (roarRing) {
    roarRing.userData.t += dt;
    const t = roarRing.userData.t;
    roarRing.scale.setScalar(1 + t * 14);
    roarRing.material.opacity = Math.max(0, 0.9 - t * 0.9);
    if (t > 1) { scene.remove(roarRing); roarRing = null; }
  }
  // station beacons pulse
  const tt = performance.now() / 500;
  for (const s of stations) s.beam.material.opacity = s.used ? 0.06 : 0.22 + Math.sin(tt) * 0.1;
}

function placePlayerForCutscene() {
  if (player) scene.remove(player.group);
  const eva = EVAS[G.evaIndex];
  player = buildEVA(eva); playerParts = player.parts;
  playerPos().set(0, 0, 0);
  scene.add(player.group);
}

/* cutscene camera orbit during entry */
let entryCamA = 0;
function updateEntryCam(dt) {
  entryCamA += dt * 0.5;
  const r = 30;
  camera.position.set(Math.cos(entryCamA) * r, 12 + Math.sin(entryCamA * 0.7) * 4, Math.sin(entryCamA) * r);
  camera.lookAt(0, 10, 0);
  // entry plug glow pulse
  if (playerParts) playerParts.head.rotation.y = Math.sin(entryCamA * 2) * 0.3;
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  if (G.phase === 'combat') {
    updatePlayer(dt);
    updateAngel(dt);
    updateCamera(dt);
    updateFx(dt);
    renderer.render(scene, camera);
  } else if (G.phase === 'entry') {
    updateEntryCam(dt);
    updateFx(dt);
    renderer.render(scene, camera);
  } else if (['brief', 'result', 'select', 'title'].includes(G.phase)) {
    // idle cinematic orbit over Tokyo-3
    const t = performance.now() / 1000;
    camera.position.set(Math.cos(t * 0.08) * 120, 55, Math.sin(t * 0.08) * 120);
    camera.lookAt(0, 10, 0);
    updateFx(dt);
    renderer.render(scene, camera);
  }
}

/* ---------------- INPUT ---------------- */
function bindInput() {
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys[k === ' ' ? ' ' : k] = true;
    if ([' ', 'arrowup', 'arrowdown'].includes(k)) e.preventDefault();
    if (G.phase !== 'combat') return;
    if (k === 'j') doPunch();
    if (k === 'l') doRoar();
    if (k === 'e') tryPickup();
    if (k === 'f') doShoot();
  });
  addEventListener('keyup', (e) => { keys[e.key.toLowerCase() === ' ' ? ' ' : e.key.toLowerCase()] = false; });
  addEventListener('mousemove', (e) => {
    if (G.phase !== 'combat') return;
    if (document.pointerLockElement) {
      camYaw -= e.movementX * 0.0026;
      camPitch = clamp(camPitch + e.movementY * 0.002, -0.2, 0.9);
    }
  });
  addEventListener('mousedown', (e) => {
    if (G.phase !== 'combat') return;
    if (!document.pointerLockElement) renderer.domElement.requestPointerLock?.();
    else if (e.button === 0) doShoot();
  });
  // touch fallback drag
  let drag = false, lx = 0;
  renderer.domElement.addEventListener('touchstart', () => drag = true);
  renderer.domElement.addEventListener('touchend', () => drag = false);
  renderer.domElement.addEventListener('touchmove', (e) => {
    if (!drag) return;
    const t = e.touches[0];
    if (lx) camYaw -= (t.clientX - lx) * 0.006;
    lx = t.clientX;
  });
}

/* ---------------- UI WIRING ---------------- */
function bindUI() {
  $('btn-start').onclick = () => { audio(); SFX.click(); G.phase = 'select'; showScreen('screen-select'); };
  document.querySelectorAll('.btn-select').forEach(b => b.onclick = () => {
    audio(); SFX.click();
    G.evaIndex = +b.dataset.eva;
    const eva = EVAS[G.evaIndex];
    G.maxHp = eva.hp; G.hp = eva.hp; G.atMax = eva.atMax; G.at = eva.atMax;
    G.wave = 0; G.kills = 0; G.startTime = Date.now();
    G.phase = 'entry';
    clearInterval(runEntrySequence._iv);
    runEntrySequence();
  });
  $('btn-skip-entry').onclick = () => { SFX.click(); clearInterval(runEntrySequence._iv); G.sync = 60; showBrief(); G.phase = 'brief'; };
  $('btn-launch').onclick = () => { SFX.launch(); showBrief(); G.phase = 'brief'; };
  $('btn-deploy').onclick = () => {
    audio(); SFX.click();
    showScreen(null); $('hud').classList.remove('hidden');
    G.phase = 'combat';
    renderer.domElement.requestPointerLock?.();
    startWave(G.wave);
    msg(`WAVE ${G.wave + 1}: ${angelMeta.num} ANGEL ${angelMeta.name} — NEUTRALIZE ITS AT FIELD [K]!`, 3000);
  };
  $('btn-next').onclick = () => {
    SFX.click();
    if (G.wave + 1 >= ANGELS.length) {
      $('screen-result').classList.remove('active');
      showClear();
    } else {
      $('screen-result').classList.remove('active');
      G.wave++;
      G.phase = 'brief'; showBrief();
    }
  };
  $('btn-retry').onclick = () => {
    SFX.click();
    $('screen-result').classList.remove('active');
    G.hp = G.maxHp; G.at = G.atMax; G.hasGun = false; G.ammo = 0;
    showScreen(null); $('hud').classList.remove('hidden');
    G.phase = 'combat'; startWave(G.wave);
  };
  $('btn-restart').onclick = () => { SFX.click(); location.reload(); };
}
function showClear() {
  G.phase = 'clear';
  $('hud').classList.add('hidden');
  $('screen-clear').classList.add('active');
  const mins = ((Date.now() - G.startTime) / 60000).toFixed(1);
  $('clear-stats').innerHTML = `UNIT: ${EVAS[G.evaIndex].name} (${EVAS[G.evaIndex].pilot})<br/>ANGELS DOWN: ${G.kills}/${ANGELS.length}<br/>TIME: ${mins} min · FINAL SYNC: ${G.sync.toFixed(1)}%`;
}

/* ---------------- BOOT ---------------- */
initThree();
placePlayerForCutscene();
bindInput();
bindUI();
G.phase = 'title';
loop();
// auto quality: hide loading
$('loading').style.display = 'none';
// expose for tests
window.__EVA_GAME = { G, startWave, doPunch, doRoar, tryPickup, doShoot, ANGELS, EVAS,
  get playerP() { return player.group.position; }, get angelP() { return angelGroup ? angelGroup.position : null; },
  get angelHP() { return angelState.hp; },
  aimAtAngel() { const d = angelPos().clone().sub(playerPos()); player.group.rotation.y = Math.atan2(d.x, d.z) + Math.PI; } };
