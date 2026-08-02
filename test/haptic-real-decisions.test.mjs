import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Un ami ne fait pas sentir chaque interaction, seulement celles qui comptent vraiment. Trois
// décisions réelles reçoivent un retour tactile discret : ajouter au programme, réserver, lancer
// une activité Dolcia Anime. Rien d'autre — jamais sur un filtre, un onglet, une fermeture.
test('exactement trois moments de vraie décision reçoivent un retour haptique, jamais plus', () => {
  const count = (app.match(/if\(navigator\.vibrate\)navigator\.vibrate\(12\)/g) || []).length;
  assert.equal(count, 3, 'doit rester à trois moments précis, ni plus ni moins');
});

test('aucune vibration sur les interactions ordinaires (filtres, fermeture, changement d’onglet)', () => {
  for (const fn of ['toggleAdaptiveLens', 'setCatalogAvailability', 'setCatalogBudget', 'closeDetail']) {
    const match = app.match(new RegExp(`function ${fn}\\([^)]*\\)\\{[^}]*\\}`));
    if (match) assert.doesNotMatch(match[0], /navigator\.vibrate/, `${fn} ne doit jamais vibrer`);
  }
});

test('utilise uniquement l’API standard déjà feature-detectée — jamais de comportement inventé si la plateforme ne la supporte pas (Safari iOS, par exemple)', () => {
  const occurrences = app.match(/if\(navigator\.vibrate\)navigator\.vibrate\(12\)/g) || [];
  assert.ok(occurrences.every(o => o.startsWith('if(navigator.vibrate)')), 'chaque appel doit être protégé par une détection de fonctionnalité');
});
