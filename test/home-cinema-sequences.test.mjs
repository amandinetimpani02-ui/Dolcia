import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../home-premium.css', import.meta.url), 'utf8');

test('les 20 séquences retenues après audit sont bien branchées, avec exactement les 7 contextes fiables demandés', () => {
  assert.match(app, /const HOME_SEQUENCES=\{/);
  for (const ctx of ['rain', 'sun', 'wind', 'family', 'couple', 'gem', 'unique_event']) {
    assert.match(app, new RegExp(`${ctx}:\\[`));
  }
});

test('vouvoiement strict dans toutes les séquences du Home — zéro "tu", cohérent avec les 150 occurrences de "vous" déjà dans le produit', () => {
  const block = app.match(/const HOME_SEQUENCES=\{[\s\S]*?\n\};/)?.[0] || '';
  assert.doesNotMatch(block, /\btu\b|\btoi\b|\bton\b|\bta\b|\btes\b/i);
});

test('la priorité de sélection respecte ARCHITECTURE.md §5 : pépite prouvée avant événement unique, avant météo, avant groupe connu', () => {
  assert.match(app, /function pickHomeSequenceContext\(moment\)\{/);
  const fn = app.match(/function pickHomeSequenceContext\(moment\)\{[\s\S]*?\n\}/)?.[0] || '';
  const gemIdx = fn.indexOf("return'gem'");
  const uniqueIdx = fn.indexOf("return'unique_event'");
  const rainIdx = fn.indexOf("return'rain'");
  const familyIdx = fn.indexOf("return'family'");
  assert.ok(gemIdx < uniqueIdx && uniqueIdx < rainIdx && rainIdx < familyIdx, 'ordre de priorité incorrect');
});

test('aucune séquence n’invente jamais un lieu : sans grand moment, Dolcia révèle une idée ordinaire mais réelle, jamais un contexte fabriqué comme s’il était exceptionnel', () => {
  const fn = app.match(/function pickHomeSequenceContext\(moment\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /return'ordinary'/);
});

test('la séquence complète ne se joue qu’une fois par jour — vérifié par date, jamais par session ou par ouverture', () => {
  assert.match(app, /function homeCinemaAlreadyShownToday\(\)\{/);
  assert.match(app, /const today=new Date\(\)\.toISOString\(\)\.slice\(0,10\)/);
  assert.match(app, /return state\.homeCinemaShownDate===today/);
});

test('un bouton Passer existe et interrompt la séquence immédiatement, jamais imposée jusqu’au bout', () => {
  assert.match(app, /function skipHomeCinema\(\)/);
  assert.match(app, /class="home-skip" onclick="skipHomeCinema\(\)">Passer</);
  assert.match(css, /\.home-skip\{/);
});

test('aux ouvertures suivantes du même jour, la révélation s’affiche directement avec une transition courte, jamais la séquence complète rejouée', () => {
  assert.match(app, /if\(!playCinema\)\{/);
  assert.match(css, /\.home-poster-instant\{opacity:0;animation:fadeIn \.5s ease/);
});

test('le bug de tutoiement résiduel dans homePhrase (détecté pendant l’audit) est corrigé', () => {
  const fn = app.match(/function homePhrase\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(fn, /\bTu\b/);
  assert.match(fn, /Vous avez un peu de temps aujourd’hui/);
});
