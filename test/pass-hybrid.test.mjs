import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');

test('le catalogue reste utile sans partenaire', () => {
  assert.match(source, /Ajouter à mon agenda/);
  assert.match(source, /Réserver avec Dolcia/);
  assert.match(source, /Partenaire Dolcia · réservation intégrée/);
});

test('le Pass apparaît uniquement après une réservation Dolcia', () => {
  assert.match(source, /const hasPass=state\.passWallet\.status==='active'\|\|state\.reservations\.some/);
  assert.match(source, /hasPass\?`<button class="nav-item/);
  assert.match(source, /function reserveWithDolcia\(/);
  assert.match(source, /function renderPass\(/);
  assert.match(source, /dolcia_pass_wallet_v1/);
});

test('la publicité ne remplace jamais la pertinence', () => {
  assert.match(source, /Suggestion partenaire · pertinence vérifiée/);
  assert.doesNotMatch(source, /sponsorisé en premier|priorité payante/i);
});
