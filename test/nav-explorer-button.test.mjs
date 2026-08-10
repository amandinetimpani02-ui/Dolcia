import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('Mes idées qualifie le moment avant d’ouvrir le catalogue', () => {
  const navFn = app.match(/function nav\(active\)\{[^\n]*\}/)?.[0] || '';
  assert.match(navFn, /onclick="beginExplore\(\)"/);
  assert.match(navFn, /Mes idées/);
  assert.match(app, /function beginExplore\(\)\{if\(!state\.momentQualified\)return openEclatDialogue\(false,'explore'\);openExplorer\(\)\}/);
});

test('openExplorer affiche les résultats chargés ou récupère le catalogue', () => {
  assert.match(app, /async function openExplorer\(force=false\)\{/);
  assert.match(app, /if\(!state\.momentQualified\)return openEclatDialogue\(false,'explore'\)/);
  assert.match(app, /if\(state\.allItems\.length&&!force\)return renderResults\(\)/);
});
