import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('l’historique des sessions (animateHistory) est enfin relu pour créer une vraie continuité, pas seulement écrit puis ignoré', () => {
  assert.match(app, /function animateContinuityGreeting\(\)/);
  assert.match(app, /const history=state\.animateHistory\|\|\[\]/);
  assert.match(app, /continuity:animateContinuityGreeting\(\)/);
});

test('un jalon (3e, 5e, 10e, 20e, 30e session) est célébré à partir du vrai compte, jamais un chiffre inventé', () => {
  assert.match(app, /if\(\[3,5,10,20,30\]\.includes\(count\)\)return/);
  assert.match(app, /const count=history\.length\+1/);
});

test('des retrouvailles après une longue pause sont reconnues chaleureusement, sans être culpabilisantes', () => {
  assert.match(app, /if\(daysSinceLast>=14\)return/);
  assert.doesNotMatch(app, /ça fait longtemps.*vous n.êtes pas venu|vous nous avez manqué.*pourquoi/i);
});

test('sans historique (première session) ou sans rien de spécial, aucune continuité n’est forcée', () => {
  assert.match(app, /if\(!history\.length\)return null/);
  assert.match(app, /return null/);
});

test('la continuité s’intègre dans la toute première réplique d’ouverture de D, jamais plaquée ailleurs', () => {
  const openingBlock = app.match(/if\(!session\.index\)\{[\s\S]*?\n  \}/)?.[0] || '';
  assert.match(openingBlock, /continuity\?continuity\+' ':''/);
});
