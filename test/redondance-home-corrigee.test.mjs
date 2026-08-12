import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function extractHome() {
  const funcStart = app.indexOf('function home(){');
  const brace = app.indexOf('{', funcStart);
  let depth = 0, i = brace;
  for (; i < app.length; i += 1) { if (app[i] === '{') depth += 1; if (app[i] === '}') depth -= 1; if (depth === 0) break; }
  return app.slice(funcStart, i + 1);
}

function renderHome(qualified) {
  const state = { view: null, momentQualified: qualified, location: { name: 'Le Touquet-Paris-Plage' }, agenda: [] };
  const appEl = { innerHTML: '' };
  const esc = s => String(s);
  const dMascotMark = () => '<span>D</span>';
  const homePosterInner = () => '';
  const shell = content => content;
  const loadHomePulse = () => {};
  const applyHomeNavPreview = () => {};
  const fnSrc = extractHome();
  const fn = new Function('state', 'app', 'esc', 'dMascotMark', 'homePosterInner', 'shell', 'loadHomePulse', 'applyHomeNavPreview',
    fnSrc.replace('function home(){', '').replace(/}$/, ''));
  fn(state, appEl, esc, dMascotMark, homePosterInner, shell, loadHomePulse, applyHomeNavPreview);
  return appEl.innerHTML;
}

// Signalé directement, très fermement : "quatre boutons, voire cinq sur l'accueil qui t'amènent à
// la même chose". Vérifié en exécutant le vrai code : c'était en réalité SIX déclencheurs
// distincts (bouton principal, badge D, champ de recherche, bouton voix, "Mes idées", "Créer mon
// moment" dans la barre du bas) menant tous à l'identique openEclatDialogue(false,'compose') tant
// que rien n'avait encore été qualifié.

test('avant toute qualification, un seul déclencheur vers le dialogue existe sur le Home — plus six', () => {
  const html = renderHome(false);
  const count = (html.match(/openEclatDialogue/g) || []).length;
  assert.equal(count, 1, 'un seul point d’entrée doit exister avant toute qualification');
});

test('le bloc de recherche (badge D, champ, bouton voix) n’apparaît pas avant qualification — il était strictement redondant avec le bouton principal', () => {
  const html = renderHome(false);
  assert.doesNotMatch(html, /class="living-brief home-search"/);
});

test('"Choisir parmi mes idées" n’apparaît pas avant qualification — il redirigeait vers le même dialogue que le bouton principal, sans aucune utilité distincte à ce stade', () => {
  const html = renderHome(false);
  assert.doesNotMatch(html, /class="home-path ideas"/);
});

test('une fois qualifié, le bloc de recherche et "Mes idées" redeviennent des actions réellement distinctes et utiles', () => {
  const html = renderHome(true);
  assert.match(html, /class="living-brief home-search"/);
  assert.match(html, /class="home-path ideas"/);
  assert.match(html, /Une nouvelle envie \? Parlez-en à D/, 'le texte doit refléter qu’il s’agit maintenant d’une nouvelle demande, pas de la première');
});

test('coach et balade guidée restent toujours visibles, avant comme après qualification — ce ne sont jamais des doublons du bouton principal', () => {
  const beforeHtml = renderHome(false);
  const afterHtml = renderHome(true);
  for (const html of [beforeHtml, afterHtml]) {
    assert.match(html, /onclick="openDolciaAnimate\('coach'\)"/);
    assert.match(html, /onclick="openLocalDiscoveryWithD\(\)"/);
  }
});
