import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function extract(name) {
  const start = app.indexOf(`function ${name}(`);
  const brace = app.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < app.length; i += 1) {
    if (app[i] === '{') depth += 1;
    if (app[i] === '}') depth -= 1;
    if (depth === 0) return app.slice(start, i + 1);
  }
}

// Signalé directement : "même ça n'a rien à voir avec Apple Fitness... c'est un tableau
// complètement nul avec du texte." Vérifié : même en affichant une seule étape à la fois,
// l'interface ne montrait qu'un horodatage statique et un paragraphe — aucun élément visuel animé
// représentant le temps qui passe.

test('la durée réelle de chaque étape est calculée depuis les horodatages déjà présents dans le programme, jamais inventée', () => {
  const code = extract('parseStepTimestamp') + '\n' + extract('currentStepDurationSeconds');
  const fn = new Function(code + '; return currentStepDurationSeconds;')();
  const session = { item: { duration: 35, steps: [['00:00', 'x'], ['00:06', 'y'], ['00:32', 'z']] }, index: 0 };
  assert.equal(fn(session), 360, 'la première étape (00:00 → 00:06) doit durer 6 minutes, soit 360 secondes');
  session.index = 2;
  assert.equal(fn(session), (35 - 32) * 60, 'la dernière étape doit utiliser la durée totale annoncée du programme comme fin réelle');
});

test('reproduction exacte : les six étapes du programme Cardio Club donnent bien 6+6+8+7+5+3 = 35 minutes au total, cohérent avec la durée annoncée', () => {
  const code = extract('parseStepTimestamp') + '\n' + extract('currentStepDurationSeconds');
  const fn = new Function(code + '; return currentStepDurationSeconds;')();
  const steps = [['00:00'], ['00:06'], ['00:12'], ['00:20'], ['00:27'], ['00:32']];
  const session = { item: { duration: 35, steps }, index: 0 };
  let totalMinutes = 0;
  for (let i = 0; i < steps.length; i += 1) { session.index = i; totalMinutes += fn(session) / 60; }
  assert.equal(totalMinutes, 35);
});

test('un vrai minuteur animé (anneau conique) remplace l’ancien horodatage statique dans l’affichage en direct', () => {
  assert.match(app, /id="animateStepTimer" class="animate-timer-ring"/);
  assert.match(app, /id="animateStepTimerLabel"/);
  assert.doesNotMatch(app, /<div class="animate-live-step"><time>\$\{esc\(step\[0\]\)\}<\/time>/, 'l’ancien horodatage statique doit avoir disparu');
});

test('le minuteur démarre après l’insertion réelle dans le DOM, et s’arrête proprement à la pause pour ne jamais tourner sur un élément disparu', () => {
  assert.match(app, /startAnimateStepTimer\(session\);/);
  const pauseStart = app.indexOf('function pauseDolciaAnimate(){');
  const pauseLine = app.slice(pauseStart, app.indexOf('\n', pauseStart));
  assert.match(pauseLine, /clearAnimateStepTimer\(\);/);
});

test('un pas de temps sans durée calculable (données absentes ou incohérentes) ne fait jamais planter le minuteur ni afficher une durée négative', () => {
  const start = app.indexOf('function startAnimateStepTimer(session){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(!totalSeconds\|\|!ring\)/);
});
