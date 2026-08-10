# DATAtourisme (implémenté), matrice Google, stratégie de fusion, et la vraie question posée

## Ce qui a changé dans le code aujourd'hui — pas seulement audité

`server/datatourisme.js` extrait maintenant le contact (téléphone, email, site) — **vérifié en
direct par recherche** : `hasContact` fait partie de la sélection **par défaut** de l'API, donc
déjà présent dans chaque réponse depuis toujours, simplement jamais lu par le code jusqu'ici.
Testé concrètement avant d'écrire ce document (voir plus bas) : extraction réelle quand la donnée
existe, honnêtement `null` quand elle n'existe pas — jamais deviné.

**Ce que je n'ai pas fait, volontairement** : ajouter le paramètre `fields` pour réclamer
explicitement horaires et tarifs. La documentation officielle est claire : *"L'utilisation du
paramètre fields remplace totalement la sélection par défaut."* Je ne connais pas avec certitude
le nom exact de la propriété JSON pour les horaires et les tarifs dans cette API précise (les noms
que j'ai vus référencés — `hasOpeningHoursSpecification`, `hasPriceSpecification` — viennent d'un
vocabulaire proche, GoodRelations, mais je n'ai pas pu les vérifier sur un vrai appel à cette API).
Ajouter un nom de propriété incorrect dans `fields` risquerait de casser la requête qui fonctionne
aujourd'hui. J'ai laissé le code d'extraction prêt (`deepTextByPattern`), honnêtement inactif, en
attendant qu'un vrai accès réseau permette de vérifier le nom exact avant de l'activer sans risque.

## La matrice DATAtourisme, complète

| Champ | Disponible dans l'ontologie | Utilisé avant aujourd'hui | Utilisé maintenant |
|---|---|---|---|
| Nom | oui | oui | oui |
| Date/horaire événement | oui | oui | oui |
| Ville, adresse | oui | oui | oui |
| Type | oui | oui | oui |
| Image | oui | oui | oui |
| Lien source | oui | oui | oui |
| Téléphone, email, site | oui (par défaut) | **non** | **oui** |
| Horaires détaillés | oui (hors défaut) | non | non — prêt, à activer après vérification du nom de champ réel |
| Tarifs | oui (hors défaut) | non | non — même raison |
| Accessibilité PMR | probable, non confirmé | non | non |
| Langues | probable, non confirmé | non | non |
| Animaux acceptés | probable, non confirmé | non | non |
| Description longue | oui (par défaut, `hasDescription`) | non | non — chantier suivant possible, même méthode |
| Avis (`hasReview`) | oui (par défaut) | non | non — chantier suivant possible |

## Matrice Google Places (déjà demandée explicitement, donc plus fiable à auditer)

| Champ | Demandé | Utilisé |
|---|---|---|
| Nom, adresse | oui | oui |
| Téléphone (2 formats) | oui | à vérifier lequel des deux est réellement affiché |
| Site, lien Google | oui | oui |
| Horaires (2 formats) | oui | oui |
| Résumé éditorial | oui | à vérifier s'il est affiché ou seulement récupéré |
| Note, avis | oui | oui |
| Photos | oui | oui |
| Statut (fermé définitivement) | oui | oui |
| **Prix (`price_level`)** | **non demandé ici** — récupéré séparément via `places.js` (recherche), pas via `place-details.js` | oui, mais seulement quand Google le fournit lui-même (champ souvent absent chez eux) |
| Accessibilité, animaux, langues | non demandé | non — Google ne les expose pas de façon fiable dans cette API |

**Différence structurelle entre les deux sources, à retenir** : Google demande explicitement des
champs précis (`fields=`), donc chaque ajout est un choix conscient et sûr. DATAtourisme utilise
une sélection par défaut plus large mais opaque — le vrai gain immédiat était de lire ce qui
arrivait déjà, pas d'en demander plus.

## Stratégie de fusion, honnête sur ses limites

- **Google est meilleur pour** : les lieux permanents avec une vraie présence en ligne (notes,
  avis, horaires à jour, statut d'ouverture en temps réel).
- **DATAtourisme est meilleur pour** : la légitimité officielle et la couverture d'événements
  locaux que Google ne référence pas — mais avec moins de détails pratiques par défaut, comme
  cette matrice vient de le confirmer.
- **Office de tourisme (scraping direct, cas du Touquet)** : la plus complète pour un festival
  précis, mais la plus fragile (un vrai bug d'URL y a été trouvé cette semaine) et la seule qui ne
  couvre qu'une ville.
- **Partenaire** : la seule source où l'établissement lui-même garantit l'exactitude — mais
  seulement pour ceux qui s'inscrivent, ce qui n'existe pas encore (§13, niveau 2).

Je ne vais pas produire de taux de fraîcheur ou de taux de complétude chiffré pour chaque source
sans les avoir mesurés sur de vraies requêtes en direct — je n'ai pas cet accès ici. Ce que je
peux affirmer avec certitude, c'est l'ordre de complétude structurelle des CHAMPS eux-mêmes,
vérifié ci-dessus, pas un pourcentage global inventé.

---

## La vraie question : fiabilité contre personnalisation — assumé, mais jamais interrogé sous cet angle précis

**Vérifié, pas supposé** : le choix n'est pas un effet de bord de l'algorithme. `ARCHITECTURE.md`
§5.4 l'écrit explicitement : *"Ordre lexicographique strict, jamais une somme pondérée (plus
simple à tester, plus facile à expliquer)"*, avec un point de vigilance dédié à protéger une vraie
pépite face à une simple bonne note. C'est un choix réfléchi, documenté, pas un accident.

**Mais ce choix n'a jamais répondu à ta question précise** : rien dans cette documentation
n'envisage qu'un utilisateur d'un an devrait voir son goût personnel peser plus qu'au premier jour.
La raison documentée porte sur l'explicabilité et la protection des pépites — jamais sur la durée
de la relation.

**Est-ce que la fiabilité écrase parfois la personnalisation ?** Oui, mécaniquement, dans un cas
précis : le tri "recommandé" d'Explorer. Deux activités à égalité de désir/surprise/compatibilité
s'ordonnent sans le goût personnel jusqu'au tout dernier critère. Dans la composition automatique
du programme (`scoreItems`), en revanche, le goût pèse réellement (×4 sur le profil appris, ×5 sur
le ressenti) — donc la réponse n'est pas la même partout dans l'application, et personne n'avait
formulé cette différence avant cet audit.

**Je ne trancherais pas moi-même si c'est le bon choix** — ça touche à une vraie décision produit,
pas à un bug. Mais je peux proposer une piste qui respecte la règle déjà écrite (jamais une somme
pondérée, garder l'explicabilité) sans ignorer la durée de la relation : ajouter un seuil explicite
— après un nombre significatif d'interactions confirmées, le goût personnel entre plus tôt dans
l'ordre lexicographique, pas seulement en dernier recours. Ce serait un nouveau palier écrit, testé,
jamais un poids caché — cohérent avec l'esprit du §5.4, pas une contradiction de ce qui existe.

Dis-moi si tu veux que je formalise cette piste dans l'architecture avant de la coder, ou que je la
code directement.
