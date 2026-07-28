import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const visionCss = readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('l’accueil a une petite scène animée (lumière qui scintille, vague douce) façon vidéo silencieuse, sans dépendre d’un fichier vidéo', () => {
  assert.match(app, /class="eclat-home-motion" aria-hidden="true"/);
  assert.match(app, /class="motion-glint g1"/);
  assert.match(app, /class="motion-wave w1"/);
  assert.match(visionCss, /@keyframes eclatGlint/);
  assert.match(visionCss, /@keyframes eclatWave/);
});

test('un rayon de lumière balaie lentement la scène pour un mood plus dramatique et cinématographique, jamais criard', () => {
  assert.match(app, /class="eclat-home-sweep" aria-hidden="true"/);
  assert.match(visionCss, /@keyframes eclatSweep/);
  assert.match(visionCss, /filter:contrast\(1\.14\) saturate\(\.9\) brightness\(\.88\)/);
});

test('la scène animée reste discrète (derrière le texte, jamais interactive) et respecte le mouvement réduit', () => {
  assert.match(visionCss, /\.eclat-home-motion\{position:absolute;inset:0;z-index:-2;overflow:hidden;pointer-events:none\}/);
  assert.match(visionCss, /@media\(prefers-reduced-motion:reduce\)\{\.motion-glint,\.motion-wave\{animation:none!important\}\}/);
});
