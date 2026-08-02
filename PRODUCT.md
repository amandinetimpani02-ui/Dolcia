# Dolcia — Produit

Le niveau intermédiaire entre `VISION.md` (pourquoi Dolcia existe) et `ARCHITECTURE.md` (comment le
moteur décide). Ce document répond uniquement à : **que veut-on construire ?** — jamais à comment le
moteur fonctionne, qui vit exclusivement dans `ARCHITECTURE.md`.

---

## 1. Personas

Dolcia ne segmente pas par catégorie démographique figée — elle reconnaît des **rôles dans un moment
donné**, portés par le Cercle (compte, proche enregistré, invité ponctuel, enfant). Profils-types
récurrents dans la conception :

- **La famille avec enfants** — contraintes fortes, forte valeur pour le mode accompagné de Dolcia
  Anime.
- **Le couple** — sensible à l'ambiance et à la surprise.
- **Le groupe d'amis** — compétition amicale bienvenue, sessions partagées.
- **Le résident local** — connaît déjà beaucoup, peu tolérant à une suggestion déjà connue.
- **Le visiteur de passage** — a besoin d'être guidé sans comparer.

Un même utilisateur change de rôle selon le moment — le persona n'est jamais figé sur un compte.

## 2. Parcours utilisateur

**Famille — journée complète.** Activité commune le matin, restaurant compatible famille, activité
enfants l'après-midi, option garderie, soirée adultes.

**Couple — soirée romantique.** Balade ou spa selon météo, dîner sélectionné, sortie ensuite.

**Séjour de plusieurs jours.** Arrivée et découverte, jour fort avec pause et événement, clôture
légère ; hébergement proposé si nécessaire.

**Gratuit / petit budget.** Limité aux activités réellement gratuites ou à entrée libre prouvée.

**Pluie.** Priorité spa, musée, cinéma, bowling, atelier, restaurant.

**Retour régulier.** Le parcours le plus stratégique et le moins avancé aujourd'hui — quelqu'un qui
revient sans rien de prévu doit ressentir une reconnaissance, pas un écran générique.

## 3. Inventaire des écrans

**Besoin de contenu identifié (maquettes Home, non résolu)** : le positionnement "Club Med de
toutes les villes" appelle des photos montrant des personnes vivant l'instant (une famille qui
rit, un couple au coucher du soleil, des enfants sur la plage), pas seulement des lieux vides.
Aucune génération d'image n'est possible ici — ce sont de vraies photos à sourcer (partenaires,
banque d'images sous licence, ou séance photo dédiée) avant de pouvoir les intégrer.

| Écran | Rôle |
|---|---|
| Home | Une rencontre |
| Explorer | Un espace de découverte |
| Fiche détail | Preuve et action |
| Agenda | Le programme réel, regroupé par jour |
| Dolcia Anime | L'animateur en direct |
| Cercle / compte | Qui accompagne la personne |
| Studio partenaire | Où un partenaire déclare une offre |

## 4. KPI produit

- Taux de retour à 7 jours.
- Taux de scénario accepté sans régénération.
- Temps entre l'ouverture et la décision (doit baisser dans la durée).
- Nombre de questions posées par session (doit rester bas et stable).
- Taux d'alertes push ignorées ou désactivées.

## 5. Règles UX

Voir `UX_GUIDELINES.md` pour le détail. En résumé : une idée par écran, cliquer aussi valable que
parler, aucune animation sans raison, aucun écran ne doit ressembler à un prototype.

## 6. Roadmap fonctionnelle

| Palier | Objectif |
|---|---|
| Socle vérité | Éliminer les fausses notes |
| Expérience | Rendre Dolcia évidente |
| Mémoire & groupe | Comprendre les personnes |
| Dolcia Anime | Créer du loisir autonome |
| Studio partenaire | Publier et mesurer |
| **Moteur de scénarios** | **Chantier actuel** |
| Marketplace | Réserver et payer |
| Club sans murs | Composer le tout compris |
| Identité sonore Dolcia | Un rituel propre, jamais une copie de Club Med/Belambra — voir détail ci-dessous |

### Identité sonore Dolcia — brique stratégique, non développée à ce jour

Objectif : une musique originale, entraînante, facile à chanter par les adultes comme par les
enfants, associée à la mascotte D, utilisée pendant Dolcia Anime, les jeux, les défis et les
animations en ville. Retrouver l'énergie collective d'un Club Med ou d'un Belambra sans jamais
copier leurs mélodies, leurs paroles ou leur identité.

Doit comprendre : une signature sonore très courte (2-3 secondes, reconnaissable immédiatement) ;
un refrain fédérateur facile à retenir ; une gestuelle simple, reproductible par des enfants ; une
version de lancement d'animation ; une version de célébration ou de fin de session ; des règles
précises pour ne jamais se déclencher dans les usages calmes de l'application (jamais à l'ouverture
simple, réservé aux moments de vie : lancement d'animation, "Laisse-toi guider", chasse au trésor,
Dolcia Anime, contenus réseaux sociaux, événements partenaires).

