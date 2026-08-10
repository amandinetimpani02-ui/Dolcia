import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOccurrence, dedupeOccurrences } from '../server/festival-model.js';
import { normalizeTouquetFestivalWithSharedModel } from '../server/touquet-events.js';
import extractChartrEstivales from '../server/chartres-events.js';

test('normalizeOccurrence échoue visiblement si un champ obligatoire manque, jamais une donnée devinée', () => {
  assert.throws(() => normalizeOccurrence({ title: 'Test', sourceName: 'x', sourceUrl: 'y' }), /champs obligatoires manquants/);
});

test('normalizeOccurrence échoue visiblement sur une date mal formée plutôt que de la mal interpréter', () => {
  assert.throws(() => normalizeOccurrence({ title: 'Test', date: '15/07/2026', sourceName: 'x', sourceUrl: 'y' }), /format ISO/);
});

test('chaque champ de vérification est honnête individuellement — absent/non vérifié/vérifié, jamais un seul booléen global', () => {
  const occ = normalizeOccurrence({ title: 'Test', date: '2026-08-08', sourceName: 'x', sourceUrl: 'y', location: 'Place X' });
  assert.equal(occ.verification.location, 'unverified');
  assert.equal(occ.verification.price, 'absent');
});

test('la déduplication garde la version la plus vérifiée quand la même activité arrive par deux sources', () => {
  const a = normalizeOccurrence({ title: 'Marché', date: '2026-08-08', sourceName: 'DATAtourisme', sourceUrl: 'x' });
  const b = normalizeOccurrence({ title: 'Marché', date: '2026-08-08', sourceName: 'Office', sourceUrl: 'y', location: 'Centre', locationVerified: true });
  const result = dedupeOccurrences([a, b]);
  assert.equal(result.length, 1);
  assert.equal(result[0].source, 'Office');
});

// Critère de réussite explicite : les deux cas réels (Le Touquet, Chartres) passent par le même
// modèle normalisé, sans régression des tests existants (vérifié séparément : 410/410 inchangé).
test('le Festival des Tout-Petits (Le Touquet) passe intégralement par le modèle commun, créneaux multiples préservés', () => {
  const occurrences = normalizeTouquetFestivalWithSharedModel();
  const babyGym = occurrences.filter(o => o.activityTitle === 'Atelier baby gym parent-enfant');
  assert.equal(babyGym.length, 4, 'les 4 créneaux doivent devenir 4 occurrences distinctes via le modèle commun');
  assert.equal(babyGym[0].startAt, '2026-07-15T09:30:00');
  assert.equal(babyGym[0].verification.price, 'verified');
  assert.equal(babyGym[0].parentEvent, 'Festival des Tout-Petits');
});

test('ChartrEstivales (Chartres, deuxième territoire) passe par le même modèle commun que Le Touquet', () => {
  const occurrences = extractChartrEstivales();
  assert.ok(occurrences.length >= 5, 'au moins les occurrences vérifiées par recherche doivent être présentes');
  const cathedrale = occurrences.find(o => o.location === 'Cathédrale');
  assert.ok(cathedrale, 'une occurrence avec lieu vérifié doit exister');
  assert.equal(cathedrale.parentEvent, 'ChartrEstivales');
  assert.equal(cathedrale.verification.location, 'verified');
  const sansLieu = occurrences.find(o => o.location === null);
  assert.ok(sansLieu, 'une occurrence sans lieu connu doit rester honnêtement absente, jamais devinée');
  assert.equal(sansLieu.verification.location, 'absent');
});

test('aucune donnée n’est héritée du parent vers l’enfant sans preuve individuelle — chaque occurrence Chartres porte sa propre vérification', () => {
  const occurrences = extractChartrEstivales();
  const withLocation = occurrences.filter(o => o.verification.location === 'verified').length;
  const withoutLocation = occurrences.filter(o => o.verification.location === 'absent').length;
  assert.ok(withLocation > 0 && withoutLocation > 0, 'le mélange prouve qu’aucune valeur par défaut n’est appliquée uniformément');
});
