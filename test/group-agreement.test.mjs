import test from 'node:test';
import assert from 'node:assert/strict';
import { groupAgreement } from '../server/recommendations.js';

test('un accord partagé fait remonter une activité sans inventer une unanimité', () => {
  const result = groupAgreement({ name: 'Atelier créatif en famille', category: 'culture' }, [
    { likes: ['create'], avoids: [], momentNeed: 'Découvrir' },
    { likes: ['create'], avoids: [], momentNeed: '' }
  ]);
  assert.equal(result.vetoes, 0);
  assert.ok(result.score > 0);
  assert.match(result.label, /accord fort/i);
});

test('un refus durable exclut une idée du programme collectif', () => {
  const result = groupAgreement({ name: 'Soirée en club', category: 'night' }, [
    { likes: ['vibrate'], avoids: [], momentNeed: 'S’amuser' },
    { likes: [], avoids: ['vibrate'], momentNeed: 'Souffler' }
  ]);
  assert.equal(result.vetoes, 1);
  assert.ok(result.score < 0);
});

test('pas aujourd’hui reste contextuel et ne devient pas un goût durable', () => {
  const result = groupAgreement({ name: 'Randonnée sportive', category: 'active' }, [
    { likes: ['play'], avoids: [], momentNeed: '', momentAvoid: 'activité sportive' }
  ]);
  assert.equal(result.vetoes, 1);
});
