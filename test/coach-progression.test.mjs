import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Promesse du Product Book : "Le Coach sportif accompagne une pratique et une progression."
// Fondé exclusivement sur state.animateHistory, déjà réellement sauvegardé — jamais un score de
// forme inventé.

test('coachProgressionSummary ne compte que les programmes coach, jamais les jeux/animations', () => {
  const start = app.indexOf('function coachProgressionSummary()');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /DOLCIA_ANIMATE_PROGRAMS\[record\.program\]\?\.coach/);
});

test('aucune progression n’est affichée sans historique réel — jamais un chiffre inventé pour combler le vide', () => {
  const start = app.indexOf('function coachProgressionSummary()');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(!sportSessions\.length\)return'';/);
});

test('la progression est affichée uniquement en mode coach, jamais en mode animateur du club', () => {
  assert.match(app, /\$\{mode==='coach'\?coachProgressionSummary\(\):''\}/);
});
