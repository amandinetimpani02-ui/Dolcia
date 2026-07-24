import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('interprète correctement les commandes vocales "réussi", "suivant", "arrêter"', () => {
  const { sandbox } = createSandbox();
  assert.equal(sandbox.interpretVoiceCommand('réussi !'), 'success');
  assert.equal(sandbox.interpretVoiceCommand('on a gagné'), 'success');
  assert.equal(sandbox.interpretVoiceCommand('suivant'), 'participate');
  assert.equal(sandbox.interpretVoiceCommand('on participe'), 'participate');
  assert.equal(sandbox.interpretVoiceCommand('stop, on arrête'), 'stop');
  assert.equal(sandbox.interpretVoiceCommand('bonjour comment ça va'), null, 'un texte sans mot-clé ne doit déclencher aucune action');
});

test('startVoiceListening ne plante jamais si le navigateur ne supporte pas la reconnaissance vocale', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  assert.doesNotThrow(() => sandbox.startVoiceListening());
});

test('une session complète démarre et se ferme proprement avec l’écoute vocale (sans microphone réel)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Marseille' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Vieux-Port', category: 'active' });
  assert.ok(sandbox.state.liveHost);
  assert.doesNotThrow(() => sandbox.closeLiveHost());
  assert.equal(sandbox.state.liveHostRecognition, undefined, 'aucune reconnaissance ne doit rester active après la fermeture');
});
