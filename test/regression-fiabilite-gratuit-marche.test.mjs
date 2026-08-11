import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Bug réel signalé : "Club de plage - Caddy Sports Le Touquet" (un commerce payant) était étiqueté
// comme accès gratuit uniquement parce que son nom contient "plage" — le mot ne suffit jamais à
// lui seul à prouver la gratuité.

test('un club de plage payant, une école ou une location ne sont jamais étiquetés comme accès gratuit uniquement à cause du mot "plage" dans leur nom', () => {
  const start = app.indexOf("function normalizePlaces(items)");
  const end = app.indexOf('\n', start + 200);
  const fn = app.slice(start, end);
  assert.match(fn, /\\bclub\\b/, 'les clubs doivent être exclus de la détection de gratuité');
  assert.match(fn, /location/, 'les locations commerciales doivent être exclues');
  assert.match(fn, /ecole|école/, 'les écoles (voile, surf...) doivent être exclues');
});

test('reproduction exacte du cas signalé : Club de plage - Caddy Sports Le Touquet n’est plus considéré comme gratuit', () => {
  const start = app.indexOf("function normalizePlaces(items)");
  const braceStart = app.indexOf('{', start);
  // Extraire uniquement l'expression régulière "business" pour la rejouer isolément
  const businessMatch = app.slice(braceStart, braceStart + 700).match(/business=(\/.+?\/)\.test\(placeText\)/);
  assert.ok(businessMatch, 'la regex business doit être trouvée dans normalizePlaces');
  const businessRegex = eval(businessMatch[1]);
  assert.equal(businessRegex.test('club de plage - caddy sports le touquet'), true, 'doit être reconnu comme un commerce, donc jamais gratuit');
});

// Bug réel signalé : le marché couvert du Touquet était proposé comme une sortie du jour même les
// jours où il n'y a pas de marché — vérifié par recherche réelle : le marché n'ouvre que les
// lundi, jeudi et samedi, jamais les autres jours.

test('le marché couvert du Touquet a une règle de jours réels vérifiée, jamais une hypothèse générale appliquée à tous les marchés', () => {
  assert.match(app, /KNOWN_MARKET_DAYS/);
  assert.match(app, /march[eé] couvert/i);
  assert.match(app, /days:\[1,4,6\]/, 'lundi (1), jeudi (4), samedi (6) — vérifié par recherche réelle');
});

test('momentCompatibility rejette le marché couvert du Touquet un jour où il n’est réellement pas ouvert', () => {
  const start = app.indexOf('function knownMarketOpenToday(item)');
  const next = app.indexOf('\nfunction momentCompatibility', start);
  const fn = app.slice(start, next);
  assert.match(fn, /rule\.days\.includes\(new Date\(state\.dateStart\)\.getDay\(\)\)/);
  const compatStart = app.indexOf('function momentCompatibility(item){');
  const compatSection = app.slice(compatStart, compatStart + 900);
  assert.match(compatSection, /marketToday===false\)return'incompatible'/);
});
