import { cached, remember } from '../api/utils.js';

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
      if (!event.date) return false;
      const day = event.date.slice(0, 10);
      return (!after || day >= after) && (!before || day <= before);
    });
    const payload = { events, configured: true, total: data.meta?.total || events.length };
    return res.status(200).json(remember(cacheKey, payload, 15 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ events: [], configured: true, unavailable: true });
  }
}

// Extrait toutes les occurrences réelles d'un événement, sans jamais en écraser une seule en une
// seule date. takesPlaceAt peut être :
//   - un objet unique (LimitedPeriod) → une seule occurrence ;
//   - un tableau d'objets → une occurrence par entrée, jamais fusionnées ;
//   - une RecurrentPeriod (avec des jours de semaine) → représentée honnêtement comme une
//     récurrence avec ses bornes réelles, jamais expansée en dates individuelles devinées (on ne
//     sait pas, sans calendrier de référence, si chaque occurrence a bien lieu — mieux vaut donner
//     la vraie structure récurrente que d'inventer chaque date).
// Vérifié sur la documentation officielle de l'ontologie : takesPlaceAt pointe vers un type Period,
// avec une sous-classe explicite RecurrentPeriod distincte de LimitedPeriod — jusqu'ici jamais
// distinguée par notre code, qui se contentait de prendre la première date trouvée n'importe où.
function extractOccurrences(item) {
  const raw = item.takesPlaceAt || item[':takesPlaceAt'];
  if (!raw) return [];
  const periods = Array.isArray(raw) ? raw : [raw];
  const occurrences = [];
  for (const period of periods) {
    if (!period || typeof period !== 'object') continue;
    const startDate = firstValue(period.startDate || period[':startDate']);
    const endDate = firstValue(period.endDate || period[':endDate']);
    const startTime = firstValue(period.startTime || period[':startTime']);
    const endTime = firstValue(period.endTime || period[':endTime']);
    if (!startDate || !/^\d{4}-\d{2}-\d{2}/.test(startDate)) continue;
    const typeValue = period['@type'] || period['rdf:type'] || period.type;
    const types = Array.isArray(typeValue) ? typeValue : [typeValue].filter(Boolean);
    const isRecurrent = types.some(t => /RecurrentPeriod/i.test(String(t)));
    const daysOfWeek = firstValue(period.dayOfWeek || period[':dayOfWeek']) || null;
    occurrences.push({
      startDate, endDate: endDate || null, startTime: startTime || null, endTime: endTime || null,
      recurrent: isRecurrent, daysOfWeek
    });
  }
  return occurrences;
}

