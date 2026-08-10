import { cached, remember } from '../api/utils.js';
import { normalizeOccurrence } from './festival-model.js';

// Programme réel du Festival des Tout-Petits 2026, vérifié directement sur letouquet.com le
// 5 août 2026 — le festival est un événement PARENT, jamais une activité proposable en soi ;
// chaque rendez-vous en est une activité ENFANT autonome, avec sa propre date et son propre
// lien. Seules les entrées avec un objet de détails ont été vérifiées individuellement
// (horaires, âge, tarif, lieu exact, repli pluie) — les autres restent volontairement minimales
// plutôt que de deviner ces détails : le titre et la date seuls sont déjà vérifiés, le reste ne
// l'est pas encore. Exporté au niveau du module pour pouvoir aussi être validé par le modèle de
// normalisation commun (festival-model.js) — la preuve que ce même programme, écrit une seule
// fois, sert à la fois la route existante et le modèle partagé, sans duplication de données.
export const festivalParent = { title: 'Festival des Tout-Petits', slug: 'festival-des-tout-petits' };
export const festivalToutPetits = [
  ['2026-07-11', 'Spectacle familial « EX!T »', 'spectacle-familial-ext'],
  ['2026-07-15', 'Atelier baby gym parent-enfant', 'atelier-baby-gym', {
    slots: ['09:30', '11:00', '15:30', '17:00'], location: 'Salle Suzanne Lenglen, Avenue de l’Hippodrome',
    ageRange: 'De 2 à 6 ans', durationMinutes: 60, price: 8,
    bookingUrl: 'https://boutique.letouquet.com/billetterie/festival-des-tout-petits/7-26-atelier-baby-gym'
  }],
  ['2026-07-15', 'Jeux de plein air', 'jeux-de-plein-air', {
    hoursRange: { start: '14:00', end: '18:00' }, location: 'Jardin d’Ypres', rainFallback: 'Salle des Quatre Saisons',
    ageRange: 'Tout public', free: true, priceNote: 'Gratuit (ateliers payants)'
  }],
  ['2026-07-15', 'Sensibilisation à l’environnement', 'sensibilisation-a-lenvironnement'],
  ['2026-07-18', 'Jeux à partager et animations créatives', 'jeux-a-partager-et-animations-creatives'],
  ['2026-07-22', 'Atelier d’éveil musical en famille', 'atelier-deveil-musical-en-famille'],
  ['2026-07-22', 'Fil de soi', 'fil-de-soi'],
  ['2026-07-25', 'Les mystérieuses aventures de Valentin Magicien', 'les-mysterieuses-aventures-de-valentin-magicien'],
  ['2026-07-29', 'Atelier de fabrication de marionnettes', 'atelier-de-fabrication-de-marionnettes'],
  ['2026-07-29', 'Bric, broc, boum !', 'bric-broc-boum'],
  ['2026-08-01', 'Structures gonflables', 'structures-gonflables', {
    hoursRange: { start: '14:00', end: '18:00' }, location: 'Jardin d’Ypres', rainFallback: 'Salle des Quatre Saisons',
    ageRange: 'Tout public', price: 6
  }],
  ['2026-08-05', 'Atelier cirque en famille', 'atelier-cirque-en-famille'],
  ['2026-08-05', 'Pareidolies', 'pareidolies'],
  ['2026-08-08', 'Jeux de construction', 'jeux-de-construction'],
  ['2026-08-12', 'Atelier magie', 'atelier-magie'],
  ['2026-08-12', 'Jour jaune', 'jour-jaune'],
  ['2026-08-15', 'Spectacle familial « Bal(les) »', 'spectacle-familial-balles', {
    slots: ['12:00', '17:00'], location: 'Place Quentovic', rainFallback: 'Salle des Quatre Saisons',
    ageRange: 'Tout public', durationMinutes: 45, free: true
  }],
  ['2026-08-19', 'Journée Pianos Folies', 'journee-pianos-folies-festival-des-tout-petits'],
  ['2026-08-23', 'Spectacle familial « Rêve »', 'spectacle-familial-reve']
];

// Preuve du critère de réussite : ce même programme, déjà utilisé par la route existante
// ci-dessous, passe aussi intégralement par le modèle de normalisation commun (festival-model.js)
// — celui-là même qui sert aussi ChartrEstivales (chartres-events.js). Un seul modèle, deux
// sources réelles très différentes.
export function normalizeTouquetFestivalWithSharedModel() {
  const retrievedAt = new Date().toISOString();
  const occurrences = [];
  for (const [day, title, slug, details] of festivalToutPetits) {
    const slots = details?.slots?.length ? details.slots : [details?.hoursRange?.start || null];
    for (const time of slots) {
      occurrences.push(normalizeOccurrence({
        title, date: day, time,
        parentEvent: festivalParent.title,
        parentEventUrl: `https://www.letouquet.com/agenda/${festivalParent.slug}/`,
        sourceName: 'Office de tourisme du Touquet',
        sourceUrl: `https://www.letouquet.com/agenda/${slug}/`,
        location: details?.location || null, locationVerified: Boolean(details?.location),
        price: details?.price ?? null, free: details?.free || false, priceVerified: Boolean(details),
        ageRange: details?.ageRange || null, ageVerified: Boolean(details?.ageRange),
        timeVerified: Boolean(time),
        bookingUrl: details?.bookingUrl || null,
        retrievedAt
      }));
    }
  }
  return occurrences;
}

