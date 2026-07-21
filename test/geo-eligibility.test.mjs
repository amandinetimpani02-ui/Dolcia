import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCandidate, evaluateRarityEvidence } from '../server/geo-eligibility.js';
import { buildRetrievalPlan } from '../server/retrieval-planner.js';
import { validateDecisionCodes } from '../server/decision-codes.js';

const origin = { lat: 50.5214, lng: 1.5912 };
const context = (overrides = {}) => ({ origin, duration: 'day', start: '2026-07-16T09:00:00+02:00', travelMode: 'driving', surface: 'program', ...overrides });
const candidate = (overrides = {}) => ({ id: 'x', lat: 50.53, lng: 1.60, locationConfidence: .95, openingPeriods: [{ open: { day: 4, time: '0800' }, close: { day: 4, time: '2000' } }], businessStatus: 'OPERATIONAL', retrievalScope: 'local', categoryScope: 'narrow', ...overrides });

test('un lieu proche mais fermé à l’arrivée est refusé', async () => {
  const result = await classifyCandidate(candidate({ openingPeriods: [{ open: { day: 4, time: '0800' }, close: { day: 4, time: '1000' } }] }), context({ start: '2026-07-16T19:00:00+02:00' }), { travelMinutes: async () => 5 });
  assert.equal(result.status, 'outside');
  assert.ok(result.blocking_reasons.includes('HOURS_INCOMPATIBLE'));
});

test('un lieu fermé définitivement est toujours refusé', async () => {
  const result = await classifyCandidate(candidate({ businessStatus: 'CLOSED_PERMANENTLY' }), context(), { travelMinutes: async () => 5 });
  assert.equal(result.status, 'outside');
  assert.ok(result.blocking_reasons.includes('CLOSED_PERMANENTLY'));
});

test('une localisation non fiable ne rejoint jamais un programme premium', async () => {
  const result = await classifyCandidate(candidate({ lat: null, lng: null, locationConfidence: .1 }), context());
  assert.equal(result.status, 'location_unknown');
});

test('Nausicaá est recherché régionalement pour une journée animaux', () => {
  const plan = buildRetrievalPlan({ queries: ['zoo aquarium ferme pédagogique'], duration: 'day', localRadius: 12000 });
  assert.ok(plan.some(entry => entry.scope === 'signature' && entry.radius >= 50000 && /aquarium/.test(entry.query)));
});

test('la même recherche ne déborde pas régionalement pour deux heures', () => {
  const plan = buildRetrievalPlan({ queries: ['zoo aquarium ferme pédagogique'], duration: '2h', localRadius: 12000 });
  assert.ok(plan.every(entry => entry.scope === 'local'));
});

test('les codes inconnus et contradictoires sont rejetés', () => {
  assert.equal(validateDecisionCodes(['HOURS_COMPATIBLE', 'HOURS_INCOMPATIBLE']).valid, false);
  assert.equal(validateDecisionCodes(['CODE_INVENTE']).valid, false);
});

test('une prétendue rareté envoyée par une source non fiable est refusée', () => {
  const result = evaluateRarityEvidence({ level: 'high', source: 'affirmation client', sourceType: 'unverified_client_claim', checkedAt: '2026-07-16' });
  assert.equal(result.level, 'unknown');
  assert.ok(result.codes.includes('EVIDENCE_UNTRUSTED_SOURCE'));
});

test('une preuve trop ancienne ne peut jamais justifier une rareté haute', () => {
  const result = evaluateRarityEvidence({ level: 'high', source: 'Site officiel', sourceType: 'official_website', checkedAt: '2020-01-01' });
  assert.equal(result.level, 'unknown');
  assert.ok(result.codes.includes('EVIDENCE_STALE'));
  assert.ok(result.codes.includes('RARITY_UNVERIFIED'));
});

test('une catégorie signature ne rend pas un trajet de 35 minutes compatible avec un créneau de 2h', async () => {
  const result = await classifyCandidate(candidate({ lat: 50.7309, lng: 1.5957, retrievalScope: 'signature', categoryScope: 'wide', rarityEvidence: { level: 'high', source: 'Site officiel', sourceType: 'official_website', checkedAt: '2026-07-16' } }), context({ duration: '2h' }), { travelMinutes: async () => 35 });
  assert.equal(result.status, 'outside');
  assert.equal(result.premium_eligible, false);
  assert.ok(result.blocking_reasons.includes('TRAVEL_INCOMPATIBLE_WITH_DURATION'));
});
