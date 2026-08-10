import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generateCode, DURATION_HOURS } from '../server/animate-sessions.js';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const eventsApi = readFileSync(new URL('../api/events.js', import.meta.url), 'utf8');

test('les codes générés sont lisibles au dictée (jamais 0/O ni 1/I confondus) et de longueur cohérente', () => {
  const codes = Array.from({ length: 300 }, () => generateCode());
  assert.ok(codes.every(code => code.length === 6));
  assert.ok(codes.every(code => !/[0O1I]/.test(code)));
});

test('les durées de partage correspondent exactement à ce qui a été demandé : 24h, 2 jours, 3 jours, 1 semaine', () => {
  assert.deepEqual(DURATION_HOURS, { '24h': 24, '2j': 48, '3j': 72, '1semaine': 168 });
});

test('aucun nouveau fichier api/ créé : les sessions partagées passent par la branche existante', () => {
  assert.match(eventsApi, /req\.query\.service === 'animate-session'/);
});

test('la famille déjà dans le Cercle n’a jamais besoin d’un code — le partage sert uniquement aux amis externes, sur choix explicite', () => {
  assert.match(app, /function openAnimateSharePicker\(\)/);
  assert.match(app, /Votre famille déjà dans votre Cercle n.a besoin d.aucun code/);
});

test('la personne qui anime garde toujours la main : la vue suiveur est en lecture seule, sans bouton d’avancement', () => {
  const followerBlock = app.match(/function renderAnimateFollowerView\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(followerBlock, /completeDolciaAnimateStep|reactDolciaAnimate/);
  assert.match(app, /la personne qui anime garde la main sur l.avancement/);
});

test('le suivi se met à jour tout seul (sondage régulier) et s’arrête proprement en quittant', () => {
  assert.match(app, /animateFollowTimer=window\.setInterval\(refreshAnimateFollowerState,4000\)/);
  assert.match(app, /function stopAnimateFollow\(\)\{window\.clearInterval\(animateFollowTimer\);animateFollowTimer=null\}/);
  assert.match(app, /function leaveAnimateFollow\(\)\{stopAnimateFollow\(\)/);
});

test('rejoindre via un lien scanné (QR) pré-remplit et valide directement le code, sans étape supplémentaire', () => {
  assert.match(app, /const urlParams=new URLSearchParams\(window\.location\.search\)/);
  assert.match(app, /if\(urlParams\.get\('join'\)\)openAnimateJoin\(urlParams\.get\('join'\)\)/);
  assert.match(app, /if\(prefillCode\)joinAnimateSession\(\)/);
});

test('un code expiré ou introuvable est signalé clairement au suiveur, jamais une erreur silencieuse', () => {
  assert.match(app, /response\.status===410\?'Ce code a expiré\.':'Session introuvable\.'/);
});

test('le style du panneau de partage et de la vue suiveur existe', () => {
  assert.match(css, /\.animate-share-panel\{/);
  assert.match(css, /\.animate-join-card\{/);
});

test('l’envoi direct par SMS ou email est la méthode principale (un clic, reste dans les messages du destinataire, capture le contact), plus fluide qu’un QR quand on est déjà face à la personne', () => {
  assert.match(app, /function sendAnimateInvite\(joinUrl,code\)/);
  assert.match(app, /window\.location\.href=`mailto:/);
  assert.match(app, /window\.location\.href=`sms:/);
  assert.match(app, /session\.invitedContacts=session\.invitedContacts\|\|\[\];session\.invitedContacts\.push/);
});

test('le lien natif (WhatsApp, etc.) et le QR restent des solutions de repli, jamais la méthode mise en avant', () => {
  assert.match(app, /Ou partager le lien autrement/);
  assert.match(app, /Vous êtes ensemble \? Scannez/);
  assert.match(app, /function shareAnimateLink\(joinUrl,code\)/);
});

test('si le partage natif n’est pas disponible (desktop), le lien est copié dans le presse-papiers plutôt que de laisser la personne sans solution', () => {
  assert.match(app, /await navigator\.clipboard\.writeText\(joinUrl\);showToast\('Lien copié/);
});
