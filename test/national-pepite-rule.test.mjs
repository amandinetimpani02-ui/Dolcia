import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCandidate, GEO_THRESHOLDS } from '../server/geo-eligibility.js';

function baseCandidate(overrides = {}) {
  return {
    id: 'candidate', locationConfidence: .9, businessStatus: 'OPERATIONAL',
    retrievalScope: 'signature', categoryScope: 'wide',
    openingPeriods: [{ open: { day: 4, time: '2000' }, close: { day: 4, time: '2359' } }],
    official: true, date: '2026-08-13T21:00:00+02:00',
    destinationLocalityMatch: false,
    rarityEvidence: { level: 'high', source: 'Office de tourisme', sourceType: 'tourism_office', checkedAt: new Date().toISOString() },
    ...overrides
  };
}

test('la règle des pépites est un budget de temps de trajet identique partout en France, pas un réglage par ville', async () => {
  const dayBudget = Math.round(GEO_THRESHOLDS.travelMinutes.day * 1.35); // 61 minutes
  const start = '2026-08-13T20:00:00+02:00';

  const villes = [
    { nom: 'Le Touquet', origin: { lat: 50.5214, lng: 1.5912 } },
    { nom: 'Lyon', origin: { lat: 45.7640, lng: 4.8357 } },
    { nom: 'Brest', origin: { lat: 48.3904, lng: -4.4861 } },
  ];

  for (const ville of villes) {
    const context = { origin: ville.origin, duration: 'day', start, travelMode: 'driving', surface: 'program' };
    const candidateNear = baseCandidate({ lat: ville.origin.lat + 0.3, lng: ville.origin.lng + 0.3 });
    const withinBudget = await classifyCandidate(candidateNear, context, { travelMinutes: async () => dayBudget - 5 });
    const overBudget = await classifyCandidate(candidateNear, context, { travelMinutes: async () => dayBudget + 15 });
    assert.equal(withinBudget.status, 'extended', `${ville.nom} : dans le budget doit passer en extended`);
    assert.equal(overBudget.status, 'outside', `${ville.nom} : hors budget doit rester outside`);
  }
});

test('les seuils de temps par durée forment une seule source de vérité (GEO_THRESHOLDS), pas des chiffres dupliqués ailleurs', () => {
  assert.deepEqual(GEO_THRESHOLDS.travelMinutes, { '2h': 15, evening: 15, morning: 25, afternoon: 30, afternoon_evening: 35, day: 45, stay: 90 });
});
