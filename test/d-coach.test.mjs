import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../premium.css',import.meta.url),'utf8');

test('le D ouvre un coach contextuel au lieu de rejouer un parcours fixe',()=>{
  assert.match(app,/function openMyMoment\(\)\{openDCoach\(\)\}/);
  assert.match(app,/function dCoachNextQuestion\(\)/);
  assert.match(app,/Une question à la fois\. Jamais deux fois la même/);
});

test('coach, animateur, programme et budget restent quatre prises en charge claires',()=>{
  for(const label of ['Laisser D décider','D anime ce moment','Affiner une nuance','Protéger le budget']){
    assert.match(app,new RegExp(label));
  }
  assert.match(app,/openDolciaAnimate\(\)/);
  assert.match(app,/openBudgetEditor\(\)/);
});

test('la voix conserve une alternative écrite et un état perceptible',()=>{
  assert.match(app,/SpeechRecognition\|\|window\.webkitSpeechRecognition/);
  assert.match(app,/Vous pouvez écrire exactement la même chose/);
  assert.match(app,/aria-live="polite"/);
  assert.match(css,/\.d-coach-mic\.listening/);
});

test('les réglages modifient le moment sans effacer le contexte existant',()=>{
  assert.match(app,/state\.answers\.momentSentence=\[state\.answers\.momentSentence,sentence\]\.filter\(Boolean\)\.join\(' '\)/);
  assert.match(app,/alternez plaisir signature, expériences simples et gratuit confirmé/);
  assert.match(app,/Ne sortir de la destination que pour une pépite exceptionnelle/);
});

test('le coach respecte le mobile, le mouvement réduit et une scène immersive',()=>{
  assert.match(css,/\.d-coach-scene/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
