import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('app.js ne référence aucune fonction globale inexistante au démarrage', () => {
  const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const declared = new Set([
    ...[...source.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]),
    ...[...source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/g)].map(match => match[1])
  ]);
  const exported = [...source.matchAll(/\bwindow\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)/g)];
  const missing = exported
    .map(([, exposed, local]) => ({ exposed, local }))
    .filter(({ local }) => !declared.has(local));

  assert.deepEqual(missing, []);
  assert.doesNotThrow(() => new vm.Script(source));
});
