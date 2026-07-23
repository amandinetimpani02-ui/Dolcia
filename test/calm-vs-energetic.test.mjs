import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('une envie de se calmer déclenche le mode calme (yoga, respiration, étirements)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends', vibes: ['recharge'] };
  assert.equal(sandbox.challengeEnergyMode(), 'calm');
});

test('une envie de rire/bouger déclenche le mode énergique par défaut', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends', vibes: ['play'] };
  assert.equal(sandbox.challengeEnergyMode(), 'energetic');
});

test('le parc en mode calme et en mode énergique proposent des défis totalement différents', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends', vibes: ['recharge'] };
  const calmTitles = new Set();
  for (let i = 0; i < 15; i++) sandbox.challengeSetForVenue('park', 'Lyon').forEach(s => calmTitles.add(s.title));

  sandbox.state.answers = { who: 'friends', vibes: ['play'] };
  const energeticTitles = new Set();
  for (let i = 0; i < 15; i++) sandbox.challengeSetForVenue('park', 'Lyon').forEach(s => energeticTitles.add(s.title));

  const overlap = [...calmTitles].filter(title => energeticTitles.has(title));
  assert.equal(overlap.length, 0, 'aucun défi ne doit être partagé entre le mode calme et le mode énergique');
});

test('la piscine reste toujours en mode énergique (le calme aquatique n’est pas encore couvert par les règles de sécurité)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends', vibes: ['recharge'] };
  const steps = sandbox.challengeSetForVenue('pool', 'Lyon');
  assert.ok(steps.length > 0, 'la piscine doit toujours proposer un contenu, même en demandant du calme');
});
