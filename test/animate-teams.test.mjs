import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('deux équipes se forment automatiquement pour un vrai groupe (3 personnes ou plus), jamais pour un duo ou un groupe non identifié', () => {
  assert.match(app, /function buildTeams\(roster\)\{/);
  assert.match(app, /if\(roster\.length<3\|\|roster\[0\]==='Le groupe'\)return null/);
});

test('chaque mission accomplie attribue un point à l’équipe du tour en cours, puis passe la main à l’autre équipe', () => {
  assert.match(app, /if\(session\.teams\)\{session\.teams\[session\.teams\.turn\]\.score\+=10;session\.teams\.turn=session\.teams\.turn==='a'\?'b':'a'\}/);
});

test('la barre d’équipes affiche les deux scores et met en avant celle dont c’est le tour, sans jamais dévaloriser l’autre', () => {
  assert.match(app, /function animateTeamsBar\(session\)/);
  assert.match(css, /\.animate-teams\{/);
  assert.match(css, /\.animate-teams>div\.active/);
});

test('la finale célèbre chaleureusement les deux équipes, jamais un vainqueur et un perdant', () => {
  assert.match(app, /ont toutes les deux été formidables/);
  assert.doesNotMatch(app, /a gagné|a perdu|vainqueur|défaite/i);
});
