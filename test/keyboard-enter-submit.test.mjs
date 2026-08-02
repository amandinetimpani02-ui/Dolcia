import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Taper une réponse puis appuyer sur Entrée est le geste le plus naturel qui soit sur un champ de
// texte accompagné d'un seul bouton d'action. Sans gestion du clavier, ce geste ne faisait rien —
// un décrochage de comportement, pas de style.
test('le champ de texte libre du composer (Ou dites-le avec vos mots…) se soumet aussi avec la touche Entrée, pas seulement au clic', () => {
  assert.match(app, /id="eclatFree"[^>]*onkeydown="if\(event\.key==='Enter'\)answerEclatFree\(\)"/);
});
