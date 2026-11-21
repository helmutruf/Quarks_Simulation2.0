import { t, getLang, setLang } from './i18n.js';

export function renderModeButtons(container, mode, onSelect) {
  container.innerHTML = '';
  const modes = Object.keys(t('modes'));
  modes.forEach((k) => {
    const [name, desc] = t('modes')[k];
    const btn = document.createElement('button');
    btn.className = 'mode-btn' + (k === mode ? ' active' : '');
    btn.innerHTML = `<div style="font-weight:700">${name}</div><div style="opacity:.7;font-size:.65rem">${desc}</div>`;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onSelect(k);
    });
    container.appendChild(btn);
  });
}

export function updateInfo(mode, infoEl, statsEl, actionBtn) {
  infoEl.textContent = t('explain')[mode];
  const s = t('stats')[mode];
  statsEl.innerHTML = s.map((line) => `<div>▸ ${line}</div>`).join('');
  actionBtn.textContent = t('actions')[mode];
  actionBtn.disabled = false;
}

export function applyLang(lang) {
  setLang(lang);
  document.getElementById('title').textContent = t('title');
  document.getElementById('subtitle').textContent = t('subtitle');
  document.getElementById('lang-label').textContent = lang.toUpperCase();
  document.getElementById('footer1').textContent = 'Basierend auf QCD, elektroschwacher Theorie und Higgs-Mechanismus.';
  document.getElementById('footer2').textContent = 'Didaktisches Modell. Quarks sind quantenmechanische Objekte – Farben, Abstände und Bahnen sind stark vereinfacht.';
}
