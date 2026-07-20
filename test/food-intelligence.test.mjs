import test from 'node:test';
import assert from 'node:assert/strict';
import { foodSubcategory, foodContextualDelta, gemFairnessDelta } from '../server/food-intelligence.js';

test('une friterie est apprise comme sous-catégorie réelle', () => {
  assert.equal(foodSubcategory({ category: 'food', name: 'Friterie du Marché', types: ['restaurant'] }), 'Friterie');
});

test('le petit budget du moment prime sur un goût général luxueux', () => {
  const gastro = foodContextualDelta({ category: 'food', name: 'Table gastronomique', price: 4 }, { budget: 'budget1', groupSize: 2, weather: '', who: 'couple' }, { tasteProfile: { 'food:Gastronomique': 3 } });
  const friterie = foodContextualDelta({ category: 'food', name: 'Friterie locale', price: 1 }, { budget: 'budget1', groupSize: 2, weather: '', who: 'couple' }, { tasteProfile: {} });
  assert.ok(friterie.delta > gastro.delta);
});

test('une pépite associative reçoit une chance équitable quel que soit son prix', () => {
  assert.equal(gemFairnessDelta({ source: 'DATAtourisme', name: 'Atelier associatif de poterie' }), 12);
});
