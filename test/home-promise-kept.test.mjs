import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Trouvé en traçant le parcours réel plutôt qu'en lisant le code seul : la séquence pluie
// promettait "La plage est presque à vous", mais s'affichait même sans grand moment réel derrière
// — révélant alors l'invitation générique "Dites-moi ce qui vous ferait plaisir." Une tension qui
// monte vers rien de concret casse l'émotion. Premier correctif (exiger un vrai moment) trop
// étroit : Dolcia ne doit pas attendre un événement exceptionnel pour créer une émotion. Le bon
// principe retenu : toujours une révélation, mais honnête — un grand moment réel s'il existe,
// sinon quelque chose d'ordinaire et structurellement vrai (une promenade, un coucher de soleil),
// jamais un lieu fabriqué pour ressembler à une découverte.
test('sans grand moment réel derrière, la promesse reste honnête : jamais une observation non vérifiée (météo, décor, horaire) déguisée en révélation personnalisée', () => {
  assert.match(app, /const ordinary=ctx==='ordinary'/);
  assert.match(app, /ordinary\?'Votre moment, à construire ensemble\.'/);
  const block = app.match(/ordinary:\[[\s\S]*?\]\n\};/)?.[0] || '';
  assert.doesNotMatch(block, /vent est tombé|coucher de soleil|promenade/i);
});
