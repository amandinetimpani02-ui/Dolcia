function distanceKm(aLat, aLng, bLat, bLng) {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const googleKey = process.env.GOOGLE_KEY;
  const eventKey = String(req.query.event || '').slice(0, 160);
  const lat = Number(req.query.lat), lng = Number(req.query.lng), radius = Math.min(Number(req.query.radius) || 25, 100);
  if (!eventKey) return res.status(400).json({ venues: [], error: 'event_required' });
  const params = new URLSearchParams({
    select: '*',
    event_key: `eq.${eventKey}`,
    ai_status: 'eq.confirmed',
    active: 'eq.true',
    order: 'ai_confidence.desc'
  });
  let venues = [];
  try {
    if (!base || !key) throw new Error('partners_not_configured');
    const response = await fetch(`${base}/rest/v1/broadcast_declarations?${params}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!response.ok) throw new Error('source');
    const rows = await response.json();
    venues = rows.map(row => ({
      id: row.id, name: row.venue_name, address: row.address, startsAt: row.starts_at,
      sourceUrl: row.source_url, confidence: Number(row.ai_confidence), declaredByVenue: row.declared_by_venue,
      confirmation: 'confirmed',
      distance: Number.isFinite(lat) && Number.isFinite(lng) && row.latitude != null && row.longitude != null
        ? distanceKm(lat, lng, row.latitude, row.longitude) : null
    })).filter(venue => venue.distance == null || venue.distance <= radius);
  } catch (_error) { /* Les candidats Google restent disponibles, mais jamais présentés comme confirmés. */ }

  if (!venues.length && googleKey && Number.isFinite(lat) && Number.isFinite(lng)) {
    const queries = ['bar sportif diffusion match', 'pub football écran', 'casino bar sport'];
    const searches = await Promise.allSettled(queries.map(async query => {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query} Le Touquet-Paris-Plage`)}&location=${lat},${lng}&radius=${Math.round(radius * 1000)}&language=fr&key=${googleKey}`;
      const response = await fetch(url); const data = await response.json();
      return data.status === 'OK' ? data.results || [] : [];
    }));
    const candidates = [...new Map(searches.flatMap(result => result.status === 'fulfilled' ? result.value : []).map(place => [place.place_id, place])).values()]
      .filter(place => place.business_status !== 'CLOSED_PERMANENTLY')
      .slice(0, 6);
    const details = await Promise.allSettled(candidates.map(async place => {
      const fields = 'place_id,name,formatted_address,formatted_phone_number,website,url,opening_hours,rating,user_ratings_total,geometry';
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place.place_id)}&fields=${fields}&language=fr&key=${googleKey}`);
      const data = await response.json(); return data.status === 'OK' ? data.result : null;
    }));
    venues = details.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : []).map(place => ({
      id: place.place_id, name: place.name, address: place.formatted_address,
      phone: place.formatted_phone_number || null, website: place.website || null, sourceUrl: place.url || place.website,
      rating: place.rating || null, reviews: place.user_ratings_total || null, confirmation: 'to_confirm',
      openNow: place.opening_hours?.open_now ?? null,
      distance: place.geometry?.location ? distanceKm(lat, lng, place.geometry.location.lat, place.geometry.location.lng) : null
    })).filter(venue => venue.distance == null || venue.distance <= radius).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }
  return res.status(200).json({ venues, configured: Boolean(base && key), onlyConfirmed: venues.every(venue => venue.confirmation === 'confirmed') });
}
