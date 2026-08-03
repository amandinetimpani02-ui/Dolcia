import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Bug réel signalé : cliquer sur un programme ne montrait rien à l'écran, l'aperçu apparaissant
// après toute la grille de 20 choix — il fallait défiler sans le savoir pour découvrir le bouton
// Commencer et la case de sécurité, tout en bas. Convention universelle du clic cassée.
test('cliquer sur un programme amène automatiquement l’aperçu à l’écran, sans obliger à découvrir par hasard qu’il fallait défiler', () => {
  const fn = app.match(/function previewDolciaAnimate\(id\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /target\.scrollIntoView\(\{behavior:'smooth',block:'start'\}\)/);
});

test('le bouton Commencer et la confirmation de sécurité apparaissent immédiatement en haut de l’aperçu, avant la liste détaillée des étapes — pas après', () => {
  const fn = app.match(/function previewDolciaAnimate\(id\)\{[\s\S]*?\n\}/)?.[0] || '';
  const startIdx = fn.indexOf('Commencer avec la voix');
  const stepsIdx = fn.indexOf('<ol>');
  assert.ok(startIdx > -1 && stepsIdx > -1 && startIdx < stepsIdx, 'le bouton doit précéder la liste des étapes dans le HTML');
});

test('la confirmation de sécurité reste une vraie case à cocher qui bloque le démarrage — la garantie n’a pas été retirée, seul le ton a changé', () => {
  assert.match(app, /function ensureAnimateSafety\(\)\{if\(!document\.querySelector\('#animateSafety'\)\?\.checked\)/);
  assert.match(app, /On a choisi un endroit sûr, tout le monde est prêt\./);
});
