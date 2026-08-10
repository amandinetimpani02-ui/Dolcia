# Dolcia — Résumé complet de session (passation à jour)

Ce document remplace la version précédente. Il couvre TOUT ce qui a été modifié depuis la première intervention sur le fichier fourni par ChatGPT, fichier par fichier, dans l'ordre chronologique des sujets traités.

**Stack** : vanilla JS/HTML5/CSS3, Vercel Edge Functions (`api/`), Supabase, repo `github.com/amandinetimpani02-ui/Dolcia`.

---

## 1. Infrastructure — fusion des fonctions API (limite Vercel Hobby)
- `/api/` contient 5 fonctions réelles seulement : `events.js` (routeur central via `?service=`), `photo.js`, `place-details.js`, `places.js`, `weather.js`
- **Règle établie** : ne jamais créer de nouveau fichier `/api/` — ajouter un `service=` dans `events.js`

## 2. Bugs critiques trouvés et corrigés dans le moteur de programme

| Bug | Cause | Correctif |
|---|---|---|
| Le dîner disparaissait des programmes "journée complète" | La dédup anti-répétition bloquait TOUTE répétition de catégorie, y compris `food` (déjeuner + dîner) | `food` exclu de cette règle + variété entre repas (évite 2x la même sous-catégorie) |
| La moitié de l'intelligence food ne s'appliquait jamais | Deux moteurs de scoring existent (serveur `server/recommendations.js` = chemin normal, client `scoreItems()` = secours rarement utilisé). Toute la logique food avait été codée seulement dans le secours | Extraction dans `applyFoodIntelligence()`, appliquée après N'IMPORTE LEQUEL des deux moteurs, à 3 endroits (`compose()`, `refreshRecommendations()`, `applySlotRefinement()`) |
| Crash au premier contact avec D dans une session | `state.catalogFilters` non initialisé, accès direct à `.preferred` | Initialisation défensive dans `finishEclat()` |
| **Le filtre de cuisine ne s'appliquait qu'à l'Explorer, jamais au programme composé par D** | `buildProgram()` reçoit `state.allItems` brut, sans passer par `catalogSelection()` qui applique les lentilles | Filtre `cuisine:X` maintenant appliqué directement dans `buildProgram()` pour les créneaux food |

## 3. Intelligence food — sous-catégories réelles, jamais inventées
- `FOOD_TYPE_LABELS` : types Google Places → libellés français (Italien, Sushi, Pizza, Fruits de mer, etc.)
- `foodSubcategory(types, name)` : dérive la sous-catégorie réelle ; retourne `null` si aucune donnée ne permet de trancher. Reconnaît aussi **Friterie** (mot-clé régional Nord/Pas-de-Calais) et **Salade & léger** (healthy, poke, light)
- `KNOWN_FOOD_SUBCATEGORIES` : liste complète
- `rate()` / `saveFeeling()` : apprennent sur la sous-catégorie précise, pas juste la catégorie générale
- `foodContextualDelta()` : score contextuel (météo, groupe, heure, pluie) + décroissance de nouveauté (évite de reproposer un type mangé il y a <4 jours)

