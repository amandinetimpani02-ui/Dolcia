import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../vision-premium.css',import.meta.url),'utf8');

test('v20.14 annonce la signature atelier',()=>{
  assert.match(app,/20\.14\.0-signature-atelier/);
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
