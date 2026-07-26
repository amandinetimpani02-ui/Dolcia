import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const recommendations = readFileSync(new URL('../server/recommendations.js', import.meta.url), 'utf8');

test('un restaurant, un hôtel ou une sortie nocturne ordinaire au-delà de 5km est exclu, même si techniquement proche', () => {
  assert.match(app, /const ABUNDANT_LOCAL_CATEGORIES=\['food','hotel','night'\]/);
  assert.match(app, /function withinAbundantLocalReach\(item\)/);
  assert.match(app, /const cap=widened\?20:5/);
});

test('le vrai critère pour restaurants/sorties est la commune réelle, pas la distance : une commune voisine à 2km reste hors ville', () => {
  assert.match(app, /const STRICT_LOCALITY_CATEGORIES=\['food','night'\]/);
  assert.match(app, /const match=item\.geoEligibility\?\.destinationLocalityMatch/);
  assert.match(app, /if\(match===false\)return false/);
});

test('si la commune ne peut pas être déterminée (adresse ambiguë), un repli raisonnable de 5km s’applique plutôt que d’exclure ou d’accepter à l’aveugle', () => {
  assert.match(app, /if\(match==null&&item\.distance!=null&&item\.distance>5\)return false/);
});

test('destinationLocalityMatch est calculé côté serveur à partir de la vraie commune et transmis jusqu’au client, jamais recalculé ou approximé côté client', () => {
  assert.match(recommendations, /function destinationLocalityMatch\(item, context\)/);
  assert.match(recommendations, /destinationLocalityMatch: matchesLocality/);
  assert.match(recommendations, /destinationLocalityMatch: item\.matchesLocality/);
});

test('une pépite déjà prouvée rare par le moteur géo (status extended) reste une exception légitime', () => {
  assert.match(app, /if\(item\.geoEligibility\?\.status==='extended'\)return true/);
});

test('cette règle ne touche pas les catégories atypiques (aquarium, parc à thème...) qui ont leur propre logique régionale', () => {
  assert.match(app, /if\(!ABUNDANT_LOCAL_CATEGORIES\.includes\(item\.category\)\)return true/);
});

test('geoVisible (utilisé par Explorer et le programme composé) applique la règle en un seul endroit, pas dupliquée', () => {
  const geoVisibleLine = app.match(/function geoVisible\(item\)\{[^\n]*\}/)?.[0] || '';
  assert.match(geoVisibleLine, /withinAbundantLocalReach\(item\)/);
});

test('on ne demande jamais d’élargir si une option locale dans le budget existe déjà — jamais de question inutile', () => {
  assert.match(app, /function localAbundanceBudgetGap\(category\)/);
  assert.match(app, /if\(local\)return false/);
});

test('un restaurant ou une sortie proposé plus loin ressemble à une combine : jamais d’élargissement possible pour food/night, même sur budget, même en forçant le drapeau', () => {
  assert.match(app, /const WIDEN_ELIGIBLE_CATEGORIES=\['hotel'\]/);
  assert.match(app, /if\(!WIDEN_ELIGIBLE_CATEGORIES\.includes\(category\)\)return false/);
  assert.match(app, /WIDEN_ELIGIBLE_CATEGORIES\.includes\(item\.category\)&&Boolean/);
});

test('un hôtel qui manque au budget en ville est une rareté réelle et explicable : lui seul peut être élargi sur demande', () => {
  assert.match(app, /if\(!WIDEN_ELIGIBLE_CATEGORIES\.includes\(category\)\)return false/);
  assert.match(app, /function confirmWidenAbundant\(category\)\{\s*if\(!WIDEN_ELIGIBLE_CATEGORIES\.includes\(category\)\)return/);
});

test('on ne propose d’élargir que si ça servirait réellement à quelque chose (une option plus loin correspond au budget), plafonné à 20km', () => {
  assert.match(app, /item\.distance>5&&item\.distance<=20&&compatible\(item\)/);
});

test('élargir est un choix explicite de la personne (Oui/Non), jamais automatique ni silencieux', () => {
  assert.match(app, /function confirmWidenAbundant\(category\)/);
  assert.match(app, /function declineWidenAbundant\(category\)/);
  assert.match(app, /Oui, élargir/);
  assert.match(app, /Non, je reste à/);
});

test('le message d’élargissement n’est visible dans Explorer que pour la famille hôtel, jamais restaurants ni sorties', () => {
  assert.match(app, /filters\.family==='hotel'\?abundantWidenPrompt\('hotel'\)/);
  assert.match(css, /\.widen-prompt\{/);
});

test('élargir une catégorie ne rend pas silencieusement visible des lieux à 100km : le plafond élargi reste 20km', () => {
  assert.doesNotMatch(app, /cap=widened\?\d{3,}/);
});
