import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('toute activité ouvre toujours une fiche via openDetail, jamais un lien externe direct au clic sur une carte', () => {
  assert.match(app, /async function openDetail\(id\)\{/);
  const cardRenderer = app.match(/function experience\(i,index,slotLabel=''\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(cardRenderer, /window\.open\(/, 'le rendu d’une carte ne doit jamais ouvrir un lien externe directement, uniquement openDetail');
});

test('trois niveaux de richesse déterminent uniquement le contenu affiché, jamais l’existence de la fiche', () => {
  assert.match(app, /function detailQuality\(item,verified\)\{/);
  assert.match(app, /return'rich'/);
  assert.match(app, /return'standard'/);
  assert.match(app, /return'minimal'/);
});

test('les actions sont générées comme des données (type, label, priority, isExternal, evidence), jamais codées bouton par bouton', () => {
  const fn = app.match(/function detailActions\(item\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /type:'add_agenda'/);
  assert.match(fn, /priority:1/);
  assert.match(fn, /isExternal:false/);
  assert.match(fn, /evidence:/);
});

test('une seule action principale (priority 1), toujours interne, tant qu’aucune réservation directe n’existe', () => {
  const fn = app.match(/function detailActions\(item\)\{[\s\S]*?\n\}/)?.[0] || '';
  const priorityOnes = (fn.match(/priority:1,/g) || []).length;
  assert.equal(priorityOnes, 1);
  assert.match(fn, /priority:1,handler:`addAgenda/);
});

test('aucune réservation directe fictive ou simulée n’existe dans le système d’actions', () => {
  const fn = app.match(/function detailActions\(item\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(fn, /reserve_directly|type:'reservation'/);
});

test('les actions externes sont identifiables et sécurisées (noopener, marquées visuellement)', () => {
  const renderer = app.match(/function renderDetailActions\(actions\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(renderer, /noopener,noreferrer/);
  assert.match(renderer, /a\.isExternal\?' \(lien externe, sécurisé\)':''/);
  assert.match(renderer, /a\.isExternal\?' ↗':''/);
});

test('l’action carte reflète honnêtement ce qui est vraiment connu (adresse vérifiée ou simple recherche par nom)', () => {
  const fn = app.match(/function detailActions\(item\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /evidence:item\.address\?'adresse vérifiée':'recherche par nom et destination, adresse non confirmée'/);
});

test('une fiche minimale omet les champs non décisifs manquants (téléphone, avis) plutôt que d’afficher "à confirmer" partout — réservé aux champs décisifs (adresse, horaire, prix)', () => {
  const factsBlock = app.match(/const facts=\[[\s\S]*?\]\.filter\(Boolean\)\.join\(''\);/)?.[0] || '';
  assert.match(factsBlock, /item\.phone\?`<div><b>Téléphone/);
  assert.doesNotMatch(factsBlock, /Non communiqué/, 'le téléphone manquant ne doit plus afficher de texte de substitution');
  assert.match(factsBlock, /Adresse<\/b><span>À confirmer/);
  assert.match(factsBlock, /Horaire<\/b><span>À confirmer/);
  assert.match(factsBlock, /Prix<\/b><span>À confirmer/);
});
