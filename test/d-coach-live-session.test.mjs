import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('D conserve la progression et l Elan entre les missions', () => {
  assert.match(app, /dolcia_animate_history_v1/);
  assert.match(app, /elan:0,completed:0/);
  assert.match(app, /Élan collectif/);
  assert.match(app, /finishDolciaAnimate/);
});

test('D adapte la session aux réactions du groupe sans pénaliser un refus', () => {
  assert.match(app, /Plus calme/);
  assert.match(app, /Plus vivant/);
  assert.match(app, /Pas pour nous/);
  assert.match(app, /ne pénalise aucun refus/);
  assert.match(app, /reaction==='calmer'/);
  assert.match(app, /reaction==='livelier'/);
});

test('la voix porte la personnalité et la consigne de la mission', () => {
  assert.match(app, /animateCoachLine\(session\).*animateStepText\(session\)/s);
  assert.match(app, /playPremiumVoice\(text/);
  assert.match(app, /voiceMoodFromText/);
});

test('la session vivante garde une mise en scène premium et mobile', () => {
  assert.match(css, /\.animate-presence/);
  assert.match(css, /\.animate-response/);
  assert.match(css, /\.animate-finale/);
  assert.match(css, /@media\(max-width:620px\)/);
});
