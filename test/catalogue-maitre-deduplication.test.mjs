import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasterCatalog, nameSimilarity, distanceMeters, isSameRealPlace } from '../server/catalog-master.js';

// Cas exact décrit dans le plan de repositionnement : "si Bagatelle existe déjà dans les données
// Dolcia et apparaît également chez Viator, l'utilisateur ne doit pas voir deux fiches Bagatelle."

test('deux sources décrivant le même lieu réel (Bagatelle) fusionnent en une seule fiche', () => {
  const items = [
    { id: 'google-1', name: 'Parc Bagatelle', source: 'Google Places', lat: 50.4520, lng: 1.5680, rating: 4.3, reviews: 2100, photo: '/g1.jpg' },
    { id: 'viator-1', name: "Parc d'attractions Bagatelle", source: 'Viator', lat: 50.4523, lng: 1.5675, bookingUrl: 'https://viator.com/bagatelle', description: 'Billets coupe-file disponibles.' }
  ];
  const result = buildMasterCatalog(items);
  assert.equal(result.length, 1, 'une seule fiche doit sortir, jamais deux');
  assert.equal(result[0].bookingUrl, 'https://viator.com/bagatelle', 'le lien de réservation ne doit jamais être perdu');
  assert.equal(result[0].rating, 4.3, 'les champs absents chez la source prioritaire doivent être comblés par une source secondaire');
  assert.deepEqual(result[0].mergedFrom.map(m => m.id).sort(), ['google-1', 'viator-1']);
});

test('la source prioritaire (§20 : partenaire > office > DATAtourisme > Viator > Booking > Google) l’emporte pour les champs qu’elle fournit', () => {
  const items = [
    { id: 'g', name: 'Spa Bien-être du Port', source: 'Google Places', lat: 50.52, lng: 1.59, description: 'Description Google générique' },
    { id: 'p', name: 'Spa Bien-être du Port', source: 'Office de tourisme', lat: 50.5201, lng: 1.5901, description: 'Description officielle vérifiée' }
  ];
  const result = buildMasterCatalog(items);
  assert.equal(result.length, 1);
  assert.equal(result[0].description, 'Description officielle vérifiée', 'la source la plus proche de l’établissement doit gagner');
});

test('deux lieux différents ne fusionnent jamais uniquement parce qu’ils partagent un mot générique et sont proches', () => {
  const items = [
    { id: 'e', name: 'Restaurant Bagatelle', source: 'Google Places', lat: 50.45, lng: 1.56 },
    { id: 'f', name: 'Parc Bagatelle', source: 'Viator', lat: 50.4501, lng: 1.5601 }
  ];
  assert.equal(buildMasterCatalog(items).length, 2, 'un seul mot commun ne suffit jamais à prouver que c’est le même lieu');
});

test('deux lieux au nom identique mais éloignés géographiquement ne fusionnent jamais', () => {
  const items = [
    { id: 'a', name: 'Restaurant Bagatelle', source: 'Google Places', lat: 50.10, lng: 1.20 },
    { id: 'b', name: 'Restaurant Bagatelle', source: 'Viator', lat: 50.45, lng: 1.56 }
  ];
  assert.equal(buildMasterCatalog(items).length, 2, 'la proximité géographique est obligatoire, jamais seulement le nom');
});

test('les items sans coordonnées exploitables ne sont jamais fusionnés à l’aveugle', () => {
  const items = [
    { id: 'x', name: 'Atelier mystère', source: 'DATAtourisme' },
    { id: 'y', name: 'Atelier mystère', source: 'Viator' }
  ];
  const result = buildMasterCatalog(items);
  assert.equal(result.length, 2, 'sans coordonnées fiables, aucun rapprochement automatique ne doit être tenté');
});

test('isSameRealPlace et ses fonctions utilitaires restent explicables et testables isolément', () => {
  assert.ok(nameSimilarity('Parc Bagatelle', "Parc d'attractions Bagatelle") > 0.8);
  assert.ok(distanceMeters(50.45, 1.56, 50.4501, 1.5601) < 20);
  assert.equal(isSameRealPlace(
    { name: 'Parc Bagatelle', lat: 50.45, lng: 1.56 },
    { name: 'Restaurant totalement différent', lat: 50.45, lng: 1.56 }
  ), false, 'la proximité seule ne suffit jamais sans similarité de nom');
});
