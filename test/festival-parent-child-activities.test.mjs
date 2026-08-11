import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../server/touquet-events.js';

const source = readFileSync(new URL('../server/touquet-events.js', import.meta.url), 'utf8');

test('le festival est un événement parent, jamais une activité proposable en soi — chaque rendez-vous porte son propre champ parentEvent', () => {
  assert.match(source, /parentEvent: festivalParent\.title/);
  assert.match(source, /const festivalParent = \{ title: 'Festival des Tout-Petits'/);
});

test('scénario exact demandé : le 15 juillet 2026 retrouve séparément l’atelier baby-gym (4 créneaux planifiables, 8€, 2-6 ans) et les jeux de plein air (14h-18h)', async () => {
  const events = await new Promise((resolve) => {
    handler({ query: { after: '2026-07-15', before: '2026-07-15' } }, {
      setHeader: () => {},
      status: () => ({ json: (payload) => resolve(payload.events) })
    });
  });
  const babyGymSlots = events.filter(e => e.title === 'Atelier baby gym parent-enfant');
  assert.equal(babyGymSlots.length, 4, 'les 4 créneaux doivent devenir 4 entrées planifiables distinctes, jamais un texte concaténé');
  assert.equal(babyGymSlots[0].date, '2026-07-15T09:30:00+02:00');
  assert.equal(babyGymSlots[3].date, '2026-07-15T17:00:00+02:00');
  assert.ok(babyGymSlots.every(e => e.ageRange === 'De 2 à 6 ans' && e.price === 8), 'chaque créneau porte ses propres données, jamais héritées différemment');
  assert.ok(new Set(babyGymSlots.map(e => e.occurrenceGroup)).size === 1, 'les 4 créneaux restent reliés entre eux par un même groupe');
  const jeuxPleinAir = events.find(e => e.title === 'Jeux de plein air');
  assert.ok(jeuxPleinAir, 'les jeux de plein air doivent apparaître comme activité autonome');
  assert.deepEqual(jeuxPleinAir.hoursRange, { start: '14:00', end: '18:00' });
});

test('les activités non vérifiées individuellement restent honnêtement marquées comme telles, jamais enrichies par supposition', () => {
  assert.match(source, /detailsVerified: Boolean\(details\)/);
});
