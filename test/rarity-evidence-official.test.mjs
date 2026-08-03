import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const recommendations = readFileSync(new URL('../server/recommendations.js', import.meta.url), 'utf8');

test('un événement officiel et daté (concert, fête...) reçoit automatiquement une preuve de rareté reconnue, sans quoi il restait invisible même correctement recherché', () => {
  assert.match(recommendations, /rarityEvidence: item\.rarityEvidence \|\| \(item\.official && item\.date && !looksRecurring \? \{ level: 'high'/);
  assert.match(recommendations, /sourceType: 'tourism_office'/);
});

test('un événement qui semble récurrent (chaque semaine) ne reçoit pas le même statut de pépite exceptionnelle qu’un rendez-vous unique, même officiel et daté', () => {
  assert.match(recommendations, /const RECURRING_PATTERN = \/\\b\(tous les/);
  assert.match(recommendations, /const looksRecurring = RECURRING_PATTERN\.test/);
});

test('un lieu officiel mais permanent (sans date précise, ex. mairie) ne reçoit pas de preuve de rareté fabriquée à tort', () => {
  const fn = recommendations.match(/rarityEvidence: item\.rarityEvidence \|\|[^\n]*/)?.[0] || '';
  assert.match(fn, /item\.official && item\.date/, 'la condition doit exiger une date, pas juste "officiel"');
});
