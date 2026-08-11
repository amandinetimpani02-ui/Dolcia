import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyCandidate } from '../server/geo-eligibility.js';

const origin = { lat: 50.5214, lng: 1.5912 };
const nearby = {
  id: 'plage-locale', name: 'Plage locale', category: 'outside', experienceKind: 'nature',
  lat: 50.525, lng: 1.596, locationConfidence: .95, retrievalScope: 'local',
  businessStatus: 'OPERATIONAL', freeAccess: true
};
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('une panne de matrice de trajet ne supprime plus un lieu local aux coordonnées fiables', async () => {
  const result = await classifyCandidate(nearby, {
    origin, duration: '2h', start: '2026-08-12T14:00:00+02:00', surface: 'explorer', travelMode: 'driving'
  }, { travelMinutes: async () => null });
  assert.equal(result.status, 'core');
  assert.equal(result.premium_eligible, true);
  assert.ok(result.decision_codes.includes('TRAVEL_TIME_UNAVAILABLE'));
});

test('un horaire inconnu reste visible dans Explorer mais jamais éligible au programme automatique', async () => {
  const explorer = await classifyCandidate(nearby, {
    origin, duration: '2h', start: '2026-08-12T14:00:00+02:00', surface: 'explorer', travelMode: 'driving'
  }, { travelMinutes: async () => 3 });
  const program = await classifyCandidate(nearby, {
    origin, duration: '2h', start: '2026-08-12T14:00:00+02:00', surface: 'program', travelMode: 'driving'
  }, { travelMinutes: async () => 3 });
  assert.equal(explorer.status, 'core');
  assert.equal(explorer.premium_eligible, true);
  assert.equal(program.premium_eligible, false);
});

test('une réponse API contenant une erreur n’est plus comptée comme une source fonctionnelle', () => {
  assert.match(app, /if\(data\?\.error\)throw new Error\(String\(data\.error\)\)/);
});
