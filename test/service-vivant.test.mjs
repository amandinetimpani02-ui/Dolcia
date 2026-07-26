import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../premium.css', import.meta.url), 'utf8');

test('la sélection éditoriale garde le catalogue complet accessible', () => {
  assert.match(app, /La sélection vivante de Dolcia/);
  assert.match(app, /Explorer les \$\{state\.allItems\.length\} possibilités/);
  assert.match(app, /Ajouter au programme/);
});

test('les signaux de décision reposent sur des faits vérifiables', () => {
  assert.match(app, /'Confirmé'/);
  assert.match(app, /'Compatible'/);
  assert.match(app, /'À vérifier'/);
  assert.doesNotMatch(app, /plus que [0-9]+ places/i);
});

test('la vitrine se parcourt comme une collection premium sur mobile', () => {
  assert.match(css, /scroll-snap-type:x mandatory/);
  assert.match(css, /grid-auto-columns:minmax\(275px,84%\)/);
});
