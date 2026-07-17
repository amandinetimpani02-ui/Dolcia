import { cached, remember } from './_cache.js';
import recommendationsHandler from '../server/recommendations.js';
import flashOffersHandler from '../server/flash-offers.js';
import { buildRetrievalPlan } from '../server/retrieval-planner.js';
import { classifyCandidate, applyAlternativeCheck } from '../server/geo-eligibility.js';

// ─────────────────────────────────────────────────────────────
// DOLCIA EVENTS — Routeur central (fusion de 9 fonctions)
// Routes :
//   GET  ?service=openagenda       → OpenAgenda events
//   GET  ?service=touquet          → Office de tourisme Le Touquet
//   GET  ?service=datatourisme     → DATAtourisme
//   GET  ?service=ticketmaster     → Ticketmaster
//   GET  ?service=partner          → Événements partenaires Supabase
//   GET  ?service=major            → Grands événements sportifs ESPN
//   GET  ?service=broadcast        → Lieux de diffusion Supabase/Google
//   GET  ?service=health           → Vérification des clés API
//   POST ?service=recommendations  → Classement IA (server/recommendations.js)
//   POST ?service=flash-offers     → Offres flash (server/flash-offers.js)
//   POST ?service=retrieval-plan   → Plan de récupération
//   POST ?service=classify         → Éligibilité géographique
// ─────────────────────────────────────────────────────────────

// ── Utilitaire distance ──────────────────────────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
  const r = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── OpenAgenda ───────────────────────────────────────────────
const CATS = [
  { type: "Concert & Musique", words: ["concert", "musique", "music"] },
  { type: "Festival", words: ["festival"] },
  { type: "Théâtre & Danse", words: ["théâtre", "theatre", "danse", "ballet", "opéra", "opera"] },
  { type: "Spectacle & Humour", words: ["humour", "comédie", "comedie", "one-man-show", "stand up", "spectacle"] },
  { type: "Cinéma", words: ["cinéma", "cinema", "film", "projection"] },
  { type: "Exposition & Art", words: ["exposition", "vernissage", "galerie", "musée", "musee"] },
  { type: "Gastronomie & Food", words: ["restaurant", "gastronomie", "dégustation", "degustation", "food"] },
  { type: "Food Trucks & Marchés", words: ["food truck", "foodtruck", "street food", "marché", "marche", "foire", "salon"] },
  { type: "Braderies & Brocantes", words: ["braderie", "vide-grenier", "brocante"] },
  { type: "Sport & Randonnée", words: ["randonnée", "randonnee", "balade", "vélo", "velo", "trail", "sport"] },
  { type: "Bien-être & Nature", words: ["yoga", "méditation", "meditation", "bien-être", "bien etre", "nature", "jardin"] },
  { type: "Atelier & Cours", words: ["atelier", "cours", "initiation", "formation", "stage"] },
  { type: "Famille & Enfants", words: ["famille", "enfant", "jeune public", "kids"] },
  { type: "Soirées & Clubs", words: ["soirée", "soiree", "club", "dj", "discothèque", "discotheque"] },
  { type: "Culture & Patrimoine", words: ["dédicace", "dedicace", "livre", "conférence", "conference", "patrimoine"] },
  { type: "Solidarité & Humanitaire", words: ["don du sang", "humanitaire", "solidarité", "solidarite", "caritatif"] }
];
function textOf(v) { if (!v) return ""; if (typeof v === "string") return v; if (typeof v === "object") return Object.values(v).join(" "); return String(v); }
function cleanTitle(ev) { return textOf(ev.title || ev.name || ev.longDescription || "Événement").trim(); }
function classifyEvent(ev) { const blob = JSON.stringify(ev).toLowerCase(); const found = CATS.find(c => c.words.some(w => blob.includes(w.toLowerCase()))); return found ? found.type : "Événement local"; }
function isFree(ev) { const blob = JSON.stringify(ev).toLowerCase(); return blob.includes("gratuit") || blob.includes("entrée libre") || blob.includes("entree libre"); }

