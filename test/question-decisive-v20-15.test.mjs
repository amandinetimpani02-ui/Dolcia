import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../vision-premium.css',import.meta.url),'utf8');

test('v20.15 annonce la question décisive',()=>{
<<<<<<< HEAD
  assert.match(app,/20\.15\.0-question-decisive/);
=======
  assert.match(app,/21\.40\.1-moteur-comportements/);
>>>>>>> 04f5afeae402fd69b23a6176fa905b97407db1ae
});

test('D ne pose qu une seule précision par moment',()=>{
  assert.match(app,/some\(id=>id\.startsWith\('precision-'\)\)/);
  assert.match(app,/dCoachDecisiveQuestion\(asked/);
});

test('les quatre informations réellement décisives sont couvertes',()=>{
  for(const id of ['precision-family','precision-stay','precision-time','precision-budget'])assert.match(app,new RegExp(id));
});

test('l heure précise modifie vraiment le début du moment',()=>{
  assert.match(app,/state\.dateStart\.setHours\(hours\[0\],hours\[1\],0,0\)/);
});

test('le repère budgétaire dépend du groupe et de la durée',()=>{
  assert.match(app,/const people=currentGroupSize\(\),days=tripDays\(\),duration=/);
  assert.match(app,/perPerson\*people/);
});

test('l interface explique pourquoi la question est posée',()=>{
  assert.match(app,/Pourquoi D vous le demande/);
  assert.match(css,/\.d-question-impact/);
  assert.match(css,/\.precision-actions/);
});
