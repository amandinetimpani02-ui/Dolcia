import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');

test('un vrai programme sportif existe, structuré en trois phases comme une séance encadrée (échauffement, cœur de séance, retour au calme)', () => {
  assert.match(app, /sport:\{title:'Cardio doux entre nous'/);
  assert.match(app, /phase:'echauffement'/);
  assert.match(app, /phase:'coeur'/);
  assert.match(app, /phase:'retour'/);
  assert.match(app, /function animatePhaseLabel\(phase\)/);
  assert.match(css, /\.animate-phase-badge\.phase-echauffement/);
});

test('le programme sportif reste au niveau du rythme et du ressenti, jamais une consigne technique précise sur la forme d’un mouvement', () => {
  const sportBlock = app.match(/sport:\{title:'Cardio doux entre nous'[\s\S]*?\]\},/)?.[0] || '';
  assert.doesNotMatch(sportBlock, /dos droit|engage.*abdo|genoux.*alignés|posture correcte/i);
  assert.match(sportBlock, /à son rythme|selon votre ressenti|sans forcer/);
});

test('le badge de phase ne s’affiche que pour les programmes explicitement marqués "phased", jamais imposé aux jeux sociaux existants', () => {
  assert.match(app, /session\.item\.phased&&step\[2\]\?\.phase/);
});
