// Couche 2 de l'architecture d'ingestion — la normalisation Dolcia, commune à toutes les sources.
// Aucune connaissance du format d'un site précis ne doit vivre ici : cette couche ne fait que
// transformer une extraction déjà faite (couche 1, propre à chaque source) vers le modèle unique
// attendu par Dolcia. Un troisième territoire n'a besoin, en théorie, que d'un nouvel extracteur
// (couche 1) — jamais de toucher cette normalisation.
//
// Modèle de sortie, une entrée par occurrence réelle :
//   parentEvent, activityTitle, occurrenceId, startAt, endAt, location, price, ageRange,
//   bookingUrl, source, sourceUrl, retrievedAt, verification ('verified' | 'unverified' | 'absent')

const REQUIRED_RAW_FIELDS = ['title', 'date', 'sourceUrl', 'sourceName'];

// Échoue visiblement si une extraction de couche 1 ne fournit pas le strict minimum — jamais une
// occurrence fabriquée pour combler un champ manquant. Une modification de structure du site
// source qui casserait l'extraction doit se voir ici, pas produire une donnée douteuse en silence.
export function normalizeOccurrence(raw) {
  const missing = REQUIRED_RAW_FIELDS.filter(field => !raw?.[field]);
  if (missing.length) {
    throw new Error(`normalizeOccurrence: champs obligatoires manquants (${missing.join(', ')}) — extraction rejetée plutôt que devinée`);
  }
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw.date)) {
    throw new Error(`normalizeOccurrence: date "${raw.date}" n'est pas au format ISO — extraction rejetée plutôt que mal interprétée`);
  }
  return {
    parentEvent: raw.parentEvent || null,
    parentEventUrl: raw.parentEventUrl || null,
    activityTitle: raw.title,
    occurrenceId: raw.occurrenceId || `${raw.sourceName}-${raw.date}-${slug(raw.title)}`,
    startAt: raw.time ? `${raw.date.slice(0, 10)}T${raw.time}:00` : `${raw.date.slice(0, 10)}T00:00:00`,
    endAt: raw.endTime ? `${raw.date.slice(0, 10)}T${raw.endTime}:00` : null,
    timeKnown: Boolean(raw.time),
    location: raw.location || null,
    price: raw.price ?? null,
    free: raw.free === true,
    ageRange: raw.ageRange || null,
    bookingUrl: raw.bookingUrl || null,
    source: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    retrievedAt: raw.retrievedAt || new Date().toISOString(),
    // Jamais un seul booléen global : chaque champ dit honnêtement s'il est vérifié, non vérifié
    // (connu mais pas confirmé sur la page source elle-même) ou absent — jamais deviné.
    verification: {
      location: raw.location ? (raw.locationVerified ? 'verified' : 'unverified') : 'absent',
      price: (raw.price != null || raw.free) ? (raw.priceVerified ? 'verified' : 'unverified') : 'absent',
      ageRange: raw.ageRange ? (raw.ageVerified ? 'verified' : 'unverified') : 'absent',
      time: raw.time ? (raw.timeVerified ? 'verified' : 'unverified') : 'absent'
    }
  };
}

// Déduplication : si la même activité arrive par deux sources différentes (ex. DATAtourisme et
// un extracteur dédié), on garde celle dont la vérification est la plus complète, jamais les deux
// en double. Comparaison volontairement stricte (titre + jour) pour ne jamais fusionner par erreur
// deux activités distinctes qui se ressembleraient.
export function dedupeOccurrences(occurrences) {
  const byKey = new Map();
  for (const occ of occurrences) {
    const key = `${slug(occ.activityTitle)}|${occ.startAt.slice(0, 10)}`;
    const existing = byKey.get(key);
    if (!existing || countVerified(occ) > countVerified(existing)) byKey.set(key, occ);
  }
  return [...byKey.values()];
}
function countVerified(occ) {
  return Object.values(occ.verification).filter(v => v === 'verified').length;
}

function slug(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 60);
}
