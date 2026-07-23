import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

// Ce fichier existe suite à un signalement réel : une recherche "entre amis,
// rire, 0€" qui ne trouvait aucun résultat commercial affichait un écran vide
// sans jamais proposer D anime, alors que c'est exactement le cas d'usage prévu.

test('l’écran zéro résultat propose D anime en priorité quand le budget est à 0€', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'free', vibes: ['play'], who: 'friends' };
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  const html = sandbox.emptyState();
  assert.match(html, /D peut animer ce moment/, 'le titre doit mentionner D anime, pas juste "élargissons l’horizon"');
  assert.match(html, /openFreeFunChallenge/, 'un bouton doit lancer directement le défi gratuit');
});

test('l’écran zéro résultat reste inchangé (pas de D anime) quand le budget n’est pas à 0€', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'flexible', vibes: ['play'], who: 'friends' };
  const html = sandbox.emptyState();
  assert.doesNotMatch(html, /openFreeFunChallenge/);
});

test('l’écran zéro résultat propose aussi un raccourci pour élargir le budget, façon Airbnb', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { budget: 'free', vibes: ['play'], who: 'friends' };
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  const html = sandbox.emptyState();
  assert.match(html, /openBudgetEditor/, 'un raccourci direct vers l’édition du budget doit être proposé');
});

test('la bannière D anime apparaît aussi dans l’écran "Surprends-moi", pas seulement dans l’Explorer', () => {
  const { sandbox, fakeApp } = createSandbox();
  sandbox.state.answers = { budget: '0', vibes: ['play'], who: 'friends', duration: '2h' };
  sandbox.state.location = { name: 'Le Touquet-Paris-Plage' };
  sandbox.state.program = [];
  sandbox.state.allItems = [];
  sandbox.renderSurprise();
  assert.match(fakeApp.innerHTML, /free-fun-banner/, 'la bannière D anime doit apparaître dans l’écran Surprends-moi');
});
