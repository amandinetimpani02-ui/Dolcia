import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('le moteur de comportements existe, séparé du contenu des 20 expériences', () => {
  assert.match(app, /const ANIMATOR_BEHAVIORS=\{/);
  assert.match(app, /function pickAnimatorLine\(behavior,\.\.\.args\)\{/);
});

test('aucun comportement ne prétend percevoir un signal que Dolcia n’a pas réellement (malaise, désengagement visuel) — seulement des signaux mesurables', () => {
  const block = app.match(/const ANIMATOR_BEHAVIORS=\{[\s\S]*?\n\};/)?.[0] || '';
  assert.doesNotMatch(block, /malaise|décroche|s’ennuie/i);
});

test('vouvoiement absent du moteur de comportements — cohérent avec la règle tu/vous de Dolcia Anime', () => {
  const block = app.match(/const ANIMATOR_BEHAVIORS=\{[\s\S]*?\n\};/)?.[0] || '';
  assert.doesNotMatch(block, /\bvous\b|\bvotre\b|\bvos\b/i);
});

test('la félicitation de fin de session par équipes est maintenant variée (plusieurs formulations), pas une phrase unique figée', () => {
  const block = app.match(/feliciter_sans_gagnant:\[[\s\S]*?\],/)?.[0] || '';
  const variants = (block.match(/\(a,b\)=>/g) || []).length;
  assert.ok(variants >= 3, 'au moins 3 variantes pour créer une vraie variété perçue');
  const lines = block.match(/`[^`]*`/g) || [];
  for (const line of lines) assert.doesNotMatch(line, /gagnant|perdant|vainqueur/i, `${line} ne doit désigner ni gagnant ni perdant`);
});

test('la clôture par équipes utilise réellement le moteur de comportements, plus une phrase codée en dur', () => {
  assert.match(app, /const teamsClosing=session\.teams\?`<p class="animate-teams-closing">\$\{pickAnimatorLine\('feliciter_sans_gagnant'/);
});

test('chaque comportement ne se déclenche que sur un signal déjà réellement suivi dans le code (pas une nouvelle donnée à inventer)', () => {
  assert.match(app, /lastInteractionAt:Date\.now\(\)/, 'lastInteractionAt doit exister réellement pour justifier relance_apres_silence');
  assert.match(app, /session\.teams\[session\.teams\.turn\]\.score/, 'les scores d’équipe doivent exister réellement pour justifier feliciter_sans_gagnant');
});
