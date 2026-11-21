
import { C } from './renderer.js';

export class Quark {
  constructor(x, y, flavor, color, r = 26, anti = false) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.flavor = flavor; this.color = color;
    this.r = r; this.anti = anti;
    this.flash = 0; this.isQuark = true;
  }
  update(cx, cy, force, speed) {
    const dx = cx - this.x, dy = cy - this.y;
    const d = Math.hypot(dx, dy) || 1;
    const f = d * force * 0.05;
    this.vx += (dx / d) * f; this.vy += (dy / d) * f;
    this.vx *= 0.96; this.vy *= 0.96;
    this.x += this.vx * speed; this.y += this.vy * speed;
    if (this.flash > 0) this.flash -= 0.04 * speed;
  }
  draw(ctx) {
    const col = C[this.color] || '#fff';
    ctx.save();
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 1.8);
    g.addColorStop(0, col);
    g.addColorStop(0.4, col + '80');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 1.8, 0, Math.PI * 2); ctx.fill();

    ctx.shadowBlur = this.flash > 0 ? 40 * this.flash : 15;
    ctx.shadowColor = this.flash > 0 ? C.yellow : col;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();

    if (['u', 'd', 't', 'b'].includes(this.flavor)) {
      const frac = ['u', 't'].includes(this.flavor) ? 2 / 3 : 1 / 3;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.arc(this.x, this.y, this.r * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (this.anti) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 0.9, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0b1120';
    ctx.font = `bold ${Math.round(this.r * 0.5)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.flavor + (this.anti ? '̄' : ''), this.x, this.y + 1);
    ctx.restore();
  }
}

export class Gluon {
  constructor(sx, sy, target, color) {
    this.sx = sx; this.sy = sy; this.x = sx; this.y = sy;
    this.target = target; this.color = color;
    this.progress = 0; this.trail = [];
    this.phase = Math.random() * Math.PI * 2;
  }
  update(speed) {
    this.progress += 0.018 * speed;
    if (this.progress >= 1) return true;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 18) this.trail.shift();
    const dx = this.target.x - this.sx, dy = this.target.y - this.sy;
    const l = Math.hypot(dx, dy) || 1;
    const px = -dy / l, py = dx / l;
    const env = Math.sin(this.progress * Math.PI);
    const w = Math.sin(this.progress * Math.PI * 8 + this.phase) * 14 * env;
    this.x = this.sx + dx * this.progress + px * w;
    this.y = this.sy + dy * this.progress + py * w;
    return false;
  }
  draw(ctx) {
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i];
      ctx.globalAlpha = (i / this.trail.length) * 0.55;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 + (i / this.trail.length) * 6, 0, Math.PI * 2);
      ctx.fillStyle = this.color; ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 25; ctx.shadowColor = this.color;
    const g = ctx.createRadialGradient(this.x - 3, this.y - 3, 1, this.x, this.y, 15);
    g.addColorStop(0, '#fff'); g.addColorStop(0.4, this.color); g.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(this.x, this.y, 15, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }
}

export class Boson {
  constructor(x, y, tx, ty, type) {
    this.sx = x; this.sy = y; this.x = x; this.y = y;
    this.tx = tx; this.ty = ty; this.type = type;
    this.progress = 0; this.trail = [];
  }
  update(speed) {
    this.progress = Math.min(1, this.progress + 0.02 * speed);
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.shift();
    this.x = this.sx + (this.tx - this.sx) * this.progress;
    this.y = this.sy + (this.ty - this.sy) * this.progress;
  }
  draw(ctx) {
    const cfg = {
      'W-': { c: C.purple, l: 'W⁻' },
      'W+': { c: C.orange, l: 'W⁺' },
      'Z0': { c: C.white,  l: 'Z⁰' },
    }[this.type] || { c: C.purple, l: '?' };
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i];
      ctx.globalAlpha = (i / this.trail.length) * 0.35;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 + (i / this.trail.length) * 4, 0, Math.PI * 2);
      ctx.fillStyle = cfg.c; ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 22; ctx.shadowColor = cfg.c;
    const g = ctx.createRadialGradient(this.x - 2, this.y - 2, 1, this.x, this.y, 14);
    g.addColorStop(0, '#fff'); g.addColorStop(0.5, cfg.c); g.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(this.x, this.y, 14, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.type === 'Z0' ? '#0b1120' : '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(cfg.l, this.x, this.y);
    ctx.restore();
  }
}

const LEPTONS = {
  electron:     { c: '#22d3ee', l: 'e⁻',  dash: false, r: 8 },
  positron:     { c: '#22d3ee', l: 'e⁺',  dash: false, r: 8 },
  neutrino_e:   { c: '#22d3ee', l: 'νₑ',  dash: true,  r: 10 },
  antineutrino: { c: '#22d3ee', l: 'ν̄ₑ', dash: true,  r: 10 },
  neutrino_mu:  { c: '#f97316', l: 'ν_μ', dash: true,  r: 10 },
  muon:         { c: '#10b981', l: 'μ⁻',  dash: false, r: 16 },
};

export class Lepton {
  constructor(x, y, vx, vy, type) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.type = type; this.alpha = 1; this.trail = [];
    this.isLepton = true;
  }
  update(speed) {
    const cfg = LEPTONS[this.type];
    if (!cfg) return;
    if (cfg.dash) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 15) this.trail.shift();
    }
    this.x += this.vx * speed;
    this.y += this.vy * speed;
    this.alpha -= 0.004 * speed;
  }
  draw(ctx) {
    const cfg = LEPTONS[this.type] || { c: '#fff', l: '?', dash: false, r: 6 };
    ctx.save();
    if (cfg.dash) {
      for (let i = 0; i < this.trail.length; i++) {
        const p = this.trail[i];
        ctx.globalAlpha = (i / this.trail.length) * this.alpha * 0.35;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2 + (i / this.trail.length) * 3, 0, Math.PI * 2);
        ctx.fillStyle = cfg.c; ctx.fill();
      }
    }
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.shadowBlur = 15; ctx.shadowColor = cfg.c;
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, cfg.r * 1.5);
    g.addColorStop(0, cfg.c); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.x, this.y, cfg.r * 1.5, 0, Math.PI * 2); ctx.fill();
    if (cfg.dash) {
      ctx.strokeStyle = cfg.c; ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(this.x, this.y, cfg.r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = cfg.c; ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cfg.l, this.x, this.y + 1);
    } else {
      ctx.beginPath(); ctx.arc(this.x, this.y, cfg.r, 0, Math.PI * 2);
      ctx.fillStyle = cfg.c; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0b1120'; ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cfg.l, this.x, this.y);
    }
    ctx.restore();
  }
}

export class HiggsBoson {
  constructor(x, y) { this.x = x; this.y = y; this.phase = 0; this.life = 240; }
  update(speed) { this.phase += 0.08 * speed; this.life -= speed; }
  draw(ctx) {
    const a = Math.min(1, this.life / 40);
    const r = 35 + Math.sin(this.phase) * 8;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const ra = a * (0.45 - i * 0.13);
      if (ra <= 0) continue;
      ctx.globalAlpha = ra;
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(this.x, this.y, r + i * 14, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = a;
    ctx.shadowBlur = 50; ctx.shadowColor = C.yellow;
    const g = ctx.createRadialGradient(this.x - 6, this.y - 6, 2, this.x, this.y, r);
    g.addColorStop(0, '#fff'); g.addColorStop(0.4, C.yellow); g.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0b1120'; ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('H', this.x, this.y);
    ctx.restore();
  }
}

export class NeutrinoOscillator {
  constructor(x, y) {
    this.x = x; this.y = y; this.angle = 0; this.orbit = 110;
    this.timer = 0; this.interval = 200;
    this.flavors = [
      { c: '#22d3ee', l: 'νₑ' },
      { c: '#f97316', l: 'ν_μ' },
      { c: '#f472b6', l: 'ν_τ' },
    ];
    this.index = 0; this.trail = []; this.isNeutrino = true;
  }
  get flavor() { return this.flavors[this.index]; }
  update(cx, cy, speed) {
    this.angle += 0.012 * speed;
    const r = this.orbit + Math.sin(this.angle * 3) * 15;
    this.trail.push({ x: this.x, y: this.y, c: this.flavor.c });
    if (this.trail.length > 35) this.trail.shift();
    this.x = cx + Math.cos(this.angle) * r;
    this.y = cy + Math.sin(this.angle) * r;
    this.timer += speed;
    if (this.timer >= this.interval) {
      this.timer = 0;
      this.index = (this.index + 1) % 3;
    }
  }
  draw(ctx) {
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i];
      ctx.globalAlpha = (i / this.trail.length) * 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 + (i / this.trail.length) * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.shadowBlur = 30; ctx.shadowColor = this.flavor.c;
    ctx.strokeStyle = this.flavor.c; ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.arc(this.x, this.y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(this.x, this.y, 7 + Math.sin(this.angle * 2) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.flavor.c;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.flavor.l, this.x, this.y + 1);
    ctx.restore();
  }
}

export class Burst {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color; this.r = 8; this.a = 1;
  }
  update(speed) { this.r += 3 * speed; this.a -= 0.05 * speed; return this.a <= 0; }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.a;
    ctx.shadowBlur = 25; ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}
