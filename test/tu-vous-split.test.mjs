import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Règle tranchée le 1er août 2026 : Dolcia (Home, Explorer, D-Coach) vouvoie, comme un concierge.
// Dolcia Anime tutoie, comme un GO — mais uniquement la voix de l'animateur elle-même, jamais le
// texte d'interface générique (partage, boutons) qui reste au registre neutre du reste du produit.
test('la voix de l’animateur (D pendant une session Dolcia Anime) tutoie, jamais de vouvoiement résiduel', () => {
  for (const name of ['animatePersonalTouch', 'animateContinuityGreeting', 'animateCoachLine', 'animateStepText', 'animateNudgeLine']) {
    const fn = app.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}`))?.[0] || '';
    assert.doesNotMatch(fn, /\bvous\b/i, `${name} ne doit plus contenir de vouvoiement`);
  }
});

test('les séquences du Home (HOME_SEQUENCES, contexte concierge) restent au vouvoiement, jamais de tutoiement', () => {
  const block = app.match(/const HOME_SEQUENCES=\{[\s\S]*?\n\};/)?.[0] || '';
  assert.doesNotMatch(block, /\btu\b|\btoi\b|\bton\b|\bta\b|\btes\b/i);
});

test('le texte d’interface du partage de session (pas la voix de D elle-même) reste au registre neutre existant', () => {
  const fn = app.match(/function animateSharePanel\(session\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /votre téléphone|votre ami/);
});
