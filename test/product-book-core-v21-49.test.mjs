import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../premium.css',import.meta.url),'utf8');

test('le premier filtre propose un agenda visuel arrivée-départ, pas seulement deux champs date',()=>{
  assert.match(app,/function eclatCalendarMarkup\(\)/);
  assert.match(app,/Choisissez votre arrivée puis votre départ/);
  assert.match(app,/pickEclatCalendarDay/);
  assert.match(app,/Arrivée/);
  assert.match(app,/Départ/);
  assert.match(css,/\.eclat-visit-calendar/);
  assert.match(css,/grid-template-columns:repeat\(7,1fr\)/);
});

test('chaque activité présente une durée avec son niveau de confiance',()=>{
  assert.match(app,/function activityDurationPresentation\(item\)/);
  assert.match(app,/confirmé par la source/);
  assert.match(app,/estimation Dolcia/);
  assert.match(app,/durée du programme/);
  assert.match(app,/<b>Durée<\/b>/);
});

test('D discute réellement avant une séance Coach et adapte le lancement',()=>{
  assert.match(app,/function openCoachBrief\(id\)/);
  assert.match(app,/function coachBriefQuestion\(\)/);
  assert.match(app,/Votre énergie, là, maintenant/);
  assert.match(app,/Comment voulez-vous que je vous anime/);
  assert.match(app,/coachProfile/);
  assert.match(css,/\.coach-d-stage \.eclat-d/);
});

test('les séances sportives sont concrètes, structurées et ludiques',()=>{
  assert.match(app,/Cardio Club avec D/);
  assert.match(app,/Circuit Club, manche 1/);
  assert.match(app,/Défi duo/);
  assert.match(app,/Finale sourire/);
  assert.match(app,/Le Challenge Tonique de D/);
  assert.match(app,/Circuit 40\/20/);
});

test('le Coach dispose d’un arrêt explicite en cas de douleur ou malaise',()=>{
  assert.match(app,/Douleur \/ on arrête/);
  assert.match(app,/if\(reaction==='pain'\)/);
  assert.match(app,/demandez une aide médicale/);
  assert.match(app,/session\.status!=='active'/);
});
