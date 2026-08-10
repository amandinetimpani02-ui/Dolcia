# Architecture Dolcia — Le moteur de scénarios adaptatifs

Document de référence technique de la logique de décision. Ni la vision (`VISION.md`), ni l'état
technique actuel du projet (`MASTER.md`), ni l'historique (`CHANGELOG.md`) : ce texte décrit
uniquement comment le moteur décide, de façon durable — les choix d'implémentation précis (noms de
boutons, nombres exacts, notations visuelles) vivent dans `MASTER.md` et peuvent changer sans remettre
en cause ce document. Il fige l'architecture issue d'une session de réflexion produit complète
(30-31 juillet 2026). Toute évolution future du moteur de décision doit s'y conformer, ou le
modifier explicitement avec une raison majeure documentée — jamais par dérive silencieuse au fil des
développements.

**Statut : validé, stable. On ne fait plus évoluer l'architecture ; on construit dessus.**

---

## 0. Le principe fondateur

> Dolcia n'invente jamais. Elle adapte son niveau d'assurance à la qualité réelle de ce qu'elle
> sait, jamais à ce qu'elle voudrait savoir.

Ce principe est développé dans `VISION.md`. Il gouverne tout ce qui suit ici. Chaque règle de ce
document en est une application concrète dans un contexte précis — géographie, budget, mémoire,
classement, formulation. Si une future évolution semble contredire ce principe, elle est fausse,
même si elle semble pratique à court

terme.

Deuxième principe, qui découle du premier :

> Dolcia ne trie pas des lieux. Elle construit des scénarios de vie, et sait reconnaître quand elle
> ne sait pas.

Le slogan technique retenu : **le premier moteur de scénarios adaptatifs**, pas "le meilleur moteur
de recommandations". Un moteur de recommandations trie ce qui existe déjà. Un moteur de scénarios
adaptatifs construit une histoire crédible et apprend d'elle.

---

## 1. Home ≠ Explorer — deux écrans, deux règles, jamais confondues

C'est la distinction fondatrice de toute cette architecture. Les règles ci-dessous ne s'appliquent
**pas** aux mêmes endroits :

| | Home | Explorer |
|---|---|---|
| Nature | Une rencontre | Un espace de découverte |
| Nombre de propositions | Une seule, sauf égalité réelle (§7) | Une liste, jamais complétée artificiellement (§5.6) |
| Qui décide | Dolcia | La personne, aidée par le classement |

**Ne jamais appliquer la règle "une seule proposition" à Explorer.** Une liste y est légitime et
attendue. Ne jamais non plus faire remonter le réflexe "liste de 10" vers le Home — les deux règles
coexistent parce qu'elles gouvernent deux écrans différents, pas parce que l'une aurait remplacé
l'autre.

### 1.1 Le Home — trois niveaux

**Niveau 1 — L'accueil.** Une seule phrase, toujours différente d'un jour à l'autre. Aucune carte,
aucun bouton. Seulement un ton — une présence, jamais un personnage. La forme exacte de cette
présence (texte seul, icône, voix) est un choix d'implémentation, pas une règle d'architecture ;
voir `MASTER.md` pour l'état actuel.

