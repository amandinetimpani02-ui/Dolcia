import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Bug réel signalé par capture d'écran : "Aire de jeux espace Canche" apparaissait sous
// "Bien-être" en sélectionnant "en amoureux". Cause trouvée : le mot français "espace" contient
// littéralement la sous-chaîne "spa", et la règle de catégorisation n'avait aucune limite de mot.

test('la détection de "spa" utilise une limite de mot, pour ne plus matcher à tort le mot "espace"', () => {
  const start = app.indexOf("function category(text=''){");
  const line = app.slice(start, app.indexOf('\n', start));
  assert.match(line, /\\bspa\\b/);
});

test('reproduction exacte : "Aire de jeux espace Canche" n’est plus jamais catégorisée bien-être', () => {
  const start = app.indexOf("function category(text=''){");
  const line = app.slice(start, app.indexOf('\n', start));
  // Extraire et rejouer la regex "slow" isolément
  const match = line.match(/if\(\/(\\bspa\\b\|beauty\|yoga\|\\bbien\\b)\/\.test\(t\)\)return'slow'/);
  assert.ok(match, 'la regex slow doit être trouvée telle quelle');
  const regex = new RegExp(match[1]);
  assert.equal(regex.test('aire de jeux espace canche'), false);
  assert.equal(regex.test('spa massage bien-etre'), true, 'un vrai spa doit toujours être détecté');
});

test('"art", "bar" et "bien" utilisent aussi une limite de mot, pour ne pas matcher artisan/départ/quartier, barbecue/embarquement, combien', () => {
  const start = app.indexOf("function category(text=''){");
  const line = app.slice(start, app.indexOf('\n', start));
  assert.match(line, /\\bart\\b/);
  assert.match(line, /\\bbar\\b/);
  assert.match(line, /\\bbien\\b/);
});

// Bug réel signalé : "je veux un parc d'attractions, je ne trouve absolument rien" — un parc
// d'attractions contient le mot "parc" et tombait donc dans "Nature & mer", jamais dans
// "Fun & famille" où on penserait naturellement à le chercher.

test('un parc d’attractions, aquatique ou animalier est catégorisé "active" (Fun & famille), jamais "outside" (Nature & mer)', () => {
  const start = app.indexOf("function category(text=''){");
  const line = app.slice(start, app.indexOf('\n', start));
  assert.match(line, /parc d\.attraction\|parc aquatique\|parc animalier/);
  const beforeOutside = line.indexOf("return'active'}if(/park|parc");
  const attractionIndex = line.indexOf('parc d.attraction');
  const outsideIndex = line.indexOf("return'outside'");
  assert.ok(attractionIndex < outsideIndex, 'la règle parc d’attractions doit être vérifiée avant la règle générique nature');
});
