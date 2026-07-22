# Dolcia v19.12 — audit MASTER anti-régression

## Résultat

La v19.12 consolide l’interface actuelle sans réintroduire les anciens parcours. Le vocabulaire utilisateur parle désormais de **Dolcia** et de **Mon moment**. « L’Éclat » n’est plus présenté comme une action ou un produit à comprendre.

## Corrections livrées

- accueil : action principale **Composer mon moment** ;
- conversation : le lancement vocal utilise le parcours Dolcia actuel ;
- formulation famille : **Rire et bouger**, sans vocabulaire trop individuel ;
- date personnalisée : continuité explicite dans Dolcia ;
- Explorer : une phrase naturelle est interprétée comme une intention, pas comme une recherche littérale impossible ;
- catégories : les compteurs excluent les lieux classés `outside` ;
- garde-fou : les noms des anciennes fonctions d’accueil et d’Explorer ne peuvent plus être réactivés accidentellement par un appel existant ;
- numéro de build visible : `19.12-master-anti-regression`.

## Fonctions préservées et contrôlées

- fiche progressive non bloquante avec retour, carte, agenda et favoris ;
- programme composé, vide honnête et remplacement étape par étape ;
- agenda éditable par date et heure ;
- réservation Dolcia et Pass après réservation ;
- cercle, profils, préférences et mémoire contextuelle ;
- budget global et Tout Compris ;
- partenaire : réservations, venues validées, statistiques, packs et push ;
- géographie multifactorielle et pépites régionales prouvées ;
- absence de priorité commerciale automatique.

## Validation

- 44 tests réussis sur 44 ;
- syntaxe de `app.js` validée ;
- syntaxe du moteur serveur validée ;
- aucun déploiement réalisé pendant l’audit.

## Règle MASTER

Toute prochaine modification doit faire réussir la suite complète avant publication. Une correction d’exemple ne doit jamais contourner les règles générales de destination, de temps, d’ouverture, de fiabilité, de groupe ou de budget.
