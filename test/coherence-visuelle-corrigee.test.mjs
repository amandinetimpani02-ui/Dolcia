import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

// Signalé directement par deux captures d'écran : le texte des boutons secondaires du Home était
// coupé ("Mon coach-animate" au lieu de "animateur"), et la carte de prévisualisation d'Anime
// (Cardio Club avec D) s'affichait en beige clair au milieu d'une page entièrement sombre — un
// composant resté sur un ancien thème, jamais mis à jour avec le reste de l'application.

test('la grille des boutons secondaires s’adapte au nombre réel de boutons présents, plutôt que de réserver toujours 3 colonnes fixes', () => {
  assert.match(css, /\.home-paths-secondary\{display:grid;grid-template-columns:repeat\(auto-fit,minmax\(150px,1fr\)\)/);
});

test('le texte des boutons secondaires peut revenir à la ligne et n’est plus coupé par un overflow hérité', () => {
  const start = css.indexOf('.home-paths-secondary .home-path{');
  const line = css.slice(start, css.indexOf('\n', start));
  assert.match(line, /overflow:visible/);
  const strongStart = css.indexOf('.home-paths-secondary .home-path strong{');
  const strongLine = css.slice(strongStart, css.indexOf('\n', strongStart));
  assert.match(strongLine, /white-space:normal/);
});

test('la carte de prévisualisation Anime (#animatePreview) utilise désormais le thème sombre doré, plus jamais un fond beige clair codé en dur', () => {
  assert.doesNotMatch(css, /#animatePreview section\{[^}]*background:#f3ead7/, 'l’ancien fond beige clair doit avoir disparu');
  const start = css.indexOf('#animatePreview section{');
  const line = css.slice(start, css.indexOf('\n', start));
  assert.match(line, /rgba\(28,25,20,\.92\)/, 'doit utiliser la même palette sombre que le reste de l’application');
});

test('les étapes de la chronologie (#animatePreview li) ne sont plus en fond blanc quasi opaque', () => {
  const start = css.indexOf('#animatePreview li{');
  const line = css.slice(start, css.indexOf('\n', start));
  assert.doesNotMatch(line, /rgba\(255,255,255,\.46\)/, 'l’ancien fond quasi blanc doit avoir disparu');
});
