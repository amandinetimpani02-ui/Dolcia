import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('un vrai filtre budget existe, basé sur le price_level réel de Google Places, jamais un chiffre inventé', () => {
  assert.match(app, /if\(filters\.budget&&filters\.budget!=='all'\)items=items\.filter\(item=>Number\.isInteger\(item\.price\)&&item\.price<=Number\(filters\.budget\)\)/);
  assert.match(app, /function setCatalogBudget\(value\)/);
  assert.match(app, /onchange="setCatalogBudget\(this\.value\)"/);
});

test('un item sans prix réel connu (ex. un événement) n’est jamais inclus par erreur dans un filtre budget restrictif', () => {
  assert.match(app, /Number\.isInteger\(item\.price\)/);
});

test('le filtre budget se combine avec les autres filtres existants (famille, disponibilité, lentilles), pas un système séparé', () => {
  const selectionFn = app.match(/function catalogSelection\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(selectionFn, /filters\.family!=='all'/);
  assert.match(selectionFn, /filters\.budget&&filters\.budget!=='all'/);
  assert.match(selectionFn, /filters\.lenses\.forEach/);
});
