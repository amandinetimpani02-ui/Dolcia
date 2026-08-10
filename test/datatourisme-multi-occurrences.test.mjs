import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../server/datatourisme.js';

// Découverte vérifiée sur la documentation officielle de l'ontologie DATAtourisme :
// takesPlaceAt pointe vers un type Period, avec une sous-classe explicite RecurrentPeriod
// distincte de LimitedPeriod. Notre normalize() précédent ne faisait aucune différence et ne
// prenait que la première date trouvée n'importe où dans l'objet — perdant potentiellement
// exactement le type de programmation multi-dates qu'on a dû recréer à la main pour Le Touquet
// et Chartres.

test('un événement à occurrence unique reste simple, une seule occurrence produite', () => {
  const item = {
    uuid: 'a', label: { fr: 'Concert' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'x',
    takesPlaceAt: { '@type': ['Period', 'LimitedPeriod'], startDate: '2026-08-15', startTime: '21:00:00' }
  };
  const result = normalize(item);
  assert.equal(result.occurrences.length, 1);
  assert.equal(result.hasMultipleOccurrences, false);
});

test('un événement à plusieurs occurrences explicites (takesPlaceAt en tableau) produit une occurrence par entrée, jamais écrasées en une seule date', () => {
  const item = {
    uuid: 'b', label: { fr: 'Festival' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'y',
    takesPlaceAt: [
      { '@type': ['Period', 'LimitedPeriod'], startDate: '2026-08-06', startTime: '21:00:00' },
      { '@type': ['Period', 'LimitedPeriod'], startDate: '2026-08-08', startTime: '21:00:00' },
      { '@type': ['Period', 'LimitedPeriod'], startDate: '2026-08-15', startTime: '21:00:00' }
    ]
  };
  const result = normalize(item);
  assert.equal(result.occurrences.length, 3);
  assert.equal(result.hasMultipleOccurrences, true);
  assert.deepEqual(result.occurrences.map(o => o.startDate), ['2026-08-06', '2026-08-08', '2026-08-15']);
});

test('une période récurrente (RecurrentPeriod) est identifiée comme telle, avec ses bornes et jours réels — jamais expansée en dates devinées', () => {
  const item = {
    uuid: 'c', label: { fr: 'Marché' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'z',
    takesPlaceAt: { '@type': ['Period', 'RecurrentPeriod'], startDate: '2026-07-01', endDate: '2026-08-31', startTime: '08:00:00', dayOfWeek: 'Saturday' }
  };
  const result = normalize(item);
  assert.equal(result.isRecurrent, true);
  assert.equal(result.occurrences[0].daysOfWeek, 'Saturday');
  assert.equal(result.occurrences[0].endDate, '2026-08-31');
});

test('aucune occurrence n’est inventée quand takesPlaceAt est absent', () => {
  const item = { uuid: 'd', label: { fr: 'Sans date' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'w' };
  const result = normalize(item);
  assert.equal(result.date, null);
  assert.equal(result.occurrences, null);
});

test('la description longue (hasDescription) est désormais extraite quand disponible', () => {
  const item = {
    uuid: 'e', label: { fr: 'Test' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'v',
    hasDescription: { shortDescription: { fr: 'Une belle description' } }
  };
  const result = normalize(item);
  assert.equal(result.description, 'Une belle description');
});
