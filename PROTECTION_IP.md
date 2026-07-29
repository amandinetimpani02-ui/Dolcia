# Protection immédiate de Dolcia

Document interne — diffusion contrôlée — 15 juillet 2026.

## Ce qui peut réellement être protégé

- Le code, les textes, les écrans, les illustrations, la base structurée et le Product Book, s'ils sont originaux, relèvent du droit d'auteur.
- Le nom « Dolcia », le D et L'Éclat doivent faire l'objet d'une recherche d'antériorités puis, si disponibles, de dépôts de marque.
- Le D, L'Éclat et les interfaces les plus distinctives peuvent être étudiés pour un dépôt de dessins et modèles avant une diffusion large.
- Le savoir-faire de classement, les règles anti-erreur, les pondérations et les données partenaires doivent rester secrets et faire l'objet de mesures concrètes de confidentialité.
- Une idée abstraite n'est pas protégée seule : il faut conserver la preuve datée de sa forme concrète.

## Mesures appliquées dans ce MASTER

- Les clés API restent exclusivement dans les variables serveur ; aucune valeur secrète n'est écrite dans le client ou le Product Book.
- Les archives, documents confidentiels, environnements locaux et dossiers de preuve sont exclus du suivi public par `.gitignore`.
- Le Product Book v16 est marqué « CONFIDENTIEL — DIFFUSION CONTRÔLÉE » et ne révèle ni clés, ni code, ni formule de classement détaillée.
- Un manifeste SHA-256 sera livré avec le code, le Product Book et l'identité de L'Éclat.
- Les en-têtes de sécurité bloquent notamment l'intégration de l'application dans un autre site par iframe.

## Avant toute présentation externe

1. Garder le dépôt de code privé et protéger les déploiements de démonstration par authentification.
2. Faire signer un accord de confidentialité avant de transmettre le Product Book complet, les règles de classement ou les accès techniques.
3. Déposer l'archive de preuve auprès de l'INPI via e-Soleau.
4. Faire une recherche d'antériorités puis déposer, avec un conseil en propriété industrielle si nécessaire, la marque verbale « Dolcia », le D et les signes retenus.
5. Étudier rapidement le dépôt de dessins et modèles avant une nouvelle publication des visuels.
6. Conserver un registre nominatif des destinataires et utiliser un exemplaire PDF identifié pour chaque interlocuteur important.
7. Déplacer progressivement le moteur de classement et de composition du navigateur vers des fonctions serveur privées avant une ouverture publique.

## Limite actuelle à connaître

Le prototype contient encore une partie de la logique de sélection dans `app.js`. Un visiteur techniquement compétent peut lire le JavaScript envoyé à son navigateur. Le dépôt privé et l'accès restreint réduisent le risque pendant la phase de développement, mais la protection technique forte exige de placer le cœur du moteur côté serveur.

Ce plan organise la confidentialité et les preuves ; il ne remplace pas un avis juridique adapté au projet.

