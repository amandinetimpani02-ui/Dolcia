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

## 3. Les rôles de mobilité (pas des catégories figées)

Erreur initiale corrigée pendant la réflexion : la mobilité n'est **pas une propriété de la
catégorie** ("restaurant = local", "aquarium = régional"). C'est une propriété du **rôle que joue
l'expérience dans le scénario du jour**. Un restaurant peut être une pépite gastronomique qui
justifie 40 minutes de route ; le même restaurant, simple pause déjeuner d'un scénario construit
autour d'autre chose, reste en mobilité locale stricte.

### 3.1 Rôle "essentiel du quotidien"

Mobilité locale stricte, sans aucune exception, quelle que soit la qualité de l'offre. S'applique
quand l'élément est un accessoire du scénario, pas son sujet : restaurants, bars, cafés, commerces,
glaciers, boulangeries — quand ils accompagnent la journée sans en être le cœur.

C'est la règle "jamais hors commune" déjà construite et testée (correctif de commune réelle contre
distance). Cette règle **reste intacte et absolue** — voir §4 pour ce qui change réellement.

### 3.2 Rôle "destination qui structure la journée"

Mobilité régionale, budget de temps de trajet (règle nationale déjà construite : temps, jamais
kilomètres fixes — voir §8), mais seulement si l'expérience est objectivement la meilleure de sa
catégorie dans la zone atteignable, jamais simplement la plus proche. Aquariums, zoos, parcs
d'attractions, grands musées, parcs naturels, accrobranches, grandes expositions.

**"Le meilleur bat le plus proche"** : ancré dans une donnée réelle — le volume d'avis combiné à la
note (déjà en partie construit avec "Sélection Dolcia") capture objectivement la notoriété la
plupart du temps. Nausicaá a des dizaines de milliers d'avis, un petit aquarium régional en a
quelques centaines : la référence ressort du fait, jamais d'un jugement de qualité fabriqué par une
IA.

### 3.3 Rôle "pépite qui justifie le trajet à elle seule"

Mobilité exceptionnelle, badge visible (`✨ Vaut le trajet` ou `💎 Pépite Dolcia`), réservée aux
expériences avec preuve de rareté réelle et forte qualité, déjà construite cette semaine (statut
`extended` du moteur géo, section 8). N'importe quelle catégorie peut accéder à ce rôle si elle le
mérite vraiment — y compris un restaurant.

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

Une pépite doit en plus être **officielle et datée** (rendez-vous réel et vérifié, jamais un lieu
permanent) et ne jamais être un événement manifestement récurrent (chaque semaine) confondu avec une
vraie rareté.

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
