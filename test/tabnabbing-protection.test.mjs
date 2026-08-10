import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Un lien externe ouvert sans noopener laisse la page de destination capable de rediriger
// silencieusement l'onglet Dolcia resté ouvert derrière (tabnabbing) — un vrai risque, pas un
// détail cosmétique.
test('tous les liens externes (carte, site officiel, réservation) protègent contre le tabnabbing', () => {
  const openCalls = (app.match(/window\.open\(/g) || []).length;
  assert.ok(openCalls >= 2, 'les appels connus (barre d’actions rapides + génération dynamique des actions) doivent être présents');
  const renderer = app.match(/function renderDetailActions\(actions\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(renderer, /noopener,noreferrer/, 'renderDetailActions doit protéger tous les liens externes qu’elle génère, quel que soit leur nombre');
});
