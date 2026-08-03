# Dolcia — État technique actuel

## État du projet

```
Version           : 21.20
Production        : oui (Vercel)
Tests             : 361/361 verts
Architecture cible : voir ARCHITECTURE.md — Home reconstruit comme une affiche
                      photo plein écran, avec voix intégrée (7 contextes +
                      filet ordinaire, honnête). Classement désir/surprise
                      branché sur Explorer. Fiches détaillées à 3 niveaux
                      (riche/standard/minimale) avec actions comme données.
                      Continuité complète Explorer → fiche → agenda → retour
                      (scroll, focus, confirmation à deux choix). Mécanique
                      commune d'accessibilité des fenêtres modales (Échap,
                      piège de focus, inert, bouton Retour mobile). Dolcia
                      Anime : bibliothèque de 20 expériences réelles couvrant
                      10 catégories (sport, olympiades, famille, couple, amis,
                      piscine, quiz/blind-test, danse, détente, soirée).
Prochain chantier  : le moteur de scénarios complet (objectif → temps →
                      scénario → ancrage → centre mobile → compléments →
                      budget) reste partiellement implémenté — voir
                      ARCHITECTURE.md §2. Puis : présence continue de D dans
                      la journée (pas seulement sur sollicitation), agenda
                      qui se réorganise sur une phrase dite au D-Coach
                      ("finalement on est fatigués"), enrichissement des
                      données réelles (photos humaines, prix, accessibilité)
                      pour les fiches de toute la France.
Dette technique    : mémoire unifiée entre D-Coach / Anime / Explorer,
                      console d'administration avec authentification équipe,
                      champ moment.confirmedUnique pas encore réellement
                      rempli, seuils de preuve de la 5e couche (réputation
                      confirmée par l'usage) à calculer sur données pilotes
                      réelles avant tout chiffrage en dur (voir ARCHITECTURE.md
                      §9.1)
```

