import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('la première question ne confond plus durée et date : l’agenda exact est le choix principal', () => {
  const start = app.indexOf("function renderEclatQuestion");
  const end = app.indexOf("function answerEclat", start);
  const question = app.slice(start, end);
  assert.match(question, /Quel jour venez-vous, et à quelle heure/);
  assert.match(question, /Ouvrir mon agenda · jour, heures et durée/);
  assert.ok(question.indexOf("['custom'") < question.indexOf("['now'"));
  assert.doesNotMatch(question, /Maintenant · pour 2 heures/);
});

test('un couple avec un petit budget voit les gratuits locaux avant tout assouplissement', () => {
  assert.match(app, /const couple=state\.answers\.who==='couple'/);
  assert.match(app, /Votre budget n’est pas le problème/);
  assert.match(app, /function showFreeLocalIdeas\(\)/);
  assert.match(app, /state\.catalogFilters\.lenses=\['free'\]/);
  assert.match(app, /Le rendez-vous complice avec D/);
});

test('les anciens contextes sans date complète sont invalidés une fois après mise à jour', () => {
  assert.match(app, /MOMENT_SCHEMA_VERSION='21\.52-date-time-required'/);
  assert.match(app, /localStorage\.getItem\('dolcia_moment_schema_v1'\)===MOMENT_SCHEMA_VERSION/);
  assert.match(app, /localStorage\.setItem\('dolcia_moment_schema_v1',MOMENT_SCHEMA_VERSION\)/);
});
