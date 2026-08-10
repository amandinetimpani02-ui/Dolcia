import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const premium = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('audit de régression : les notes de sécurité et les liens de source vérifiée des grands événements sont bien stylés (trouvés orphelins)', () => {
  assert.match(style, /\.major-safety\{/);
  assert.match(style, /\.major-source\{/);
});

test('audit de régression : la conclusion chaleureuse des deux équipes (Belambra Games) est bien stylée, pas juste du texte brut', () => {
  assert.match(premium, /\.animate-teams-closing\{/);
});