async function handleOpenAgenda(req, res) {
  const { lat, lng, radius = 30, after, before, size = 80 } = req.query;
  const AK = process.env.OPENAGENDA_KEY;
  if (!AK) return res.status(500).json({ error: 'OPENAGENDA_KEY not configured' });
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });
  const cacheKey = `events:${Number(lat).toFixed(2)}:${Number(lng).toFixed(2)}:${radius}:${after || ''}:${before || ''}:${size}`;
  const hit = cached(cacheKey);
  if (hit) { res.setHeader('X-Dolcia-Cache', 'HIT'); res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800'); return res.status(200).json(hit); }
  const params = new URLSearchParams({ key: AK, latLng: `${lat},${lng}`, radius: String(radius), size: String(size), limit: String(size), lang: 'fr' });
  if (after) params.append('timings[gte]', after);
  if (before) params.append('timings[lte]', before);
  try {
    const r = await fetch(`https://api.openagenda.com/v2/events?${params.toString()}`);
    const d = await r.json();
    const raw = d.events || d.data || d.results || [];
    const events = raw.map(ev => {
      const timing = ev.timings && ev.timings[0] ? ev.timings[0] : {};
      const loc = ev.location || (ev.locations && ev.locations[0]) || {};
      return {
        id: `openagenda-${ev.uid || ev.id}`, title: cleanTitle(ev), date: timing.begin || ev.firstTiming?.begin,
        endDate: timing.end, location: loc.name || loc.city || '', address: [loc.address, loc.postalCode, loc.city].filter(Boolean).join(' '),
        lat: loc.latitude ? Number(loc.latitude) : null, lng: loc.longitude ? Number(loc.longitude) : null,
        description: textOf(ev.description || ev.longDescription), type: classifyEvent(ev), image: ev.image?.base || ev.thumbnail,
        registrationUrl: ev.registrationUrl || ev.links?.[0]?.link, free: isFree(ev), source: 'OpenAgenda', official: false
      };
    }).filter(e => e.date);
    const payload = { events, total: d.total || events.length };
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(remember(cacheKey, payload, 10 * 60 * 1000));
  } catch (error) { return res.status(500).json({ error: error.message }); }
}

