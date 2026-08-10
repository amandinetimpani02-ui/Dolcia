import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const coachConversation = readFileSync(new URL('../server/coach-conversation.js', import.meta.url), 'utf8');

test('vision v21 : les questions de D sont formulées dans un registre émotionnel, jamais technique ou administratif', () => {
  assert.match(coachConversation, /Formule toujours ta question dans un registre émotionnel, jamais technique ou administratif/);
  assert.match(coachConversation, /Vous avez envie de rire, ou plutôt de souffler/);
  assert.doesNotMatch(coachConversation, /jamais.*Quelle catégorie.*Quel budget.*sortis de nulle part comme un menu déroulant\n\n/); // pas de duplication accidentelle
});

test('la priorité des questions (qui/énergie/contrainte) reste inchangée — la vision v21 enrichit le ton, pas la structure déjà solide', () => {
  assert.match(coachConversation, /\(1\) qui est présent et l.âge des enfants/);
  assert.match(coachConversation, /\(2\) l.énergie recherchée/);
  assert.match(coachConversation, /\(3\) une vraie contrainte de temps ou de budget/);
});
