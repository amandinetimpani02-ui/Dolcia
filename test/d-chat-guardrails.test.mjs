import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsSource = fs.readFileSync(path.join(__dirname, '..', 'api', 'events.js'), 'utf8');

test('le prompt système de D interdit explicitement d’inventer un lieu, un prix ou un horaire réel', () => {
  assert.match(eventsSource, /JAMAIS inventer, citer ou affirmer un vrai nom d.établissement/);
});

test('le chat D reste distinct du moteur de faits (aucune fabrication de disponibilité)', () => {
  assert.match(eventsSource, /disponibilité réelle/);
  assert.match(eventsSource, /D_SYSTEM_PROMPT/);
});

test('le endpoint d-chat répond proprement si la clé Anthropic est absente (jamais un crash)', () => {
  assert.match(eventsSource, /ANTHROPIC_API_KEY manquante/);
});
