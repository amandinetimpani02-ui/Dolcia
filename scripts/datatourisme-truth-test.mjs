#!/usr/bin/env node
// Test de vérité DATAtourisme — à exécuter là où DATATOURISME_KEY et le réseau existent
// réellement (Vercel, ou en local avec la variable d'environnement positionnée).
//
// Ce script ne peut PAS être exécuté depuis l'environnement de développement de Claude : ni la
// clé, ni l'accès réseau à api.datatourisme.fr n'y sont disponibles. Il est écrit pour être lancé
// ailleurs, par exemple :
//   DATATOURISME_KEY=xxxx node scripts/datatourisme-truth-test.mjs
// ou comme une route de diagnostic temporaire sur Vercel (à retirer après usage — jamais un
// endpoint de diagnostic laissé en production).
//
// Objectif : répondre à trois questions factuelles, jamais déduites de la documentation :
//   1. DATAtourisme permet-il de couvrir nationalement les événements simples ?
//   2. Permet-il de récupérer les occurrences détaillées quand les producteurs les renseignent ?
//   3. Quelles informations importantes disparaissent réellement avant d'arriver chez Dolcia ?
//
// Méthode : interroger plusieurs territoires réels et différents, conserver la réponse BRUTE,
// la comparer champ par champ avec la sortie de normalize() — jamais l'inverse.

import { normalize } from '../server/datatourisme.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const KEY = process.env.DATATOURISME_KEY;
if (!KEY) {
  console.error('DATATOURISME_KEY absente de l’environnement — ce script doit tourner là où elle existe réellement (Vercel ou local avec la variable positionnée). Arrêt.');
  process.exit(1);
}

// Plusieurs territoires réellement différents, choisis pour maximiser la chance de tomber sur des
// SIT producteurs différents (Tourinsoft, Apidae, ou autres) — jamais seulement Le Touquet.
const TERRITORIES = [
  { name: 'Le Touquet-Paris-Plage (référence déjà connue)', lat: 50.5214, lng: 1.5912 },
  { name: 'Chartres (Tourinsoft, Centre-Val de Loire)', lat: 48.4467, lng: 1.4893 },
  { name: 'Annecy (zone Apidae probable, Auvergne-Rhône-Alpes)', lat: 45.8992, lng: 6.1294 },
  { name: 'Angoulême (Apidae confirmé, Charentes)', lat: 45.6484, lng: 0.1562 },
  { name: 'Strasbourg (grande métropole, système producteur à identifier)', lat: 48.5734, lng: 7.7521 }
];

const RADIUS_KM = 40;

async function fetchTerritory(territory) {
  const params = new URLSearchParams({
    lang: 'fr', page_size: '50',
    geo_distance: `${territory.lat},${territory.lng},${RADIUS_KM}km`
  });
  const response = await fetch(`https://api.datatourisme.fr/v1/entertainmentAndEvent?${params}`, {
    headers: { 'X-API-Key': KEY }
  });
  if (!response.ok) {
    return { territory: territory.name, error: `HTTP ${response.status}`, raw: null, objects: [] };
  }
  const data = await response.json();
  return { territory: territory.name, raw: data, objects: data.objects || [] };
}

// Compare un objet brut avec sa sortie normalize(), champ par champ, pour distinguer
// précisément "absent chez DATAtourisme" de "présent mais perdu par Dolcia".
function compareObject(raw) {
  const normalized = normalize(raw);
  const rawHasTakesPlaceAt = Boolean(raw.takesPlaceAt || raw[':takesPlaceAt']);
  const rawTakesPlaceAtIsArray = Array.isArray(raw.takesPlaceAt || raw[':takesPlaceAt']);
  const rawHasDescription = Boolean(raw.hasDescription || raw[':hasDescription']);
  const rawHasContact = Boolean(raw.hasContact || raw[':hasContact']);
  const rawHasPMR = JSON.stringify(raw).includes('reducedMobilityAccess');
  const rawHasPrice = JSON.stringify(raw).includes('riceSpecification') || JSON.stringify(raw).includes('isFree');

  return {
    title: normalized?.title || '(sans titre exploitable)',
    uuid: raw.uuid || raw['@id'],
    // Présence brute côté DATAtourisme, avant tout passage par normalize()
    source_brute: {
      a_takesPlaceAt: rawHasTakesPlaceAt,
      takesPlaceAt_est_un_tableau: rawTakesPlaceAtIsArray,
      a_description: rawHasDescription,
      a_contact: rawHasContact,
      mentionne_PMR_quelque_part: rawHasPMR,
      mentionne_prix_quelque_part: rawHasPrice
    },
    // Ce que Dolcia en a réellement extrait
    dolcia_normalise: normalized ? {
      date: normalized.date,
      nombre_occurrences: normalized.occurrences?.length || 0,
      est_recurrent: normalized.isRecurrent,
      a_description: Boolean(normalized.description),
      a_telephone: Boolean(normalized.phone),
      a_email: Boolean(normalized.email),
      a_pmr: normalized.reducedMobilityAccess !== null,
      a_prix_texte: Boolean(normalized.priceText),
      a_horaires_texte: Boolean(normalized.hoursText)
    } : null,
    // Le diagnostic qui compte vraiment : perdu par Dolcia alors que présent chez DATAtourisme ?
    diagnostic: {
      occurrences_multiples_perdues: rawTakesPlaceAtIsArray && (normalized?.occurrences?.length || 0) <= 1,
      description_perdue: rawHasDescription && !normalized?.description,
      contact_perdu: rawHasContact && !normalized?.phone && !normalized?.email,
      pmr_present_mais_perdu: rawHasPMR && normalized?.reducedMobilityAccess === null
    }
  };
}

async function main() {
  console.log('=== Test de vérité DATAtourisme — exécution réelle ===\n');
  const allResults = [];

  for (const territory of TERRITORIES) {
    console.log(`--- ${territory.name} ---`);
    try {
      const result = await fetchTerritory(territory);
      if (result.error) {
        console.log(`  ERREUR: ${result.error}`);
        allResults.push({ territory: territory.name, error: result.error });
        continue;
      }
      console.log(`  ${result.objects.length} objets reçus`);
      const comparisons = result.objects.slice(0, 15).map(compareObject);
      allResults.push({ territory: territory.name, total: result.objects.length, comparisons });

      const withMultiOccurrences = comparisons.filter(c => c.source_brute.takesPlaceAt_est_un_tableau);
      const lostOccurrences = comparisons.filter(c => c.diagnostic.occurrences_multiples_perdues);
      console.log(`  Objets avec takesPlaceAt en tableau (occurrences multiples potentielles): ${withMultiOccurrences.length}`);
      console.log(`  Dont perdues par notre normalize() actuel: ${lostOccurrences.length}`);
    } catch (error) {
      console.log(`  ERREUR RÉSEAU: ${error.message}`);
      allResults.push({ territory: territory.name, error: error.message });
    }
    console.log('');
  }

  mkdirSync('./diagnostic-output', { recursive: true });
  writeFileSync('./diagnostic-output/datatourisme-truth-test.json', JSON.stringify(allResults, null, 2));
  console.log('=== Résultat complet écrit dans ./diagnostic-output/datatourisme-truth-test.json ===');
  console.log('=== La clé API n’a jamais été écrite dans ce fichier. ===');
}

main().catch(error => {
  console.error('Échec du script:', error.message);
  process.exit(1);
});
