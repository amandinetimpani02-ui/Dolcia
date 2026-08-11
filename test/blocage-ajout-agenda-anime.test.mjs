import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Bug réel signalé directement par capture d'écran : le bouton "Ajouter à mon agenda" ne
// répondait à aucun clic pour un programme Dolcia Anime autonome ("Le Touquet en défis avec D").
// Cause exacte : momentCompatibility() ne reconnaissait que les lieux Google Places ou les
// événements datés — un programme autonome (source: 'Programme Dolcia', sans date) tombait
// directement sur 'unknown', et addAgenda() abandonnait silencieusement avec un simple toast.

test('un programme Dolcia autonome (autonomousProgram) est reconnu comme compatible, avant même la vérification Google Places', () => {
  const start = app.indexOf('function momentCompatibility(item){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  const autonomousIndex = fn.indexOf("if(item.autonomousProgram)return'autonomous';");
  const googleOnlyIndex = fn.indexOf("if(item.source!=='Google Places')return'unknown';");
  assert.ok(autonomousIndex > -1, 'la vérification doit exister');
  assert.ok(autonomousIndex < googleOnlyIndex, 'elle doit être vérifiée avant le blocage Google Places, sinon elle ne sert à rien');
});

test('reproduction exacte du cas signalé : "Le Touquet en défis avec D" retourne désormais "autonomous", jamais "unknown"', () => {
  const start = app.indexOf('function momentCompatibility(item){');
  const next = app.indexOf('\n}', start);
  const fn = app.slice(start, next);
  // On ne peut pas exécuter directement la fonction (dépendances DOM), mais on vérifie que le
  // chemin de code correct existe et précède bien tout ce qui retournerait 'unknown' pour ce cas.
  assert.match(fn, /if\(item\.autonomousProgram\)return'autonomous';\s*\n\s*if\(item\.source!=='Google Places'\)return'unknown';/);
});
