import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const home = await readFile(new URL('../home-premium.css', import.meta.url), 'utf8');
const premium = await readFile(new URL('../premium.css', import.meta.url), 'utf8');

test('l’accueil ne montre plus de panne technique au consommateur', () => {
  assert.doesNotMatch(app, /Les sources officielles sont momentanément indisponibles/);
  assert.match(app, /Le champ des possibles reste ouvert/);
  assert.match(app, /Dites simplement à Dolcia quand, avec qui et ce qui vous ferait plaisir/);
  assert.match(app, /onclick="openEclatDialogue\(\)"/);
  assert.doesNotMatch(app.match(/const emptyPulse=\(\)=>`[^`]+`;/s)?.[0] || '', /startCompose\(\)/);
});

test('la photographie du Home reste réellement visible au-dessus du fond', () => {
  assert.match(home, /\.home-poster\{[^}]*isolation:isolate/);
  assert.match(home, /\.home-poster-image\{[^}]*z-index:0/);
  assert.doesNotMatch(home, /\.home-poster-image\{[^}]*z-index:-1/);
});

test('le flux officiel tolère des réponses partielles sans casser l’accueil', () => {
  assert.match(app, /Array\.isArray\(official\.value\?\.events\)/);
  assert.match(app, /Array\.isArray\(tickets\.value\?\.events\)/);
  assert.match(app, /renderHomeMajor\(state\.majorMoments\[0\]\|\|null\)/);
});

test('le héros et la navigation préservent les actions visibles', () => {
  assert.match(home, /font-size:clamp\(52px,6\.25vw,88px\)/);
  assert.match(home, /padding-bottom:124px/);
  assert.match(premium, /padding-bottom:calc\(104px \+ env\(safe-area-inset-bottom\)\)/);
});