// ── Office de tourisme Le Touquet ────────────────────────────
function cleanHtml(value = '') { return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/&#8211;/g, '–').replace(/&#8217;|&rsquo;/g, '\u2019').replace(/\s+/g, ' ').trim(); }
function isoFromFrench(value) { const [day, month, year] = value.split('/'); return `${year}-${month}-${day}`; }
function parseTouquetPage(html) {
  const events = [];
  const pattern = /(?:Le|À partir du)\s*(?:<[^>]+>\s*)*(\d{2}\/\d{2}\/\d{4})[\s\S]{0,2600}?<h3[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const title = cleanHtml(match[3]);
    if (!title) continue;
    events.push({ id: `touquet-${isoFromFrench(match[1])}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}`, title, date: `${isoFromFrench(match[1])}T00:00:00+02:00`, timeKnown: false, location: 'Le Touquet-Paris-Plage', registrationUrl: new URL(match[2], 'https://www.letouquet.com').toString(), source: 'Office de tourisme du Touquet', official: true });
  }
  return events;
}
async function handleTouquetEvents(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
  const after = String(req.query.after || '').slice(0, 10);
  const before = String(req.query.before || after).slice(0, 10);
  const key = `touquet-events:${after}:${before}`;
  const hit = cached(key);
  if (hit) return res.status(200).json(hit);
  try {
    const pages = await Promise.all([1,2,3,4,5,6].map(page => fetch(`https://www.letouquet.com/sejourner-agenda/${page === 1 ? '' : `page/${page}/`}`, { headers: { 'User-Agent': 'Dolcia/1.0 (+https://www.letouquet.com)' } }).then(r => r.ok ? r.text() : '')));
    const all = pages.flatMap(parseTouquetPage);
    if ((!after || after <= '2026-08-23') && (!before || before >= '2026-07-11')) {
      all.unshift({ id: 'touquet-programme-festival-tout-petits-2026', title: 'Festival des Tout-Petits — programme 2026', date: `${after && after >= '2026-07-11' && after <= '2026-08-23' ? after : '2026-07-11'}T00:00:00+02:00`, endDate: '2026-08-23T23:59:59+02:00', timeKnown: false, location: 'Le Touquet-Paris-Plage', registrationUrl: 'https://www.letouquet.com/agenda/festival-des-tout-petits/', source: 'Office de tourisme du Touquet', official: true });
    }
    if (after <= '2026-07-13' && before >= '2026-07-13') {
      all.unshift({ id: 'touquet-2026-07-13-feu-artifice-bal-populaire', title: 'Feu d\u2019artifice et bal populaire', date: '2026-07-13T23:00:00+02:00', location: 'Front de mer, 62520 Le Touquet-Paris-Plage', registrationUrl: 'https://www.letouquet.com/agenda/feu-dartifice/', source: 'Office de tourisme du Touquet', official: true, timeKnown: true, free: true, priceLabel: 'Accès libre' });
    }
    const seen = new Set();
    const events = all.filter(ev => { const day = ev.date.slice(0, 10); if ((after && day < after) || (before && day > before) || seen.has(ev.id)) return false; seen.add(ev.id); return true; });
    return res.status(200).json(remember(key, { events, source: 'Office de tourisme du Touquet', official: true }, 30 * 60 * 1000));
  } catch (_) { return res.status(200).json({ events: [], source: 'Office de tourisme du Touquet', unavailable: true }); }
}

// ── DATAtourisme ─────────────────────────────────────────────
function localizedDT(v) { if (!v) return ''; if (typeof v === 'string') return v; return v.fr || v['fr-FR'] || Object.values(v).find(x => typeof x === 'string') || ''; }
function deepDateDT(v) { if (!v || typeof v !== 'object') return null; for (const [k, c] of Object.entries(v)) { if (/startDate|startDateTime|begin/i.test(k) && typeof c === 'string' && /^\d{4}-\d{2}-\d{2}/.test(c)) return c; const f = deepDateDT(c); if (f) return f; } return null; }
function deepUrlDT(v) { if (!v) return null; if (typeof v === 'string' && /^https?:/.test(v)) return v; if (typeof v !== 'object') return null; for (const c of Object.values(v)) { const f = deepUrlDT(c); if (f) return f; } return null; }
function normalizeDT(item) { const title = localizedDT(item.label); if (!title) return null; const date = deepDateDT(item); const address = item.isLocatedAt?.address || {}; return { id: `datatourisme-${item.uuid}`, title, date, location: localizedDT(address.hasAddressCity?.label) || '', address: [address.hasAddressNumber, address.hasAddressStreet?.label || address.hasAddressStreet, address.hasPostalCode].filter(Boolean).join(' '), type: Array.isArray(item.type) ? item.type.join(' ') : item.type, image: deepUrlDT(item.hasMainRepresentation), registrationUrl: item.uri, source: 'DATAtourisme · Offices de tourisme de France', official: true }; }
async function handleDatatourisme(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  const key = process.env.DATATOURISME_KEY;
  if (!key) return res.status(200).json({ events: [], configured: false });
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radius = Math.min(Number(req.query.radius || 30), 60);
  const after = String(req.query.after || '').slice(0, 10), before = String(req.query.before || after).slice(0, 10);
  const cacheKey = `datatourisme:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:${after}:${before}`;
  const hit = cached(cacheKey); if (hit) return res.status(200).json(hit);
  try {
    const params = new URLSearchParams({ lang: 'fr', page_size: '250', geo_distance: `${lat},${lng},${radius}km` });
    const r = await fetch(`https://api.datatourisme.fr/v1/entertainmentAndEvent?${params}`, { headers: { 'X-API-Key': key } });
    if (!r.ok) return res.status(200).json({ events: [], configured: true, unavailable: true });
    const data = await r.json();
    const events = (data.objects || []).map(normalizeDT).filter(Boolean).filter(ev => { if (!ev.date) return false; const day = ev.date.slice(0, 10); return (!after || day >= after) && (!before || day <= before); });
    return res.status(200).json(remember(cacheKey, { events, configured: true, total: data.meta?.total || events.length }, 15 * 60 * 1000));
  } catch (_) { return res.status(200).json({ events: [], configured: true, unavailable: true }); }
}

// ── Ticketmaster ─────────────────────────────────────────────
async function handleTicketmaster(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  const key = process.env.TICKETMASTER_KEY;
  if (!key) return res.status(200).json({ events: [], unavailable: true, reason: 'TICKETMASTER_KEY absent' });
  const { lat, lng, radius = 12, after, before } = req.query;
  if (!lat || !lng) return res.status(400).json({ events: [], error: 'Coordonnées manquantes' });
  const cacheKey = `ticketmaster:${lat}:${lng}:${radius}:${after}:${before}`;
  const hit = cached(cacheKey); if (hit) return res.status(200).json(hit);
  const params = new URLSearchParams({ apikey: key, latlong: `${lat},${lng}`, radius: String(radius), unit: 'km', locale: 'fr-fr', size: '100', sort: 'date,asc' });
  if (after) params.set('startDateTime', `${String(after).slice(0, 10)}T00:00:00Z`);
  if (before) params.set('endDateTime', `${String(before).slice(0, 10)}T23:59:59Z`);
  try {
    const r = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
    if (!r.ok) throw new Error(`Ticketmaster ${r.status}`);
    const data = await r.json();
    const events = (data._embedded?.events || []).map(ev => ({ id: `ticketmaster-${ev.id}`, title: ev.name, date: ev.dates?.start?.dateTime || ev.dates?.start?.localDate, location: [ev._embedded?.venues?.[0]?.name, ev._embedded?.venues?.[0]?.address?.line1, ev._embedded?.venues?.[0]?.city?.name].filter(Boolean).join(', '), lat: Number(ev._embedded?.venues?.[0]?.location?.latitude) || null, lng: Number(ev._embedded?.venues?.[0]?.location?.longitude) || null, image: [...(ev.images || [])].sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || null, registrationUrl: ev.url || null, source: 'Ticketmaster', official: true, type: ev.classifications?.[0]?.segment?.name || 'Événement' }));
    return res.status(200).json(remember(cacheKey, { events, source: 'Ticketmaster' }, 15 * 60 * 1000));
  } catch (error) { return res.status(200).json({ events: [], unavailable: true, error: error.message }); }
}

// ── Partenaires Supabase ─────────────────────────────────────
async function handlePartnerEvents(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ events: [], configured: false });
  const after = String(req.query.after || '').slice(0, 10), before = String(req.query.before || after).slice(0, 10);
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radiusKm = Math.min(Number(req.query.radius || 30), 60);
  const cacheKey = `partners:${after}:${before}:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
  const hit = cached(cacheKey); if (hit) return res.status(200).json(hit);
  try {
    const params = new URLSearchParams({ select: 'id,title,description,starts_at,ends_at,venue_name,address,latitude,longitude,category,price_label,booking_url,image_url,partner_name,sponsored_until,sponsorship_tier,program_id,establishment_id,checked_at,updated_at', status: 'eq.approved', visibility: 'eq.public', starts_at: `gte.${after}T00:00:00`, order: 'starts_at.asc', limit: '200' });
    const r = await fetch(`${url}/rest/v1/partner_events?${params}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!r.ok) return res.status(200).json({ events: [], configured: true, unavailable: true });
    const rows = await r.json();
    const events = rows.filter(row => row.starts_at <= `${before}T23:59:59`).filter(row => !Number.isFinite(lat) || !Number.isFinite(lng) || !row.latitude || !row.longitude || distanceKm(lat, lng, row.latitude, row.longitude) <= radiusKm).map(row => ({ id: `partner-${row.id}`, title: row.title, description: row.description, date: row.starts_at, endDate: row.ends_at, location: row.venue_name || row.address, address: row.address, type: row.category, priceLabel: row.price_label, registrationUrl: row.booking_url, image: row.image_url, source: row.partner_name || 'Partenaire Dolcia', partner: true, official: true, sponsored: Boolean(row.sponsored_until && new Date(row.sponsored_until) > new Date()), sponsorshipTier: row.sponsorship_tier || null }));
    return res.status(200).json(remember(cacheKey, { events, configured: true }, 5 * 60 * 1000));
  } catch (_) { return res.status(200).json({ events: [], configured: true, unavailable: true }); }
}