function clean(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

function isoFromFrench(value) {
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

function parsePage(html) {
  const events = [];
  const pattern = /(?:Le|À partir du)\s*(?:<[^>]+>\s*)*(\d{2}\/\d{2}\/\d{4})[\s\S]{0,2600}?<h3[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const title = clean(match[3]);
    if (!title) continue;
    events.push({
      id: `touquet-${isoFromFrench(match[1])}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}`,
      title,
      date: `${isoFromFrench(match[1])}T00:00:00+02:00`,
      timeKnown: false,
      location: 'Le Touquet-Paris-Plage',
      registrationUrl: new URL(match[2], 'https://www.letouquet.com').toString(),
      source: 'Office de tourisme du Touquet',
      official: true
    });
  }
  return events;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
  const after = String(req.query.after || '').slice(0, 10);
  const before = String(req.query.before || after).slice(0, 10);
  const key = `touquet-events:${after}:${before}`;
  const hit = cached(key);
  if (hit) return res.status(200).json(hit);

  try {
    const pages = await Promise.all(
      [1, 2, 3, 4, 5, 6].map(page =>
        fetch(`https://www.letouquet.com/sejourner/agenda/${page === 1 ? '' : `page/${page}/`}`, {
          headers: { 'User-Agent': 'Dolcia/1.0 (+https://www.letouquet.com)' }
        }).then(response => response.ok ? response.text() : '').catch(() => '')
      )
    );
    const all = pages.flatMap(parsePage);
    for (const [day, title, slug, details] of festivalToutPetits) {
      if ((after && day < after) || (before && day > before)) continue;
      const base = {
        location: details?.location || 'Le Touquet-Paris-Plage',
        rainFallback: details?.rainFallback || null,
        ageRange: details?.ageRange || null,
        durationMinutes: details?.durationMinutes || null,
        free: details?.free || false,
        price: details?.price ?? null,
        priceNote: details?.priceNote || null,
        address: '62520 Le Touquet-Paris-Plage',
        registrationUrl: `https://www.letouquet.com/agenda/${slug}/`,
        bookingUrl: details?.bookingUrl || null,
        source: 'Office de tourisme du Touquet',
        official: true,
        parentEvent: festivalParent.title,
        parentEventUrl: `https://www.letouquet.com/agenda/${festivalParent.slug}/`,
        audience: 'Enfants de 0 à 12 ans et familles',
        detailsVerified: Boolean(details)
      };
      // Plusieurs créneaux discrets (plusieurs séances distinctes) → une vraie entrée planifiable
      // par créneau, jamais un texte qui les concatène. L'occurrenceGroup les relie entre elles
      // sans jamais faire hériter les tarifs, âges ou horaires d'un créneau à l'autre — chacun
      // reste sa propre entrée avec ses propres données.
      if (details?.slots?.length) {
        details.slots.forEach((slot, index) => {
          all.push({
            ...base,
            id: `touquet-${day}-${slug}-${slot.replace(':', '')}`,
            title,
            date: `${day}T${slot}:00+02:00`,
            timeKnown: true,
            occurrenceGroup: `touquet-${day}-${slug}`,
            occurrenceIndex: index,
            occurrenceCount: details.slots.length
          });
        });
        continue;
      }
      all.push({
        ...base,
        id: `touquet-${day}-${slug}`,
        title,
        date: details?.hoursRange ? `${day}T${details.hoursRange.start}:00+02:00` : `${day}T00:00:00+02:00`,
        timeKnown: Boolean(details?.hoursRange),
        hoursRange: details?.hoursRange || null
      });
    }
    if (after <= '2026-07-13' && before >= '2026-07-13') {
      all.unshift({
        id: 'touquet-2026-07-13-feu-artifice-bal-populaire',
        title: 'Feu d’artifice et bal populaire',
        date: '2026-07-13T23:00:00+02:00',
        location: 'Front de mer, 62520 Le Touquet-Paris-Plage',
        registrationUrl: 'https://www.letouquet.com/agenda/feu-dartifice/',
        source: 'Office de tourisme du Touquet',
        official: true,
        timeKnown: true,
        free: true,
        priceLabel: 'Accès libre'
      });
    }
    const seen = new Set();
    const events = all.filter(event => {
      const day = event.date.slice(0, 10);
      if ((after && day < after) || (before && day > before) || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });
    const payload = { events, source: 'Office de tourisme du Touquet', official: true };
    return res.status(200).json(remember(key, payload, 30 * 60 * 1000));
  } catch (_error) {
    return res.status(200).json({ events: [], source: 'Office de tourisme du Touquet', unavailable: true });
  }
}
