# Dolcia — Comptes reliés & matching de groupe (plan complet)

Ce document pose à plat toute l'idée "façon carte famille SNCF" : chacun a ses goûts, on relie les profils, Dolcia matche pour composer une activité qui plaît à tous.

---

## 0. Le vrai prérequis, à trancher avant tout le reste

**Vérifié dans le code : aucune authentification réelle n'existe aujourd'hui, nulle part.** J'ai cherché dans tous les fichiers — zéro trace de Supabase Auth, zéro formulaire d'inscription réel. La preuve est même écrite dans le code : une note dans `openAccount()` dit *"La synchronisation sécurisée entre téléphones **sera activée** avec les comptes Supabase"* — au futur. Le bouton "Inviter un compte Dolcia" ne fait aujourd'hui que créer un profil local sur ton téléphone, pas un vrai compte partagé. C'est pour ça que tu n'as pas pu te créer de compte la semaine dernière : il n'y avait rien à créer.

**Recommandation pour la méthode de connexion**, en regardant ce que font les meilleures apps mobiles premium (Uber, WhatsApp, Airbnb) plutôt qu'un choix arbitraire :
- **Numéro de téléphone + code SMS (OTP)** en méthode principale — zéro mot de passe à retenir, c'est le standard des apps mobiles premium aujourd'hui, et les Français sont habitués à ce geste (banques, WhatsApp)
- **Connexion Apple / Google** en raccourci pour aller encore plus vite sur les appareils compatibles
- **Pas de mot de passe classique** — ça fait daté pour une app qui vise le très haut de gamme

**Coût et complexité réels à connaître** : l'envoi de SMS a un coût (quelques centimes par message, via un fournisseur comme Twilio connecté à Supabase Auth), et "Connexion avec Apple" nécessite un compte développeur Apple. Ce n'est pas gratuit ni instantané à activer, mais c'est le standard du marché pour ce niveau d'ambition.

---

## 0bis. Portée des connexions (ton idée, très juste)

Une connexion entre deux profils n'est pas forcément "amis pour toujours". Trois portées possibles, choisies à la création de la connexion :