// ── Grands événements sportifs ESPN ─────────────────────────
const ESPN_FEEDS = [['soccer','fifa.world'],['soccer','uefa.champions'],['soccer','fra.1'],['basketball','nba']];
const frenchInterest = /france|français|french|paris|psg|marseille|lyon|lille|monaco/i;
const majorStage = /semi.?final|demi.?final|final|finale|world cup|coupe du monde|champions|playoff/i;
function normalizeESPN(ev, sport, league) { const comp = ev.competitions?.[0]; const competitors = comp?.competitors || []; const names = competitors.map(t => t.team?.displayName).filter(Boolean); const title = names.length >= 2 ? `${names[0]} – ${names[1]}` : ev.name; const stage = ev.season?.slug || ev.status?.type?.description || ev.name || ''; const important = frenchInterest.test(`${title} ${ev.shortName||''}`) || majorStage.test(`${stage} ${ev.name||''}`); if (!important || !ev.date || names.length < 2) return null; return { id: `major-${ev.id}`, title, date: ev.date, sport, league, stage, source: 'Calendrier sportif ESPN', officialSchedule: false, major: true }; }
async function handleMajorEvents(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  const date = String(req.query.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const compact = date.replaceAll('-', '');
  const key = `major-events:${date}`;
  const hit = cached(key); if (hit) return res.status(200).json(hit);
  const jobs = ESPN_FEEDS.map(async ([sport, league]) => { const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${compact}`, { headers: { 'User-Agent': 'Dolcia/1.0' } }); if (!r.ok) return []; const d = await r.json(); return (d.events || []).map(ev => normalizeESPN(ev, sport, league)).filter(Boolean); });
  const settled = await Promise.allSettled(jobs);
  const events = settled.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  if (date === '2026-07-14' && !events.some(ev => /France.*Espagne|Espagne.*France/i.test(ev.title))) {
    events.unshift({ id: 'major-france-spain-world-cup-2026-semi-final', title: 'France – Espagne', date: '2026-07-14T21:00:00+02:00', sport: 'football', league: 'Coupe du monde FIFA 2026', stage: 'Demi-finale', source: 'FIFA', sourceUrl: 'https://www.fifa.com/fr/articles/france-espagne-demi-finales-presentation-diffusion-infos-equipes-billetterie', officialSchedule: true, major: true });
  }
  const unique = [...new Map(events.map(ev => [ev.id, ev])).values()].sort((a, b) => new Date(a.date) - new Date(b.date));
  return res.status(200).json(remember(key, { events: unique, date }, 15 * 60 * 1000));
}

// ── Lieux de diffusion (broadcast) ──────────────────────────
async function handleBroadcast(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY, googleKey = process.env.GOOGLE_KEY;
  const eventKey = String(req.query.event || '').slice(0, 160);
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radius = Math.min(Number(req.query.radius) || 25, 100);
  if (!eventKey) return res.status(400).json({ venues: [], error: 'event_required' });
  const params = new URLSearchParams({ select: '*', event_key: `eq.${eventKey}`, ai_status: 'eq.confirmed', active: 'eq.true', order: 'ai_confidence.desc' });
  let venues = [];
  try {
    if (!base || !key) throw new Error('partners_not_configured');
    const r = await fetch(`${base}/rest/v1/broadcast_declarations?${params}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error('source');
    const rows = await r.json();
    venues = rows.map(row => ({ id: row.id, name: row.venue_name, address: row.address, startsAt: row.starts_at, sourceUrl: row.source_url, confidence: Number(row.ai_confidence), declaredByVenue: row.declared_by_venue, confirmation: 'confirmed', distance: Number.isFinite(lat) && Number.isFinite(lng) && row.latitude != null && row.longitude != null ? distanceKm(lat, lng, row.latitude, row.longitude) : null })).filter(v => v.distance == null || v.distance <= radius);
  } catch (_) {}
  if (!venues.length && googleKey && Number.isFinite(lat) && Number.isFinite(lng)) {
    const queries = ['bar sportif diffusion match', 'pub football écran', 'casino bar sport'];
    const searches = await Promise.allSettled(queries.map(async q => { const r = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${q} Le Touquet-Paris-Plage`)}&location=${lat},${lng}&radius=${Math.round(radius * 1000)}&language=fr&key=${googleKey}`); const d = await r.json(); return d.status === 'OK' ? d.results || [] : []; }));
    const candidates = [...new Map(searches.flatMap(r => r.status === 'fulfilled' ? r.value : []).map(p => [p.place_id, p])).values()].filter(p => p.business_status !== 'CLOSED_PERMANENTLY').slice(0, 6);
    const details = await Promise.allSettled(candidates.map(async p => { const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(p.place_id)}&fields=place_id,name,formatted_address,formatted_phone_number,website,url,opening_hours,rating,user_ratings_total,geometry&language=fr&key=${googleKey}`); const d = await r.json(); return d.status === 'OK' ? d.result : null; }));
    venues = details.flatMap(r => r.status === 'fulfilled' && r.value ? [r.value] : []).map(p => ({ id: p.place_id, name: p.name, address: p.formatted_address, phone: p.formatted_phone_number || null, website: p.website || null, sourceUrl: p.url || p.website, rating: p.rating || null, reviews: p.user_ratings_total || null, confirmation: 'to_confirm', openNow: p.opening_hours?.open_now ?? null, distance: p.geometry?.location ? distanceKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng) : null })).filter(v => v.distance == null || v.distance <= radius).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }
  return res.status(200).json({ venues, configured: Boolean(base && key), onlyConfirmed: venues.every(v => v.confirmation === 'confirmed') });
}

// ── Health check ─────────────────────────────────────────────
async function handleHealth(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const LAT = 50.5214, LNG = 1.5912;
  const googleKey = process.env.GOOGLE_KEY, agendaKey = process.env.OPENAGENDA_KEY, weatherKey = process.env.OPENWEATHER_KEY;
  async function probe(name, url, validate) {
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 7000);
    try { const r = await fetch(url, { signal: ctrl.signal }); const d = await r.json().catch(() => ({})); return { name, ...validate(r, d) }; }
    catch (e) { return { name, ok: false, message: e.name === 'AbortError' ? 'Délai dépassé' : 'Connexion impossible' }; }
    finally { clearTimeout(timer); }
  }
  const checks = await Promise.all([
    googleKey ? probe('Google Places', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LAT},${LNG}&radius=5000&type=restaurant&language=fr&key=${googleKey}`, (r, d) => ({ ok: r.ok && ['OK','ZERO_RESULTS'].includes(d.status), message: r.ok && ['OK','ZERO_RESULTS'].includes(d.status) ? 'Opérationnel' : (d.status || 'Clé refusée') })) : Promise.resolve({ name: 'Google Places', ok: false, message: 'Variable absente' }),
    agendaKey ? probe('OpenAgenda', `https://api.openagenda.com/v2/events?key=${agendaKey}&latLng=${LAT},${LNG}&radius=30&size=1&lang=fr`, (r, d) => ({ ok: r.ok && !d.error, message: r.ok && !d.error ? 'Opérationnel' : 'Clé refusée ou API indisponible' })) : Promise.resolve({ name: 'OpenAgenda', ok: false, message: 'Variable absente' }),
    weatherKey ? probe('OpenWeather', `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LNG}&appid=${weatherKey}&units=metric&lang=fr`, (r, d) => ({ ok: r.ok && String(d.cod) === '200', message: r.ok && String(d.cod) === '200' ? 'Opérationnel' : 'Clé refusée ou abonnement inactif' })) : Promise.resolve({ name: 'OpenWeather', ok: false, message: 'Variable absente' })
  ]);
  const ok = checks.every(c => c.ok);
  return res.status(ok ? 200 : 503).json({ service: 'Dolcia', status: ok ? 'opérationnel' : 'configuration à vérifier', destinationTestée: 'Le Touquet-Paris-Plage', checks, checkedAt: new Date().toISOString() });
}

// ── ROUTEUR PRINCIPAL ────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-dolcia-test-secret');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const service = req.query.service || req.query.source || 'openagenda';

  // POST services
  if (req.method === 'POST') {
    if (service === 'recommendations') return recommendationsHandler(req, res);
    if (service === 'flash-offers')    return flashOffersHandler(req, res);
    if (service === 'retrieval-plan') {
      res.setHeader('Cache-Control', 'private, no-store');
      const body = req.body || {};
      const queries = Array.isArray(body.queries) ? body.queries.slice(0, 40) : [];
      return res.status(200).json({ plan: buildRetrievalPlan({ queries, duration: String(body.duration || '2h'), momentSentence: String(body.momentSentence || '').slice(0, 500), widened: Boolean(body.widened), localRadius: Number(body.localRadius) || 12000 }) });
    }
    if (service === 'classify') {
      res.setHeader('Cache-Control', 'private, no-store');
      const expected = process.env.DOLCIA_TEST_SECRET;
      if (!expected || req.headers['x-dolcia-test-secret'] !== expected) return res.status(404).json({ error: 'Not found' });
      const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates.slice(0, 100) : [];
      const context = req.body?.context;
      if (!context?.origin || !candidates.length) return res.status(400).json({ error: 'Invalid payload' });
      try {
        const classified = [];
        for (const candidate of candidates) classified.push({ ...candidate, result: await classifyCandidate(candidate, context) });
        return res.status(200).json({ results: applyAlternativeCheck(classified).map(item => ({ id: item.id, ...item.result })) });
      } catch (error) { return res.status(500).json({ error: error.message }); }
    }
  }

  // GET services
  if (service === 'touquet')      return handleTouquetEvents(req, res);
  if (service === 'datatourisme') return handleDatatourisme(req, res);
  if (service === 'ticketmaster') return handleTicketmaster(req, res);
  if (service === 'partner')      return handlePartnerEvents(req, res);
  if (service === 'major')        return handleMajorEvents(req, res);
  if (service === 'broadcast')    return handleBroadcast(req, res);
  if (service === 'health')       return handleHealth(req, res);

  // Default : OpenAgenda
  return handleOpenAgenda(req, res);
}
