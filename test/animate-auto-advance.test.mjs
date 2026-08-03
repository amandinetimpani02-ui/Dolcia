import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('les horaires du programme (HH:MM = minutes écoulées) sont correctement convertis en secondes, pas confondus avec MM:SS', () => {
  assert.match(app, /function parseStepSeconds\(label\)\{const match=\/\(\\d\{1,2\}\):\(\\d\{2\}\)\/\.exec\(label\|\|''\);return match\?\(Number\(match\[1\]\)\*60\+Number\(match\[2\]\)\)\*60:0\}/);
});

test('un programme sportif structuré avance automatiquement, sans avoir à toucher l’écran — impossible autrement pendant un effort physique', () => {
  assert.match(app, /function scheduleAnimateAutoAdvance\(session\)/);
  assert.match(app, /if\(!session\.item\.phased\)return/);
  assert.match(app, /scheduleAnimateAutoAdvance\(session\)/);
});

test('l’avancement automatique respecte les horaires réels du programme, jamais une durée fixe arbitraire pour toutes les étapes', () => {
  assert.match(app, /const next=session\.index<steps\.length-1\?parseStepSeconds\(steps\[session\.index\+1\]\[0\]\):current\+45/);
});

test('l’avancement automatique s’arrête proprement à la pause et à la fin, jamais laissé tourner en arrière-plan', () => {
  assert.match(app, /function pauseDolciaAnimate\(\)\{stopDolciaTheme\(\);stopLiveConversation\(\);stopAnimatePulse\(\);window\.clearTimeout\(animateNudgeTimer\);window\.clearTimeout\(animateAutoAdvanceTimer\)/);
  assert.match(app, /function finishDolciaAnimate\(\)\{[\s\S]{0,120}window\.clearTimeout\(animateAutoAdvanceTimer\)/);
});

test('l’avancement automatique ne s’applique qu’aux programmes explicitement structurés (sport, calme), jamais forcé sur les jeux sociaux existants', () => {
  const gamePrograms = ['social', 'party', 'family', 'water'];
  for (const id of gamePrograms) {
    const block = app.match(new RegExp(`${id}:\\{title:'[^']*'[\\s\\S]*?\\]\\},`))?.[0] || '';
    assert.ok(block.length > 0, `le bloc ${id} doit être trouvé par le test, pas silencieusement vide`);
    assert.doesNotMatch(block, /phased:true/, `${id} ne doit pas être marqué phased`);
  }
});

test('le programme calme/bien-être (yoga) est aussi mains-libres maintenant, sur le même principe que le sport', () => {
  const start = app.indexOf("calm:{title:'La parenthèse qui remet tout à zéro'");
  assert.ok(start > -1, 'le programme calm doit exister');
  const block = app.slice(start, start + 900);
  assert.match(block, /phased:true/);
  assert.match(block, /phase:'echauffement'/);
  assert.match(block, /phase:'coeur'/);
  assert.match(block, /phase:'retour'/);
});
