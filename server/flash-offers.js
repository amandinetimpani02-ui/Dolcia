export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'private, max-age=30');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ offers: [], configured: false });
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Math.min(Number(req.query.radius || 15), 60);
  const now = new Date().toISOString();
  try {
    const params = new URLSearchParams({
      select: 'id,title,activity_type,starts_at,expires_at,original_price,dolcia_price,quantity_remaining,latitude,longitude,booking_url,reason,status',
      status: 'eq.live', expires_at: `gt.${now}`, quantity_remaining: 'gt.0', order: 'expires_at.asc', limit: '50'
    });
    const response = await fetch(`${url}/rest/v1/flash_offers?${params}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!response.ok) return res.status(200).json({ offers: [], configured: true, unavailable: true });
    const rows = await response.json();
    const offers = rows.filter(row => row.dolcia_price < row.original_price)
      .map(row => ({ ...row, distance: distanceKm(lat, lng, row.latitude, row.longitude) }))
      .filter(row => !Number.isFinite(row.distance) || row.distance <= radiusKm)
      .map(row => ({ ...row, savingPercent: Math.round((1 - row.dolcia_price / row.original_price) * 100), verified: true }));
    return res.status(200).json({ offers, configured: true });
  } catch (_error) {
    return res.status(200).json({ offers: [], configured: true, unavailable: true });
  }
}

function distanceKm(lat1, lng1, lat2, lng2) {
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const r = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return r*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

