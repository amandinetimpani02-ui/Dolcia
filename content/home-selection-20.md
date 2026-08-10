# Dolcia — Sélection des 20 pour l'intégration réelle

Extraites de `content/micro-scenarios.md` après audit. Contextes couverts, comme demandé : pluie,
soleil, vent, famille connue, couple connu, pépite datée, événement unique. Chacune vérifiée
vouvoiement, aucune affirmation non fondée, aucune pression.

```js
const HOME_SEQUENCES = {
  rain: [
    { signature:'Attendez…', beats:['Tout le monde fait demi-tour.','Pas vous.'], reveal:'La plage est presque à vous.' },
    { signature:'Regardez.', beats:['La pluie vide les rues.','Elle ne vide pas tout.'], reveal:'Il reste un endroit pour vous.' },
    { signature:'Chut.', beats:['On dirait un jour à rester dedans.','On dirait, seulement.'], reveal:'Il y a une autre option.' },
  ],
  sun: [
    { signature:'Venez.', beats:['Le soleil ne prévient jamais quand il repart.'], reveal:'Profitez-en pendant qu\u2019il est là.' },
    { signature:'Regardez.', beats:['Ce ciel-là, on ne le commande pas.','Aujourd\u2019hui, il est offert.'], reveal:'Voici comment en profiter.' },
    { signature:'Faites-moi confiance.', beats:['Un ciel comme celui-ci mérite mieux qu\u2019un balcon.'], reveal:'Voici mieux.' },
  ],
  wind: [
    { signature:'Écoutez.', beats:['Ce vent-là n\u2019abîme rien.','Il pousse.'], reveal:'Vers ça, par exemple.' },
    { signature:'Venez.', beats:['Un grand vent, ça se regarde de près, pas de la fenêtre.'], reveal:'Voici où le sentir vraiment.' },
    { signature:'Regardez.', beats:['Certains attendent que ça se calme.','D\u2019autres en profitent.'], reveal:'Voici comment.' },
  ],
  family: [
    { signature:'Regardez.', beats:['Il y a des journées qu\u2019on planifie.','Et celles qui restent en photo longtemps après.'], reveal:'Celle-ci pourrait en être une.' },
    { signature:'Écoutez.', beats:['« Qu\u2019est-ce qu\u2019on fait » ne devrait jamais rester sans réponse trop longtemps.'], reveal:'En voici une.' },
    { signature:'Venez.', beats:['Un bon souvenir de famille ne coûte pas toujours cher.'], reveal:'Celui-ci, par exemple.' },
  ],
  couple: [
    { signature:'Venez.', beats:['Ce n\u2019est pas tous les jours qu\u2019on a une vraie raison de se retrouver.'], reveal:'En voici une.' },
    { signature:'Écoutez.', beats:['Vous n\u2019avez pas besoin d\u2019une occasion.','Juste d\u2019un moment.'], reveal:'En voici un.' },
    { signature:'Chut.', beats:['Pas besoin d\u2019en parler à l\u2019avance.','Laissez-vous surprendre.'], reveal:'Voici la surprise.' },
  ],
  gem: [
    { signature:'Chut.', beats:['Ce que j\u2019ai trouvé n\u2019arrive pas souvent.'], reveal:'Regardez.' },
    { signature:'Regardez.', beats:['Certaines choses valent le détour.','Celle-ci, vraiment.'], reveal:'Voici laquelle.' },
    { signature:'Écoutez.', beats:['Ce n\u2019est pas tous les jours.'], reveal:'Voici pourquoi.' },
  ],
  unique_event: [
    { signature:'Aujourd\u2019hui seulement.', beats:[], reveal:'Voici ce qui n\u2019arrivera plus.' },
    { signature:'Écoutez.', beats:['Demain, il sera trop tard pour celui-ci.'], reveal:'Aujourd\u2019hui, encore possible.' },
  ],
};
```

20 séquences, 7 contextes. Chaque clé correspond exactement à un signal réel déjà disponible dans
le code (`state.weather`, `state.groupParticipants`/Cercle, `geoEligibility.status`, détection
d'événement daté non récurrent) — aucune nouvelle donnée à collecter pour les utiliser.
