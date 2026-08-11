import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Promesse du Product Book jusqu'ici absente : "Dolcia peut même aller plus loin... proposer une
// activité commune, puis momentanément deux expériences différentes — par exemple une activité
// pour les enfants pendant que les parents profitent d'un moment à deux — avant de réunir de
// nouveau tout le monde."

test('la détection exige à la fois un enfant et un adulte dans le groupe, jamais l’un sans l’autre', () => {
  const start = app.indexOf('function familySplitOpportunity(index){');
  const next = app.indexOf('\nfunction applyFamilySplit', start);
  const fn = app.slice(start, next);
  assert.match(fn, /hasChild=profiles\.some\(person=>person\.kind==='child'\)/);
  assert.match(fn, /hasAdult=profiles\.some\(person=>person\.kind!=='child'\)/);
  assert.match(fn, /if\(!hasChild\|\|!hasAdult\)return null;/);
});

test('le split n’est jamais proposé si l’une des deux activités (enfants ou adultes) n’existe pas réellement dans le pool disponible', () => {
  const start = app.indexOf('function familySplitOpportunity(index){');
  const next = app.indexOf('\nfunction applyFamilySplit', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(!kidsCandidate\|\|!adultsCandidate\)return null;/);
});

test('le split reste un choix explicite, jamais automatique — deux boutons, "séparer" ou "rester ensemble"', () => {
  assert.match(app, /onclick="applyFamilySplit\(\$\{index\}\)">Séparer ce moment/);
  assert.match(app, /onclick="declineFamilySplit\(\$\{index\}\)">Rester tous ensemble/);
});

test('un refus (declineFamilySplit) est mémorisé par créneau, pour ne pas reproposer indéfiniment la même question', () => {
  const start = app.indexOf('function declineFamilySplit(index){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /state\.programPreferences\[`split_\$\{index\}`\]='declined'/);
});
