import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../server/recommendations.js', import.meta.url), 'utf8');

test('un budget confortable ne force jamais un week-end uniformément luxueux', () => {
  assert.match(server, /Un gros budget n'est jamais assimilé à une envie de luxe permanent/);
  assert.doesNotMatch(client, /if\(i\.free\|\|i\.price===0\)score-=12/);
  assert.match(client, /function programBalanceScore/);
  assert.match(client, /diningChoice=state\.programPreferences\.dining/);
});

test('le programme ne décide jamais seul d’alterner les niveaux de prix', () => {
  assert.doesNotMatch(client, /includes\(previousBand\).*score\+=20/);
  assert.doesNotMatch(client, /includes\(previousBand\).*score-=24/);
  assert.match(client, /diningChoice==='signature'/);
  assert.match(client, /diningChoice==='light'/);
  assert.match(client, /diningChoice==='budget'/);
});

test('une sortie éloignée doit mériter sa place', () => {
  assert.match(server, /function rarityIsProven/);
  assert.match(server, /distanceMerit:.*proven_rarity.*ordinary/s);
  assert.match(client, /item\.distanceMerit==='ordinary'.*score-=22/);
});

test('la version porte explicitement la vérité du moment', () => {
<<<<<<< HEAD
  assert.match(client, /20\.15\.0-question-decisive/);
=======
  assert.match(client, /21\.40\.1-moteur-comportements/);
>>>>>>> 04f5afeae402fd69b23a6176fa905b97407db1ae
  assert.match(client, /function momentTruth/);
});

test('le programme rend visible sa courbe émotionnelle sans tableau comptable', () => {
  assert.match(client, /function programArcPanel/);
  assert.match(client, /La courbe de votre moment/);
  assert.match(client, /L’inattendu maîtrisé/);
  assert.match(client, /Elle ne choisit jamais le rythme à votre place/);
});

test('une activité intense déclenche un choix et non une respiration imposée', () => {
  assert.match(client, /function experienceEnergy/);
  assert.doesNotMatch(client, /previousEnergy==='high'.*score/s);
  assert.match(client, /On continue sport \+\+\+/);
  assert.match(client, /On change d’énergie/);
  assert.match(client, /On ralentit vraiment/);
});

test('un séjour pose une seule question décisive sur son rythme global', () => {
  assert.match(client, /function stayRhythmInsight/);
  assert.match(client, /if\(insight\.confidence>=\.8\)/);
  assert.match(client, /function renderStayRhythmQuestion/);
  assert.match(client, /dialogue-choices stay-rhythm-options/);
  assert.doesNotMatch(client, /dialogue-options stay-rhythm-options/);
  assert.match(client, /UNE NUANCE DÉCISIVE/);
  assert.match(client, /Surtout douceur & plage/);
  assert.match(client, /Une vraie semaine sportive/);
});

test('une intention claire ne déclenche pas un questionnaire supplémentaire', () => {
  assert.match(client, /farniente\|plage et repos\|repos total/);
  assert.match(client, /return\{id:'rest',confidence:\.96/);
  assert.match(client, /return\{id:'sport',confidence:\.98/);
});

test('la charge de la veille est observable mais ne décide pas à la place du groupe', () => {
  assert.match(client, /function programDayNumber/);
  assert.match(client, /dayLoads=new Map/);
  assert.match(client, /previousDayLoad/);
  assert.doesNotMatch(client, /tiredYesterday/);
  assert.match(client, /state\.programPreferences\.energy/);
});

test('les besoins de récupération de chaque participant comptent dans le rythme', () => {
  assert.match(client, /function groupRecoveryPressure/);
  assert.match(client, /person\.energy==='Douce'/);
  assert.match(client, /person\.momentNeed==='Souffler'/);
});
