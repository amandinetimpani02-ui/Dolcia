import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../premium.css', import.meta.url), 'utf8');
const nav = app.slice(app.indexOf('function nav('), app.indexOf('function openMyMoment'));

test('la navigation ne présente que trois univers', () => {
  assert.match(nav, />Explorer</);
  assert.match(nav, /Mon moment/);
  assert.match(nav, />Moi</);
  assert.equal((nav.match(/class="nav-item/g) || []).length, 3);
  assert.doesNotMatch(nav, />Programme/);
  assert.doesNotMatch(nav, />Mon Pass/);
});

test('budget, tout compris et Pass restent accessibles sans onglet supplémentaire', () => {
  assert.match(app, /Budget & tout compris/);
  assert.match(app, /Dolcia Tout Compris/);
  assert.match(app, /Mon Pass Dolcia/);
  assert.match(app, /function openMeHub/);
});

test('la navigation essentielle possède une adaptation mobile', () => {
  assert.match(css, /\.essential-nav/);
  assert.match(css, /\.me-hub-grid/);
  assert.match(css, /@media\(max-width:620px\)/);
});
