import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../premium.css',import.meta.url),'utf8');

test('les deux parcours partagent les questions mais pas la destination',()=>{
  assert.match(app,/function openEclatDialogue\(voice=false,intent='compose'\)/);
  assert.match(app,/state\.eclatIntent=intent/);
  assert.match(app,/compose\(intent==='explore'\)/);
  assert.match(app,/explorerOnly\?renderResults\(\):renderSurprise\(\)/);
});

test('Mes idées ne montre jamais un catalogue sans contexte',()=>{
  assert.match(app,/state\.momentQualified=localStorage\.getItem\('dolcia_moment_qualified_v1'\)==='1'/);
  assert.match(app,/function beginExplore\(\)\{if\(!state\.momentQualified\)return openEclatDialogue\(false,'explore'\)/);
  assert.match(app,/Des propositions déjà filtrées selon la date, le groupe, l’envie, la durée et le budget/);
});

test('Créer mon moment produit un programme modifiable et adoptable en entier',()=>{
  assert.match(app,/Un programme complet, directement dans votre agenda/);
  assert.match(app,/Ajouter tout à mon agenda/);
  assert.match(app,/Régénérer tout le programme/);
  assert.match(app,/Changer cette activité/);
  assert.match(app,/Préciser cette étape/);
});

test('Anime se présente comme un animateur complet et incarné',()=>{
  assert.match(app,/function upgradeAnimateLauncher\(\)/);
  assert.match(app,/dMascotMark\('large'\)/);
  assert.match(app,/accueille le groupe, explique les règles, forme les équipes, rythme la partie, tient les scores, relance l’énergie et conclut le moment avec vous/);
  assert.match(css,/\.animate-premium-launcher/);
  assert.match(css,/\.animate-premium-launcher header \.d-mascot/);
});
