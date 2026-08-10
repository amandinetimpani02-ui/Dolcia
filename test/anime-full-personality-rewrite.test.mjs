import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const programsBlock = app.match(/const DOLCIA_ANIMATE_PROGRAMS=\{[\s\S]*?\n\};/)?.[0] || '';

test('les 20 programmes sont désormais tous réécrits avec un ton animateur (exclamations, énergie), plus une seule fiche technique restante', () => {
  const clinicalPatterns = [/Échauffement — /, /Cœur de séance — /, /Retour au calme — /, /^\s*\['00:00','Installation — /m];
  for (const pattern of clinicalPatterns) assert.doesNotMatch(programsBlock, pattern, `${pattern} ne doit plus apparaître, tous les programmes sont réécrits`);
});

test('aucune incohérence tu/vous dans le texte des étapes — le tutoiement reste réservé à la voix de l’animateur (animateCoachLine, etc.), jamais au contenu des programmes eux-mêmes', () => {
  const withoutFalsePositive = programsBlock.replace(/êtes/g, '');
  assert.doesNotMatch(withoutFalsePositive, /\btu\b|\btoi\b|\bton\b|\bta\b|\btes\b/);
});

test('aucune formulation ne désigne positivement un gagnant ou un perdant sur l’ensemble des 20 programmes réécrits (les négations explicites qui rejettent le classement restent autorisées)', () => {
  const withoutNegations = programsBlock.replace(/jamais un perdant désigné/g, '').replace(/jamais un classement entre enfants/g, '');
  assert.doesNotMatch(withoutNegations, /gagnant|perdant|vainqueur|défaite/i);
});

test('les consignes de sécurité (piscine) restent honnêtes et non affaiblies malgré la réécriture du ton', () => {
  assert.match(programsBlock, /water:\{[\s\S]*?vérifie les règles, la profondeur, et une vraie surveillance active/);
  assert.match(programsBlock, /piscine_grand_jeu:\{[\s\S]*?on confirme la profondeur, les règles, une vraie surveillance active/);
});
