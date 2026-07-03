export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 5000, type, keyword, mode } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

  const GK = process.env.GOOGLE_KEY;
  if (!GK) return res.status(500).json({ error: 'GOOGLE_KEY not configured' });

  const safeRadius = Math.min(Math.max(Number(radius) || 5000, 500), 50000);
  const BASE = 'https://maps.googleapis.com/maps/api/place';
  const LOC = `${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;

  try {
    let url;
    if (mode === 'text' && keyword) {
      url = `${BASE}/textsearch/json?query=${encodeURIComponent(keyword)}&location=${LOC}&radius=${safeRadius}&language=fr&key=${GK}`;
    } else if (type) {
      url = `${BASE}/nearbysearch/json?location=${LOC}&radius=${safeRadius}&type=${encodeURIComponent(type)}&language=fr&key=${GK}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    } else {
      return res.status(400).json({ error: 'Missing type or keyword' });
    }

    const r = await fetch(url);
    const d = await r.json();
    if (d.status && !['OK', 'ZERO_RESULTS'].includes(d.status)) {
      return res.status(502).json({ error: 'Google Places error', status: d.status, message: d.error_message || null });
    }
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
