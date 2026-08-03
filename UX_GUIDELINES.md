# Dolcia — Guide d'interface (UX Guidelines)

Ce que "ressembler à Dolcia" veut dire concrètement. Le risque n'est pas qu'un futur développeur
casse l'algorithme — les tests s'en chargent. Le risque, c'est qu'il construise un écran juste, mais
qui ne ressemble plus à Dolcia. Ce document existe pour que cette connaissance ne reste pas
seulement dans une tête.

---

## Comment un écran doit respirer

Une idée par écran. Jamais un formulaire qui ressemble à une déclaration administrative. Les grandes
photos priment sur le texte — un écran qui a besoin de beaucoup de mots pour se faire comprendre est
un écran à repenser, pas à sous-titrer davantage.

Espacement généreux plutôt que dense. Un écran chargé donne une impression de prototype ; un écran
qui respire donne une impression de confiance.

## Liquid Glass — les vraies valeurs utilisées

Le style verre dépoli d'Apple (iOS 26), pas une esthétique générique :

- Flou de fond : `blur(18px)` à `blur(34px)` selon la profondeur de l'élément (plus profond = plus
  flou), toujours combiné à `saturate(1.2–1.35)` pour éviter un rendu terne.
- Fond translucide en dégradé, jamais une couleur plate : `linear-gradient(145deg, rgba(...,.67),
  rgba(...,.62))`.
- Un reflet net sur le bord supérieur des panneaux (`::before`, un dégradé linéaire de 45% à 55%
  d'opacité) — la vraie signature du Liquid Glass, pas juste le flou.
- Une ombre portée qui fait flotter l'élément (`0 24px 60px -20px rgba(0,0,0,.55)`), jamais un flou
  posé à plat sans profondeur.

## Animations et transitions

La courbe de référence de tout Dolcia : `cubic-bezier(.16,1,.3,1)` — une décélération douce façon
Apple, utilisée pour la grande majorité des transitions de cartes et de boutons. Variantes
acceptées selon le contexte : `cubic-bezier(.2,.7,.2,1)` et `cubic-bezier(.2,.8,.2,1)` pour des
mouvements un peu plus vifs, `cubic-bezier(.35,.1,.6,.9)` réservé aux confettis et célébrations.

Chaque animation doit être utile — indiquer un changement d'état, guider l'attention, confirmer une
action. Jamais décorative sans raison.

Toute animation continue (particules, respiration, pouls) doit avoir sa contrepartie
`@media(prefers-reduced-motion:reduce)` qui la désactive. Sans exception.

## Gestes et navigation

Cliquer reste toujours aussi valable que parler — les deux chemins annoncés, jamais l'un caché.

**Une seule porte de recherche visible par contexte.** Ne jamais superposer deux façons de dire la
même chose à Dolcia (ce principe a déjà empêché une régression réelle — voir `CHANGELOG.md`).

Le Home ne montre jamais de liste. Explorer en montre une, jamais complétée artificiellement pour
atteindre un chiffre rond.

## La voix de D

Jamais de formule de service client ("je comprends votre demande", "n'hésitez pas"). Jamais deux
fois la même formule d'ouverture. Une question à la fois, dans un registre émotionnel, jamais
technique : "Vous avez envie de rire, ou plutôt de souffler ?", jamais "Quelle catégorie ?".

**Tu/vous, règle tranchée le 1er août 2026, jamais mélangée.** Dolcia concierge (Home, Explorer,
D-Coach) vouvoie — plus élégant, plus universel, cohérent avec un rôle de concierge de luxe. Dolcia
Anime tutoie — comme un GO, une mascotte, jamais un concierge — mais uniquement la voix de
l'animateur qui parle en direct pendant une session (`animateCoachLine`, `animateStepText`,
`animateNudgeLine`, `animateContinuityGreeting`, `animatePersonalTouch`) ; le texte d'interface
générique à l'intérieur même de Dolcia Anime (partage de session, boutons) reste au registre neutre
du reste du produit. Vérifié par test (`tu-vous-split.test.mjs`) pour qu'aucun mélange ne revienne
silencieusement dans l'un ou l'autre contexte.

Le ton s'adapte au contexte au-delà du seul tu/vous : chaleureux et posé en conversation normale,
nettement plus énergique en session Dolcia Anime (hype, exclamations, esprit d'équipe) — la même
présence, deux intensités différentes selon ce qui se joue.

Pas de mascotte, pas de visage sur le Home. Un visage expressif existe, mais seulement en contexte
Dolcia Anime, où l'énergie d'un animateur le justifie.

## Retours haptiques

**Non implémenté à ce jour** (`navigator.vibrate` n'est utilisé nulle part dans le code actuel).
Recommandation retenue pour une prochaine évolution : une micro-vibration légère sur les
confirmations clés (ajout à l'agenda, fin de session Anime, pépite trouvée) — jamais sur une simple
navigation.

## Niveau de détail des cartes

Explorer et Agenda : image pleine largeur, jamais une vignette. Un ruban visuel discret pour
signaler un niveau de confiance élevé (Sélection Dolcia, Pépite locale), jamais un pourcentage
affiché comme un fait.

La fiche détail va plus loin : téléphone cliquable, site officiel, bouton réservation, informations
enrichies — toujours en s'appuyant sur des données réellement vérifiées, jamais complétées pour
paraître plus riches.

## Chargement et attente

Un message de chargement doit toujours décrire ce que Dolcia fait réellement ("Dolcia vérifie les
rendez-vous qui comptent aujourd'hui…"), jamais un simple "Chargement…" générique.

---

*Ce document se met à jour à chaque nouvelle convention visuelle qui se répète dans le code — pas
avant qu'elle soit devenue un vrai motif.*
