
import { Renderer, C } from './renderer.js';
import { Simulation } from './physics.js';
import { Quark, Lepton, NeutrinoOscillator } from './particles.js';
import { t, getLang, setLang } from './i18n.js';
import { renderModeButtons, updateInfo, applyLang } from './ui.js';

const canvas = document.getElementById('canvas');
const renderer = new Renderer(canvas, 'mid');
const sim = new Simulation(canvas);
sim.setClasses({ Quark, Lepton, NeutrinoOscillator });

const infoEl = document.getElementById('info');
const statsEl = document.getElementById('stats');
const actionBtn = document.getElementById('action');
const modeButtons = document.getElementById('mode-buttons');

let mode = 'proton';

function selectMode(m) {
  mode = m;
  sim.init(m);
  updateInfo(m, infoEl, statsEl, actionBtn);
}

// Language init
applyLang(getLang());
renderModeButtons(modeButtons, mode, selectMode);
selectMode('proton');

// UI wiring
document.getElementById('lang-toggle').addEventListener('click', () => {
  const next = getLang() === 'de' ? 'en' : 'de';
  applyLang(next);
  renderModeButtons(modeButtons, mode, selectMode);
  updateInfo(mode, infoEl, statsEl, actionBtn);
});
document.getElementById('play-toggle').addEventListener('click', (e) => {
  sim.playing = !sim.playing;
  e.currentTarget.textContent = sim.playing ? '⏸' : '▶';
});
document.getElementById('reset').addEventListener('click', () => selectMode(mode));
document.getElementById('speed').addEventListener('input', (e) => {
  sim.speed = parseFloat(e.target.value);
  document.getElementById('speed-val').textContent = sim.speed.toFixed(1) + '×';
});
document.getElementById('force').addEventListener('input', (e) => {
  sim.force = parseFloat(e.target.value);
});
document.getElementById('quality').addEventListener('change', (e) => {
  renderer.setQuality(e.target.value);
});
actionBtn.addEventListener('click', () => sim.emitGluon());

// Draw helpers
function drawConf(ctx, cx, cy, mode, isOverlay) {
  const quarks = sim.particles.filter((p) => p.isQuark);
  if (quarks.length < 2) return;

  if (!isOverlay) {
    const r = mode === 'pentaquark' ? 170 : mode === 'meson' ? 120 : 140;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30,41,59,0.2)';
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.lineWidth = 4;
  for (let i = 0; i < quarks.length; i++) {
    for (let j = i + 1; j < quarks.length; j++) {
      const a = quarks[i], b = quarks[j];
      const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, C[a.color]);
      g.addColorStop(1, C[b.color]);
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = g;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHiggsField(ctx, cx, cy, time) {
  ctx.save();
  const maxR = Math.max(renderer.width, renderer.height) * 0.6;
  for (let r = 30; r < maxR; r += 35) {
    const phase = (time * 0.03 + r * 0.04) % (Math.PI * 2);
    const a = 0.08 + Math.sin(phase) * 0.06;
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.yellow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Main loop — endless animation
function loop() {
  if (sim.playing) {
    sim.step();
    sim.draw(renderer, drawConf, drawHiggsField);
  }
  requestAnimationFrame(loop);
}
loop();
