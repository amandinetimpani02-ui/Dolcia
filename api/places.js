export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 5000, type, keyword, mode } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

  const GK = process.env.GOOGLE_KEY;
  if (!GK) return res.status(500).json({ error: 'GOOGLE_KEY not configured' });

  const BASE = 'https://maps.googleapis.com/maps/api/place';
  const LOC = `${lat},${lng}`;

  try {
    // ── MODE TEXTSEARCH (keyword libre) ──────────────────────────
    if (mode === 'text' && keyword) {
      const url = `${BASE}/textsearch/json?query=${encodeURIComponent(keyword)}&location=${LOC}&radius=${radius}&language=fr&key=${GK}`;
      const r = await fetch(url);
      const d = await r.json();
      return res.status(200).json(d);
    }

    // ── MODE NEARBYSEARCH AVEC KEYWORD optionnel ──────────────────
    if (type) {
      let url = `${BASE}/nearbysearch/json?location=${LOC}&radius=${radius}&type=${type}&language=fr&key=${GK}`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      const r = await fetch(url);
      const d = await r.json();
      return res.status(200).json(d);
    }

    return res.status(400).json({ error: 'Missing type or keyword' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
