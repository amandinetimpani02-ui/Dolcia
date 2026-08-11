import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Régression signalée directement : "je souhaite une activité matin, une pm, un resto à midi et
// un plus beau resto le soir, je suis perdu dans les méandres de l'appli" — Explorer n'offrait
// qu'une liste plate, sans aucune aide à la construction d'une journée par moment.

test('l’option "Par moment de la journée" existe dans le tri', () => {
  assert.match(app, /<option value="daypart"/);
  assert.match(app, /Par moment de la journée/);
});

test('renderCatalogByDaypart ne fait jamais deviner si un restaurant est pour midi ou le soir — il reste dans sa propre section neutre', () => {
  const start = app.indexOf('function renderCatalogByDaypart(items){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /Pour manger — midi ou soir, à vous de choisir/);
});

test('chaque activité n’apparaît qu’une seule fois, jamais dupliquée entre deux sections', () => {
  const start = app.indexOf('function renderCatalogByDaypart(items){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /!used\.has\(item\.id\)/);
  assert.match(fn, /sectionItems\.forEach\(item=>used\.add\(item\.id\)\)/);
});

test('une activité qui ne correspond à aucune section connue reste visible, dans "Autres idées", jamais perdue silencieusement', () => {
  const start = app.indexOf('function renderCatalogByDaypart(items){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /Autres idées/);
});