**Niveau 2 — La proposition.** Juste en dessous. Une seule proposition dominante (ou deux en cas
d'égalité réelle, voir §7), choisie par Dolcia selon la hiérarchie de décision du §2. Présentée
comme un scénario avec un titre ("Évasion à Boulogne"), jamais comme une fiche de lieu isolée.

**Niveau 3 — Explorer et le reste.** Catégories, recherche, filtres, agenda. Visible seulement après
un geste (scroll), jamais imposé d'emblée.

**Niveau de continuité — toujours affiché, séparément.** Un rappel discret mais visible de ce qui
est déjà prévu (réservation ce soir, activité en agenda, billet à venir, session Anime commencée).
Alimenté uniquement par des faits réels de l'agenda, **jamais soumis au classement désir/surprise**
du §5 — la continuité protège contre l'oubli, elle ne rivalise jamais avec la séduction. Un
restaurant réservé à 20h ne doit jamais disparaître de l'écran parce qu'une pépite plus désirable a
pris la vedette du Niveau 2.

---

## 1bis. D et Anime — une personnalité, un rôle d'orchestration

**D est l'identité relationnelle unique. Anime est un mode d'action de D, pas un second personnage
et pas un catalogue de jeux.** Lorsqu'Anime est actif, D devient responsable du déroulement complet
de la session selon ce cycle :

```
accueillir → expliquer → répartir les rôles → lancer → rythmer → faire la transition
          → observer → adapter ou relancer → conclure
```

Le moteur de session conserve l'étape courante, les réactions, le rythme, les adaptations et la
progression. Les équipes, scores, séries et effets de suspense sont des capacités optionnelles : ils
ne s'activent que lorsque la nature de l'expérience et le groupe les rendent pertinents. Une séance
calme, de détente ou de bien-être ne devient jamais artificiellement compétitive.

À chaque instant, Anime doit savoir : ce qui vient d'être expliqué, ce que le groupe est en train de
faire, qui participe, si l'énergie monte ou baisse, quelle transition vient ensuite et comment la
session se termine. Elle ne génère jamais une consigne déconnectée de la session active et n'invente
aucun lieu, règle de sécurité ou fait externe.

La conclusion fait partie de l'animation : D annonce clairement la fin, célèbre sans désigner de
perdant humilié, récapitule la progression réelle et propose une suite seulement si elle est
pertinente. Une session interrompue reste reprenable sans recommencer à zéro.

## 2. La hiérarchie de décision (Niveau 2 du Home)

Sept niveaux, dans cet ordre strict. Chaque niveau ne s'active qu'après que le précédent soit
tranché.

```
1. Objectif de la sortie (intention émotionnelle)
        ↓
2. Temps disponible
        ↓
3. Scénario (parenthèse / découverte / journée complète / séjour)
        ↓
4. Ancrage (le lieu ou l'expérience qui structure le scénario)
        ↓
5. Centre du monde (fixe ou mobile, voir §4)
        ↓
6. Compléments (choisis autour du centre du monde, chacun selon son propre rôle)
        ↓
7. Budget (propriété du scénario entier, jamais une somme ligne à ligne)
```

### 2.1 Objectif de la sortie

Ce n'est **pas une nouvelle question à poser**. C'est une donnée déjà collectée ailleurs
(le "vibe" du D-Coach : rire et bouger, prendre l'air, décrocher, bien manger, découvrir, vibrer
ensemble) combinée à la composition du groupe déjà connue (âge des enfants, présence de
grands-parents). Le changement architectural est un changement de **séquencement** : cette
information, déjà là, doit être consultée en premier, avant le temps disponible — pas collectée en
plus.

### 2.2 Temps disponible

Se déduit d'abord des signaux de contexte, sans jamais poser de question par défaut :

- Heure actuelle (19h exclut mécaniquement "journée complète")
- Jour de la semaine (samedi ≠ mardi comme signal de disponibilité probable)
- Séjour déjà connu (dates de séjour déjà données ou déductibles de l'agenda)
- Agenda déjà rempli (borne naturellement la fenêtre réellement libre)
- Vacances scolaires (donnée publique réelle, zones A/B/C — jamais une supposition)

**Règle de décision** : si les signaux convergent vers une seule durée plausible, Dolcia agit
directement, sans question. Si plusieurs durées restent réellement plausibles, une question — une
seule, jamais une liste — peut être posée, et elle doit rester dans le registre émotionnel du §6,
jamais "combien de temps avez-vous ?". Elle EST déjà le choix du scénario : *"Une vraie journée
devant vous, ou plutôt une parenthèse ?"*

**Figé pour la session/journée en cours.** Ce calcul ne doit jamais se refaire à chaque ouverture de
l'app — rouvrir l'app trois fois le même mardi matin ne doit jamais produire trois scénarios
différents. Il ne change que si un fait réel change (la personne modifie son agenda, par exemple).

### 2.3 Scénario

Quatre types : parenthèse, découverte, journée complète, séjour. Déterminé par le temps disponible
(§2.2) croisé avec l'objectif (§2.1). Le scénario, pas la durée du lieu, pilote tout ce qui suit —
c'est le déclic central de cette architecture : Nausicaá n'est jamais écarté parce qu'il serait
"trop long", il est simplement hors de portée d'un scénario "parenthèse" de 2h, comme n'importe quel
autre ancrage qui ne rentrerait pas dans le temps choisi.

### 2.4 Ancrage

Le lieu ou l'expérience qui structure le scénario. Choisi parmi les candidats éligibles au scénario
retenu (le temps disponible pour cet ancrage doit correspondre), puis classé par désir et surprise
(§5). Porte un **rôle de mobilité** (§3) qui détermine jusqu'où on peut aller le chercher, et des
**caractéristiques propres** (§4.2) qui déterminent comment le reste de la journée s'organise autour
de lui.

### 2.5 Centre du monde

Voir §4 — fixe ou mobile selon le rôle de l'ancrage choisi.

### 2.6 Compléments

Choisis autour du centre du monde actif, chacun selon son propre rôle de mobilité (§3) — un
complément "essentiel du quotidien" (repas, glacier) reste toujours en mobilité locale stricte, même
si le centre du monde du scénario est temporairement Boulogne plutôt que Le Touquet.

### 2.7 Budget

Propriété du scénario entier, jamais une addition ligne à ligne calculée après coup. Certaines
lignes apparaissent ou disparaissent selon le contexte réel du scénario (hôtel absent si résidence
secondaire connue, repas à 0€ si pique-nique vérifié autorisé, parking et repas parfois inclus dans
un billet type parc à thème) — jamais supposées par défaut, toujours vérifiées avant d'être
retirées ou ajoutées.

---

## 3. Les rôles de mobilité, après la barrière de substituabilité

La mobilité dépend du rôle joué dans le scénario, mais ce principe ne contourne jamais la barrière
centrale : **la distance se mérite**. Une option plus lointaine ne gagne pas parce qu'elle est mieux
notée, plus connue ou plus spectaculaire. Restaurant et hôtel ne deviennent jamais des pépites
lointaines. Une catégorie générique déjà disponible localement reste locale. Le rôle n'est évalué
qu'après cette vérification de substituabilité.

### 3.1 Rôle "essentiel du quotidien"

Mobilité locale stricte, sans aucune exception, quelle que soit la qualité de l'offre. S'applique
quand l'élément est un accessoire du scénario, pas son sujet : restaurants, bars, cafés, commerces,
glaciers, boulangeries — quand ils accompagnent la journée sans en être le cœur.

C'est la règle "jamais hors commune" déjà construite et testée (correctif de commune réelle contre
distance). Cette règle **reste intacte et absolue** — voir §4 pour ce qui change réellement.

### 3.2 Rôle "destination qui structure la journée"

Mobilité régionale possible uniquement lorsque la personne recherche explicitement un scénario
singulier qui structure la journée et que sa durée rend le trajet cohérent. Une demande générique
(`aquarium`, `parc`, `activité familiale`) reste locale lorsqu'une alternative raisonnable existe.
Ainsi, une demande générique d'aquarium ne déclenche pas Nausicaá ; une demande explicite de grande
journée marine peut ouvrir un scénario régional, si la preuve, la rareté, la singularité et l'effort
de trajet sont établis. Ce n'est pas la catégorie qui mérite le trajet : c'est le scénario demandé.

### 3.3 Rôle "pépite qui justifie le trajet à elle seule"

Mobilité exceptionnelle, badge visible (`✨ Vaut le trajet` ou `💎 Pépite Dolcia`), réservée aux
expériences non substituables localement qui satisfont la doctrine du §8. Restaurant et hôtel en
sont toujours exclus. Une catégorie générique disponible localement n'y accède jamais par sa note,
sa notoriété ou sa qualité seules.

---

## 4. Le centre du monde mobile (bassin de vie temporaire)

Quand l'ancrage choisi porte le rôle "destination qui structure" ou "pépite", le centre du monde
pour **tous les compléments de ce scénario précis** se déplace vers la localisation de l'ancrage —
pour la durée du scénario uniquement, jamais de façon permanente, jamais pour l'application
entière, jamais pour un autre jour.

**Ce qui ne change pas** : la règle "jamais hors commune" (§3.1) continue de s'appliquer avec la
même rigueur — c'est son **point de référence** qui devient mobile, pas la règle elle-même. Si
Nausicaá est l'ancrage du jour, un restaurant cherché "autour" doit être dans la vraie commune de
Boulogne, pas simplement "pas trop loin du Touquet".

### 4.1 Ancrage total vs ancrage partiel

Ce n'est pas une propriété fixe du lieu — c'est déterminé par le scénario retenu (§2.3) croisé avec
les caractéristiques réelles du lieu (§4.2) :

- **Ancrage partiel** : laisse un vrai créneau libre avant ou après (ex. Nausicaá, ~2-3h). Les
  compléments se cherchent autour du lieu — restaurant, promenade, boutique.
- **Ancrage total** : consomme la journée entière (ex. parc d'attractions, station de ski, grand
  festival). Le repas ne se cherche plus autour du lieu mais **dedans** — restaurant sur place ou
  pique-nique, selon les caractéristiques vérifiées du lieu (§4.2) — et le scénario ne prévoit un
  élément extérieur que pour le créneau réellement libre, souvent seulement le soir, parfois aucun.

### 4.2 Caractéristiques des lieux — système à trois états, jamais des faits par défaut

Durée typique, autonomie du lieu, restauration sur place, pique-nique autorisé, parking, besoin de
réservation, contrainte météo. Ces caractéristiques ne sont **jamais présumées par catégorie** — un
parc d'attractions n'autorise pas automatiquement le pique-nique, certains l'interdisent
explicitement. Chaque caractéristique porte son propre état (voir §6, le même système que pour toute
autre donnée du moteur) :

- 🟢 **Vérifié** — source réelle (fiche officielle, donnée partenaire déclarée) → utilisable
  directement, affirmé sans détour.
- 🟡 **Déductible avec prudence** — signal faible (durée typique par catégorie de lieu, par
  exemple) → utilisable mais présenté avec un niveau de confiance visible, jamais affirmé comme un
  fait certain.
- ⚪ **Inconnu** — le moteur reste silencieux dessus, ou propose l'option de façon non affirmative
  ("pique-nique probablement possible, à vérifier sur place"), jamais imposé comme acquis.

**Attendu réaliste, pas un défaut à corriger** : au lancement, la majorité des lieux seront en état
⚪ sur la plupart de ces caractéristiques. L'architecture doit fonctionner correctement avec ça — pas
attendre une base de données parfaite qui n'existera jamais entièrement.

---

## 5. Le classement (Explorer, et sélection de l'ancrage du Home)

### 5.1 Étape 0 — Pertinence (filtre d'éligibilité, pas un score)

Binaire, sans exception. Un item n'entre dans le classement que si **toutes** ces conditions sont
vraies : compatible avec la date et l'heure, compatible avec la météo réelle, atteignable dans le
budget de temps de trajet du contexte (§8), compatible avec la composition du groupe connue, respecte
les contraintes déjà renseignées, disponibilité réellement vérifiée maintenant.

### 5.2 Étape 1 — Désir (parmi les items éligibles)

Compteur de signaux **vérifiés**, jamais une intuition : Sélection Dolcia (note ≥4,6, ≥50 avis,
confirmé) → +1 ; pépite prouvée (statut `extended`, rareté vérifiée) → +1 ; source officielle → +1 ;
événement limité dans le temps (daté, expire bientôt) → +1 ; qualité éditoriale ou partenaire
validée → +1. Score de 0 à 5, transparent, jamais caché.

### 5.3 Étape 2 — Surprise (uniquement si désir ≥ 1)

La surprise amplifie un désir déjà réel, elle ne le remplace jamais — sans cette condition, un item
médiocre mais "différent" pourrait gagner uniquement par nouveauté, ce qui recréerait l'aléatoire
qu'on refuse. Signaux : type d'expérience jamais proposé récemment à cette personne → +1 ; lieu
jamais consulté → +1 ; différent des habitudes récentes connues → +1 ; nouvel événement apparu
aujourd'hui même → +1 ; légèrement hors zone habituelle avec preuve de rareté → +1.

### 5.4 Étape 3 — Ordre de classement

Ordre lexicographique strict, **jamais une somme pondérée** (plus simple à tester, plus facile à
expliquer) :
1. Désir décroissant
2. Puis surprise décroissant
3. Puis expiration la plus proche (urgence réelle, jamais fabriquée)
4. Puis distance la plus courte
5. Puis un ordre stable et déterministe (jamais aléatoire à ce stade)

**Point de vigilance permanent, à surveiller à chaque évolution du moteur** : ne jamais laisser un
score de qualité générique (Sélection Dolcia seule) écraser une preuve de rareté réelle (pépite) au
classement. Une vraie pépite — une fête locale exceptionnelle, un concert gratuit rare, un coucher
de soleil précis — doit pouvoir battre une attraction bien notée mais ordinaire, parce qu'elle coche
à la fois désir et surprise.

**Figé une fois calculé pour la journée/session en cours**, comme le scénario du §2.2 — jamais
recalculé simplement parce que l'app est rouverte.

### 5.5 Cas où aucune proposition dominante n'est suffisamment fiable

Si le pool éligible est vide, ou si tout ce qui est éligible a désir = 0 : **aucune proposition
n'est forcée**. Le Niveau 1 du Home (la phrase seule) reste, avec une invitation neutre et élégante
à explorer — jamais une recommandation fabriquée pour combler l'espace.

### 5.6 Explorer — la liste

Un nombre limité de propositions, classées par le score du §5.2-5.4, présentées avec une échelle
simple et lisible — **jamais un pourcentage**, qui donnerait une illusion de précision que le moteur
n'a pas réellement. La notation exacte (cœurs, étoiles, ou autre) est un choix d'implémentation ;
voir `MASTER.md`. Sous chaque proposition, le "pourquoi aujourd'hui" en langage clair (météo idéale,
faible affluence, dans le budget) fait le travail de conviction — pas le score.

**Jamais complétée artificiellement.** Si seulement 6 propositions passent réellement la barre de
pertinence et de qualité, la liste en montre 6, pas un chiffre rond choisi à l'avance.

---

## 6. Le moteur de confiance — philosophie transversale, pas un mécanisme isolé

Chaque donnée que le moteur manipule — caractéristique de lieu, préférence utilisateur, temps
disponible, budget, mémoire de choix — porte un état parmi trois, jamais traité comme binaire
vrai/faux :

- 🟢 **Vérifié / connu** — peut être utilisé et affirmé directement, sans détour de langage.
- 🟡 **Déduit / probable** — peut être utilisé mais proposé avec prudence, jamais affirmé comme
  acquis.
- ⚪ **Inconnu** — ne doit jamais être affirmé. Conduit soit à une question simple (une seule,
  jamais une liste — voir §6.2), soit à une proposition neutre, jamais à une affirmation fabriquée.

### 6.1 Confiance globale vs confiance des composants — ne jamais confondre les deux

**Erreur corrigée pendant la réflexion** : la confiance d'un scénario n'est **pas** celle de son
maillon le plus faible. Une incertitude sur un élément périphérique (le restaurant, le parking) ne
doit jamais dégrader la confiance affichée d'un scénario dont le cœur est solide.

- **Confiance du scénario** — calculée uniquement sur ses éléments **structurels** : l'ancrage
  est-il ouvert, la météo convient-elle, le temps disponible correspond-il, c'est adapté au groupe.
  Si ces éléments sont tous 🟢, le scénario s'affiche avec assurance, même si un détail périphérique
  reste incertain.
- **Confiance des composants périphériques** — affichée séparément, à côté de l'élément concerné
  ("restaurant sur place — à confirmer"), sans jamais rabaisser le titre du scénario.

### 6.2 Une seule question, jamais une par inconnue

Si plusieurs dimensions sont simultanément ⚪ inconnues (objectif, temps disponible, budget), le
moteur ne pose **jamais** plusieurs questions. Une seule — celle qui change le plus la réponse parmi
toutes les inconnues actives — jamais une liste, jamais un questionnaire déguisé en conversation.

---

## 7. La mise en scène de la proposition unique

Le moteur ne se contente pas d'annoncer un résultat, il partage un raisonnement — comme le ferait un
ami qui connaît la région.

**Cas normal** : une seule proposition, présentée avec son "pourquoi" en langage clair.

**Cas d'égalité réelle** — rare, et seulement quand elle est réelle, pas approximative : le score
structurel (désir + surprise) est indissociable au niveau de précision dont le moteur dispose.
Jamais plus de deux options. Le cadrage reste à l'initiative de Dolcia ("J'ai deux idées qui valent
vraiment votre journée. J'en recommande une, mais j'ai hésité avec une autre.") — jamais une question
renvoyée à l'utilisateur ("laquelle préférez-vous ?"). Une recommandation claire reste mise en avant
visuellement (grande carte), l'alternative reste visible mais nettement plus discrète.

**Ne jamais confondre avec une liste.** Ce n'est pas un retour à "montrer plusieurs options" — c'est
une exception rare et assumée à la règle "une seule proposition", jamais un mode par défaut.

---

## 8. La règle nationale des pépites (déjà construite, intégrée ici)

Le budget de trajet pour un ancrage régional ou une pépite n'est **jamais** une distance fixe en
kilomètres (un rayon fixe n'a pas le même sens en zone rurale qu'en zone dense) — c'est un budget de
**temps de trajet**, dépendant de la durée du scénario (§2.3), identique dans son principe partout
en France (Le Touquet, Lyon, Brest testés avec le même résultat).

Le statut `extended` n'est jamais un simple élargissement géographique. Avant de l'accorder, la
barrière centrale vérifie ensemble : l'absence d'alternative locale raisonnable, une preuve
d'existence fiable, une rareté vérifiée, une singularité vérifiée, la capacité seulement lorsqu'elle
est pertinente et réellement connue, ainsi qu'un effort de trajet expliqué et compatible avec la
durée. Aucun signal n'est inventé. Une source officielle prouve l'existence, jamais la rareté à elle
seule. `USER_WIDENED_SEARCH` permet d'explorer plus loin mais ne transforme jamais, seul, une option
en pépite.

Les quatre sorties sont `core`, `extended`, `outside` et `location_unknown`. `outside` n'est jamais
proposé. `location_unknown` ne suppose aucune distance. Une activité remplaçable localement reste
`core` ou est écartée, même si l'option plus lointaine est mieux notée.

---

## 9. La mémoire — signaux à plusieurs niveaux, jamais un clic isolé

Un clic seul ne prouve pas une préférence vécue — il peut être suivi d'un abandon immédiat, ou d'un
véritable engagement. Cinq niveaux de signal, de force croissante :

1. **Intérêt** — la fiche a été ouverte.
2. **Préférence** — le scénario a été choisi.
3. **Engagement** — l'itinéraire a été lancé, une réservation faite, l'ajout à l'agenda confirmé.
4. **Confirmation** — la personne y est réellement allée. Ne repose jamais sur un suivi silencieux
   de position (contraire à la confidentialité déjà actée dans le produit) — uniquement via un
   signal volontaire (retour explicite, remise en agenda ultérieure).
5. **Satisfaction** — retour explicite, ou comportement cohérent qui le suggère fortement.

**Un choix isolé reste 🟡 probable.** Seule une répétition dans un contexte similaire fait monter une
préférence à 🟢 connu — jamais après un seul clic, pour éviter une confiance excessive fondée sur un
seul point de donnée.

**Mémoire unifiée, pas fragmentée.** Les signaux collectés dans le D-Coach, dans Dolcia Anime et
dans Explorer doivent alimenter une seule mémoire de relation, pas trois systèmes cloisonnés qui ne
se parlent pas. C'est un chantier reconnu comme non résolu à ce jour (voir l'audit produit du 30
juillet 2026) — cette architecture en pose le principe, sa construction reste à faire.

