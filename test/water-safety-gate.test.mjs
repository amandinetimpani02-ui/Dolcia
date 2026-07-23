import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('une séance piscine demande la confirmation eau à chaque fois, même après acceptation générale', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  sandbox.acceptAnimateTerms({ id: 'p1', name: 'Piscine municipale', category: 'active' });
  // Après l'acceptation générale, la séance ne doit pas démarrer directement : la confirmation eau doit s'afficher
  assert.equal(sandbox.state.liveHost, undefined, 'la confirmation eau doit s’intercaler avant le démarrage réel');
});

test('après confirmation eau, la séance démarre bien', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  sandbox.acceptAnimateTerms({ id: 'p1', name: 'Piscine municipale', category: 'active' });
  sandbox.confirmWaterSession({ id: 'p1', name: 'Piscine municipale', category: 'active' });
  assert.ok(sandbox.state.liveHost);
  sandbox.closeLiveHost();
});

test('un lieu non aquatique (parc) ne demande jamais la confirmation eau', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'park1', name: 'Parc municipal', category: 'outside' });
  assert.ok(sandbox.state.liveHost, 'un parc doit démarrer directement, sans étape eau supplémentaire');
  sandbox.closeLiveHost();
});

test('garde-fou dur : aucun défi piscine ne mentionne apnée, plongeon ou compétition de temps sous l’eau', () => {
  const { sandbox } = createSandbox();
  const forbidden = /apn[ée]e|plongeon|sous l.eau|retenir sa respiration|le plus longtemps possible sous/i;
  for (const who of ['friends', 'family', 'couple']) {
    sandbox.state.answers = { who, childrenAges: who === 'family' ? [2] : [] };
    const steps = sandbox.challengeSetForVenue('pool', 'Le Touquet');
    for (const step of steps) {
      assert.doesNotMatch(step.text, forbidden, `défi interdit détecté dans "${step.title}"`);
    }
  }
});
