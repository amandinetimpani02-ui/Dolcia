import { classifyCandidate, applyAlternativeCheck } from '../server/geo-eligibility.js';
import { buildRetrievalPlan } from '../server/retrieval-planner.js';

const store = globalThis.__dolciaCache || new Map();
globalThis.__dolciaCache = store;

export function cached(key) {
  const hit = store.get(key);
  if (!hit || hit.expires < Date.now()) {
    if (hit) store.delete(key);
    return null;
  }
  return hit.value;
}

export function remember(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  if (store.size > 400) store.delete(store.keys().next().value);
  return value;
}

const distanceKm = (aLat, aLng, bLat, bLng) => {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

async function health(req, res) {
  const probes = [
    ['Google Places', process.env.GOOGLE_KEY, `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=50.5214,1.5912&radius=5000&type=restaurant&language=fr&key=${process.env.GOOGLE_KEY || ''}`, data => ['OK', 'ZERO_RESULTS'].includes(data.status)],
    ['OpenAgenda', process.env.OPENAGENDA_KEY, `https://api.openagenda.com/v2/events?key=${process.env.OPENAGENDA_KEY || ''}&latLng=50.5214,1.5912&radius=30&size=1&lang=fr`, data => !data.error],
    ['OpenWeather', process.env.OPENWEATHER_KEY, `https://api.openweathermap.org/data/2.5/weather?lat=50.5214&lon=1.5912&appid=${process.env.OPENWEATHER_KEY || ''}&units=metric&lang=fr`, data => String(data.cod) === '200']
  ];
  const checks = await Promise.all(probes.map(async ([name, key, url, validate]) => {
    if (!key) return { name, ok: false, message: 'Variable absente' };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
      const data = await response.json().catch(() => ({}));
      const ok = response.ok && validate(data);
      return { name, ok, message: ok ? 'Opérationnel' : 'Clé refusée ou API indisponible' };
    } catch (_error) { return { name, ok: false, message: 'Connexion impossible' }; }
  }));
  const ok = checks.every(check => check.ok);
  return res.status(ok ? 200 : 503).json({ service: 'Dolcia', status: ok ? 'opérationnel' : 'configuration à vérifier', destinationTestée: 'Le Touquet-Paris-Plage', checks, checkedAt: new Date().toISOString() });
}

async function eligibility(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const expected = process.env.DOLCIA_TEST_SECRET;
  if (!expected || req.headers['x-dolcia-test-secret'] !== expected) return res.status(404).json({ error: 'Not found' });
  const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates.slice(0, 100) : [];
  const context = req.body?.context;
  if (!context?.origin || !candidates.length) return res.status(400).json({ error: 'Invalid payload' });
  const classified = [];
  for (const candidate of candidates) classified.push({ ...candidate, result: await classifyCandidate(candidate, context) });
  return res.status(200).json({ results: applyAlternativeCheck(classified).map(item => ({ id: item.id, ...item.result })) });
}

function retrievalPlan(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const body = req.body || {};
  const queries = Array.isArray(body.queries) ? body.queries.slice(0, 40) : [];
  return res.status(200).json({ plan: buildRetrievalPlan({ queries, duration: String(body.duration || '2h'), momentSentence: String(body.momentSentence || '').slice(0, 500), widened: Boolean(body.widened), localRadius: Number(body.localRadius) || 12000 }) });
}

async function broadcastVenues(req, res) {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY, googleKey = process.env.GOOGLE_KEY;
  const eventKey = String(req.query.event || '').slice(0, 160);
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radius = Math.min(Number(req.query.radius) || 25, 100);
  if (!eventKey) return res.status(400).json({ venues: [], error: 'event_required' });
  let venues = [];
  try {
    if (!base || !key) throw new Error('partners_not_configured');
    const params = new URLSearchParams({ select: '*', event_key: `eq.${eventKey}`, ai_status: 'eq.confirmed', active: 'eq.true', order: 'ai_confidence.desc' });
    const response = await fetch(`${base}/rest/v1/broadcast_declarations?${params}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!response.ok) throw new Error('source');
    const rows = await response.json();
    venues = rows.map(row => ({ id: row.id, name: row.venue_name, address: row.address, startsAt: row.starts_at, sourceUrl: row.source_url, confidence: Number(row.ai_confidence), declaredByVenue: row.declared_by_venue, confirmation: 'confirmed', distance: Number.isFinite(lat) && Number.isFinite(lng) && row.latitude != null && row.longitude != null ? distanceKm(lat, lng, row.latitude, row.longitude) : null })).filter(venue => venue.distance == null || venue.distance <= radius);
  } catch (_error) { /* Les candidats Google restent à confirmer. */ }
  if (!venues.length && googleKey && Number.isFinite(lat) && Number.isFinite(lng)) {
    const searches = await Promise.allSettled(['bar sportif diffusion match', 'pub football écran', 'casino bar sport'].map(async query => {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query} Le Touquet-Paris-Plage`)}&location=${lat},${lng}&radius=${Math.round(radius * 1000)}&language=fr&key=${googleKey}`);
      const data = await response.json(); return data.status === 'OK' ? data.results || [] : [];
    }));
    const candidates = [...new Map(searches.flatMap(result => result.status === 'fulfilled' ? result.value : []).map(place => [place.place_id, place])).values()].filter(place => place.business_status !== 'CLOSED_PERMANENTLY').slice(0, 6);
    const details = await Promise.allSettled(candidates.map(async place => {
      const fields = 'place_id,name,formatted_address,formatted_phone_number,website,url,opening_hours,rating,user_ratings_total,geometry';
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place.place_id)}&fields=${fields}&language=fr&key=${googleKey}`);
      const data = await response.json(); return data.status === 'OK' ? data.result : null;
    }));
    venues = details.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : []).map(place => ({ id: place.place_id, name: place.name, address: place.formatted_address, phone: place.formatted_phone_number || null, website: place.website || null, sourceUrl: place.url || place.website, rating: place.rating || null, reviews: place.user_ratings_total || null, confirmation: 'to_confirm', openNow: place.opening_hours?.open_now ?? null, distance: place.geometry?.location ? distanceKm(lat, lng, place.geometry.location.lat, place.geometry.location.lng) : null })).filter(venue => venue.distance == null || venue.distance <= radius).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }
  return res.status(200).json({ venues, configured: Boolean(base && key), onlyConfirmed: venues.length > 0 && venues.every(venue => venue.confirmation === 'confirmed') });
}

export default async function handler(req, res) {
  const action = String(req.query.action || 'health');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', action === 'broadcast-venues' ? 'public, s-maxage=300, stale-while-revalidate=900' : 'private, no-store');
  try {
    if (action === 'health') return health(req, res);
    if (action === 'classify-eligibility') return eligibility(req, res);
    if (action === 'retrieval-plan') return retrievalPlan(req, res);
    if (action === 'broadcast-venues') return broadcastVenues(req, res);
    return res.status(404).json({ error: 'unknown_action' });
  } catch (error) { return res.status(500).json({ error: error.message || 'internal_error' }); }
}
