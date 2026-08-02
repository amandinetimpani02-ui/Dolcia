import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('le bouton "Explorer" de la navigation ouvre bien le catalogue, pas l’écran d’accueil — sinon il ne sert à rien depuis l’intérieur de l’appli', () => {
  const navFn = app.match(/function nav\(active\)\{[^\n]*\}/)?.[0] || '';
  assert.match(navFn, /onclick="openExplorer\(\)"><span>⌁<\/span>Explorer/);
  assert.doesNotMatch(navFn, /onclick="home\(\)"><span>⌁<\/span>Explorer/);
});

test('openExplorer affiche directement les résultats déjà chargés, ou relance la composition si nécessaire — jamais un simple retour à l’accueil', () => {
  assert.match(app, /async function openExplorer\(force=false\)\{/);
  assert.match(app, /if\(state\.allItems\.length&&!force\)return renderResults\(\)/);
});
