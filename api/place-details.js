import { cached, remember } from './utils.js';

const OFFICIAL_ENRICHMENTS = [
  {
    match: /spa.*(shiseido|westminster)|(shiseido|westminster).*spa/i,
    website: 'https://www.hotelsbarriere.com/fr/le-touquet-paris-plage/le-westminster/experiences/spa',
    booking: 'https://www.hotelsbarriere.com/fr/le-touquet-paris-plage/le-westminster/experiences/spa',
    phone: '03 21 06 70 46',
    address: 'Avenue du Verger, 62520 Le Touquet-Paris-Plage',
    hours: ['Lundi: 09:00–19:00','Mardi: 09:00–19:00','Mercredi: 09:00–19:00','Jeudi: 09:00–19:00','Vendredi: 09:00–19:00','Samedi: 09:00–20:00','Dimanche: 09:00–19:00'],
    summary: 'Le Spa Shiseido du Westminster propose six cabines dont deux doubles, des soins personnalisés, une piscine intérieure chauffée, un sauna et un hammam.',
    officialSource: 'Hôtel Barrière Le Westminster',
    officialCheckedAt: '2026-07-15'
  }
];

function cleanText(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function metaContent(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i')
  ];
  return patterns.map(pattern => html.match(pattern)?.[1]).find(Boolean) || null;
}

function collectJsonLd(value, output = []) {
  if (Array.isArray(value)) value.forEach(item => collectJsonLd(item, output));
  else if (value && typeof value === 'object') {
    if (value['@type']) output.push(value);
    if (value['@graph']) collectJsonLd(value['@graph'], output);
  }
  return output;
}

async function enrichFromOfficialWebsite(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(parsed.href, { signal: controller.signal, headers: { 'User-Agent': 'Dolcia/1.0 (+https://dolcia.vercel.app)' } });
    clearTimeout(timer);
    if (!response.ok || !String(response.headers.get('content-type') || '').includes('text/html')) return null;
    const html = (await response.text()).slice(0, 900000);
    const nodes = [];
    for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { collectJsonLd(JSON.parse(match[1]), nodes); } catch (_) {}
    }
    const entity = nodes.find(node => /LocalBusiness|Hotel|Restaurant|TouristAttraction|SportsActivityLocation|HealthAndBeautyBusiness|Event/i.test(String(node['@type']))) || nodes[0] || {};
    const address = typeof entity.address === 'string' ? entity.address : [entity.address?.streetAddress, entity.address?.postalCode, entity.address?.addressLocality].filter(Boolean).join(', ');
    const images = [entity.image, metaContent(html, 'og:image')].flat().filter(value => typeof value === 'string').slice(0, 4);
    return {
      description: cleanText(entity.description || metaContent(html, 'og:description') || metaContent(html, 'description')) || null,
      phone: entity.telephone || null,
      address: address || null,
      hoursText: entity.openingHours || null,
      images,
      sourceName: cleanText(entity.name || metaContent(html, 'og:site_name') || parsed.hostname.replace(/^www\./, '')),
      sourceUrl: parsed.href
    };
  } catch (_) { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  const placeId = String(req.query.id || '');
  const key = process.env.GOOGLE_KEY;
  if (!placeId || !key) return res.status(400).json({ verified: false });
  const cacheKey = `place-details:${placeId}`;
  const hit = cached(cacheKey);
  if (hit) return res.status(200).json(hit);

  try {
    const fields = 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,url,opening_hours,current_opening_hours,utc_offset_minutes,editorial_summary,rating,user_ratings_total,photos,types,business_status';
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=fr&key=${key}`);
    const data = await response.json();
    if (data.status !== 'OK' || !data.result?.formatted_address) {
      return res.status(200).json({ verified: false, status: data.status || 'NOT_FOUND' });
    }
    const result = data.result;
    const curated = OFFICIAL_ENRICHMENTS.find(entry => entry.match.test(result.name || ''));
    const web = await enrichFromOfficialWebsite(curated?.website || result.website);
    const official = curated || web;
    const payload = {
      verified: true,
      name: result.name,
      address: result.formatted_address || official?.address,
      phone: result.formatted_phone_number || result.international_phone_number || official?.phone || null,
      website: curated?.website || web?.sourceUrl || result.website || null,
      booking: curated?.booking || null,
      googleUrl: result.url || null,
      rating: result.rating || null,
      reviews: result.user_ratings_total || null,
      businessStatus: result.business_status || null,
      openNow: result.opening_hours?.open_now ?? null,
      hours: result.opening_hours?.weekday_text?.length ? result.opening_hours.weekday_text : (curated?.hours || (web?.hoursText ? [web.hoursText].flat() : [])),
      openingPeriods: result.current_opening_hours?.periods || result.opening_hours?.periods || [],
      utcOffsetMinutes: result.utc_offset_minutes ?? null,
      types: result.types || [],
      summary: result.editorial_summary?.overview || curated?.summary || web?.description || null,
      officialSource: curated?.officialSource || web?.sourceName || null,
      officialCheckedAt: curated?.officialCheckedAt || (web ? new Date().toISOString().slice(0, 10) : null),
      fieldConfidence: {
        identity: 'google', address: result.formatted_address ? 'google' : (official?.address ? 'official' : 'missing'),
        phone: (result.formatted_phone_number || result.international_phone_number) ? 'google' : (official?.phone ? 'official' : 'missing'),
        hours: result.opening_hours?.weekday_text?.length ? 'google' : ((curated?.hours || web?.hoursText) ? 'official' : 'missing'),
        description: result.editorial_summary?.overview ? 'google' : ((curated?.summary || web?.description) ? 'official' : 'missing')
      },
      photos: [...(result.photos || []).slice(0, 6).map(photo => `/api/photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=1200`), ...(web?.images || [])].slice(0, 6)
    };
    return res.status(200).json(remember(cacheKey, payload, 24 * 60 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ verified: false, status: 'UNAVAILABLE' });
  }
}
