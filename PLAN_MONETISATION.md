# Dolcia — Plan de monétisation

Trois idées différentes, avec des ampleurs très différentes. Je les sépare clairement pour ne pas les confondre.

---

## Ce qui existe vraiment aujourd'hui (vérifié dans le code)

`pro.html` / `pro.js` (33 lignes) : un panneau très basique où un partenaire validé peut ajouter un établissement et créer un brouillon de publication, via des `prompt()` du navigateur. **Aucun système de paiement, aucune gestion de photos, aucun palier tarifaire réel, aucun système de mise en avant (push) n'existe.**

Bonne nouvelle en revanche : les champs `sponsored` et `sponsorshipTier` existent déjà dans la structure de données des événements (`normalizeEvents`), et le tri final en tient déjà légèrement compte comme critère de départage. La fondation technique du concept "sponsorisé" existe, mais rien derrière pour le facturer ou le gérer.

---

## 1. Paliers de visibilité pour les partenaires (Visibilité / Flash / Premium)

**Le modèle qui marche déjà ailleurs (TripAdvisor)** : TripAdvisor ne fait pas une seule chose, il empile **trois sources de revenus séparées**, et c'est exactement le modèle à copier :
1. **Abonnement mensuel "Avantage Business"** — outils photo/vidéo améliorés, mise en avant du numéro/site web, statistiques. Prix variable selon la taille de l'établissement (pas un prix unique affiché publiquement)
2. **Résultats sponsorisés au clic** — 1 à 3 € par clic, complètement séparé de l'abonnement, activé seulement si l'établissement veut booster une période précise (jour férié, période creuse)
3. **TripAdvisor Plus** — abonnement payant côté CONSOMMATEUR (99$/an) donnant des réductions chez les partenaires participants — un axe qu'on n'avait pas encore évoqué pour Dolcia

