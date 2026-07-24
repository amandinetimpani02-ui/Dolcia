import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

// Ce fichier existe suite à un signalement réel : les étapes du dialogue D
// étaient des rectangles plats sans aucune photo, jugées "noires et tristes"
// face à des applications premium comme Veepee ou Booking.

test('chaque étape du dialogue affiche une vraie photo derrière chaque choix', () => {
  const { sandbox, fakeQuestion } = createSandbox();
  for (let step = 0; step <= 3; step++) {
    sandbox.state.eclatBrief = { step };
    sandbox.renderEclatQuestion();
    const photoCount = (fakeQuestion.innerHTML.match(/background-image/g) || []).length;
    assert.ok(photoCount >= 3, `l’étape ${step} doit avoir au moins 3 choix illustrés par une photo (trouvé: ${photoCount})`);
    assert.match(fakeQuestion.innerHTML, /photo-choices/, `l’étape ${step} doit utiliser la classe photo-choices`);
  }
});
