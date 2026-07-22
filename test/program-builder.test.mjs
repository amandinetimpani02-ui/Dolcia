import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

function baseAnswers(overrides = {}) {
  return { who: 'solo', budget: 'flexible', duration: 'day', vibes: [], ...overrides };
}

test('une journée complète ne perd jamais le dîner (régression historique)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = baseAnswers();
  sandbox.state.dateStart = new Date(Date.now() + 24*60*60*1000);
  sandbox.state.dateMode = 'custom';
  sandbox.state.tasteProfile = {};
  sandbox.state.experienceMemories = {};
  sandbox.state.favorites = [];
  sandbox.state.feedback = {};
  sandbox.state.experienceFeelings = {};
  sandbox.state.catalogFilters = {};

  const pool = [
    { id: 'p1', category: 'outside', name: 'Balade dune', rating: 4.5, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'p2', category: 'food', subcategory: 'Sandwich', name: 'Sandwicherie', rating: 4.0, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'p3', category: 'active', name: 'Char à voile', rating: 4.3, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'p4', category: 'food', subcategory: 'Fruits de mer', name: 'Table Marine', rating: 4.7, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'p5', category: 'night', name: 'Bar concert', rating: 4.1, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] }
  ];
  const program = sandbox.buildProgram(pool);
  const foodSlots = program.filter(s => s.item.category === 'food');
  assert.ok(foodSlots.length >= 2, `attendu au moins 2 repas (déjeuner+dîner), obtenu ${foodSlots.length}`);
});

test('le filtre de cuisine actif (ex: cuisine:Salade & léger) s’applique bien à la composition du programme, pas seulement à l’Explorer', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = baseAnswers({ duration: '2h' });
  sandbox.state.dateStart = new Date(Date.now() + 24*60*60*1000);
  sandbox.state.dateMode = 'custom';
  sandbox.state.tasteProfile = {};
  sandbox.state.experienceMemories = {};
  sandbox.state.favorites = [];
  sandbox.state.feedback = {};
  sandbox.state.experienceFeelings = {};
  sandbox.state.catalogFilters = { lenses: ['cuisine:Salade & léger'] };

  const pool = [
    { id: 'mcdo', category: 'food', subcategory: 'Rapide', name: "McDonald's", rating: 4.9, reviews: 5000, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'salade', category: 'food', subcategory: 'Salade & léger', name: 'La Petite Salade', rating: 3.8, reviews: 20, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] }
  ];
  const program = sandbox.buildProgram(pool);
  const foodSlot = program.find(s => s.item.category === 'food');
  assert.equal(foodSlot?.item.id, 'salade', 'le filtre de cuisine actif doit exclure le fast-food malgré sa meilleure note');
});

test('deux repas dans le même programme évitent de répéter la même sous-catégorie (variété)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = baseAnswers();
  sandbox.state.dateStart = new Date(Date.now() + 24*60*60*1000);
  sandbox.state.dateMode = 'custom';
  sandbox.state.tasteProfile = {};
  sandbox.state.experienceMemories = {};
  sandbox.state.favorites = [];
  sandbox.state.feedback = {};
  sandbox.state.experienceFeelings = {};
  sandbox.state.catalogFilters = {};

  const pool = [
    { id: 'pz1', category: 'food', subcategory: 'Pizza', name: 'Pizzeria Midi', rating: 4.7, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'pz2', category: 'food', subcategory: 'Pizza', name: 'Pizzeria Soir', rating: 4.6, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'mer', category: 'food', subcategory: 'Fruits de mer', name: 'Fruits de mer Chez Marcel', rating: 4.5, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] }
  ];
  const program = sandbox.buildProgram(pool);
  const subcats = program.filter(s => s.item.category === 'food').map(s => s.item.subcategory);
  assert.ok(new Set(subcats).size === subcats.length, `attendu des sous-catégories food distinctes, obtenu ${subcats.join(', ')}`);
});

test('un brunch/buffet fait pencher le repas suivant vers du léger, indépendamment du budget', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = baseAnswers({ budget: 'budget2' });
  sandbox.state.dateStart = new Date(Date.now() + 24*60*60*1000);
  sandbox.state.dateMode = 'custom';
  sandbox.state.tasteProfile = {};
  sandbox.state.experienceMemories = {};
  sandbox.state.favorites = [];
  sandbox.state.feedback = {};
  sandbox.state.experienceFeelings = {};
  sandbox.state.catalogFilters = {};

  const pool = [
    { id: 'brunch', category: 'food', subcategory: 'Brunch', name: 'Brunch à volonté', rating: 4.6, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'salade', category: 'food', subcategory: 'Salade & léger', name: 'La Petite Salade', rating: 4.1, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] },
    { id: 'bistro', category: 'food', subcategory: 'Bistro', name: 'Le Bon Bistrot', rating: 4.5, source: 'Google Places', detailsKnown: true, openingPeriods: [{ open: { day: 0, time: '0000' } }] }
  ];
  const program = sandbox.buildProgram(pool);
  const foodNames = program.filter(s => s.item.category === 'food').map(s => s.item.subcategory);
  assert.ok(foodNames.includes('Brunch'), 'le brunch doit être choisi pour le premier repas');
  assert.ok(foodNames.includes('Salade & léger'), 'le second repas doit pencher vers léger après un brunch');
});
