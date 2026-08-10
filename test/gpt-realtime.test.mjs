import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');

test('GPT Realtime est le moteur vocal principal et la clé reste côté serveur', async () => {
  const [app, events, realtime, env] = await Promise.all([
    read('app.js'),
    read('api/events.js'),
    read('server/realtime-voice.js'),
    read('.env.example')
  ]);
  assert.match(app, /new RTCPeerConnection\(\)/);
  assert.match(app, /navigator\.mediaDevices\.getUserMedia/);
  assert.match(app, /service=realtime/);
  assert.match(app, /stopGPTRealtimeOnly/);
  assert.match(app, /getTracks\?\.\(\)\.forEach\(track=>track\.stop\(\)\)/);
  assert.match(app, /listenOnce\(mode\)/);
  assert.doesNotMatch(app, /OPENAI_API_KEY/);
  assert.match(events, /service === 'realtime'/);
  assert.match(realtime, /process\.env\.OPENAI_API_KEY/);
  assert.match(realtime, /gpt-realtime-2\.1/);
  assert.match(realtime, /\/v1\/realtime\/calls/);
  assert.match(realtime, /type: 'semantic_vad'/);
  assert.match(realtime, /interrupt_response: true/);
  assert.match(env, /OPENAI_API_KEY=/);
  assert.match(env, /OPENAI_REALTIME_MODEL=gpt-realtime-2\.1/);
});

test('la persona D reste partagée avec le mode de secours', async () => {
  const [coach, realtime] = await Promise.all([
    read('server/coach-conversation.js'),
    read('server/realtime-voice.js')
  ]);
  assert.match(coach, /export \{ personaCore,/);
  assert.match(realtime, /import \{ personaCore \}/);
  assert.match(realtime, /Ne récite jamais un questionnaire/);
  assert.match(realtime, /Laisse la personne t'interrompre naturellement/);
});
