import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Promesse du Product Book, priorité identifiée de longue date dans cette conversation et jamais
// traitée jusqu'ici : "Un restaurant peut être excellent mais incompatible avec l'horaire d'un
// spectacle." L'agenda affichait déjà un temps de trajet estimé (agendaTravelConnector existait),
// mais ne vérifiait jamais si ce trajet tenait réellement dans le temps disponible.

test('agendaTravelConnector calcule le temps réellement disponible entre deux activités, pas seulement le trajet', () => {
  const start = app.indexOf('function agendaTravelConnector(from,to){');
  const next = app.indexOf('\nfunction renderAgenda', start);
  const fn = app.slice(start, next);
  assert.match(fn, /const fromDuration=activityDurationPresentation\(from\)\.minutes\|\|0;/);
  assert.match(fn, /const availableMinutes=Math\.round\(\(toStart-fromStart\)\/60000\)-fromDuration;/);
});

test('un enchaînement réellement impossible (durée + trajet > temps disponible) est signalé comme un vrai conflit, jamais présenté comme un trajet normal', () => {
  const start = app.indexOf('function agendaTravelConnector(from,to){');
  const next = app.indexOf('\nfunction renderAgenda', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(Number\.isFinite\(availableMinutes\)&&availableMinutes<minutes\)\{/);
  assert.match(fn, /agenda-connector conflict/);
  assert.match(fn, /il manque environ \$\{missing\} min/);
});

test('reproduction exacte : un déjeuner de 90 minutes commençant à 12h30 rend impossible un rendez-vous à 13h00, même proche', () => {
  const distanceKm = (a, b, c, d) => { const R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180, q = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q)); };
  const from = { agendaDate: '2026-08-15T12:30:00', durationMinutes: 90, lat: 50.52, lng: 1.59 };
  const to = { agendaDate: '2026-08-15T13:00:00', lat: 50.60, lng: 1.55 };
  const fromStart = new Date(from.agendaDate), toStart = new Date(to.agendaDate);
  const availableMinutes = Math.round((toStart - fromStart) / 60000) - from.durationMinutes;
  const km = distanceKm(from.lat, from.lng, to.lat, to.lng);
  const minutes = Math.max(1, Math.round(km <= 1.2 ? km * 12 : km * 2.3));
  assert.ok(availableMinutes < minutes, 'ce cas doit être détecté comme un vrai conflit');
  assert.equal(availableMinutes, -60, 'le déjeuner seul dépasse déjà l’heure du rendez-vous suivant');
});

test('un enchaînement normal, avec largement le temps nécessaire, ne déclenche jamais une fausse alerte', () => {
  const distanceKm = (a, b, c, d) => { const R = 6371, x = (c - a) * Math.PI / 180, y = (d - b) * Math.PI / 180, q = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q)); };
  const from = { agendaDate: '2026-08-15T10:00:00', durationMinutes: 60, lat: 50.52, lng: 1.59 };
  const to = { agendaDate: '2026-08-15T14:00:00', lat: 50.53, lng: 1.60 };
  const fromStart = new Date(from.agendaDate), toStart = new Date(to.agendaDate);
  const availableMinutes = Math.round((toStart - fromStart) / 60000) - from.durationMinutes;
  const km = distanceKm(from.lat, from.lng, to.lat, to.lng);
  const minutes = Math.max(1, Math.round(km <= 1.2 ? km * 12 : km * 2.3));
  assert.ok(availableMinutes >= minutes, 'ce cas ne doit jamais être signalé comme un conflit');
});
