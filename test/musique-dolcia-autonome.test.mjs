import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Signalé directement : "même la musique Dolcia je ne peux pas la mettre pour l'écouter ou
// mettre pause, rien !" Vérifié : le fichier audio existe réellement
// (assets/audio/dolcia-theme.mp3), mais aucun contrôle ne permettait de l'écouter en dehors du
// déclenchement automatique au démarrage d'une session Anime complète.

test('le fichier audio référencé existe réellement dans le projet, jamais une référence à un fichier fantôme', () => {
  const path = new URL('../assets/audio/dolcia-theme.mp3', import.meta.url);
  assert.ok(existsSync(path), 'le fichier doit réellement exister pour que ce bouton ait un sens');
});

test('un bouton d’écoute autonome existe sur le Home, indépendant du démarrage d’une session Anime', () => {
  assert.match(app, /onclick="toggleStandaloneDolciaTheme\(\)"/);
  assert.match(app, /Écouter la musique Dolcia/);
});

test('toggleStandaloneDolciaTheme réutilise le même fichier réel que la session Anime, jamais un second fichier différent', () => {
  const start = app.indexOf('function toggleStandaloneDolciaTheme(){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /\/assets\/audio\/dolcia-theme\.mp3/);
});

test('un échec de lecture (navigateur, permissions) est signalé honnêtement, jamais silencieux', () => {
  const start = app.indexOf('function toggleStandaloneDolciaTheme(){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /Lecture impossible sur ce navigateur/);
});
