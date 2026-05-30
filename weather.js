export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

  const WK = process.env.WEATHER_KEY || 'bd5e378503939ddaee76f12ad7a97608';
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WK}&units=metric&lang=fr`;

  try {
    const r = await fetch(url);
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
