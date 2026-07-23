import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('propose systématiquement D anime dès que le budget est à 0€, peu importe l’envie choisie', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'free', vibes: ['taste'] }; // même une envie sans rapport avec "jouer"
  sandbox.state.allItems = [];
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  assert.equal(sandbox.needsFreeFunFallback(), true);
  const challenge = sandbox.builtFreeFunChallenge();
  assert.ok(challenge.steps.length >= 3, 'le défi doit contenir plusieurs étapes concrètes');
  assert.ok(challenge.title.includes('Le Touquet'), 'le défi doit utiliser la vraie ville, jamais un nom générique fixe');
});

test('propose D anime même si de vraies activités gratuites existent déjà (en plus, pas en dernier recours)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'free', vibes: ['play'] };
  sandbox.state.allItems = [
    { id: '3', category: 'active', name: 'Beach volley libre', free: true },
    { id: '4', category: 'night', name: 'Concert gratuit place centrale', free: true }
  ];
  assert.equal(sandbox.needsFreeFunFallback(), true, 'D anime doit rester proposé même avec de vraies options gratuites déjà présentes');
});

test('ne propose pas D anime si le budget n’est pas serré (0€ ou gratuit uniquement)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'flexible', vibes: ['play'] };
  sandbox.state.allItems = [];
  assert.equal(sandbox.needsFreeFunFallback(), false);
});

test('le budget "0" (numérique en texte) déclenche aussi D anime', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: '0', vibes: [] };
  sandbox.state.allItems = [];
  assert.equal(sandbox.needsFreeFunFallback(), true);
});
