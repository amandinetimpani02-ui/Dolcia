# MASTER — journal des évolutions Dolcia

Ce fichier documente chaque évolution technique, datée, en langage clair. Règle : toute évolution
future part de ce document ; on ne crée jamais de version parallèle non intégrée.

Note de continuité : ce fichier avait été tenu à jour du 24 au 25 juillet 2026 dans la base
précédente. La base v20.20/"D-CONVERSATION-HYBRIDE" (travail mené en parallèle, sur un autre poste)
ne contenait pas ce fichier — il est recréé ici pour que le journal continue, plutôt que de laisser
la documentation se fragmenter entre plusieurs sessions. Voir aussi `README_DOLCIA_HYBRID.md` pour
le résumé de ce qui a été livré dans cette base avant sa reprise ici.

## Deux vrais problèmes trouvés en test réel sur téléphone — 26 juillet 2026

- Première fois que l'appli déployée est testée en conditions réelles (pas juste en local) — exactement ce qui avait été recommandé. Deux problèmes réels rapportés avec capture d'écran, tous deux confirmés dans le code puis corrigés.
- **Régression de l'onboarding** : `pick()` ne faisait que mettre à jour la réponse et re-rendre l'écran — il fallait cliquer une deuxième fois sur "Continuer" pour avancer, alors que le principe d'origine (un tap = avance) n'exigeait ce bouton que pour les choix multiples. Corrigé : un choix simple avance désormais seul à l'étape suivante (léger délai de 220ms pour voir la sélection avant de tourner la page) ; les choix multiples gardent le bouton "Continuer" puisque plusieurs sélections sont attendues.
- **Écran de récupération incomplet** : quand les sources ne répondent pas, seules deux options existaient ("relancer" et "parler à D" — cette dernière était déjà là, contrairement à ce qui avait été rapporté au premier regard). Il manquait une vraie option d'élargissement de zone. Ajout de `widenSearchAndRetry()` : augmente réellement le rayon de recherche (plafonné à 25km, la limite déjà utilisée pour la recherche locale) et relance la collecte, plutôt que de laisser sans solution ou de proposer un simple nouvel essai identique.
- 163 tests verts après ces deux correctifs.

## Audit de régression complet — 26 juillet 2026 (session Claude, reprise de la base v20.20)

- Demande directe : ne plus jamais capituler ("pas de solution") sur un écran sans résultat, et vérifier qu'il n'y a pas d'autres régressions accumulées. Le point précis semble déjà couvert par le correctif `widenSearchAndRetry()` documenté ci-dessus (autre session) — les deux écrans "sans résultat" (`explorer-recovery`, `programEmptyCinematic`) proposent déjà systématiquement Dolcia Anime, un élargissement, ou une reformulation, jamais un simple message de fin.
- Audit systématique effectué en plus : syntaxe de tous les fichiers JS, limite de fonctions Vercel (11/12), classes CSS utilisées dans le HTML sans style associé (détection automatisée), et fonctions appelées par un `onclick` sans définition correspondante (109 vérifiées, toutes existantes).
- **Un vrai bug trouvé et corrigé** : l'écran de question "rythme du séjour" (`renderStayRhythmQuestion`) utilisait la classe `dialogue-options`, qui n'existe dans aucun fichier CSS — probablement une coquille pour `dialogue-choices`, la classe richement stylée utilisée partout ailleurs pour ce type d'écran. Cet écran précis s'affichait donc avec des boutons par défaut du navigateur, sans style premium, au milieu d'une appli qui l'est partout ailleurs. Corrigé.
- 163 tests toujours verts après ce correctif.
