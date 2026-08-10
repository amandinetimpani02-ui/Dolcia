import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('le volume par défaut de la musique d’ambiance est de 20%, plus 85%', () => {
  assert.match(app, /function animateThemeVolume\(\)\{return typeof state\.animateThemeVolume==='number'\?state\.animateThemeVolume:\.2\}/);
});

test('l’atténuation ne remonte jamais un volume que la personne a choisi plus bas (Math.min), bug réel corrigé après un test concret', () => {
  assert.match(app, /dolciaTheme\.audio\.volume=Math\.min\(restore,\.04\)/);
});

test('un seul contrôle sonore regroupe hymne, musique et pouls — plus de boutons concurrents séparés dans l’en-tête', () => {
  const header = app.match(/<header class="animate-presence">[\s\S]*?<\/header>/)?.[0] || '';
  assert.match(header, /class="animate-sound-control"/);
  assert.match(header, /class="animate-mute-toggle"/);
  assert.doesNotMatch(header, /Réécouter l.hymne Dolcia/, 'le bouton de rejeu séparé a été retiré, consolidé');
});

test('couper le son coupe aussi le pouls rythmique, mais jamais la voix de D', () => {
  const fn = app.match(/function toggleAnimateMute\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /if\(animatePulse\.active\)stopAnimatePulse\(\)/);
  assert.doesNotMatch(fn, /speechSynthesis|playPremiumVoice/, 'la voix ne doit jamais être affectée par ce contrôle');
});

test('le contrôle sonore reste visible sans défiler (position fixée en haut de la session)', () => {
  assert.match(css, /\.animate-presence\{position:sticky;top:0;z-index:5/);
});

test('plus aucune formulation ne désigne indirectement un gagnant (titre gagnant, meilleure invention, meilleure histoire)', () => {
  assert.doesNotMatch(app, /titre gagnant|meilleure invention|meilleure histoire/i);
});

test('le programme renforcement et le programme famille sont maintenant réécrits avec le ton animateur, pas seulement le programme sport', () => {
  const renfo = app.match(/renforcement:\{title:'Renforcement doux en duo'[\s\S]*?\]\},/)?.[0] || '';
  assert.match(renfo, /On y va doucement/);
  const family = app.match(/family:\{title:'L’aventure des petits explorateurs'[\s\S]*?\]\},/)?.[0] || '';
  assert.match(family, /On part à l’aventure/);
});
