# Audit du cerveau, de la confiance et de DATAtourisme

**Correction importante à faire avant tout** : mon audit précédent du "cerveau" (message
précédent) était incomplet — j'avais lu `desireScore()`/`surpriseScore()`, mais il existe une
deuxième fonction, `scoreItems()`, bien plus riche, que j'avais manquée. Voici le tableau complet,
cette fois vérifié en entier.

---

## 1. Le cerveau — deux moteurs distincts, pas un seul

**`scoreItems()` — le vrai moteur de composition, utilisé pour construire le programme.**
Part d'une base de 50 points, puis ajoute ou retire selon des poids réellement différenciés (pas
un simple comptage à égalité comme je l'avais dit par erreur) :

| Signal | Poids | Codé en dur ? |
|---|---|---|
| Source officielle | +35 | oui |
| Météo chaude + activité nautique | +42 | oui |
| Date exacte demandée | +30 | oui |
| Famille + envie de souffler + catégorie adaptée | +24 | oui |
| Intention exprimée reconnue | +24 | oui |
| Séjour long + hôtel | +32 | oui |
| Retour négatif déjà donné (dislike) | −30 | oui |
| Coup de cœur déjà marqué | +20 | oui |
| Retour positif déjà donné (like) | +18 | oui |
| Pluie + activité culturelle/repli | +22 | oui |
| Goût appris (`tasteProfile`) | ×4 par point appris | **oui, personnalisé** |
| Ressenti d'une expérience vécue | ×5 | **oui, personnalisé** |
| Note Google ≥4,5 | +12 | oui |
| Budget correspondant au tarif | +12 à +16 | oui |
| Proximité <3km | +8 | oui |

**Réponse directe à ta question sur l'arbitrage prix/proximité/originalité** : le prix intervient
uniquement comme correspondance à la tranche de budget choisie (+12 à +16), jamais comme "moins
cher gagne face à plus cher" en soi. La proximité pèse assez peu (+8) comparée à une source
officielle (+35) ou une météo parfaitement adaptée (+42) — une pépite un peu plus loin mais
parfaitement adaptée à la météo l'emportera largement sur un lieu proche mais banal. C'est un vrai
arbitrage, avec de vrais poids différenciés, pas un score plat.

**`scenarioRank()` — utilisé uniquement dans Explorer, trié "recommandé".** Compte 0 à 4 points
(source fiable+notée, pépite prouvée, source officielle, événement daté proche), puis la surprise
(jamais vécu, hors zone habituelle), et **seulement en tout dernier recours** utilise le score
personnalisé de `scoreItems()` comme simple départage.

**Conséquence honnête, à ne pas minimiser** : dans Explorer trié par "recommandé", deux activités à
égalité de désir/surprise/compatibilité géographique s'ordonnent **sans tenir compte du goût
personnel** jusqu'au tout dernier critère de départage. La vraie personnalisation (goûts appris,
retours passés) est pleinement active dans la composition automatique du programme, mais reléguée
en dernier rang dans le tri manuel d'Explorer. Ce n'est pas un défaut caché — c'est un choix de
priorité (fiabilité et rareté avant goût personnel dans ce tri précis) qui mérite d'être assumé
explicitement plutôt que découvert par hasard.

**"À quel moment Dolcia commence-t-elle réellement à personnaliser ?"** — dès le premier programme
composé : `tasteProfile` et les retours passés influencent le score dès la première recommandation
qui suit un like/dislike ou un coup de cœur. Ce n'est jamais différé.

---

## 2. La confiance et l'explicabilité — un mécanisme réel existe déjà

**Vérifié** : la fonction `why()` construit une vraie explication, avec un ordre de priorité
clair — compatibilité horaire d'abord (incompatible/à vérifier), puis accord de groupe, puis accès
libre, puis "expérience régionale" avec temps de trajet annoncé, puis note Google avec nombre
d'avis, puis raisons de classement (`ranking.reasons`), puis météo, puis goût appris, puis intention
reconnue, puis note seule, puis proximité — et seulement en dernier recours une formule générique
("Sélection Dolcia pour élargir vos envies").

**C'est déjà une vraie explicabilité, pas une boîte noire.** Chaque item affiché montre une phrase
qui correspond à une vraie condition vérifiée dans le code, jamais une justification inventée après
coup. La hiérarchie ci-dessus EST la politique de confiance, déjà écrite, juste jamais formalisée
comme telle dans la documentation.

**Ce qui manque encore** : "quand la donnée a-t-elle été vérifiée" n'apparaît dans aucune de ces
phrases — le niveau riche/standard/minimale existe (`detailQuality`), mais la fraîcheur temporelle
de la vérification n'est jamais montrée à la personne. Une fiche vérifiée il y a un an et une fiche
vérifiée hier reçoivent aujourd'hui la même présentation si leur niveau de richesse est identique.

