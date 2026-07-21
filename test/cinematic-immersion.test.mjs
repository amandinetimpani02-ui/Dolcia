import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../premium.css', import.meta.url), 'utf8');

test('L’Éclat possède un décor cinématographique et une légende honnête', () => {
  assert.match(app, /class="eclat-film"/);
  assert.match(app, /Images d’inspiration · les propositions resteront vérifiées/);
  assert.match(css, /@keyframes eclatFilm/);
});

test('un programme vide ne simule ni contenu ni métriques', () => {
  assert.match(app, /const ready=state\.program\.length>0/);
  assert.match(app, /function programEmptyCinematic/);
  assert.match(app, /if\(!state\.program\.length\)return/);
});

test('les animations respectent le confort visuel', () => {
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /program-empty-cinematic/);
});
