export const C = {
  red: '#ef4444', green: '#22c55e', blue: '#3b82f6',
  white: '#fff', yellow: '#fbbf24', purple: '#a855f7',
  cyan: '#22d3ee', orange: '#f97316', pink: '#f472b6',
  emerald: '#34d399', magenta: '#e879f9', fuchsia: '#d946ef', rose: '#f43f5e',
};

export const RGB = ['red', 'green', 'blue'];

export class Renderer {
  constructor(canvas, quality = 'mid') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.quality = quality;
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setQuality(q) {
    this.quality = q;
    this.dpr = q === 'high' ? Math.max(2, window.devicePixelRatio || 1) : q === 'mid' ? 1 : 0.75;
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear() {
    this.ctx.fillStyle = '#060a14';
    this.ctx.fillRect(0, 0, this.width, this.height);
    const g = this.ctx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, Math.max(this.width, this.height) / 1.2);
    g.addColorStop(0, 'rgba(20,35,60,0.6)');
    g.addColorStop(1, 'rgba(6,10,20,0)');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
