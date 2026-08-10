import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('le texte de chaque étape n’est plus l’instruction brute seule : il est précédé d’une phrase de hype façon animateur', () => {
  assert.match(app, /function animateStepText\(session\)\{/);
  assert.match(app, /const hype=pickVoiceLine\(finalStep\?\[/);
  assert.match(app, /return`\$\{hype\} \$\{base\}`/);
});

test('les répliques de réaction de D ont une vraie énergie de groupe (exclamations, adresse directe), pas un ton posé', () => {
  assert.match(app, /Ouais !! J.adore cette énergie/);
  assert.match(app, /Allez, on démarre !!/);
  assert.match(app, /Ah, tu en veux plus \?!/);
});

test('une mission accomplie déclenche une vraie célébration visuelle (confettis), pas juste un changement d’écran silencieux', () => {
  assert.match(app, /function celebrateAnimateMoment\(\)/);
  assert.match(app, /function completeDolciaAnimateStep\(\)\{[\s\S]{0,400}celebrateAnimateMoment\(\)/);
  assert.match(css, /\.animate-confetti\{position:fixed/);
  assert.match(css, /@keyframes confettiFall/);
});

test('la célébration se détruit toute seule et respecte le mouvement réduit, jamais de confettis qui restent bloqués à l’écran', () => {
  assert.match(app, /setTimeout\(\(\)=>burst\.remove\(\),1500\)/);
  assert.match(app, /prefers-reduced-motion: reduce.*matches\)return/);
});
