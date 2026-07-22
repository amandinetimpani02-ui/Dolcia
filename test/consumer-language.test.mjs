import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('les actions visibles parlent de Dolcia et du programme, jamais de commencer son Eclat', () => {
  const forbidden = [
    'Commencer mon Éclat',
    'Commencer mon Eclat',
    'Confier mon moment à L’Éclat',
    'Continuer avec L’Éclat',
    'Parler à L’Éclat',
    'L’Éclat vous écoute',
  ];
  for (const wording of forbidden) {
    assert.equal(app.includes(wording), false, `formulation interdite retrouvée: ${wording}`);
  }
  assert.match(app, /Composer mon moment/);
  assert.match(app, /Dolcia vous écoute/);
});

test('aucun ancien parcours ne peut réapparaître lors d’une fusion', () => {
  assert.doesNotMatch(app, /function homeLegacy/);
  assert.doesNotMatch(app, /function renderResultsLegacy/);
  const currentResults=app.slice(app.indexOf('function renderResults(){'),app.indexOf('function futurePool'));
  assert.doesNotMatch(currentResults, /mountThreeFuturesLegacy|mountCatalogPreferences|mountGuidedCompass/);
});

test('la voix et le brief vivant utilisent le parcours actuel', () => {
  assert.match(app, /if\(voice\)setTimeout\(startEclatVoice,250\)/);
  assert.match(app, /function interpretCatalogIntent/);
  assert.match(app, /interpretCatalogIntent\(value\)/);
  assert.doesNotMatch(app, /Rire et me défouler/);
  assert.match(app, /Rire et bouger/);
});

test('les compteurs de catégories excluent les lieux hors destination', () => {
  assert.match(app, /visibleBase=state\.allItems\.filter\(item=>item\.geoEligibility\?\.status!==['"]outside['"]\)/);
  assert.match(app, /visibleBase\.filter\(item=>catalogFamily\(item\)===id\)/);
});
