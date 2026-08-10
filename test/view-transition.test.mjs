import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

// Chaque écran majeur remplace .app entièrement à chaque navigation. Sans transition, c'était un
// cut instantané, plus proche d'un rechargement de page que d'une application. Une seule règle
// CSS, jamais à répéter écran par écran.
test('chaque changement d’écran majeur a une transition d’entrée douce, jamais un cut instantané, sans jamais ralentir la réactivité perçue (150-200ms)', () => {
  assert.match(style, /\.app\{animation:viewFadeIn \.2s cubic-bezier\(\.16,1,\.3,1\)\}/);
  assert.match(style, /@keyframes viewFadeIn\{from\{opacity:0;transform:translateY\(5px\)\}to\{opacity:1;transform:none\}\}/);
});

test('la transition d’écran respecte la préférence de mouvement réduit', () => {
  assert.match(style, /@media\(prefers-reduced-motion:reduce\)\{\.app\{animation:none\}\}/);
});
