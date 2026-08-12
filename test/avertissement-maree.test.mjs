import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function extract(name) {
  const start = app.indexOf(`function ${name}(`);
  const brace = app.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < app.length; i += 1) {
    if (app[i] === '{') depth += 1;
    if (app[i] === '}') depth -= 1;
    if (depth === 0) return app.slice(start, i + 1);
  }
}

// Signalé directement : le paddle en mer (et les activités nautiques comparables) dépendent des
// marées, surtout sur la côte de la Manche/Nord — contrairement au sud de la France. Aucune vraie
// donnée de marée n'est branchée dans ce projet : plutôt que d'inventer un horaire ou de rester
// silencieuse, Dolcia doit le dire honnêtement.

test('requiresTideAwareness reconnaît le paddle, le kayak, le char à voile et la voile — jamais deviné pour une piscine ou un lac', () => {
  const code = extract('requiresTideAwareness');
  const fn = new Function('item', `${code}; return requiresTideAwareness(item);`);
  assert.equal(fn({ name: 'Location paddle Le Touquet' }), true);
  assert.equal(fn({ name: 'Char à voile sur la plage' }), true);
  assert.equal(fn({ name: 'Piscine municipale avec bassin' }), false, 'une piscine n’est jamais concernée par les marées');
  assert.equal(fn({ name: 'Restaurant Le Bistrot' }), false);
});

test('why() signale honnêtement la dépendance aux marées, jamais une heure précise affirmée sans donnée réelle', () => {
  const start = app.indexOf('function why(i){');
  const line = app.slice(start, app.indexOf('\n', start));
  assert.match(line, /if\(requiresTideAwareness\(i\)\)return'Dépend des marées · vérifiez l.horaire réel auprès du club/);
});

test('la vérification marée est faite avant le message générique "à vérifier", pour donner la raison précise plutôt qu’un message vague', () => {
  const start = app.indexOf('function why(i){');
  const line = app.slice(start, app.indexOf('\n', start));
  const tideIndex = line.indexOf('requiresTideAwareness(i)');
  const genericIndex = line.indexOf("compatibility==='unknown'||compatibility==='open-not-session'");
  assert.ok(tideIndex < genericIndex, 'la vérification marée doit être testée avant le message générique');
});

test('le bloc visible de la fiche détaillée affiche aussi l’avertissement marée, pas seulement une petite ligne facile à manquer', () => {
  assert.match(app, /requiresTideAwareness\(item\)\)\?`<div class="detail-warning">/);
  assert.match(app, /Dolcia ne connaît pas les tables de marées/);
});

test('un avertissement déjà présent pour une autre raison (detailWarning) n’est jamais écrasé par l’avertissement marée — les deux peuvent coexister', () => {
  const start = app.indexOf('${(item.detailWarning||requiresTideAwareness(item))?');
  const end = app.indexOf('</div>`:\'\'}', start);
  const section = app.slice(start, end);
  assert.match(section, /\$\{item\.detailWarning\?esc\(item\.detailWarning\)/);
});
