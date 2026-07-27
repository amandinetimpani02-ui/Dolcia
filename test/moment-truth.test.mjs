import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('la vérité du moment résume la décision en trois secondes', () => {
  assert.match(app, /function momentTruth\(/);
  assert.match(app, /id="momentChangeFeed"/);
  assert.match(app, /idée\$\{truth\.compatible>1\?'s':''\} réellement compatible/);
  assert.match(app, /aucun trajet inutile/);
  assert.match(css, /\.moment-truth/);
});

test('la confiance utilise exactement trois libellés', () => {
  const block = app.slice(app.indexOf('function confidencePresentation'), app.indexOf('function sourcePresentation'));
  assert.match(block, /Confirmé/);
  assert.match(block, /Compatible/);
  assert.match(block, /À vérifier/);
  assert.doesNotMatch(block, /Activité libre|À confirmer/);
});

test('les quatre actions décisives sont visibles et compréhensibles', () => {
  assert.match(app, /'Garder'/);
  assert.match(app, /'Réserver'/);
  assert.match(app, />Remplacer</);
  assert.match(app, /Laisser D décider/);
});

test('la veille ne signale que des changements issus des sources', () => {
  assert.match(app, /function checkMomentChanges\(/);
  assert.match(app, /api\/weather/);
  assert.match(app, /service=flash-offers/);
  assert.match(app, /api\/place-details/);
  assert.match(app, /aucun changement critique/);
});
