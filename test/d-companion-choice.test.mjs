import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('D possède une mémoire relationnelle persistante', () => {
  assert.match(app, /dolcia_companion_memory_v1/);
  assert.match(app, /function dRelationshipLine/);
  assert.match(app, /interactions:\(state\.companionMemory\.interactions\|\|0\)\+1/);
});

test('D est incarné avec une expression discrète et accessible', () => {
  assert.match(app, /function dMascotMark/);
  assert.match(app, /aria-label="D, votre compagnon Dolcia"/);
  assert.match(app, /class="d-face"/);
  assert.match(css, /\.d-face>i/);
  assert.match(css, /dCompanionBlink/);
});

test('D demande avant de modifier énergie et niveau de prix', () => {
  assert.match(app, /function programDecisionPrompt/);
  assert.match(app, /Aucune option n’est choisie sans vous/);
  assert.match(app, /un budget confortable ne signifie pas « gastronomique tout le temps »/);
  assert.match(app, /applyProgramDirection\('energy','continue'\)/);
  assert.match(app, /applyProgramDirection\('dining','budget'\)/);
});

test('la fatigue peut conduire à une livraison sans être imposée', () => {
  assert.match(app, /Fatigués : livraison ou dîner à l’hôtel/);
  assert.match(app, /diningChoice==='delivery'/);
  assert.match(app, /livraison\|livrer\|a emporter\|take/);
});

test('les décisions silencieuses historiques ont disparu', () => {
  assert.doesNotMatch(app, /previousEnergy==='high'/);
  assert.doesNotMatch(app, /includes\(previousBand\).*score\+=20/);
  assert.doesNotMatch(app, /includes\(previousBand\).*score-=24/);
});
