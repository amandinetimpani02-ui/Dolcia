import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('Dolcia Anime a une ambiance visuelle différente selon le type d’activité (aquagym ≠ atelier calme), pas un seul décor unique', () => {
  assert.match(app, /function animateEnergyTheme\(session\)/);
  assert.match(app, /kind==='water'.*id:'water'/);
  assert.match(app, /kind==='sport'\|\|kind==='play'.*id:'sport'/);
  assert.match(css, /\.theme-water \.animate-energy-scene/);
  assert.match(css, /\.theme-sport \.animate-energy-scene/);
  assert.match(css, /\.theme-party \.animate-energy-scene/);
});

test('le "pouls" sonore est un signal rythmique synthétisé honnête, jamais présenté comme une vraie musique produite', () => {
  assert.match(app, /function toggleAnimatePulse\(bpm\)/);
  assert.match(app, /title="Pouls sonore rythmé, pas une musique"/);
  assert.match(app, /AudioContext\|\|window\.webkitAudioContext/);
});

test('le pouls sonore ne démarre jamais seul : uniquement sur un geste explicite (bouton), jamais au chargement de la session', () => {
  assert.doesNotMatch(app, /renderDolciaAnimateLive[\s\S]{0,400}toggleAnimatePulse\(/);
  assert.match(app, /onclick="toggleAnimatePulse\(\$\{energyTheme\.bpm\}\)"/);
});

test('le pouls sonore s’arrête proprement à la pause et à la fin de session, jamais laissé tourner dans le vide', () => {
  assert.match(app, /function pauseDolciaAnimate\(\)\{stopDolciaTheme\(\);stopLiveConversation\(\);stopAnimatePulse\(\)/);
  assert.match(app, /function finishDolciaAnimate\(\)\{[\s\S]{0,80}stopAnimatePulse\(\)/);
});

test('le bouton Pouls reflète l’état réel du son au ré-affichage (changement d’étape), pas toujours "inactif" par défaut', () => {
  assert.match(app, /class="animate-pulse-toggle \$\{animatePulse\.active\?'active':''\}"/);
  assert.match(app, /aria-pressed="\$\{animatePulse\.active\}"/);
});

test('la scène d’ambiance respecte le mouvement réduit', () => {
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.animate-energy-scene span\{animation:none!important\}\}/);
});
