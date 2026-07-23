import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

// Ce fichier existe suite à un signalement réel : l'Explorer proposait un
// aquarium à 876 km et "Aquarium de Dunkerque" (81 km) au lieu de Nausicaá
// à Boulogne-sur-Mer, bien plus proche, pour une recherche faite au Touquet.
// Cause racine : Google Places Text Search traite "radius" comme une simple
// indication, pas une limite stricte, et rien ne filtrait après coup.

test('un résultat à 876 km (cas réel signalé) est exclu du catalogue par défaut', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 876.4, category: 'active' }), false);
});

test('Dunkerque à 81 km (cas réel signalé, recherche faite au Touquet) est exclu', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 81, category: 'active' }), false);
});

test('une distance inconnue (null) est exclue par sécurité, jamais acceptée par défaut', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: null, category: 'active' }), false);
});

test('un lieu proche (5 km, ex: Labyparc près du Touquet) reste bien accepté', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 5, category: 'active' }), true);
});

test('un site signature (ex: Nausicaá) reste accepté jusqu’à 60 km, pas au-delà', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 30, retrievalScope: 'signature' }), true);
  assert.equal(sandbox.isWithinSaneDistance({ distance: 90, retrievalScope: 'signature' }), false);
});

test('une pépite DATAtourisme honnêtement étiquetée "vaut le détour" reste acceptée au-delà du rayon normal', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 35, worthTheDrive: true }), true);
});

test('l’Explorer (catalogSelection) applique bien ce plafond, pas seulement une fonction isolée', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  sandbox.state.catalogFilters = null;
  sandbox.state.allItems = [
    { id: 'near', name: 'Labyparc', category: 'active', distance: 5 },
    { id: 'far', name: 'Aquarium lointain', category: 'active', distance: 876.4 }
  ];
  const results = sandbox.catalogSelection();
  const ids = results.map(item => item.id);
  assert.ok(ids.includes('near'), 'le lieu proche doit rester dans l’Explorer');
  assert.ok(!ids.includes('far'), 'le lieu à 876 km ne doit plus apparaître dans l’Explorer');
});

test('le plafond de distance fonctionne pareil n’importe où dans le monde, pas seulement en France', () => {
  const { sandbox } = createSandbox();
  // Tokyo, rayon 10 km
  sandbox.state.radius = 10000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 3 }), true, 'proche à Tokyo doit être accepté');
  assert.equal(sandbox.isWithinSaneDistance({ distance: 450 }), false, 'Osaka depuis Tokyo doit être exclu');
  // New York, rayon 15 km
  sandbox.state.radius = 15000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 8 }), true, 'proche à New York doit être accepté');
  assert.equal(sandbox.isWithinSaneDistance({ distance: 900 }), false, 'Chicago depuis New York doit être exclu');
  // Petit village, rayon 5 km
  sandbox.state.radius = 5000;
  assert.equal(sandbox.isWithinSaneDistance({ distance: 4 }), true);
  assert.equal(sandbox.isWithinSaneDistance({ distance: 40 }), false);
});
