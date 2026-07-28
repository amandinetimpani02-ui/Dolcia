import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('un choix simple dans l’onboarding avance seul à l’étape suivante — la personne ne doit jamais cliquer sur "Continuer" en plus (régression corrigée)', () => {
  const pickFn = app.match(/function pick\(key,val,multi\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(pickFn, /setTimeout\(nextStep,220\)/);
});

test('un choix multiple garde le bouton "Continuer" explicite (plusieurs sélections attendues avant de valider)', () => {
  const pickFn = app.match(/function pick\(key,val,multi\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(pickFn, /if\(multi\)\{const a=state\.answers\[key\];state\.answers\[key\]=a\.includes\(val\)\?a\.filter\(x=>x!==val\):\[\.\.\.a,val\];renderComposer\(\);return\}/);
});

test('quand les sources ne répondent pas, une vraie option d’élargissement de zone est proposée, pas seulement "réessayer" ou "parler à D"', () => {
  assert.match(app, /function widenSearchAndRetry\(\)/);
  assert.match(app, /onclick="widenSearchAndRetry\(\)">Élargir la zone de recherche/);
  assert.match(app, /openEclatDialogue\(\)">Dites-moi ce qui vous ferait plaisir/);
});

test('élargir depuis l’écran de récupération augmente vraiment le rayon (plafonné à 25km) et relance la collecte, pas un simple nouvel essai identique', () => {
  const fn = app.match(/function widenSearchAndRetry\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /Math\.min\(25000,Math\.max\(before\*1\.8,18000\)\)/);
  assert.match(fn, /openExplorer\(true\)/);
});