### 9.1 Les cinq couches de connaissance du territoire

**Précision explicite pour éviter tout amalgame** : ce principe (y compris les exemples "par temps
de pluie", "recommandée par les familles") est un principe national, valable pour n'importe quel
territoire couvert par Dolcia. Le Touquet et Hesdin n'apparaissent dans ce document que comme
terrains de test concrets utilisés pendant le développement — jamais comme le périmètre réel du
principe lui-même.

Au-delà d'un item isolé, la connaissance qu'a Dolcia d'un lieu ou d'une expérience se construit en
cinq couches, jamais confondues entre elles :

1. **Ce qui existe** — sources officielles (DATAtourisme, offices de tourisme, communes, salles).
2. **Ce qui se passe** — données vivantes (associations, billetteries, agendas locaux).
3. **Ce qui est reconnu** — convergence d'au moins deux sources indépendantes traçables (jamais un
   volume d'avis, jamais une ambiance devinée), ou une liste "coup de cœur" publiée par une source
   officielle elle-même.
4. **Ce qui correspond aujourd'hui** — le classement désir/surprise déjà décrit au §5, appliqué au
   contexte réel du moment (météo, heure, groupe, budget).
5. **Ce qui a réellement marqué des personnes comme vous** — des expériences confirmées (niveau
   Confirmation du §9), interrogées avec une seule question chaleureuse : *"Si votre meilleur ami
   venait demain dans la région, est-ce que vous lui conseilleriez cette expérience ?"* — jamais une
   note chiffrée, jamais 200 critères.

**Un signal n'existe qu'au-dessus d'un seuil minimum fixe, écrit, jamais affiché.** Le seuil exact
(un nombre précis de confirmations indépendantes) doit être documenté dans le code au moment de
l'implémentation, même si aucun chiffre n'est jamais montré à qui que ce soit — cacher un chiffre à
l'utilisateur est honnête ; ne fixer aucun seuil nulle part ne ferait que déplacer le flou.

**La règle du seuil s'applique à chaque segment indépendamment, jamais seulement au total.** Un
lieu peut avoir un badge global 🟢 solide sans qu'aucun segment ("recommandée par les familles",
"par temps de pluie") n'ait individuellement atteint son propre seuil. Dans ce cas, Dolcia reste
silencieuse sur ce segment précis — elle ne le remplace jamais par le score global déguisé, et ne
mentionne même pas qu'un segment existe tant qu'il n'est pas prouvé.