Ce document décrit **comment le projet est construit aujourd'hui**. Il ne raconte pas comment on en
est arrivé là (voir `CHANGELOG.md` pour l'historique daté), et il n'explique pas pourquoi ces choix
existent au niveau produit (voir `VISION.md`, `PRODUCT.md` et `ARCHITECTURE.md`). Il se **remplace**
à chaque évolution significative, il ne s'accumule jamais — s'il devient faux, il doit être corrigé,
pas complété en dessous.

---

## 1. Vue d'ensemble

Application web (vanilla JS, sans framework front), déployée sur Vercel, avec Supabase comme
backend de données persistantes. Un seul fichier client principal (`app.js`), un jeu de fonctions
serverless côté serveur, une suite de tests automatisée qui charge le vrai code de production.

**État des tests : 279 tests verts.** Lancer `npm test` (ou `node --test test/*.test.mjs`) avant
tout déploiement. `npm run check` ajoute une vérification de syntaxe sur les fichiers critiques.

## 2. Structure des fichiers

```
app.js                  Toute la logique client (rendu, état, appels API)
index.html               Point d'entrée, charge app.js et les feuilles de style
style.css, premium.css,  Feuilles de style — premium.css et vision-premium.css
vision-premium.css,      concentrent l'essentiel du style visuel récent
budget.css, circle.css,
detail-progressive.css,
home-premium.css
pro.js, pro.html,        Interface partenaire (Studio), séparée de l'app cliente
pro.css, pro-premium.css,
pro-business.css
admin.html                Coquille de console d'administration — non connectée,
                           en attente d'authentification équipe (voir §6)
sw.js                     Service worker (notifications push)
api/                       Fonctions Vercel — voir §3
server/                    Logique métier appelée par api/events.js — voir §3
test/                      Suite de tests (node:test natif, aucune dépendance de test)
assets/                    Images et audio (dont le thème sonore réel de Dolcia Anime)
VISION.md                  Philosophie intemporelle du produit
PRODUCT.md                 Personas, parcours, écrans, KPI, roadmap fonctionnelle
ARCHITECTURE.md            Logique durable du moteur de décision
UX_GUIDELINES.md            Règles concrètes d'interface (Liquid Glass, voix, animations)
CONSTITUTION.md            Les lois non négociables, une page, sans explication
MASTER.md                  Ce document
CHANGELOG.md                Historique daté des évolutions
```

## 3. Architecture API — règle absolue

**Vercel Hobby plafonne à 12 fonctions serverless. Le projet en utilise 11 aujourd'hui, une seule
marge de sécurité.** En conséquence : **aucun nouveau fichier ne doit jamais être ajouté dans
`api/`.** Toute nouvelle fonctionnalité serveur se branche depuis `api/events.js` via un paramètre
`?service=nom-du-service`, qui délègue à un fichier dans `server/`.

Fonctions `api/` actuelles : `datatourisme`, `events` (le routeur central), `major-events`,
`partner-events`, `photo`, `place-details`, `places`, `ticketmaster-events`, `touquet-events`,
`utils`, `weather`.

Services branchés dans `server/` via `events.js` : recommandations (`recommendations.js`),
offres flash (`flash-offers.js`, `flash-notify.js`), conversation D-Coach
(`coach-conversation.js`), voix temps réel OpenAI (`realtime-voice.js`), synthèse vocale ElevenLabs
(`voice-synthesis.js`), abonnements push (`push-subscriptions.js`), sessions Dolcia Anime partagées
(`animate-sessions.js`), campagnes partenaires (`partner-campaigns.js`). Modules de logique pure
sans route propre : `geo-eligibility.js` (moteur de confiance géographique), `retrieval-planner.js`
(plan de recherche), `decision-codes.js`, `food-intelligence.js`, `travel-matrix.js`.

## 4. Variables d'environnement (Vercel)

| Variable | Rôle |
|---|---|
| `GOOGLE_KEY` | Google Places (lieux, avis, horaires) |
| `OPENAGENDA_KEY` | Événements locaux |
| `TICKETMASTER_KEY` | Billetterie événements |
| `OPENWEATHER_KEY` | Météo réelle |
| `DATATOURISME_KEY` | Données touristiques officielles |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Backend Supabase (offres flash, push, sessions partagées, campagnes partenaires) |
| `ANTHROPIC_API_KEY` | D-Coach (conversation) |
| `OPENAI_API_KEY` / `OPENAI_REALTIME_MODEL` | Canal vocal temps réel alternatif (WebRTC) |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` | Voix neuronale de D |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Notifications push |
| `SUPABASE_WEBHOOK_SECRET` | Sécurise le webhook offres flash |
| `ADMIN_BRIDGE_SECRET` | Sécurise l'approbation manuelle des campagnes partenaires (en l'absence de console d'administration réelle) |
| `DOLCIA_TEST_SECRET` | Réservé aux tests |

Aucune clé n'est payante pour commencer à tester : VAPID est générée gratuitement, Supabase et
Vercel ont un plan gratuit suffisant, ElevenLabs offre un quota gratuit mensuel, Anthropic facture à
l'usage (quelques centimes pour des dizaines de tests).

## 5. Ce qui fonctionne réellement aujourd'hui, par pilier

**Explorer** — cartes immersives (image pleine largeur, jamais de vignette), filtres combinables
(famille, budget, disponibilité, tri), lentilles de qualité ("Sélection Dolcia", "Pépite locale"),
style Liquid Glass sur la barre de filtres.

**Concierge** — composition conversationnelle du moment (`openEclatDialogue`, décor cinématographique
qui change selon les réponses), Plan B météo qui réorganise réellement le programme (pas un simple
tri), suggestion honnête après une activité physique.

**Coach / Animateur (Dolcia Anime)** — visage expressif de D selon l'humeur, présence géante en
session, équipes façon Belambra Games avec score, confettis à chaque mission réussie, programmes
sport et bien-être structurés en trois phases qui avancent seules (mains libres), continuité
reconnue d'une session à l'autre à partir de l'historique réel, thème musical réel intégré, sessions
partagées (SMS/email/lien/QR — chacun suit sur son propre téléphone).

**Géographie** — moteur de confiance géographique à trois statuts (core/extended/outside), règle
"jamais hors commune" pour le courant (restaurants, sorties), règle nationale de budget de temps de
trajet pour les pépites (jamais un rayon fixe en kilomètres), détection des événements
manifestement récurrents pour ne pas les confondre avec une vraie rareté.

**Partenaires** — Studio partenaire avec soumission de campagne réellement persistée (Supabase) ;
une campagne approuvée et chiffrable devient automatiquement une alerte réelle, en réutilisant le
pipeline d'offres flash déjà construit.

## 6. Ce qui n'est honnêtement pas fait

- Génération de vraies vidéos ou d'une identité musicale complète — hors de portée technique ici ;
  la voie retenue est le contenu fourni par les partenaires ou la fondatrice, pas une génération IA.
- Console d'administration réelle avec authentification équipe — `admin.html` reste une coquille.
- Mémoire unifiée entre D-Coach, Dolcia Anime et Explorer — trois systèmes de mémoire distincts
  aujourd'hui, jamais croisés (voir `ARCHITECTURE.md` §9).
- Le moteur de scénarios décrit dans `ARCHITECTURE.md` (hiérarchie à 7 niveaux, centre du monde
  mobile, mise en scène de la proposition unique) est **validé mais pas encore implémenté** — ce
  document décrit l'état du code existant, qui reste construit sur une logique de filtrage plus
  simple que celle désormais actée comme cible.
- Couverture de données pour les événements hyper-locaux non numérisés (ateliers en magasin,
  affiches de mairie) — angle mort structurel des données ouvertes françaises, pas un défaut du
  moteur.

## 7. Méthode de travail

Une évolution à la fois. Avant chaque changement : vérifier qu'il n'existe pas déjà (plusieurs
quasi-doublons ont été évités cette session en cherchant d'abord). Après chaque changement : tests
complets, vérification de syntaxe, documentation dans `CHANGELOG.md`. Zéro donnée inventée, à
aucun niveau — lieu, prix, horaire, caractéristique, préférence utilisateur.
