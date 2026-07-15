# Dolcia MASTER

## Mise à jour émotionnelle — 13 juillet 2026

- Les étoiles internes Dolcia sont supprimées : les étoiles visibles appartiennent uniquement aux avis Google et sont clairement identifiées.
- Avant une sortie : « Coup de cœur », « Ça me donne envie », « Pas maintenant », « Pas pour moi ».
- Après une sortie réellement passée dans l’agenda : « Inoubliable », « J’ai adoré », « Un joli moment », « Pas pour moi », « Décevant ».
- Des ressentis précis (enfants, duo, accueil, prix, distance, découverte, à refaire) enrichissent la mémoire personnelle du concierge.
- Si l’utilisateur change d’avis, le moteur corrige l’ancien choix au lieu de fausser son profil.

## Correction du parcours temporel — 13 juillet 2026

- « À partir de maintenant » compose le reste de l’après-midi et la soirée en une seule fois.
- « Ce soir » fixe directement la soirée : Dolcia ne repose plus la question de la durée.
- Pour une date libre, « L’après-midi + la soirée » est désormais un vrai choix.
- Les événements officiels exceptionnels du jour restent visibles même s’ils ne correspondent pas à l’envie principale.
- Le feu d’artifice et bal populaire du 13 juillet 2026 à 23 h dispose d’un filet de sécurité relié à la source officielle du Touquet.
- Un budget de 0 € ne transforme jamais artificiellement une prestation payante en activité gratuite.

## Fiabilité des catégories et horaires — 13 juillet 2026

- Suppression du remplissage forcé : aucun créneau n’est complété par une activité hors sujet.
- Un événement dont la source ne donne pas l’heure n’est jamais placé artificiellement à 12 h, 21 h ou 23 h.
- Les propositions liées aux chiens sont exclues tant que l’utilisateur n’a pas demandé un filtre « avec mon animal ».
- Aucun filtre animal n’est activé dans cette version : cette fonction restera désactivée tant que la compatibilité des lieux ne pourra pas être garantie proprement.
- Les messages de confirmation possèdent désormais un contraste sombre/champagne lisible.

## Radar des grands rendez-vous — 14 juillet 2026

- Détection quotidienne des grands rendez-vous sportifs nationaux et internationaux.
- Détection des moments locaux et culturels exceptionnels : fête nationale, feu d’artifice, bal populaire, festival, carnaval, braderie, cérémonie et inauguration.
- Dolcia demande à l’utilisateur s’il souhaite intégrer le rendez-vous au lieu de l’imposer.
- Un rendez-vous accepté rejoint l’agenda à son horaire réel.
- Les lieux de diffusion sont séparés en « diffusion confirmée » et « aucune preuve publique ».
- Aucun bar n’est présenté comme diffuseur sur la seule base de sa catégorie Google.
- Les partenaires disposent d’une structure de déclaration avec URL de preuve, contrôle IA, niveau de confiance, contradictions et recours humain ciblé.

## Parcours premium unifié — 14 juillet 2026

- Date et créneau sont réunis sur un seul écran ; la grande page de durée redondante est supprimée du parcours.
- Les grands rendez-vous apparaissent dès l’accueil avec une question claire.
- Accepter un grand rendez-vous ouvre le véritable programme « Compose-moi », jamais le catalogue de propositions.
- Le rendez-vous devient un créneau protégé ; l’avant et l’après peuvent être recomposés.
- Les diffusions confirmées et les lieux à appeler sont visuellement et sémantiquement séparés.
- Chaque créneau du programme peut être régénéré ou affiné avec une demande libre (« plus calme », « vue mer », « moins cher », etc.).

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
# Fiabilité temporelle en temps réel

- Pour une sortie le jour même, aucun créneau antérieur à l'heure actuelle ne peut être proposé.
- Une marge minimale de 20 minutes est conservée pour permettre à l'utilisateur de se préparer et de se déplacer.
- Cette règle s'applique à toutes les activités et à toutes les sources, pas seulement à un exemple signalé.
- Une activité sportive de journée ne peut pas être déplacée artificiellement dans un créneau nocturne sans horaire officiel compatible.

# Séjours et hébergements

- Le budget d'un séjour est recalculé selon son nombre réel de nuits ; un séjour de 18 jours représente 17 nuits.
- « Hôtel de ville », mairie, monument ou visite guidée sont formellement exclus des hébergements.
- Un élément ne peut entrer dans le créneau hébergement que s'il possède des indices explicites de logement touristique.
- Le programme d'un séjour comporte des moments pour chaque journée, et non un modèle limité arbitrairement à deux jours.
