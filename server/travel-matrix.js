import { cached, remember } from '../api/utils.js';

const round = value => Math.round(Number(value) * 1000) / 1000;

export async function resolveTravelMinutesBatch(origin, candidates, mode = 'driving') {
  const key = process.env.GOOGLE_KEY;
  const result = new Map();
  if (!key || !origin || !candidates.length) return result;
  const valid = candidates.filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng)).slice(0, 100);
  for (let offset = 0; offset < valid.length; offset += 25) {
    const group = valid.slice(offset, offset + 25);
    const destinations = group.map(item => `${round(item.lat)},${round(item.lng)}`).join('|');
    const cacheKey = `travel-batch:${round(origin.lat)}:${round(origin.lng)}:${mode}:${destinations}`;
    let payload = cached(cacheKey);
    if (!payload) {
      try {
        const params = new URLSearchParams({ origins: `${origin.lat},${origin.lng}`, destinations, mode, language: 'fr', key });
        const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params}`);
        payload = await response.json();
        if (payload.status === 'OK') remember(cacheKey, payload, 60 * 60 * 1000);
      } catch (_) { payload = null; }
    }
    const elements = payload?.rows?.[0]?.elements || [];
    group.forEach((item, index) => {
      const element = elements[index];
      if (element?.status === 'OK' && element.duration?.value != null) result.set(item.id, Math.round(element.duration.value / 60));
    });
  }
  return result;
}
