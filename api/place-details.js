import { cached, remember } from './_cache.js';

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
    const fields = 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,url,opening_hours,editorial_summary,rating,user_ratings_total,photos,types,business_status';
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=fr&key=${key}`);
    const data = await response.json();
    if (data.status !== 'OK' || !data.result?.formatted_address) {
      return res.status(200).json({ verified: false, status: data.status || 'NOT_FOUND' });
    }
    const result = data.result;
    const payload = {
      verified: true,
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number || result.international_phone_number || null,
      website: result.website || null,
      googleUrl: result.url || null,
      rating: result.rating || null,
      reviews: result.user_ratings_total || null,
      businessStatus: result.business_status || null,
      openNow: result.opening_hours?.open_now ?? null,
      hours: result.opening_hours?.weekday_text || [],
      summary: result.editorial_summary?.overview || null,
      photos: (result.photos || []).slice(0, 6).map(photo => `/api/photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=1200`)
    };
    return res.status(200).json(remember(cacheKey, payload, 24 * 60 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ verified: false, status: 'UNAVAILABLE' });
  }
}
