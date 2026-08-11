import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Promesse du Product Book : pour toute information importante, Dolcia doit pouvoir répondre
// "quand a-t-elle été obtenue ?". La donnée (contactVerifiedAt, contactOrigin) existait déjà
// côté server/datatourisme.js mais n'était jamais affichée à l'utilisateur — seul l'équivalent
// Google Places (officialSource/officialCheckedAt) l'était.

test('la fraîcheur de vérification DATAtourisme (contactOrigin/contactVerifiedAt) est désormais affichée, avec le même motif visuel que Google Places', () => {
  assert.match(app, /item\.contactOrigin\?`<div class="source-proof">/);
  assert.match(app, /item\.contactVerifiedAt\?'Vérifié le '/);
});

test('une fiche sans aucune des deux preuves de fraîcheur ne montre jamais ce bloc, jamais une date inventée', () => {
  const start = app.indexOf('${item.officialSource?`<div class="source-proof">');
  const end = app.indexOf('}${item.detailWarning', start);
  const section = app.slice(start, end);
  assert.match(section, /:''$/, 'doit se terminer par un repli en chaîne vide, jamais une date inventée');
});
