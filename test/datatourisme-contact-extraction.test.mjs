import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../server/datatourisme.js';

// Vérifié en direct (recherche web, pas supposé) : hasContact fait partie de la sélection PAR
// DÉFAUT de l'API DATAtourisme — donc déjà présent dans chaque réponse, jamais lu par le code
// avant ce correctif.
test('le contact (téléphone, email, site) est extrait quand la source le fournit réellement', () => {
  const item = {
    uuid: 't1', label: { fr: 'Test' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'x',
    hasContact: { telephone: ['0321000000'], email: ['contact@example.fr'], website: ['https://example.fr'] }
  };
  const result = normalize(item);
  assert.equal(result.phone, '0321000000');
  assert.equal(result.email, 'contact@example.fr');
  assert.equal(result.website, 'https://example.fr');
  assert.equal(result.detailsVerified, true);
  assert.equal(result.contactOrigin, 'DATAtourisme · hasContact');
  assert.ok(result.contactVerifiedAt, 'un instant de vérification réel doit être posé');
  assert.ok(!isNaN(new Date(result.contactVerifiedAt).getTime()), 'doit être une date ISO valide');
});

// Un vrai script en production (github.com/cquest/datatourisme/blob/master/jsonld2csv.py) montre
// que le JSON-LD brut de DATAtourisme préfixe ses propriétés (schema:telephone, foaf:homepage) et
// enveloppe ses valeurs dans {'@value': ...}. Comme il n'était pas possible de vérifier avec
// certitude quelle forme l'API REST renvoie réellement, l'extraction gère maintenant les deux
// conventions plutôt que d'en supposer une seule.
test('l’extraction fonctionne avec les deux conventions de nommage réellement rencontrées (simple, et préfixée JSON-LD avec @value)', () => {
  const prefixed = {
    uuid: 't4', 'rdfs:label': { fr: 'Fête locale' }, ':isLocatedAt': { 'schema:address': {} }, type: ['Event'], '@id': 'z',
    ':hasContact': { 'schema:telephone': { '@value': '0321222222' }, 'schema:email': { '@value': 'a@b.fr' }, 'foaf:homepage': { '@value': 'https://a.fr' } }
  };
  const result = normalize(prefixed);
  assert.equal(result.phone, '0321222222');
  assert.equal(result.email, 'a@b.fr');
  assert.equal(result.website, 'https://a.fr');
});

test('aucun contact n’est inventé quand la source ne le fournit pas', () => {
  const item = { uuid: 't2', label: { fr: 'Test' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'x' };
  const result = normalize(item);
  assert.equal(result.phone, null);
  assert.equal(result.email, null);
  assert.equal(result.website, null);
  assert.equal(result.detailsVerified, false);
});

test('horaires et tarifs restent honnêtement absents tant que le paramètre fields n’a pas été vérifié en direct — le code est prêt, jamais simulé', () => {
  const item = { uuid: 't3', label: { fr: 'Test' }, isLocatedAt: { address: {} }, type: ['Event'], uri: 'x' };
  const result = normalize(item);
  assert.equal(result.hoursText, null);
  assert.equal(result.priceText, null);
});
