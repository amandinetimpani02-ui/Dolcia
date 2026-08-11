import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Signalé directement : "si je veux une visite guidée avec D, on ne me le propose pas et je ne
// trouve pas l'option pour le voir." Vérifié : la seule expérience de ce type existante
// (l'exploration locale avec D) n'apparaissait que si la personne avait explicitement choisi le
// budget "gratuit" en amont — jamais comme option autonome et visible, contrairement au coach
// sportif qui a son propre bouton sur le Home.

test('un bouton "D vous fait visiter" existe sur le Home, avec la même visibilité que le coach sportif', () => {
  assert.match(app, /onclick="openLocalDiscoveryWithD\(\)"/);
  assert.match(app, /Une balade guidée avec D/);
});

test('la génération des expériences locales fonctionne indépendamment du choix de budget — plus besoin d’avoir choisi "gratuit" pour y accéder', () => {
  const start = app.indexOf('function generateLocalDiscoveryWithD(){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.doesNotMatch(fn, /state\.answers\.budget/, 'la fonction réutilisable ne doit plus dépendre du budget');
});

test('injectLocalFreeMoments (utilisé pendant la composition) réutilise la même génération, sans dupliquer la logique', () => {
  const start = app.indexOf('function injectLocalFreeMoments(){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /generateLocalDiscoveryWithD\(\)/);
});

test('sans aucun lieu réel vérifié à proximité, Dolcia le dit honnêtement plutôt que de fabriquer un point de départ', () => {
  const start = app.indexOf('function openLocalDiscoveryWithD(){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /Dolcia ne fabrique jamais un point de départ/);
});
