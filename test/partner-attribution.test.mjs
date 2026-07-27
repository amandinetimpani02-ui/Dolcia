import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pro = await readFile(new URL('../pro.js', import.meta.url), 'utf8');
const sql = await readFile(new URL('../supabase_partner_events.sql', import.meta.url), 'utf8');

test('le partenaire distingue intérêt, réservation, Pass et personnes venues', () => {
  assert.match(pro, /Personnes réellement venues/);
  assert.match(pro, /Réservations attribuées/);
  assert.match(pro, /Pass validés/);
  assert.match(pro, /Chiffre attribué/);
});

test('une venue exige une validation et ne peut pas être comptée deux fois', () => {
  assert.match(pro, /partnerState\.visitLog\.some\(row=>row\.reservationId===id\)/);
  assert.match(pro, /proof:'partner_pass_validation'/);
  assert.match(sql, /partner_validated_reservation_unique/);
  assert.match(sql, /event_type='pass_validated'/);
});

test('le suivi est ventilé par établissement et exportable', () => {
  assert.match(pro, /Par établissement/);
  assert.match(pro, /function exportAnalytics/);
  assert.match(pro, /text\/csv/);
  assert.match(sql, /establishment_id uuid references public\.partner_establishments/);
});
