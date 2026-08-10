import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const coach = await readFile(new URL('../server/coach-conversation.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('D conserve une conversation écrite visible et contextualisée', () => {
  assert.match(app, /function dCoachConversationMarkup\(/);
  assert.match(app, /messages:\[\]/);
  assert.match(app, /relationshipMemory/);
  assert.match(app, /service=coach/);
  assert.match(app, /async function askDCoach\(/);
  assert.match(css, /\.d-coach-thread/);
  assert.match(css, /\.d-coach-thread \.from-user/);
});

test('D propose sans imposer et attend un accord explicite', () => {
  assert.match(app, /function mountDCoachSuggestion\(/);
  assert.match(app, /Oui, allons-y/);
  assert.match(app, /Pas encore/);
  assert.match(coach, /demandes toujours l'accord avant de modifier/);
  assert.match(coach, /au maximum deux directions contrastées/);
});

test('la personnalité de D combine empathie, humour et animation du groupe', () => {
  assert.match(coach, /club sans murs/);
  assert.match(coach, /humour est complice/);
  assert.match(coach, /Pour les enfants[\s\S]*Pour les adolescents[\s\S]*Pour les adultes/);
  assert.match(coach, /rebond humain précis/);
  assert.match(coach, /Ne recommence jamais la conversation à zéro/);
});
