import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Régression signalée : choisir "En famille" ou "Entre amis" forçait systématiquement un écran
// d'identification des personnes présentes, sans aucun raccourci pour une recherche rapide.

test('un bouton de recherche rapide permet de continuer sans identifier les personnes du groupe', () => {
  assert.match(app, /eclat-group-skip/);
  assert.match(app, /onclick="skipEclatGroupDetail\(\)"/);
});

test('skipEclatGroupDetail ne force aucun profil individuel et garde le contexte "avec qui" pour adapter le moteur', () => {
  const start = app.indexOf('function skipEclatGroupDetail()');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /participantIds=\['me'\]/);
  assert.match(fn, /brief\.step=2/, 'doit avancer normalement dans le parcours, pas rester bloqué');
});

// Régression signalée : l'ajout à l'agenda était instantané et silencieux, sans jamais proposer
// de choisir le jour (pour un séjour multi-jours), l'heure, ou la durée avant de valider.

test('addAgenda ouvre une fenêtre de choix plutôt que d’ajouter directement et silencieusement', () => {
  const start = app.indexOf("async function addAgenda(id,slotLabel=''){");
  const next = app.indexOf('\nfunction openAddToAgendaModal', start);
  const fn = app.slice(start, next);
  assert.match(fn, /openAddToAgendaModal\(id,slotLabel,i,compatibility\)/);
  assert.doesNotMatch(fn, /state\.agenda\.push/, 'addAgenda ne doit plus pousser directement dans l’agenda');
});

test('pour un séjour de plusieurs jours, un sélecteur de jour est proposé avant de valider', () => {
  assert.match(app, /agendaDayPick/);
  assert.match(app, /const stay=state\.answers\.duration==='stay'&&tripDays\(\)>1;/);
});

test('l’heure et la durée restent modifiables avant validation pour une activité sans date fixée par la source', () => {
  assert.match(app, /id="agendaTimePick"/);
  assert.match(app, /id="agendaDurationPick"/);
});

test('une activité à date et heure réellement confirmées par la source n’est jamais présentée comme modifiable', () => {
  const start = app.indexOf('function openAddToAgendaModal(');
  const next = app.indexOf('\nfunction confirmAddAgenda', start);
  const fn = app.slice(start, next);
  assert.match(fn, /fixedDate\?`<p>\$\{new Date\(item\.date\)/, 'un horaire confirmé doit être affiché comme non modifiable, jamais glissé dans un champ éditable');
});
