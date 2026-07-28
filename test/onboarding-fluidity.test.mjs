import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('un choix simple avance naturellement sans demander un clic de validation redondant', () => {
  const pickFn = app.match(/function pick\(key,val,multi\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(pickFn, /setTimeout\(nextStep,220\)/);
});

test('les choix multiples restent ouverts jusqu’à la validation explicite', () => {
  const pickFn = app.match(/function pick\(key,val,multi\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(pickFn, /if\(multi\)\{[\s\S]*?renderComposer\(\);\s*return;/);
});
