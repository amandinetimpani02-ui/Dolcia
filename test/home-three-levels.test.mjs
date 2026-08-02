import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../home-premium.css', import.meta.url), 'utf8');

test('la phrase varie d’un jour à l’autre, jamais un h1 figé', () => {
  assert.match(app, /function homePhrase\(\)\{/);
  assert.match(app, /const day=Math\.floor\(Date\.now\(\)\/86400000\)/);
  const liveHome = app.match(/function home\(\)\{[\s\S]*?loadHomePulse\(\)\}/)?.[0] || '';
  assert.doesNotMatch(liveHome, /Vos prochaines émotions<br><em>commencent ici\.<\/em>/);
});

test('le Home est une affiche photo plein écran, pas une carte avec bordure et fond dégradé plat', () => {
  assert.match(app, /function homePosterInner\(moment\)\{/);
  assert.match(app, /class="home-poster-image"/);
  assert.doesNotMatch(app, /class="home-major-card"/);
});

test('le bouton d’action est un lien texte minimal avec une flèche, jamais un bouton noir rempli en plus d’un secondaire', () => {
  const poster = app.match(/function homePosterInner\(moment\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(poster, /class="home-poster-cta"/);
  assert.doesNotMatch(poster, /class="primary"/);
  assert.doesNotMatch(poster, /class="secondary"/);
});

test('le Home ne montre jamais un écran vide : sans grand moment détecté, une invitation honnête à être guidé prend le relais, jamais une fausse observation', () => {
  assert.match(app, /const title=moment\?\(moment\.title\|\|moment\.name\):ordinary\?'Votre moment, à construire ensemble\.':'Dites-moi ce qui vous ferait plaisir\.'/);
  assert.match(app, /const cta=moment\?majorMomentAction\(moment\)\.button:'Parler à Dolcia'/);
  const emptyPulseBlock = app.match(/const emptyPulse=\(\)=>`[^`]+`;/s)?.[0] || '';
  assert.match(emptyPulseBlock, /onclick="openEclatDialogue\(\)"/);
  assert.doesNotMatch(emptyPulseBlock, /startCompose\(\)/);
});

test('la même affiche se met à jour en place (photo, titre, action) une fois les vraies données chargées, sans reconstruire un composant séparé', () => {
  assert.match(app, /function renderHomeMajor\(moment\)\{const target=document\.querySelector\('#homePoster'\);if\(!target\)return;target\.innerHTML=homePosterInner\(moment\)\}/);
});

test('la recherche, les suggestions et les événements du jour restent après l’affiche, jamais dans le premier écran', () => {
  assert.match(app, /<section class="home-level3">/);
  assert.match(app, /class="home-quick-prompts"/);
});

test('le style de l’affiche existe (photo plein cadre, texte flottant, aucun cadre), avec un indice de défilement respectueux du mouvement réduit', () => {
  assert.match(css, /\.home-poster\{/);
  assert.match(css, /\.home-poster-image\{/);
  assert.match(css, /\.home-poster-cta\{/);
  assert.match(css, /\.home-scroll-hint\{/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.home-scroll-hint span::before\{animation:none!important\}\}/);
});

test('la proposition a une vraie photo en fond (jamais un dégradé plat), comme Explorer et Airbnb', () => {
  assert.match(app, /const photo=moment\?itemImage\(moment\):IMAGES\.hero/);
  assert.match(app, /background-image:linear-gradient\(190deg,rgba\(5,6,6,\.15\)/);
});