**Niveaux affichés, jamais un chiffre qui donnerait une fausse impression de précision :**
⚪ en cours de découverte · 🟡 signal en construction · 🟢 recommandation solidement confirmée.

**Chaque seuil est un contrat, pas une variable.** Un seuil de preuve (le nombre exact qui fait
passer un signal de 🟡 à 🟢) est fixe et versionné — son changement est toujours une décision
produit explicite, documentée dans `CHANGELOG.md`, jamais une modification de code anodine.

**Le nombre final n'est pas encore fixé, volontairement.** 30, 50 ou 80 ne peuvent pas être choisis
sérieusement sans connaître le taux de recommandation réellement observé, sa variabilité et le
niveau de précision voulu. Avant tout chiffre dans le code, la méthode de calcul doit être
formalisée, puis appliquée à de vraies données pilotes. Ce que cette méthode devra documenter,
précisément, au moment de son écriture :

- la méthode statistique retenue ;
- le niveau de confiance visé ;
- la marge d'erreur acceptable ;
- le minimum d'échantillon global ;
- le minimum d'échantillon par segment (indépendant du total, voir plus haut) ;
- la pondération des réponses récentes contre les anciennes ;
- les règles anti-manipulation (empêcher qu'un petit groupe de proches gonfle artificiellement un
  signal) ;
- la procédure obligatoire si le seuil doit évoluer un jour (recalcul, nouveau test, inscription
  au changelog — jamais un ajustement silencieux).

**Un seuil ne se justifie jamais par des adjectifs.** "Seuil robuste", "résistant aux
manipulations", "validé par nos tests" ne sont pas des justifications — ce sont des mots rassurants
qui ne montrent pas pourquoi ce nombre précis a été choisi plutôt qu'un autre. La documentation d'un
seuil doit montrer le raisonnement réel qui y mène, issu du calcul ci-dessus appliqué à de vraies
données — jamais une liste de qualificatifs.

**Un seuil ne se choisit jamais pour produire plus de vert.** Le critère de choix est uniquement le
niveau de confiance qu'on souhaite garantir — jamais le volume de recommandations positives que ce
seuil produirait.

---

## 10. La fonction de construction complète de scénario

Un point d'entrée (son nom exact et sa présentation sont un choix d'implémentation, voir
`MASTER.md`) qui ne remplace pas Explorer, mais construit un scénario complet, du type déterminé par
le temps disponible demandé (parenthèse / demi-journée / journée / 2 jours / séjour), présenté comme
un agenda avec horaires.

**Régénération granulaire** : toute la journée, ou uniquement un élément (le déjeuner, l'activité du
matin, la balade, la soirée) — sans casser le reste du scénario déjà construit. Chaque régénération
partielle reste soumise aux mêmes règles de rôle de mobilité (§3) et de centre du monde (§4) que la
construction initiale.

---

## 11. Ce que Dolcia ne peut jamais faire (limites assumées, pas des manques à corriger)

- Ne jamais promettre un souvenir ou une émotion — seulement révéler ce qui est rare et vérifié.
  Créer les conditions d'un souvenir fort n'est pas la même chose que le garantir.
- Ne jamais suivre silencieusement la position d'une personne pour déduire qu'elle est allée
  quelque part — la confirmation (§9) ne repose que sur un signal volontaire.
- Ne jamais afficher une caractéristique de lieu ⚪ inconnue comme si elle était 🟢 vérifiée.
- Ne jamais transformer une mise en scène d'égalité (§7) en une question posée à l'utilisateur.

---

## 12. Cas de non-régression — à vérifier à chaque évolution future du moteur

