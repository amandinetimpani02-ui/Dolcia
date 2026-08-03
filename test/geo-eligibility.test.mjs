import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCandidate, evaluateRarityEvidence, applyAlternativeCheck } from '../server/geo-eligibility.js';
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

test('Nausicaá est recherché régionalement pour une demande explicite aquarium', () => {
  const plan = buildRetrievalPlan({ queries: ['zoo aquarium ferme pédagogique'], momentSentence: 'Je veux visiter un aquarium', duration: 'day', localRadius: 12000 });
  assert.ok(plan.some(entry => entry.scope === 'signature' && entry.radius >= 50000 && /aquarium/.test(entry.query)));
});

test('une fête de village régionale (ex. Fête du Cochon Rose à Hesdin, 30km) est vérifiée même sans mot-clé "festival" explicite dans la demande', () => {
  const plan = buildRetrievalPlan({ queries: ['restaurants', 'plage nature'], momentSentence: 'Je suis au Touquet, qu’est-ce qu’on fait ce week-end ?', duration: 'day', localRadius: 12000 });
  const majorEvent = plan.find(entry => entry.reason === 'MAJOR_EVENT_SIGNATURE');
  assert.ok(majorEvent, 'la vérification des grands événements doit tourner même sans mot-clé');
  assert.ok(majorEvent.radius >= 30000, 'le rayon doit couvrir au moins 30km (ex. Hesdin depuis Le Touquet)');
  assert.match('fête du cochon rose hesdin', /f[eê]te/i);
});

test('les requêtes internes larges ne déclenchent jamais seules un débordement régional sur les centres d’intérêt personnels (aquarium, parc à thème, nautique)', () => {
  const plan = buildRetrievalPlan({ queries: ['zoo aquarium ferme pédagogique', 'parc attractions'], duration: 'day', localRadius: 12000 });
  const personalInterestLeaks = plan.filter(entry => entry.scope === 'signature' && entry.reason !== 'MAJOR_EVENT_SIGNATURE');
  assert.equal(personalInterestLeaks.length, 0);
  // Exception assumée : la vérification des grands événements régionaux (fête, festival...) tourne
  // systématiquement dès qu'une recherche régionale est possible, sans mot-clé requis — c'est
  // précisément le rôle d'une pépite locale que la personne n'a pas à deviner elle-même.
  assert.ok(plan.some(entry => entry.reason === 'MAJOR_EVENT_SIGNATURE'));
});

test('la même demande explicite ne déborde pas régionalement pour deux heures', () => {
  const plan = buildRetrievalPlan({ queries: ['zoo aquarium ferme pédagogique'], momentSentence: 'Je veux visiter un aquarium', duration: '2h', localRadius: 12000 });
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

test('une activité ordinaire hors destination ne devient jamais locale grâce à la distance à vol d’oiseau', async () => {
  const result = await classifyCandidate(candidate({
    lat: 50.55,
    lng: 1.61,
    destinationLocalityMatch: false,
    rarityEvidence: { level: 'low' }
  }), context({ duration: 'day', surface: 'explorer' }), { travelMinutes: async () => 12 });
  assert.equal(result.status, 'outside');
  assert.equal(result.premium_eligible, false);
});

test('une pépite extérieure reste possible si sa rareté est prouvée et le trajet compatible', async () => {
  const result = await classifyCandidate(candidate({
    lat: 50.60,
    lng: 1.65,
    destinationLocalityMatch: false,
    retrievalScope: 'signature',
    categoryScope: 'wide',
    rarityEvidence: { level: 'high', source: 'Office de tourisme', sourceType: 'tourism_office', checkedAt: new Date().toISOString() }
  }), context({ duration: 'day', surface: 'explorer' }), { travelMinutes: async () => 28 });
  assert.equal(result.status, 'extended');
  assert.equal(result.premium_eligible, true);
  assert.ok(result.decision_codes.includes('HIGH_RARITY'));
});

test('un parc de loisirs proche peut compléter Le Touquet sans devenir une excursion régionale', async () => {
  const result = await classifyCandidate(candidate({
    id: 'labyparc-proche',
    lat: 50.50,
    lng: 1.66,
    destinationLocalityMatch: false,
    experienceKind: 'theme_park',
    category: 'outside',
    rarityEvidence: { level: 'low' }
  }), context({ duration: 'day', surface: 'explorer' }), { travelMinutes: async () => 12 });
  assert.equal(result.status, 'extended');
  assert.equal(result.premium_eligible, true);
  assert.ok(result.decision_codes.includes('NEARBY_COMPLEMENT'));
});

test('une activité nautique à Hardelot disparaît si une activité équivalente existe au Touquet', () => {
  const base = {
    premium_eligible: true,
    decision_codes_version: '1.0.3',
    geo_rules_version: '1.1.0',
    decision_codes: ['COORDINATES_RELIABLE', 'CATEGORY_SCOPE_WIDE', 'TRAVEL_COMPATIBLE_WITH_DURATION', 'HOURS_COMPATIBLE', 'HIGH_RARITY', 'EVIDENCE_VALID', 'DEFAULT_SCOPE'],
    blocking_reasons: [],
    evidence: [],
    location_confidence: .95,
    travel_mode: 'driving'
  };
  const checked = applyAlternativeCheck([
    { id: 'touquet-nautique', category: 'outside', experienceKind: 'water', qualityScore: 88, result: { ...base, status: 'core', distance_km: 1.4, travel_minutes: 5 } },
    { id: 'hardelot-nautique', category: 'outside', experienceKind: 'water', qualityScore: 90, result: { ...base, status: 'extended', distance_km: 18, travel_minutes: 28 } }
  ]);
  const hardelot = checked.find(item => item.id === 'hardelot-nautique');
  assert.equal(hardelot.result.status, 'outside');
  assert.ok(hardelot.result.blocking_reasons.includes('CORE_EQUIVALENT_EXISTS'));
});
