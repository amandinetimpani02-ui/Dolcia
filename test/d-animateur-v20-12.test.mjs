import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const coach = await readFile(new URL('../server/coach-conversation.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../premium.css', import.meta.url), 'utf8');

test('D anime avec les prénoms et fait tourner le rôle de capitaine', () => {
  assert.match(app, /roster:roster\.length\?roster/);
  assert.match(app, /function animateCaptain\(/);
  assert.match(app, /Capitaine · \$\{esc\(animateCaptain\(session\)\)\}/);
  assert.match(app, /session\.captainIndex=\(session\.captainIndex\+1\)/);
});

test('le groupe peut rire, parler et créer ses clins d’œil sans être noté', () => {
  assert.match(app, /On a ri/);
  assert.match(app, /function askAnimateCoach\(/);
  assert.match(app, /function rememberAnimateJoke\(/);
  assert.match(app, /seulement pour mieux vous retrouver/);
  assert.match(css, /\.animate-conversation/);
  assert.match(css, /\.animate-talk/);
});

test('D propose de vrais jeux connus dans un thème adulte distinct', () => {
  for (const game of ['ni oui ni non', 'menteur', 'Mime éclair', 'Cap ou pas cap']) assert.match(app, new RegExp(game, 'i'));
  assert.match(app, /if\(\['friends','colleagues'\]\.includes\(who\)&&vibes\.includes\('play'\)\)return'party'/);
});

test('la persona utilise les prénoms et les rituels avec retenue', () => {
  assert.match(coach, /utilise naturellement les prénoms fournis/);
  assert.match(coach, /clin d'œil ou un rituel du groupe/);
  assert.match(coach, /jamais jusqu'à l'usure/);
});
