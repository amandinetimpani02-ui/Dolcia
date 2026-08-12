# Dolcia — Journal des évolutions (Changelog)

Journal chronologique de toutes les décisions techniques et corrections apportées au projet, dans
l'ordre où elles ont eu lieu. Pour comprendre l'état actuel du projet sans lire tout l'historique,
voir `MASTER.md`. Pour la logique durable du moteur de décision, voir `ARCHITECTURE.md`. Pour la
vision et la philosophie, voir `VISION.md`.

## Anime devient un véritable animateur numérique — 10 août 2026

- D reste la personnalité relationnelle unique ; Anime devient explicitement son rôle d'animation.
- Le contrat couvre tout le cycle : accueil, règles, rôles et équipes, rythme, transitions, scores
  et suspense lorsque pertinents, encouragements, relances, adaptation et conclusion.
- Les scores et la compétition restent interdits par défaut dans les séances calmes et de bien-être.
- Le prompt Anime et les libellés utilisateur ne présentent plus le produit comme un simple
  générateur de jeux.
- Ajout de 4 tests de contrat Anime ; suite complète : 442/442 tests réussis.

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

## Reprise de base (v20_15_0) côté Claude — 29 juillet 2026

- Base reçue d'une autre session (192 tests), reprise ici après vérification. Deux correctifs récents avaient régressé par rapport à des échanges précédents avec Claude sur ce même projet : le bouton "Explorer" de la navigation (renvoyait vers l'accueil au lieu du catalogue) et la classe CSS `dialogue-options` (inexistante, devait être `dialogue-choices` sur l'écran "rythme du séjour"). Les deux ont été réappliqués, avec un test de garde ajouté pour le second (absent jusque-là).
- Point positif confirmé dans cette base : `zeroResultRecovery()` distingue proprement un vrai échec des sources d'un résultat vide après filtrage légitime (ex. budget 0€ + entre amis), avec une proposition concrète adaptée au contexte plutôt qu'un message d'erreur générique. Élargissement toujours explicite, jamais automatique, plafonné à 20km.
- 194 tests verts après cette reprise. Rappel pour la suite : si un travail continue en parallèle sur ce projet (autre session, autre outil), vérifier systématiquement les correctifs récents avant d'adopter une nouvelle base — ils peuvent régresser silencieusement sans qu'aucun test ne le détecte si le fichier de test correspondant n'a pas été transmis non plus.

## Ambiance vivante pour Dolcia Anime — 29 juillet 2026

- Retour direct : l'animateur ne se sentait pas du tout au niveau d'un vrai club de vacances — trop plat, trop texte, comparé à Apple Fitness+ ou à l'énergie d'un animateur piscine type aquagym.
- Limite assumée et clarifiée : aucune génération de vraie vidéo ni de musique produite n'est possible ici — ni par Claude, ni par cet environnement. Ce qui a été construit à la place, honnêtement :
  - **Thème d'ambiance visuelle par type d'activité** (`animateEnergyTheme`) : aquagym/nautique → bleu énergique, sport/jeux → orange dynamique, événement/soirée → violet festif, bien-être → vert apaisé, restauration → ambré chaleureux, reste → or signature Dolcia. Une scène de lumière colorée et mouvante (`animate-energy-scene`, 4 halos flous animés) remplace le fond statique unique.
  - **Un "pouls" sonore synthétisé** (Web Audio API, `toggleAnimatePulse`) : un battement rythmique réel, calé sur un tempo différent par thème (64 à 126 bpm) — explicitement présenté comme un pouls, jamais comme une musique produite, pour ne pas tromper sur ce qui est réellement livré. Toujours silencieux par défaut, activé sur un geste explicite, jamais au chargement automatique de la session.
  - Le pouls s'arrête proprement à la pause et à la fin de session (jamais laissé tourner en arrière-plan), et son état visuel (bouton actif/inactif) reste cohérent même quand l'écran se redessine à chaque nouvelle étape.
- Pour une vraie vidéo par activité et une identité musicale complète (jingle, chanson), la voie réaliste reste celle déjà actée : contenus courts fournis par les partenaires avec leur accord, pas une bibliothèque générée par IA — à construire dans une prochaine étape, pas encore fait.
- 200 tests verts après cet ajout.

## Accueil dynamisé : de "mou" à vivant — 29 juillet 2026 (suite du même jour)

- Retour direct : l'accueil (repris de la base v20.15.0) était trop sage — une respiration de 14 secondes et un rayon de lumière de 10 secondes, presque imperceptibles. Pas assez "vacances", pas assez immersif.
- Rayon de lumière accéléré (10s → 4,5s, plus intense) et respiration du fond accélérée (14s → 8s, amplitude doublée).
- Ajout de 12 particules montantes scintillantes (façon bulles ou lumière du soleil sur l'eau), tailles et vitesses légèrement décalées pour un effet naturel plutôt que mécanique — c'est ce qui donne vraiment l'énergie "vacances" qui manquait.
- Halo doré et vignette de fond conservés (attention notée dans les tests : à ne pas perdre à nouveau en retouchant cette zone). Tout reste désactivable via le mouvement réduit.
- 204 tests verts après cet ajustement.

## Dolcia Anime, vraie énergie d'animateur — 29 juillet 2026 (suite du même jour)

- Retour direct et net : l'animateur ne tenait pas la comparaison avec un vrai animateur Club Med ou Belambra. En creusant le code, la vraie cause : `animateStepText` affichait **l'instruction brute sans aucune énergie** ("recréez une scène de film sans accessoire") — un mode d'emploi, pas une prise de parole d'animateur.
- Corrigé à la racine : chaque étape est désormais précédée d'une phrase de hype variée selon le contexte (ouverture, étape courante, dernière étape), avant l'instruction elle-même.
- Répliques de réaction de D (`animateCoachLine`) réécrites avec une vraie énergie de groupe — exclamations, adresse directe ("Allez, on démarre !!", "Ouais !! J'adore cette énergie") — au lieu du ton posé et calme d'avant, plus adapté à un coach qu'à un animateur.
- Ajout d'une vraie célébration visuelle (`celebrateAnimateMoment`) à chaque mission accomplie : une pluie de confettis colorés, injectée dans le document (survit au réaffichage de la modale), se détruit toute seule après 1,5 seconde, désactivée si mouvement réduit demandé.
- 208 tests verts après ces ajouts. Toujours honnête sur la limite : aucune vraie vidéo ni musique produite n'accompagne ces changements — c'est un renforcement du texte et du visuel généré, pas un saut vers un contenu multimédia réel.

## Le vrai fichier audio intégré (pas généré) — 29 juillet 2026 (suite du même jour)

- Correction d'une confusion de ma part : je ne peux pas *générer* de musique, mais le fichier `Hey__Dolcia.mp3` avait déjà été fourni par la personne — je n'avais pas besoin de l'écouter pour l'intégrer techniquement, juste besoin de le copier et de le brancher. Fait.
- Fichier réel copié dans `assets/audio/dolcia-theme.mp3` (vérifié dans un test : taille réelle, pas un placeholder).
- Joué automatiquement à l'ouverture d'une session Dolcia Anime (`playDolciaTheme`, déclenché depuis `startDolciaAnimate`, dans la continuité du geste de clic donc sans blocage navigateur), avec un bouton "Hymne Dolcia" pour le réécouter à tout moment pendant la session.
- S'arrête proprement à la pause et à la fin de session (`stopDolciaTheme`), jamais laissé jouer en arrière-plan.
- Ce qui reste distinct et non résolu : la génération de vraies vidéos sportives et d'une identité musicale complète (jingle court + version longue) — ça, ça nécessite toujours un vrai outil de génération audio/vidéo que je n'ai pas, ou des contenus fournis comme celui-ci.
- 211 tests verts après cette intégration.

## "Et maintenant ?" — une vraie suite après la session, jamais un chiffre inventé — 29 juillet 2026 (suite du même jour)

- Idée reprise du document de vision (partagé deux fois) : après une séance d'aquagym, proposer "un smoothie à proximité, une balade, un restaurant léger" plutôt que de s'arrêter net sur l'écran de fin.
- Point de vigilance appliqué de moi-même avant de construire quoi que ce soit : le document proposait aussi d'afficher "Bravo, tu as brûlé environ 350 kcal" — refusé sciemment. Dolcia n'a aucune source réelle pour connaître une dépense calorique ; l'afficher aurait été une donnée fabriquée présentée comme un fait, contraire au principe fondateur.
- Construit à la place : `animateFollowUpSuggestion()` propose un vrai lieu déjà chargé et vérifié (`geoVisible` + `recommendationEligibleNow`), jamais une donnée inventée. Après une activité physique (sport, eau, jeu), la suggestion oriente vers une pause (nourriture, bien-être) ; après un moment calme ou gourmand, vers quelque chose de plus actif. Si aucun candidat réel n'existe à proximité, rien ne s'affiche — jamais de bloc vide ou fabriqué pour combler l'espace.
- 214 tests verts après cet ajout.

## Présence réelle de D et vraie empathie — 29 juillet 2026 (suite du même jour)

- Retour direct et juste : on restait très loin d'un vrai animateur/coach "devant vous" — la présence de D était minuscule (76px même en "grand"), et surtout, un trou plus profond a été trouvé en creusant : **le système d'expression du visage de D n'existait qu'en JavaScript** (`setDVisualState`, classes `is-delighted`, `is-calm`, `is-speaking`...) **sans aucune traduction visuelle** — le visage ne montrait concrètement aucune émotion, quelle que soit l'humeur définie.
- Construit à la racine : un vrai système d'yeux et de bouche en CSS, avec une forme différente par humeur (sourire large en `is-delighted`/`is-encouraging`, ligne calme en `is-calm`, bouche qui parle en `is-speaking`, regard qui se décale en `is-thinking`, yeux plus grands en `is-listening`).
- Pendant une session Dolcia Anime spécifiquement, D devient massive et centrale (132px, respiration douce) en haut de l'écran — une vraie présence façon coach en visio, plutôt qu'une icône reléguée à côté d'un texte.
- Ajout d'un vrai moment d'empathie à mi-session : au lieu de systématiquement pousser le hype, D s'arrête une fois pour demander sincèrement "ça vous plaît toujours autant ?" — avant de reprendre l'énergie ensuite.
- Non vérifié visuellement faute d'un vrai navigateur ici — le placement des yeux/bouche par rapport à la lettre "D" centrale est une hypothèse de design raisonnable, pas une certitude visuelle. À confirmer une fois testé en vrai.
- 218 tests verts après ces ajouts.

## Vrai bug trouvé : les pépites régionales dépendaient d'un mot magique — 30 juillet 2026

- Exemple concret donné et vérifié réel par recherche web : la Fête du Cochon Rose à Hesdin-la-Forêt (30km du Touquet, mi-août, gratuite, familiale) — exactement le genre de pépite locale que Dolcia doit connaître d'elle-même.
- **Bug 1** : le mot-clé qui déclenche la recherche régionale des grands événements cherchait "festival", "concert", "spectacle" — jamais "fête", le mot français le plus courant pour ce type d'événement. Confirmé par un test direct : `/festival|concert|spectacle/i.test('fête du cochon rose')` → `false`.
- **Bug 2, plus profond** : même corrigé, ce mécanisme ne se déclenchait que si la personne tapait elle-même un mot correspondant dans sa phrase. Une pépite locale, par définition, doit être trouvée par Dolcia — pas devinée par la personne via le bon mot magique.
- Corrigé : le mot-clé couvre désormais "fête"/"fête" (accents variables), "carnaval", "foire", "kermesse" en plus de l'existant. Et surtout, la vérification des **grands événements régionaux** tourne désormais systématiquement dès qu'une recherche régionale est possible (durée jour/séjour/après-midi-soirée), sans condition de mot-clé — contrairement aux centres d'intérêt personnels (aquarium, parc à thème, nautique) qui restent, eux, conditionnés à une demande explicite pour ne pas gonfler inutilement chaque recherche.
- Vérifié concrètement : une demande neutre ("qu'est-ce qu'on fait ce week-end ?") déclenche bien la vérification à 50km ; une demande courte (2h) ne la déclenche pas ; les catégories personnelles (aquarium) restent bien protégées de tout débordement non désiré.
- 219 tests verts après ce correctif.

## Où afficher les pépites locales : intégrées, jamais un bouton à part

- Question posée directement : ajouter les pépites en direct dans les résultats, ou via un petit bouton séparé après la recherche ?
- Réponse tranchée, et déjà en grande partie construite : **intégrées directement dans le flux, jamais un bouton séparé à cliquer pour les découvrir.** Un bouton optionnel transforme l'exceptionnel en option cachée — l'exact opposé du réflexe premium (Booking Genius, Airbnb Guest Favorite, guide Michelin : le meilleur est déjà visible dans la liste, pas derrière un clic supplémentaire).
- Ce qui existe déjà pour matérialiser ça : le ruban visuel "Sélection Dolcia" sur la carte elle-même, et le statut `extended`/`HIGH_RARITY` du moteur géo qui distingue une pépite prouvée d'un résultat ordinaire — sans les séparer dans un espace à part.

## Deuxième bug, plus profond : la preuve de rareté n'était jamais alimentée — 30 juillet 2026 (suite du même jour)

- Nouvel exemple donné : les concerts gratuits du jeudi soir à Hesdin n'apparaissaient pas non plus. Vérification poussée plus loin que le correctif précédent (qui ne réglait que la recherche, pas le filtrage).
- Cause trouvée : pour qu'un événement à 30-50km devienne visible (`status: 'extended'`), le moteur géo exige une preuve de rareté vérifiée (`rarity === 'high'`, via `rarityEvidence` avec une source fiable). Or **rien, nulle part dans le pipeline réel, ne renseignait jamais ce champ** sur les vrais items récupérés (Google Places, OpenAgenda, DATAtourisme...). Résultat : aucun événement réel, aussi exceptionnel soit-il, ne pouvait jamais atteindre `rarity==='high'` — le mécanisme entier de "pépite régionale prouvée" était structurellement mort pour toute donnée réelle, même une fois correctement recherché.
- Corrigé : les sources officielles (DATAtourisme, l'office de tourisme du Touquet, Ticketmaster, les événements partenaires) marquent déjà leurs événements `official:true` — un vrai signal existant, jamais exploité pour ça. Un événement officiel ET daté (pas un lieu permanent comme une mairie) reçoit désormais automatiquement une preuve de rareté reconnue par le moteur géo.
- Vérifié concrètement avant l'écriture des tests, sur le cas exact signalé (concert officiel du soir à Hesdin, 40km, un jeudi) : sans le correctif → `outside` (invisible) ; avec le correctif → `extended` (visible). Comparaison directe, pas une supposition.
- 221 tests verts après ce correctif. Ces deux bugs cumulés (mot-clé manquant + preuve de rareté jamais alimentée) expliquent probablement pourquoi peu, voire aucune pépite régionale réelle n'était jamais remontée jusqu'ici, malgré une architecture qui semblait complète sur le papier.

## La règle nationale des pépites, formalisée — 30 juillet 2026 (suite du même jour)

- Point important soulevé directement : ce n'est pas à la personne de décider au cas par cas si un événement est "une pépite locale" ou non — il faut une règle écrite, la même partout en France, pas un réglage à l'instinct sur un seul exemple (Hesdin).
- Bonne nouvelle en creusant : cette règle **existait déjà**, elle n'était simplement jamais formalisée comme telle. Elle repose sur trois conditions objectives, aucune ne dépendant d'une ville précise :
  1. **Budget de temps de trajet**, pas de distance en kilomètres — un rayon fixe n'a pas le même sens en zone rurale qu'en zone dense. Le budget dépend uniquement de la durée du moment (`GEO_THRESHOLDS.travelMinutes` : 45 min pour une journée, 90 min pour un séjour...), multiplié par 1,35 pour une pépite prouvée.
  2. **Officiel et daté** — un vrai rendez-vous vérifié, pas un lieu permanent.
  3. **Aucun équivalent de qualité comparable plus proche** (`applyAlternativeCheck`) — une pépite ne vaut le détour que si elle n'existe nulle part de plus près.
- Formalisée explicitement dans le code (commentaire en tête de `geo-eligibility.js`) pour que ce soit visible et non-négociable, pas une logique enfouie.
- Vérifié concrètement, pas supposé : le même scénario (concert officiel du soir, trajet variable) testé autour du Touquet, de Lyon et de Brest donne exactement le même résultat — extended si le trajet est sous le budget, outside sinon, peu importe la ville. Nouveau fichier de test dédié à cette généralité.
- 223 tests verts après cette formalisation.

## Récurrent ≠ rare : affiner ce que "officiel et daté" prouve vraiment — 30 juillet 2026 (suite du même jour)

- Question posée directement, et elle pointait un vrai trou : "officiel et daté" prouve qu'un événement est vérifié et limité dans le temps — **ça ne prouve pas qu'il est rare.** Un concert gratuit qui revient chaque jeudi tout l'été n'a pas la même valeur de pépite qu'un festival annuel unique, même si les deux sont officiels et datés. Vérifié : aucune détection de récurrence n'existait nulle part dans le code.
- Corrigé avec un repli honnête et assumé : faute d'un vrai signal de récurrence dans les sources actuelles (aucune API utilisée ne le fournit), la détection se base sur des indices dans le nom/résumé de l'événement ("tous les jeudis", "chaque semaine", "du jeudi"...). Un événement qui semble récurrent ne reçoit plus automatiquement le statut de pépite exceptionnelle.
- Vérifié concrètement avant les tests : "Concert du jeudi soir" → détecté comme récurrent ; "Fête du Cochon Rose" → correctement reconnu comme unique.
- Limite assumée et à surveiller : c'est une heuristique sur le texte, pas une vraie donnée de récurrence structurée. Un événement récurrent au nom atypique pourrait encore passer entre les mailles — si ça arrive en usage réel, il faudra l'affiner avec de vrais exemples plutôt que deviner d'autres motifs à l'avance.
- 224 tests verts après ce correctif.

## Équipes façon Belambra Games — 30 juillet 2026 (suite du même jour)

- Recherche faite avant de construire : vraies références vérifiées, pas de mémoire — Peloton (énergie de classe live, leaderboard), Apple Fitness+ (production léchée, suivi biométrique), Nike Training Club (gratuit, coachs motivants, utilisable sans regarder l'écran), Ray (coach vocal conversationnel qui compte les répétitions et s'adapte en direct — le plus proche de ce qu'on construit avec D), Aaptiv (100% audio, aucun écran requis). Et côté vrais clubs de vacances : Belambra confirme utiliser des "Belambra Games" (jeux participatifs), tournois, blind-tests, grands jeux collectifs — la compétition en équipes est le cœur de leur animation, pas un détail.
- Ce qui manquait précisément : Dolcia Anime n'avait qu'un score collectif unique ("Élan"), jamais de vraie rivalité amicale entre équipes — l'élément le plus caractéristique d'une vraie animation Club Med/Belambra.
- Construit : deux équipes se forment automatiquement pour un vrai groupe (3 personnes ou plus, jamais pour un duo ou un groupe non identifié), avec des noms tirés au sort ("Les Soleils" vs "Les Embruns"...). Chaque mission accomplie donne un point à l'équipe du tour en cours, puis passe la main.
- Attention respectée : la règle déjà posée ("l'Élan ne classe jamais les personnes") reste intacte — la compétition est entre équipes, jamais individuelle, et la finale célèbre chaleureusement les deux équipes ensemble, sans jamais déclarer de vainqueur ni de perdant. Vérifié explicitement : aucune occurrence de "a gagné"/"a perdu"/"vainqueur"/"défaite" dans le code.
- 228 tests verts après cet ajout.

## Coach sportif : oui sur le ton et la structure, non sur la technique — 30 juillet 2026 (suite du même jour)

- Question directe : peut-on faire "comme Apple Fitness+" pour le coach sport ? Réponse honnête, en deux parts.
- Ce qui reste hors de portée, et pas seulement par manque d'outil : aucune vidéo de démonstration (pas de génération vidéo), aucun suivi biométrique en direct (Dolcia est une appli web, pas une appli native connectée à l'Apple Watch/HealthKit), et surtout — **aucune consigne technique précise sur la forme d'un mouvement** ("engage les abdos", "garde le dos droit"). Ce dernier point n'est pas une limite d'outil : Dolcia a déjà la règle de ne jamais se présenter comme un encadrant diplômé, et donner une fausse consigne technique de forme sportive serait potentiellement dangereux, pas juste incomplet.
- Trouvé en creusant : il n'existait même pas de vrai programme "sport" dans Dolcia Anime — seulement des jeux sociaux, familiaux, et un jeu piscine parent-enfant, aucune séance cardio structurée.
- Construit : un vrai programme (`sport`, "Cardio doux entre nous") structuré en trois phases comme une vraie séance encadrée — échauffement, cœur de séance, retour au calme — avec un badge visuel distinct par phase. Le contenu reste volontairement au niveau du rythme et du ressenti ("à votre rythme", "selon votre ressenti", "sans forcer"), jamais une consigne technique de forme. Vérifié explicitement par un test qu'aucune formulation du type "dos droit"/"engage les abdos" ne s'y trouve.
- 231 tests verts après cet ajout.

## Mains libres, façon Aaptiv — 30 juillet 2026 (suite du même jour)

- Question directe : parmi les apps citées, laquelle imiter pour le sport ? Réponse : **Aaptiv**, pas Peloton ni Apple Fitness+ — parce que c'est la seule dont le modèle ne dépend pas de la vidéo, donc la seule vraiment atteignable ici.
- En vérifiant avant d'agir (plutôt que d'annoncer un correctif sans preuve) : la narration vocale automatique à chaque étape **existait déjà** (`options.speak!==false` déclenché à chaque rendu) — correction de ce que j'avais annoncé à tort dans l'échange précédent.
- Le vrai manque trouvé : aucun avancement automatique entre les étapes — il fallait toucher l'écran pour passer à la suite, impossible à faire proprement pendant un effort physique. Construit : `scheduleAnimateAutoAdvance()`, qui avance seule au rythme réel du programme, uniquement pour les sessions structurées (`phased:true`, donc le programme sport, jamais les jeux sociaux existants).
- **Bug trouvé et corrigé en testant mon propre code avant de le livrer** : les horaires du programme ("00:05", "00:18"...) sont au format heures:minutes écoulées, pas minutes:secondes — ma première version confondait les deux, ce qui aurait avancé toutes les 8 secondes au lieu de toutes les quelques minutes. Repéré en simulant les durées avant d'écrire les tests, pas après.
- Minuteur arrêté proprement à la pause et à la fin de session, jamais laissé tourner en arrière-plan. Mention transparente ajoutée dans l'interface ("cette séance avance seule") pour que ça ne surprenne personne.
- 236 tests verts après ces ajouts.

## Sessions Dolcia Anime partagées — code + QR, chacun sur son téléphone — 30 juillet 2026 (suite du même jour)

- Demande directe, reprise d'un échange antérieur : chacun doit pouvoir suivre une session Dolcia Anime sur son propre téléphone, une personne garde la main, les autres suivent — comme un vrai animateur de club où personne n'a besoin de se masser autour d'un seul écran.
- Précision respectée : la famille déjà dans le Cercle (proches enregistrés) n'a jamais besoin de code, elle est déjà liée au compte. Le code sert uniquement aux amis externes, pour une durée choisie et limitée — exactement les quatre options demandées (24h, 2 jours, 3 jours, 1 semaine), jamais un accès permanent non maîtrisé.
- Construit, sans nouveau fichier `api/` (toujours 11 fonctions, branche `?service=animate-session` sur `events.js`) :
  - `server/animate-sessions.js` : création d'un code (6 caractères, alphabet sans caractères ambigus comme 0/O ou 1/I, vérifié par test), lecture de l'état par les suiveurs, mise à jour par la personne qui anime.
  - Nouvelle table Supabase `animate_live_sessions` (code, état, expiration) — SQL documenté dans `SUPABASE_PUSH_SETUP.md`.
  - Côté animateur : un bouton "Partager cette session" ouvre le choix de durée, génère le code et un QR (via un service externe léger, pas de bibliothèque à charger), affichés directement dans l'écran de session. Chaque changement d'étape pousse l'état à jour.
  - Côté suiveur : rejoindre par code saisi à la main ou par lien scanné (le QR encode une URL `?join=CODE` qui pré-remplit et valide automatiquement). Vue en lecture seule, qui se met à jour toute seule (sondage toutes les 4 secondes) — aucun bouton d'avancement, la main reste uniquement à la personne qui anime, vérifié explicitement par un test.
  - Code expiré ou introuvable signalé clairement, jamais une erreur silencieuse.
- 245 tests verts après cet ajout.

## SMS/email en premier, façon Spotify Jam — 30 juillet 2026 (suite du même jour)

- Précision retrouvée d'un échange antérieur : le QR n'est pas la meilleure expérience quand on est déjà en interaction avec la personne (ex. un serveur face à un client) — sortir l'appareil photo casse la fluidité. Vérifié avec de vraies sources actuelles (Spotify Jam, janvier 2026) : le lien envoyé directement (SMS, email, ou messagerie intégrée) est bien la méthode principale des apps les plus modernes ; le QR y reste une option secondaire, utile en solution de secours (affiche, chevalet de table), jamais la méthode mise en avant.
- Reconstruit dans cet esprit : un champ pour entrer le numéro ou l'email de l'ami, un bouton "Envoyer" qui ouvre directement l'app SMS ou email du téléphone (natif, aucun service tiers payant requis) avec le message et le lien déjà prêts — un clic suffit pour l'ami.
- Avantages obtenus, comme demandé : le lien reste dans les messages/emails du destinataire (pas un QR qu'on oublie de scanner), et le contact envoyé est mémorisé sur la session (`session.invitedContacts`) — une base pour le Cercle plus tard.
- Le partage natif (WhatsApp via le menu de partage du téléphone) et le QR restent disponibles, mais explicitement présentés comme un repli ("Ou partager le lien autrement", "Vous êtes ensemble ? Scannez"), pas la méthode principale.
- 248 tests verts après cette évolution.

## Trois chantiers en parallèle : Animation, Filtres, IA — 30 juillet 2026 (suite du même jour)

- Demande directe de pousser sur les trois fronts à la fois. Un vrai chantier concret par sujet, pas une promesse générale.
- **Animation** : le programme calme/bien-être (yoga) devient mains-libres, structuré en trois phases (installation, cœur du moment, retour) comme le sport — même mécanique d'avancement automatique. Bug de test découvert au passage : le test qui devait vérifier que "calm" n'était pas mains-libres avait une faille de regex (dernier élément sans virgule finale) qui le rendait silencieusement toujours vert, même avant ce changement. Corrigé en même temps.
- **Filtres** : nouveau filtre "Pépite locale" dans Explorer, basé directement sur le statut `extended` que les deux correctifs du moteur géo (mot-clé "fête" manquant, preuve de rareté jamais alimentée) viennent de réparer aujourd'hui — sans ce filtre, la correction restait invisible pour la personne, même si elle fonctionnait en coulisses.
- **IA** : le D-Coach connaît désormais les pépites locales déjà vérifiées par le moteur (`currentPepiteHighlight`) et peut les mentionner spontanément en conversation si ça correspond vraiment à la demande — jamais forcé, jamais inventé, uniquement des items déjà chargés et déjà passés par toutes les vérifications (commune, rareté, budget de temps de trajet).
- 253 tests verts après ces trois ajouts.

## Audit de régression, un chantier à la fois — 30 juillet 2026 (suite du même jour)

- Recentrage demandé : arrêter d'empiler des listes de tâches, agir sur une chose concrète à la fois. Choix : refaire l'audit de régression (détection de classes CSS orphelines), méthode qui avait déjà trouvé un vrai bug (`dialogue-choices`) plus tôt dans la session.
- Trois classes réellement orphelines trouvées et corrigées, aucune fausse alerte cette fois :
  - `.major-safety` et `.major-source` — les notes de sécurité et les liens de source vérifiée des grands événements régionaux n'avaient jamais eu de style, à deux endroits différents du code (accueil et écran dédié). Un texte de sécurité affiché sans aucune mise en forme, c'est exactement le genre de détail qui casse la confiance.
  - `.animate-teams-closing` — la conclusion chaleureuse ajoutée plus tôt aujourd'hui pour les deux équipes ("ont toutes les deux été formidables") n'avait jamais reçu de style non plus. Oubli trouvé et corrigé dans ma propre construction du jour.
- Les 5 autres classes signalées par l'audit (`dining`, `energy`, `moment-editor`, `stay-rhythm-options`, `voice-brief`) restent des faux positifs déjà analysés : héritage correct d'un style parent, ou correspondance accidentelle avec du texte JSON — pas de régression.
- 255 tests verts après ces corrections.

## Le point explicitement noté "pas encore fait" — enfin relié — 30 juillet 2026 (suite du même jour)

- Reprise littérale d'un point ouvert cité depuis `SUPABASE_PUSH_SETUP.md` : "cette création de campagne n'est pas encore reliée à une vraie table Supabase ni à ce pipeline d'envoi [...] Relier les campagnes partenaires validées à ce même pipeline est un prochain chantier, pas encore fait."
- Vérifié avant de construire : `createCampaign()` dans `pro.js` était **100% fictif** — `prompt()` du navigateur, poussé dans `partnerState.campaigns` local, jamais envoyé nulle part.
- Corrigé, sans dupliquer aucune logique d'envoi existante :
  - Nouvelle table Supabase `partner_campaigns` (SQL dans `SUPABASE_PUSH_SETUP.md`) : une campagne y est réellement persistée dès sa soumission, avec un statut `a_controler`.
  - `createCampaign()` envoie désormais réellement la campagne au serveur ; si la synchronisation échoue, elle reste visible localement plutôt que perdue en silence.
  - Une campagne approuvée dont le déclencheur est chiffrable ("place libérée", "offre flash" — avec prix public, prix Dolcia, quantité) devient automatiquement une vraie ligne `flash_offers` avec `status:'live'` — ce qui déclenche le pipeline d'envoi déjà construit et déjà testé plus tôt aujourd'hui. Aucune nouvelle logique d'envoi créée, pure réutilisation.
  - Les déclencheurs non chiffrables ("événement rare", "plan B météo") restent volontairement hors de ce pont automatique — vérifié par test qu'aucun prix n'est jamais inventé pour forcer une correspondance.
- Honnêteté sur la limite restante : une vraie console d'approbation avec authentification équipe manque toujours (`admin.html` reste une coquille, volontairement, en attendant les rôles et le journal d'audit). En attendant, l'approbation passe par un endpoint protégé par `ADMIN_BRIDGE_SECRET` — un pont manuel documenté, pas une solution finale d'administration.
- 261 tests verts après ce pont.

## Accompagner dans la durée, pas seulement pendant un moment — 30 juillet 2026 (suite du même jour)

- Demande directe : aller plus loin sur l'animateur/jeux/coach, dans l'esprit "accompagner l'humain", pas juste pendant une session isolée.
- Trouvé en vérifiant avant de construire : `state.animateHistory` sauvegardait déjà un vrai enregistrement à la fin de chaque session (date, élan, rires...) — mais cette donnée n'était **jamais relue**. Dolcia Anime "oubliait" tout d'une fois à l'autre malgré l'historique déjà présent.
- Corrigé : `animateContinuityGreeting()` relit cet historique réel au lancement d'une nouvelle session et l'intègre dans la toute première phrase de D — jamais un chiffre inventé, uniquement le compte réel de sessions et la vraie date de la dernière :
  - Jalon (3e, 5e, 10e, 20e, 30e session) → une vraie célébration de régularité.
  - Absence de plus de 14 jours → des retrouvailles chaleureuses, jamais culpabilisantes.
  - Même jour → reconnaît l'énergie du moment.
  - Rien de spécial (2e session, hier par exemple) → aucune phrase forcée, silence normal.
- Vérifié concrètement avec 5 cas avant même d'écrire les tests : première session, jalon, longue pause, même jour, cas neutre — chacun se comporte exactement comme attendu.
- 266 tests verts après cet ajout.

## Trois chantiers demandés dans l'ordre : questions, filtres, style — 30 juillet 2026 (suite du même jour)

- **1/3 — Questions pour l'animation** : en voulant ajouter un système de questions rapides pour bien choisir le programme, découverte qu'il **existait déjà** (`refineAnimateChoice`, 6 intentions supportées) — near-miss évité de justesse grâce aux tests, changement annulé avant livraison. En creusant plus loin : seuls 4 boutons sur 6 intentions supportées étaient réellement affichés ("eau" et "ensemble" manquaient). Complété honnêtement, sans dupliquer le mécanisme existant.
- **2/3 — Filtre budget** : trouvé une vraie donnée déjà présente sur les items (`price_level` de Google Places, normalisée en `item.price`) mais jamais exploitée comme filtre. Ajouté comme un vrai filtre budget (€ à €€€€), qui se combine avec tous les filtres existants (famille, disponibilité, lentilles) — jamais un système séparé. Un item sans prix réel connu n'est jamais inclus par erreur dans un filtre restrictif, vérifié par test.
- **3/3 — Style Liquid Glass (Apple)** : vérifié avant d'agir — le verre dépoli (`backdrop-filter:blur(26px)`) existait déjà sur la barre de filtres. Poussé plus loin avec les deux signatures manquantes du vrai style "Liquid Glass" iOS 26 : une ombre portée qui fait flotter le panneau (pas juste un flou plat), et un reflet net sur le bord supérieur. Ajout d'une vraie interaction tactile sur les boutons de filtre (léger retrait au tap), absente jusque-là.
- 275 tests verts après ces trois chantiers.

## Vérification mobile des ajouts récents — 30 juillet 2026 (suite du même jour)

- Angle d'audit pas encore testé : plusieurs éléments ajoutés aujourd'hui (panneau de partage SMS/email/QR, barre d'équipes) n'avaient jamais reçu de règle mobile spécifique, alors que le reste de l'appli en a systématiquement à 620px. Le panneau de partage en particulier (image + texte + champ + bouton, tous côte à côte) risquait de déborder ou de se sentir à l'étroit sur un petit écran.
- Corrigé : le panneau de partage passe en colonne sur mobile, le champ de contact et son bouton prennent toute la largeur, et la barre d'équipes autorise le retour à la ligne plutôt que de forcer un débordement.
- 277 tests verts après cette vérification.

## Dolcia v21 — nouvelle vision produit reçue — 30 juillet 2026 (suite du même jour)

- Refonte de vision reçue : Dolcia n'est plus "une appli qui cherche des activités", mais "le meilleur compagnon de temps libre au monde", évalué contre la question "est-ce que ça rapproche Dolcia d'un concierge de luxe, d'un GO Club Med, d'un coach personnel ?". Quatre piliers (Explorer magazine premium, Concierge qui décide, Coach avec défis, Animateur GO Club Med), questions émotionnelles jamais techniques, filtres puissants mais invisibles tant que non nécessaires, méthode Apple (une évolution à la fois, vérifiée, testée).
- Constat important : la méthode de travail demandée ("une seule évolution à la fois, vérifier que c'est réellement meilleur, zéro régression, tests complets") est déjà exactement la discipline suivie tout au long de cette session — pas une nouveauté à adopter, une confirmation.
- Premier geste concret dans cet esprit : vérifié que la priorité des questions du D-Coach (qui/énergie/contrainte) était déjà solide, mais leur **formulation** restait fonctionnelle, pas émotionnelle comme demandé. Enrichi avec de vraies tournures ("Tu as envie de rire, ou plutôt de souffler ?", "On fait plaisir aux enfants, ou plutôt un vrai moment à deux ?"), jamais "Quelle catégorie ?" façon menu déroulant.
- 279 tests verts après cet ajout. Le reste de la vision v21 (filtres émotionnels combinables invisibles par défaut, animateur façon GO avec olympiades/karaoké/blind-tests, Concierge qui construit toute une journée) reste à traiter un chantier à la fois, conformément à la méthode demandée elle-même.

## Fermeture du chapitre documentation, ouverture de V21 → L'expérience — 31 juillet 2026

- Décision produit : arrêt des nouveaux documents. Sept documents jugés suffisants
  (`VISION.md`, `CONSTITUTION.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `UX_GUIDELINES.md`,
  `MASTER.md`, `CHANGELOG.md`). Nouvelle règle de travail adoptée : avant de coder, vérifier la
  conformité aux sept documents plutôt que la seule faisabilité technique.
- Premier vrai morceau du moteur de scénarios implémenté, pas seulement documenté :
  `desireScore()` et `surpriseScore()` (ARCHITECTURE.md §5.2-5.3), branchés comme critère
  primaire du tri "recommandé" d'Explorer via `scenarioRank()` (§5.4, ordre lexicographique
  strict : désir, puis surprise, puis expiration, puis distance). Les anciens critères de tri
  (statut géographique, compatibilité horaire, famille préférée) deviennent des repères
  secondaires en cas d'égalité, plutôt que d'être remplacés brutalement.
- Seuls les signaux réellement calculables avec les données existantes ont été implémentés (3
  signaux de désir, 2 de surprise) — les signaux qui demanderaient un historique de propositions
  pas encore suivi (type d'expérience jamais proposé récemment, différent des habitudes
  récentes) restent honnêtement absents plutôt que devinés.
- Vérifié concrètement avant l'écriture des tests : une pépite datée, jamais vécue, légèrement
  hors zone, bat une attraction bien notée mais ordinaire et déjà connue — la loi 6 de la
  Constitution ("le meilleur bat le plus proche") est désormais du code vérifiable, pas
  seulement un principe écrit.
- 284 tests verts après ce premier chantier d'implémentation.

## Le Home reconstruit selon les 3 niveaux — 31 juillet 2026

- Constat avant de coder : le Home vivant depuis des semaines n'était en réalité jamais construit
  selon les 3 niveaux validés dans `ARCHITECTURE.md` §1.1 — une phrase fixe qui ne variait jamais
  ("Vos prochaines émotions commencent ici"), deux boutons, trois puces, et un widget météo
  permanent en dessous. Une vraie page d'accueil marketing, pas la rencontre décrite.
- Reconstruit : Niveau 1 (`homePhrase()`) — une vraie phrase qui varie selon le jour, l'heure et la
  météo réelle, stable pour la journée, jamais un texte figé, sans aucun bouton ni carte. Niveau 2
  (`homeMajor`, déjà existant mais jamais mis en avant) — devient la seule proposition visible,
  avec un vrai repli honnête (`homeNeutralInvite()`) quand aucun grand moment n'est détecté, plutôt
  que l'ancien comportement qui cachait purement et simplement la zone. Niveau 3 — recherche,
  puces de suggestion et événements du jour déplacés après un indice de défilement discret, plus de
  compétition avec le Niveau 1.
- Bug d'insertion repéré et corrigé pendant la construction : le mot-clé `async` de
  `loadHomePulse()` s'était retrouvé mal placé lors d'une édition — détecté immédiatement par
  `node --check`, corrigé avant tout test.
- 289 tests verts après cette reconstruction, avant/après montré visuellement.

## La proposition du Home reçoit une vraie photo — 31 juillet 2026 (suite du même jour)

- Écart trouvé en cherchant à hausser encore le niveau visuel (Flighty/Airbnb) : la carte du
  Niveau 2 était un dégradé plat, sans aucune photo — l'écart le plus visible avec le niveau
  attendu, où l'image porte l'essentiel de l'émotion.
- Corrigé en réutilisant `itemImage()`, déjà construite et déjà testée pour Explorer (photo réelle
  → image de catégorie → générique) : la carte principale du Home affiche désormais une vraie
  image en fond, avec le même dégradé de lisibilité que les cartes Explorer.
- 290 tests verts après cet ajout.

## Le Home redessiné entièrement : d'une carte à une affiche — 31 juillet 2026 (suite du même jour)

- Retour direct, sans détour : "je vois un produit propre... mais encore très web app". La carte
  avec bordure dorée, même avec une photo ajoutée juste avant, restait une fiche d'information, pas
  une invitation. Décision : jeter la carte entièrement plutôt que l'améliorer encore.
- Reconstruit de zéro : `homePosterInner()` fusionne la phrase (Niveau 1) et la proposition
  (Niveau 2) dans une seule image plein écran — le texte flotte directement sur la photo, sans
  cadre, sans bordure, sans fond de carte. Le bouton d'action devient un lien texte minimal avec une
  flèche (`.home-poster-cta`), plus aucun bouton rempli noir ou doré.
- Les artifices décoratifs qui compensaient l'absence de vraie photo (particules montantes, rayon
  de lumière, respiration du fond) sont retirés — devenus inutiles une fois qu'une vraie image porte
  l'émotion. Documenté explicitement dans les tests pour que personne ne les réintroduise en pensant
  réparer un oubli.
- `renderHomeMajor()` met à jour toute l'affiche en place (photo, titre, sous-titre, action) une
  fois les vraies données chargées, au lieu de faire apparaître un composant séparé.
- Deuxième bug d'insertion `async` mal placé pendant cette refonte, à nouveau détecté immédiatement
  par `node --check` avant tout test — la vigilance de la session précédente a payé.
- 289 tests verts après cette reconstruction complète, avant/après montré visuellement.

## Audit éditorial des micro-scénarios, puis vraie intégration — 1er août 2026

- Trois vrais problèmes signalés sur les 90 séquences écrites la veille : mélange tu/vous,
  affirmations non fondées ("vous n'avez pas beaucoup d'énergie", "il fera moins beau demain",
  "ça fait longtemps que vous n'avez pas vraiment ri" — contraires à la règle "Dolcia n'invente
  jamais"), et formulations culpabilisantes ("vous allez regretter", "ne perdez pas celle-ci").
- Vérifié objectivement avant toute correction : 150 occurrences de "vous" dans tout le produit,
  zéro "tu" — la règle de vouvoiement existait déjà, elle n'avait simplement jamais été vérifiée
  sur ce nouveau contenu. Un vrai bug trouvé au passage dans le code déjà en production :
  `homePhrase()` contenait "Tu as un peu de temps aujourd'hui ?", corrigé.
- Audit complet des 90 séquences (`content/micro-scenarios.md`) : 41 retenues après retrait des
  affirmations non fondées et des formulations pressantes, aucune nouvelle phrase écrite. Les
  contextes Fatigue, Envie de rire et Besoin de souffler sont explicitement signalés comme non
  utilisables tant qu'aucune donnée réelle ne permet de connaître cet état — plutôt que de les
  garder branchés sur une supposition.
- Sélection stricte de 20 séquences irréprochables (`content/home-selection-20.md`), sur les 7
  contextes les plus fiables : pluie, soleil, vent, famille connue, couple connu, pépite datée,
  événement unique.
- Intégration réelle dans `app.js` : `pickHomeSequenceContext()` choisit un contexte selon une
  vraie priorité (pépite prouvée > événement unique > météo réelle > groupe connu), jamais une
  supposition — et retourne `null` plutôt qu'un contexte inventé si rien de fiable n'est détecté.
- Règle UX appliquée : la séquence complète (signature → tension → révélation) ne se joue
  qu'une fois par jour (`homeCinemaAlreadyShownToday()`, vérifié par date réelle), avec un bouton
  "Passer" visible immédiatement. Aux ouvertures suivantes du même jour, la révélation s'affiche
  directement avec une transition courte, jamais le spectacle complet rejoué.
- 297 tests verts après cette intégration.

## Tu/vous tranché, pause sur la réflexion produit — 1er août 2026 (suite du même jour)

- Décision produit tranchée, non rediscutée : Dolcia concierge (Home, Explorer, D-Coach) vouvoie ;
  Dolcia Anime tutoie, comme un GO, uniquement dans la voix de l'animateur qui parle en direct
  pendant une session — jamais le texte d'interface générique (partage de session), qui reste au
  registre neutre.
- Converties en tutoiement, grammaticalement, pas par simple remplacement de mot : les 5 fonctions
  qui portent la vraie voix de l'animateur (`animatePersonalTouch`, `animateContinuityGreeting`,
  `animateCoachLine`, `animateStepText`, `animateNudgeLine`).
- Deux résidus de tutoiement trouvés et corrigés au passage dans le contexte concierge, qui ne
  devait jamais tutoyer : un exemple dans `UX_GUIDELINES.md`, et surtout la **vraie consigne
  envoyée au modèle** dans `server/coach-conversation.js` — plus significatif qu'une simple faute
  de documentation, puisque c'est ce texte qui guide directement les réponses réelles du D-Coach.
- Un nouveau test de garde (`tu-vous-split.test.mjs`) verrouille cette séparation pour l'avenir,
  des deux côtés : aucun vouvoiement résiduel dans la voix de l'animateur, aucun tutoiement dans
  les séquences du Home.
- 300 tests verts après ce chantier.
- **Recommandation reçue et actée** : pause sur les nouvelles fonctionnalités et la réflexion
  produit. Une vraie V1 doit maintenant être confrontée à de vrais utilisateurs plutôt que
  d'accumuler d'autres améliorations théoriques. La seule mission de conception qui reste ouverte :
  la qualité d'exécution (animations, fluidité, lumière, transitions, typographie, son) — jamais de
  nouvelle fonctionnalité ni de nouveau texte tant que ce retour utilisateur n'a pas eu lieu.

## Vérification des écrans vides — 1er août 2026 (suite du même jour)

- Passage en revue systématique de tous les états "sans contenu" de l'application (Explorer déjà
  traité précédemment, Agenda, Pass, Notre constellation).
- Agenda et Pass déjà corrects : l'agenda vide propose "Compose-moi mon programme", le Pass sans
  réservation redirige directement vers l'agenda plutôt que d'afficher un écran mort.
- Un vrai manque trouvé : l'état vide de "Notre constellation" avait un message mais aucune action
  — contrairement à tous les autres écrans vides de l'application. Corrigé avec un bouton "Découvrir
  des idées" menant à Explorer.
- 326 tests verts après cette vérification. Passe UX considérée terminée — prochain chantier : les
  fiches détaillées, avant les réservations directes et la qualité des données.

- Recherche systématique des changements d'état encore brutaux dans toute l'application, sans
  s'arrêter entre chaque correction.
- Modales : aucune animation d'ouverture n'existait sur la classe partagée par les 17 fenêtres de
  l'application (fiche détail, partage, budget, cercle, constellation...) — corrigé une seule fois
  à la base, jamais à refaire par fenêtre.
- Pression des boutons : seulement 2 états `:active` existaient sur tout le produit. Une règle
  globale ajoute un léger retrait tactile à chaque bouton, sans écraser les règles plus précises
  déjà posées ailleurs.
- Même incohérence que les filtres retrouvée à plusieurs autres endroits jamais couverts : les
  réactions de souvenir, l'échelle de ressenti, les tags, les préférences avant/après expérience et
  la notation en étoiles changeaient tous d'état instantanément. Corrigés ensemble, comme un seul
  chantier cohérent plutôt que des correctifs isolés.
- Les boutons de choix du composer transitionnaient déjà leur position au survol, mais pas la
  couleur de bordure — complété pour que les deux bougent ensemble.
- 323 tests verts après cette passe.

## Moteur de comportements d'animateur, sur des signaux réels uniquement — 1er août 2026 (suite du même jour)

- Proposition reçue : séparer le jeu (les 20 expériences) du comportement de l'animateur, pour
  multiplier la variété sans écrire des centaines de scripts.
- Réserve posée avant construction, avec preuve à l'appui : la moitié des comportements proposés
  ("sentir un malaise", "remarquer qu'un enfant décroche") supposaient une perception que Dolcia
  n'a jamais eue. Vérifié concrètement : `session.laughs` n'existe que parce qu'une personne tape
  explicitement sur "on rigole" — aucune détection audio ou visuelle réelle derrière. Construire ces
  comportements tels quels aurait fait affirmer à Dolcia une observation fictive.
- `ANIMATOR_BEHAVIORS` construit uniquement sur des signaux déjà réellement suivis dans le code :
  temps réellement écoulé sans interaction, fin de session réelle, scores d'équipe réels. Chaque
  comportement a plusieurs formulations tu-voice, tirées au hasard — la clôture par équipes, testée
  concrètement, varie désormais réellement d'une session à l'autre au lieu d'une phrase unique.
- Deux fautes de vouvoiement repérées et corrigées dans mes propres premières variantes avant
  livraison — la règle tu/vous déjà établie pour Dolcia Anime a directement servi de garde-fou.
- 367 tests verts après ce chantier.

- Audit factuel avant toute écriture : 6 programmes réellement jouables existaient (Cardio doux,
  Grand défi complice, Table des jeux cultes, Aventure des petits explorateurs, Piscine terrain de
  jeu, Parenthèse calme) — confirmé en lisant `DOLCIA_ANIMATE_PROGRAMS` directement, pas supposé.
- 14 nouvelles expériences écrites pour couvrir les 10 catégories demandées : renforcement (sport),
  deux formats d'olympiades par équipes, une chasse aux trésors familiale, deux formats pour
  couple, un grand jeu aquatique, un blind test et un quiz éclair, deux formats de danse libre, un
  moment cocooning, et deux formats de soirée.
- Contraintes déjà établies respectées sur l'ensemble : jamais de vainqueur ni de perdant désigné
  (un mot "vainqueur" glissé par erreur dans le quiz éclair, détecté par le test existant, corrigé
  avant livraison) ; le blind test repose sur les chansons apportées par les participants
  eux-mêmes, jamais un morceau fourni par Dolcia (aucun risque de droit d'auteur) ; le quiz éclair
  repose sur des questions préparées par le groupe, jamais un fait affirmé par Dolcia elle-même
  (aucune invention factuelle) ; le nouveau jeu aquatique reprend exactement le même rappel de
  sécurité que le programme piscine existant.
- Toute nouvelle expérience apparaît automatiquement dans le sélecteur Dolcia Anime — la liste se
  génère depuis `Object.entries(DOLCIA_ANIMATE_PROGRAMS)`, aucun code d'affichage à dupliquer.
  Vérifié que la grille de sélection gère déjà le défilement pour 20 choix sans casser la mise en
  page.
- 361 tests verts après cette bibliothèque.

- Nuance actée : "pause sur les nouvelles idées", pas "pause sur les fonctionnalités" — l'exécution
  (Home, Explorer, Coach, transitions, photos, animations, micro-interactions) reste un chantier
  actif. Nouvelle question de référence pour toute évolution désormais : "est-ce déjà digne
  d'Apple/Flighty/Airbnb/Notion Calendar ?", plus "qu'est-ce qu'on pourrait ajouter ?".
- Appliqué concrètement, pas seulement en principe : recherche des interactions visibles utilisant
  un easing CSS générique (`ease`) plutôt que la vraie courbe signature du produit
  (`cubic-bezier(.16,1,.3,1)`, déjà documentée dans `UX_GUIDELINES.md`). Deux trouvées et
  corrigées : les cartes de récupération zero-result-cascade (`recovery-option`, réellement
  utilisées) et la barre d'équipes Belambra Games (`animate-teams`). Une troisième détectée
  (`future-card`) laissée telle quelle après vérification : elle appartient à
  `mountThreeFuturesLegacy()`, du code retiré et jamais appelé, pas une vraie régression.
- Nouveau test de garde pour empêcher ce type d'incohérence de redériver silencieusement.
- 302 tests verts après ce premier passage.

## Deux previews A/B de la navigation sur le Home — 1er août 2026 (suite du même jour)

- Précision reçue après vérification : la barre concernée n'était pas celle ajoutée par Codex dans
  `home-level3`, mais la navigation permanente de toute l'application (`Explorer / Mon moment /
  Moi`), en position fixe, présente sur chaque écran y compris pendant l'affiche émotionnelle.
- Deux versions construites dans le même code, activables par `?homePreview=A` ou
  `?homePreview=B`, sans changer le comportement par défaut : version A, la barre reste
  entièrement absente tout le temps qu'on est sur le Home ; version B, elle reste absente sur le
  premier écran puis apparaît en douceur une fois qu'on défile au-delà de l'affiche.
- Le moteur et les parcours restent strictement identiques dans les deux cas — seul `shell()`/
  `home()` gèrent l'affichage de la barre. Les classes de preview ne persistent jamais en quittant
  le Home vers un autre écran, vérifié.
- 380 tests verts après ce chantier. Aucun merge ni déploiement production, comme demandé —
  les deux versions restent à comparer avant toute décision.

## Parcours Dolcia Anime : la découvrabilité du bouton Commencer — 1er août 2026 (suite du même jour)

- Régression réelle confirmée dans le code, pas seulement ressentie : cliquer sur un programme
  injectait l'aperçu (étapes, case de sécurité, bouton Commencer) dans une zone placée après toute
  la grille des 20 choix. Rien ne semblait se passer au clic — convention universelle cassée
  (cliquer doit produire un changement visible immédiat).
- Corrigé sans toucher au contenu des programmes, comme demandé : l'aperçu défile désormais
  automatiquement à l'écran dès qu'un programme est choisi, et le bouton "Commencer avec la voix"
  ainsi que la confirmation de sécurité apparaissent en premier dans l'aperçu — avant la liste
  détaillée des étapes, plus après.
- La case de sécurité reste une vraie case à cocher qui bloque effectivement le démarrage
  (`ensureAnimateSafety()` inchangé dans sa logique) — seul le ton a changé, de "J'ai vérifié le
  lieu, les règles et la sécurité du groupe" à "On a choisi un endroit sûr, tout le monde est
  prêt." La garantie de sécurité n'a pas été retirée, seulement reformulée.
- 383 tests verts après ce correctif.

## Trois blocages audio et personnalité, adressés directement — 1er août 2026 (suite du même jour)

- Retour très ferme reçu : musique inutilisable (ni baisse ni coupure perçue), voix de D couverte,
  textes ressemblant à un manuel plutôt qu'à un animateur.
- Vérifié techniquement avant de conclure à un bug : toutes les vraies prises de parole pendant une
  session passent bien par l'atténuation déjà construite — aucun contournement trouvé. Cause
  probable identifiée : la voix ne fixe jamais explicitement son propre volume (elle part au
  maximum du navigateur), rendant une atténuation à 0,12 insuffisante face à une voix déjà forte.
- Atténuation renforcée à 0,04 (quasi inaudible pendant que D parle, plus une simple baisse).
- Ajout d'un vrai curseur de volume pour la musique, indépendant de la voix, visible en permanence
  pendant la session et mémorisé — au-delà du simple interrupteur muet/pas muet construit
  précédemment.
- Personnalité : le programme "Cardio doux entre nous" entièrement réécrit avec un ton d'animateur
  réel (enthousiasme, encouragement, silences) plutôt qu'une description clinique, sur l'exemple
  exact donné. **Honnêteté sur la limite réelle** : ce chantier ne couvre qu'un programme sur 20 —
  les 19 autres ont encore leurs textes d'origine et nécessitent la même réécriture, un vrai
  chantier de contenu à part, pas terminé aujourd'hui.
- 387 tests verts après ces corrections.

## Audio consolidé en un seul contrôle, bug de ducking corrigé — 1er août 2026 (suite du même jour)

- Retour très précis et vérifié dans le vrai code par la personne : volume par défaut à 85% trop
  fort ; bug réel dans l'atténuation (elle pouvait remonter un volume que la personne avait
  volontairement mis à 0, avant de le redescendre) ; trois contrôles sonores concurrents (Hymne,
  Pouls, Musique) répartis à deux endroits différents de l'écran, aucun garanti visible sans
  défiler.
- Volume par défaut ramené à 20%. Atténuation corrigée avec `Math.min(volumeActuel, .04)` — ne
  remonte jamais un volume choisi plus bas, vérifié avec le scénario exact demandé (musique →
  curseur à 0 → mute → D parle → fin → toujours coupée).
- Les trois contrôles regroupés en un seul bloc (`.animate-sound-control`), placé dans l'en-tête de
  session désormais fixé (`position:sticky`) pour rester visible même si le contenu défile. Couper
  le son coupe la musique et le pouls ensemble, jamais la voix de D.
- Trois formulations désignant indirectement un gagnant retirées ("titre gagnant", "meilleure
  invention", "meilleure histoire") — remplacées par des formulations qui célèbrent collectivement,
  sans classement.
- Deux programmes de plus réécrits avec le ton animateur (renforcement, famille) — après le
  programme sport déjà réécrit précédemment. **Honnêteté sur la limite réelle : 17 programmes sur
  20 restent avec leur texte d'origine.** Ce chantier de contenu reste loin d'être terminé.
- 394 tests verts après ces corrections, dont un test simulant le scénario exact demandé avant
  toute écriture de test formel.

## Les 20 programmes Dolcia Anime entièrement réécrits avec le ton animateur — 1er août 2026 (suite du même jour)

- Poursuite du chantier éditorial laissé explicitement inachevé la fois précédente (3 programmes
  sur 20) : les 17 programmes restants ont été réécrits avec le même ton animateur (exclamations,
  encouragement, présence) — même contenu, même sécurité, même honnêteté, ton différent.
- Deux vrais glissements trouvés et corrigés pendant la vérification, pas après coup : un "toi" en
  tutoiement s'était glissé dans le texte d'une étape (`defi_deux`), alors que le tutoiement reste
  réservé à la voix de l'animateur elle-même, jamais au contenu des programmes.
- Deux faux positifs identifiés dans mes propres tests de garde, corrigés sans toucher au texte
  réel : "êtes" (vouvoiement légitime) faussement détecté comme "tes" isolé à cause d'un accent que
  la limite de mot ne gère pas ; "jamais un perdant désigné" faussement détecté comme une
  désignation de perdant, alors que c'est exactement la formulation qui la refuse.
- Les 20 programmes sont désormais tous réécrits — plus aucune fiche technique clinique
  ("Échauffement — mobilisez…") ne subsiste dans la bibliothèque.
- 398 tests verts après cette réécriture complète.
- **Ce qui reste à valider, hors de portée ici** : la consolidation du contrôle sonore en un seul
  bloc reste à tester réellement sur téléphone et ordinateur, comme demandé — ça ne peut se
  vérifier que dans une vraie Preview, pas dans le code seul.

## Consolidation Vercel — 5 sources événementielles routées, api/ passe de 11 à 6 fichiers — 1er août 2026 (suite du même jour)

- Consolidation strictement technique, comme demandé : aucun algorithme de recherche, de
  recommandation ou d'ingestion modifié, aucun test métier retouché — seuls des chemins de fichiers
  ont changé.
- Vérifié avant toute chose : la base réelle avait 11 fichiers dans `/api` (pas 14 comme dans une
  autre session), donc déjà sous la limite de 12 du plan Hobby. Consolidé quand même, en prévention,
  puisque la marge restante n'était que d'une seule fonction.
- Cinq fichiers déplacés de `/api` vers `/server` (`touquet-events.js`, `datatourisme.js`,
  `major-events.js`, `partner-events.js`, `ticketmaster-events.js`), routés depuis `api/events.js`
  via `?service=touquet|datatourisme|major-events|partner-events|ticketmaster` — exactement le même
  motif déjà en place pour `recommendations`/`flash-offers`/`coach`/etc.
- Les 8 appels correspondants dans `app.js` mis à jour vers `/api/events?service=...`.
- Trois tests corrigés (chemins d'import seulement, jamais leurs assertions) après le déplacement.
- 406 tests verts après cette consolidation — exactement le même compte qu'avant, confirmant
  qu'aucun test n'a été perdu ni affaibli.
- `api/` passe de 11 à 6 fichiers — marge confortable avant la limite de 12 du plan Hobby.

## Priorité 1 exécutée : DATAtourisme, extraction de contact rendue robuste — 1er août 2026 (suite du même jour)

- Recherche réelle effectuée sur un script en production (github.com/cquest/datatourisme) traitant
  de vraies données DATAtourisme : révèle que le JSON-LD brut préfixe ses propriétés
  (schema:telephone, foaf:homepage, schema:email) et enveloppe ses valeurs dans {'@value': ...} —
  une forme différente de celle initialement codée.
- Extraction rendue robuste aux deux conventions (simple et préfixée/@value), plutôt que de
  parier sur une seule sans certitude sur la forme exacte renvoyée par l'API REST en production.
- Testé concrètement avec les deux formes avant toute déclaration de succès.
- Horaires et tarifs restent volontairement inactifs — aucun nom de champ n'a pu être vérifié
  avec une certitude suffisante pour risquer de casser la requête existante en ajoutant un
  paramètre `fields` qui remplacerait toute la sélection par défaut.
- 410 tests verts (406 avant ce chantier, +4 sur cette session DATAtourisme : contact simple,
  double convention, absence honnête, horaires/tarifs inactifs).

## Priorité 2 : premier connecteur généralisable, deux territoires réels — 1er août 2026 (suite du même jour)

- Comparaison réelle Le Touquet / Chartres effectuée avant tout code : formats de date différents,
  présence de lieu variable, structures de page totalement différentes — confirme la nécessité de
  séparer extraction (par source) et normalisation (commune).
- `server/festival-model.js` créé : la couche 2, commune à toute source. `normalizeOccurrence()`
  échoue visiblement (exception) si un champ obligatoire manque ou si une date n'est pas au format
  ISO — jamais une donnée devinée pour combler le vide. Chaque champ (lieu, tarif, âge, horaire)
  porte son propre statut vérifié/non vérifié/absent, jamais un seul booléen global.
  `dedupeOccurrences()` fusionne les doublons entre sources en gardant la version la plus vérifiée.
- **Trouvaille importante en cours de route** : `chartrestivales.com` interdit explicitement
  l'accès automatisé (robots.txt). Aucun scraper live construit pour ce site — les occurrences de
  `server/chartres-events.js` viennent d'une vérification manuelle par recherche, exactement
  documentée comme telle dans le code, jamais présentée comme une extraction automatique qu'elle
  n'est pas.
- `server/touquet-events.js` refactorisé : le programme du Festival des Tout-Petits est maintenant
  exporté au niveau du module et passe aussi, intégralement, par le modèle commun
  (`normalizeTouquetFestivalWithSharedModel`) — la preuve que les deux cas réels (Touquet,
  Chartres) utilisent le même modèle, sans dupliquer les données existantes.
- **Critère de réussite explicite vérifié** : 410 tests avant ce chantier, toujours 410 après le
  refactoring de Touquet (aucune régression), +7 nouveaux tests sur l'architecture à deux couches
  — 417 au total.

## Intégration DATAtourisme approfondie — occurrences multiples, description, PMR — 1er août 2026 (suite du même jour)

**Découverte majeure, vérifiée sur la documentation officielle de l'ontologie** : `takesPlaceAt`
pointe vers un type `Period`, avec une sous-classe explicite `RecurrentPeriod` distincte de
`LimitedPeriod`. Notre `normalize()` précédent ne faisait aucune différence entre les deux et ne
prenait que la première date trouvée n'importe où dans l'objet — perdant potentiellement le même
type de programmation multi-dates qu'on a dû reconstruire à la main pour Le Touquet et Chartres.

- `extractOccurrences()` ajoutée : gère `takesPlaceAt` en objet unique OU en tableau, produit une
  occurrence par entrée réelle, jamais écrasées en une seule date. Distingue les périodes
  récurrentes (avec jours de semaine et bornes réelles) des périodes simples — sans jamais
  expanser une récurrence en dates individuelles devinées.
- `description` (hasDescription.shortDescription) désormais extraite.
- `reducedMobilityAccess` (PMR) désormais lue quand disponible — en sachant, d'après une vraie
  discussion du forum DATAtourisme, que ce champ arrive parfois vide spécifiquement pour les
  données issues d'Apidae. On continue de le lire pour les producteurs qui le fournissent
  correctement, sans renoncer par anticipation.
- Recherche complémentaire menée sur une éventuelle relation parent/enfant native dans l'ontologie
  (type `subEvent`/`hasProgram`) : **aucune preuve trouvée, ni confirmée ni infirmée** — recherche
  documentaire seule, sans accès à de vraies données pour vérifier au-delà.
- Testé avec quatre structures réalistes (occurrence unique, plusieurs occurrences explicites,
  période récurrente, absence totale de date) avant toute déclaration de succès.
- 422 tests verts (417 avant ce chantier, +5 nouveaux).
- **Non fait, comme demandé explicitement** : aucun test sur un troisième territoire à système
  producteur différent (nécessiterait un vrai accès API en direct, indisponible ici) ; aucune
  activation du paramètre `fields` pour les horaires/tarifs (toujours non vérifié avec certitude
  suffisante).

## Script de diagnostic DATAtourisme — le test de vérité, à exécuter côté Vercel — 1er août 2026 (suite du même jour)

- `scripts/datatourisme-truth-test.mjs` créé : interroge la vraie API DATAtourisme sur 5
  territoires réels et différents (Le Touquet, Chartres, Annecy, Angoulême, Strasbourg), conserve
  chaque réponse brute, la compare champ par champ avec la sortie de `normalize()`.
- **Ne peut pas être exécuté depuis l'environnement de développement de Claude** : ni
  `DATATOURISME_KEY` ni l'accès réseau à `api.datatourisme.fr` n'y sont disponibles. Écrit pour
  tourner là où les deux existent réellement (Vercel, ou en local avec la variable positionnée).
- La clé n'est jamais écrite dans le fichier de résultat produit.
- Logique de comparaison testée isolément avec des données simulées avant livraison — fonctionne
  correctement, en attente d'une vraie exécution avec accès réseau réel.
# v21.48.0 — Calendrier exact & cercle réellement présent

- Le parcours principal demande désormais les dates et heures exactes de début et de fin avant toute recommandation.
- Les rendez-vous datés (événement unique, concert, spectacle, finale, éclipse et pépite locale) sont recherchés sur le créneau réellement choisi.
- Après « En famille » ou « Entre amis », Dolcia demande les profils réellement présents et croise leurs sensibilités.
- Le retour à « Pour moi » désélectionne explicitement tout ancien groupe.
- Les proches durables et les invités temporaires sont séparés ; un groupe temporaire reçoit un code/lien et expire réellement à la fin du séjour.
- Le résumé du programme affiche le créneau complet et les prénoms des personnes présentes.
- 452 contrôles passent, dont 6 nouveaux garde-fous dédiés au calendrier et au cercle.
# v21.49.0 — D Coach-animateur & agenda premium

- Le Home donne un accès explicite à « Mon coach-animateur ».
- D apparaît en grand et discute avec le groupe avant la séance : énergie, ressort ludique et style d’animation.
- Les séances « Cardio Club avec D » et « Challenge Tonique de D » deviennent de vraies séances sportives structurées, concrètes et ludiques.
- D conduit la séance en direct, parle, chronomètre, encourage, propose des variantes et s’adapte aux réactions explicites.
- Un arrêt immédiat « Douleur / on arrête » suspend la séance et donne une consigne de sécurité adaptée.
- Le premier filtre contient désormais un agenda mensuel premium avec arrivée, départ, plage de séjour, jours, nuits et heures exactes.
- Les cartes et fiches indiquent la durée ainsi que sa provenance : source confirmée, programme D ou estimation Dolcia.
- 457 contrôles passent sans échec.

## Correction de deux régressions fonctionnelles réelles, signalées directement — 1er août 2026

**1. Identification du groupe rendue obligatoire sans échappatoire.** Choisir "En famille" ou
"Entre amis" forçait systématiquement un écran de sélection des personnes présentes une par une,
sans aucun raccourci. Corrigé : un bouton "Recherche rapide" permet de continuer avec seulement le
contexte général (famille, amis...) sans identifier qui que ce soit — le moteur de recommandation
utilise encore `context.who` pour adapter les catégories, mais aucun profil individuel n'est exigé.

**2. Ajout à l'agenda instantané et silencieux, sans aucun choix.** `addAgenda` poussait
directement l'activité dans l'agenda avec une date calculée en silence à partir du tout premier
jour du séjour — aucune fenêtre, aucun moyen de choisir le jour (pour un séjour multi-jours),
l'heure, ou la durée avant de valider. Corrigé : une fenêtre de confirmation s'ouvre désormais,
avec un sélecteur de jour (si le séjour dure plusieurs jours), un champ heure, et une durée
modifiables avant de valider. Une activité à date et heure réellement confirmées par la source
(un concert, un événement daté) reste affichée comme non modifiable — jamais glissée dans un champ
éditable qui laisserait croire qu'on peut changer l'heure d'un événement fixé par son organisateur.

- 469 tests avant ce correctif, un test légitimement adapté à la nouvelle structure en deux étapes
  (`addAgenda` ouvre désormais une fenêtre plutôt que d'ajouter directement), 6 nouveaux tests de
  garde sur les deux corrections — 475 au total, tous verts.
- Style minimal ajouté pour les deux nouveaux éléments d'interface, cohérent avec la palette
  existante (`--lime`, `--muted`, `--line`) — aucun autre écran, animation, ou composant visuel
  touché.

## Deux problèmes réels de fiabilité, signalés directement, corrigés — 1er août 2026

**1. Un commerce payant étiqueté comme gratuit.** "Club de plage - Caddy Sports Le Touquet" était
marqué comme accès libre uniquement parce que son nom contient "plage" — aucune vérification
n'excluait les clubs, écoles ou locations commerciales. Corrigé : la détection de gratuité exclut
désormais explicitement club/location/école/cours/activités nautiques/sport, tout en conservant
la vraie plage publique et les autres espaces réellement gratuits (testé avec 7 cas, y compris
les cas limites qui doivent rester gratuits).

**2. Le marché couvert du Touquet proposé un jour où il n'existe pas.** Vérifié par recherche
réelle, sources concordantes (ville du Touquet, Petit Futé, guides locaux) : le marché n'ouvre que
les lundi, jeudi et samedi — jamais les autres jours. Corrigé avec la même méthode que pour les
festivals : un repère nommé et vérifié (`KNOWN_MARKET_DAYS`), jamais une règle générale inventée
pour tous les marchés de France. Testé avec la vraie date d'aujourd'hui (mardi) : le marché
redevient correctement incompatible.

- 475 tests avant ce chantier, 4 nouveaux tests de garde — 479 au total, tous verts.

## Séjour multi-jours enrichi et question logement ajoutée — signalé directement via capture d'écran — 1er août 2026

**Problème confirmé exactement comme décrit** : "Composez mon séjour" sur 2 jours ne proposait que
2 créneaux au total ("Jour 1 · Expérience phare", "Jour 2 · Expérience phare") — aucun déjeuner,
aucun dîner visible dans la capture fournie, aucune structure horaire.

**Corrigé** : chaque jour d'un séjour propose désormais 4 créneaux horodatés (09:30 début de
journée, 12:30 déjeuner, 15:00 après-midi, 19:30 dîner ou soirée) au lieu de 2 sans horaire. La
logique de budget repas (gastronomique/léger/économique/livraison), qui existait déjà mais ne
pouvait jamais se déclencher faute de créneau déjeuner, s'applique désormais aussi au déjeuner —
pas seulement au dîner.

**Question manquante ajoutée** : aucune question ne demandait si la personne avait déjà un
logement (résidence secondaire, location déjà prise) avant de chercher un hôtel. Un écran dédié
("Avez-vous déjà un logement pour ce séjour ?") s'affiche désormais pour tout séjour de plusieurs
jours, détecté automatiquement ou choisi explicitement — répondre "j'ai déjà où loger" retire
proprement le créneau hébergement du programme, jamais un hôtel proposé quand même.

- 479 tests avant ce chantier, 5 nouveaux tests de garde — 484 au total, tous verts.
- Aucune option "pique-nique" dédiée n'a été ajoutée — la logique "compenser par un plaisir moins
  cher" existante couvre le petit budget au déjeuner, mais une vraie suggestion pique-nique
  (associer un commerce alimentaire à un espace pour le consommer) reste un chantier distinct, non
  traité ici.

## Première notification proactive fondée sur les goûts appris — promesse du Product Book — 1er août 2026

Le Book promet : *"Dolcia pourra signaler qu'un événement correspondant à ses goûts commence
bientôt."* Vérifié absent du code avant ce chantier — seul le PUSH commercial partenaire existait,
jamais une anticipation personnelle fondée sur l'historique réel de la personne.

**Implémenté, sans nouvel appel réseau significatif** : la fenêtre de récupération des événements
ticketmaster du Home passe de "aujourd'hui seulement" à "aujourd'hui + 3 jours" — les mêmes
données déjà chargées pour le pouls du jour servent aussi à cette détection. Un événement à venir
(jamais aujourd'hui même, ce serait redondant avec le pouls du jour) est signalé uniquement si sa
catégorie correspond à un goût réellement appris (`state.tasteProfile[category]>=3`) — un seuil
volontairement élevé, jamais un simple like isolé qui donnerait une fausse impression de
personnalisation.

Testé concrètement avant livraison : un concert (catégorie apprise, score 4) remonte ; une
dégustation (catégorie sous le seuil, score 1) reste invisible ; sans aucun historique, rien ne
s'affiche jamais — jamais une anticipation fabriquée pour combler un vide.

- 484 tests avant ce chantier, 4 nouveaux tests de garde — 488 au total, tous verts.
- **Non fait, à dire clairement** : la musique signature Dolcia et les systèmes de
  réservation/paiement/navettes restent des chantiers distincts, non commencés — cohérent avec la
  roadmap du Book lui-même, qui les place après la consolidation du cœur du produit.

## Split familial (enfants / adultes) puis réunion — deuxième promesse du Book — 1er août 2026

Le Book promet : *"proposer une activité commune, puis momentanément deux expériences
différentes — par exemple une activité pour les enfants pendant que les parents profitent d'un
moment à deux — avant de réunir de nouveau tout le monde."* Vérifié absent avant ce chantier —
zéro occurrence dans tout le code.

**Implémenté avec la même prudence que le reste** : la détection exige qu'existent réellement,
dans le pool déjà chargé, une activité adaptée aux enfants ET une activité adaptée aux adultes,
compatibles avec le même créneau — jamais proposé si l'une des deux manque. Le groupe doit
également compter un enfant et un adulte réels (`kind==='child'`), jamais deviné depuis un simple
nombre de personnes. Présenté comme un vrai choix (« Séparer ce moment » / « Rester tous
ensemble »), jamais automatique — refuser une fois est mémorisé par créneau pour ne pas reposer
indéfiniment la même question.

Testé concrètement avant livraison : un groupe sans enfant ne déclenche jamais rien ; un groupe
avec enfants mais sans les deux candidats réels ne déclenche rien non plus.

- 488 tests avant ce chantier, 4 nouveaux tests de garde — 492 au total, tous verts.
- **Reste non commencé** : la carte interactive montrée dans les maquettes du Book (bouton "Voir
  la carte") — chantier distinct nécessitant une bibliothèque de cartographie, non traité ici.

## Détection réelle de conflit d'horaires dans l'agenda — priorité identifiée de longue date — 1er août 2026

Promesse du Book, priorité 3 identifiée très tôt dans le développement puis jamais traitée après
plusieurs détours (DATAtourisme, connecteurs, distance/pépites) : *"Un restaurant peut être
excellent mais incompatible avec l'horaire d'un spectacle."*

**Vérifié avant de coder** : `agendaTravelConnector` existait déjà et affichait un temps de trajet
estimé entre deux activités consécutives — mais ne vérifiait jamais si ce trajet tenait
réellement dans le temps disponible compte tenu de la durée de l'activité précédente.

**Corrigé** : le temps réellement disponible (écart entre les deux horaires, moins la durée de
l'activité précédente) est maintenant comparé au trajet estimé. Un enchaînement impossible est
signalé visuellement comme un vrai conflit (bordure et texte distincts), jamais présenté comme un
trajet normal.

Testé avec le cas exact du Book (un déjeuner qui empiète sur l'horaire suivant) et un cas normal
avec largement le temps nécessaire, pour confirmer qu'aucune fausse alerte ne se déclenche.

- 492 tests avant ce chantier, 4 nouveaux tests de garde — 496 au total, tous verts.

## Trois derniers chantiers codables du Product Book — 1er août 2026

**1. Progression du coach entre plusieurs séances.** `state.animateHistory` existait déjà et
sauvegardait chaque séance, mais n'était jamais relu pour le coach spécifiquement. Un résumé réel
(nombre de séances, dernière séance, taux de complétion) s'affiche désormais à l'ouverture du mode
Coach sportif — fondé exclusivement sur l'historique réel, jamais un score de forme inventé, et
les jeux/animations n'y sont jamais mélangés.

**2. Fraîcheur de vérification affichée à l'utilisateur.** Google Places avait déjà cet affichage
(`officialSource`/`officialCheckedAt`) ; DATAtourisme avait la donnée équivalente
(`contactOrigin`/`contactVerifiedAt`, ajoutée plus tôt cette session) mais ne l'affichait jamais.
Corrigé avec le même motif visuel pour les deux sources.

**3. Carte interactive.** Leaflet (bibliothèque open-source, tuiles OpenStreetMap, aucune clé
API requise) chargée via CDN avec les empreintes d'intégrité vérifiées sur la documentation
officielle. Un bouton bascule entre liste et carte dans Explorer. Seuls les lieux avec de vraies
coordonnées reçoivent un marqueur. Si Leaflet ne se charge pas, un message honnête l'indique plutôt
qu'un échec silencieux ou des marqueurs simulés.

**Limite honnête à signaler** : je ne peux pas faire tourner un vrai navigateur depuis mon
environnement de développement — la carte n'a donc pas pu être vérifiée visuellement, seulement sa
structure de code, sa syntaxe et sa logique (marqueurs, bascule, repli en cas d'échec de
chargement). Une vraie vérification visuelle sur un navigateur ou un téléphone réel reste
nécessaire avant de considérer ce chantier pleinement terminé.

**Ce qui reste volontairement non fait, comme annoncé** : musique signature Dolcia (nécessite un
vrai travail créatif audio) et réservation/paiement/navettes (le Book lui-même exige des contrats
et garanties avant toute implémentation — en fabriquer une version qui a l'air de fonctionner sans
backend réel serait exactement le genre de chose inventée que ce projet interdit).

- 496 tests avant ce chantier (après le conflit d'horaires), 9 nouveaux tests de garde répartis
  sur les trois sujets — 505 au total, tous verts.

## Deux bugs de catégorisation par collision de sous-chaîne, et structuration par moment de la journée — signalés par capture d'écran — 1er août 2026

**Bug confirmé et corrigé** : "Aire de jeux espace Canche" apparaissait sous le filtre "Bien-être"
en contexte "en amoureux". Cause exacte trouvée : le mot français "espace" contient littéralement
la sous-chaîne "spa", et la règle de catégorisation n'avait aucune limite de mot
(`/spa|beauty|yoga|bien/`). Corrigé avec des limites de mot (`\bspa\b`, `\bart\b`, `\bbar\b`,
`\bbien\b`) — trois autres collisions réelles trouvées et corrigées au passage : "artisan",
"départ", "quartier" (via "art"), "barbecue", "embarquement", "barrière" (via "bar"), "combien"
(via "bien").

**Deuxième bug confirmé et corrigé** : "je veux un parc d'attractions, je ne trouve absolument
rien" — un parc d'attractions contient le mot "parc" et tombait donc automatiquement dans
"Nature & mer" à cause de la même règle générique, jamais dans "Fun & famille" où on penserait
naturellement à chercher. Une vérification spécifique (parc d'attractions, aquatique, animalier,
accrobranche, karting, etc.) est désormais faite avant la règle générique nature.

**Structuration par moment de la journée, nouvelle option** : répond directement à "je veux une
activité le matin, un déjeuner à proximité, une activité l'après-midi, un dîner le soir — je suis
perdu dans les méandres de l'appli." Un nouveau tri "Par moment de la journée" regroupe les
résultats en sections (Le matin, Pour manger, L'après-midi, Le soir), chaque activité n'apparaissant
qu'une seule fois. Les restaurants restent volontairement dans leur propre section neutre — rien
dans les données ne permet de savoir si un restaurant donné est plutôt un lieu de midi ou de soir,
donc Dolcia ne le devine jamais.

- 505 tests avant ce chantier, 8 nouveaux tests de garde répartis sur les trois sujets — 513 au
  total, tous verts.

## Héro de l'écran de résultats réduit — signalé par capture d'écran — 1er août 2026

Signalé directement : après le dialogue Eclat (qui a déjà posé toutes les questions — date,
groupe, durée, envie, budget), l'écran de résultats affichait encore un héro occupant tout
l'écran (620px desktop, jusqu'à 760px mobile) avant la moindre idée réelle — obligeant à défiler
pour voir "14 idées compatibles" et le contenu utile en dessous.

**Corrigé, précisément ciblé** : seul `.explore-signature.result-signature` — utilisé
exclusivement sur cet écran précis, vérifié avant de toucher au CSS — voit sa hauteur réduite
(340px desktop, 400px mobile). L'écran d'accueil général d'Explorer (avant toute qualification),
qui garde un rôle d'invitation différent, n'est pas concerné par ce changement.

**Limite honnête à signaler à nouveau** : je ne peux pas voir le rendu réel dans un navigateur
depuis mon environnement. Ce correctif est structurellement correct et ciblé au bon sélecteur,
mais une vraie vérification visuelle sur téléphone reste nécessaire pour confirmer que
l'équilibre (image, texte, espacement) reste beau à cette nouvelle hauteur, pas seulement plus
court.

- 513 tests avant ce chantier, 2 nouveaux tests structurels — 515 au total, tous verts.

## Blocage réel du bouton "Ajouter à mon agenda" pour les programmes Dolcia Anime — bug critique corrigé — 1er août 2026

Signalé directement, avec capture d'écran à l'appui : cliquer sur "Ajouter à mon agenda" pour un
programme Dolcia Anime autonome ("Le Touquet en défis avec D") ne faisait absolument rien.

**Cause exacte trouvée** : `momentCompatibility()` ne reconnaissait que deux cas — un événement
daté, ou un lieu Google Places. Un programme Dolcia autonome (`source: 'Programme Dolcia'`, sans
date, entièrement piloté par D elle-même) tombait directement sur `'unknown'`. `addAgenda()`
abandonnait alors silencieusement avec un simple toast ("Dolcia doit encore confirmer l'horaire
avant l'ajout") — facilement manqué, laissant l'impression que le bouton ne répond à rien.

**Corrigé** : les programmes autonomes (`item.autonomousProgram`, déjà utilisé ailleurs dans le
code pour `isTimeCompatible`) sont désormais reconnus comme compatibles avant même la vérification
Google Places — cohérent avec le fait qu'ils n'ont jamais eu besoin de vérification d'horaire
externe.

Testé concrètement avec le cas exact signalé avant de conclure à la correction.

- 515 tests avant ce chantier, 2 nouveaux tests de garde — 517 au total, tous verts.

## D introuvable sur le Home — badge décoratif rendu enfin cliquable — 1er août 2026

Signalé directement : "où est D ??? Impossible de dialoguer avec lui." Vérifié précisément dans
le code — D existe et fonctionne correctement partout ailleurs (dialogue Eclat, coach, animation,
décisions de programme), mais sur l'écran d'accueil, il n'était qu'un badge décoratif "D✦" sans
aucun gestionnaire de clic. Seul le champ de texte adjacent (au focus) ouvrait le dialogue —
toucher directement le badge D, le geste le plus naturel, ne faisait rien.

**Corrigé** : le badge devient un vrai bouton, et utilise désormais le personnage animé complet
(`dMascotMark`) déjà utilisé partout ailleurs dans l'application, plutôt qu'un badge minimal
propre au Home — pour que D soit visuellement reconnaissable comme le même personnage, dès le
premier écran.

- 517 tests avant ce chantier, 2 nouveaux tests de garde — 519 au total, tous verts.

## Découverte guidée par D rendue autonome — "on ne me le propose pas" — 1er août 2026

Signalé directement. Deux points vérifiés séparément :

**La séance de sport avec D existe déjà** et reste accessible depuis le Home ("Mon
coach-animateur") — confirmé dans le code, aucun changement nécessaire ici.

**La visite/balade guidée par D, en revanche, n'existait qu'indirectement.** La seule expérience
de ce type (« L'exploration locale avec D », trois concepts réels ancrés sur un vrai lieu proche)
n'apparaissait que si la personne avait déjà choisi le budget « gratuit » au fil de la composition
— jamais comme option autonome et visible, contrairement au coach sportif qui a son propre bouton.

**Corrigé** : la génération est extraite dans `generateLocalDiscoveryWithD()`, réutilisable
indépendamment du budget. Un nouveau bouton "D vous fait visiter" apparaît sur le Home, avec la
même visibilité que "Mon coach-animateur". `injectLocalFreeMoments()` (utilisé pendant la
composition classique) réutilise désormais la même fonction plutôt que de dupliquer la logique.

Testé concrètement avant livraison : la génération produit bien les trois expériences réelles
sans avoir choisi "gratuit" au préalable. Si aucun lieu réel n'est encore vérifié à proximité,
Dolcia le dit honnêtement plutôt que d'inventer un point de départ.

- 519 tests avant ce chantier, 4 nouveaux tests de garde — 523 au total, tous verts.

## Musique Dolcia enfin écoutable de façon autonome — 1er août 2026

Signalé directement : "même la musique Dolcia je ne peux pas la mettre pour l'écouter ou mettre
pause, rien !"

**Vérifié avant toute chose** : le fichier audio existe réellement
(`assets/audio/dolcia-theme.mp3`, 1,98 Mo) — ce n'était donc pas un fichier fantôme. Le vrai
problème : `playDolciaTheme()` ne se déclenchait qu'au démarrage d'une session Anime complète,
sans aucun moyen de simplement l'écouter ou la mettre en pause en dehors de ce contexte.

**Corrigé** : un bouton "Écouter la musique Dolcia" apparaît désormais sur le Home, indépendant du
démarrage d'une session — jouer, mettre en pause, avec un message honnête si la lecture échoue
(navigateur, permissions), jamais un échec silencieux. Réutilise le même fichier réel, jamais un
second fichier différent.

- 523 tests avant ce chantier, 4 nouveaux tests de garde — 527 au total, tous verts.

## Le catalogue maître Dolcia — déduplication entre sources — 1er août 2026

Répond directement au plan de repositionnement "conciergerie club sans murs" : *"si Bagatelle
existe déjà dans les données Dolcia et apparaît également chez Viator, l'utilisateur ne doit pas
voir deux fiches Bagatelle."*

**`server/catalog-master.js` créé** : détecte si deux items de sources différentes désignent le
même lieu réel en combinant deux critères, jamais un seul — similarité de nom (mesure de
confinement, pas Jaccard pur : "Parc Bagatelle" et "Parc d'attractions Bagatelle" doivent
matcher) ET proximité géographique réelle (120 mètres). Fusionne champ par champ selon la
politique de fusion déjà écrite (§20 : partenaire vérifié > office de tourisme > DATAtourisme >
Viator > Booking.com > Google Places), sans jamais perdre un champ absent chez la source
prioritaire mais présent chez une source secondaire.

**Un vrai défaut de conception trouvé et corrigé en cours de route** : la première version
utilisait une similarité de Jaccard pure, trop stricte — elle ratait le cas réel "Parc Bagatelle"
vs "Parc d'attractions Bagatelle" (un mot descriptif en plus faisait chuter le score sous le
seuil). Remplacée par une mesure de confinement (intersection / plus petit ensemble), qui
reconnaît correctement qu'un nom plus détaillé décrit le même lieu qu'un nom plus court, sans
fusionner à tort deux lieux qui ne partagent qu'un mot générique proche géographiquement (testé et
vérifié explicitement).

**Intégré dans le vrai flux client** : `app.js` applique désormais cette logique en une deuxième
passe, juste après la déduplication exacte déjà existante (qui ne rapproche que des noms
strictement identiques) — jamais en remplacement. Prêt à fonctionner sans changement le jour où
Viator ou Booking seront réellement connectés ; fonctionne déjà aujourd'hui entre Google Places et
DATAtourisme, les deux sources actuellement actives.

Vérifié avec le vrai code extrait d'`app.js`, pas une simulation isolée, avant de conclure.

- 527 tests avant ce chantier, 9 nouveaux tests de garde répartis sur le module serveur et son
  intégration client — 536 au total, tous verts.

## Le budget vivant par catégorie — deuxième brique du plan "club sans murs" — 1er août 2026

Répond directement au plan de repositionnement : *"Dolcia affiche un graphique très simple
montrant : payé / réservé / prévu / restant"*, réparti par catégorie (hébergement, restaurants,
activités, transport, animations), avec confirmation réelle après coup.

**Construit sur le système existant, pas à côté** : `estimateItemCost()` et `state.budgetPlan`
existaient déjà. Ajoutés : `budgetCategory()` (classe chaque activité dans la bonne catégorie),
`budgetItemState()` (payé/réservé/prévu — un montant confirmé prime toujours sur l'estimation),
`computeLivingBudget()` (agrège par catégorie), et `confirmRealSpend()` (le passage à "payé" ne se
fait jamais automatiquement, uniquement via une confirmation explicite de la personne après le
moment vécu).

**Testé avec l'exemple exact du plan avant toute déclaration** : un restaurant estimé à 140 € puis
confirmé à 220 € produit bien un écart de 80 € — le message généré reprend mot pour mot *"Vous
avez dépassé de 80 € votre budget restaurants…"*. Un écart de 5 € ou moins ne déclenche jamais de
message, pour éviter une fausse alerte sur un simple arrondi.

Un bouton "Confirmer le montant réel" apparaît sur chaque activité payante de l'agenda ; le
panneau de budget vivant (payé/réservé/prévu par catégorie, plus le reste disponible) s'affiche en
haut de l'écran Agenda.

- 536 tests avant ce chantier, 8 nouveaux tests de garde — 544 au total, tous verts.

## Refonte du budget vivant — un vrai porte-monnaie, pas une confirmation bureaucratique — 1er août 2026

Retour direct après la première version : *"c'est pas terrible, tu peux mieux faire avec un clic
qu'on fait à chaque fois qu'on a payé pour voir ce qu'il reste dans le porte-monnaie."* La première
version confirmait un montant réel par activité planifiée de l'agenda — trop lié à une activité
précise, pas assez au geste réel qu'on fait en vacances (payer un café, un souvenir, un imprévu,
sans vouloir chercher l'activité correspondante).

**Refait entièrement dans cet esprit** :
- Un bouton flottant "J'ai payé" (`wallet-fab`), vivant dans `shell()` — donc visible sur **tous**
  les écrans de l'application, pas seulement l'agenda.
- Le geste : un montant, une catégorie en un tap (optionnelle), "Enregistrer" — rien d'autre,
  jamais besoin de retrouver une activité précise.
- `state.walletLedger` — un vrai registre de dépenses, indépendant de l'agenda, persisté à part.
- Après confirmation, un retour immédiat et net (`showWalletRemaining`) — un grand affichage du
  montant restant, pas un petit toast qu'on peut manquer, disparaît seul après 2,6 secondes.

**L'ancien système par activité entièrement retiré**, pas laissé en doublon : `confirmRealSpend`,
`openConfirmSpendPrompt` et le bouton correspondant dans les cartes d'agenda ont disparu, remplacés
par cette seule logique.

Testé avec une vraie séquence de vacances avant de conclure : trois paiements successifs (45 €,
20 €, 60 €) sur un budget de 500 € donnent bien 455 € → 435 € → 375 €, mis à jour à chaque geste.

- 544 tests avant ce chantier (4 tests de l'ancien système remplacés, 8 nouveaux sur le
  porte-monnaie) — 544 au total, tous verts.

## Vraie hiérarchie de taille sur le Home — hiérarchiser plutôt que cacher — 1er août 2026

Suite directe de l'échange sur "un minimum de boutons" : décision explicite de **hiérarchiser
plutôt que masquer** — cacher coach/balade/musique derrière un sous-menu aurait recréé les
problèmes de découvrabilité déjà corrigés cette même session ("D introuvable", "visite guidée
cachée", "musique injoignable").

**Vrai problème trouvé en vérifiant, pas supposé** : sur mobile — la façon la plus probable
d'utiliser l'application — la grille des quatre boutons du Home passait à une seule colonne où
**les quatre avaient exactement la même hauteur (126px)**. "Créons un moment" ne se distinguait
que par sa couleur dorée, jamais par sa taille — aucune vraie hiérarchie.

**Corrigé** : le bouton principal est désormais structurellement séparé des trois secondaires
(`home-paths-secondary`), avec une hauteur nettement supérieure (190px contre 64-88px) — une
hiérarchie de taille réelle, persistante sur mobile, pas seulement une nuance de couleur. Les
trois secondaires restent tous visibles et cliquables, seulement plus compacts (texte descriptif
retiré, gardé uniquement sur le principal).

Une vraie duplication de règle CSS trouvée et supprimée au passage (`.home-path.primary`
définie deux fois par erreur lors d'une session précédente).

- 544 tests avant ce chantier, 5 nouveaux tests de garde — 549 au total, tous verts.

## Nettoyage de contamination croisée entre deux sessions différentes — 1er août 2026

Signalé directement : soupçon qu'une narration ("l'application plante partout") aurait pu se
construire sur des informations erronées. Vérification menée, pas supposée.

**Trouvé et confirmé** : cinq fichiers étrangers à cette base de code, mélangés dans un zip à un
moment donné (fins de ligne Windows CRLF, chemins `C:/Users/vince/...` dans l'historique de
l'autre session) — `CHANGELOG_SESSION.md`, `PLAN_MONETISATION.md`, `PLAN_COMPTES_RELIES.md`,
`pro.js`, `server/food-intelligence.js`. Aucun n'était référencé par le vrai `app.js` : orphelins,
jamais branchés.

**Plus grave, trouvé en nettoyant** : quatre fichiers de test (`test/food-intelligence.test.mjs`,
`test/partner-attribution.test.mjs`, `test/partner-business.test.mjs`,
`test/partner-campaigns-bridge.test.mjs`) testaient eux-mêmes ces fichiers étrangers — comptés
dans le total de tests annoncé sans jamais vérifier une seule ligne de la vraie application.

**Tout supprimé.** Le vrai chiffre, honnête : 534 tests, tous vérifiant réellement le code de
cette application, zéro fichier orphelin restant.

## Six déclencheurs identiques réduits à un seul — signalé très directement — 1er août 2026

Signalé sans détour : *"quatre boutons, voire cinq sur l'accueil qui t'amènent à la même chose,
c'est du bordel."* Vérifié en exécutant le vrai code, pas en estimant : **c'était en réalité six**
déclencheurs distincts (bouton principal, badge D, champ de recherche, bouton voix dans le bloc de
recherche, "Mes idées" et "Créer mon moment" dans la barre de navigation) menant tous, avant toute
qualification, exactement au même endroit : `openEclatDialogue(false,'compose')`.

**Corrigé radicalement, pas retouché en surface** : avant toute qualification, seul le bouton
principal ("Créons un moment qui n'appartient qu'à vous") apparaît sur le Home. Le bloc de
recherche entier et "Choisir parmi mes idées" sont retirés — ils ne faisaient strictement rien de
différent du bouton principal à ce stade. Une fois un premier moment déjà qualifié, ces deux
éléments réapparaissent, devenus alors de vraies actions distinctes (relancer une nouvelle envie
sans tout recommencer ; parcourir librement plutôt que faire composer par D) — le texte du champ
de recherche change aussi ("Une nouvelle envie ? Parlez-en à D") pour refléter honnêtement ce
nouveau rôle.

Vérifié en exécutant réellement `home()` dans les deux états, pas en relisant le code : 1 seul
déclencheur avant qualification, 4 après — jamais 6 dans le même écran comme avant.

- 534 tests avant ce chantier, 5 nouveaux tests de garde — 539 au total, tous verts.

## Bug majeur corrigé : une catégorie entière d'activités disparaissait de toute recommandation — 1er août 2026

Signalé directement, avec un scénario réel : *"j'habite Le Touquet, beau temps, je sors avec ma
fille de 9 ans, j'ai pas d'idée et Dolcia n'en trouve pas non plus... pourquoi ça ne me propose
pas le tennis ?"*

**Cause trouvée, confirmée par test réel** : `recommendationEligibleNow()` n'acceptait que les
statuts `'confirmed'` et `'autonomous'`. Mais toute activité "à séance" — tennis, paddle, kayak,
golf, cinéma, escape game, bowling, spa, massage, et bien d'autres — ne peut **jamais** atteindre
`'confirmed'` : Google Places ne fournit aucune donnée de disponibilité de créneau en temps réel
pour ces catégories. Conséquence réelle : une catégorie entière d'activités pertinentes et
réelles était exclue de toute recommandation, partout, sans exception, depuis le début.

**Corrigé en deux temps, cohérents entre eux** :
1. `recommendationEligibleNow()` accepte désormais aussi `'open-not-session'` et `'unknown'` —
   ces activités redeviennent recommandables, avec l'incertitude honnêtement affichée via `why()`
   (déjà en place : *"Séance ou réservation à confirmer"*).
2. `addAgenda()` ne bloque plus leur ajout à l'agenda — un rappel honnête ("réservation à
   confirmer directement auprès de l'établissement") remplace l'ancien blocage complet, pour
   éviter de proposer une activité qu'on ne pourrait ensuite jamais ajouter.

Une vraie incompatibilité d'horaire (mauvais jour, créneau confirmé différent) continue d'exclure
l'activité — seul le blocage injustifié des activités "à vérifier" a été retiré.

- 539 tests avant ce chantier, 5 nouveaux tests de garde — 544 au total, tous verts.

## Avertissement marée pour les activités nautiques en mer — signalé directement — 1er août 2026

Signalé directement, avec une vraie mise en garde de fond : *"on ne peut pas faire de paddle sur
la mer... attention aux horaires, ça dépend des marées, surtout dans le Nord, contrairement au
sud."* Vérifié avant toute chose : **aucune donnée de marée réelle n'existe dans ce projet.**

**La bonne réponse n'était pas d'inventer une table de marées** (ce que ce projet interdit
partout ailleurs) **ni de rester silencieuse** — mais de le dire honnêtement, au bon endroit,
avant que quelqu'un ne se retrouve bloqué à marée basse avec un paddle.

`requiresTideAwareness()` reconnaît le paddle, le kayak, le catamaran, la voile, le kitesurf, le
wing-foil, l'e-foil et le char à voile (qui a le besoin opposé — une plage découverte, pas de
l'eau — raison de plus de ne jamais deviner) — jamais une piscine ou un lac, qui ne sont pas
concernés. `why()` signale désormais précisément *"Dépend des marées · vérifiez l'horaire réel
auprès du club avant de vous engager"*, testé avant le message générique pour donner la vraie
raison plutôt qu'un texte vague. Le même avertissement apparaît aussi, bien visible, dans la fiche
détaillée, pas seulement en petit texte.

- 544 tests avant ce chantier, 5 nouveaux tests de garde — 549 au total, tous verts.

## Un vrai lien vers les marées, pas juste un avertissement — 1er août 2026 (suite)

Question directe : *"tu n'as pas accès aux marées ?"* Recherche menée avant de répondre.
**Vérifié** : une vraie API officielle existe (SHOM), mais nécessite l'achat d'une clé
d'abonnement — une démarche commerciale réelle, pas quelque chose à intégrer sans son accord. En
revanche, un vrai site public gratuit existe (maree.info, données SHOM), avec une page confirmée
pour Le Touquet (port n°8) — et un chiffre concret vérifié pour le 1er août 2026 : 8,97 m à marée
haute contre 1,43 m à marée basse, un marnage de presque 7,5 mètres, qui confirme entièrement
l'inquiétude soulevée.

**Ajouté** : l'avertissement marée pointe désormais vers un vrai lien cliquable
(`tideScheduleLink()`) — l'identifiant réel du Touquet pour les autres villes, la page d'accueil
du site en repli honnête plutôt qu'une URL de recherche inventée et non vérifiée (une première
version tentait un paramètre `?q=` jamais confirmé — corrigée avant livraison).

- 549 tests avant ce complément, 1 test adapté et 1 nouveau — 550 au total, tous verts.

## Deux défauts visuels confirmés par capture d'écran, corrigés — 1er août 2026

Signalé sans détour, avec deux captures d'écran à l'appui : *"regarde comme c'est moche, tu crois
vraiment que c'est premium ?"* Deux vrais défauts trouvés, pas des questions de goût.

**1. Texte coupé sur les boutons secondaires du Home.** La grille réservait toujours 3 colonnes
fixes (`1fr 1fr 1fr`), même quand seulement 2 boutons sont visibles (avant qualification, "Mes
idées" reste caché) — chaque bouton restant plus étroit que nécessaire, avec un `overflow:hidden`
hérité qui coupait "Mon coach-animateur" en "Mon coach-animate". Corrigé avec une grille qui
s'adapte réellement au nombre de boutons présents (`auto-fit`), et le texte peut désormais revenir
à la ligne plutôt que d'être tronqué.

**2. La carte de prévisualisation Anime ("Cardio Club avec D") en beige clair au milieu d'une page
sombre.** Trouvé un fond codé en dur (`#f3ead7`) et des étapes en blanc quasi opaque
(`rgba(255,255,255,.46)`) — un composant resté sur un ancien thème clair, jamais mis à jour depuis
l'établissement de l'esthétique sombre dorée partout ailleurs dans l'application. Converti vers la
même palette (fond sombre en dégradé, texte crème, accents dorés) que le reste de Dolcia.

- 550 tests avant ce chantier, 4 nouveaux tests de garde — 554 au total, tous verts.

## Voix monotone, entrée confuse dans l'animation, et raccourci de sécurité — 1er août 2026

Signalé directement, avec deux captures d'écran : *"elle parle tellement monotone qu'on a plus
envie de se pendre que de jouer... trop compliqué de comprendre comment entrer dans l'animation...
une fois sur place on ne peut plus faire demi-tour."* Trois sujets différents, traités séparément.

**1. La voix monotone — cause la plus probable trouvée, pas corrigible par le code seul.**
`server/voice-synthesis.js` relaie une vraie voix neuronale (ElevenLabs), avec de vrais réglages
d'émotion par humeur (chaleureuse, joyeuse, calme, encourageante). Mais si les variables
d'environnement `ELEVENLABS_API_KEY` ou `ELEVENLABS_VOICE_ID` ne sont pas positionnées sur Vercel,
le serveur renvoie une erreur 503 et l'application **retombe silencieusement** sur la synthèse
vocale native du navigateur — exactement le genre de voix robotique et monotone décrite. Le
fichier lui-même le documente en commentaire depuis le début : *"la synthèse native du navigateur
sonne robotique quel que soit le texte écrit."* **Action nécessaire côté Vercel, pas du code** :
vérifier que ces deux variables sont bien renseignées dans les paramètres du projet.

**2. Entrée confuse dans l'animation.** Le bouton disait "Parler à D avant la séance" — vague, ne
disant ni ce qu'il fait ni que c'est rapide. Corrigé en "▶ 3 questions rapides, puis on commence".

**3. Raccourci de sécurité, pour ne jamais rester bloqué une fois sur place.** Un nouveau bouton
discret "Commencer tout de suite, sans les questions" permet de sauter directement à la séance
pour un programme coach, sans passer par les trois questions de personnalisation — utile pour
quelqu'un déjà sur place, impatient de commencer avec son enfant.

- 554 tests avant ce chantier, 3 nouveaux tests de garde — 557 au total, tous verts.
