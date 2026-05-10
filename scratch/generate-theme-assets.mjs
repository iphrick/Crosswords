// scratch/generate-theme-assets.mjs
// Run: node scratch/generate-theme-assets.mjs
// Generates PNG decoration assets for the 5 new themes using SVG + Canvas API (no external deps)

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(process.cwd(), 'public', 'themes');

// ── helpers ──────────────────────────────────────────────────────────────────
function save(canvas, name) {
  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(OUT, name), buf);
  console.log(`✓ ${name}`);
}

function makeCanvas(size = 1024) {
  const c = createCanvas(size, size);
  return { c, ctx: c.getContext('2d') };
}

// ── 1. STEAMPUNK GEARS ────────────────────────────────────────────────────────
function drawSteampunk() {
  const { c, ctx } = makeCanvas(1024);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);

  function drawGear(x, y, r, teeth, color) {
    const toothH = r * 0.28;
    const innerR = r * 0.55;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i / (teeth * 2)) * Math.PI * 2;
      const rad = i % 2 === 0 ? r + toothH : r;
      ctx.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // Hub hole
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    // Inner ring detail
    ctx.beginPath();
    ctx.arc(x, y, innerR * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  const gears = [
    { x: 512, y: 512, r: 240, teeth: 32, color: '#b87333' },
    { x: 270,  y: 370, r: 130, teeth: 18, color: '#cd853f' },
    { x: 760,  y: 370, r: 130, teeth: 18, color: '#cd853f' },
    { x: 220,  y: 650, r:  90, teeth: 12, color: '#8b6914' },
    { x: 800,  y: 650, r:  90, teeth: 12, color: '#8b6914' },
    { x: 512,  y: 190, r:  70, teeth: 10, color: '#d4a256' },
  ];

  gears.forEach(g => drawGear(g.x, g.y, g.r, g.teeth, g.color));

  // Highlight glow
  const grd = ctx.createRadialGradient(512, 512, 0, 512, 512, 300);
  grd.addColorStop(0, 'rgba(205,133,63,0.25)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 1024, 1024);

  save(c, 'steampunk-gears.png');
}

// ── 2. OCEAN WAVES ────────────────────────────────────────────────────────────
function drawOcean() {
  const { c, ctx } = makeCanvas(1024);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);

  function wave(yBase, amplitude, freq, color, alpha) {
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= 1024; x += 4) {
      const y = yBase + Math.sin((x * freq) + yBase * 0.01) * amplitude
                       + Math.sin((x * freq * 2.3) + 1) * (amplitude * 0.4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1024, 1024);
    ctx.lineTo(0, 1024);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  wave(600, 80, 0.008, '#0d2a42', 1.0);
  wave(520, 70, 0.010, '#0a3d62', 0.9);
  wave(440, 60, 0.012, '#1a5276', 0.85);
  wave(360, 55, 0.009, '#1f618d', 0.8);
  wave(280, 50, 0.014, '#2980b9', 0.7);
  wave(200, 45, 0.011, '#48c9b0', 0.5);

  // Foam highlights
  ctx.globalAlpha = 0.3;
  [280, 360, 440, 520].forEach(y => {
    const grd = ctx.createLinearGradient(0, y - 15, 0, y + 15);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, y - 15, 1024, 30);
  });
  ctx.globalAlpha = 1;

  // Center glow
  const grd2 = ctx.createRadialGradient(512, 512, 0, 512, 512, 400);
  grd2.addColorStop(0, 'rgba(72,201,176,0.2)');
  grd2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd2;
  ctx.fillRect(0, 0, 1024, 1024);

  save(c, 'ocean-waves.png');
}

