import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('le visage de D (yeux, bouche) a maintenant une vraie traduction visuelle par humeur, pas seulement une classe JS sans effet', () => {
  assert.match(css, /\.eclat-d \.d-face i\{/);
  assert.match(css, /\.eclat-d \.d-face em\{/);
  assert.match(css, /\.eclat-d\.is-delighted \.d-face em,\.eclat-d\.is-encouraging \.d-face em/);
  assert.match(css, /\.eclat-d\.is-calm \.d-face em/);
  assert.match(css, /\.eclat-d\.is-speaking \.d-face em\{animation:dTalk/);
});

test('pendant une session Dolcia Anime, D est grande et centrale (façon coach en visio), pas une icône reléguée dans un coin', () => {
  assert.match(css, /\.animate-live \.animate-presence \.eclat-d\{width:132px;height:132px/);
  assert.match(css, /animation:animatePresenceBreathe/);
});

test('un vrai moment d’empathie interrompt le hype à mi-session : D demande sincèrement comment ça va, pas seulement pousser l’énergie', () => {
  assert.match(app, /const midpoint=Math\.floor\(session\.item\.steps\.length\/2\)/);
  assert.match(app, /dites-moi honnêtement, ça vous plaît toujours autant/);
});

test('les animations du visage et de la présence respectent le mouvement réduit', () => {
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.eclat-d\.is-speaking \.d-face em\{animation:none!important\}\}/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.animate-live \.animate-presence \.eclat-d\{animation:none!important\}\}/);
});
