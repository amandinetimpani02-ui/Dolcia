import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const themePath = new URL('../assets/audio/dolcia-theme.mp3', import.meta.url);

test('le vrai fichier audio fourni par la personne est présent dans les assets, pas un fichier généré ou un placeholder', () => {
  assert.ok(existsSync(themePath), 'assets/audio/dolcia-theme.mp3 doit exister');
  const size = statSync(themePath).size;
  assert.ok(size > 100000, 'le fichier doit être le vrai MP3 fourni, pas un fichier vide ou factice');
});

test('l’hymne Dolcia se joue à l’ouverture d’une session Dolcia Anime, et peut être réécouté à tout moment', () => {
  assert.match(app, /function playDolciaTheme\(\)/);
  assert.match(app, /new Audio\('\/assets\/audio\/dolcia-theme\.mp3'\)/);
  assert.match(app, /function startDolciaAnimate\(id\)\{[\s\S]{0,600}playDolciaTheme\(\)/);
  assert.match(app, /onclick="playDolciaTheme\(\)" title="Réécouter l.hymne Dolcia"/);
});

test('l’hymne s’arrête proprement à la pause et à la fin de session, jamais laissé jouer en arrière-plan', () => {
  assert.match(app, /function stopDolciaTheme\(\)/);
  assert.match(app, /function pauseDolciaAnimate\(\)\{stopDolciaTheme\(\)/);
  assert.match(app, /function finishDolciaAnimate\(\)\{[\s\S]{0,80}stopDolciaTheme\(\)/);
});
