# Dolcia MASTER

## Mise à jour émotionnelle — 13 juillet 2026

- Les étoiles internes Dolcia sont supprimées : les étoiles visibles appartiennent uniquement aux avis Google et sont clairement identifiées.
- Avant une sortie : « Coup de cœur », « Ça me donne envie », « Pas maintenant », « Pas pour moi ».
- Après une sortie réellement passée dans l’agenda : « Inoubliable », « J’ai adoré », « Un joli moment », « Pas pour moi », « Décevant ».
- Des ressentis précis (enfants, duo, accueil, prix, distance, découverte, à refaire) enrichissent la mémoire personnelle du concierge.
- Si l’utilisateur change d’avis, le moteur corrige l’ancien choix au lieu de fausser son profil.

## Règle de confiance non négociable

Dolcia vise l’exhaustivité maximale des sources, mais n’affiche que des propositions passant le contrôle qualité. Une note est toujours rattachée à sa source et à son volume d’avis. Une date, un horaire, un tarif, une disponibilité ou une adresse manquants ne sont jamais inventés : ils sont signalés comme non communiqués ou à confirmer. Une fiche dont l’existence, la date ou la localisation ne sont pas suffisamment documentées est rejetée avant classement.

Cette branche de travail est l'unique base officielle de Dolcia.

## Socle conservé de la V10

- APIs séparées : Places, OpenAgenda, météo et photos.
- Catégorisation des lieux et événements.
- Toutes les références photo Google disponibles pour les galeries.
- Scoring par contexte, météo, distance, qualité, horaires et préférences.
- Agenda local, apprentissage et génération de variantes.
- Cache géographique serveur avec revalidation en arrière-plan.
- Chargement progressif visible par source.
- Réactions distinctes : favori, apprécié et refusé.
- Plans B météo et réorganisation manuelle de l'agenda.

## Règles produit

- Aucun écran de diagnostic ou bouton de test dans l'interface utilisateur.
- Aucune activité, note, distance, disponibilité ou offre inventée.
- Une offre n'est affichée comme telle que si elle provient d'un partenaire vérifié.
- Toujours proposer une alternative élégante lorsqu'une source ne retourne rien.
- Toute évolution future part de ce MASTER. Ne pas créer de version parallèle.

## Prochain niveau

Le MASTER ne prétend pas encore référencer tout le loisir mondial. L'extension de la couverture passe par de nouvelles sources partenaires spécialisées : billetterie, cinéma, sport, réservation, hébergement et services de conciergerie.

## Déploiement géographique

1. Ville pilote : Le Touquet-Paris-Plage, rayon strict de 12 km.
2. Territoire pilote : Côte d'Opale, rayon de 52 km.
3. Grandes villes françaises : Lille, Paris, Lyon, Bordeaux et Marseille.
4. Extension nationale progressive après contrôle de la qualité et des partenaires.

Le budget est toujours présenté comme une enveloppe totale par personne pour la durée choisie. Pour un séjour, cette enveloppe inclut l'hébergement et déclenche une recherche d'hôtels.

Le rayon de la destination est une limite absolue, et non une préférence. Les résultats Google situés hors rayon sont supprimés avant le scoring. Pour la ville pilote, les adresses de Calais, Boulogne-sur-Mer et Dunkerque sont également exclues explicitement.

## Sources événementielles

- Office de tourisme du Touquet pour la ville pilote.
- DATAtourisme pour les offices de tourisme, syndicats d'initiative, agences départementales et comités régionaux français.
- OpenAgenda pour les agendas ouverts complémentaires.
- Partenaires Dolcia pour les événements privés validés des restaurants, hôtels, bars, commerces, clubs et associations.
