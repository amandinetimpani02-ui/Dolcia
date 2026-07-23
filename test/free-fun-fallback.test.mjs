import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('propose un défi gratuit créé par Dolcia quand rien de commercial ne correspond (fou rire + amis + 0€)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'free', vibes: ['play'] };
  sandbox.state.allItems = [
    { id: '1', category: 'food', name: 'Restaurant cher', price: 4 },
    { id: '2', category: 'active', name: 'eFoil', price: 3 }
  ];
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  assert.equal(sandbox.needsFreeFunFallback(), true);
  const challenge = sandbox.builtFreeFunChallenge();
  assert.ok(challenge.steps.length >= 3, 'le défi doit contenir plusieurs étapes concrètes');
  assert.ok(challenge.title.includes('Le Touquet'), 'le défi doit utiliser la vraie ville, jamais un nom générique fixe');
});

test('ne propose pas le défi gratuit si de vraies activités gratuites existent déjà', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'free', vibes: ['play'] };
  sandbox.state.allItems = [
    { id: '3', category: 'active', name: 'Beach volley libre', free: true },
    { id: '4', category: 'night', name: 'Concert gratuit place centrale', free: true }
  ];
  assert.equal(sandbox.needsFreeFunFallback(), false);
});

test('ne propose pas le défi gratuit si le budget n’est pas serré', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'flexible', vibes: ['play'] };
  sandbox.state.allItems = [];
  assert.equal(sandbox.needsFreeFunFallback(), false);
});
