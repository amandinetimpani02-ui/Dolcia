export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { ref, maxwidth = 600 } = req.query;
  if (!ref) return res.status(400).json({ error: 'Missing ref' });

  const GK = process.env.GOOGLE_KEY;
  if (!GK) return res.status(500).json({ error: 'GOOGLE_KEY not configured' });

  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${ref}&key=${GK}`;

  try {
    const r = await fetch(url);
    const contentType = r.headers.get('content-type') || 'image/jpeg';
    const buffer = await r.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
