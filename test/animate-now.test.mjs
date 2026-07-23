import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('D anime maintenant se lance directement pour une piscine, sans venir du catalogue', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  sandbox.acceptAnimateTerms({ id: 'animate-now-pool', name: 'Piscine', category: 'active' });
  sandbox.confirmWaterSession({ id: 'animate-now-pool', name: 'Piscine', category: 'active' });
  assert.ok(sandbox.state.liveHost, 'la session doit démarrer directement pour la piscine');
  sandbox.closeLiveHost();
});

test('startAnimateNow fonctionne pour les quatre types de lieu proposés', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  for (const type of ['park', 'beach', 'generic']) {
    sandbox.state.liveHost = null;
    sandbox.acceptAnimateTerms(null); // accepte une fois pour toutes
    sandbox.startAnimateNow(type);
    assert.ok(sandbox.state.liveHost, `le type "${type}" doit démarrer une session`);
    sandbox.closeLiveHost();
  }
});
