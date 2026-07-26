import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
assert.ok(source.includes('Fiche disponible · enrichissement en cours'));
assert.ok(source.includes('La fiche reste consultable')||source.includes('Vous pouvez déjà revenir'));
assert.ok(!source.includes('Cette adresse n’est pas assez documentée'));
assert.ok(!source.includes('VÉRIFICATION IMPOSSIBLE'));
console.log('✓ fiche progressive et non bloquante');

assert.match(source,/detail-sticky-actions/,'la fiche doit toujours afficher une navigation et des actions fixes');
assert.match(source,/detailMapUrl/,'la fiche doit toujours proposer une carte même sans détail externe');
assert.match(source,/AbortController/,'une source externe lente ne doit jamais bloquer la fiche indéfiniment');
assert.match(source,/Garder dans mes envies/,'une proposition non planifiable doit pouvoir être conservée');
