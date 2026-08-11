import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Promesse du Product Book jusqu'ici absente du code : "Dolcia pourra signaler qu'un événement
// correspondant à ses goûts commence bientôt." Implémenté en réutilisant les données déjà
// récupérées pour le Home (aucun nouvel appel réseau ajouté sauf l'élargissement de la fenêtre
// ticketmaster de aujourd'hui à +3 jours), croisées avec state.tasteProfile — jamais un texte
// générique, un vrai score appris avec un seuil volontairement élevé.

test('la détection utilise un seuil élevé (>=3) sur un goût réellement appris, jamais un simple like isolé', () => {
  assert.match(app, /state\.tasteProfile\[event\.category\]\|\|0\)>=3/);
});

test('un événement du jour même ne déclenche jamais cette anticipation — elle sert uniquement à annoncer ce qui vient, pas à répéter le pulse du jour', () => {
  const start = app.indexOf('const upcomingTasteMatches=');
  const line = app.slice(start, app.indexOf(';', start));
  assert.match(line, /iso\(new Date\(event\.date\)\)!==today/);
});

test('renderTasteAnticipation reste honnêtement silencieux quand aucune vraie correspondance n’existe', () => {
  const start = app.indexOf('function renderTasteAnticipation(event){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(!event\)\{target\.innerHTML='';target\.hidden=true;return\}/);
});

test('le conteneur existe dans le Home, cohérent avec le reste de la structure', () => {
  assert.match(app, /<div id="tasteAnticipation" hidden><\/div>/);
});
