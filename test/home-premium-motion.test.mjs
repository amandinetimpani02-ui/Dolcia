import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('l’accueil vit avec une lumière cinématographique discrète', () => {
  assert.match(css, /\.eclat-home:before\{/);
  assert.match(css, /@keyframes eclatSweep/);
  assert.match(css, /@keyframes eclatBreath/);
});

test('le mouvement premium respecte la préférence de mouvement réduit', () => {
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.eclat-home:before,\.eclat-home-atmosphere\{animation:none!important\}/);
});
