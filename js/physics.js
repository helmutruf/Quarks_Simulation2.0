import { Quark, Gluon } from './particles.js';
import { RGB } from './renderer.js';

export class Simulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.mode = 'proton';
    this.speed = 1;
    this.force = 0.08;
    this.playing = true;
    this.time = 0;
    this.particles = [];
    this.gluons = [];
    this.bosons = [];
    this.bursts = [];
    this.floats = [];
    this.higgs = null;
    this.lock = false;
  }

  init(mode) {
    this.mode = mode;
    this.particles = [];
    this.gluons = [];
    this.bosons = [];
    this.bursts = [];
    this.floats = [];
    this.higgs = null;
    this.lock = false;
    const cx = this.canvas.width / 2 / this.canvas.dpr;
    const cy = this.canvas.height / 2 / this.canvas.dpr;

    const { Quark: Q, Lepton, NeutrinoOscillator } = this._cls;
    switch (mode) {
      case 'proton':
      case 'gluon':
        this.particles.push(new Q(cx - 50, cy + 30, 'u', 'red'));
        this.particles.push(new Q(cx + 50, cy + 30, 'u', 'green'));
        this.particles.push(new Q(cx, cy - 60, 'd', 'blue'));
        break;
      case 'neutron':
      case 'decay':
        this.particles.push(new Q(cx - 50, cy + 30, 'u', 'red'));
        this.particles.push(new Q(cx + 50, cy + 30, 'd', 'green'));
        this.particles.push(new Q(cx, cy - 60, 'd', 'blue'));
        break;
      case 'betaplus':
        this.particles.push(new Q(cx - 50, cy + 30, 'u', 'red'));
        this.particles.push(new Q(cx + 50, cy + 30, 'u', 'green'));
        this.particles.push(new Q(cx, cy - 60, 'd', 'blue'));
        break;
      case 'meson':
        this.particles.push(new Q(cx - 60, cy, 'u', 'blue'));
        this.particles.push(new Q(cx + 60, cy, 'd', 'pink', 28, true));
        break;
      case 'muon':
        this.particles.push(new Lepton(cx, cy - 80, 0, 0, 'muon'));
        break;
      case 'zexchange':
        this.particles.push(new Lepton(cx - 80, cy, 0, 0, 'neutrino_mu'));
        this.particles.push(new Lepton(cx + 80, cy, 0, 0, 'electron'));
        break;
      case 'topquark':
        this.particles.push(new Q(cx, cy - 40, 't', 'fuchsia', 36));
        break;
      case 'pentaquark':
        this.particles.push(new Q(cx - 70, cy - 30, 'u', 'red'));
        this.particles.push(new Q(cx + 70, cy - 30, 'u', 'green'));
        this.particles.push(new Q(cx - 40, cy + 50, 'd', 'blue'));
        this.particles.push(new Q(cx + 40, cy + 50, 'd', 'yellow'));
        this.particles.push(new Q(cx, cy - 10, 's', 'magenta', 24, true));
        break;
      case 'higgs':
        this.particles.push(new Q(cx - 70, cy - 40, 'u', 'red'));
        this.particles.push(new Q(cx + 70, cy - 40, 'u', 'green'));
        this.particles.push(new Q(cx, cy + 50, 'd', 'blue'));
        break;
      case 'neutrino':
        this.particles.push(new NeutrinoOscillator(cx, cy));
        break;
    }
  }

  setClasses(classes) { this._cls = classes; }

  emitGluon() {
    if (this.lock) return;
    const quarks = this.particles.filter((p) => p.isQuark);
    if (quarks.length < 2) return;

    if (this.mode === 'meson') {
      const [a, b] = quarks;
      this.gluons.push(new Gluon(a.x, a.y, b, '#fbbf24'));
      setTimeout(() => {
        const tmp = a.color; a.color = b.color; b.color = tmp;
        b.flash = 1;
      }, 600 / this.speed);
      return;
    }

    if (this.mode === 'pentaquark') {
      for (let i = 0; i < quarks.length; i++) {
        this.gluons.push(new Gluon(quarks[i].x, quarks[i].y, quarks[(i + 1) % quarks.length], '#fbbf24'));
      }
      setTimeout(() => {
        for (const q of quarks) {
          if (q.anti) continue;
          const idx = RGB.indexOf(q.color);
          if (idx >= 0) q.color = RGB[(idx + 1) % 3];
        }
      }, 600 / this.speed);
      return;
    }

    let i1 = Math.floor(Math.random() * quarks.length);
    let i2 = i1;
    while (i2 === i1) i2 = Math.floor(Math.random() * quarks.length);
    this.gluons.push(new Gluon(quarks[i1].x, quarks[i1].y, quarks[i2], '#fbbf24'));
    quarks[i1].flash = 0.6;
  }

  step(actions) {
    this.time += this.speed;
    const cx = this.canvas.width / 2 / this.canvas.dpr;
    const cy = this.canvas.height / 2 / this.canvas.dpr;

    // Physics update
    this.particles.forEach((p) => {
      if (p.isQuark) p.update(cx, cy, this.force, this.speed);
      else if (p.isNeutrino) p.update(cx, cy, this.speed);
      else if (p.update) p.update(this.speed);
    });

    // Gluons
    for (let i = this.gluons.length - 1; i >= 0; i--) {
      if (this.gluons[i].update(this.speed)) this.gluons.splice(i, 1);
    }

    // Bosons
    this.bosons.forEach((b) => b.update(this.speed));

    // Bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      if (this.bursts[i].update(this.speed)) this.bursts.splice(i, 1);
    }

    // Higgs
    if (this.higgs) {
      this.higgs.update(this.speed);
      if (this.higgs.life <= 0) this.higgs = null;
    }

    // Cleanup leptons
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].isLepton && this.particles[i].alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Auto-gluon in gluon mode
    if (this.mode === 'gluon' && Math.random() < 0.015 * this.speed) {
      this.emitGluon();
    }
  }

  draw(renderer, drawConf, drawHiggsField) {
    renderer.clear();
    const cx = renderer.width / 2;
    const cy = renderer.height / 2;

    if (this.mode !== 'neutrino' && this.mode !== 'zexchange') {
      drawConf(renderer.ctx, cx, cy, this.mode);
    }
    if (this.mode === 'higgs') drawHiggsField(renderer.ctx, cx, cy, this.time);

    this.particles.forEach((p) => p.draw && p.draw(renderer.ctx));
    this.gluons.forEach((g) => g.draw(renderer.ctx));
    this.bosons.forEach((b) => b.draw(renderer.ctx));
    this.bursts.forEach((b) => b.draw(renderer.ctx));
    if (this.higgs) this.higgs.draw(renderer.ctx);

    // Quark confinement lines
    drawConf(renderer.ctx, cx, cy, this.mode, true);
  }
}
