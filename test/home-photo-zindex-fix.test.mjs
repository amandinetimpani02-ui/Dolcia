import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../home-premium.css', import.meta.url), 'utf8');

// Bug réel signalé : la photo du Home apparaissait un instant puis disparaissait derrière un
// fond noir. Cause : .home-poster-image avait z-index:-1, et .app (le conteneur parent) a une
// animation d'entrée — une animation crée un nouveau contexte d'empilement CSS, ce qui poussait
// l'image derrière le fond opaque de .app plutôt que simplement derrière son propre texte.
test('la photo du Home n’est plus poussée derrière le fond opaque du conteneur parent (z-index corrigé, plus de valeur négative)', () => {
  assert.match(css, /\.home-poster-image\{position:absolute;inset:0;z-index:0;/);
  assert.doesNotMatch(css, /\.home-poster-image\{[^}]*z-index:-1/);
});

test('le texte reste bien au-dessus de la photo malgré la correction (l’ordre relatif est préservé)', () => {
  assert.match(css, /\.home-poster-content\{position:relative;z-index:1;/);
});
