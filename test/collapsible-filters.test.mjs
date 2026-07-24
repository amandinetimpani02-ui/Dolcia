import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

// Ce fichier existe suite à un signalement réel : "Filtres intelligents"
// s'affichait toujours grand ouvert, séparément du menu repliable "Affiner
// si vous le souhaitez", occupant tout l'écran avant les vraies propositions.

test('les filtres intelligents s’insèrent dans le menu repliable #compassMount quand il existe', () => {
  const calls = [];
  const fakeCompassMount = { id: 'compassMount', insertAdjacentHTML: (pos, html) => calls.push({ target: 'compassMount', pos, html }) };
  const fakeCatalogControls = { insertAdjacentHTML: (pos, html) => calls.push({ target: 'catalog-controls', pos, html }) };

  const { sandbox } = createSandbox({
    '#compassMount': fakeCompassMount,
    '.catalog-controls': fakeCatalogControls
  });
  sandbox.state.catalogFilters = { lenses: [] };
  sandbox.state.allItems = [];
  sandbox.mountAdaptiveFilters();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].target, 'compassMount', 'les filtres doivent rejoindre le menu repliable, pas un bloc séparé toujours visible');
});

test('si le menu repliable n’existe pas encore, les filtres se replient sur l’ancien emplacement (pas de plantage)', () => {
  const calls = [];
  const fakeCatalogControls = { insertAdjacentHTML: (pos, html) => calls.push({ target: 'catalog-controls', pos, html }) };

  const { sandbox } = createSandbox({
    '.catalog-controls': fakeCatalogControls
  });
  sandbox.state.catalogFilters = { lenses: [] };
  sandbox.state.allItems = [];
  sandbox.mountAdaptiveFilters();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].target, 'catalog-controls');
});
