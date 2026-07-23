import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('la session démarre immédiatement avec le contenu générique, même sans réponse du serveur', () => {
  const { sandbox } = createSandbox(); // fetch rejette toujours dans ce harnais
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  sandbox.acceptAnimateTerms({ id: 'pool1', name: 'Camping du Country Club', category: 'active' });
  sandbox.confirmWaterSession({ id: 'pool1', name: 'Camping du Country Club', category: 'active' });
  assert.ok(sandbox.state.liveHost, 'la session doit démarrer sans attendre une réponse serveur');
  assert.equal(sandbox.state.liveHost.fromPartner, false, 'sans réponse serveur, reste sur le contenu générique');
  sandbox.closeLiveHost();
});

test('fetchPartnerAnimations ne plante jamais si le réseau échoue', async () => {
  const { sandbox } = createSandbox();
  const result = await sandbox.fetchPartnerAnimations('Un établissement quelconque');
  assert.equal(Array.isArray(result), true);
  assert.equal(result.length, 0);
});

test('fetchPartnerAnimations retourne un tableau vide sans nom d’établissement', async () => {
  const { sandbox } = createSandbox();
  const result = await sandbox.fetchPartnerAnimations(null);
  assert.equal(Array.isArray(result), true);
  assert.equal(result.length, 0);
});
