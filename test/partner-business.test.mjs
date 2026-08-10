import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../pro.js', import.meta.url), 'utf8');

test('le Studio partenaire sépare mesure, packs et push', () => {
  assert.match(source, /Statistiques & visites/);
  assert.match(source, /Packs & tout inclus/);
  assert.match(source, /Visibilité & push/);
});

test('une venue Dolcia exige une validation distincte de la réservation', () => {
  assert.match(source, /Pass validés sur place/);
  assert.match(source, /function validateReservation/);
  assert.match(source, /Les réservations annulées et les doublons sont exclus/);
});

test('les campagnes restent contrôlées et consenties', () => {
  assert.match(source, /ayant accepté ce type de notification/);
  assert.match(source, /Dolcia contrôle le message, la pression et la vérité de l’offre/);
  assert.match(source, /campagne.*contrôle Dolcia/i);
});
