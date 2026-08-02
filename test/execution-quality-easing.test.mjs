import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

// Trouvé en appliquant la nouvelle question ("est-ce déjà digne d'Apple ?") plutôt que "qu'est-ce
// qu'on ajoute ?" : deux interactions réellement visibles (recovery-option, animate-teams)
// utilisaient un easing générique au lieu de la courbe signature du produit — un détail qui se
// sent, même sans savoir l'expliquer.
test('les cartes de récupération (zero-result-cascade) utilisent la vraie courbe signature, pas un easing générique', () => {
  assert.match(premium, /\.recovery-option\{[\s\S]*?transition:transform \.3s cubic-bezier\(\.16,1,\.3,1\)/);
});

test('la barre d’équipes (Belambra Games) utilise la vraie courbe signature, pas un easing générique', () => {
  assert.match(premium, /\.animate-teams>div:not\(\.animate-teams-vs\)\{[\s\S]*?transition:all \.3s cubic-bezier\(\.16,1,\.3,1\)/);
});
