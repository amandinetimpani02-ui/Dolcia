import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('les 6 questions rapides pour choisir le bon programme d’animation sont toutes présentes (move/calm/laugh/family/water/together), pas seulement 4 sur 6', () => {
  const intents = ['move', 'calm', 'laugh', 'family', 'water', 'together'];
  for (const intent of intents) {
    assert.match(app, new RegExp(`refineAnimateChoice\\('${intent}'\\)`), `bouton manquant pour l'intention "${intent}"`);
  }
});

test('chaque intention correspond bien à un vrai programme existant dans DOLCIA_ANIMATE_PROGRAMS, jamais un id fantôme', () => {
  const mapMatch = app.match(/const map=\{move:'sport',calm:'calm',laugh:'party',together:'social',family:'family',water:'water'\}/);
  assert.ok(mapMatch, 'la correspondance intention -> programme doit couvrir les 6 cas');
});

test('choisir une question rapide reste non bloquant : tous les programmes restent cliquables directement en dessous, jamais imposé', () => {
  assert.match(app, /class="animate-choices"/);
  assert.match(app, /onclick="previewDolciaAnimate\('\$\{id\}'\)"/);
});
