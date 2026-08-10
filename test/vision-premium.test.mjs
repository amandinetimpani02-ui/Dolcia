import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');

test('la couche visuelle premium est chargée après les styles historiques', () => {
  assert.match(index, /detail-progressive\.css"><link rel="stylesheet" href="\/vision-premium\.css"/);
});

test('la scène premium conserve accueil, D, Explorer, Agenda et mouvement réduit', () => {
  for (const selector of ['.eclat-home', '.d-coach', '.experience', '.agenda-day-header', '.bottom-nav.essential-nav']) {
    assert.ok(css.includes(selector), `${selector} doit être traité par la couche premium`);
  }
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /backdrop-filter:blur/);
}
);
