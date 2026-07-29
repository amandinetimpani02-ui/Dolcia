import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync(new URL('../api/major-events.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

assert.match(api,/astronomy-solar-eclipse-2026-08-12/);
assert.match(api,/science\.nasa\.gov\/eclipses\/future-eclipses\/total-solar-eclipse-on-august-12-2026/);
assert.match(api,/timeKnown:\s*false/);
assert.match(api,/Ne jamais observer le Soleil sans protection certifiée adaptée/);
assert.doesNotMatch(api,/France\s*[–-]\s*Espagne/);

assert.match(app,/moment\.broadcastable===true/);
assert.match(app,/moment\.kind==='astronomy'/);
assert.match(app,/L’horaire local précis devra être confirmé/);
assert.match(app,/days=30&lat=/);
  assert.match(app,/20\.15\.0-question-decisive/);

console.log('major moments: ok');
