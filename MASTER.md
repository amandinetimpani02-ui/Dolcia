# Dolcia MASTER

## Moteur de vérité géographique - 16 juillet 2026

- La collecte fonctionne en deux cercles : abondance locale systématique et recherche régionale ciblée pour les expériences signature compatibles avec la durée.
- `server/geo-eligibility.js` produit `core`, `extended`, `outside` ou `location_unknown` avec des codes partagés et versionnés.
- Un lieu proche n'est jamais accepté uniquement parce qu'il est proche ; un lieu fermé à l'arrivée ou définitivement fermé est exclu.
- Explorer conserve l'abondance, tandis que les recommandations et programmes restent stricts.
- Les codes inconnus ou contradictoires font échouer le moteur et les tests.
- Le déploiement manuel `vercel --prod` est précédé des contrôles automatiques définis dans `npm run check`.

## Industrialisation v17 - 15 juillet 2026

- Le classement principal passe désormais par `POST /api/recommendations` : le navigateur transmet le contexte, la mémoire utile et les expériences normalisées ; le serveur applique les contrôles universels, calcule le rang et renvoie des raisons lisibles.
- Les exclusions universelles couvrent notamment les bâtiments municipaux classés en hébergement, les lieux fermés définitivement, les résultats hors rayon, les événements hors dates, les activités animalières non demandées et les compétitions de golf incompatibles avec un moment famille/amis.
- La mise en avant payante ne reçoit aucun bonus de pertinence ; elle sert uniquement de départage infinitésimal à score égal.
- Un repli local reste temporairement présent pour assurer la continuité du prototype si la fonction serveur est indisponible. Il devra être supprimé après validation en production afin de ne plus exposer la formule historique dans le JavaScript public.
- Prochaines briques : stockage des profils et consentements, mémoire contextualisée côté serveur, composition horaire serveur, preuve multi-source et Concierge écrit sécurisé. La voix temps réel reste une cible non encore livrée.
- L'Agenda présente désormais un espace de groupe : organisateur, accompagnants standards, personnes Dolcia invitées, propositions et votes. La persistance multi-téléphones nécessite l'activation des comptes et des tables Realtime `shared_programs`, `program_members`, `program_changes` et `program_votes` fournies dans le schéma Supabase.
- `GET /api/flash-offers` ne remonte que des offres partenaires au statut `live`, non expirées, avec quantité restante, prix Dolcia strictement inférieur au prix initial et rayon compatible. Aucune promotion de démonstration n'est fabriquée lorsque la source n'est pas configurée.
- Une offre est d'abord proposée au groupe ; elle ne remplace jamais automatiquement le programme et l'agenda initial reste intact jusqu'à validation et réservation.
- « L'inattendu maîtrisé » devient une signature Dolcia. Explorer présente trois futurs calculés dans le même catalogue : l'évidence parfaite, la pépite locale et l'inattendu maîtrisé. Chaque voie annonce son volume de possibilités et son niveau de documentation, puis peut être explorée librement ou confiée à L'Éclat pour composer un programme.

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

# Choix temporels contextuels

- Le nombre de jours est calculé sur les dates civiles, sans que l'heure courante puisse transformer aujourd'hui en faux séjour de deux jours.
- « Ce soir » verrouille directement le créneau soirée et masque les choix matin et après-midi devenus contradictoires.
- « Maintenant » propose uniquement des durées qui commencent réellement maintenant, jamais une matinée déjà passée.

# Disponibilité et profondeur du catalogue

- « Ouvert actuellement » n'est jamais utilisé comme preuve d'ouverture à un futur créneau.
- Pour entrer dans un créneau horaire, un lieu Google doit disposer d'horaires publiés couvrant le début et au moins 75 minutes d'expérience.
- Cinémas, spectacles, visites guidées, ateliers, cours et excursions exigent une séance ou un départ publié ; le seul horaire d'ouverture du bâtiment ne suffit pas.
- Une avant-première ou séance spéciale peut être mise en avant uniquement comme événement daté et sourcé.
- Les envies servent à classer les résultats, pas à supprimer toutes les autres familles de loisirs.
- Chaque créneau conserve son propre vivier : un restaurant ouvert à 19 h et 21 h peut apparaître dans les deux créneaux.
- Mon programme peut limiter ses alternatives par créneau ; Explorer conserve le catalogue général et son nombre total de possibilités.

