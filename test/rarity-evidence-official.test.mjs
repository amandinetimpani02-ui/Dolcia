import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const recommendations = readFileSync(new URL('../server/recommendations.js', import.meta.url), 'utf8');

test('une source officielle et une date prouvent l’existence, jamais automatiquement la rareté', () => {
  assert.match(recommendations, /const proofEvidence = item\.proofEvidence \|\| \(item\.official && item\.date \? \{/);
  assert.match(recommendations, /rarityEvidence: item\.rarityEvidence \|\| null/);
  assert.doesNotMatch(recommendations, /item\.official && item\.date[^\n]*level:\s*'high'/);
});

test('la preuve conserve sa source réelle sans fabriquer un statut de pépite', () => {
  assert.match(recommendations, /const sourceType = \/ticketmaster\|billetterie\/i\.test\(item\.source \|\| ''\) \? 'ticketing_platform' : 'tourism_office'/);
  assert.match(recommendations, /source: item\.source \|\| 'Source officielle'/);
  assert.match(recommendations, /checkedAt: item\.retrievedAt \|\| new Date\(\)\.toISOString\(\)/);
});

test('un lieu officiel sans rendez-vous daté ne reçoit même pas une preuve événementielle', () => {
  assert.match(recommendations, /item\.official && item\.date \? \{/);
  assert.match(recommendations, /\}\s*: null\);/);
});
