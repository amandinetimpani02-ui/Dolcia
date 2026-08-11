import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Signalé directement : "où est D ??? Impossible de dialoguer avec lui." Sur le Home, D
// n'était qu'un badge décoratif sans gestionnaire de clic — seul le champ de texte adjacent
// (au focus) ouvrait le dialogue. Toucher directement le badge D ne faisait rien.

test('le badge D du Home est désormais un vrai bouton cliquable, pas un élément décoratif inerte', () => {
  const start = app.indexOf("function home(){");
  const line = app.slice(start, app.indexOf('loadHomePulse()', start));
  assert.match(line, /<button class="d-home-trigger" onclick="openEclatDialogue\(false,'compose'\)" aria-label="Parler à D">/);
});

test('le Home utilise désormais le vrai personnage animé (dMascotMark), cohérent avec sa présence partout ailleurs dans l’application', () => {
  const start = app.indexOf("function home(){");
  const line = app.slice(start, app.indexOf('loadHomePulse()', start));
  assert.match(line, /dMascotMark\('mini'\)/);
});
