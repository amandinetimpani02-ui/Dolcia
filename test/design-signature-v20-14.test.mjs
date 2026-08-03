import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../vision-premium.css',import.meta.url),'utf8');

test('la signature atelier reste présente dans v20.15',()=>{
<<<<<<< HEAD
  assert.match(app,/20\.15\.0-question-decisive/);
=======
  assert.match(app,/21\.40\.1-moteur-comportements/);
>>>>>>> 04f5afeae402fd69b23a6176fa905b97407db1ae
  assert.match(css,/Dolcia v20\.14 — Signature Atelier/);
});

test('la hiérarchie premium repose sur un système de matière cohérent',()=>{
  for(const token of ['--atelier-glass','--atelier-line-gold','--atelier-shadow','--atelier-ease']){
    assert.ok(css.includes(token),`${token} doit rester défini`);
  }
  assert.match(css,/\.moment-truth\{[\s\S]*border-radius:999px/);
  assert.match(css,/\.bottom-nav\{[\s\S]*backdrop-filter:blur\(34px\)/);
});

test('la vérité du moment reste immédiatement actionnable',()=>{
  assert.match(app,/<span>Maintenant<\/span>/);
  assert.match(app,/Dolcia veille · météo, places et offres/);
  assert.match(app,/D compose pour moi/);
});
