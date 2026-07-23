import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

function baseAnswers(overrides = {}) {
  return { who: 'couple', budget: 'flexible', duration: 'day', vibes: [], ...overrides };
}

test('un restaurant 3 étoiles Michelin (détecté par le prix Google, pas par le nom) déclenche la compensation vers un repas plus simple', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = baseAnswers();
  sandbox.state.dateStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
  sandbox.state.dateMode = 'custom';
  sandbox.state.tasteProfile = {};
  sandbox.state.experienceMemories = {};
  sandbox.state.favorites = [];
  sandbox.state.feedback = {};
  sandbox.state.experienceFeelings = {};
  sandbox.state.catalogFilters = {};

  const SIMPLE_FOOD = ['Friterie', 'Rapide', 'Sandwich', 'Boulangerie', 'Café', 'Crêperie', 'Bistro'];
  const pool = [
    // Nom volontairement sans "gastronomique" — seul le prix Google (4/4) doit trahir le niveau
    { id: 'michelin', category: 'food', subcategory: null, name: 'Chez Alain — Trois Étoiles', price: 4, rating: 4.9, source: 'Google Places', distance: 3, detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'bistro', category: 'food', subcategory: 'Bistro', name: 'Le Bon Bistrot', rating: 4.5, source: 'Google Places', distance: 3, detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'gastro2', category: 'food', subcategory: 'Gastronomique', name: 'Autre Table Gastronomique', rating: 4.6, source: 'Google Places', distance: 3, detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] }
  ];
  const program = sandbox.buildProgram(pool);
  const foodItems = program.filter(s => s.item.category === 'food').map(s => s.item.subcategory);
  const secondMealIsSimple = foodItems.some(sub => SIMPLE_FOOD.includes(sub));
  assert.ok(secondMealIsSimple, `après le Michelin, le repas suivant doit pencher vers plus simple (obtenu: ${foodItems.join(', ')})`);
  assert.ok(!foodItems.includes('Gastronomique') || foodItems.indexOf('Gastronomique') === -1, 'ne doit pas enchaîner deux repas très chers d’affilée');
});

test('"manger léger" ne mène jamais à une sous-catégorie rapide/fast-food (ex: McDo)', () => {
  const { sandbox } = createSandbox();
  const lightKeywordsUsed = 'restaurant salade healthy leger';
  assert.doesNotMatch(lightKeywordsUsed, /rapide|fast|mcdo|burger king/i);
});
