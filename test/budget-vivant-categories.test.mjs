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

const BUDGET_CATEGORY_LABELS = { hebergement: 'Hébergement', restaurants: 'Restaurants', activites: 'Activités', transport: 'Transport', animations: 'Animations & services' };

function loadCompute(state) {
  const code = [extract('estimateItemCost'), extract('budgetCategory'), extract('budgetItemState'), extract('computeLivingBudget')].join('\n');
  const currentGroupSize = () => state.groupSize || 1;
  return new Function('state', 'currentGroupSize', 'BUDGET_CATEGORY_LABELS', `${code}; return computeLivingBudget();`)(state, currentGroupSize, BUDGET_CATEGORY_LABELS);
}

// Répond au retour direct : le porte-monnaie doit permettre un geste rapide, à tout moment, pas
// une confirmation bureaucratique liée à chaque activité planifiée de l'agenda.

test('chaque activité de l’agenda est classée dans la bonne catégorie budgétaire', () => {
  const code = extract('budgetCategory');
  const fn = new Function('item', `${code}; return budgetCategory(item);`);
  assert.equal(fn({ category: 'hotel' }), 'hebergement');
  assert.equal(fn({ category: 'food' }), 'restaurants');
  assert.equal(fn({ name: 'Course Uber vers le centre', category: 'active' }), 'transport');
  assert.equal(fn({ autonomousProgram: 'sport' }), 'animations');
  assert.equal(fn({ category: 'outside' }), 'activites');
});

test('une dépense enregistrée via le porte-monnaie compte immédiatement dans le budget, sans être liée à une activité de l’agenda', () => {
  const state = { agenda: [], budgetPlan: { amount: 500 }, groupSize: 2, walletLedger: [{ amount: 35, category: 'restaurants', at: new Date().toISOString() }] };
  const budget = loadCompute(state);
  assert.equal(budget.categories.restaurants.paid, 35);
  assert.equal(budget.remaining, 465);
});

test('plusieurs dépenses rapides successives s’additionnent correctement dans la même catégorie', () => {
  const state = { agenda: [], budgetPlan: { amount: 200 }, groupSize: 2, walletLedger: [
    { amount: 12, category: 'restaurants', at: new Date().toISOString() },
    { amount: 8, category: 'restaurants', at: new Date().toISOString() },
    { amount: 20, category: 'activites', at: new Date().toISOString() }
  ] };
  const budget = loadCompute(state);
  assert.equal(budget.categories.restaurants.paid, 20);
  assert.equal(budget.categories.activites.paid, 20);
  assert.equal(budget.remaining, 160);
});

test('le bouton flottant "J’ai payé" est accessible depuis n’importe quel écran, pas seulement l’agenda', () => {
  assert.match(app, /class="wallet-fab" onclick="openWalletQuickPay\(\)"/);
  const start = app.indexOf('function shell(content');
  const next = app.indexOf('\nfunction nav(', start);
  const line = app.slice(start, next);
  assert.match(line, /wallet-fab/, 'le bouton doit vivre dans shell(), donc présent sur tous les écrans');
});

test('le geste rapide ne demande qu’un montant et une catégorie optionnelle, jamais de lier à une activité précise', () => {
  const start = app.indexOf('function openWalletQuickPay(){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /id="walletAmount"/);
  assert.match(fn, /wallet-categories/);
  assert.doesNotMatch(fn, /itemId/, 'aucune dépendance à un identifiant d’activité de l’agenda');
});

test('après confirmation, un retour visuel immédiat et net affiche ce qu’il reste — pas un simple toast discret', () => {
  const start = app.indexOf('function showWalletRemaining(){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /wallet-remaining-reveal/);
  assert.match(fn, /Il vous reste/);
});

test('un montant invalide ou nul est refusé avant d’être enregistré, jamais une dépense fantôme', () => {
  const start = app.indexOf('function confirmWalletQuickPay(){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  assert.match(fn, /if\(!Number\.isFinite\(amount\)\|\|amount<=0\)return showToast/);
});

test('le registre du porte-monnaie est bien persisté, indépendamment de l’agenda', () => {
  assert.match(app, /localStorage\.setItem\('dolcia_wallet_ledger_v1',JSON\.stringify\(state\.walletLedger\)\)/);
  assert.match(app, /state\.walletLedger=JSON\.parse\(localStorage\.getItem\('dolcia_wallet_ledger_v1'\)\|\|'\[\]'\)/);
});
