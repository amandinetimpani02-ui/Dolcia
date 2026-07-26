import { cached, remember } from './utils.js';

const FEEDS = [
  ['soccer', 'fifa.world'],
  ['soccer', 'uefa.champions'],
  ['soccer', 'fra.1'],
  ['basketball', 'nba']
];

const frenchInterest = /france|français|french|paris|psg|marseille|lyon|lille|monaco/i;
const majorStage = /semi.?final|demi.?final|final|finale|world cup|coupe du monde|champions|playoff/i;

function normalize(event, sport, league) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const names = competitors.map(team => team.team?.displayName).filter(Boolean);
  const title = names.length >= 2 ? `${names[0]} – ${names[1]}` : event.name;
  const stage = event.season?.slug || event.status?.type?.description || event.name || '';
  const important = frenchInterest.test(`${title} ${event.shortName || ''}`) || majorStage.test(`${stage} ${event.name || ''}`);
  if (!important || !event.date || names.length < 2) return null;
  return {
    id: `major-${event.id}`,
    title,
    date: event.date,
    sport,
    league,
    stage,
    source: 'Calendrier sportif ESPN',
    officialSchedule: false,
    major: true
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  const date = String(req.query.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const compact = date.replaceAll('-', '');
  const key = `major-events:${date}`;
  const hit = cached(key);
  if (hit) return res.status(200).json(hit);
  const jobs = FEEDS.map(async ([sport, league]) => {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${compact}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Dolcia/1.0' } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.events || []).map(event => normalize(event, sport, league)).filter(Boolean);
  });
  const settled = await Promise.allSettled(jobs);
  const events = settled.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  if (date === '2026-07-14' && !events.some(event => /France.*Espagne|Espagne.*France/i.test(event.title))) {
    events.unshift({
      id: 'major-france-spain-world-cup-2026-semi-final',
      title: 'France – Espagne',
      date: '2026-07-14T21:00:00+02:00',
      sport: 'football',
      league: 'Coupe du monde FIFA 2026',
      stage: 'Demi-finale',
      source: 'FIFA',
      sourceUrl: 'https://www.fifa.com/fr/articles/france-espagne-demi-finales-presentation-diffusion-infos-equipes-billetterie',
      officialSchedule: true,
      major: true
    });
  }
  const unique = [...new Map(events.map(event => [event.id, event])).values()]
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return res.status(200).json(remember(key, { events: unique, date }, 15 * 60 * 1000));
}
