import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('le Plan B météo existe en un seul style premium (noir/or), plus d’ancienne variante bleu clair oubliée', () => {
  assert.doesNotMatch(style, /#dce9ff/);
  assert.match(style, /\.plan-b\{margin-bottom:38px;padding:26px 28px;border-radius:25px;background:linear-gradient\(135deg,#1b1710,#111315\)/);
});

test('le Plan B météo propose deux actions claires (agir ou garder tel quel), jamais un seul lien ambigu', () => {
  assert.match(app, /class="plan-b-actions"/);
  assert.match(app, /function dismissWeatherPlan\(\)/);
});

test('le Plan B météo apparaît aussi dans le programme composé, pas seulement dans Explorer', () => {
  assert.match(app, /weatherPlan\('program'\)/);
  assert.match(app, /if\(scope==='program'&&!state\.program\.some\(slot=>slot\.item\.category==='outside'\)\)return''/);
});

test('réorganiser le programme remplace réellement chaque étape extérieure par la meilleure alternative abritée compatible, pas un simple tri', () => {
  assert.match(app, /function applyWeatherPlanB\(\)/);
  assert.match(app, /item\.category!=='outside'&&!used\.has\(item\.id\)&&recommendationEligibleNow\(item\)&&isTimeCompatible\(item,slot\.label\)/);
});

test('si aucune alternative fiable n’existe, Dolcia le dit plutôt que de fabriquer un remplacement', () => {
  assert.match(app, /Aucune alternative abritée assez fiable trouvée pour l.instant/);
});

test('les cartes Agenda sont immersives (grande image pleine largeur) et non plus une petite vignette 90×90', () => {
  assert.match(style, /\.agenda-card\{display:grid;grid-template-columns:1fr;grid-template-areas:"image" "time" "content"/);
  assert.match(style, /\.agenda-card img\{grid-area:image;width:100%/);
  assert.doesNotMatch(style, /\.agenda-card\{grid-template-columns:68px 1fr\}/);
});
