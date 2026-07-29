import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const vision = readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');
const voice = readFileSync(new URL('../server/voice-synthesis.js', import.meta.url), 'utf8');

test('D rend visibles ses états relationnels sans changer de personnage', () => {
  assert.match(app, /function setDVisualState/);
  for (const mood of ['listening', 'thinking', 'speaking', 'delighted', 'calm', 'encouraging']) {
    assert.match(app, new RegExp(`'${mood}'`));
    assert.match(vision, new RegExp(`is-${mood}`));
  }
  assert.match(vision, /dMouthTalk/);
  assert.match(vision, /dStarThink/);
});

test('la voix neuronale adapte son expression au sens du message', () => {
  assert.match(app, /function voiceMoodFromText/);
  assert.match(app, /function browserVoiceProfile/);
  assert.match(app, /JSON\.stringify\(\{text,mood\}\)/);
  assert.match(voice, /voiceProfiles/);
  for (const mood of ['warm', 'joyful', 'calm', 'encouraging']) {
    assert.match(voice, new RegExp(`${mood}:`));
  }
});

test('les interventions spontanées sont minutées, contextuelles et restent un choix', () => {
  assert.match(app, /function scheduleAnimateNudge/);
  assert.match(app, /function animateNudgeLine/);
  assert.match(app, /lastInteractionAt/);
  assert.match(app, /52000/);
  assert.match(app, /On continue/);
  assert.match(app, /Adapte la suite/);
  assert.match(app, /mais seulement si vous en avez envie/);
  assert.match(premium, /\.animate-nudge/);
});

test('les minuteurs sont arrêtés lors de la pause et à la fin', () => {
  const clears = app.match(/clearTimeout\(animateNudgeTimer\)/g) || [];
  assert.ok(clears.length >= 3);
});
