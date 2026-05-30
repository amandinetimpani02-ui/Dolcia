export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
 
  const { lat, lng, radius = 5000, type } = req.query;
  if (!lat || !lng || !type) return res.status(400).json({ error: 'Missing params' });
 
  const GK = process.env.GOOGLE_KEY || 'AIzaSyC3wNqEGoGPEFlHMTlF2U_pkVpetjASl3U';
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=fr&key=${GK}`;
 
  try {
    const r = await fetch(url);
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
