import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

// Une image chargée en paresseux qui apparaît d'un coup casse la fluidité, même quand la
// navigation elle-même est douce. Fondu léger dès le chargement effectif, même langage visuel
// que les transitions d'écran (même famille de courbe).
test('les 4 listes avec chargement paresseux ont aussi un fondu progressif à l’arrivée de l’image', () => {
  const count = (app.match(/class="fade-img"|class="exp-image fade-img"/g) || []).length;
  assert.equal(count, 4, 'les 4 emplacements connus doivent avoir la classe fade-img');
  const onload = (app.match(/onload="this\.classList\.add\('img-loaded'\)"/g) || []).length;
  assert.equal(onload, 4);
});

test('le style du fondu existe et respecte le mouvement réduit', () => {
  assert.match(style, /\.fade-img\{opacity:0;transition:opacity \.3s cubic-bezier\(\.16,1,\.3,1\)\}/);
  assert.match(style, /\.fade-img\.img-loaded\{opacity:1\}/);
  assert.match(style, /@media\(prefers-reduced-motion:reduce\)\{\.fade-img\{transition:none;opacity:1\}\}/);
});
