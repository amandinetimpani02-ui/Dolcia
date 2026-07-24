import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('le thème "jeux connus" propose de vrais jeux reconnaissables (Action ou Vérité, jeu du menteur...)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };
  sandbox.state.animateTheme = 'connus';
  const titles = new Set();
  for (let i = 0; i < 10; i++) sandbox.challengeSetForVenue('park', 'Lyon').forEach(s => titles.add(s.title));
  const knownGames = ['Action ou Vérité', 'Le jeu du menteur', 'Ni oui ni non', 'Jacques a dit', 'Cap ou pas cap'];
  assert.ok([...titles].some(title => knownGames.includes(title)), 'au moins un vrai jeu connu doit apparaître');
});

test('les trois thèmes (classique, connus, enquête) sont bien distincts entre eux', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };

  const gather = (theme) => {
    sandbox.state.animateTheme = theme;
    const titles = new Set();
    for (let i = 0; i < 10; i++) sandbox.challengeSetForVenue('park', 'Lyon').forEach(s => titles.add(s.title));
    return titles;
  };
  const classique = gather('classique'), connus = gather('connus'), enquete = gather('enquete');
  assert.equal([...connus].filter(t => enquete.has(t)).length, 0);
  assert.equal([...classique].filter(t => connus.has(t)).length, 0);
});

test('ouvrir le chat pendant une animation introduit le contexte du défi en cours, une seule fois', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  sandbox.state.dChatHistory = [];
  sandbox.openDChatDuringGame();
  const introduced = sandbox.state.dChatHistory.some(turn => turn.role === 'assistant');
  assert.ok(introduced, 'un message contextuel doit être ajouté à l’ouverture');
  const countBefore = sandbox.state.dChatHistory.length;
  sandbox.openDChatDuringGame();
  assert.equal(sandbox.state.dChatHistory.length, countBefore, 'le message de contexte ne doit pas se répéter à chaque ouverture');
  sandbox.closeLiveHost();
});
