# Dolcia Phase 2 Final

Base : ZIP corrigé de Claude + compléments Phase 2.

Ajouts intégrés :
- galerie photos réelles jusqu'à 4 photos si Google les renvoie déjà
- aucun placeholder inventé pour la galerie
- zéro résultat premium avec actions de repli
- suppression/masquage des textes techniques côté utilisateur
- actions : élargir le rayon, changer d’ambiance, voir payant si gratuit bloque, recommencer
- fonctions love / like / no
- agenda local premium
- endpoint Place Details optionnel, non utilisé automatiquement pour éviter coût/latence

Non inclus volontairement :
- cache Supabase, à faire en session backend dédiée
- avis texte, dépend des droits/endpoints Google
