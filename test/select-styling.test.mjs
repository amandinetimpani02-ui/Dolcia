import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

// Un menu déroulant natif du navigateur (chrome gris par défaut) suffit à casser toute la
// sensation premium au premier tap sur un filtre. Règle globale, une seule fois, jamais à refaire
// écran par écran.
test('tous les menus déroulants ont une flèche personnalisée, jamais le chrome natif du navigateur', () => {
  assert.match(style, /select\{-webkit-appearance:none;appearance:none;background-image:url\(/);
});

test('le focus sur un menu déroulant utilise la couleur signature du produit, pas le contour bleu par défaut du navigateur', () => {
  assert.match(style, /select:focus\{outline:none;border-color:var\(--lime\)\}/);
});
