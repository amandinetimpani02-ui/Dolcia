import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

<<<<<<< HEAD
test('un vrai filtre budget existe, basé sur le price_level réel de Google Places ou la gratuité confirmée, jamais un chiffre inventé', () => {
  assert.match(app, /if\(filters\.budget&&filters\.budget!=='all'\)items=items\.filter\(item=>item\.free\|\|item\.freeAccess\|\|\(Number\.isInteger\(item\.price\)&&item\.price<=Number\(filters\.budget\)\)\)/);
=======
test('un vrai filtre budget existe, basé sur le price_level réel de Google Places, jamais un chiffre inventé', () => {
  assert.match(app, /if\(filters\.budget&&filters\.budget!=='all'\)items=items\.filter\(item=>Number\.isInteger\(item\.price\)&&item\.price<=Number\(filters\.budget\)\)/);
>>>>>>> 04f5afeae402fd69b23a6176fa905b97407db1ae
  assert.match(app, /function setCatalogBudget\(value\)/);
  assert.match(app, /onchange="setCatalogBudget\(this\.value\)"/);
});

<<<<<<< HEAD
test('une activité gratuite passe toujours un filtre budget, quel que soit le plafond choisi — corrigé après un vrai bug de zéro résultat (le gratuit était traité comme un prix inconnu)', () => {
  assert.match(app, /items=items\.filter\(item=>item\.free\|\|item\.freeAccess\|\|\(Number\.isInteger/);
});

test('un item sans prix réel connu ET non gratuit (ex. un événement dont le tarif n’est pas encore communiqué) n’est jamais inclus par erreur dans un filtre budget restrictif', () => {
=======
test('un item sans prix réel connu (ex. un événement) n’est jamais inclus par erreur dans un filtre budget restrictif', () => {
>>>>>>> 04f5afeae402fd69b23a6176fa905b97407db1ae
  assert.match(app, /Number\.isInteger\(item\.price\)/);
});

test('le filtre budget se combine avec les autres filtres existants (famille, disponibilité, lentilles), pas un système séparé', () => {
  const selectionFn = app.match(/function catalogSelection\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(selectionFn, /filters\.family!=='all'/);
  assert.match(selectionFn, /filters\.budget&&filters\.budget!=='all'/);
  assert.match(selectionFn, /filters\.lenses\.forEach/);
});
