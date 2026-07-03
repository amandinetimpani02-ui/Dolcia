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
