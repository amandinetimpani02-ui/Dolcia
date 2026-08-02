import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('la position de défilement est mémorisée à l’ouverture d’une fiche et restaurée exactement à la fermeture', () => {
  assert.match(app, /let detailScrollMemory=null;\nasync function openDetail\(id\)\{\n\s*detailScrollMemory=window\.scrollY;/);
  assert.match(app, /function closeDetail\(\)\{\n\s*document\.querySelector\('#modal'\)\?\.remove\(\);\n\s*if\(detailScrollMemory!=null\)\{window\.scrollTo\(0,detailScrollMemory\);detailScrollMemory=null\}/);
});

test('le focus revient sur la carte ou le bouton qui avait ouvert la fiche — déjà géré par la mécanique modale commune, pas dupliqué ici', () => {
  assert.match(app, /modalOpenerStack\.push\(document\.activeElement\)/);
});

test('après l’ajout au programme, Explorer ou le mode surprise ne sont plus jamais reconstruits entièrement', () => {
  const start = app.indexOf("async function addAgenda(id,slotLabel=''){");
  const nextFn = app.indexOf('\nfunction agendaDateFor', start);
  const fn = app.slice(start, nextFn);
  assert.doesNotMatch(fn, /renderResults\(\)|renderSurprise\(\)/, 'addAgenda ne doit plus rerendre la liste');
  assert.match(fn, /closeDetail\(\);refreshNavBadge\(\);showAddConfirmation/);
});

test('la confirmation propose deux choix explicites, jamais l’ouverture automatique de l’agenda', () => {
  assert.match(app, /function showAddConfirmation\(message='Ajouté à votre programme'\)\{/);
  assert.match(app, /Continuer à explorer<\/button><button class="primary" onclick="renderAgenda\(\)">Voir mon agenda/);
  const start = app.indexOf("async function addAgenda(id,slotLabel=''){");
  const nextFn = app.indexOf('\nfunction agendaDateFor', start);
  const fn = app.slice(start, nextFn);
  assert.doesNotMatch(fn, /[^A-Za-z]renderAgenda\(\)/, 'addAgenda ne doit jamais ouvrir directement l’agenda (seulement via le bouton de la confirmation)');
});

test('le badge du nombre d’éléments se met à jour seul, sans reconstruire toute la barre de navigation', () => {
  assert.match(app, /function refreshNavBadge\(\)\{/);
  assert.match(app, /const badge=document\.querySelector\('\.bottom-nav \.nav-item\.signature span:last-child'\)/);
});

test('la distinction entre ajout vérifié et ajout autonome (à vérifier) reste préservée dans le nouveau message', () => {
  assert.match(app, /showAddConfirmation\(compatibility==='autonomous'\?'Activité libre ajoutée · vérifiez les conditions':'Activité vérifiée et ajoutée à votre agenda'\)/);
});

test('ce correctif est partagé par construction entre Explorer classique, la sélection premium et le mode surprise — une seule fonction addAgenda, jamais trois chemins séparés', () => {
  assert.doesNotMatch(app, /const returnTo=state\.view/, 'la logique de branchement par vue doit avoir disparu');
});
