import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('toutes les modales de l’application ont une animation d’ouverture commune (fondu + montée douce), jamais une apparition instantanée', () => {
  assert.match(style, /\.modal\{[\s\S]*?animation:modalBackdropIn \.2s ease\}/);
  assert.match(style, /\.modal>\*\{animation:modalSheetIn \.28s cubic-bezier\(\.16,1,\.3,1\)\}/);
});

test('tous les boutons de l’application ont un retour de pression tactile (léger rétrécissement), une seule règle globale', () => {
  assert.match(style, /^button\{transition:transform \.15s cubic-bezier\(\.16,1,\.3,1\)\}/m);
  assert.match(style, /^button:active\{transform:scale\(\.96\)\}/m);
});

test('les réactions de souvenir, l’échelle de ressenti, les tags et les préférences transitionnent en douceur, plus aucun changement d’état instantané', () => {
  assert.match(premium, /\.memory-reactions button\{[\s\S]*?transition:background \.25s ease,color \.25s ease,border-color \.25s ease\}/);
  assert.match(style, /\.feeling-scale button,\.memory-tags button\{[\s\S]*?transition:background \.25s ease,color \.25s ease,border-color \.25s ease\}/);
  assert.match(style, /\.preference-actions button\{transition:background \.25s ease,color \.25s ease\}/);
  assert.match(style, /\.star-rating button\{[\s\S]*?transition:color \.2s ease\}/);
});

test('les boutons de choix du composer transitionnent aussi la couleur de bordure au survol, pas seulement la position', () => {
  assert.match(premium, /\.dialogue-choices button\{[\s\S]*?transition:border-color \.2s ease,transform \.2s cubic-bezier\(\.16,1,\.3,1\)\}/);
});

test('toutes les nouvelles animations respectent la préférence de mouvement réduit', () => {
  assert.match(style, /@media\(prefers-reduced-motion:reduce\)\{\.modal,\.modal>\*\{animation:none\}\}/);
  assert.match(style, /@media\(prefers-reduced-motion:reduce\)\{button\{transition:none\}button:active\{transform:none\}\}/);
});
