import { normalizeOccurrence, dedupeOccurrences } from './festival-model.js';

// Couche 1 — propre à ChartrEstivales, ne connaît que ce format-là.
//
// IMPORTANT, à ne jamais oublier en production : chartrestivales.com interdit explicitement
// l'accès automatisé (robots.txt le refuse). Aucun scraper live n'a donc été construit pour ce
// site, contrairement à touquet-events.js. Les occurrences ci-dessous viennent d'une vérification
// manuelle par recherche (comme pour le Festival des Tout-Petits), jamais d'une extraction directe
// de la page. Une vraie mise en production devrait soit obtenir une autorisation explicite, soit
// passer par l'office de tourisme officiel (chartres-tourisme.com), qui republie ces mêmes
// événements sous son propre nom — à vérifier avant de construire un vrai extracteur automatique.
const PARENT = { name: 'ChartrEstivales', url: 'https://www.chartrestivales.com/' };

// Chaque entrée correspond à une occurrence individuellement confirmée par recherche le
// 7 août 2026 — jamais la totalité des ~40 dates de la saison, seulement celles réellement
// vérifiées. Le reste de la programmation existe mais reste volontairement absent plutôt que
// deviné.
const VERIFIED_OCCURRENCES = [
  { title: 'Bloody Mary (ouverture)', date: '2026-07-03', time: '21:00', location: 'Place des Halles', locationVerified: true, timeVerified: true },
  { title: 'Concert violon et orgue — Nicolas Gros, Jean-Charles Gandrille', date: '2026-08-06', time: '21:00', location: 'Cathédrale', locationVerified: true, timeVerified: true },
  { title: 'Elton Tribute', date: '2026-08-08', time: '21:00', timeVerified: true },
  { title: 'Chorale éphémère', date: '2026-08-20', time: '21:00', location: 'Parvis cathédrale de Chartres', locationVerified: true, timeVerified: true },
  { title: 'Phoenix 66 (hommage Johnny Hallyday)', date: '2026-08-15', time: '21:00', timeVerified: true },
  { title: 'Orchestre Oasis (clôture)', date: '2026-08-22', time: '21:00', location: 'Place Châtelet', locationVerified: true, timeVerified: true }
];

export default function extractChartrEstivales() {
  const retrievedAt = new Date().toISOString();
  const occurrences = VERIFIED_OCCURRENCES.map(item => normalizeOccurrence({
    ...item,
    parentEvent: PARENT.name,
    parentEventUrl: PARENT.url,
    sourceName: 'ChartrEstivales (vérifié par recherche, extraction automatique non autorisée)',
    sourceUrl: PARENT.url,
    free: true,
    priceVerified: true,
    retrievedAt
  }));
  return dedupeOccurrences(occurrences);
}