**Chantier concret** : documenter formellement la hiérarchie de `why()` dans `ARCHITECTURE.md`
comme "la politique de confiance", et envisager d'afficher une fraîcheur de vérification quand
elle est connue. Impact : élevé (c'est la promesse "je peux toujours expliquer pourquoi").
Difficulté : faible pour la documentation, modérée pour l'affichage de fraîcheur.

---

## 3. DATAtourisme — vérifié en direct, pas supposé cette fois

**Recherche réelle effectuée** : l'ontologie DATAtourisme contient bien, officiellement, des
champs "Heure de début", "Heure de fin", "Horaires d'ouverture en texte", "Spécifications
tarifaires en texte", "Payant", et un groupe `hasContact` (téléphone, etc.). La documentation
officielle de l'API confirme un paramètre `fields` permettant de les demander explicitement
(`GET /v1/catalog?fields=uuid,label,hasContact`).

**Vérifié dans notre code** : `server/datatourisme.js` n'utilise **aucun** paramètre `fields` —
la requête actuelle (`lang, page_size, geo_distance`) ne demande donc que ce que l'API renvoie par
défaut, et `normalize()` n'extrait que titre, date, ville, adresse, type, image, lien.

**Confirmation claire, pas une supposition cette fois** : il existe une vraie marge d'amélioration
immédiate, sans nouvelle source, sans nouveau connecteur — juste en demandant explicitement les
champs que l'API sait déjà fournir. C'est exactement la priorité que tu proposes, et elle est
maintenant vérifiée, pas juste plausible.

**Chantier concret et borné** : ajouter `hasContact`, les champs horaires et tarifaires au
paramètre `fields`, puis étendre `normalize()` pour les lire et les poser dans la fiche avec le
même principe déjà en place (`detailsVerified`, jamais un champ deviné). Je peux commencer ce
travail maintenant si tu le souhaites — c'est du code borné, pas une exploration.

---

## 4. Mémoire compagnon — vers une vraie narration

Tu as raison, et les données pour le faire existent déjà, stockées mais jamais racontées :
`experienceMemories` (avec date et participants), `tasteProfile` (catégories apprises, positives
ou négatives), `favorites`. Il manque seulement la phrase qui les relie.

**Exemple concret buildable maintenant, avec les données réellement disponibles** :
- Si `tasteProfile['outside'] > 2` et qu'une nouvelle activité de catégorie `outside` apparaît →
  *"Vous choisissez souvent des activités en plein air. J'en ai trouvé une qui pourrait vous
  plaire."* — jamais inventé, directement dérivé du chiffre réellement appris.
- Si `experienceMemories` contient un souvenir avec `people` incluant un enfant, et qu'une nouvelle
  proposition convient au même profil d'âge → une phrase qui le relie explicitement.

**Ce que je ne peux pas encore construire honnêtement** : l'exemple "la dernière fois que vous
étiez au Touquet" suppose de savoir que la personne **était** au Touquet à une date précise — cette
donnée (un lieu + une date de séjour passé) n'est aujourd'hui stockée dans aucun champ. Je peux
construire la phrase le jour où cette donnée existe réellement, pas avant.

---

## 5. Taux de surprise — je ne peux pas inventer un chiffre

**Je ne vais pas produire un "taux de découverte" ou un "taux de pépites" mesuré** — il n'existe
aucune donnée d'usage réel (aucun vrai utilisateur n'a encore ouvert l'application en dehors de
nos tests). Produire un pourcentage ici serait exactement l'illusion de précision que ce projet
interdit partout ailleurs.

**Ce que je peux honnêtement vérifier** : la mécanique existe (`surpriseScore`, le statut
`geoEligibility.status==='extended'` pour les pépites) et fonctionne comme prévu dans les tests
automatisés. Mais "fonctionne comme prévu en test" et "surprend réellement une vraie personne" sont
deux choses différentes — seule la seconde répond à ta question, et seule une vraie mesure
d'usage pourra y répondre un jour.

**La bonne prochaine étape, honnête** : instrumenter dès maintenant un compteur simple (combien de
fois un item marqué comme pépite/surprise a été ajouté à l'agenda, versus combien de fois il a été
proposé) — pas un audit, une vraie mesure à activer, dont le résultat n'existera qu'après un usage
réel.

---

## Priorité proposée pour la suite

Le chantier DATAtourisme (point 3) est le plus mûr : vérifié, borné, sans dépendance à un nouvel
usage réel. Dis-moi si tu veux que je le commence maintenant.
