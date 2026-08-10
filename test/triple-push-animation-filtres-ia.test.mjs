import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const coachConversation = readFileSync(new URL('../server/coach-conversation.js', import.meta.url), 'utf8');

test('Animation : le programme calme/bien-être (yoga) est mains-libres, structuré en trois phases comme le sport', () => {
  const start = app.indexOf("calm:{title:'La parenthèse qui remet tout à zéro'");
  const block = app.slice(start, start + 900);
  assert.match(block, /phased:true/);
  assert.match(block, /phase:'coeur'/);
});

test('Filtres : "Pépite locale" existe comme filtre en un tap, basé sur le statut extended déjà vérifié par le moteur géo', () => {
  assert.match(app, /\{id:'pepite',label:'Pépite locale',test:item=>item\.geoEligibility\?\.status==='extended'\}/);
  assert.match(app, /\['signature','pepite'\]\.includes\(lens\.id\)/);
});

test('IA : le D-Coach connaît les pépites locales déjà vérifiées et peut les mentionner spontanément, sans jamais en inventer une', () => {
  assert.match(app, /function currentPepiteHighlight\(\)/);
  assert.match(app, /item\.geoEligibility\?\.status==='extended'/);
  assert.match(app, /pepite:currentPepiteHighlight\(\)/);
  assert.match(coachConversation, /Une pépite locale réelle et déjà vérifiée existe en ce moment/);
  assert.match(coachConversation, /jamais forcée dans une réponse sans rapport, jamais pour remplir/);
});

test('la pépite mentionnée au D-Coach vient uniquement de state.allItems déjà chargé, jamais d’une donnée fabriquée pour la conversation', () => {
  const fn = app.match(/function currentPepiteHighlight\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /state\.allItems\.filter/);
  assert.doesNotMatch(fn, /Math\.random\(\)[\s\S]*name/);
});
