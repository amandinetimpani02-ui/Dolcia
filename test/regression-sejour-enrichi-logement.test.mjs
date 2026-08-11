import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Régression réelle signalée : un séjour de plusieurs jours ne proposait qu'une seule "expérience
// phare" et un seul "dîner" par jour — jamais de déjeuner, jamais de matin/après-midi distincts.
// Sur 2 jours, ça donnait littéralement 2 activités au total.

test('le modèle de séjour propose désormais quatre créneaux par jour, pas deux', () => {
  const start = app.indexOf('stay:[...(state.answers.needsAccommodation');
  const end = app.indexOf(']};', start);
  const section = app.slice(start, start + 700);
  assert.match(section, /Commencer la journée/);
  assert.match(section, /Déjeuner/);
  assert.match(section, /Expérience de l'après-midi/);
  assert.match(section, /Dîner ou soirée/);
});

test('le déjeuner bénéficie de la même logique de budget (gastronomique/léger/économique/livraison) que le dîner', () => {
  assert.match(app, /if\(\/D\[ée\]jeuner\|Dîner\/\.test\(label\)\)\{/);
});

// Régression réelle signalée : aucune question ne demandait si la personne avait déjà un
// logement (résidence secondaire, location) avant de chercher un hôtel pour un séjour.

test('une question explicite sur le logement existe pour tout séjour de plusieurs jours', () => {
  assert.match(app, /function renderAccommodationQuestion\(\)/);
  assert.match(app, /Avez-vous déjà un logement pour ce séjour/);
  assert.match(app, /J'ai déjà où loger|j'ai déjà où loger/i);
});

test('répondre "j’ai déjà un logement" retire le créneau hébergement du programme', () => {
  const start = app.indexOf('function answerAccommodation(needsAccommodation){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /state\.answers\.needsAccommodation=needsAccommodation/);
  const templateStart = app.indexOf('stay:[...(state.answers.needsAccommodation');
  assert.match(app.slice(templateStart, templateStart + 100), /needsAccommodation===false\?\[\]/, 'needsAccommodation à false doit bien retirer le créneau hôtel, jamais le forcer quand même');
});

test('la question logement s’affiche bien avant de poursuivre le parcours, pour tout séjour multi-jours détecté automatiquement ou choisi explicitement', () => {
  const start = app.indexOf('function answerEclatCustomDate(){');
  const next = app.indexOf('\nfunction renderAccommodationQuestion', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(state\.eclatBrief\.answers\.duration==='stay'\)return renderAccommodationQuestion\(\);/);
});
