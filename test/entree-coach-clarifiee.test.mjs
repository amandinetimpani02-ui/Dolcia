import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function extractFn(name) {
  const start = app.indexOf(`function ${name}(`);
  const brace = app.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < app.length; i += 1) {
    if (app[i] === '{') depth += 1;
    if (app[i] === '}') depth -= 1;
    if (depth === 0) return app.slice(start, i + 1);
  }
}

// Signalé directement : "c'est trop compliqué de comprendre comment entrer dans l'animation !
// il faut dire parler à Dolcia avant la séance ???" — le bouton ne disait pas ce qu'il faisait ni
// que c'était rapide. Et : "une fois sur place on ne peut plus faire demi-tour" — il fallait un
// vrai raccourci pour commencer directement, sans les trois questions, pour quelqu'un déjà sur
// place et impatient.

test('le bouton pour une séance coach explique désormais clairement ce qui va se passer (3 questions rapides, puis on commence)', () => {
  const fn = extractFn('previewDolciaAnimate');
  assert.match(fn, /▶ 3 questions rapides, puis on commence/);
});

test('un vrai raccourci existe pour commencer directement, sans passer par les trois questions', () => {
  const fn = extractFn('previewDolciaAnimate');
  assert.match(fn, /Commencer tout de suite, sans les questions/);
  assert.match(fn, /program\.coach\?`<button class="ghost" onclick="startDolciaAnimate\('\$\{id\}'\)"/);
});

test('ce raccourci n’apparaît que pour les programmes coach — les autres programmes gardent leur bouton "Commencer" déjà clair, sans ajout inutile', () => {
  const fn = extractFn('previewDolciaAnimate');
  assert.match(fn, /\$\{program\.coach\?`<button class="ghost"/, 'le raccourci doit être conditionné à program.coach');
});
