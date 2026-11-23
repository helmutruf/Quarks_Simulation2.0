# Quarks 2.0 — Interactive Particle Physics Simulation

Eine **endlose, interaktive Echtzeit-Simulation** der fundamentalen Bausteine der Materie – Quarks, Gluonen, Bosonen und Neutrinos – inspiriert vom Standardmodell der Teilchenphysik.

## Features

- **Endlos-Animation** mit `requestAnimationFrame`
- **12 Modi**: Proton, Neutron, Pion, Gluon-Austausch, β⁻/β⁺-Zerfall, Myon, Z⁰, Top, Pentaquark, Higgs, Neutrino-Oszillation
- **Interaktive Steuerung**: Play/Pause, Reset, Geschwindigkeit, Confinement-Kraft, Qualität (Low/Mid/HD)
- **Zweisprachig** (DE/EN) mit `localStorage`-Persistenz
- **HD-Rendering** via `devicePixelRatio`-Skalierung
- **Wissenschaftlich inspiriert**: korrekte Ladungsbilanzen, Zerfallsgleichungen und QCD-Farbneutralität
- **Modular**: ES-Module, saubere Trennung von Rendering, Physik, UI, i18n

## Lokal starten

Da ES-Module verwendet werden, muss die Seite über einen HTTP-Server geladen werden:

```bash
# Python
python3 -m http.server 8000

# oder Node
npx serve .