// ── 3. SAKURA BRANCH ─────────────────────────────────────────────────────────
function drawSakura() {
  const { c, ctx } = makeCanvas(1024);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);

  function branch(x1, y1, angle, length, depth) {
    if (depth === 0 || length < 8) return;
    const x2 = x1 + Math.cos(angle) * length;
    const y2 = y1 + Math.sin(angle) * length;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(${80 + depth*10}, ${40 + depth*5}, ${50 + depth*5}, 0.9)`;
    ctx.lineWidth = depth * 1.5;
    ctx.stroke();
    // Blossoms at tips
    if (depth <= 2 && length < 40) {
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        const pr = 8 + Math.random() * 8;
        const px = x2 + Math.cos(pa) * pr;
        const py = y2 + Math.sin(pa) * pr;
        ctx.beginPath();
        ctx.ellipse(px, py, 7, 5, pa, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${220 + Math.random()*35}, ${140 + Math.random()*30}, ${160 + Math.random()*40}, 0.85)`;
        ctx.fill();
      }
    }
    const spread = 0.4 + (5 - depth) * 0.05;
    branch(x2, y2, angle - spread, length * 0.72, depth - 1);
    branch(x2, y2, angle + spread, length * 0.72, depth - 1);
    if (depth > 2) branch(x2, y2, angle + (Math.random() - 0.5) * 0.3, length * 0.6, depth - 2);
  }

  branch(200, 900, -Math.PI / 3.5, 200, 8);
  branch(700, 950, -Math.PI / 2.5, 180, 7);
  branch(512, 1020, -Math.PI / 2, 220, 7);

  // Falling petals
  for (let i = 0; i < 60; i++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    ctx.beginPath();
    ctx.ellipse(px, py, 6 + Math.random()*5, 4 + Math.random()*3, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fillStyle = `rgba(230,${140 + Math.random()*50},${160 + Math.random()*50},${0.4 + Math.random()*0.4})`;
    ctx.fill();
  }

  // Pink glow
  const grd = ctx.createRadialGradient(512, 400, 0, 512, 400, 500);
  grd.addColorStop(0, 'rgba(248,164,200,0.12)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 1024, 1024);

  save(c, 'sakura-branch.png');
}

// ── 4. NEON NOIR CITY ─────────────────────────────────────────────────────────
function drawNeonNoir() {
  const { c, ctx } = makeCanvas(1024);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);

  // Buildings silhouette
  const buildings = [
    [0, 600, 80, 1024], [60, 500, 100, 1024], [140, 450, 80, 1024],
    [200, 380, 120, 1024], [300, 420, 90, 1024], [370, 340, 100, 1024],
    [450, 400, 80, 1024], [510, 300, 130, 1024], [620, 360, 90, 1024],
    [690, 430, 110, 1024], [780, 370, 90, 1024], [850, 450, 80, 1024],
    [910, 400, 114, 1024], [950, 480, 74, 1024],
  ];
  buildings.forEach(([x, y, w, h]) => {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x, y, w, h - y);
    // Windows
    for (let wy = y + 20; wy < 700; wy += 30) {
      for (let wx = x + 8; wx < x + w - 8; wx += 18) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = Math.random() > 0.6
            ? `rgba(191,90,242,${0.6 + Math.random()*0.4})`
            : `rgba(48,209,88,${0.4 + Math.random()*0.4})`;
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
  });

  // Neon signs glow
  [[200, 380, '#bf5af2'], [510, 300, '#30d158'], [780, 370, '#bf5af2']].forEach(([x, y, col]) => {
    const grd = ctx.createRadialGradient(x + 60, y, 0, x + 60, y, 120);
    grd.addColorStop(0, col + '55');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 60, y - 60, 240, 200);
  });

  // Ground reflection
  const refGrd = ctx.createLinearGradient(0, 700, 0, 1024);
  refGrd.addColorStop(0, 'rgba(191,90,242,0.15)');
  refGrd.addColorStop(0.5, 'rgba(48,209,88,0.08)');
  refGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = refGrd;
  ctx.fillRect(0, 700, 1024, 324);

  // Moon
  ctx.beginPath();
  ctx.arc(850, 150, 60, 0, Math.PI * 2);
  const moonGrd = ctx.createRadialGradient(850, 150, 0, 850, 150, 60);
  moonGrd.addColorStop(0, 'rgba(191,90,242,0.7)');
  moonGrd.addColorStop(1, 'rgba(191,90,242,0)');
  ctx.fillStyle = moonGrd;
  ctx.fill();

  save(c, 'neon-noir-city.png');
}

// ── 5. TERRACOTA POTTERY ──────────────────────────────────────────────────────
function drawTerracota() {
  const { c, ctx } = makeCanvas(1024);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);

  function amphora(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    const bodyGrd = ctx.createLinearGradient(-80, -200, 80, 200);
    bodyGrd.addColorStop(0, '#a0522d');
    bodyGrd.addColorStop(0.3, '#e07a3a');
    bodyGrd.addColorStop(0.6, '#cd6030');
    bodyGrd.addColorStop(1, '#7a3a18');
    ctx.beginPath();
    ctx.moveTo(0, -200);
    ctx.bezierCurveTo(100, -150, 120, -50, 90, 50);
    ctx.bezierCurveTo(110, 100, 70, 160, 30, 180);
    ctx.lineTo(-30, 180);
    ctx.bezierCurveTo(-70, 160, -110, 100, -90, 50);
    ctx.bezierCurveTo(-120, -50, -100, -150, 0, -200);
    ctx.fillStyle = bodyGrd;
    ctx.fill();
    ctx.strokeStyle = '#8b3a18';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Neck
    ctx.beginPath();
    ctx.ellipse(0, -200, 25, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#cd6030';
    ctx.fill();
    // Geometric pattern band
    ctx.strokeStyle = '#f5e6d0';
    ctx.lineWidth = 2;
    for (let i = -80; i <= 80; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, -20);
      ctx.lineTo(i + 10, 10);
      ctx.lineTo(i + 20, -20);
      ctx.stroke();
    }
    // Handles
    ctx.beginPath();
    ctx.ellipse(-95, -60, 18, 50, -0.3, 0, Math.PI * 2);
    ctx.strokeStyle = '#cd6030';
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(95, -60, 18, 50, 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  amphora(512, 580, 1.0);
  amphora(200, 700, 0.65);
  amphora(820, 720, 0.6);

  // Warm glow
  const grd = ctx.createRadialGradient(512, 512, 0, 512, 512, 450);
  grd.addColorStop(0, 'rgba(224,122,58,0.18)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 1024, 1024);

  save(c, 'terracota-pottery.png');
}

// ── Run all ───────────────────────────────────────────────────────────────────
try {
  drawSteampunk();
  drawOcean();
  drawSakura();
  drawNeonNoir();
  drawTerracota();
  console.log('\n✅ All theme assets generated in public/themes/');
} catch (e) {
  console.error('Error:', e.message);
  console.log('\n⚠️  Install canvas first: npm install canvas');
}
