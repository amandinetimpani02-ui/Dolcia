import { cached, remember } from './_cache.js';

function clean(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

function isoFromFrench(value) {
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

function parsePage(html) {
  const events = [];
  const pattern = /(?:Le|À partir du)\s*(?:<[^>]+>\s*)*(\d{2}\/\d{2}\/\d{4})[\s\S]{0,2600}?<h3[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const title = clean(match[3]);
    if (!title) continue;
    events.push({
      id: `touquet-${isoFromFrench(match[1])}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}`,
      title,
      date: `${isoFromFrench(match[1])}T00:00:00+02:00`,
      timeKnown: false,
      location: 'Le Touquet-Paris-Plage',
      registrationUrl: new URL(match[2], 'https://www.letouquet.com').toString(),
      source: 'Office de tourisme du Touquet',
      official: true
    });
  }
  return events;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
  const after = String(req.query.after || '').slice(0, 10);
  const before = String(req.query.before || after).slice(0, 10);
  const key = `touquet-events:${after}:${before}`;
  const hit = cached(key);
  if (hit) return res.status(200).json(hit);

  try {
    const pages = await Promise.all(
      [1, 2, 3, 4, 5, 6].map(page =>
        fetch(`https://www.letouquet.com/sejourner-agenda/${page === 1 ? '' : `page/${page}/`}`, {
          headers: { 'User-Agent': 'Dolcia/1.0 (+https://www.letouquet.com)' }
        }).then(response => response.ok ? response.text() : '')
      )
    );
    const all = pages.flatMap(parsePage);
    if ((!after || after <= '2026-08-23') && (!before || before >= '2026-07-11')) {
      all.unshift({
        id: 'touquet-programme-festival-tout-petits-2026',
        title: 'Festival des Tout-Petits — programme 2026',
        date: `${after && after >= '2026-07-11' && after <= '2026-08-23' ? after : '2026-07-11'}T00:00:00+02:00`,
        endDate: '2026-08-23T23:59:59+02:00',
        timeKnown: false,
        location: 'Le Touquet-Paris-Plage',
        address: '62520 Le Touquet-Paris-Plage',
        registrationUrl: 'https://www.letouquet.com/agenda/festival-des-tout-petits/',
        source: 'Office de tourisme du Touquet',
        official: true,
        type: 'Festival familial · spectacles · ateliers · animations',
        programId: 'festival-tout-petits-2026',
        programTitle: 'Festival des Tout-Petits',
        audience: 'Enfants de 0 à 12 ans et familles',
        description: 'Six semaines de spectacles, ateliers créatifs et animations ludiques. Chaque rendez-vous conserve sa propre date, son horaire et son niveau de vérification.'
      });
    }
    if (after <= '2026-07-13' && before >= '2026-07-13') {
      all.unshift({
        id: 'touquet-2026-07-13-feu-artifice-bal-populaire',
        title: 'Feu d’artifice et bal populaire',
        date: '2026-07-13T23:00:00+02:00',
        location: 'Front de mer, 62520 Le Touquet-Paris-Plage',
        registrationUrl: 'https://www.letouquet.com/agenda/feu-dartifice/',
        source: 'Office de tourisme du Touquet',
        official: true,
        timeKnown: true,
        free: true,
        priceLabel: 'Accès libre'
      });
    }
    const seen = new Set();
    const events = all.filter(event => {
      const day = event.date.slice(0, 10);
      if ((after && day < after) || (before && day > before) || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });
    const payload = { events, source: 'Office de tourisme du Touquet', official: true };
    return res.status(200).json(remember(key, payload, 30 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ events: [], source: 'Office de tourisme du Touquet', unavailable: true });
  }
}
