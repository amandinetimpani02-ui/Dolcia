import { cached, remember } from './_cache.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 12000, type, keyword, mode } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

  const GK = process.env.GOOGLE_KEY;
  if (!GK) return res.status(500).json({ error: 'GOOGLE_KEY not configured' });

  const BASE = 'https://maps.googleapis.com/maps/api/place';
  const LOC = `${lat},${lng}`;
  const cacheKey = `places:${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}:${radius}:${type || ''}:${keyword || ''}:${mode || ''}`;
  const hit = cached(cacheKey);
  if (hit) {
    res.setHeader('X-Dolcia-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(hit);
  }

  try {
    let url;
    if (mode === 'text' && keyword) {
      url = `${BASE}/textsearch/json?query=${encodeURIComponent(keyword)}&location=${LOC}&radius=${radius}&language=fr&key=${GK}`;
    } else if (type) {
      url = `${BASE}/nearbysearch/json?location=${LOC}&radius=${radius}&type=${encodeURIComponent(type)}&language=fr&key=${GK}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    } else {
      return res.status(400).json({ error: 'Missing type or keyword' });
    }

    const r = await fetch(url);
    const d = await r.json();
    if (d.status && d.status !== 'OK' && d.status !== 'ZERO_RESULTS') {
      return res.status(200).json({ ...d, error: d.error_message || d.status });
    }
    res.setHeader('X-Dolcia-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(remember(cacheKey, d, 10 * 60 * 1000));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
