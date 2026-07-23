import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('détecte correctement le type de lieu réel pour adapter les défis', () => {
  const { sandbox } = createSandbox();
  assert.equal(sandbox.detectChallengeVenueType({ name: 'Piscine municipale du Touquet', category: 'active' }), 'pool');
  assert.equal(sandbox.detectChallengeVenueType({ name: 'Parc du Bois de Bagatelle', category: 'outside' }), 'park');
  assert.equal(sandbox.detectChallengeVenueType({ name: 'Place Quentovic', category: 'active' }), 'generic');
});

test('les défis piscine et parc sont réellement différents, pas un texte générique recopié', () => {
  const { sandbox } = createSandbox();
  const pool = sandbox.challengeSetForVenue('pool', 'Le Touquet').map(s => s.title);
  const park = sandbox.challengeSetForVenue('park', 'Le Touquet').map(s => s.title);
  const overlap = pool.filter(title => park.includes(title));
  assert.equal(overlap.length, 0, 'les défis piscine et parc ne doivent partager aucun titre');
});

test('openLiveHost initialise bien un état de session avec le premier défi', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Front de mer', category: 'active' }); // accepte + lance en un seul geste
  assert.ok(sandbox.state.liveHost);
  assert.equal(sandbox.state.liveHost.index, 0);
  assert.ok(sandbox.state.liveHost.steps.length >= 3);
  sandbox.closeLiveHost(); // nettoie le minuteur, sinon il tourne réellement en arrière-plan
});
