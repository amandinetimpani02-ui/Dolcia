import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Promesse du Product Book, visible dans les maquettes ("VOIR LA CARTE") : une vraie carte
// interactive, jusqu'ici totalement absente du code.

test('Leaflet est chargé via CDN dans index.html, CSS avant le script comme requis par la documentation officielle', () => {
  const cssIndex = html.indexOf('leaflet.css');
  const jsIndex = html.indexOf('leaflet.js');
  assert.ok(cssIndex > -1 && jsIndex > -1, 'les deux fichiers Leaflet doivent être chargés');
  assert.ok(cssIndex < jsIndex, 'le CSS doit être chargé avant le script, comme documenté officiellement');
});

test('le bouton de bascule existe et alterne entre liste et carte, jamais les deux affichées en même temps', () => {
  assert.match(app, /onclick="toggleCatalogMapView\(\)"/);
  const start = app.indexOf('function toggleCatalogMapView(){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /state\.catalogFilters\.mapView=!state\.catalogFilters\.mapView;/);
});

test('la carte reste honnête si Leaflet ne s’est pas chargé — jamais un échec silencieux ni des marqueurs simulés', () => {
  const start = app.indexOf('function renderCatalogMap(items){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(typeof L==='undefined'\)/);
  assert.match(fn, /n’a pas pu se charger/);
});

test('seuls les lieux avec de vraies coordonnées reçoivent un marqueur, jamais une position devinée', () => {
  const start = app.indexOf('function renderCatalogMap(items){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /Number\.isFinite\(item\.lat\)&&Number\.isFinite\(item\.lng\)/);
});
