import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('le panneau de partage (image + texte + bouton) passe en colonne sur mobile, pas coincé sur une seule ligne', () => {
  assert.match(premium, /@media\(max-width:620px\)\{\.animate-share-panel\{flex-direction:column/);
  assert.match(premium, /\.share-contact-row\{flex-direction:column\}/);
  assert.match(premium, /\.share-contact-row button\{width:100%\}/);
});

test('la barre d’équipes reste lisible sur mobile (passage à la ligne autorisé), pas de débordement forcé', () => {
  assert.match(premium, /\.animate-teams\{flex-wrap:wrap;justify-content:center\}/);
});
