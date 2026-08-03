import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('l’état vide propose deux actions distinctes, plus de doublon entre Composer et Parler à Dolcia', () => {
  const fn = app.match(/function emptyState\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  const buttons = (fn.match(/<button/g) || []).length;
  assert.equal(buttons, 2, 'exactement deux actions, jamais trois qui se recoupent');
  assert.doesNotMatch(fn, /Parler à Dolcia/, 'ce libellé faisait doublon avec le bouton de composition');
});
