import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('sélectionner Pizza ET Sushi comme filtres cuisine renvoie les deux, pas zéro (combinaison OU)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  sandbox.state.tasteProfile = {};
  sandbox.state.allItems = [
    { id: 'p1', name: 'Pizzeria', category: 'food', subcategory: 'Pizza', distance: 2 },
    { id: 's1', name: 'Sushi Bar', category: 'food', subcategory: 'Sushi', distance: 2 },
    { id: 'g1', name: 'Gastro', category: 'food', subcategory: 'Gastronomique', distance: 2 }
  ];
  sandbox.state.catalogFilters = { family: 'all', sort: 'recommended', availability: 'all', query: '', limit: 60, lenses: ['cuisine:Pizza', 'cuisine:Sushi'], preferred: [] };
  const results = sandbox.catalogSelection();
  const ids = results.map(item => item.id);
  assert.ok(ids.includes('p1'), 'la pizzeria doit apparaître');
  assert.ok(ids.includes('s1'), 'le sushi bar doit apparaître');
  assert.ok(!ids.includes('g1'), 'le restaurant gastronomique non sélectionné ne doit pas apparaître');
});

test('un filtre cuisine combiné à un filtre non-cuisine (ex: proximité) reste bien en ET', () => {
  const { sandbox } = createSandbox();
  sandbox.state.radius = 12000;
  sandbox.state.tasteProfile = {};
  sandbox.state.allItems = [
    { id: 'near-pizza', name: 'Pizzeria proche', category: 'food', subcategory: 'Pizza', distance: 1 },
    { id: 'far-pizza', name: 'Pizzeria loin', category: 'food', subcategory: 'Pizza', distance: 11 }
  ];
  sandbox.state.catalogFilters = { family: 'all', sort: 'recommended', availability: 'all', query: '', limit: 60, lenses: ['cuisine:Pizza', 'near'], preferred: [] };
  const results = sandbox.catalogSelection();
  const ids = results.map(item => item.id);
  assert.ok(ids.includes('near-pizza'), 'la pizzeria proche doit apparaître');
  assert.ok(!ids.includes('far-pizza'), 'la pizzeria loin doit être exclue par le filtre proximité (ET)');
});
