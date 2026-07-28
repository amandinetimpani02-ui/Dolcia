import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../vision-premium.css',import.meta.url),'utf8');
const coach=app.slice(app.indexOf('function dCoachNextQuestion'),app.indexOf('// Conversation voix-à-voix réelle'));

test('D reste une présence unique qui pose une seule question décisive',()=>{
  assert.match(coach,/function dCoachNextQuestion\(\)/);
  assert.match(coach,/asked=new Set/);
  assert.match(coach,/Une question à la fois\. Jamais deux fois la même\./);
  assert.doesNotMatch(coach,/liste de questions/i);
});

test('clic, texte et voix sont trois réponses équivalentes',()=>{
  assert.match(coach,/answerDCoach\('\$\{question\.id\}'/);
  assert.match(coach,/id="dCoachInput"/);
  assert.match(coach,/startDCoachVoice\(\)/);
  assert.match(coach,/toggleLiveConversation\('dcoach'\)/);
  assert.match(coach,/D comprend les trois de la même façon/);
});

test('les réponses réordonnent le catalogue sans le masquer',()=>{
  assert.match(coach,/function dCoachRerank\(\)/);
  assert.match(coach,/state\.allItems=scoreItems\(state\.allItems\)/);
  assert.match(coach,/Votre catalogue reste entièrement accessible/);
  assert.match(coach,/possibilités réévaluées en direct/);
});

test('D arrête de questionner dès que le contexte suffit',()=>{
  assert.match(coach,/id:'ready'/);
  assert.match(coach,/Je peux maintenant agir sans vous faire passer un interrogatoire/);
  assert.match(coach,/Laisser D décider/);
  assert.doesNotMatch(coach,/openEclatDialogue\(\)/);
});

test('la scène hybride conserve une profondeur premium et accessible',()=>{
  assert.match(css,/V20\.6 — une seule présence D/);
  assert.match(css,/\.d-coach-live-impact/);
  assert.match(css,/\.d-coach\.mood-ready/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
