# Dolcia v19.5 — modèle hybride et Pass

## Principe produit

Dolcia reste utile dans toute destination, même sans aucun partenaire. Les sources publiques et officielles alimentent l’exploration, les fiches et les programmes. Les partenariats ajoutent uniquement des services impossibles à garantir autrement : réservation intégrée, créneau confirmé, avantage négocié, formule et Pass Dolcia.

Une mise en avant commerciale ne peut jamais compenser une incompatibilité de date, d’horaire, de lieu, de groupe, de budget ou d’envie. À pertinence égale seulement, un partenaire peut être départagé.

## Parcours client

- `Explorer` : catalogue large, y compris les pépites locales et régionales justifiées par le moment.
- `D ✦ Dolcia` : conversation avec L’Éclat et composition personnalisée.
- `Programme` : agenda choisi ou composé, avec horaires.
- `Profil` : mémoire, cercle et préférences.
- `Mon Pass` : apparaît uniquement après une réservation ou une formule Dolcia active.

Une activité non partenaire reste ajoutable au programme. Une activité partenaire compatible peut être réservée dans Dolcia et générer un Pass. Le Pass n’est pas une monnaie virtuelle universelle : il présente des droits précis, un créneau et un code de validation.

## Parcours partenaire privé

Le fichier `pro.html` ouvre un portail distinct de l’application client. Il propose trois niveaux progressifs :

1. Présent sur Dolcia : fiche et informations vérifiées.
2. Réservable : créneaux et réservations pilotes.
3. Expérience Dolcia : Pass, formule comprise et avantages maîtrisés.

Le partenaire garde le contrôle des quotas, dates, prix nets et périodes exclues. Les statistiques restent vides tant que la fiche n’est pas réellement publiée ; aucune donnée fictive n’est affichée comme réelle.

## État technique honnête

Le prototype local démontre l’interface, la création d’une réservation et l’affichage d’un Pass. La production transactionnelle exigera encore une authentification serveur, Supabase, un prestataire de paiement marketplace, une vraie signature électronique et un code de validation cryptographique.

## Vérification

```powershell
npm test
node --check app.js
node --check pro.js
```