- **Ponctuelle** : juste pour cette activité/ce moment précis — la connexion expire après (`scope: 'once'`, avec une date d'expiration)
- **Basée sur la proximité** : le matching ne s'active que quand les deux personnes sont physiquement proches (ex: 1 km) — utile pour des amis qu'on ne voit pas souvent mais avec qui on peut improviser une sortie quand on se croise
- **Permanente** : le lien classique, toujours actif, comme un vrai proche

**Chaque personne choisit aussi ce qu'elle partage selon le type de lien** : par exemple, partager son profil complet avec un proche permanent, mais seulement ses catégories générales (pas ses goûts précis) avec un contact de proximité ponctuel. C'est elle qui décide, lien par lien — jamais un partage global imposé.



---

## 1. Modèle de données (Supabase)

```
dolcia_users
  id, phone ou email, name, created_at

dolcia_profiles
  id, user_id (nullable si géré par un parent), 
  managed_by (user_id du parent si profil géré),
  name, age_band, is_autonomous (bool — a son propre compte ou non),
  taste_profile (jsonb — équivalent de state.tasteProfile),
  likes (jsonb), avoids (jsonb), energy, moment_need

dolcia_connections
  id, requester_profile_id, target_profile_id,
  status ('pending' | 'accepted' | 'declined'),
  scope ('once' | 'proximity' | 'permanent'),
  proximity_radius_m (rempli seulement si scope='proximity', ex: 1000),
  expires_at (rempli seulement si scope='once'),
  sharing_level ('full' | 'categories_only') — ce que CE profil accepte de partager sur CE lien précis,
  relationship_label (ex: 'conjoint', 'ami', 'enfant'),
  created_at, responded_at
```

**Un enfant de 12+ ans** : `is_autonomous = true` possible, avec son propre `user_id` — mais rien n'oblige à basculer à 12 ans précis. C'est un choix de la famille, à tout âge, modifiable à tout moment (pas une règle dure imposée par le système).

---

## 2. Le flux d'invitation (ta version, sans QR code)

1. Dans "Mon Cercle Dolcia", un champ **"Retrouver un profil Dolcia"** — recherche par numéro de téléphone ou e-mail (jamais par nom seul, pour la confidentialité : pas d'annuaire public de tous les Dolcia de France)
2. Si trouvé → bouton "Envoyer une invitation" → crée une ligne `dolcia_connections` en `pending`
3. La personne visée reçoit une **notification** dans son app ("Amandine souhaite vous ajouter à son Cercle Dolcia") avec deux boutons : Accepter / Refuser
4. Si acceptée → les deux profils se voient mutuellement (uniquement les goûts/sensibilités, jamais l'historique privé de recommandations) → Dolcia peut désormais matcher une activité pour "Amandine + Vincent" en utilisant les vrais goûts de chacun, pas une case cochée par toi à sa place

---

## 3. Ce qui existe déjà et qu'on réutilise (rien à jeter)

- `state.circleProfiles`, `state.groupParticipants` → deviennent la vue locale synchronisée depuis Supabase
- `sensitivityOptions()`, `openSensitivity()`, `saveSensitivity()` → structure de goûts déjà quasi prête, juste à connecter à `dolcia_profiles` au lieu du local seul
- Le calcul `groupFit` (déjà utilisé dans `why()` et le scoring) → ne change pas, juste alimenté par de vraies données de plusieurs personnes au lieu d'une saisie manuelle

---

## 4. Ce qui est vraiment nouveau à construire

| Élément | Ampleur |
|---|---|
| Authentification réelle (téléphone ou email) | Gros morceau — nécessite Supabase Auth |
| Table `dolcia_connections` + règles de confidentialité (RLS Supabase) | Moyen |
| Recherche de profil (par tel/email uniquement) | Petit |
| Notifications de demande + acceptation | Moyen (in-app d'abord, push plus tard) |
| Bascule "profil autonome / géré par un parent" | Petit |
| Synchronisation locale ↔ Supabase des goûts | Moyen |

---

## 5. Proposition d'ordre de construction (tout est prévu, mais il faut un ordre technique)

1. **Décider du mode d'authentification** (question de la section 0) — bloquant pour tout le reste
2. Créer les tables Supabase (schéma ci-dessus)
3. Brancher l'auth : quand quelqu'un se connecte, ses `circleProfiles` locaux se synchronisent vers `dolcia_profiles`
4. Construire la recherche + demande + notification + acceptation
5. Adapter `groupFit`/`why()` pour lire les goûts distants une fois la connexion acceptée
6. Ajouter la bascule autonome/géré pour les profils enfants

---

## 6. Conflits de préférences entre deux profils connectés

**Cas concret** : toi tu veux rester sur Le Touquet uniquement, ta copine veut toutes les fêtes locales dans un rayon de 30 km. Que fait Dolcia pour une activité "à deux" ?

**Règle retenue** : Dolcia prend toujours **le rayon le plus large des deux** (jamais le plus restrictif — réduire reviendrait à cacher des options qui pourraient plaire à l'un des deux, ce qui viole le principe "ne jamais masquer").

Mais chaque suggestion au-delà du rayon habituel de l'un des deux doit être **étiquetée honnêtement** : pas un simple "Ça vaut le détour" générique, mais *"Ça vaut le détour · correspond à l'envie de [prénom] d'explorer plus loin — hors de votre rayon habituel à vous"*.

Ça reprend exactement le même principe de transparence déjà construit pour le scoring individuel ("Vous adorez ce style" vs "Une intuition, pas confirmée") : jamais présenter un accord mutuel qui n'existe pas. La personne dont ça ne correspond pas au rayon habituel garde la main via le bouton "Changer cette idée" déjà existant — pas besoin d'une nouvelle mécanique d'interface, juste d'une étiquette honnête sur l'origine de la suggestion.

**Implémentation prévue** : chaque item obtient un champ `matchedFor: [profil_id, ...]` listant qui, dans le groupe, a une préférence qui justifie cette suggestion. `why()` l'utilise pour attribuer la bonne phrase.

**Interface de compromis** : plutôt que de laisser deviner à partir d'une phrase, trois onglets/filtres apparaissent quand une activité est composée à plusieurs (réutilise le système de "Filtres intelligents" déjà construit) :
- **"Pour vous deux"** — l'intersection, ce qui correspond aux goûts des deux personnes (vue par défaut)
- **"Pour [prénom A]"** — uniquement ce qui matche cette personne
- **"Pour [prénom B]"** — uniquement ce qui matche l'autre

Chacun peut basculer entre les onglets pour voir ce que l'autre aimerait, et proposer un compromis directement dans l'interface plutôt que de devoir lire/interpréter une explication.

---

## 7. Rythme familial séparé — vrai créneau "Retrouvailles" (chantier distinct, pas commencé)

**Existant aujourd'hui** : le choix "Un moment chacun + retrouvailles" (`familyRhythmPanel`) biaise déjà la recherche vers des mots-clés ("atelier enfants encadré", "spa proche activité enfants") — mais ça reste une recherche en coulisses, pas un vrai créneau visible.

**Ce qu'il faudrait construire** : `buildProgram()` sache générer, pour une demi-journée ou une journée donnée, **deux parcours en parallèle** (un enfants, un parents) qui partagent le même lieu ou la même zone géographique, puis un créneau **"Retrouvailles"** explicite qui les réunit (ex: goûter ensemble après l'atelier cirque et le moment détente des parents).

**Complexité réelle** : `buildProgram` est aujourd'hui une boucle linéaire qui remplit un seul programme, créneau après créneau. Générer deux parcours parallèles qui se synchronisent dans le temps (même horaire de fin) et l'espace (à proximité l'un de l'autre) est un vrai changement de structure, pas un ajout ponctuel. À concevoir posément, comme le reste de ce document — pas à bricoler en fin de session.

---

## Ta décision nécessaire pour démarrer

J'ai recommandé **téléphone + code SMS** (+ Apple/Google en raccourci) comme méthode de connexion, en ligne avec les meilleures apps mobiles. Si ça te va, je commence l'étape 2 (schéma Supabase) tout de suite. Si tu préfères une autre méthode (email par exemple, moins cher et plus simple à activer mais moins "mobile premium"), dis-le et j'ajuste.
