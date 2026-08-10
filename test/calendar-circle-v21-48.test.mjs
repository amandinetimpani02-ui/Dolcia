import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../premium.css',import.meta.url),'utf8');

test('le parcours demande les dates et heures exactes avant toute proposition',()=>{
  for(const id of ['eclatStartDate','eclatStartTime','eclatEndDate','eclatEndTime'])assert.match(app,new RegExp(id));
  assert.match(app,/end<=start/);
  assert.match(app,/state\.dateStart=new Date\(a\.dateObject\)/);
  assert.match(app,/state\.dateEnd=new Date\(a\.endDateObject\|\|a\.dateObject\)/);
  assert.match(app,/Concerts, spectacles, grands matchs, phénomènes naturels et pépites locales ponctuelles/);
});

test('les personnes réellement présentes sont choisies avant les envies',()=>{
  assert.match(app,/return renderEclatGroupQuestion\(\)/);
  assert.match(app,/function confirmEclatGroup\(\)/);
  assert.match(app,/participantIds/);
  assert.match(app,/Le téléphone est à une personne ; l’expérience appartient au groupe/);
});

test('le retour au profil solo désélectionne réellement les anciens groupes',()=>{
  assert.match(app,/selected:person\.id==='me'/);
  assert.match(app,/participantIds=\['me'\]/);
});

test('les proches durables et les groupes temporaires sont deux logiques distinctes',()=>{
  assert.match(app,/Ajouter un proche durablement/);
  assert.match(app,/Créer un groupe temporaire/);
  assert.match(app,/dolcia_temporary_groups_v1/);
  assert.match(app,/inviteUrl/);
  assert.match(app,/code=Math\.random/);
});

test('un groupe temporaire et ses profils expirent réellement après le séjour',()=>{
  assert.match(app,/function expireTemporaryGroups/);
  assert.match(app,/new Date\(group\.expiresAt\)\.getTime\(\)<now/);
  assert.match(app,/state\.circleProfiles=state\.circleProfiles\.filter\(person=>!expiredIds\.has\(person\.id\)\)/);
  assert.match(app,/expires\.setHours\(23,59,59,999\)/);
});

test('le calendrier et le sélecteur de groupe restent utilisables sur mobile',()=>{
  assert.match(css,/\.exact-calendar/);
  assert.match(css,/\.eclat-group-picker/);
  assert.match(css,/@media\(max-width:560px\)\{\.exact-calendar,\.eclat-group-picker\{grid-template-columns:1fr\}/);
});
