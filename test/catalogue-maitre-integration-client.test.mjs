import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function extract(name) {
  const start = app.indexOf(`function ${name}(`);
  const brace = app.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < app.length; i += 1) {
    if (app[i] === '{') depth += 1;
    if (app[i] === '}') depth -= 1;
    if (depth === 0) return app.slice(start, i + 1);
  }
}

function loadBuildMasterCatalog() {
  const code = [extract('distanceKm'), extract('masterCatalogNormalizeName'), extract('masterCatalogNameSimilarity'),
    extract('masterCatalogSourceRank'), extract('mergeMasterCatalogGroup'), extract('buildMasterCatalog')].join('\n');
  const priority = ['Partenaire vérifié', 'Office de tourisme', 'DATAtourisme', 'Viator', 'Booking.com', 'Google Places'];
  return new Function('MASTER_CATALOG_SOURCE_PRIORITY', `${code}; return buildMasterCatalog;`)(priority);
}

test('le catalogue maître est bien branché après la déduplication exacte, dans le vrai flux de composition', () => {
  assert.match(app, /const deduped=buildMasterCatalog\(dedupe\(state\.items\)\);/);
});

test('cas réel Bagatelle : deux sources fusionnent en une seule fiche, avec les champs complétés', () => {
  const buildMasterCatalog = loadBuildMasterCatalog();
  const items = [
    { id: 'google-1', name: 'Parc Bagatelle', source: 'Google Places', lat: 50.4520, lng: 1.5680, rating: 4.3 },
    { id: 'viator-1', name: "Parc d'attractions Bagatelle", source: 'Viator', lat: 50.4523, lng: 1.5675, bookingUrl: 'https://viator.com/bagatelle' }
  ];
  const result = buildMasterCatalog(items);
  assert.equal(result.length, 1);
  assert.equal(result[0].bookingUrl, 'https://viator.com/bagatelle');
  assert.equal(result[0].rating, 4.3);
});

test('deux lieux éloignés au nom identique ne fusionnent jamais dans le flux client, comme côté serveur', () => {
  const buildMasterCatalog = loadBuildMasterCatalog();
  const items = [
    { id: 'a', name: 'Restaurant Bagatelle', lat: 50.10, lng: 1.20, source: 'Google Places' },
    { id: 'b', name: 'Restaurant Bagatelle', lat: 50.45, lng: 1.56, source: 'Viator' }
  ];
  assert.equal(buildMasterCatalog(items).length, 2);
});