- Un item accessoire (repas, glacier) proposé hors de la vraie commune, même quand le centre du
  monde du scénario est ailleurs pour l'ancrage → régression sur §3.1 et §4.
- Une incertitude sur un composant périphérique qui dégrade la confiance affichée d'un scénario
  structurellement solide → régression sur §6.1.
- Plus d'une question posée alors que plusieurs inconnues existent simultanément → régression sur
  §6.2.
- La liste Explorer complétée artificiellement avec des propositions de qualité inférieure pour
  atteindre un chiffre rond → régression sur §5.6.
- Plus de deux options affichées sur le Home, ou une mise en scène d'égalité présentée comme une
  question renvoyée à l'utilisateur → régression sur §7.
- Une préférence traitée comme 🟢 connue après un seul clic → régression sur §9.
- Le scénario du jour ou le classement Explorer recalculés à chaque ouverture d'app plutôt que figés
  pour la session → régression sur §2.2 et §5.4.
- Un score de qualité générique qui bat une pépite à rareté prouvée au classement → régression sur
  §5.4.
- Une caractéristique de lieu (pique-nique autorisé, restauration sur place) affirmée sans source
  réelle → régression sur §4.2.
- Une affirmation présentée comme certaine (🟢) alors que la donnée réelle est déduite ou inconnue
  (🟡/⚪) → régression sur §6.
- Un segment ("recommandée par les familles", "par temps de pluie") affiché alors qu'il n'a pas
  atteint son propre seuil, même si le score global du lieu l'a atteint → régression sur §9.1.

---

*Document figé le 31 juillet 2026, à l'issue d'une session de réflexion produit. Toute modification
future doit être explicite et documentée ici, jamais silencieuse.*

## 13. La pyramide de confiance des sources — chantier stratégique, pas encore construit

Constat honnête, vérifié dans le code, pas supposé : Dolcia n'est aujourd'hui structurellement pas
nationale. Deux sources existent réellement — `touquet-events.js` (un script qui lit directement
le site officiel du Touquet, câblé sur cette seule ville) et `datatourisme.js` (une vraie base
nationale, mais dont la couverture réelle dépend entièrement de ce que chaque territoire y publie
lui-même, hors du contrôle de Dolcia). Aucune source réseaux sociaux, aucun système de contribution
des habitants n'existent à ce jour.

Le prochain grand chantier n'est plus le moteur de recommandation — il est déjà solide. C'est
l'acquisition et la vérification des données, à traiter comme un vrai produit, avec une stratégie
et des priorités, pas comme une suite de scripts ajoutés au fil de l'eau.

### Les cinq niveaux

1. **Sources officielles** — DATAtourisme, offices de tourisme, mairies, salles de spectacle,
   bases de loisirs, musées. Confiance la plus élevée, déjà en partie connectée.
2. **Organisateurs et partenaires vérifiés** — associations, MJC, clubs sportifs, écoles de
   cirque, fermes, domaines, théâtres indépendants, mais aussi tout établissement (musée, escape
   game, base nautique, parc de loisirs) qui gère lui-même sa propre fiche via un compte
   partenaire. **Le mot "vérifié" doit correspondre à une vraie procédure, jamais à une simple
   inscription** — confirmation de l'existence légale réelle de l'établissement et correspondance
   de l'adresse déclarée avec une source publique, avant qu'un compte obtienne le droit de publier.
   Un partenaire ne modifie jamais que sa propre fiche, jamais celle d'un autre. **Le grand public
   n'est jamais invité à créer une activité** — ce n'est pas sa raison d'ouvrir Dolcia, et lui
   demander de le faire contredirait la promesse même du produit.
3. **Réseaux publics** — pages publiques, événements publics visibles sans authentification.
   **Jamais pour publier automatiquement — uniquement pour détecter une piste à vérifier ensuite**
   contre une source de niveau 1 ou 2. Un signal de niveau 3, seul, n'est jamais une preuve.
   Techniquement et légalement limité : les groupes privés Facebook ne sont pas une source
   exploitable pour une collecte automatique.
4. **Retours des utilisateurs** — jamais la création d'une fiche, seulement des signaux courts et
   rapides : "le prix a changé", "c'est fermé aujourd'hui", "les horaires sont faux", "je
   recommande cette activité", "signaler un problème". Ce sont des corrections et des
   confirmations, jamais une tâche de rédaction confiée à l'utilisateur.
5. **La mémoire de Dolcia** — déjà documentée au §9.1 (les cinq couches de connaissance du
   territoire, les seuils de preuve). Ce niveau n'est pas nouveau, il referme la pyramide.

### Le score de couverture — seulement là où un vrai dénominateur existe