**Ce que ça donne, adapté à Dolcia** :
- **Palier "Visibilité"** (abonnement mensuel fixe, ex: 19-39€/mois) : photos illimitées, badge "Vérifié Dolcia", statistiques de vues/clics
- **Palier "Flash"** (à l'usage, pas un abonnement) : le partenaire paie pour booster UN événement précis sur une période courte (ex: 15€ pour mettre en avant sa braderie du week-end) — copie directement le modèle "coût par clic" ou "coût par période" de TripAdvisor, plus simple à vendre à un petit commerçant qu'un abonnement
- **Palier "Premium"** : abonnement + emplacement garanti dans le "Vaut le détour" ou les recommandations D, mais **toujours plafonné** pour ne jamais remplacer un item gratuit vraiment meilleur (ta règle non-négociable)

**Ce que ça demande techniquement** :
- Vraie gestion de photos (Supabase Storage)
- Paiement Stripe (abonnement récurrent + paiement à l'usage pour le Flash)
- Boost de score plafonné dans `scoreItems`/`applyFoodIntelligence`, jamais un remplacement total du classement
- Tableau de bord partenaire (vues, clics, avis) pour justifier le prix — sans ça, personne ne renouvelle son abonnement

**Ampleur réelle** : gros morceau, mais familier et validé par le marché — pas à inventer, juste à construire.

---

## 2. Commission sur réservation façon Uber/OTA (hôtels, B&B)

**Les vrais chiffres du marché en 2026** (pour te donner un ordre de grandeur réaliste, pas inventé) :
- **Airbnb** : commission unique de 15,5 % côté hôte (modèle qui s'est généralisé depuis fin 2025)
- **Booking.com** : 15 à 20 % côté hôte uniquement (jusqu'à 18-20% pour le programme "Partenaire Préféré")
- **Abritel/Vrbo** : environ 8 % côté hôte, la moins chère des grandes plateformes

**Deux façons très différentes de faire ça pour Dolcia** :

**Option A — Affiliation** (rapide à mettre en place) : rediriger vers Booking.com/Airbnb avec un lien d'affiliation, toucher une commission sur chaque réservation qui en découle. Aucune gestion de paiement à construire, mais commission d'affiliation plus faible que ces 15-20% (généralement quelques % seulement, puisque ce n'est pas toi qui prends le risque).

**Option B — Réservation directe dans Dolcia** (gros chantier) : Dolcia héberge elle-même le paiement, prend directement une commission dans la fourchette du marché (8 à 20% selon ton positionnement). Nécessite Stripe Connect, gestion des annulations, statut légal d'intermédiaire de réservation.

**Recommandation** : commencer par l'option A pour générer du revenu rapidement et sans risque, envisager l'option B une fois que Dolcia a assez de volume pour négocier directement avec les hôteliers du Touquet et alentours.

---

## 1bis. Réservation intégrée (le vrai levier de dépendance, façon Doctolib/TheFork)

**Principe non-négociable posé par Amandine** : le référencement doit rester gratuit pour absolument tous les établissements. Ce n'est jamais "payant pour être visible" — c'est "gratuit pour être visible, payant pour une vraie valeur ajoutée en plus".

**Deux modèles très différents existent sur le marché, et l'un est en train de perdre du terrain face à l'autre** :

- **TheFork** : abonnement (29 à 139€/mois) **+ commission de 2 à 4€ par couvert servi**. Résultat concret : un restaurant qui sert 1200 couverts/mois via la plateforme paie jusqu'à 28 800€/an. Plus le restaurant réussit, plus il paie — sans que TheFork fasse plus d'efforts. Ce modèle pousse aujourd'hui de nombreux restaurateurs vers des alternatives sans commission.
- **Doctolib** : 100% gratuit côté patient, **un seul abonnement fixe** pour le praticien (~135-150€/mois en 2026), **aucune commission par rendez-vous**, pas de publicité, pas de revente de données. Le prix ne bouge jamais, peu importe le succès du cabinet.

**Recommandation pour Dolcia** : copier le modèle Doctolib, pas TheFork.
- Référencement de base : **toujours gratuit**, pour tout le monde, sans exception
- Réservation intégrée dans Dolcia (façon "Doctolib pour les loisirs") : **abonnement mensuel fixe** pour activer la prise de réservation directe dans l'app + les outils de gestion (agenda, rappels clients, statistiques) — jamais un pourcentage sur ce qu'ils vendent
- Ça crée la dépendance que tu recherches (les gens restent sur Dolcia pour réserver, comme sur Doctolib pour un rendez-vous médical) sans jamais punir un établissement qui cartonne — donc moins de raison de vouloir partir, contrairement au ressentiment que TheFork génère aujourd'hui
- S'applique pareil pour hôtels/B&B ET pour les activités de loisirs (bowling, ateliers, cirque...) — un seul système de réservation intégrée, pas un modèle différent par catégorie

**Ce que ça demande techniquement** : un vrai système d'agenda/disponibilités par établissement, connecté à Stripe pour le paiement de l'abonnement du partenaire (pas du consommateur — la réservation elle-même reste gratuite pour l'utilisateur, comme chez Doctolib), et une interface de gestion des créneaux pour le partenaire (bien plus riche que le `pro.js` actuel à base de `prompt()`).

### La vraie question d'Amandine : Doctolib marche parce que les DEUX côtés gagnent. Comment convaincre un hôtelier/restaurateur qui a peur de "perdre la main" ?

"Les clients préfèrent réserver comme ça" ne suffit pas à convaincre un partenaire — il faut un bénéfice concret pour lui, pas juste pour le consommateur. Quatre leviers réels, empruntés à ce qui marche déjà ailleurs :

1. **Réduction des no-shows** — demander une carte bancaire ou un petit acompte à la réservation (comme TheFork/Zenchef), chose impossible par téléphone. Une table vide un samedi soir coûte de l'argent réel ; c'est l'argument qui parle directement au portefeuille.
2. **Remplir les creux, pas juste prendre des réservations** — un avantage que même TheFork n'a pas vraiment : puisque Dolcia compose déjà intelligemment des programmes, elle peut orienter les propositions vers les créneaux creux du partenaire plutôt que vers l'heure de pointe. Une vraie optimisation de planning.
3. **Il garde 100% la main sur sa relation client** — c'est exactement le point faible de TheFork qui pousse aujourd'hui les restaurateurs à fuir vers des alternatives (la plateforme s'interpose et garde le fichier client). Promettre l'inverse dès le départ désamorce directement la peur.
4. **De vraies données business que personne d'autre ne lui donne** — un petit commerçant n'a jamais accès à ce que les gens recherchent avant même de réserver chez lui. Dolcia peut lui dire "cette semaine, beaucoup de monde cherche une envie salade/légère" — une intelligence business réelle, pas juste un canal de réservation de plus.

Ces quatre leviers combinés (protection financière + optimisation planning + confiance sur la donnée + intelligence business) forment un argument bien plus solide que "vos clients le veulent" — ils répondent directement à la peur de perdre le contrôle.

### Comparaison avec les vraies plateformes de réservation d'activités (GetYourGuide, Viator, Klook)

Ce sont les modèles les plus proches de la partie "réservation d'activités" de Dolcia — et leurs chiffres réels en 2026 :
- **Viator** (filiale TripAdvisor) : 20-30% de commission (25% le plus courant), + frais fixes par produit. **Important** : TripAdvisor lui-même n'a toujours pas de vraie réservation directe — sa fiche gratuite ne donne que des avis/stats, toutes les réservations passent par Viator à la commission de Viator
- **GetYourGuide** : 20-30% de commission
- **Klook** : 15-25%, un peu plus doux, fort sur les billets/pass
- **Airbnb Experiences** : 20% fixe, la commission la plus basse du marché, mais n'accepte que certains types d'expériences

**Le point commun à toutes ces plateformes, et c'est exactement ce que tu veux éviter** : elles prennent une commission lourde (20-30%) ET s'approprient la relation client — le professionnel ne sait souvent même pas qui a réservé chez lui tant que la prestation n'a pas eu lieu.

**Positionnement recommandé pour Dolcia** : pas copier ce modèle, être son inverse assumé. Référencement gratuit + abonnement fixe (façon Doctolib) pour activer la réservation intégrée, partenaire qui garde sa relation client à 100%. C'est un vrai argument commercial face à ces plateformes : *"chez Dolcia, vous ne payez jamais plus quand vous réussissez, et vos clients restent les vôtres."*

### Le vrai modèle complet de TripAdvisor Group (pas juste Viator) — et ce qu'il révèle malgré lui

TripAdvisor n'est pas une seule entreprise, mais **trois moteurs empilés sous une seule marque**, chacun ayant nécessité un rachat séparé :
1. **Core TripAdvisor** — avis, découverte, publicité, redirection hôtels au clic (le "gratuit pour tous")
2. **Viator** (racheté) — réservation d'activités, commission 20-30%
3. **TheFork** (racheté) — réservation restaurants, abonnement + commission au couvert

**La leçon la plus importante, et elle valide directement ton instinct** : en 2026, Viator + TheFork représentent à eux deux **près de 60% du chiffre d'affaires du groupe**, pendant que la partie gratuite (Core, avis + pub) **décline** (-5 à -8% par an, baisse du trafic de recherche). Même TripAdvisor, pionnier de la découverte gratuite financée par la pub, gagne de moins en moins sur cette partie et de plus en plus sur les vraies transactions (réservation, abonnement).

**Ce que ça veut dire concrètement pour Dolcia** : tu n'as pas besoin de racheter qui que ce soit pour arriver au même résultat — Dolcia réunit déjà nativement ce que TripAdvisor a dû assembler en trois marques séparées (restaurants + activités + découverte locale, dans une seule app cohérente). C'est un vrai avantage structurel de départ. La stratégie à en tirer : garde la découverte gratuite pour tous (ton non-négociable, et ce qui construit la confiance/l'usage massif), mais construis dès maintenant la brique transactionnelle (réservation intégrée) comme le vrai moteur de revenu à long terme — ne compte jamais sur la publicité ou les paliers de visibilité seuls pour faire vivre l'entreprise.

### Récapitulatif : les trois moteurs copiés de TripAdvisor, mappés sur Dolcia

| Moteur TripAdvisor | Équivalent Dolcia | Modèle retenu |
|---|---|---|
| **Core** (avis, découverte, pub, redirection hôtels) | Le catalogue Dolcia, D qui compose, "vaut le détour" | Gratuit pour tous, jamais de paywall sur la découverte |
| **Viator** (réservation d'activités, commission 20-30%) | Réservation d'activités/loisirs dans Dolcia | **Différent d'eux** : abonnement fixe partenaire, pas de commission — voir section réservation intégrée |
| **TheFork** (réservation restaurants, abonnement + commission) | Réservation restaurants dans Dolcia | **Différent d'eux** : abonnement fixe seul, sans commission au couvert |

### Le système "push, premier arrivé" façon Uber — appliqué à la conciergerie ménage

**Le vrai mécanisme technique d'Uber** (vérifié) :
1. Liste de prestataires disponibles classée par proximité, note, taux d'acceptation habituel
2. Le mieux classé reçoit une notification push avec une fenêtre de réponse courte (15-20 secondes chez Uber)
3. Refus ou absence de réponse → passe automatiquement au suivant de la liste
4. **Un verrou technique** (Uber utilise Redis avec un délai d'expiration) empêche que deux prestataires acceptent la même mission en même temps — le premier qui valide "gagne" le chantier, les autres reçoivent immédiatement "déjà pris"

**Traduit pour la conciergerie ménage Dolcia** :
1. Une mission de ménage est postée (date, lieu, durée, tarif)
2. Notification push envoyée aux femmes de ménage disponibles à proximité, classées par note/fiabilité
3. Fenêtre de réponse courte (ex: 2-5 minutes, plus long que pour un trajet Uber puisque ce n'est pas aussi urgent)
4. Verrou technique identique : la première à valider obtient la mission, les autres sont notifiées que c'est pris
5. Si personne n'accepte dans la fenêtre, la mission repasse en diffusion plus large (rayon élargi, ou notification à toutes les prestataires disponibles)

**Rappel important, toujours valable** : la mécanique technique ci-dessus est maintenant prête à être construite le jour où tu veux avancer, mais elle ne résout pas les questions de fond de la section 3 (statut légal des prestataires, assurance, paiement en séquestre, résolution de litiges) — ça reste un projet à part, à cadrer avec un avocat avant la mise en production, pas juste une fonctionnalité technique à activer.

---

## 3. Conciergerie / marketplace de services (femmes de ménage, "premier arrivé, premier servi")

**Attention, c'est fondamentalement différent des deux idées précédentes.** Ce n'est plus "monétiser un annuaire de loisirs" — c'est **construire une deuxième entreprise à part entière** : une marketplace de services à la personne, avec mise en relation en temps réel, façon Uber.

**Ce que ça implique réellement, au-delà du code** :
- Statut légal des prestataires (auto-entrepreneurs en France, avec toutes les obligations qui vont avec)
- Assurance et responsabilité (que se passe-t-il si une femme de ménage casse quelque chose, ou s'il y a un vol ?)
- Paiement en séquestre (l'argent est bloqué jusqu'à la fin de la prestation, puis reversé) — encore un chantier Stripe Connect, mais avec des règles différentes
- Système de notation/vérification des prestataires (identité, antécédents) — question de confiance et de sécurité, pas juste technique
- Résolution de litiges

**Honnêtement** : c'est un projet de l'ampleur d'Uber ou de services qui existent déjà en France sur ce créneau précis. Ce n'est pas une fonctionnalité à ajouter à Dolcia — c'est une décision stratégique de lancer un second produit, avec ses propres enjeux juridiques (mieux vaut en parler à un avocat spécialisé avant de coder quoi que ce soit ici).

---

## Recommandation d'ordre

1. **Court terme, faisable vite** : finir vraiment le système de paliers Pro (photos + Stripe + tableau de bord) — c'est la suite logique de ce qui existe déjà
2. **Court terme aussi, très rapide** : affiliation hôtels/B&B (option A) — quelques jours de travail, revenu immédiat
3. **Plus tard, et à réfléchir avec un avocat d'abord** : la marketplace de conciergerie — projet à part, pas une fonctionnalité Dolcia

---

## Décision nécessaire pour démarrer

Veux-tu qu'on commence par le système de paliers Pro (photos + paiement Stripe + tableau de bord), ou tu préfères d'abord l'affiliation hôtels (plus rapide à mettre en place) ?
