import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Ces animations décoratives (particules, respiration, rayon de lumière) compensaient l'absence
// d'une vraie photo sur l'accueil. Une fois la vraie image en place (voir home-three-levels.test.mjs),
// elles sont devenues des artifices superflus, retirés volontairement — retour direct d'audit visuel :
// "aujourd'hui il y a beaucoup de noir, très peu de rêve". La photo porte l'émotion, pas le CSS.
test('les artifices décoratifs compensatoires (particules, sweep) ont été retirés au profit d’une vraie photo, jamais les deux superposés', () => {
  const liveHome = app.match(/function home\(\)\{[\s\S]*?loadHomePulse\(\)\}/)?.[0] || '';
  assert.doesNotMatch(liveHome, /eclat-home-sparkles/);
  assert.doesNotMatch(liveHome, /eclat-home-sweep/);
});