Savoir, territoire par territoire, où la couverture est solide et où elle est faible est une bonne
idée — mais elle doit respecter exactement la même règle que le reste de cette architecture :
**jamais un chiffre qui donne une fausse impression de précision** (voir §9.1, "un seuil ne se
justifie jamais par des adjectifs").

- **Là où un vrai dénominateur existe** (le répertoire national des associations, les registres
  officiels des offices de tourisme, les bases de données publiques de salles de spectacle) — un
  vrai pourcentage de couverture est calculable, et légitime à afficher.
- **Là où aucune vérité de référence n'existe** (réseaux sociaux, pages publiques en général) —
  aucun pourcentage ne doit être inventé. Le statut reste honnêtement `⚪ non mesurable`, jamais un
  chiffre qui rassure sans le mériter.

### Non-régression à ajouter à la liste du §12

- Un pourcentage de couverture affiché sans dénominateur réel vérifiable → régression sur ce §13.
- Une contribution d'habitant publiée sans étape de vérification → régression sur ce §13 et sur la
  loi constitutionnelle 18 (le silence est préférable à une affirmation fragile).

## 14. Le cycle de vie d'une fiche — de la détection à l'archivage

Ce document répond à une question que la pyramide des sources (§13) ne répond pas encore :
comment une activité détectée devient-elle une vraie fiche Dolcia, sans qu'un humain la réécrive
entièrement à la main ? **Une contribution — qu'elle vienne d'une source officielle, d'un
organisateur ou d'un habitant — n'a jamais pour objectif de produire une fiche complète. Elle a
pour seul objectif de révéler qu'une activité existe.** Tout le reste est un pipeline, pas une
tâche de rédaction.

### Les neuf étapes

```
Détection → Qualification → Fusion des sources → Validation automatique → Enrichissement Dolcia
→ Contrôles qualité → Publication → Mises à jour → Archivage
```

1. **Détection** — une activité est repérée, par n'importe quel niveau de la pyramide (§13).
   Information minimale : nom, lieu, date, source, lien.
2. **Qualification** — une activité détectée n'entre pas automatiquement dans le périmètre
   Dolcia. Une assemblée générale de copropriétaires est un événement réel, mais jamais une
   activité de loisir ; une initiation au canoë, oui. Cette étape écarte ce qui ne correspond pas
   au périmètre, avant d'investir le moindre effort d'enrichissement sur une entrée qui ne
   servira jamais.
3. **Fusion des sources** — si plusieurs sources décrivent la même activité, elles sont
   rapprochées en une seule entrée, jamais dupliquées.
4. **Validation automatique** — vérification de cohérence de base (la date existe-t-elle
   vraiment, l'adresse est-elle géolocalisable, la source est-elle identifiable).
5. **Enrichissement Dolcia** — complétion automatique à partir de données réellement
   disponibles (horaires, coordonnées, photos autorisées, tarifs). **Chaque champ enrichi doit
   passer le même contrôle de preuve que le reste de cette architecture (§9.1, §13) — un champ
   calculé sans base vérifiable réelle n'est jamais affiché comme un fait.** Une durée estimée sans
   heure de fin connue, par exemple, reste absente plutôt que devinée.
6. **Contrôles qualité** — vérification que la fiche respecte le format Dolcia, sans donnée
   fabriquée pour combler un champ vide.
7. **Publication** — la fiche apparaît dans l'application, au niveau de richesse honnête que ses
   données réelles permettent (voir la distinction ci-dessous).
8. **Mises à jour** — deux logiques différentes selon la nature de l'activité, jamais le même
   traitement :
   - **Activité permanente** (musée, escape game, restaurant, parc, zoo) — vit pendant des années,
     ses mises à jour portent sur des changements ponctuels (horaires, tarifs), jamais sur son
     existence même.
   - **Événement ponctuel** (marché, concert, atelier, festival) — a une fin connue ou déductible ;
     ses mises à jour incluent la question de sa disparition prochaine, pas seulement ses détails.
9. **Archivage** — une activité permanente fermée définitivement, ou un événement ponctuel passé,
   sort proprement du catalogue actif — jamais affiché comme s'il était encore valide.

**L'intervention humaine reste l'exception, réservée à deux cas** : un conflit entre plusieurs
sources qui se contredisent, ou une activité choisie pour un vrai traitement éditorial (voir la
distinction avec le niveau "riche" ci-dessous). Une modération manuelle systématique de chaque
nouvelle activité ne passerait jamais à l'échelle nationale — ce pipeline existe précisément pour
l'éviter.

### Le ton de D varie selon ce qu'on sait déjà, jamais selon un chiffre inventé

Une bonne intuition à formaliser correctement : D ne doit pas parler de la même façon d'une
activité largement confirmée et d'une activité à peine détectée. Mais un score numérique continu
(0 à 100) sans formule de calcul documentée serait exactement l'illusion de précision déjà interdite
au §9.1 et au §13, simplement déplacée vers l'interne plutôt que vers l'utilisateur. Le ton de D
doit donc varier selon les trois niveaux déjà existants (`detailQuality()`, riche/standard/minimale),
jamais selon un nombre parallèle inventé pour l'occasion :

- **Riche** → "Je vous recommande vivement…"
- **Standard** → "J'ai trouvé une activité qui pourrait vous plaire…"
- **Minimale** → une formulation encore plus prudente, jamais une fausse assurance.

### Deux axes distincts, à ne jamais confondre

**L'étape du pipeline** (où en est le traitement de cette fiche) et **le niveau de richesse**
(§`detailQuality()`, riche/standard/minimale — ce qu'on sait réellement d'elle) ne sont pas la même
chose. Une fiche peut avoir traversé tout le pipeline jusqu'à "Publication" et rester honnêtement
"minimale" si l'enrichissement automatique n'a rien trouvé de plus à ajouter. Le niveau "riche"
n'est jamais garanti par le seul fait d'avoir traversé le pipeline — il dépend uniquement de la
quantité de données réellement vérifiées disponibles, jamais de l'effort humain investi pour s'y
rendre.

### Non-régression à ajouter à la liste du §12

- Un champ "enrichi automatiquement" affiché sans base vérifiable réelle derrière (une moyenne
  inventée, une estimation isolée présentée comme un fait) → régression sur ce §14 et sur §9.1.
- Une activité archivée qui continue d'apparaître comme active dans le catalogue → régression sur
  ce §14.

## 15. Un bug réel trouvé grâce à une question précise — le festival en bloc vs. jour par jour

Question posée directement : le Festival des Tout-Petits remonte-t-il activité par activité, jour
par jour, ou seulement comme un bloc "du 11 juillet au 23 août" — inutilisable pour répondre à
"qu'est-ce qu'on fait aujourd'hui précisément" ?

Vérifié dans le code, pas supposé : c'était bien un seul bloc vague. Pire, sa description
affirmait "chaque rendez-vous conserve sa propre date", ce qui était faux — une seule entrée
existait réellement. Corrigé le 5 août 2026 avec les dix-neuf vraies dates individuelles, vérifiées
directement sur `letouquet.com` : chaque rendez-vous a maintenant sa propre entrée, sa propre date,
son propre lien vers la page officielle correspondante.

Ce cas illustre exactement pourquoi le cycle de vie décrit au §14 doit produire des entrées
individuelles pour un événement à rendez-vous multiples, jamais une seule entrée "chapeau" qui
masquerait le détail journalier — sans quoi le pipeline peut être techniquement fonctionnel tout en
restant inutile pour répondre à la question la plus fréquente : "aujourd'hui, précisément, qu'est-ce
qu'on fait ?"

## 16. Le festival comme événement parent, ses activités comme enfants autonomes

Vérification demandée directement : le festival remonte-t-il comme un seul bloc, ou activité par
activité ? Réponse honnête après vérification individuelle de plusieurs pages officielles : les
titres et dates de 19 rendez-vous existaient déjà, mais aucun ne portait de lien vers son
événement parent, et seule une minorité avait été vérifiée dans le détail (horaires exacts, âge,
tarif, lieu, repli pluie).

Corrigé : chaque activité porte désormais un champ `parentEvent` (jamais l'inverse — le festival
ne remplace jamais ses activités enfants). Les activités individuellement vérifiées sur le site
officiel (`detailsVerified: true`) portent leurs vrais horaires, âge, tarif et lieu. Les autres
restent honnêtement minimales (`detailsVerified: false`) — titre et date suffisent à les rendre
proposables, mais rien n'est deviné pour les champs non vérifiés.

Testé concrètement avant toute déclaration : une requête pour le 15 juillet 2026 retrouve bien
séparément "Atelier baby gym parent-enfant" (9h30, 11h00, 15h30, 17h00 — 2 à 6 ans — 8€) et "Jeux
de plein air" (14h à 18h, gratuit), jamais un bloc unique "Festival des Tout-Petits".

## 17. La règle générale — jamais un festival codé en dur, un modèle réutilisable

Le correctif du §16 résout le Festival des Tout-Petits, un seul festival, une seule ville. Ce
n'est pas une solution nationale — c'est une preuve que le modèle de données fonctionne. La règle
suivante doit s'appliquer à **tout** événement à programme, dans n'importe quelle ville, sans
jamais recopier ce travail à la main :

1. **Un festival est un événement parent, jamais une activité proposable en soi.** Il explique et
   regroupe, il ne se propose jamais directement à la place de ses activités.
2. **Chaque atelier, spectacle ou animation est un enfant autonome** — sa propre fiche, sa propre
   date, son propre lien, planifiable et réservable indépendamment du festival.
3. **Chaque date et chaque créneau doivent être planifiables.** Plusieurs horaires d'une même
   activité (`slots`) deviennent chacun leur propre entrée avec sa date réelle, jamais un texte qui
   les concatène ("9h30, 11h00, 15h30 et 17h00" n'est jamais un format valide). Une plage horaire
   continue (`hoursRange`) reste une seule entrée, mais structurée, jamais un texte libre non
   plus.
4. **Une activité enfant n'hérite jamais automatiquement des tarifs, âges ou horaires du festival
   parent.** Chaque enfant porte ses propres données, vérifiées indépendamment ; le lien
   `parentEvent` n'est qu'une référence explicative, jamais une source de valeurs par défaut.
5. **Les détails non vérifiés individuellement restent absents ou signalés comme tels**
   (`detailsVerified: false`) — jamais complétés par déduction à partir du festival parent ou par
   estimation.

### Ce qui reste à investiguer avant de coder un nouveau festival — non résolu ici

Avant d'intégrer un nouveau festival (à Lille, à Berck, ou ailleurs), il faut vérifier si le site
source expose ses sous-événements de façon exploitable automatiquement — un flux structuré
(JSON-LD, XML), une API ouverte, ou au minimum des pages individuelles à un modèle d'URL
prévisible. **Cette vérification n'a pas pu être menée pour letouquet.com avec les outils
disponibles ici** — un simple récupérateur de page ne permet pas d'inspecter le trafic réseau
qu'une page peut déclencher elle-même (un appel JSON invisible dans le HTML statique). Une vraie
investigation demande soit l'inspection des outils de développement d'un navigateur réel sur la
page de liste, soit un contact direct avec l'office de tourisme pour demander un accès à ses
données structurées — beaucoup utilisent des plateformes (Tourinsoft, e-tourisme) qui exposent
parfois de vraies API, sans que ce soit garanti pour ce territoire précis.

**Tant que cette vérification n'a pas été faite, aucun nouveau festival ne doit être intégré en
dur dans le code** — ce serait reproduire exactement le travail artisanal que ce chantier cherche à
éliminer, une ville à la fois, sans jamais construire le pipeline général.

## 18. Le moteur d'ingestion à connecteurs — troisième voie entre le tout-manuel et l'API magique

**État réel aujourd'hui, vérifié, pas supposé** : un seul festival (Festival des Tout-Petits, Le
Touquet) a été traité, et seulement 4 de ses 19 activités ont été vérifiées en détail. Aucun autre
festival, aucune autre fête, nulle part ailleurs en France — y compris la Fête du Cochon Rose à
Hesdin, testée à plusieurs reprises dans ce document — n'a bénéficié du même travail. Ce n'est pas
un chantier "en cours" : il n'a pas encore commencé au-delà de ce cas unique.

**Le vrai chantier national n'est pas de coder chaque festival à la main, ni d'attendre qu'une API
universelle existe.** Il est de construire un moteur d'ingestion d'événements qui transforme
automatiquement un programme structuré en activités individuelles lorsque la source le permet, et
qui dégrade proprement le résultat lorsqu'elle ne le permet pas.

### Le principe

```
Programme détecté (festival, saison culturelle, cycle d'animations)
        ↓
Dolcia reconnaît que cette page est un PARENT avec des activités FILLES
        ↓
Elle visite automatiquement les pages enfants (quand un connecteur le permet)
        ↓
Elle extrait date, heure, âge, prix, lieu, durée
        ↓
Elle crée automatiquement les fiches enfants, chacune avec parentEvent
        ↓
Le programme devient simplement le parent, jamais l'activité proposée elle-même
```

### Pas un script universel — des connecteurs réutilisables

Chaque site source a sa propre structure. Il n'existera jamais un lecteur unique capable de
comprendre tous les sites de France. La bonne architecture est un ensemble de **connecteurs**
(adaptateurs), chacun spécialisé par famille de site :

- un connecteur pour les offices de tourisme qui partagent une structure de page similaire ;
- un connecteur pour les plateformes de billetterie/événements standardisées ;
- un connecteur pour les agendas municipaux ;
- d'autres à ajouter au fil du temps, jamais tous d'un coup.

Un nouveau festival, sur un site déjà couvert par un connecteur existant, devient immédiatement
exploitable sans travail manuel. Un festival sur un site sans connecteur reste au niveau
"Découverte" (§14) — nom, lieu, date — jusqu'à ce qu'un connecteur adapté existe, jamais complété
par une supposition en attendant.

### Dégrader proprement, jamais fabriquer

Quand un connecteur ne peut pas extraire un champ (heure précise, âge, tarif), la fiche enfant
reste honnêtement incomplète — exactement la même règle que pour le Festival des Tout-Petits
(`detailsVerified: false`). Un festival annoncé sans qu'on sache quelle animation se joue tel soir
précis ne rend aucun service à personne : c'est précisément le cas qu'un connecteur bien conçu doit
éliminer, pas contourner en devinant.

### Ce qui reste à construire — non commencé

Aucun connecteur n'existe aujourd'hui. Le travail effectué pour le Festival des Tout-Petits (§16,
§17) est resté entièrement manuel — une preuve que le modèle de données fonctionne, jamais une
automatisation. Avant d'ajouter de nouvelles fonctionnalités visibles, une vraie phase dédiée à ce
moteur devrait précéder tout élargissement de la couverture géographique : c'est lui qui donnera au
moteur de recommandation, déjà avancé, une matière première à la hauteur de son ambition nationale.

## 19. Hypothèse H-12 — évolution progressive de la personnalisation (non implémentée, volontairement)

**Constat déjà établi (§5.4)** : le goût personnel n'entre dans l'ordre de classement d'Explorer
qu'en tout dernier recours, un choix documenté et assumé (explicabilité, protection des pépites),
mais qui n'avait jamais envisagé la durée de la relation avec la personne.

**Hypothèse posée, pas tranchée** : après un certain niveau de confiance (un nombre
d'interactions confirmées à définir), le goût personnel pourrait entrer plus tôt dans l'ordre
lexicographique du §5.4 — jamais en remplaçant la règle, en ajoutant un palier explicite.

**Pourquoi elle reste une hypothèse, pas un correctif** : aucun vrai utilisateur n'a encore utilisé
Dolcia. Nous ne savons pas si les personnes préfèrent des recommandations très fiables ou très
personnalisées à mesure que la relation grandit — c'est une question produit, pas un bug à
corriger. Cette évolution sera validée ou rejetée après une vraie observation d'usage, jamais
décidée par supposition.

## 20. La politique de fusion entre sources — pour chaque champ, une priorité et une raison

Chaque information peut provenir de plusieurs sources à la fois. Sans règle explicite, la fusion
devient un empilement d'exceptions ad hoc. Voici la politique, champ par champ — et pour chacun,
**la décision de Dolcia qu'il améliore réellement**, pas seulement "une donnée en plus" :

| Information | Source prioritaire | Source secondaire | Ce que ce champ améliore réellement |
|---|---|---|---|
| Horaires | Organisateur officiel (partenaire ou site propre) | DATAtourisme, puis Google | Savoir si une activité est réellement ouverte au créneau proposé — sans lui, la fiche reste `timeKnown:false` (§9.1) |
| Tarif | Organisateur officiel | DATAtourisme, puis estimation par catégorie (§9.1) | Le filtre budget (§2 du code) et le calcul de coût de journée (`estimateItemCost`) |
| Téléphone, email, site | Organisateur officiel | Google, puis DATAtourisme | L'action "Appeler"/"Site officiel" des fiches (§ actions comme données) — sans lui, l'action reste absente, jamais simulée |
| Description | Organisateur officiel | Google (résumé éditorial), puis DATAtourisme (`hasDescription`) | La qualité perçue de la fiche riche, jamais un texte qui remplace le classement |
| Photos | Organisateur officiel | Google, puis DATAtourisme | La même chose — jamais un facteur de classement, uniquement de présentation |
| Durée | Organisateur officiel | Aucune source fiable actuellement | **Directement le moteur** : savoir si deux activités s'enchaînent sans conflit, et si une journée composée reste réaliste (`buildProgram`) |
| Accessibilité PMR | Organisateur officiel | Aucune source fiable actuellement | Un nouveau filtre réel (aujourd'hui absent), pas une case cosmétique |
| Animaux acceptés | Organisateur officiel | Aucune source fiable actuellement | Un nouveau filtre réel, même logique |
| Langues parlées | Organisateur officiel | Aucune source fiable actuellement | Utile uniquement le jour où Dolcia sert un public non francophone — pas une priorité actuelle |

**Règle générale de fusion, valable pour toute future source (les "15 nouvelles sources" à venir
n'obligeront jamais à réinventer cette logique)** : la source la plus proche de l'établissement
lui-même gagne toujours. En cas d'absence, la source suivante du tableau prend le relais. Si
aucune source ne fournit le champ, il reste honnêtement absent (§9.1, §14) — jamais reconstruit
par déduction entre deux sources qui se contredisent sans arbitrage explicite.

## 21. Le modèle de confiance enrichi — origine, fraîcheur, raison

Au-delà de `detailsVerified` (oui/non) et `detailQuality` (riche/standard/minimale), chaque champ
individuel devrait pouvoir répondre, disponible pour l'interface sans être forcément toujours
affiché :
- **Origine exacte** — quelle source précise a fourni ce champ précis (pas seulement "vérifié",
  mais "vérifié par qui").
- **Date de dernière vérification** — pas seulement "vérifié", mais "vérifié quand".
- **Niveau de confiance** — un des trois paliers déjà existants (§9.1), jamais un nombre inventé.
- **Raison** — la règle du tableau du §20 qui a conduit à ce choix, pour qu'une réponse comme
  *"Les horaires viennent du site officiel, vérifiés il y a deux jours ; le tarif vient de
  DATAtourisme et n'a pas pu être confirmé aujourd'hui"* devienne possible sans être fabriquée.

**Implémenté partiellement aujourd'hui, sur ce qui vient d'être construit** : l'extraction de
contact DATAtourisme (§20) porte maintenant l'origine et l'instant de récupération — voir le code.
Le reste (raison explicite lisible, niveau de confiance par champ plutôt que par fiche entière)
reste à construire progressivement, champ par champ, jamais tout d'un coup.

## 22. Le modèle de décision par champ — quatre questions, jamais trois

Le §21 pose l'origine, la fraîcheur et le niveau de confiance. Il manque la quatrième question,
la seule qui rend les trois premières utiles : **comment ce champ influence-t-il réellement une
décision de Dolcia ?** Sans elle, l'origine et la date restent des métadonnées curieuses, pas de
l'intelligence exploitable.

Chaque champ individuel d'une fiche devrait pouvoir répondre, en interne, à ces quatre questions —
jamais toutes affichées à l'utilisateur, mais toutes disponibles pour l'interface et pour le
moteur :

```
horaire
  source            : Office de tourisme
  dernière vérification : 2026-08-06T14:22:00+02:00
  niveau            : Officiel
  utilisé pour      : composition de journée (§5, buildProgram — évite un conflit de créneaux)
```

**La règle de fond, pour que ce modèle reste honnête et ne dérive jamais** : la case "utilisé
pour" ne peut renvoyer qu'à une décision **déjà codée et vérifiable** dans le moteur (une ligne de
`scoreItems`, un filtre réel, une règle de `buildProgram`) — jamais une intention future ou un
bénéfice supposé. Si un champ n'influence encore aucune décision réelle, la case reste vide plutôt
que remplie d'une promesse. C'est exactement la même discipline que le reste de cette architecture,
appliquée cette fois à la structure de la donnée elle-même, pas seulement à son contenu.

**Correspondance avec ce qui existe déjà** : la case "utilisé pour" de chaque champ du tableau du
§20 est la même information, déjà écrite — ce modèle ne la remplace pas, il lui donne une forme
individuelle, par champ et par fiche, plutôt qu'un tableau global de référence.

## 23. L'architecture unique des connaissances — une seule page, pas des sections dispersées

Ce document a construit, séparément, la pyramide des sources (§13), le cycle de vie d'une fiche
(§14), le moteur d'ingestion à connecteurs (§18), la politique de fusion (§20), le modèle de
confiance (§21) et le modèle de décision par champ (§22). Cette section les relie en une seule
chaîne, pour qu'aucune future évolution n'oublie où elle s'insère :

```
Information
    ↓
Qualification
    ↓
Fusion
    ↓
Confiance
    ↓
D©cision
    ↓
Explication
    ↓
Recommandation
```

- **Information** — une donnée brute apparaît, par n'importe quel niveau de la pyramide (§13).
- **Qualification** — elle entre ou non dans le périmètre de Dolcia (§14, étape 2).
- **Fusion** — si plusieurs sources la décrivent, la politique du §20 arbitre laquelle gagne,
  jamais un mélange silencieux de deux sources contradictoires.
- **Confiance** — chaque champ retenu porte son origine, sa fraîcheur et son niveau (§21).
- **Décision** — chaque champ ne compte que s'il influence réellement une règle du moteur (§22,
  §5) — jamais une donnée stockée sans effet.
- **Explication** — la fonction `why()` traduit cette chaîne en une phrase compréhensible, jamais
  une justification inventée après coup (déjà vérifié et documenté au §9).
- **Recommandation** — ce que la personne voit enfin, avec la certitude que chaque étape en amont
  peut être remontée et expliquée si elle demande "pourquoi celle-ci ?".

**C'est la philosophie de Dolcia résumée en une seule chaîne** : aucune étape ne peut être
sautée, aucune donnée n'atteint la recommandation sans avoir traversé la qualification, la
fusion et la confiance — et aucune n'est retenue si elle n'aboutit à aucune décision réelle.

## 24. Le cycle d'amélioration continue — la dernière brique, pas encore active

Le §23 explique comment Dolcia décide. Il manquait comment Dolcia progresse. Cette section pose
le cycle, sans prétendre qu'il tourne déjà — il ne le peut pas, faute d'usage réel à observer.

```
Observation
    ↓
Mesure
    ↓
D©cision
    ↓
Évolution
```

- **Observation** — les vrais signaux d'usage : une recommandation cliquée, ignorée, ajoutée à
  l'agenda, une pépite proposée puis choisie ou jamais retenue. Rien de nouveau à construire ici :
  la plupart de ces événements existent déjà comme actions dans le code (`addAgenda`, `rate`,
  `saveFeeling`) — ce qui manque est de les agréger dans le temps, pas de les créer.
- **Mesure** — transformer ces signaux en une vraie statistique, seulement une fois qu'un volume
  suffisant existe. C'est précisément ici que prendrait forme le "taux de surprise" ou le "taux de
  pépites" — refusé plus tôt dans cette conversation comme un chiffre qu'on ne pouvait pas encore
  mesurer honnêtement. Ce chantier ne l'invente pas rétroactivement : il construit l'endroit où ce
  chiffre naîtra le jour où il existera réellement.
- **Décision** — une hypothèse documentée (comme H-12, §19) est confirmée ou infirmée par cette
  mesure, jamais par intuition.
- **Évolution** — le changement n'entre dans le moteur qu'après cette décision, et cette décision
  elle-même devient une ligne du `CHANGELOG.md`, justifiée par la mesure qui l'a produite — jamais
  un ajustement silencieux.

**Ce cycle applique à l'évolution du produit lui-même la même règle que toute cette architecture
applique aux données** : aucune conviction, même la mienne ou celle d'Amandine, ne remplace une
preuve. Une intuition peut proposer une hypothèse (§19) ; seule une observation réelle peut la
faire devenir une règle.

**État aujourd'hui, honnêtement** : les trois premières étapes sont prêtes à recevoir de la donnée
réelle. La quatrième n'a encore rien à évoluer, puisqu'aucune mesure n'existe encore. Ce n'est pas
un chantier à construire davantage aujourd'hui — c'est un chantier qui attend son premier usage
réel pour commencer à tourner.
