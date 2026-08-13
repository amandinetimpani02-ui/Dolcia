import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Signalé directement : "ça n'a rien à voir avec un vrai animateur sympa et humain avec qui on
// peut discuter." Vérifié précisément dans le code : cliquer une réaction ("On a ri", "Plus
// calme"...) ne faisait que changer l'expression visuelle de D et incrémenter des compteurs
// internes — aucune réponse, aucun mot, jamais. Un bouton qui ne répond pas n'est pas une
// discussion.

test('les cinq réactions (great, laugh, calmer, livelier, skip) ont chacune leurs propres variantes de réponse dans le moteur de comportements', () => {
  for (const reaction of ['great', 'laugh', 'calmer', 'livelier', 'skip']) {
    assert.match(app, new RegExp(`reagir_${reaction}:\\[`));
  }
});

test('reactDolciaAnimate fait désormais réellement parler D après chaque réaction, pas seulement changer son expression en silence', () => {
  const start = app.indexOf('function reactDolciaAnimate(reaction){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /const behaviorKey=`reagir_\$\{reaction\}`;/);
  assert.match(fn, /session\.messages\.push\(\{role:'assistant',content:line\}\);/);
  assert.match(fn, /playPremiumVoice\(line\);/);
});

test('aucune des nouvelles réponses ne vouvoie — cohérent avec la règle tu/vous déjà établie pour Dolcia Anime', () => {
  const start = app.indexOf('reagir_great:[');
  const end = app.indexOf('\n};', start);
  const section = app.slice(start, end);
  assert.doesNotMatch(section, /\bvous\b/i, 'Anime tutoie toujours, jamais de vouvoiement');
});

test('le cas de sécurité (douleur) reste géré séparément, avant ce nouveau mécanisme, et continue de mettre la session en pause', () => {
  const start = app.indexOf('function reactDolciaAnimate(reaction){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  const painIndex = fn.indexOf("reaction==='pain'");
  const behaviorIndex = fn.indexOf('behaviorKey');
  assert.ok(painIndex > -1 && painIndex < behaviorIndex, 'le cas douleur doit rester traité avant, avec son propre message de sécurité');
});

test('aucune double lecture vocale : renderDolciaAnimateLive est appelé avec speak:false puisque playPremiumVoice parle déjà la nouvelle ligne', () => {
  const start = app.indexOf('function reactDolciaAnimate(reaction){');
  const next = app.indexOf('\nfunction ', start + 1);
  const fn = app.slice(start, next);
  assert.match(fn, /renderDolciaAnimateLive\(\{speak:false\}\)/);
});
