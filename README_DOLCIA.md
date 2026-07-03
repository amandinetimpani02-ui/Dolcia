# Dolcia V1 Premium

## Fichiers à mettre sur GitHub
- `index.html`
- `style.css`
- `app.js`
- `manifest.json`
- dossier `api/` avec `places.js`, `photo.js`, `weather.js`, `events.js`

## Variables Vercel nécessaires
À configurer dans Vercel > Project Settings > Environment Variables, en Production + Preview + Development :

- `GOOGLE_KEY`
- `OPENAGENDA_KEY`
- `OPENWEATHER_KEY`

## Règle absolue
Dolcia n'invente aucune activité. Si les API ne remontent rien, l'application affiche un diagnostic au lieu d'inventer des lieux.

## Fonctionnalités incluses
- Interface premium noir/or, photos immersives.
- Parcours en 5 étapes : avec qui, quand, durée, envies, budget.
- Google Places + OpenAgenda + météo.
- Programme construit selon la durée : 2h, demi-journée, journée, week-end, séjour.
- Bouton Agenda actif.
- Lien Google Calendar.
- Bouton Réserver grisé sauf lien réel disponible.
- Notes utilisateur pour personnalisation future.
- Diagnostic API.


## V2 Calendar first
Cette version corrige un point essentiel : Dolcia demande la date AVANT les envies.
Sans dates, OpenAgenda ne peut pas remonter correctement les concerts, spectacles, festivals et événements éphémères.

Nouveautés :
- écran calendrier premium obligatoire en début de parcours ;
- choix aujourd’hui / ce soir / demain / week-end / dates libres / vacances ;
- OpenAgenda appelé avec `after` et `before` réels ;
- programme multi-jours si l’utilisateur choisit plusieurs dates ;
- bouton `Test API` pour diagnostiquer directement weather / places / events.


## V3 Surprends-moi en agenda
Le bouton Surprends-moi ne sort plus une activité isolée.
Il présente un agenda complet :
- valider une activité ;
- régénérer une activité à la fois ;
- valider tout le programme ;
- ajouter automatiquement les activités validées à Mon Agenda Dolcia.
Ce fonctionnement reprend l'idée validée : une proposition type agenda, comme une application de menus qui propose midi/soir, mais pour les loisirs.


## V4 Vercel fix
Ajout de `package.json` avec `"type": "module"` pour supprimer l'avertissement Vercel :
`Node.js functions are compiled from ESM to CommonJS`.

Ce warning n'empêche pas le déploiement, mais cette correction rend le projet plus propre.

## Lisibilité séjour plusieurs jours
La version actuelle affiche déjà le séjour sous forme d'agenda :
- Jour 1 matin / midi / après-midi / soir
- Jour 2 matin / midi / après-midi / soir
- etc.

Évolution UX prévue :
- onglets Jour 1 / Jour 2 / Jour 3 ;
- frise chronologique verticale ;
- validation activité par activité ;
- régénération d'une activité à la fois ;
- validation de tout le séjour.
