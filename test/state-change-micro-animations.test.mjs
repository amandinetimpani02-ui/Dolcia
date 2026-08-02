import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('le favori a un léger rebond (1.0 → 1.12 → 1.0) et une transition de couleur douce, jamais un changement instantané', () => {
  assert.match(premium, /\.quick-heart\.selected\{color:#e9c778;border-color:#e9c778;animation:heartPop \.18s cubic-bezier\(\.34,1\.56,\.64,1\)\}/);
  assert.match(premium, /@keyframes heartPop\{0%\{transform:scale\(1\)\}50%\{transform:scale\(1\.12\)\}100%\{transform:scale\(1\)\}\}/);
});

test('la confirmation d’ajout/réservation affiche une vraie coche de validation, pas seulement un changement de texte', () => {
  assert.match(style, /\.agenda-button\.added::before\{content:'✓ ';font-weight:700\}/);
  assert.match(style, /@keyframes confirmPop/);
});

test('les filtres (familles et lentilles) transitionnent en douceur sur toutes leurs propriétés, y compris la couleur du texte — plus aucun changement instantané', () => {
  assert.match(premium, /catalog-families button\{[\s\S]*?transition:transform \.25s cubic-bezier\(\.16,1,\.3,1\),border-color \.25s ease,background \.25s ease,color \.25s ease\}/);
  assert.match(premium, /\.refinement-lenses button\{[\s\S]*?transition:border-color \.25s ease,background \.25s ease,color \.25s ease\}/);
});
