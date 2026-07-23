import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('markChallengeDone existe réellement et incrémente le score (bouton précédemment cassé)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  assert.equal(typeof sandbox.markChallengeDone, 'function');
  const scoreBefore = sandbox.state.liveHost.score || 0;
  sandbox.markChallengeDone(true);
  assert.equal(sandbox.state.liveHost.score, scoreBefore + 10, 'un défi réussi doit ajouter 10 points');
  sandbox.closeLiveHost();
});

test('un défi tenté sans réussite donne quand même des points de participation (façon Peloton : des points pour s’être présenté)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  const scoreBefore = sandbox.state.liveHost.score || 0;
  sandbox.markChallengeDone(false);
  assert.equal(sandbox.state.liveHost.score, scoreBefore + 5, 'la participation seule doit ajouter 5 points, jamais zéro');
  sandbox.closeLiveHost();
});

test('un défi réussi donne plus de points qu’une simple participation (5 + 5 = 10)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  const scoreBefore = sandbox.state.liveHost.score || 0;
  sandbox.markChallengeDone(true);
  assert.equal(sandbox.state.liveHost.score, scoreBefore + 10, 'un défi réussi doit donner 10 points au total (5 participation + 5 bonus)');
  sandbox.closeLiveHost();
});

test('un check-in d’adaptation apparaît après le 2e défi, une seule fois', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  sandbox.markChallengeDone(true); // index 0 -> 1
  assert.equal(sandbox.state.liveHost.askedCheckin, undefined, 'pas de check-in avant le 2e défi');
  sandbox.markChallengeDone(true); // index 1 -> 2, doit déclencher le check-in
  assert.ok(sandbox.state.liveHost.askedCheckin?.[2], 'le check-in doit être marqué comme posé à l’étape 2');
  sandbox.closeLiveHost();
});

test('choisir "plus calme" au check-in régénère des défis calmes pour la suite de la session', () => {
  const { sandbox } = createSandbox();
  sandbox.state.location = { name: 'Lyon' };
  sandbox.acceptAnimateTerms({ id: 'place1', name: 'Place Bellecour', category: 'active' });
  sandbox.adjustLiveHostPace('calmer');
  assert.equal(sandbox.state.answers.vibes[0], 'recharge', 'le mode calme doit être activé après le choix "plus calme"');
  sandbox.closeLiveHost();
});
