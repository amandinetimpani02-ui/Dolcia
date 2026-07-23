import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('un tout-petit et un grand enfant déclenchent le scénario multi-âges (exemple réel : 1 an et 8 ans)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'family', childrenAges: [1, 8] };
  assert.equal(sandbox.needsMultiAgeScenario(), true);
});

test('un écart d’âge faible (6 et 8 ans) ne déclenche pas le scénario multi-âges', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'family', childrenAges: [6, 8] };
  assert.equal(sandbox.needsMultiAgeScenario(), false);
});

test('la sécurité pour un tout-petit dans l’eau est toujours présente et jamais silencieuse', () => {
  const { sandbox } = createSandbox();
  const scenario = sandbox.multiAgeFamilyChallenge('pool', 'Le Touquet', [1, 8]);
  assert.ok(scenario.safety, 'un scénario piscine avec un tout-petit doit toujours inclure un avertissement de sécurité');
  assert.match(scenario.safety, /portée de bras/);
  assert.match(scenario.safety, /ne remplace jamais/);
});

test('chaque enfant reçoit une activité adaptée à son propre âge, pas une activité générique partagée', () => {
  const { sandbox } = createSandbox();
  const scenario = sandbox.multiAgeFamilyChallenge('pool', 'Le Touquet', [1, 8]);
  assert.equal(scenario.groups.length, 2);
  assert.notEqual(scenario.groups[0].activity, scenario.groups[1].activity);
});

test('sans tout-petit (deux enfants plus grands), aucun avertissement de sécurité n’est ajouté artificiellement', () => {
  const { sandbox } = createSandbox();
  const scenario = sandbox.multiAgeFamilyChallenge('park', 'Lyon', [5, 10]);
  assert.equal(scenario.safety, null);
});
