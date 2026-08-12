// Le catalogue maître Dolcia — répond directement au besoin décrit : si Bagatelle existe déjà
// dans les données Dolcia (Google Places, DATAtourisme) et apparaît un jour chez un partenaire
// de réservation (Viator, Booking), l'utilisateur ne doit jamais voir deux fiches distinctes pour
// le même lieu réel. Ce module ne dépend d'aucune source précise : il fonctionne déjà aujourd'hui
// avec les sources connectées, et sera prêt sans modification le jour où Viator/Booking arrivent.
//
// Principe : deux items représentent le même lieu réel si (a) leurs noms se ressemblent
// suffisamment ET (b) leurs coordonnées sont proches. Aucun des deux critères seuls ne suffit —
// deux lieux différents peuvent porter un nom proche (une chaîne avec plusieurs adresses), et deux
// lieux proches peuvent être complètement différents (un restaurant au rez-de-chaussée d'un
// hôtel). C'est la combinaison des deux qui évite une fusion erronée.

const NAME_MATCH_THRESHOLD = 0.82; // similarité minimale du nom, jamais un seuil trop permissif
const PROXIMITY_METERS = 120; // deux fiches à plus de 120m ne sont jamais fusionnées automatiquement

// Priorité de fusion champ par champ — reprend exactement la politique déjà écrite dans
// ARCHITECTURE.md §20 : la source la plus proche de l'établissement lui-même gagne toujours.
const SOURCE_PRIORITY = [
  'Partenaire vérifié',
  'Office de tourisme',
  'DATAtourisme',
  'Viator',
  'Booking.com',
  'Google Places'
];

function normalizeName(name = '') {
  return String(name)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(le|la|les|l|du|de|des|un|une)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mesure de confinement plutôt que Jaccard pur : un nom plus détaillé ("Parc d'attractions
// Bagatelle") doit toujours être reconnu comme le même lieu qu'un nom plus court ("Parc
// Bagatelle") dès que tous les mots significatifs du nom le plus court se retrouvent dans
// l'autre. Jaccard pur (intersection / union) était trop strict sur ce cas réel — un mot
// descriptif en plus ("d'attractions") suffisait à faire chuter le score sous le seuil.
function nameSimilarity(a, b) {
  const wordsA = new Set(normalizeName(a).split(' ').filter(Boolean));
  const wordsB = new Set(normalizeName(b).split(' ').filter(Boolean));
  if (!wordsA.size || !wordsB.size) return 0;
  const intersection = [...wordsA].filter(word => wordsB.has(word)).length;
  const smaller = Math.min(wordsA.size, wordsB.size);
  return intersection / smaller;
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Infinity;
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isSameRealPlace(a, b) {
  if (nameSimilarity(a.name, b.name) < NAME_MATCH_THRESHOLD) return false;
  return distanceMeters(a.lat, a.lng, b.lat, b.lng) <= PROXIMITY_METERS;
}

function sourceRank(source = '') {
  const index = SOURCE_PRIORITY.findIndex(known => source.includes(known));
  return index === -1 ? SOURCE_PRIORITY.length : index;
}

// Fusionne un groupe d'items identifiés comme le même lieu réel. Champ par champ, jamais un
// remplacement global d'un item par un autre — pour qu'un champ absent chez la source prioritaire
// mais présent chez une source secondaire ne soit jamais perdu (§20).
function mergeGroup(group) {
  const sorted = [...group].sort((a, b) => sourceRank(a.source) - sourceRank(b.source));
  const primary = sorted[0];
  const merged = { ...primary };
  const contributedBy = { name: primary.source };
  const fields = ['phone', 'email', 'website', 'address', 'rating', 'reviews', 'photos', 'photo',
    'hoursText', 'priceText', 'free', 'ageRange', 'bookingUrl', 'description'];
  for (const field of fields) {
    if (merged[field] != null && merged[field] !== '') continue;
    for (const candidate of sorted.slice(1)) {
      if (candidate[field] != null && candidate[field] !== '') {
        merged[field] = candidate[field];
        contributedBy[field] = candidate.source;
        break;
      }
    }
  }
  merged.mergedFrom = sorted.map(item => ({ id: item.id, source: item.source }));
  merged.fieldOrigin = contributedBy;
  // Une réservation directe (Viator/Booking), si l'une des sources fusionnées en propose une,
  // n'est jamais perdue au profit d'une source qui n'en a pas — même si cette dernière est
  // prioritaire pour le reste de la fiche (description, horaires...).
  const withBooking = sorted.find(item => item.bookingUrl);
  if (withBooking) { merged.bookingUrl = withBooking.bookingUrl; contributedBy.bookingUrl = withBooking.source; }
  return merged;
}

// Point d'entrée : prend une liste d'items venant de sources potentiellement différentes,
// retourne une liste où chaque lieu réel n'apparaît qu'une seule fois. Les items sans coordonnées
// exploitables (Number.isFinite sur lat/lng) ne sont jamais fusionnés entre eux — un rapprochement
// à l'aveugle serait exactement le genre d'erreur que ce module doit empêcher, pas produire.
export function buildMasterCatalog(items) {
  const withCoords = items.filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));
  const withoutCoords = items.filter(item => !(Number.isFinite(item.lat) && Number.isFinite(item.lng)));
  const groups = [];
  const used = new Array(withCoords.length).fill(false);
  for (let i = 0; i < withCoords.length; i += 1) {
    if (used[i]) continue;
    const group = [withCoords[i]];
    used[i] = true;
    for (let j = i + 1; j < withCoords.length; j += 1) {
      if (used[j]) continue;
      if (isSameRealPlace(withCoords[i], withCoords[j])) { group.push(withCoords[j]); used[j] = true; }
    }
    groups.push(group);
  }
  const merged = groups.map(group => group.length > 1 ? mergeGroup(group) : group[0]);
  return [...merged, ...withoutCoords];
}

export { nameSimilarity, distanceMeters, isSameRealPlace };
