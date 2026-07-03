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
