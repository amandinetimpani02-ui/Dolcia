import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const visionCss = readFileSync(new URL('../vision-premium.css', import.meta.url), 'utf8');
const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('la barre de filtres a une vraie ombre portée qui la fait flotter, pas seulement un flou plat', () => {
  assert.match(visionCss, /box-shadow:inset 0 1px rgba\(255,255,255,\.045\),0 24px 60px -20px rgba\(0,0,0,\.55\)/);
});

test('le reflet net sur le bord supérieur (signature du Liquid Glass iOS 26) existe sur les panneaux de filtre', () => {
  assert.match(visionCss, /\.catalog-toolbar::before,\.filters-panel::before,\.explorer-brief::before\{/);
  assert.match(visionCss, /background:linear-gradient\(90deg,transparent,rgba\(255,255,255,\.5\) 45%/);
});

test('les boutons de filtre ont une vraie interaction tactile (léger retrait au tap), pas un état statique', () => {
  assert.match(premium, /transition:transform \.25s cubic-bezier\(\.16,1,\.3,1\)/);
  assert.match(premium, /\.compact-toolbar \.catalog-families button:active\{transform:scale\(\.94\)\}/);
});
