import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('un vrai curseur de volume, indépendant de la voix, reste visible en permanence pendant la session', () => {
  assert.match(app, /input type="range" min="0" max="1" step="0\.05" value="\$\{animateThemeVolume\(\)\}" oninput="setAnimateThemeVolume\(this\.value\)"/);
});

test('le réglage de volume est mémorisé, pas seulement pour la session en cours', () => {
  assert.match(app, /function setAnimateThemeVolume\(value\)\{\n\s*state\.animateThemeVolume=Math\.max\(0,Math\.min\(1,Number\(value\)\)\);save\(\);/);
});

test('l’atténuation pendant que D parle est quasi totale (0,04), pas une simple baisse — renforcée après un retour utilisateur direct', () => {
  assert.match(app, /dolciaTheme\.audio\.volume=Math\.min\(restore,\.04\)/);
});

test('le programme sport démontre le ton animateur attendu (enthousiasme, encouragement) plutôt qu’une description clinique', () => {
  const fn = app.match(/sport:\{title:'Cardio doux entre nous'[\s\S]*?\]\},/)?.[0] || '';
  assert.match(fn, /Allez, on commence tranquillement/);
  assert.match(fn, /bravo/i);
  assert.doesNotMatch(fn, /^.*Échauffement — mobilisez/, 'l’ancienne formulation clinique ne doit plus être présente');
});
