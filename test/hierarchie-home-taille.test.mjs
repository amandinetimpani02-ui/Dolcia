import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

// Décision explicite : hiérarchiser plutôt que cacher. "Prépare mon moment" doit dominer
// visuellement (taille, pas seulement couleur) ; coach/balade/musique restent visibles mais
// nettement plus discrets — jamais masqués derrière un sous-menu, pour ne pas recréer les
// problèmes de découvrabilité déjà corrigés ("D introuvable", "visite guidée cachée").

test('le bouton principal et les trois secondaires sont structurellement séparés dans le HTML, pas dans la même grille à poids égal', () => {
  const start = app.indexOf("function home(){");
  const line = app.slice(start, app.indexOf('loadHomePulse()', start));
  assert.match(line, /<div class="home-paths-secondary">/);
  const primaryIndex = line.indexOf('class="home-path primary"');
  const secondaryIndex = line.indexOf('class="home-paths-secondary"');
  assert.ok(primaryIndex < secondaryIndex, 'le principal doit apparaître avant le groupe secondaire');
});

test('les trois boutons secondaires (coach, balade, musique) restent tous présents et cliquables — jamais masqués', () => {
  const start = app.indexOf("function home(){");
  const line = app.slice(start, app.indexOf('loadHomePulse()', start));
  assert.match(line, /onclick="beginExplore\(\)"/);
  assert.match(line, /onclick="openDolciaAnimate\('coach'\)"/);
  assert.match(line, /onclick="openLocalDiscoveryWithD\(\)"/);
});

test('le bouton principal a une hauteur minimale nettement supérieure aux secondaires, une vraie hiérarchie de taille pas seulement de couleur', () => {
  const primaryMatch = css.match(/\.home-path\.primary\{min-height:(\d+)px/);
  const secondaryMatch = css.match(/\.home-paths-secondary \.home-path\{min-height:(\d+)px/);
  assert.ok(primaryMatch && secondaryMatch);
  const primaryHeight = Number(primaryMatch[1]), secondaryHeight = Number(secondaryMatch[1]);
  assert.ok(primaryHeight > secondaryHeight * 1.8, 'le principal doit être nettement plus grand, pas une simple nuance');
});

test('cette hiérarchie de taille persiste sur mobile, là où le problème avait été identifié (grille à une seule colonne, toutes les cartes à la même hauteur)', () => {
  const mobileBlock = css.slice(css.indexOf('@media(max-width:800px){.home-paths-secondary'));
  assert.match(mobileBlock, /\.home-paths-secondary \.home-path\{min-height:64px\}/);
  assert.doesNotMatch(css, /\.home-path\{min-height:126px\}/, 'l’ancienne règle qui égalisait toutes les hauteurs sur mobile doit avoir disparu');
});

test('aucune règle CSS dupliquée ne subsiste pour .home-path.primary après la restructuration', () => {
  const matches = [...css.matchAll(/\.home-path\.primary\{[^}]*background:/g)];
  assert.equal(matches.length, 1, 'une seule définition de fond doit exister, jamais deux règles concurrentes');
});
