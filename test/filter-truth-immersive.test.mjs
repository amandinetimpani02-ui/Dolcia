import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('un nouveau moment efface les anciens filtres avant de recomposer', () => {
  assert.match(app, /function finishEclat\(\).*?resetMomentCatalogFilters\(\);save\(\);/s);
  assert.match(app, /family:'all',\s*sort:'recommended',\s*availability:'all',\s*query:''/);
  assert.match(app, /preferred:\[\],\s*lenses:\[\],\s*discoveryMode:false/);
});

test('retirer les filtres avancés les retire vraiment puis recalcule l’écran', () => {
  assert.match(app, /function showWithoutAdvancedFilters\(\)\{\s*resetMomentCatalogFilters\(\);\s*renderResults\(\);/);
  assert.match(app, /onclick="showWithoutAdvancedFilters\(\)"/);
});

test('amis rire gratuit reçoit une proposition locale animée par D', () => {
  assert.match(app, /function injectDolciaAutonomousChoices\(\)/);
  assert.match(app, /item\.id='dolcia-animate-social-catalog'/);
  assert.match(app, /item\.name='Le Touquet en défis avec D'/);
  assert.match(app, /free:true,\s*price:0/);
  assert.match(app, /item\.distance=0/);
  assert.match(app, /status:'core'/);
  assert.match(app, /injectDolciaAutonomousChoices\(\);/);
});

test('le recours ne masque plus les propositions', () => {
  assert.match(css, /\.zero-cascade\.embedded \.zero-cascade-options/);
  assert.match(css, /min-height:126px/);
  assert.match(app, /const guided=Boolean\(i\.autonomousProgram\)/);
});
