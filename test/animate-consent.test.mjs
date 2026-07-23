import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('la première utilisation de D anime demande une acceptation, jamais une validation par lieu', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  assert.equal(sandbox.hasAcceptedAnimateTerms(), false);
  // Ouvrir sur une piscine ne doit pas créer de session tant que ce n'est pas accepté
  sandbox.openLiveHost({ id: 'pool1', name: 'Piscine municipale', category: 'active' });
  assert.equal(sandbox.state.liveHost, undefined);
});

test('une fois acceptée, l’animation se lance directement sur n’importe quel lieu, sans redemander', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  assert.equal(sandbox.hasAcceptedAnimateTerms(), true);
  assert.ok(sandbox.state.liveHost, 'la session doit démarrer immédiatement après acceptation');
  sandbox.closeLiveHost(); // nettoie le minuteur déclenché par openLiveHost

  // Un deuxième lieu, complètement différent, ne doit pas redemander l'acceptation
  sandbox.openLiveHost({ id: 'park1', name: 'Parc municipal', category: 'outside' });
  assert.ok(sandbox.state.liveHost, 'aucune nouvelle acceptation ne doit être nécessaire pour un autre lieu');
  sandbox.closeLiveHost(); // nettoie à nouveau
});
