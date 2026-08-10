# Audit parcours, compagnon et qualité des données — troisième passe

Trois audits sur les sept demandés, faits en profondeur réelle plutôt que sept en surface. Les
quatre autres (émotions, effet Apple, vision à deux ans, et le reste de l'effet compagnon) restent
à faire dans une prochaine passe — je préfère le dire clairement que remplir l'espace.

---

## 1. Audit de parcours — "une famille de 4 passe un mercredi après-midi"

**Tracé réellement dans le code, pas estimé.** Ouverture de l'app → écran Home (0 clic). Puis :

1. Toucher le champ "Dites-le simplement à Dolcia" → ouverture du dialogue.
2. Écran 1/4 — "Quand voulez-vous que ce moment commence ?" : aucune des options rapides
   (Maintenant / Ce soir / Demain) ne correspond à "mercredi après-midi" sauf coïncidence. Il faut
   choisir "Choisir une date" → un sous-écran supplémentaire avec un sélecteur de date **et** un
   menu déroulant de durée ("L'après-midi") — deux interactions dans le même écran.
3. Écran 2/4 — "Avec qui ?" → "En famille".
4. Écran 3/4 — "De quoi avez-vous besoin ?" → un choix d'élan (rire, souffler, découvrir…).
5. Écran 4/4 — budget → un montant.
6. Résultats affichés → toucher "Ajouter à mon agenda" sur une proposition.

**Total réel : 6 à 7 gestes minimum, dont un écran à deux sous-champs**, avant d'avoir une seule
activité dans l'agenda. C'est cohérent avec l'intention du produit (une seule vraie conversation,
pas un formulaire) — mais le cas précis "un jour précis qui n'est ni aujourd'hui ni demain" est
objectivement le chemin le plus long des quatre, alors que c'est probablement l'un des cas les
plus fréquents (planifier à l'avance, pas seulement dans l'instant).

**Chantier concret** : ajouter une option rapide "Cette semaine" à l'écran 1, qui ouvrirait
directement un sélecteur de jour de la semaine (7 boutons) plutôt que le calendrier complet — gain
d'un sous-écran pour un cas très courant. Impact : élevé (fréquence du cas). Difficulté : faible.

---

## 2. Audit de la mémoire compagnon — corrigé, une vraie mécanique existe déjà

**Vérifié, et c'est une bonne nouvelle à ne pas passer sous silence** : `companionMemory` n'est
pas qu'un objet stocké sans effet. Elle influence réellement le comportement : après plus de deux
échanges avec le dialogue Eclat, D dit littéralement *"Je reconnais déjà votre façon de choisir."*
— une vraie phrase de reconnaissance, déclenchée par un vrai compteur, pas une promesse en l'air.
Elle alimente aussi les "private jokes" pendant une session Dolcia Anime (`insideJokes`).

**Où la promesse "compagnon" s'affaiblit, concrètement** : cette mémoire ne retient que trois
choses (nombre d'interactions, dernier choix, un rituel court) — elle ne relie jamais un choix
d'aujourd'hui à un choix similaire d'une semaine ou d'un mois plus tôt de façon explicite pour la
personne ("comme la dernière fois où vous aviez choisi..."). Elle sait *que* vous avez une façon de
choisir, mais ne raconte jamais laquelle. C'est la différence entre "je te reconnais" et
"je me souviens précisément de toi" — la première existe, la seconde pas encore.

**Chantier concret** : faire parler `lastChoice`/`rituals` explicitement, pas seulement les
compter. Impact : élevé (c'est le cœur de la promesse compagnon). Difficulté : faible — la donnée
existe déjà, il manque la phrase qui l'exploite.

---

## 3. Audit de la qualité des données par source

**Google Places, vérifié précisément** : `place-details.js` demande explicitement
`place_id, name, formatted_address, formatted_phone_number, international_phone_number, website,
url, opening_hours, current_opening_hours, utc_offset_minutes, editorial_summary, rating,
user_ratings_total, photos, types, business_status`. **Absent de cette liste** : accessibilité PMR,
langues parlées, présence d'un parking, acceptation des animaux — Google ne fournit d'ailleurs pas
la plupart de ces champs de façon fiable, pas seulement Dolcia qui ne les demande pas.

`price_level` n'apparaît pas dans cette liste précise, mais j'ai vérifié plus loin : il est bien
récupéré via un autre point d'entrée (`places.js`, recherche), qui le renvoie par défaut sans
qu'on ait besoin de le demander explicitement. Ce n'est donc pas un bug — mais **la donnée elle-
même reste souvent absente côté Google**, une limite de leur base, pas de notre code.

**DATAtourisme, vérifié précisément** : le mapping réel (`normalize()`) n'extrait que titre, date,
ville, adresse, type, image, lien. **Aucun tarif, aucun horaire, aucun téléphone, aucune tranche
d'âge, aucune accessibilité** ne sont mappés aujourd'hui — même si la source les contient parfois,
le code ne les récupère pas. C'est la source la plus incomplète des deux au niveau du code, pas
forcément au niveau de ce que la source pourrait offrir.

**Ce qui manque le plus souvent, toutes sources confondues** : accessibilité PMR, langues parlées,
présence d'un parking, tolérance envers les animaux. Aucune des sources connectées aujourd'hui ne
fournit ces quatre champs de façon systématique.

**Chantier concret, borné** : étendre le mapping DATAtourisme pour extraire les champs tarif/
horaire/téléphone quand la source les fournit réellement (elle les a parfois, le code ne les lit
simplement pas encore) — un vrai gain, sans dépendre d'une nouvelle source externe. Impact : élevé.
Difficulté : faible à modérée (le travail de lecture du format DATAtourisme, déjà entamé, reste à
étendre).

---

## Ce qu'il reste à faire

Émotions, effet Apple (simplification), vision à deux ans, et le reste de l'audit compagnon —
non traités ici. Dis-moi si tu veux que je continue dans cet ordre, ou que je change de priorité.
