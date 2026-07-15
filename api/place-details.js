import { cached, remember } from './_cache.js';

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
    const official = OFFICIAL_ENRICHMENTS.find(entry => entry.match.test(result.name || ''));
    const payload = {
      verified: true,
      name: result.name,
      address: result.formatted_address || official?.address,
      phone: result.formatted_phone_number || result.international_phone_number || official?.phone || null,
      website: official?.website || result.website || null,
      booking: official?.booking || null,
      googleUrl: result.url || null,
      rating: result.rating || null,
      reviews: result.user_ratings_total || null,
      businessStatus: result.business_status || null,
      openNow: result.opening_hours?.open_now ?? null,
      hours: result.opening_hours?.weekday_text?.length ? result.opening_hours.weekday_text : (official?.hours || []),
      openingPeriods: result.current_opening_hours?.periods || result.opening_hours?.periods || [],
      utcOffsetMinutes: result.utc_offset_minutes ?? null,
      types: result.types || [],
      summary: result.editorial_summary?.overview || official?.summary || null,
      officialSource: official?.officialSource || null,
      officialCheckedAt: official?.officialCheckedAt || null,
      photos: (result.photos || []).slice(0, 6).map(photo => `/api/photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=1200`)
    };
    return res.status(200).json(remember(cacheKey, payload, 24 * 60 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ verified: false, status: 'UNAVAILABLE' });
  }
}