# Deux moteurs clairement séparés

- Explorer représente le catalogue général complet : aucun plafond de trois ou douze fiches, chargement progressif par lots de soixante.
- Le consommateur peut rechercher, parcourir une famille, trier par pertinence, distance, réputation ou événements, et filtrer la disponibilité.
- Les styles cochés sont des préférences multiples de classement : ils remontent en premier sans masquer les autres univers.
- Une famille n'est masquée que lorsque l'utilisateur demande explicitement à parcourir uniquement cette famille.
- Mon programme reste le concierge : contraintes fiables, envie du moment, goûts appris, qualité, variété, surprise maîtrisée, puis avantage partenaire seulement à pertinence égale.

# Compréhension ouverte du consommateur

- Le Brief du moment accepte une phrase libre et en extrait le groupe, les âges mentionnés, l'énergie, l'ambiance et les univers recherchés.
- La dictée vocale alimente le même moteur que l'écrit lorsque le navigateur la permet.
- La Boussole Dolcia remplace l'entonnoir fermé : chaque réponse réordonne le catalogue sans éliminer les chemins non choisis.
- Une pépite hors radar peut revenir si elle est très qualitative, contextuellement compatible et presque aussi pertinente que la valeur sûre.
- Mon programme dose attentes explicites, goûts appris, contexte immédiat, diversité et surprise maîtrisée.
- Pour les familles, Dolcia peut rechercher un temps enfants encadré, une parenthèse parents et des retrouvailles ; aucune séparation n'est proposée sans encadrement documenté.
- Chaque fiche explique pourquoi elle est recommandée : envie actuelle, météo, goût appris, événement officiel, proximité, valeur sûre ou découverte.

# Vision produit officielle — Dolcia, OS du temps libre

Cette vision constitue le cahier des charges de référence. Une fonction n'est considérée comme livrée que lorsqu'elle est visible, utilisable, alimentée par des données réelles et protégée par des contrôles de fiabilité.

## 1. Le Jumeau du moment

Dolcia doit comprendre simultanément les participants et leurs âges, leurs goûts individuels et communs, leur énergie actuelle, leurs refus, la météo, la circulation, les distances, le budget restant, les expériences déjà vécues et les contraintes de mobilité, de poussette, d'animal ou de véhicule. Elle doit distinguer l'intention profonde : rire, se retrouver, souffler, impressionner ou découvrir.

Une phrase naturelle doit pouvoir suffire. Les informations manquantes réellement décisives font l'objet d'une question courte et adaptative ; aucune question déjà résolue ne doit être reposée.

## 2. La composition magique

Mon programme est une mise en scène, jamais une liste : horaires, déplacements, disponibilité, réservation, alternance des émotions, respiration, météo, plan B, remplacement d'une étape, consigne globale, budget et final mémorable. Les activités parallèles parents/enfants exigent une preuve d'encadrement et doivent prévoir les retrouvailles.

La courbe émotionnelle cible est : lancement, découverte, moment fort, respiration et final mémorable.

## 3. Le moteur de vérité

- Confirmé : horaire, adresse et disponibilité prouvés.
- Très probable : horaires officiels compatibles, réservation non vérifiée.
- À vérifier : visible uniquement dans Explorer.
- Refusé : donnée incohérente, ancienne ou trop incomplète.

Les contradictions entre Google, offices de tourisme, billetteries, organisateurs et partenaires doivent déclasser automatiquement la donnée. Une fiche « à vérifier » ne peut jamais être injectée dans Mon programme.

## 4. La personnalisation intelligente

Dolcia apprend des favoris, refus, expériences vécues, sensations, personnes présentes, saisons, météo, temps de consultation, acceptations et remplacements. Les goûts permanents restent distincts des envies du moment. L'utilisateur conserve le contrôle de ses données et peut corriger ou effacer ce que Dolcia a appris.

