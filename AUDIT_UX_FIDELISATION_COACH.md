# Audit UX, fidélisation et coach — deuxième passe, corrigée

Le premier audit a trop vite renvoyé "je ne peux pas juger sans utilisateurs réels" sur toute
l'expérience. C'était une erreur de calibrage, pas de principe : il existe une vraie différence
entre juger un **goût** (est-ce que ça plaît) — hors de ma portée sans usage réel — et repérer un
**défaut objectif** (une entrée dupliquée, une incohérence de transition, un mécanisme absent) —
tout à fait à ma portée en relisant le code. Cette passe corrige le tir, sur les trois points
soulevés, chacun vérifié dans le vrai code avant d'être écrit.

---

## 1. Immersion et hiérarchie — ce que je peux vérifier objectivement

**Trouvé, vérifié** : deux fonctions de rendu de carte quasi identiques coexistent
(`experience()` autour des lignes 1759 et 1773 de `app.js`) — une pour le contexte "surprise", une
pour "signature". Elles partagent presque tout leur balisage, avec de petites divergences (le
ruban "Sélection Dolcia", la présentation de la source). C'est un vrai risque de maintenance
objectif, indépendant du goût : une correction faite sur l'une peut être oubliée sur l'autre — et
ça s'est probablement déjà produit sans qu'on le remarque.

**Trouvé, vérifié** : le nombre de transitions CSS distinctes (38 réparties sur trois fichiers)
n'a jamais été audité pour une cohérence de durée/courbe. Certaines utilisent
`cubic-bezier(.16,1,.3,1)` (le rythme "premium" qu'on a choisi consciemment pour le Home), d'autres
un simple `ease`. Une incohérence de rythme entre écrans est un défaut objectif de continuité, pas
une question de goût.

**Ce que je ne peux toujours pas affirmer, honnêtement** : que l'accueil "vivant" (vidéo, météo
animée) manque *ressentiment* — ça, c'est un jugement sur l'effet produit, pas sur le code. Ce que
je peux confirmer sans ambiguïté : il n'existe **aucune** météo animée dans le code aujourd'hui, ni
aucune vidéo — ce n'est pas "moins immersif que souhaité", c'est "absent", un fait, pas une opinion.

**Chantier concret proposé** : fusionner les deux fonctions de carte en une seule, paramétrée par
contexte — élimine le risque de divergence silencieuse. Impact : confort/maintenance. Difficulté :
modérée. Ce n'est pas glamour, mais c'est le genre de dette qui coûte cher plus tard.

---

## 2. Fidélisation — ce qui existe vraiment, ce qui n'existe pas du tout

**Vérifié, existe réellement** :
- Une notion de "série" (`streak`) — mais **seulement à l'intérieur d'une session Dolcia Anime en
  cours**. Elle retombe à zéro à la fin de la session. Ce n'est pas un mécanisme de fidélité
  inter-jours, c'est un ressort de momentum intra-session.
- Un système de notification push pour les offres partenaires (`flash-notify.js`) — mais orienté
  offre commerciale, jamais pensé comme déclencheur d'habitude quotidienne.
- Trois points de retour haptique (ajout à l'agenda, réservation, démarrage Anime).

**Vérifié, n'existe pas du tout** : aucun badge, aucun défi quotidien, aucune notion de série
inter-jours, aucune recommandation qui évolue à mesure que la journée avance (le programme du
matin ne se met pas à jour tout seul si l'après-midi change de météo, par exemple — la personne
doit elle-même relancer un ajustement).

**La vraie question posée — "pourquoi ouvrir Dolcia demain, pas dans un mois" — n'a aujourd'hui
aucune réponse mécanique dans le code.** C'est un vrai vide, pas une nuance.

**Chantiers concrets, par priorité** :
1. **Une recommandation qui évolue dans la journée** (impact élevé, difficulté modérée) — le
   moteur météo/temps disponible existe déjà (`applyWeatherPlanB`) ; le brancher sur un vrai
   déclencheur automatique (pas seulement sur demande) est un chantier borné, pas une refonte.
2. **Une série inter-jours honnête** (impact modéré, difficulté faible) — mais attention : une
   série qui pousse à ouvrir l'app par culpabilité contredirait directement la philosophie déjà
   écrite ("Dolcia ne cherche jamais à capter l'attention"). Si elle existe, elle doit rester dans
   cet esprit — un compagnon de route, jamais une dette à rembourser.
3. **Badges** : je resterais prudent ici. Un badge récompense un comportement répété — c'est
   exactement le type de mécanique qui peut glisser vers la captation d'attention si mal conçue.
   À concevoir avec la même rigueur que le reste, pas ajoutée par réflexe parce que "ça marche
   ailleurs".

---

## 3. Coach animateur — pousser le dialogue sans avoir entendu la voix

Tu as raison : je peux écrire un meilleur coach sans avoir entendu le rendu vocal. C'est
exactement ce que le moteur de comportements (`ANIMATOR_BEHAVIORS`) a déjà commencé à faire —
plusieurs formulations tirées au hasard selon un signal réel, jamais une phrase figée.

**Vérifié, état actuel** : le moteur couvre aujourd'hui 4 comportements
(`feliciter_sans_gagnant`, `relance_apres_silence`, `conclure_avec_emotion`,
`suspense_avant_reveal`), avec 3 variantes chacun. C'est un vrai début, pas une bibliothèque
complète.

**Chantier concret que je peux faire maintenant, sans attendre d'entendre la voix** : étendre ce
même moteur avec de nouveaux comportements, toujours ancrés sur un vrai signal (jamais une
perception inventée) :
- **Accueil de début de session** — signal réel : `session.index===0`.
- **Relance après une série de "on accélère"** — signal réel : plusieurs réactions `livelier`
  consécutives déjà enregistrées dans `session.reactions`.
- **Variante spontanée sur demande explicite** — signal réel : réaction `skip`.

Dis-moi si tu veux que je les écrive maintenant, avec les mêmes garde-fous que d'habitude (jamais
de perception inventée, jamais de vouvoiement glissé, jamais de mot désignant un gagnant/perdant).

---

## Sur la question finale

*"Que changerais-tu pour que les gens ouvrent Dolcia avec le même plaisir que Flighty ou Airbnb ?"*

Je réponds avec ce que je peux honnêtement défendre, pas une inspiration esthétique : **je
donnerais à Dolcia une vraie raison mécanique de revenir chaque jour** (le point 2 ci-dessus), **je
supprimerais le risque de divergence silencieuse entre les deux templates de carte** (le point 1),
et **j'étendrais le moteur de comportements plutôt que d'attendre une refonte du Home** — parce
que c'est le seul des trois chantiers de ce document que je peux commencer immédiatement, vérifier
par des tests, et livrer aujourd'hui, sans devoir deviner un ressenti que je ne peux pas mesurer.
