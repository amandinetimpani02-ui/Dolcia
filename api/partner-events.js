import { cached, remember } from './utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ events: [], configured: false });

  const after = String(req.query.after || '').slice(0, 10);
  const before = String(req.query.before || after).slice(0, 10);
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Math.min(Number(req.query.radius || 30), 60);
  const cacheKey = `partners:${after}:${before}:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
  const hit = cached(cacheKey);
  if (hit) return res.status(200).json(hit);

  try {
    const params = new URLSearchParams({
      select: 'id,title,description,starts_at,ends_at,venue_name,address,latitude,longitude,category,price_label,booking_url,image_url,partner_name,sponsored_until,sponsorship_tier,program_id,establishment_id,checked_at,updated_at',
      status: 'eq.approved',
      visibility: 'eq.public',
      starts_at: `gte.${after}T00:00:00`,
      order: 'starts_at.asc',
      limit: '200'
    });
    const response = await fetch(`${url}/rest/v1/partner_events?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!response.ok) return res.status(200).json({ events: [], configured: true, unavailable: true });
    const rows = await response.json();
    const end = `${before}T23:59:59`;
    const events = rows
      .filter(row => row.starts_at <= end)
      .filter(row => !Number.isFinite(lat) || !Number.isFinite(lng) || !row.latitude || !row.longitude || distanceKm(lat, lng, row.latitude, row.longitude) <= radiusKm)
      .map(row => ({
        id: `partner-${row.id}`,
        title: row.title,
        description: row.description,
        date: row.starts_at,
        endDate: row.ends_at,
        location: row.venue_name || row.address,
        address: row.address,
        type: row.category,
        priceLabel: row.price_label,
        registrationUrl: row.booking_url,
        image: row.image_url,
        source: row.partner_name || 'Partenaire Dolcia',
        partner: true,
        official: true,
        sponsored: Boolean(row.sponsored_until && new Date(row.sponsored_until) > new Date()),
        sponsorshipTier: row.sponsorship_tier || null,
        programId: row.program_id || null,
        establishmentId: row.establishment_id || null,
        checkedAt: row.checked_at || null,
        updatedAt: row.updated_at || null
      }));
    const payload = { events, configured: true };
    return res.status(200).json(remember(cacheKey, payload, 5 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ events: [], configured: true, unavailable: true });
  }
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const r = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