## 5. La surprise maîtrisée

La cible de composition est 65 % d'alignement direct, 25 % de variations intelligentes et 10 % de découvertes inattendues. Ces proportions sont une intention de diversité, jamais une obligation qui contournerait une contrainte ou diminuerait la fiabilité.

## 6. Explorer

Explorer doit pouvoir contenir des centaines de propositions avec Brief écrit ou vocal, Boussole ouverte, carte, filtres naturels, collections éditoriales, événements, offres exceptionnelles et explication de chaque classement. Les préférences réordonnent sans masquer ; seul un filtre demandé explicitement réduit le catalogue.

## 7. L'expérience premium

La direction artistique cible : photographies éditoriales, transitions cinématographiques, cartes immersives, typographie mobile maîtrisée, navigation courte, programme présenté comme un carnet de voyage, détails dorés rares, micro-interactions, mode clair premium et aucune information technique exposée.

## 8. Le Concierge vivant

Trois niveaux sont prévus : conversation écrite, dictée vocale et conversation voix-à-voix. Le Concierge pose uniquement la question la plus informative, reformule sa compréhension, explique ses choix et peut modifier une étape ou le programme complet.

## 9. L'écosystème partenaire invisible

Les professionnels authentifiés peuvent déclarer une disponibilité, une offre de dernière minute, un événement, une diffusion, une place libérée, des prix, photos et horaires. Les clients ne voient jamais les packs commerciaux. Une mise en avant payante ne départage que des propositions à pertinence consommateur égale.

## État réel au 15 juillet 2026

### Fonctionnel ou amorcé dans le prototype

- Brief libre avec extraction locale de plusieurs intentions.
- Dictée vocale du Brief lorsque le navigateur la permet.
- Boussole ouverte et préférences non exclusives.
- Explorer avec recherche, tris, familles et chargement progressif.
- Composition complète, régénération globale et remplacement par étape.
- Premiers contrôles de date, heure, ouverture et qualité des sources.
- Favoris, réactions et sensations alimentant un profil local.
- Première surprise contrôlée et explication de la recommandation.

### Encore partiel

- Jumeau du moment multi-personnes et profils individuels.
- Budget consommé et restant sur un séjour.
- Courbe émotionnelle et temps de déplacement réels.
- Disponibilité et réservation en temps réel chez tous les prestataires.
- Contradictions automatiques entre toutes les sources.
- Mode familial parallèle avec encadrement prouvé.
- Carte vivante et filtres naturels complets.
- Interface partenaire opérationnelle et modération humaine.

### Non livré à ce stade

- Conversation IA écrite réellement générative et persistante.
- Conversation voix-à-voix Realtime.
- Comptes clients et profils familiaux sécurisés côté serveur.
- Paiement, réservation transactionnelle et budget temps réel.
- Notifications partenaires et offres flash en production.
- Couverture exhaustive garantie de tous les loisirs d'un territoire.

La cible produit reste : Dolcia connaît le territoire, comprend le moment, sécurise la réalité et compose une expérience que l'utilisateur n'aurait pas imaginée seul.
## Addendum — expérience différenciée par situation

Principe directeur : **Dolcia ne cherche pas à maximiser le temps passé dans l’application. Elle cherche à maximiser la qualité du temps vécu hors de l’application.**

- **Je croyais tout connaître** : surprise locale crédible, fondée sur la rareté vérifiée, les événements temporaires et l’historique réel. Dolcia ne prétend jamais qu’une personne ignore un lieu sans preuve.
- **Mon séjour vivant** : programme surveillé, plans B préparés, budget recalculé et modification toujours soumise à l’accord de l’utilisateur.
- **Décidez pour moi** : conversation courte avec L’Éclat, deux ou trois précisions décisives, puis programme complet régénérable.
- **Notre constellation** : mémoire visible des expériences, émotions et personnes présentes, avec droit permanent de correction et d’effacement.

Ces comportements sont détectés depuis le contexte ; ils ne doivent pas devenir trois parcours lourds ou trois questionnaires supplémentaires.
