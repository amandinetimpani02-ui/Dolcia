import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('Dolcia Anime est une expérience autonome explicitement identifiée', () => {
  assert.match(app, /Programme autonome Dolcia/);
  assert.match(app, /aucun lieu, événement ou professionnel inventé/);
  assert.match(app, /function openDolciaAnimate/);
  assert.match(app, /function startDolciaAnimate/);
});

test('le démarrage exige une confirmation de sécurité', () => {
  assert.match(app, /ensureAnimateSafety/);
  assert.match(app, /On a choisi un endroit sûr, tout le monde est prêt\./);
  assert.match(app, /surveillance adulte active, constante et à portée de bras/);
});

test('le mode 0 euro ne transforme pas un prix absent en gratuit', () => {
  assert.match(app, /Aucune offre gratuite vérifiée/);
  assert.match(app, /ne transformera jamais un tarif inconnu en gratuit/);
  assert.match(app, /free:true,price:0/);
});

test('l’expérience Dolcia Anime possède une interface premium responsive', () => {
  assert.match(css, /\.dolcia-animate/);
  assert.match(css, /\.animate-live/);
  assert.match(css, /#animatePreview/);
});

test('les services prévoient animation humaine et navette sans faux prestataire', () => {
  assert.match(app, /Animateur & coach/);
  assert.match(app, /Chauffeur & navette/);
  assert.match(app, /Aucun prestataire fictif ne sera proposé/);
});