export function normalize(item) {
  const title = localized(item.label) || localized(item['rdfs:label']);
  if (!title) return null;
  const occurrences = extractOccurrences(item);
  const primary = occurrences[0] || {};
  const date = primary.startDate ? `${primary.startDate}${primary.startTime ? 'T' + primary.startTime : 'T00:00:00'}` : deepDate(item);
  const address = item.isLocatedAt?.address || item[':isLocatedAt']?.['schema:address'] || {};
  const contact = item.hasContact || item[':hasContact'] || {};
  // Un vrai script en production (github.com/cquest/datatourisme) montre que le JSON-LD brut de
  // DATAtourisme préfixe ses propriétés (schema:telephone, foaf:homepage, schema:email). L'API
  // REST que nous appelons pourrait renvoyer une forme simplifiée ou cette forme brute — les deux
  // conventions sont donc vérifiées, jamais une seule supposée au hasard.
  const phone = firstValue(contact.telephone || contact['schema:telephone']);
  const email = firstValue(contact.email || contact['schema:email']);
  const website = firstValue(contact.website || contact['foaf:homepage']) || deepUrl(contact);
  const openingHoursText = deepTextByPattern(item, /openingHoursSpecification|hoursDescription|indicationForOpening/i);
  const priceText = deepTextByPattern(item, /priceSpecification|hasPrice|indicationForPrice/i);
  const isFree = deepBooleanByPattern(item, /isFree|freeOfCharge/i);
  const description = localized(item.hasDescription?.shortDescription) || localized(item[':hasDescription']?.['shortDescription']) || null;
  const reducedMobilityAccess = deepBooleanByPattern(item, /reducedMobilityAccess/i);
  return {
    id: `datatourisme-${item.uuid || item['@id']}`,
    title,
    date,
    // Occurrences réelles, jamais écrasées en une seule — un événement à plusieurs dates ou une
    // période récurrente reste exploitable par l'agenda tel quel, honnêtement, sans expansion
    // devinée.
    occurrences: occurrences.length ? occurrences : null,
    hasMultipleOccurrences: occurrences.length > 1,
    isRecurrent: occurrences.some(o => o.recurrent),
    location: localized(address.hasAddressCity?.label) || localized(address[':hasAddressCity']?.['rdfs:label']) || '',
    address: [address.hasAddressNumber, address.hasAddressStreet?.label || address.hasAddressStreet || address['schema:streetAddress'], address.hasPostalCode || address['schema:postalCode']].filter(Boolean).join(' '),
    type: Array.isArray(item.type) ? item.type.join(' ') : item.type,
    image: deepUrl(item.hasMainRepresentation),
    registrationUrl: item.uri || item['@id'],
    source: 'DATAtourisme · Offices de tourisme de France',
    official: true,
    description,
    phone,
    email,
    website,
    hoursText: openingHoursText,
    priceText,
    free: isFree === true,
    // Accessibilité PMR : DATAtourisme peut le fournir depuis certains producteurs, même si un
    // vrai problème documenté existe pour les données issues d'Apidae spécifiquement (le champ
    // reducedMobilityAccess y arrive parfois vide). On ne renonce pas à le lire pour autant —
    // seulement honnête sur le fait qu'il restera souvent absent selon la source d'origine.
    reducedMobilityAccess: reducedMobilityAccess,
    detailsVerified: Boolean(phone || email || openingHoursText || priceText),
    contactVerifiedAt: (phone || email || website) ? new Date().toISOString() : null,
    contactOrigin: (phone || email || website) ? 'DATAtourisme · hasContact' : null
  };
}
// Dévaluer un champ qui peut être : une chaîne directe, un tableau de chaînes, ou un objet
// JSON-LD {'@value': '...'} — les trois formes réellement rencontrées selon la source.
function firstValue(value) {
  if (value == null) return null;
  const v = Array.isArray(value) ? value[0] : value;
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v['@value']) return v['@value'];
  return null;
}

// Recherche récursive défensive : cherche une valeur texte sous une clé dont le nom correspond au
// motif donné, sans supposer un chemin exact — l'ontologie DATAtourisme imbrique ses propriétés
// différemment selon le type de POI, exactement comme deepDate/deepUrl le gèrent déjà pour la date.
function deepTextByPattern(value, pattern, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6) return null;
  for (const [key, child] of Object.entries(value)) {
    if (pattern.test(key)) {
      const text = localized(child) || firstValue(child) || (typeof child === 'string' ? child : null);
      if (text) return text;
    }
    const found = deepTextByPattern(child, pattern, depth + 1);
    if (found) return found;
  }
  return null;
}
function deepBooleanByPattern(value, pattern, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6) return null;
  for (const [key, child] of Object.entries(value)) {
    if (pattern.test(key)) {
      if (typeof child === 'boolean') return child;
      if (typeof child === 'object' && typeof child?.['@value'] === 'boolean') return child['@value'];
    }
    const found = deepBooleanByPattern(child, pattern, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

function localized(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.fr || value['fr-FR'] || Object.values(value).find(v => typeof v === 'string') || '';
}

function deepDate(value) {
  if (!value || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value)) {
    if (/startDate|startDateTime|begin/i.test(key)) {
      const v = firstValue(child) || (typeof child === 'string' ? child : null);
      if (v && /^\d{4}-\d{2}-\d{2}/.test(v)) return v;
    }
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
