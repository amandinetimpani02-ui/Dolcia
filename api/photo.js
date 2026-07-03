export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { ref, maxwidth = 900 } = req.query;
  if (!ref) return res.status(400).json({ error: 'Missing ref' });
  const GK = process.env.GOOGLE_KEY;
  if (!GK) return res.status(500).json({ error: 'GOOGLE_KEY not configured' });
  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${Number(maxwidth)||900}&photo_reference=${encodeURIComponent(ref)}&key=${GK}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: 'Google Photo error', status: r.status });
    const contentType = r.headers.get('content-type') || 'image/jpeg';
    const buffer = await r.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(buffer));
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
