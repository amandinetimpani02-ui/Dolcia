import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('ARCHITECTURE.md §5 devient du vrai code : desireScore compte des signaux vérifiés, jamais une intuition', () => {
  assert.match(app, /function desireScore\(item\)\{/);
  assert.match(app, /if\(\(item\.rating\|\|0\)>=4\.6&&\(item\.reviews\|\|0\)>=50/);
  assert.match(app, /if\(item\.geoEligibility\?\.status==='extended'\)score\+\+/);
});

test('la surprise n’existe que si le désir existe déjà (Constitution, loi 12)', () => {
  assert.match(app, /function surpriseScore\(item\)\{\n\s*if\(desireScore\(item\)<1\)return 0/);
});

test('le classement suit l’ordre lexicographique strict d’ARCHITECTURE.md §5.4 : désir, puis surprise, puis expiration, puis distance', () => {
  assert.match(app, /function scenarioRank\(a,b\)\{/);
  assert.match(app, /return desireScore\(b\)-desireScore\(a\)/);
  assert.match(app, /\|\|surpriseScore\(b\)-surpriseScore\(a\)/);
});

test('scenarioRank est bien la première clé de tri du mode "recommandé", les anciens critères deviennent des repères secondaires', () => {
  assert.match(app, /items\.sort\(\(a,b\)=>scenarioRank\(a,b\)\|\|\(geoOrder\[a\.geoEligibility\?\.status\]/);
});

test('un item déjà consulté (favori ou souvenir) ne compte jamais comme une surprise', () => {
  assert.match(app, /if\(!state\.experienceMemories\[item\.id\]&&!state\.favorites\.includes\(item\.id\)\)score\+\+/);
});
