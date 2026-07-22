import { cached, remember } from './_cache.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing params' });

  const WK = process.env.OPENWEATHER_KEY;
  if (!WK) return res.status(500).json({ error: 'OPENWEATHER_KEY not configured' });

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WK}&units=metric&lang=fr`;
  const cacheKey = `weather:${Number(lat).toFixed(2)}:${Number(lng).toFixed(2)}`;
  const hit = cached(cacheKey);
  if (hit) {
    res.setHeader('X-Dolcia-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(hit);
  }

  try {
    const r = await fetch(url);
    const d = await r.json();
    if (d.cod && String(d.cod) !== '200') return res.status(200).json({ ...d, error: d.message || d.cod });
    res.setHeader('X-Dolcia-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(remember(cacheKey, d, 5 * 60 * 1000));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