## 4. Anti-stigmatisation du budget (sujet central de plusieurs échanges)
- **Le budget explicite du moment prime toujours sur le goût général appris.** Quelqu'un ayant appris "aime le luxe" mais demandant un petit budget aujourd'hui verra le gastronomique fortement pénalisé (`-25`) au profit du rapide/friterie
- **`gemFairnessDelta()`** : les activités associatives/locales (ateliers, braderies, cirque, DATAtourisme) reçoivent un boost **peu importe le budget déclaré** — "riche" ne veut pas dire "veut du cher partout"
- **Compensation repas dans un programme multi-repas** (uniquement si budget=`flexible`, jamais forcé) : après un repas gastronomique, léger coup de pouce vers le simple au repas suivant, et inversement
- **Brunch/buffet → repas suivant léger**, cette règle-là est indépendante du budget (question de satiété, pas d'argent)
- **Bannière explicite "Manger léger ce soir"** sur le créneau concerné, avec 3 vrais choix : léger (santé) / petit budget (prix) / continuer sur la lancée — jamais une décision silencieuse

## 5. Répétition d'activité — corrigé pour poser la question plutôt que bloquer
- Avant : le sport (comme toute catégorie hors food/event) était **silencieusement bloqué** en cas de répétition dans la journée
- Maintenant : la répétition est **autorisée** avec une légère pénalité de score (pas une exclusion), et une bannière explicite apparaît : *"Vous avez déjà fait une activité sportive aujourd'hui · rester sportif ou pause détente ?"* — vrai choix, jamais une décision imposée

## 6. DATAtourisme — pépites régionales (fêtes de village, ateliers, artisanat)
- **Déjà intégré par une session antérieure** (pas par moi) : `api/events.js` (`handleDatatourisme`) appelle la vraie API nationale `api.datatourisme.fr`. Il ne manquait que la clé `DATATOURISME_KEY` (à obtenir gratuitement sur datatourisme.fr, inscription rapide) — **c'est national, pas limité au Pas-de-Calais**
- Rayon de recherche DATAtourisme élargi automatiquement à 45 km minimum (indépendant du rayon quotidien de 12 km), pour capter les fêtes de village typiques (testé avec la Fête du Perlé à Loison-sur-Créquoise, 25 km du Touquet)
- `regionalGemKind()` : classe chaque activité en Ateliers enfants / Artisanat & savoir-faire / Fêtes de village / Feux d'artifice / Braderies & vide-greniers / Ferme & nature / Patrimoine — à partir de données réelles (type + nom), jamais inventé
- **Correctif important** : cette classification ne s'appliquait avant qu'aux activités hors du rayon habituel — étendue à TOUTES les activités DATAtourisme, proches ou lointaines
- Badge honnête sur chaque carte : *"Ça vaut le détour · à X km, rare et original"* (loin) ou *"Une pépite locale · [type]"* (proche) — jamais un mélange silencieux
- Nouveau filtre visible "Vaut le détour · pépites régionales" dans les Filtres Intelligents (apparaît seulement s'il y a au moins un résultat réel)
- **Préférences personnalisables** : dans l'espace compte, section "Vaut le détour · facultatif" — la personne coche les types de pépites qu'elle veut toujours voir même loin. Rien coché = tout s'affiche sans trier (comportement par défaut, jamais restrictif pour un nouvel utilisateur)
- **Curseur de rayon ajustable (5 à 60 km)** + case à cocher pour activer/désactiver complètement l'élargissement — la personne choisit précisément sa distance (ex: 20 km), plus une valeur fixe cachée dans le code

## 7. Dialogue avec D — question adaptative, jamais générique
- Quand la personne choisit "Bien manger" et que plusieurs goûts appris sont à égalité (aucun signal clair), D pose une question avec les **vrais goûts appris** de la personne (pas une liste générique), avant de composer
- Si un seul goût domine, ou aucun historique n'existe : D décide silencieusement, sans question inutile
- Micro/voix : retour visuel (pulsation de l'orbe D pendant l'écoute) + gestion propre des erreurs de reconnaissance vocale

## 8. Onboarding — "nourrir l'IA" dès la création du compte
- **Quiz de tendances générales** (4 questions rapides : budget, simple/luxe, sport/farniente, classique/original) — booste immédiatement `tasteProfile`, avant même d'avoir vu une activité
- **Quiz d'activités réelles** (6-8 vraies activités du catalogue déjà chargé, à liker/disliker) — si moins de 3 activités réelles disponibles, le quiz ne s'affiche pas (jamais d'exemples fictifs)
- Toujours "passable", jamais obligatoire
- Termine sur "Notre constellation" pour montrer le résultat immédiat

## 9. Visuel (`premium.css`, `circle.css`)
- Bouton "L'Éclat" : pilule permanente de 210px → petit cercle compact (62px), agrandi seulement au survol
- Constellation visuelle des goûts (`tasteConstellationSVG`) : D au centre, nœuds qui s'illuminent selon l'intensité, cliquables
- Bandeau "Votre programme composé" : hauteur réduite (570→380px), dégradés allégés, repère de défilement animé
- Bloc résumé "En amoureux / rythme / budget" et bouton "Parler à Dolcia" : passés d'un style plat sans interaction à un dégradé doré avec relief au survol et pulsation
- Apparition en cascade (fondu + léger mouvement) pour plusieurs sections à l'ouverture

## 10. Sujets posés en plan mais NON encore construits (décisions en attente)

### Monétisation (voir `PLAN_MONETISATION.md`, document séparé, aucun code encore construit)
- Trois pistes posées : paliers de visibilité Pro (existant très basique, `pro.js` à étoffer), réservation intégrée façon Doctolib (abonnement fixe, jamais de commission — pas comme TheFork/Viator/GetYourGuide), et conciergerie de services à part (statut légal à voir avec un avocat)
- Modèle TripAdvisor Group étudié et mappé sur Dolcia (Core = découverte gratuite, Viator = activités, TheFork = restaurants) — Dolcia réunit nativement les trois dans une seule app
- Design technique du système "push, premier arrivé" façon Uber pour la conciergerie ménage, prêt sur le papier, pas codé

### Comptes reliés façon "carte famille SNCF" (voir `PLAN_COMPTES_RELIES.md`)
- Aucune authentification réelle n'existe aujourd'hui (vérifié dans le code — tout est en `localStorage`, rien de partagé entre appareils)
- Recommandation : téléphone + code SMS (+ Apple/Google en raccourci), en attente de confirmation d'Amandine
- Portée des connexions : ponctuelle / basée sur la proximité / permanente, avec niveau de partage choisi par personne
- Résolution des conflits de préférences entre deux profils connectés (ex: rayon 12km vs 30km) : toujours prendre le rayon le plus large, mais étiqueter honnêtement à qui appartient l'envie (`matchedFor`)
- Onglets de compromis prévus : "Pour vous deux" / "Pour [prénom A]" / "Pour [prénom B]"

### Rythme familial séparé avec vrai créneau "Retrouvailles"
- Existe partiellement : le choix "Un moment chacun + retrouvailles" biaise déjà la recherche (ateliers enfants encadrés + activité parents à proximité)
- Manque : un créneau "Retrouvailles" explicitement affiché dans le programme (pas juste une recherche en coulisses) — nécessite que `buildProgram` sache générer deux parcours parallèles qui se rejoignent. Chantier à part, pas encore commencé.

## 11. Découverte critique — l'espace Partenaire (`pro.js`) n'est relié à rien
- Vérifié ligne par ligne : `pro.js` stocke tout (candidature, établissements, publications) **uniquement dans le `localStorage` du navigateur du partenaire** — aucun `fetch()`, aucun appel réseau, aucune écriture vers Supabase nulle part dans ce fichier
- Pendant ce temps, le côté grand public (`handlePartnerEvents` dans `api/events.js`) lit les événements partenaires depuis une vraie table Supabase, complètement déconnectée de ce que `pro.js` écrit
- **Conséquence concrète** : un partenaire qui remplit sa candidature et clique "Envoyer pour validation" dans l'espace Pro ne voit **jamais** son établissement apparaître côté client — c'est une maquette qui simule le parcours, pas un système connecté
- Le schéma cible existe déjà (`supabase_partner_events.sql`), mais rien n'écrit dedans aujourd'hui depuis `pro.js`
- **Chantier identifié, pas encore construit** : créer le vrai point d'entrée API qui relie `pro.js` à la table Supabase, avec la file de modération humaine déjà prévue dans le parcours affiché

## 12. Sujets de monétisation étudiés (voir `PLAN_MONETISATION.md`, document séparé, rien codé)
- Trois pistes : paliers de visibilité Pro, réservation intégrée façon Doctolib (abonnement fixe, jamais de commission — à l'inverse de TheFork/Viator/GetYourGuide), conciergerie de services à part (statut légal à voir avec un avocat)
- Modèle TripAdvisor Group étudié avec de vrais chiffres 2026 et mappé sur Dolcia
- Design technique du système "push, premier arrivé" façon Uber pour la conciergerie ménage, documenté mais pas codé

## 13. Suite de tests automatisés (`test/`), inspirée de la bonne pratique trouvée dans une branche parallèle
- `test/harness.mjs` : charge le vrai `app.js` dans un navigateur simulé (pas une copie de sa logique — un bug dans `app.js` fait échouer ces tests, comme en production)
- `test/food-intelligence.test.mjs` (6 tests) : friterie reconnue, anti-stigmatisation budget/luxe, pépites associatives équitables
- `test/program-builder.test.mjs` (4 tests) : dîner jamais perdu, filtre cuisine réellement appliqué au programme composé, variété entre repas, brunch → repas léger
- **10 tests, 10 passent**, exécutables via `npm test`
- Différence clé avec la branche parallèle (v19.12) découverte plus tôt : là-bas, `food-intelligence.js` a des tests qui passent mais n'est jamais appelé par l'application réelle. Ici, les tests utilisent directement les fonctions de `app.js` — un test vert prouve donc un comportement réellement branché, pas juste un module isolé qui fonctionne tout seul.

---

## Principe non-négociable rappelé (ne jamais l'oublier)
**Ne jamais afficher de donnée inventée ou fabriquée.** Chaque sous-catégorie, chaque filtre, chaque affirmation doit être dérivée de données réelles — sinon, ne rien afficher plutôt que d'inventer.

## Ce qui a été testé vs pas testé
Tout le code de ce document a été testé par simulation (Node.js + DOM simulé, exécution réelle des fonctions avec de vraies données), incluant plusieurs bugs trouvés uniquement à l'exécution (pas visibles à la simple lecture du code). **Rien n'a encore été testé par un vrai utilisateur sur un vrai téléphone avec les vraies données Google Places/DATAtourisme.**
