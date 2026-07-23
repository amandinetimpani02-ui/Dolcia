import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('speakAsAnimateur ne plante jamais quand la synthèse vocale est indisponible (ex: environnement de test)', () => {
  const { sandbox } = createSandbox();
  assert.doesNotThrow(() => sandbox.speakAsAnimateur('Un texte quelconque'));
});

test('une session complète se déroule normalement même sans voix disponible', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Marseille' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Vieux-Port', category: 'active' });
  assert.ok(sandbox.state.liveHost, 'la session doit démarrer normalement sans voix');
  sandbox.markChallengeDone(true);
  sandbox.closeLiveHost();
});
