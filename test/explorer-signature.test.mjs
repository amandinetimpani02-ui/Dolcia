import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const results = app.slice(app.indexOf('function renderResults(){'), app.indexOf('function futurePool'));

test('Explorer possède une seule porte de recherche visible', () => {
  assert.equal((results.match(/id="catalogSearch"/g) || []).length, 1);
  assert.doesNotMatch(results, /mountCatalogPreferences|mountGuidedCompass|mountAdaptiveFilters/);
  assert.match(results, /living-brief/);
});

test('les résultats précèdent les raffinements techniques', () => {
  assert.match(results, /advanced-refinements/);
  assert.match(results, /mountThreeFutures/);
  assert.match(css, /Explorer signature : résultats d'abord/);
});

test('la recherche réagit sans bouton de validation', () => {
  assert.match(results, /oninput="liveCatalogSearch/);
  assert.match(app, /function liveCatalogSearch/);
  assert.doesNotMatch(results, />Rechercher</);
});

test('Explorer exclut les lieux ordinaires hors destination', () => {
  assert.match(results, /geoEligibility\?\.status!==['"]outside['"]/);
  assert.doesNotMatch(results, /outsideItems\.map/);
  assert.match(app, /Pépite locale exceptionnelle/);
});
