import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('Explorer loads the real catalogue before rendering results', () => {
  assert.match(app, /onclick="openExplorer\(\)">Voir toutes les activités/);
  assert.match(app, /async function openExplorer\(force=false\)/);
  assert.match(app, /if\(state\.allItems\.length&&!force\)return renderResults\(\)/);
  assert.match(app, /try\{await compose\(true\)\}/);
});

test('renderResults cannot expose a first-load zero catalogue', () => {
  assert.match(app, /if\(!state\.allItems\.length&&!state\.catalogAttempted\)return openExplorer\(\)/);
  assert.match(app, /catalogSourceStatus\.responded===0/);
  assert.match(app, /Réessayer maintenant/);
  assert.match(app, /Préciser avec D/);
  assert.match(app, /Aucune activité incertaine ne sera inventée/);
  assert.match(app, /Aucune correspondance exacte/);
  assert.match(app, /Voir sans les filtres avancés/);
  assert.match(css, /\.explorer-recovery/);
});

test('Explorer stays in catalogue mode after loading', () => {
  assert.match(app, /explorerOnly\?renderResults\(\)/);
  assert.match(app, /rankItemsServer\(deduped\)\.catch\(\(\)=>scoreItems\(deduped\)\)/);
  assert.match(app, /const APP_BUILD = '20\.7\.0-d-gpt-realtime'/);
});
