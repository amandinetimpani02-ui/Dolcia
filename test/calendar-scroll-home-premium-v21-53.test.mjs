import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('la fenêtre calendrier porte son propre défilement et le bouton de validation reste atteignable', () => {
  assert.match(css, /\.eclat-dialogue\{[\s\S]*overflow-y:auto!important/);
  assert.match(css, /\.eclat-dialogue \.exact-calendar>button\{[\s\S]*position:sticky/);
  assert.match(css, /bottom:16px/);
});

test('le Home retrouve une hiérarchie immersive avec une grande scène et deux accès secondaires', () => {
  assert.match(css, /\.home-level3 \.home-path\.primary\{[\s\S]*grid-column:1\/-1/);
  assert.match(css, /url\('\/assets\/hero-le-touquet\.png'\)/);
  assert.match(css, /\.home-level3 \.pulse-empty\{[\s\S]*grid-column:1\/-1/);
  assert.match(app, /Créons un moment qui n’appartient qu’à vous/);
});
