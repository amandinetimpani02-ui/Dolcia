import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('l’état vide de Notre constellation propose une action utile (découvrir des idées), pas seulement un message', () => {
  assert.match(app, /constellation-empty/);
  assert.match(app, /Découvrir des idées/);
  assert.match(app, /remove\(\);openExplorer\(\)/);
});

test('l’agenda vide propose déjà une action utile (vérifié, pas modifié)', () => {
  assert.match(app, /empty-state[\s\S]{0,200}Compose-moi mon programme/);
});

test('le Pass sans réservation redirige vers l’agenda plutôt que d’afficher un écran mort', () => {
  assert.match(app, /if\(!focus\)\{renderAgenda\(\);return\}/);
});
