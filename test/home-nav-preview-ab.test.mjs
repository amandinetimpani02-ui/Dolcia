import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('le comportement par défaut de la navigation ne change jamais sans le paramètre de preview explicite', () => {
  assert.match(app, /function homePreviewMode\(\)\{/);
  assert.match(app, /new URLSearchParams\(window\.location\.search\)\.get\('homePreview'\)/);
});

test('version A : la barre de navigation reste entièrement absente tout le temps qu’on est sur le Home', () => {
  assert.match(app, /if\(mode==='A'\)document\.body\.classList\.add\('home-nav-hidden-always'\)/);
  assert.match(style, /body\.home-nav-hidden-always \.bottom-nav\{display:none\}/);
});

test('version B : la barre reste absente sur le premier écran, puis apparaît après le premier défilement', () => {
  assert.match(app, /document\.body\.classList\.add\('home-nav-hidden-until-scroll'\)/);
  assert.match(app, /function homeNavScrollReveal\(\)\{/);
  assert.match(app, /window\.scrollY>poster\.offsetHeight\*\.6/);
  assert.match(style, /body\.home-nav-hidden-until-scroll \.bottom-nav\{opacity:0/);
});

test('le moteur et les parcours restent strictement identiques dans les deux versions — seul shell()/home() gèrent l’affichage de la barre, rien d’autre ne change', () => {
  assert.match(app, /function shell\(content, active='discover'\)\{\n\s*document\.body\.classList\.remove\('home-nav-hidden-always','home-nav-hidden-until-scroll','home-nav-revealed'\);/);
});

test('les classes de preview ne persistent jamais en quittant le Home vers un autre écran', () => {
  const fn = app.match(/function shell\(content, active='discover'\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /classList\.remove\('home-nav-hidden-always','home-nav-hidden-until-scroll','home-nav-revealed'\)/);
  assert.match(fn, /window\.removeEventListener\('scroll',homeNavScrollReveal\)/);
});
