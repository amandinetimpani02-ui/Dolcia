import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');

test('Anime est défini comme le rôle d’animateur de D, jamais comme un simple générateur de jeux', async () => {
  const [constitution, vision, product, architecture, prompt] = await Promise.all([
    read('CONSTITUTION.md'),
    read('VISION.md'),
    read('PRODUCT.md'),
    read('ARCHITECTURE.md'),
    read('server/coach-conversation.js')
  ]);

  assert.match(constitution, /D est la personnalité relationnelle unique/i);
  assert.match(vision, /D est la personnalité relationnelle/i);
  assert.match(product, /D reste la personnalité relationnelle unique/i);
  assert.match(architecture, /D est l'identité relationnelle unique/i);
  assert.match(prompt, /Tu es D, la personnalité relationnelle unique/i);
  for (const content of [constitution, vision, product, architecture, prompt])
    assert.match(content, /(?:jamais|pas|ne se réduit jamais)[^\n]{0,100}(?:génér(?:er|ateur)|catalogue)[^\n]{0,40}jeux/i);
});

test('le contrat Anime couvre tout le cycle réel d’une animation', async () => {
  const product = await read('PRODUCT.md');
  for (const responsibility of [
    'Accueil', 'règles', 'équipes', 'Rythme', 'transitions', 'Scores',
    'suspense', 'Encouragements', 'relances', 'Adaptation', 'Conclusion'
  ]) assert.match(product, new RegExp(responsibility, 'i'));
});

test('scores et compétition restent optionnels dans les expériences calmes', async () => {
  const [product, architecture, prompt] = await Promise.all([
    read('PRODUCT.md'), read('ARCHITECTURE.md'), read('server/coach-conversation.js')
  ]);
  assert.match(product, /jamais imposés à une séance calme ou de bien-être/i);
  assert.match(architecture, /ne devient jamais artificiellement compétitive/i);
  assert.match(prompt, /jamais imposés à une séance calme/i);
});

test('les libellés utilisateur présentent Anime comme une animation complète', async () => {
  const app = await read('app.js');
  assert.match(app, /D accueille, cadence, encourage, adapte et conclut/);
  assert.match(app, /animation complète, de l’accueil à la conclusion/);
  assert.doesNotMatch(app, /Jeux, défis ou séance guidée/);
});
