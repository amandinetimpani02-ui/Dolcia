import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../server/recommendations.js', import.meta.url), 'utf8');

test('un budget confortable ne force jamais un week-end uniformément luxueux', () => {
  assert.match(server, /Un gros budget n'est jamais assimilé à une envie de luxe permanent/);
  assert.doesNotMatch(client, /if\(i\.free\|\|i\.price===0\)score-=12/);
  assert.match(client, /function programBalanceScore/);
  assert.match(client, /previousBand.*free','light'/s);
});

test('le programme alterne les intensités budgétaires', () => {
  assert.match(client, /signature','exceptional'.*signature','exceptional'.*score-=24/s);
  assert.match(client, /signature','exceptional'.*free','light'.*score\+=20/s);
});

test('une sortie éloignée doit mériter sa place', () => {
  assert.match(server, /function rarityIsProven/);
  assert.match(server, /distanceMerit:.*proven_rarity.*ordinary/s);
  assert.match(client, /item\.distanceMerit==='ordinary'.*score-=22/);
});

test('la version porte explicitement la conversation adaptative', () => {
  assert.match(client, /19\.16-conversation-adaptative/);
});

test('le programme rend visible sa courbe émotionnelle sans tableau comptable', () => {
  assert.match(client, /function programArcPanel/);
  assert.match(client, /La courbe de votre moment/);
  assert.match(client, /L’inattendu maîtrisé/);
  assert.match(client, /Un budget confortable ne vous enferme jamais dans le luxe/);
});

test('une activité intense appelle une respiration sauf demande sportive explicite', () => {
  assert.match(client, /function experienceEnergy/);
  assert.match(client, /previousEnergy==='high'.*energy==='soft'.*score\+=24/s);
  assert.match(client, /previousEnergy==='high'.*energy==='high'.*score-=32/s);
  assert.match(client, /function wantsSustainedEnergy/);
});

test('un séjour pose une seule question décisive sur son rythme global', () => {
  assert.match(client, /function stayRhythmInsight/);
  assert.match(client, /if\(insight\.confidence>=\.8\)/);
  assert.match(client, /function renderStayRhythmQuestion/);
  assert.match(client, /UNE NUANCE DÉCISIVE/);
  assert.match(client, /Surtout douceur & plage/);
  assert.match(client, /Une vraie semaine sportive/);
});

test('une intention claire ne déclenche pas un questionnaire supplémentaire', () => {
  assert.match(client, /farniente\|plage et repos\|repos total/);
  assert.match(client, /return\{id:'rest',confidence:\.96/);
  assert.match(client, /return\{id:'sport',confidence:\.98/);
});

test('la charge de la veille influence la journée suivante sans enfermer le séjour', () => {
  assert.match(client, /function programDayNumber/);
  assert.match(client, /dayLoads=new Map/);
  assert.match(client, /previousDayLoad/);
  assert.match(client, /tiredYesterday/);
  assert.match(client, /energy==='soft'.*score\+=.*30/s);
  assert.match(client, /energy==='high'.*score-=.*34/s);
});

test('les besoins de récupération de chaque participant comptent dans le rythme', () => {
  assert.match(client, /function groupRecoveryPressure/);
  assert.match(client, /person\.energy==='Douce'/);
  assert.match(client, /person\.momentNeed==='Souffler'/);
});
