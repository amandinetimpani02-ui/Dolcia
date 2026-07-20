# Dolcia v19.1 — filtres vivants, pépites et intelligence alimentaire

## Ce qui est réellement intégré

- Trois niveaux de filtres : **préférence**, **curiosité** et **obligatoire**. Seul le dernier masque des propositions ; les deux premiers réordonnent l'abondance.
- Les pépites régionales officielles peuvent remonter au-delà du périmètre habituel lorsqu'elles constituent une exception du jour, sans élargir silencieusement toutes les recherches.
- Sous-catégories culinaires apprises à partir d'indices réels (friterie, fruits de mer, brunch, gastronomique, etc.).
- L'envie et le budget du moment priment sur une préférence alimentaire permanente.
- Équité de visibilité pour les événements associatifs et locaux, indépendamment de leur prix.
- Une mise en avant partenaire ne sert qu'à départager deux résultats de pertinence égale et reste identifiée dans l'interface.
- Les programmes peuvent conserver plusieurs repas, tout en évitant de répéter exactement le même style culinaire.
- Architecture Vercel maintenue à **6 fonctions API**, sous la limite Hobby.

## Contrôles

- 16 tests automatiques réussis.
- Vérification syntaxique des fichiers principaux réussie.
- Tests de non-régression : horaires, fermeture, géographie, rareté sourcée, groupes, mémoire contextuelle, alimentation et pépites.

## Chantiers encore nécessaires pour une industrialisation complète

- comptes réellement reliés et synchronisation de groupe en temps réel ;
- portail partenaire totalement persistant dans Supabase ;
- notifications push réelles ;
- constellation visuelle complète ;
- ingestion nationale industrialisée et supervision continue des sources.

