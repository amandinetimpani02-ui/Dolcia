import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync(new URL('../server/major-events.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

assert.match(api,/astronomy-solar-eclipse-2026-08-12/);
assert.match(api,/science\.nasa\.gov\/eclipses\/future-eclipses\/total-solar-eclipse-on-august-12-2026/);
assert.match(api,/timeKnown:\s*false/);
assert.match(api,/Ne jamais observer le Soleil sans protection certifiée adaptée/);
assert.doesNotMatch(api,/France\s*[–-]\s*Espagne/);

assert.match(app,/moment\.broadcastable===true/);
assert.match(app,/moment\.kind==='astronomy'/);
assert.match(app,/L’horaire local précis devra être confirmé/);
assert.match(app,/function astronomyObservationCandidates\(\)/);
assert.match(app,/horizon, météo et accès à confirmer/);
assert.match(app,/Des sites réels proches, jamais une visibilité garantie/);
assert.match(app,/function injectVerifiedSunsetMoment\(\)/);
assert.match(app,/vue sur l’horizon, l’accès et les conditions au moment précis restent à confirmer/);
assert.match(app,/days=30&lat=/);
  assert.match(app,/21\.52\.0-api-results-restored/);

console.log('major moments: ok');
