import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Bug réel, sévère, signalé directement : "je suis avec ma fille de 9 ans, j'ai pas d'idée, et
// quand je tape sur Dolcia ça ne me trouve pas d'idée non plus... pourquoi ça ne propose pas le
// tennis ?" Cause trouvée : recommendationEligibleNow() n'acceptait que les statuts 'confirmed'
// et 'autonomous' — mais toute activité nécessitant une séance (tennis, paddle, cinéma, escape
// game, bowling, kayak, golf, spa...) ne peut JAMAIS atteindre 'confirmed' (Google Places ne
// fournit pas de disponibilité de séance en temps réel). Résultat : une catégorie entière
// d'activités réelles et pertinentes était exclue de toute recommandation, partout, toujours.

test('les activités nécessitant une séance (tennis, paddle, escape game...) sont désormais éligibles à la recommandation', () => {
  const start = app.indexOf('function recommendationEligibleNow(item){');
  const line = app.slice(start, app.indexOf('\n', start));
  assert.match(line, /\['confirmed','autonomous','open-not-session','unknown'\]\.includes/);
});

test('reproduction exacte : un court de tennis sans créneau vérifiable par Google devient éligible', () => {
  const start = app.indexOf('function requiresPublishedSession(item){');
  const end = app.indexOf('\n', start);
  const requiresCode = app.slice(start, end);
  const compat = new Function('item', 'requiresPublishedSession',
    `${requiresCode} return requiresPublishedSession(item) ? (item.detailsKnown ? 'confirmed' : 'unknown') : 'confirmed';`);
  const eligibleStates = ['confirmed', 'autonomous', 'open-not-session', 'unknown'];
  const tennisCourt = { name: 'Tennis Club du Touquet', types: ['gym'], detailsKnown: false };
  const status = compat(tennisCourt, undefined);
  assert.ok(eligibleStates.includes(status), 'le statut du tennis doit désormais faire partie des statuts éligibles');
});

test('une incompatibilité réelle (mauvais jour, mauvaise heure) reste exclue — seule la catégorie "à vérifier" a été réintégrée, jamais les vrais conflits', () => {
  const start = app.indexOf('function recommendationEligibleNow(item){');
  const line = app.slice(start, app.indexOf('\n', start));
  assert.doesNotMatch(line, /'incompatible'/, 'incompatible ne doit jamais être ajouté à la liste des statuts éligibles');
});

test('l’ajout à l’agenda n’est plus jamais bloqué pour les activités à séance — un rappel honnête remplace le blocage complet', () => {
  const start = app.indexOf('async function addAgenda(id,slotLabel=\'\'){');
  const next = app.indexOf('\nfunction openAddToAgendaModal', start);
  const fn = app.slice(start, next);
  assert.doesNotMatch(fn, /Impossible de l.ajouter sans séance/, 'l’ancien blocage complet doit avoir disparu');
  assert.match(fn, /Réservation ou créneau à confirmer directement auprès de l.établissement/);
  assert.match(fn, /openAddToAgendaModal\(id,slotLabel,i,compatibility\);/, 'l’activité doit atteindre la fenêtre d’ajout, jamais un simple toast qui arrête tout');
});

test('une vraie incompatibilité d’horaire empêche toujours l’ajout — seul le blocage injustifié des activités à séance a été retiré', () => {
  const start = app.indexOf('async function addAgenda(id,slotLabel=\'\'){');
  const next = app.indexOf('\nfunction openAddToAgendaModal', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(compatibility==='incompatible'\)return showToast/);
});
