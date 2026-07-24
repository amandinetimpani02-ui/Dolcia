import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('le thème "enquête" propose un contenu différent et plus sophistiqué que le classique, pour un groupe d’adultes', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };

  sandbox.state.animateTheme = 'classique';
  const classicTitles = new Set();
  for (let i = 0; i < 10; i++) sandbox.challengeSetForVenue('park', 'Lyon').forEach(s => classicTitles.add(s.title));

  sandbox.state.animateTheme = 'enquete';
  const mysteryTitles = new Set();
  for (let i = 0; i < 10; i++) sandbox.challengeSetForVenue('park', 'Lyon').forEach(s => mysteryTitles.add(s.title));

  const overlap = [...classicTitles].filter(title => mysteryTitles.has(title));
  assert.equal(overlap.length, 0, 'le thème enquête doit être un vrai contenu distinct, pas un simple habillage');
  assert.ok([...mysteryTitles].some(title => /témoin|enquête|indice|alibi|filature/i.test(title)), 'le thème enquête doit vraiment évoquer une enquête');
});

test('le thème "enquête" ne s’applique pas à la piscine (contraintes de sécurité aquatique conservées)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };
  sandbox.state.animateTheme = 'enquete';
  const steps = sandbox.challengeSetForVenue('pool', 'Lyon');
  const isMystery = steps.some(step => /témoin|enquête|indice|alibi/i.test(step.title));
  assert.equal(isMystery, false, 'la piscine doit garder son contenu aquatique adapté, pas le thème enquête générique');
});

test('le thème "enquête" ne s’applique pas à une famille avec de jeunes enfants (contenu adapté conservé)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'family', childrenAges: [4] };
  sandbox.state.animateTheme = 'enquete';
  const steps = sandbox.challengeSetForVenue('park', 'Lyon');
  const isMystery = steps.some(step => /témoin|enquête|indice|alibi/i.test(step.title));
  assert.equal(isMystery, false, 'une famille avec de jeunes enfants doit garder un contenu adapté à leur âge');
});
