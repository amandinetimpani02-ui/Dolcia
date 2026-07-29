import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const visionCss = readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('l’accueil a des particules montantes (façon bulles/étincelles de vacances), pas seulement un fond qui respire doucement', () => {
  assert.match(app, /class="eclat-home-sparkles" aria-hidden="true"/);
  assert.match(visionCss, /@keyframes eclatRise/);
  assert.match(visionCss, /\.eclat-home-sparkles i\{position:absolute/);
});

test('le rayon de lumière et la respiration du fond sont nettement plus rapides qu’avant (mood dynamique, pas mou)', () => {
  assert.match(visionCss, /animation:eclatSweep 4\.5s cubic-bezier/);
  assert.match(visionCss, /animation:eclatBreath 8s ease-in-out infinite alternate/);
  assert.doesNotMatch(visionCss, /animation:eclatSweep 10s/);
  assert.doesNotMatch(visionCss, /animation:eclatBreath 14s/);
});

test('le halo doré et la vignette de fond restent présents (à ne pas perdre en modifiant l’ambiance)', () => {
  assert.match(visionCss, /radial-gradient\(circle at 74% 35%,rgba\(239,211,146,\.18\),transparent 18rem\)/);
});

test('toute l’animation de l’accueil respecte le mouvement réduit', () => {
  assert.match(visionCss, /@media\(prefers-reduced-motion:reduce\)\{\.eclat-home-sparkles i,\.eclat-home-atmosphere,\.eclat-home:before\{animation:none!important\}\}/);
});
