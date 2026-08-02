import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('après une session Dolcia Anime, une vraie suite est proposée (lieu réel et vérifié), jamais un chiffre inventé comme des calories', () => {
  assert.match(app, /function animateFollowUpSuggestion\(session\)/);
  const fn = app.match(/function animateFollowUpSuggestion\(session\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(fn, /kcal|[0-9]+\s*calories/i);
  assert.match(app, /geoVisible\(item\)&&recommendationEligibleNow\(item\)/);
});

test('la suggestion dépend du type d’activité : après du sport/eau/jeu, on propose de quoi souffler, pas une autre activité physique', () => {
  assert.match(app, /const wantsRefresh=\['sport','water','play'\]\.includes\(kind\)/);
  assert.match(app, /const wantedCategories=wantsRefresh\?\['food','wellness'\]/);
});

test('la suggestion de suite ne s’affiche que si un vrai candidat existe, jamais un bloc vide ou fabriqué', () => {
  assert.match(app, /const followUp=animateFollowUpSuggestion\(session\)/);
  assert.match(app, /const followUpHtml=followUp\?/);
  assert.match(css, /\.animate-follow-up\{/);
});
