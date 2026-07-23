import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

test('les défis génériques utilisent la vraie ville fournie, jamais un nom figé (Le Touquet, Biarritz, Lyon, Lisbonne)', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'friends' };
  for (const city of ['Biarritz', 'Lyon', 'Lisbonne', 'Le Touquet-Paris-Plage']) {
    // 20 tirages réels via la vraie fonction publique (le tirage est aléatoire) : au moins un doit citer la ville
    let mentionsCity = false;
    for (let i = 0; i < 20 && !mentionsCity; i++) {
      const steps = sandbox.challengeSetForVenue('generic', city);
      mentionsCity = steps.some(step => step.text.includes(city));
    }
    assert.ok(mentionsCity, `au moins un défi doit citer la vraie ville (${city}) sur 20 tirages`);
  }
});

test('le public change vraiment le contenu : famille avec jeunes enfants ≠ entre amis', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'family', childrenAges: [5] };
  const familySteps = sandbox.challengeSetForVenue('pool', 'Lyon').map(s => s.title);

  sandbox.state.answers = { who: 'friends' };
  const friendsSteps = sandbox.challengeSetForVenue('pool', 'Lyon').map(s => s.title);

  const overlap = familySteps.filter(title => friendsSteps.includes(title));
  assert.equal(overlap.length, 0, 'les défis pour jeunes enfants et pour amis doivent être différents');
});

test('un couple reçoit des défis à deux, distincts d’un groupe d’amis', () => {
  const { sandbox } = createSandbox();
  sandbox.state.answers = { who: 'couple' };
  const coupleSteps = sandbox.challengeSetForVenue('park', 'Marseille');
  assert.ok(coupleSteps.length >= 2);
  assert.ok(coupleSteps.every(step => !step.title.includes('équipe')), 'un couple ne devrait pas recevoir un défi "en équipe" pensé pour un groupe');
});
