import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const programsBlock = app.match(/const DOLCIA_ANIMATE_PROGRAMS=\{[\s\S]*?\n\};/)?.[0] || '';

test('la bibliothèque compte exactement 20 expériences, comme demandé', () => {
  const ids = [...programsBlock.matchAll(/\n {2}(\w+):\{title:/g)].map(m => m[1]);
  assert.equal(ids.length, 20, `attendu 20 expériences, trouvé ${ids.length}`);
});

test('les 10 catégories demandées sont toutes représentées (sport, olympiades, famille, couple, amis, piscine, quiz/blind-test, danse, détente, soirée)', () => {
  const required = ['sport', 'renforcement', 'olympiades_plage', 'defi_5_epreuves', 'family', 'chasse_tresor', 'rdv_complice', 'defi_deux', 'social', 'party', 'water', 'piscine_grand_jeu', 'blind_test', 'quiz_eclair', 'danse_minute', 'defi_rythme', 'calm', 'cocooning', 'veillee_animee', 'after_genereux'];
  for (const id of required) {
    assert.match(programsBlock, new RegExp(`\\n  ${id}:\\{title:`), `${id} doit exister`);
  }
});

test('aucune expérience ne mentionne un vainqueur, une défaite ou un perdant désigné — cohérent avec la règle déjà établie', () => {
  assert.doesNotMatch(programsBlock, /a gagné|a perdu|vainqueur|défaite/i);
});

test('le blind test repose sur les chansons des participants eux-mêmes, jamais un morceau fourni ou généré par Dolcia (contrainte de droit d’auteur)', () => {
  assert.match(programsBlock, /blind_test:\{title:'Le blind test party'[\s\S]*?depuis son téléphone/);
});

test('le quiz éclair repose sur des questions préparées par les participants, jamais des faits affirmés par Dolcia (aucune invention de fait)', () => {
  assert.match(programsBlock, /quiz_eclair:\{title:'Le quiz éclair'[\s\S]*?prépare deux questions sur un sujet qu’il connaît bien/);
});

test('les nouvelles expériences physiques (renforcement, olympiades, danse) restent structurées en 3 phases comme le programme sport existant, pour l’avancement mains libres', () => {
  for (const id of ['renforcement', 'olympiades_plage', 'defi_5_epreuves', 'danse_minute', 'cocooning']) {
    const entry = programsBlock.match(new RegExp(`${id}:\\{[\\s\\S]*?phased:true`));
    assert.ok(entry, `${id} doit être phased:true`);
  }
});

test('le nouveau jeu aquatique garde le même rappel de sécurité que le programme piscine déjà existant, jamais une garantie de surveillance inventée', () => {
  assert.match(programsBlock, /piscine_grand_jeu:\{[\s\S]*?on confirme la profondeur, les règles, une vraie surveillance active/);
});

test('toute nouvelle expérience apparaît automatiquement dans le sélecteur Dolcia Anime, sans code supplémentaire (Object.entries déjà générique)', () => {
  assert.match(app, /\$\{Object\.entries\(DOLCIA_ANIMATE_PROGRAMS\)\.map\(\(\[id,program\]\)=>/);
});
