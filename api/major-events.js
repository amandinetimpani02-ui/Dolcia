import { cached, remember } from './utils.js';

const FEEDS = [
  ['soccer', 'fifa.world'],
  ['soccer', 'uefa.champions'],
  ['soccer', 'fra.1'],
  ['basketball', 'nba']
];

const frenchInterest = /france|français|french|paris|psg|marseille|lyon|lille|monaco/i;
const majorStage = /semi.?final|demi.?final|final|finale|world cup|coupe du monde|champions|playoff/i;

// Secours éditorial minimal, daté et sourcé. Les rendez-vous ordinaires restent issus
// des flux officiels. Supabase peut enrichir cette liste via la table major_moments.
const VERIFIED_GLOBAL_MOMENTS = [
  {
    id: 'astronomy-solar-eclipse-2026-08-12',
    title: 'Éclipse solaire du 12 août 2026',
    date: '2026-08-12T00:00:00+02:00',
    endDate: '2026-08-12T23:59:59+02:00',
    kind: 'astronomy',
    stage: 'Phénomène astronomique exceptionnel',
    source: 'NASA Science',
    sourceUrl: 'https://science.nasa.gov/eclipses/future-eclipses/total-solar-eclipse-on-august-12-2026/',
    verifiedAt: '2026-07-28',
    timeKnown: false,
    visibility: 'Partielle en France métropolitaine ; totalité notamment en Espagne',
    visibilityBounds: { minLat: 35, maxLat: 61, minLng: -12, maxLng: 16 },
    safety: 'Ne jamais observer le Soleil sans protection certifiée adaptée.',
    major: true,
    broadcastable: false,
    score: 110
  }
];

function normalizeSport(event, sport, league) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const names = competitors.map(team => team.team?.displayName).filter(Boolean);
  const title = names.length >= 2 ? `${names[0]} – ${names[1]}` : event.name;
  const stage = event.season?.slug || event.status?.type?.description || event.name || '';
  const important = frenchInterest.test(`${title} ${event.shortName || ''}`) || majorStage.test(`${stage} ${event.name || ''}`);
  if (!important || !event.date || names.length < 2) return null;
  return {
    id: `major-${event.id}`, title, date: event.date, kind: 'sport', sport, league, stage,
    source: 'Calendrier sportif ESPN', officialSchedule: false, timeKnown: true,
    broadcastable: true, major: true, score: 100
  };
}

function visibleNear(moment, lat, lng) {
  const bounds = moment.visibilityBounds;
  if (!bounds || !Number.isFinite(lat) || !Number.isFinite(lng)) return true;
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

async function loadEditorialMoments(from, to, lat, lng) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return [];
  const params = new URLSearchParams({
    select: '*', active: 'eq.true', starts_at: `gte.${from}T00:00:00`,
    order: 'starts_at.asc', limit: '50'
  });
  try {
    const response = await fetch(`${base}/rest/v1/major_moments?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!response.ok) return [];
    const rows = await response.json();
    return rows
      .filter(row => String(row.starts_at || '').slice(0, 10) <= to)
      .filter(row => row.visibility_bounds ? visibleNear({ visibilityBounds: row.visibility_bounds }, lat, lng) : true)
      .map(row => ({
        id: `editorial-${row.id}`, title: row.title, date: row.starts_at, endDate: row.ends_at || null,
        kind: row.kind || 'major_event', stage: row.subtitle || 'Grand moment vérifié',
        source: row.source_name, sourceUrl: row.source_url, verifiedAt: row.verified_at,
        timeKnown: row.time_known !== false, visibility: row.visibility_label || '',
        safety: row.safety_note || '', broadcastable: row.broadcastable === true,
        officialSchedule: row.official_schedule === true, major: true, score: Number(row.score) || 105
      }));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  const date = String(req.query.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const days = Math.max(0, Math.min(45, Number(req.query.days) || 0));
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const toDate = new Date(`${date}T12:00:00Z`);
  toDate.setUTCDate(toDate.getUTCDate() + days);
  const to = toDate.toISOString().slice(0, 10);
  const compact = date.replaceAll('-', '');
  const cacheKey = `major-events:${date}:${to}:${Number.isFinite(lat) ? lat.toFixed(2) : ''}:${Number.isFinite(lng) ? lng.toFixed(2) : ''}`;
  const hit = cached(cacheKey);
  if (hit) return res.status(200).json(hit);

  const jobs = FEEDS.map(async ([sport, league]) => {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${compact}`, {
      headers: { 'User-Agent': 'Dolcia/1.0' }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.events || []).map(event => normalizeSport(event, sport, league)).filter(Boolean);
  });
  const settled = await Promise.allSettled(jobs);
  const sports = settled.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  const globalMoments = VERIFIED_GLOBAL_MOMENTS.filter(moment => {
    const day = moment.date.slice(0, 10);
    return day >= date && day <= to && visibleNear(moment, lat, lng);
  });
  const editorial = await loadEditorialMoments(date, to, lat, lng);
  const unique = [...new Map([...sports, ...globalMoments, ...editorial].map(event => [event.id, event])).values()]
    .sort((a, b) => (b.score || 0) - (a.score || 0) || new Date(a.date) - new Date(b.date));
  return res.status(200).json(remember(cacheKey, { events: unique, date, through: to }, 15 * 60 * 1000));
}
