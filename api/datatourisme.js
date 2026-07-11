import { cached, remember } from './_cache.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  const key = process.env.DATATOURISME_KEY;
  if (!key) return res.status(200).json({ events: [], configured: false });

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Math.min(Number(req.query.radius || 30), 60);
  const after = String(req.query.after || '').slice(0, 10);
  const before = String(req.query.before || after).slice(0, 10);
  const cacheKey = `datatourisme:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:${after}:${before}`;
  const hit = cached(cacheKey);
  if (hit) return res.status(200).json(hit);

  try {
    const params = new URLSearchParams({ lang: 'fr', page_size: '250', geo_distance: `${lat},${lng},${radius}km` });
    const response = await fetch(`https://api.datatourisme.fr/v1/entertainmentAndEvent?${params}`, {
      headers: { 'X-API-Key': key }
    });
    if (!response.ok) return res.status(200).json({ events: [], configured: true, unavailable: true });
    const data = await response.json();
    const events = (data.objects || []).map(normalize).filter(Boolean).filter(event => {
      if (!event.date) return true;
      const day = event.date.slice(0, 10);
      return (!after || day >= after) && (!before || day <= before);
    });
    const payload = { events, configured: true, total: data.meta?.total || events.length };
    return res.status(200).json(remember(cacheKey, payload, 15 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ events: [], configured: true, unavailable: true });
  }
}

function normalize(item) {
  const title = localized(item.label);
  if (!title) return null;
  const date = deepDate(item);
  const address = item.isLocatedAt?.address || {};
  return {
    id: `datatourisme-${item.uuid}`,
    title,
    date,
    location: localized(address.hasAddressCity?.label) || address.hasAddressCity?.label || '',
    address: [address.hasAddressNumber, address.hasAddressStreet?.label || address.hasAddressStreet, address.hasPostalCode].filter(Boolean).join(' '),
    type: Array.isArray(item.type) ? item.type.join(' ') : item.type,
    image: deepUrl(item.hasMainRepresentation),
    registrationUrl: item.uri,
    source: 'DATAtourisme · Offices de tourisme de France',
    official: true
  };
}

function localized(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.fr || value['fr-FR'] || Object.values(value).find(v => typeof v === 'string') || '';
}

function deepDate(value) {
  if (!value || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value)) {
    if (/startDate|startDateTime|begin/i.test(key) && typeof child === 'string' && /^\d{4}-\d{2}-\d{2}/.test(child)) return child;
    const found = deepDate(child);
    if (found) return found;
  }
  return null;
}

function deepUrl(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^https?:/.test(value)) return value;
  if (typeof value !== 'object') return null;
  for (const child of Object.values(value)) {
    const found = deepUrl(child);
    if (found) return found;
  }
  return null;
}
