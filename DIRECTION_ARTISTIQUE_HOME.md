# Direction artistique du Home Dolcia

Ce document ne contient aucune ligne de code. C'est un scénario — le rôle du réalisateur, pas du
développeur. Il s'articule avec ce qui existe déjà dans le code (`HOME_SEQUENCES`,
`homeCinemaAlreadyShownToday`, le principe de révélation honnête) plutôt que de le remplacer.

**Correction majeure par rapport à la première version de ce document : 12 secondes était trop
long, et le scénario ne peut pas être centré uniquement sur Le Touquet.**

---

## Deux rythmes, jamais un seul

### Première découverte de Dolcia — 5 à 6 secondes maximum
Le film complet ne se joue qu'une seule fois : la toute première fois que la personne ouvre
Dolcia. C'est déjà exactement la règle que `homeCinemaAlreadyShownToday()` applique dans le code —
ce document en étend simplement le principe à la séquence filmée.

**Un bouton "Passer" reste visible dès la première seconde**, jamais après un délai — quelqu'un qui
ne veut pas attendre ne doit jamais être forcé de le faire.

### Toutes les ouvertures suivantes — instantané
Scène et action visibles en moins d'une seconde. Aucune répétition du film. C'est là qu'intervient
la distinction suivante.

---

## Le film ne se joue pas tous les jours — distinguer ouverture et révélation

Un mardi ordinaire, sans rien d'exceptionnel à annoncer, l'application doit s'ouvrir **directement**
sur une proposition élégante — pas rejouer un générique. Le film complet ne revient que dans deux
cas précis :

1. **La toute première découverte de Dolcia** (une fois, jamais répétée).
2. **Un vrai moment exceptionnel qui mérite une mise en scène** — exactement le rôle déjà tenu par
   les contextes `gem` et `unique_event` dans `HOME_SEQUENCES` : une pépite vérifiée, un événement
   daté qui ne se reproduira pas. Jamais un jour ordinaire habillé pour ressembler à un jour
   exceptionnel.

Optionnellement : une fois en tout début d'un séjour identifié, si cette donnée existe réellement.

---

## Une grammaire de plans, pas un seul décor

Le scénario "vague, terrasse, mouette" ne fonctionne qu'au bord de mer. Dolcia doit fonctionner
partout en France — il faut donc des **familles de plans**, choisies selon le territoire réel et la
proposition du jour, jamais une seule imposée partout :

- **Littoral** — vague, terrasse en bord de mer, oiseau marin, lumière sur l'eau.
- **Ville** — une rue pavée, une terrasse de café urbaine, une façade ancienne, une place animée.
- **Campagne** — un chemin, un champ, une ferme, un marché de village.
- **Montagne** — un sommet, un sentier, un chalet, une lumière d'altitude.
- **Patrimoine** — une pierre ancienne, un vitrail, un cloître, un détail architectural.
- **Pluie / intérieur** — une fenêtre embuée, un feu de cheminée, un livre, une tasse fumante.
- **Événement exceptionnel** — des plans propres à l'événement lui-même, jamais génériques.

**Le principe cinématographique reste identique dans tous les cas** (mouvements lents, jamais de
regard caméra, une seule cohérence de lumière, silence ou son réel discret, fondu enchaîné) — seul
le contenu des plans change selon le lieu et le contexte réel.

---

## Le découpage type (exemple littoral, à décliner selon la famille de plans)

### Plan 1 — 1,5 seconde
Un détail du décor choisi (la vague, la rue pavée, le sentier…). Fixe ou travelling à peine
perceptible. Silence, ou son réel discret.

### Plan 2 — 1,5 seconde
Un geste humain simple et discret (des mains qui posent deux tasses, une main qui pousse une porte
de boutique…). Jamais de visage entier, jamais de regard caméra.

### Plan 3 — 2 secondes, le cœur émotionnel
Une scène de vie brève (un rire, un échange, un mouvement naturel). Léger panoramique, lumière
cohérente avec les plans précédents.

### Plan 4 — le texte
Fondu vers le texte, apparition douce.

### Plan 5 — l'action
Un battement de silence, puis l'action unique.

**Total : environ 5 à 6 secondes**, texte et action compris — la moitié du minutage initial.

---

## La phrase doit toujours reposer sur un fait réel, jamais une formule répétée

*"J'ai pensé à quelque chose pour aujourd'hui."* devient artificielle si elle revient chaque jour
sans rien derrière. C'est exactement le principe déjà posé pour `HOME_SEQUENCES` dans le code : une
phrase qui s'appuie sur un signal réellement vérifié (météo, horaire, durée disponible, pépite
datée) plutôt qu'une formule vide.

Exemples fondés sur un vrai fait :
- *"Ce soir, quelque chose ne durera que quelques heures."* — uniquement si un événement daté et
  vérifié le justifie.
- *"Vous avez deux heures avant votre dîner."* — uniquement si l'agenda réel de la personne le
  confirme.
- *"J'ai trouvé une idée qui fonctionne avec cette pluie."* — uniquement si la météo réelle
  confirme la pluie.

**Quand aucun fait suffisamment solide n'existe, une formulation neutre et honnête reste
préférable à une fausse tension** — exactement le principe déjà établi pour le contexte `ordinary`
dans le code (jamais une observation inventée, même émotionnelle).

---

## Ce qui n'apparaît qu'après le geste de la personne

Explorer, Agenda, Coach, Dolcia Anime — aucun n'apparaît avant que la personne ait elle-même agi :
touché l'action, ou fait défiler l'écran vers le bas.

---

## Comment produire réellement ces plans

Trois chemins possibles, aucun ne dépend de moi pour l'exécution :

1. **Captation réelle**, par famille de territoire — la meilleure option, un vrai chantier
   logistique, probablement étalé dans le temps à mesure que Dolcia couvre de nouvelles régions.
2. **Vidéo libre de droits**, en attente, uniquement pour tester la sensation, jamais comme version
   finale.
3. **Génération par IA vidéo** (Runway, Veo, Kling, Luma…) — je peux écrire le prompt exact pour
   chaque plan de chaque famille, prêt à copier-coller. Je ne peux pas les générer moi-même.

Dis-moi quelle famille de plans tester en premier (probablement littoral, pour rester cohérent avec
le travail déjà fait sur Le Touquet), et laquelle des trois pistes de production tu veux explorer.
