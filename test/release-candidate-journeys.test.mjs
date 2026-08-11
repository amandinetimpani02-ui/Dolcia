import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../premium.css',import.meta.url),'utf8');

test('D remains the last-resort companion even after a provider error',()=>{
  const catchIndex=app.indexOf("}catch(_){/* L'état de repli reste volontairement non technique.");
  const fallbackIndex=app.indexOf('injectDolciaAutonomousChoices();',catchIndex);
  const renderIndex=app.indexOf('explorerOnly?renderResults()',catchIndex);
  assert.ok(catchIndex>0);
  assert.ok(fallbackIndex>catchIndex);
  assert.ok(renderIndex>fallbackIndex);
});

test('Explorer no longer displays empty category tabs',()=>{
  assert.match(app,/id==='all'\|\|counts\[id\]>0/);
});

test('truth panel stays with the results instead of pushing the hero down',()=>{
  assert.match(app,/querySelector\('\.catalog-toolbar'\)\?\.insertAdjacentHTML\('beforebegin',momentTruthPanel/);
});

test('result hero is compact and explicitly versioned',()=>{
  assert.match(app,/explore-signature result-signature/);
  assert.match(css,/\.result-signature\{\s*min-height:430px/);
});
