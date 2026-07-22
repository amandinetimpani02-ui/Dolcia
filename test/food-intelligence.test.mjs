import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('la friterie est reconnue comme sa propre sous-catégorie, jamais noyée dans "Rapide"', () => {
  const { sandbox } = createSandbox();
  assert.equal(sandbox.foodSubcategory([], 'Friterie du Coin'), 'Friterie');
  assert.equal(sandbox.foodSubcategory([], "Chez Momo Frit'"), 'Friterie');
});

test('une cuisine sans signal réel ne retourne jamais une sous-catégorie inventée', () => {
  const { sandbox } = createSandbox();
  assert.equal(sandbox.foodSubcategory([], 'Restaurant Le Central'), null);
});

test('anti-stigmatisation : le budget serré du moment l’emporte sur un goût de luxe appris', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'solo', budget: '0', duration: '2h' };
  sandbox.state.tasteProfile = { Gastronomique: 5 };
  sandbox.state.dateStart = new Date();
  sandbox.state.experienceMemories = {};

  const gastro = sandbox.foodContextualDelta({ category: 'food', subcategory: 'Gastronomique' });
  const friterie = sandbox.foodContextualDelta({ category: 'food', subcategory: 'Friterie' });

  assert.ok(friterie > gastro, `Friterie (${friterie}) doit dépasser Gastronomique (${gastro}) à petit budget`);
});

test('un budget flexible ne pénalise jamais un goût simple appris (pas de double peine)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'solo', budget: 'flexible', duration: '2h' };
  sandbox.state.tasteProfile = { Friterie: 3 };
  sandbox.state.dateStart = new Date();
  sandbox.state.experienceMemories = {};

  const friterie = sandbox.foodContextualDelta({ category: 'food', subcategory: 'Friterie' });
  assert.ok(friterie >= 0, 'un goût simple appris ne doit jamais devenir négatif juste parce que le budget est flexible');
});

test('les pépites associatives sont valorisées même avec un budget flexible/élevé', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'flexible' };
  const delta = sandbox.gemFairnessDelta({ regionalGemKind: 'Ateliers enfants' });
  assert.ok(delta > 0, 'une pépite associative doit rester boostée même à budget élevé');
});

test('un plat sans regionalGemKind ne reçoit aucun bonus de pépite', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'flexible' };
  assert.equal(sandbox.gemFairnessDelta({}), 0);
});
