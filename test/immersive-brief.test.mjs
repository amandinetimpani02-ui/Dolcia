import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../premium.css', import.meta.url), 'utf8');

test('le brief conserve une seule conversation en quatre décisions', () => {
  assert.match(app, /Une seule conversation/);
  assert.match(app, /0\$\{brief\.step\+1\} \/ 04/);
  assert.match(app, /Votre moment prend vie/);
});

test('le décor réagit au groupe et à l’envie du moment', () => {
  assert.match(app, /function eclatSceneFor/);
  assert.match(app, /couple:IMAGES\.couple/);
  assert.match(app, /family:IMAGES\.family/);
  assert.match(app, /taste:IMAGES\.food/);
  assert.match(app, /vibrate:IMAGES\.night/);
  assert.match(app, /function updateEclatScene/);
});

test('l’immersion reste adaptée au mobile et au confort visuel', () => {
  assert.match(css, /Dolcia 19\.10/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
