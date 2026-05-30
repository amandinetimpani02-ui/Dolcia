export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 30, after, before } = req.query;
  const AK = process.env.OPENAGENDA_KEY || 'ac14a63c81534dada3c30a092daeec1c';

  const params = new URLSearchParams({
    key: AK,
    latLng: `${lat},${lng}`,
    radius: radius,
    limit: 50,
    lang: 'fr'
  });
  if (after) params.append('timings[gte]', after);
  if (before) params.append('timings[lte]', before);

  const url = `https://api.openagenda.com/v2/events?${params.toString()}`;

  try {
    const r = await fetch(url);
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