**Mise à jour — le morceau a été fourni.** Fichier réel intégré dans `assets/audio/dolcia-theme.mp3`
(joué à l'ouverture de chaque session Dolcia Anime, avec bouton de réécoute — voir `CHANGELOG.md`).
Paroles originales (propriété Dolcia) :

```
Hey! Hey! DOLTCHIAAAAA!

DOLTCHIA! Hey! Hey! Tous ensemble!
DOLTCHIA! Hey! Hey! On y va!
Oh oh oh! Hey! Oh oh oh! Hey! DOLTCHIA!

Le soleil est là, les amis aussi.
Aujourd'hui, on profite de la vie.
Une balade, une piscine.
Un concert, sous les étoiles.
Des sourires, des souvenirs.
On partage les plus beaux moments.

Hey! Viens! Bouger! Hey! Viens! Rêver!

[Refrain]

DOLTCHIA... Le meilleur commence ici.
```

Reste à construire : la signature courte de 2-3 secondes (extraite ou composée séparément pour les
usages où la chanson complète serait trop longue — notification, lancement rapide), la gestuelle
associée, et la version "célébration/fin de session" distincte de la version "lancement".
L'intégration actuelle ne couvre que l'ouverture de session ; les autres moments de vie listés
ci-dessus (chasse au trésor, réseaux sociaux, événements partenaires) restent à faire.

Le morceau principal est fourni et intégré. Ce qui reste hors de portée technique ici (pas d'outil
de composition musicale) : une signature courte distincte si elle doit différer du morceau complet,
et toute nouvelle composition audio future.

## 7. Fonctionnalités Premium et monétisation

**Le Pass Dolcia** — prestations prépayées et traçables, chaque droit précisant date, personnes,
plafond, conditions d'annulation. Jamais de monnaie virtuelle opaque.

**Services humains** — animateur/coach, babysitting, chauffeur/navette, conciergerie : disponibilité
réelle, prix total, annulation visibles avant validation.

**Sources de revenu** — réservation, visibilité partenaire, alertes qualifiées, conciergerie,
hébergement.

**Abonnements** — non défini à ce jour.

## 8. Le Cercle

Compte Dolcia, proche enregistré, invité ponctuel, groupe partagé avec organisateur décisionnaire.
Un veto explicite exclut une activité du scénario composé sans la faire disparaître d'Explorer.

Mémoire visible et contestable — favoris, idées refusées, expériences vécues. La personne peut
consulter, corriger ou effacer chaque élément. Actuellement fragmentée entre le D-Coach, Dolcia
Anime et Explorer plutôt qu'unifiée — chantier non résolu.

---

*Ce document évolue avec le produit. Il doit rester honnête sur ce qui n'est pas encore défini.*
