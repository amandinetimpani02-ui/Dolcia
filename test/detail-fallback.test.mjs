import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
assert.ok(source.includes('Fiche disponible · enrichissement en cours'));
assert.ok(source.includes('La fiche reste consultable'));
assert.ok(!source.includes('Cette adresse n’est pas assez documentée'));
assert.ok(!source.includes('VÉRIFICATION IMPOSSIBLE'));
console.log('✓ fiche progressive et non bloquante');
