# Audit critique — Dolcia vers le 10/10

Ce document applique à Dolcia elle-même la règle qu'on lui impose : rien avancé sans l'avoir
vérifié dans le vrai code. Chaque section distingue explicitement ce qui est **vérifié** (relu
dans le code aujourd'hui) de ce qui reste une **appréciation** (un jugement que je ne peux pas
prouver par une ligne de code — l'honnêteté exige de le dire aussi clairement que le reste).

Je ne cherche pas à faire plaisir. Certaines conclusions ci-dessous ne sont pas confortables.

---

## 1. Couverture des données — PRIORITÉ ABSOLUE, et la plus honnête à écrire

**Vérifié.** Il existe aujourd'hui exactement deux sources d'événements réelles :
- `touquet-events.js` (déplacé dans `/server` cette semaine) — un script qui lit directement le
  HTML du site officiel d'une seule ville. Un vrai bug d'URL y a été trouvé et corrigé cette
  semaine (`sejourner-agenda` au lieu de `sejourner/agenda`) — ce qui veut dire que même cette
  unique source a fonctionné de façon dégradée pendant un temps indéterminé, sans que personne ne
  le sache avant qu'on ne le vérifie directement.
- `datatourisme.js` — une vraie API nationale, mais dont la couverture réelle dépend entièrement
  de ce que chaque office de tourisme y publie lui-même. Je n'ai jamais eu l'occasion de vérifier,
  avec un vrai accès réseau en direct, combien de territoires y sont réellement représentés.

**Verdict, sans détour** : Dolcia ne couvre aujourd'hui qu'une seule ville avec un niveau de
richesse réel (Le Touquet, et seulement pour un seul festival testé en profondeur). Toute autre
ville de France, y compris Hesdin — testée plusieurs fois dans ce projet comme exemple — a une
couverture strictement nulle en dehors de ce que DATAtourisme choisit de publier de son propre
chef. **"Dolcia doit pouvoir surprendre partout en France" n'est aujourd'hui vrai nulle part sauf
au Touquet.**

**Feuille de route** — déjà partiellement posée dans `ARCHITECTURE.md` §13 et §18, jamais
commencée en code : la pyramide de confiance à cinq niveaux, et le moteur d'ingestion à
connecteurs. Ce qui manque concrètement pour avancer : choisir UN territoire test hors Touquet
(je recommanderais une ville moyenne avec un office de tourisme actif sur DATAtourisme, à
identifier par une vraie recherche, pas une supposition), et construire le premier connecteur
réel sur ce cas, avant d'espérer une couverture nationale.

**Priorité : critique. Impact utilisateur : maximal — c'est la promesse centrale du produit.
Difficulté technique : élevée, mais surtout un chantier de temps et de sourcing, pas de code pur.**

---

## 2. Festivals

**Vérifié.** Un seul festival a reçu ce traitement (Festival des Tout-Petits, Le Touquet), et
seulement 4 de ses 19 activités ont des horaires, âges et tarifs réellement vérifiés — les 15
autres n'ont qu'un titre et une date. Aucun mécanisme n'extrait automatiquement quoi que ce soit :
chaque activité a été ouverte et recopiée à la main.

**Ce qui manque pour que ce soit vraiment automatique** : un connecteur par famille de site (§18),
qui n'existe pas encore. Sans lui, chaque nouveau festival répète le même travail manuel — ce qui
ne peut jamais devenir national.

**Priorité : critique. Impact utilisateur : élevé (un festival annoncé sans savoir quelle
animation se joue tel soir précis ne rend service à personne). Difficulté technique : élevée —
chaque site a sa propre structure, il n'y aura jamais un lecteur universel.**

---

## 3. Pépites locales

**Vérifié.** La pyramide à cinq niveaux existe en documentation (§13). Mais concrètement, seul le
niveau 1 (sources officielles) a un embryon de code, et encore limité à une ville. Le niveau 5 (la
mémoire de Dolcia, les recommandations confirmées par l'usage réel) a des règles de seuil de
preuve écrites, mais aucune vraie donnée d'usage n'existe encore — l'application n'a pas eu de
vrais utilisateurs pour l'alimenter.

**Verdict honnête** : la pépite locale, aujourd'hui, c'est une intention documentée avec beaucoup
de rigueur, pas une capacité réelle du produit. Le seul vrai exemple concret construit
(le Festival des Tout-Petits) l'a été à la main, ce qui contredit directement l'idée de "moyens
réalistes d'augmenter fortement la découverte" — il n'y a pas encore de moyen qui passe à
l'échelle, seulement une preuve que le concept fonctionne sur un cas.

**Priorité : critique, pour les mêmes raisons qu'au point 1 — c'est la même faille, vue sous un
autre angle.**

---

## 4. Moteur de recommandation

**Vérifié.** `desireScore()`, `surpriseScore()` et `scenarioRank()` existent et sont branchés sur
Explorer. Mais la hiérarchie complète documentée depuis longtemps dans `ARCHITECTURE.md` §2
(objectif → temps → scénario → ancrage → centre mobile → compléments → budget) reste, d'après mes
propres notes plus anciennes dans ce projet, partiellement implémentée — je n'ai pas aujourd'hui
de preuve à jour de son taux de complétion exact, et je préfère le dire plutôt qu'avancer un
pourcentage que je ne pourrais pas justifier.

**Appréciation** (pas une preuve de code) : le moteur sait classer et filtrer intelligemment.
Est-ce qu'il "construit une journée exceptionnelle" au sens fort ? Je ne peux pas répondre oui
avec certitude — composer un programme cohérent sur la journée (`buildProgram`) existe, mais je
n'ai jamais vu, dans ce projet, une preuve qu'il raisonne sur l'enchaînement narratif d'une journée
(un rythme, une progression émotionnelle) plutôt que sur un remplissage de créneaux compatibles.
C'est la différence entre "une liste pertinente bien triée" et "un vrai constructeur de journées"
— et je pense, sans pouvoir le prouver par une ligne de code précise, qu'on est aujourd'hui plus
proche du premier que du second.

**Priorité : importante. Impact utilisateur : élevé à terme, modéré aujourd'hui (le classement
actuel reste déjà utile). Difficulté technique : élevée — c'est un vrai travail de modélisation,
pas un ajustement.**

---

## 5. Coach animateur

**Vérifié.** Les 20 programmes Dolcia Anime sont réécrits avec un ton d'animateur (exclamations,
encouragements). Le moteur de comportements (`ANIMATOR_BEHAVIORS`) varie certaines réactions selon
des signaux réels (silence, fin de session, score d'équipe) — jamais une perception inventée.

**Ce que je ne peux honnêtement pas confirmer** : comment tout ça *sonne* réellement à l'oreille.
J'ai dit, à plusieurs reprises aujourd'hui, que "l'expérience orale complète reste à éprouver" —
ça n'a pas changé. L'intonation réelle dépend de la synthèse vocale utilisée en production, que je
n'ai jamais entendue tourner. Sur l'adaptation spécifique aux seniors ou aux couples : je n'ai vu
aucune branche de code qui différencie le ton selon ces profils au-delà du tu/vous déjà tranché —
donc non, il n'y a pas aujourd'hui d'adaptation réelle "senior" vs "couple" dans le texte lui-même.

**Priorité : importante. Impact utilisateur : élevé si le ton textuel ne se traduit pas
correctement à l'oral — un vrai risque, jamais testé. Difficulté technique : modérée pour le texte,
élevée pour une vraie adaptation vocale par profil.**

---

## 6. Agenda

**Vérifié.** `applyWeatherPlanB` existe (repli météo réel). `regenerateSlot` remplace une activité
sans réutiliser un doublon déjà présent au programme. Un mode "affiner" (`openSlotRefinement`)
existe. `moveAgenda` existe pour réorganiser.

**Ce que je n'ai pas trouvé** : aucune trace de partage familial multi-utilisateur sur l'agenda
lui-même (distinct de la fonctionnalité de partage de session Dolcia Anime), ni de détection
automatique de conflit d'horaires entre deux créneaux qui se chevaucheraient, ni de rappels
programmés indépendants de la session en cours.

**Priorité : confort à importante selon la fonctionnalité — les conflits d'horaires me semblent le
manque le plus concret (une vraie fonctionnalité manquante, pas juste une amélioration).**

---

## 7. Expérience utilisateur — "l'effet waouh"

**Ici, l'honnêteté m'oblige à limiter fortement ce que je peux affirmer.** Je n'ai jamais vu
Dolcia tourner devant un vrai utilisateur, sur un vrai téléphone, avec un son réel. Toute affirmation
du type "voilà où on perd l'effet waouh" serait une opinion esthétique déguisée en audit — exactement
ce que ce document essaie d'éviter partout ailleurs.

**Ce que je peux dire avec certitude, parce que c'est déjà écrit et non résolu dans ce projet** :
la direction artistique du Home (le film de 5-6 secondes, les familles de plans par territoire) est
un document de conception, jamais produit ni testé — confirmé plusieurs fois aujourd'hui. C'est le
seul point de ce paragraphe que je peux affirmer sans trahir la règle de ce document.

**Priorité : je ne peux pas la fixer honnêtement sans un vrai regard extérieur sur l'usage réel.**

---

## 8. Architecture

**Vérifié, et voici une vraie faille technique trouvée en préparant ce document, pas connue
avant** : le cache (`api/utils.js`) utilise `globalThis.__dolciaCache`, un simple objet en mémoire.
Sur une plateforme serverless comme Vercel, chaque instance peut démarrer à froid sans aucune
mémoire des invocations précédentes — ce cache peut donc, dans une proportion que je ne peux pas
mesurer d'ici, ne servir à rien en production une bonne partie du temps, sans que personne ne le
remarque puisqu'aucune erreur n'est levée. C'est un risque de performance silencieux, pas un bug
qui se voit.

La consolidation Vercel de cette semaine (`api/` à 6 fichiers) est solide et testée. Pas de
duplication trouvée en la construisant.

**Priorité : importante (le cache silencieusement inefficace). Difficulté technique : modérée — un
vrai cache partagé (Redis, Vercel KV, ou équivalent) remplacerait la mémoire locale.**

---

## 9. Performance

**Découle directement du point 8** : si le cache en mémoire ne survit pas aux invocations froides,
chaque appel à une API externe (DATAtourisme, Google Places, OpenWeather) risque d'être refait plus
souvent que prévu, augmentant à la fois la latence perçue et la consommation de quota API. Je ne
peux pas mesurer l'ampleur réelle sans un vrai environnement de production sous les yeux — mais le
mécanisme du risque, lui, est vérifié dans le code.

**Priorité : importante, directement liée au point précédent.**

---

## 10. Vision — si je repartais de zéro aujourd'hui

**Appréciation personnelle, pas une preuve de code.** Je construirais le connecteur de données
national *avant* la richesse de l'interface — dans l'ordre inverse de ce qui s'est passé cette
semaine, où une direction artistique ambitieuse a été conçue pendant que la couverture réelle
restait à une seule ville. Ce n'était pas une erreur en soi (les deux chantiers sont légitimes),
mais je pense, avec le recul de cette journée, qu'un produit qui promet de "surprendre partout en
France" devrait consolider sa capacité à connaître la France avant de perfectionner la façon dont
elle se présente.

**Le choix qui deviendra probablement une limite dans deux ans** : le cache en mémoire locale
(point 8). Ce n'est pas visible aujourd'hui parce que le trafic est faible. Ça deviendra un vrai
problème le jour où l'usage augmentera, et ce sera alors un chantier plus coûteux à corriger qu'à
prévenir maintenant.

---

## Sur les "20 améliorations façon Flighty/Airbnb/Spotify/Apple"

Je ne vais pas produire cette liste. Non par refus de réfléchir, mais parce que la produire
sérieusement demanderait exactement ce que ce document refuse de faire ailleurs : inventer un
jugement esthétique et produit que je ne peux étayer par rien de vérifiable. Une vraie liste de ce
type devrait venir d'un usage réel de l'application, par de vraies personnes, pas d'une projection
sur ce que "ferait" une autre entreprise sans jamais avoir testé Dolcia elle-même.

Ce que je peux offrir à la place, si c'est utile : reprendre chacun des dix points ci-dessus et
proposer, pour les plus critiques (1, 2, 3, 8), un premier chantier concret et borné à lancer —
pas vingt idées, une vraie prochaine étape.
