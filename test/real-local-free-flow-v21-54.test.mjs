import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function declaration(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} doit exister`);
  const brace = app.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < app.length; i += 1) {
    if (app[i] === '{') depth += 1;
    if (app[i] === '}') depth -= 1;
    if (depth === 0) return app.slice(start, i + 1);
  }
  throw new Error(`Déclaration incomplète : ${name}`);
}

test('le mode gratuit lance réellement des recherches dédiées aux loisirs publics', () => {
  const source = declaration('queriesForVibes');
  const state = { answers: { budget: 'free', vibes: [], duration: '2h', who: 'couple' }, weather: null };
  const queries = Function('state', `${source}; return queriesForVibes()`)(state);
  assert.ok(queries.some(query => query.includes('plage publique')));
  assert.ok(queries.some(query => query.includes('sentier randonnée')));
  assert.ok(queries.some(query => query.includes('point de vue')));
  assert.ok(queries.some(query => query.includes('braderie')));
});

test('une plage publique réelle est reconnue comme accès libre, un parc d’attractions ne l’est jamais', () => {
  const source = declaration('normalizePlaces');
  const normalize = Function('category', `${source}; return normalizePlaces`)(() => 'outside');
  const [beach, paidPark] = normalize([
    { place_id: 'beach', name: 'Plage du Touquet', types: ['beach'], formatted_address: 'Le Touquet', geometry: { location: { lat: 50.52, lng: 1.59 } } },
    { place_id: 'park', name: 'Parc attractions', types: ['amusement_park', 'park'], formatted_address: 'Merlimont', geometry: { location: { lat: 50.45, lng: 1.61 } } }
  ]);
  assert.equal(beach.freeAccess, true);
  assert.match(beach.freeAccessEvidence, /espace public/i);
  assert.equal(paidPark.freeAccess, false);
});

test('le scénario exact couple + gratuit produit plusieurs expériences locales avec lieu, durée et horaire', () => {
  const source = declaration('injectLocalFreeMoments');
  const anchor = { id: 'g-beach', name: 'Plage du Touquet', freeAccess: true, freeAccessEvidence: 'Espace public documenté', lat: 50.52, lng: 1.59, address: 'Le Touquet', distance: .4, photo: '/beach.jpg', photos: ['/beach.jpg'], geoEligibility: { status: 'core', premium_eligible: true } };
  const state = { answers: { budget: 'free', who: 'couple' }, allItems: [anchor], dateStart: new Date('2026-08-12T14:00:00+02:00'), location: { name: 'Le Touquet-Paris-Plage' } };
  Function('state', 'geoVisible', 'itemImage', `${source}; injectLocalFreeMoments()`)(state, () => true, item => item.photo);
  const moments = state.allItems.filter(item => item.autonomousLocalMoment);
  assert.equal(moments.length, 3);
  assert.deepEqual(moments.map(item => item.durationMinutes), [45, 60, 35]);
  assert.ok(moments.every(item => item.address && item.date && item.price === 0));
  assert.ok(moments.every(item => item.source.includes('Google Places')));
});
