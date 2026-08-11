import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

// Signalé directement par capture d'écran : après le dialogue Eclat (qui a déjà posé toutes les
// questions), l'écran de résultats affichait un héro plein écran avant la moindre idée réelle,
// obligeant à défiler pour voir "14 idées compatibles" et le contenu utile.

test('le héro de l’écran de résultats (result-signature) est réduit spécifiquement, sans toucher à l’écran d’accueil général d’Explorer', () => {
  assert.match(css, /\.explore-signature\.result-signature\{min-height:340px/);
});

test('la réduction s’applique aussi sur mobile, où le problème était le plus visible', () => {
  assert.match(css, /max-width:620px\)\{\.explore-signature\.result-signature\{min-height:400px/);
});
