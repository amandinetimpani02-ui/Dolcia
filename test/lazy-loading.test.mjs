import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('les images des listes défilables (Explorer, Agenda, Constellation) se chargent paresseusement', () => {
  const count = (app.match(/loading="lazy"/g) || []).length;
  assert.ok(count >= 4, 'au moins les 4 listes principales doivent être couvertes');
});
