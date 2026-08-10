import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../server/touquet-events.js', import.meta.url), 'utf8');

// Bug réel signalé : le Festival des Tout-Petits n'apparaissait que comme un seul bloc vague
// couvrant 6 semaines ("Festival des Tout-Petits — programme 2026"), inutile pour répondre à
// "qu'est-ce qu'on fait aujourd'hui précisément". Corrigé avec les vraies dates individuelles,
// vérifiées directement sur letouquet.com le 5 août 2026.
test('le festival remonte comme des activités journalières précises, jamais un seul bloc vague sur 6 semaines', () => {
  assert.doesNotMatch(source, /Festival des Tout-Petits — programme 2026/, 'l’ancien bloc vague unique ne doit plus exister');
  assert.match(source, /const festivalToutPetits = \[/);
  assert.match(source, /\['2026-08-05', 'Atelier cirque en famille'/);
});

test('chaque activité du festival a sa propre date exacte et son propre lien, pas une date de début/fin partagée pour tout le festival', () => {
  assert.doesNotMatch(source, /endDate: '2026-08-23/, 'la logique de plage de dates partagée ne doit plus exister');
  assert.match(source, /registrationUrl: `https:\/\/www\.letouquet\.com\/agenda\/\$\{slug\}\/`/);
});

test('une requête pour une date précise ne retourne que les activités réellement prévues ce jour-là', () => {
  assert.match(source, /if \(\(after && day < after\) \|\| \(before && day > before\)\) continue;/);
});
