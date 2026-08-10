import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCandidate, applyAlternativeCheck } from '../server/geo-eligibility.js';

const origin = { lat: 50.5214, lng: 1.5912 };
const checkedAt = new Date().toISOString();
const context = (overrides = {}) => ({
  origin, duration: 'day', start: '2026-08-13T09:00:00+02:00', travelMode: 'driving',
  surface: 'explorer', ...overrides
});
const verified = (source = 'Office de tourisme') => ({
  verified: true, source, sourceType: 'tourism_office', checkedAt
});
const rare = { level: 'high', source: 'Programme officiel daté', sourceType: 'tourism_office', checkedAt };
const distant = (overrides = {}) => ({
  id: 'distant', lat: 50.72, lng: 1.61, locationConfidence: .96,
  destinationLocalityMatch: false, businessStatus: 'OPERATIONAL', officialEvent: true,
  dateCompatible: true, retrievalScope: 'signature', categoryScope: 'wide',
  rarityEvidence: rare, proofEvidence: verified(), singularityEvidence: verified('Dossier organisateur'),
  ...overrides
});
const classify = (item, ctx = context(), minutes = 30) =>
  classifyCandidate(item, ctx, { travelMinutes: async () => minutes });

for (const [label, kind] of [['restaurant banal éloigné', 'restaurant'], ['hôtel éloigné', 'hotel']]) {
  test(`${label} : jamais une pépite, même avec tous les autres signaux`, async () => {
    const result = await classify(distant({ experienceKind: kind, category: kind }));
    assert.equal(result.status, 'outside');
    assert.ok(result.decision_codes.includes('CATEGORY_NEVER_DISTANT'));
  });
}

for (const [label, kind] of [['aquarium générique éloigné', 'aquarium'], ['parc générique éloigné', 'theme_park']]) {
  test(`${label} : refusé sans scénario régional explicite`, async () => {
    const result = await classify(distant({ experienceKind: kind, category: kind }));
    assert.equal(result.status, 'outside');
    assert.ok(result.decision_codes.includes('EXPLICIT_REGIONAL_SCENARIO_MISSING'));
  });
}

test('officiel et daté prouve l’existence mais ne prouve pas la rareté', async () => {
  const result = await classify(distant({ rarityEvidence: null, experienceKind: 'concert' }));
  assert.equal(result.status, 'outside');
  assert.ok(result.decision_codes.includes('PROOF_VALID'));
  assert.ok(result.decision_codes.includes('RARITY_UNVERIFIED'));
});

test('rare mais non vérifié : aucune pépite', async () => {
  const result = await classify(distant({ proofEvidence: null, experienceKind: 'atelier_unique' }));
  assert.equal(result.status, 'outside');
  assert.ok(result.decision_codes.includes('PROOF_MISSING'));
});

test('élargissement utilisateur seul : exploration possible, statut extended impossible', async () => {
  const result = await classify(distant({ rarityEvidence: null, proofEvidence: null, singularityEvidence: null }), context({ userWidenedSearch: true }));
  assert.equal(result.status, 'outside');
  assert.ok(result.decision_codes.includes('USER_WIDENED_SEARCH'));
});

test('vraie pépite prouvée, singulière et compatible : extended possible', async () => {
  const result = await classify(distant({ experienceKind: 'atelier_unique' }));
  assert.equal(result.status, 'extended');
  assert.ok(result.effort_explanation);
});

test('une capacité inconnue ne bloque pas quand elle n’est pas pertinente', async () => {
  const result = await classify(distant({ experienceKind: 'observation_astronomique', capacityRelevant: false }));
  assert.equal(result.status, 'extended');
  assert.ok(result.decision_codes.includes('CAPACITY_NOT_APPLICABLE'));
});

test('une capacité pertinente mais non vérifiée bloque la pépite', async () => {
  const result = await classify(distant({ experienceKind: 'atelier_places_limitees', capacityRelevant: true }));
  assert.equal(result.status, 'outside');
  assert.ok(result.decision_codes.includes('CAPACITY_MISSING_WHEN_RELEVANT'));
});

test('outside n’est jamais proposé comme choix premium', async () => {
  const result = await classify(distant({ rarityEvidence: { level: 'low' } }));
  assert.equal(result.status, 'outside');
  assert.equal(result.premium_eligible, false);
});

test('location_unknown ne suppose ni distance ni temps de trajet', async () => {
  const result = await classify(distant({ lat: null, lng: null, locationConfidence: .1 }));
  assert.equal(result.status, 'location_unknown');
  assert.equal(result.distance_km, null);
  assert.equal(result.travel_minutes, null);
});

test('Nausicaá sur une demande générique aquarium : non', async () => {
  const result = await classify(distant({ id: 'nausicaa', experienceKind: 'aquarium', category: 'aquarium' }));
  assert.equal(result.status, 'outside');
});

test('Nausicaá dans un scénario marin explicite et prouvé : possible', async () => {
  const result = await classify(distant({
    id: 'nausicaa-scenario', experienceKind: 'aquarium', category: 'aquarium', explicitRegionalScenario: true
  }), context({ explicitRegionalScenario: true }));
  assert.equal(result.status, 'extended');
  assert.ok(result.decision_codes.includes('EXPLICIT_REGIONAL_SCENARIO'));
});

test('une alternative locale raisonnable déclassifie toujours la proposition lointaine', async () => {
  const regionalResult = await classify(distant({ experienceKind: 'atelier_unique' }));
  const [local, regional] = applyAlternativeCheck([
    { id: 'local', category: 'atelier', experienceKind: 'atelier_unique', substitutabilityKey: 'atelier:nichoir', result: { ...regionalResult, status: 'core', distance_km: 2, travel_minutes: 5 } },
    { id: 'regional', category: 'atelier', experienceKind: 'atelier_unique', substitutabilityKey: 'atelier:nichoir', result: regionalResult }
  ]);
  assert.equal(local.result.status, 'core');
  assert.equal(regional.result.status, 'outside');
  assert.ok(regional.result.blocking_reasons.includes('CORE_EQUIVALENT_EXISTS'));
});
