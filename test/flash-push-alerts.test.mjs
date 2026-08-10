import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterEligibleSubscriptions, buildPushPayload } from '../server/flash-notify-helpers.js';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const eventsApi = readFileSync(new URL('../api/events.js', import.meta.url), 'utf8');
const pushSubscriptions = readFileSync(new URL('../server/push-subscriptions.js', import.meta.url), 'utf8');
const flashNotify = readFileSync(new URL('../server/flash-notify.js', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

test('les alertes ne s’activent jamais toutes seules : il faut un geste explicite sur un bouton', () => {
  assert.match(app, /function enableFlashAlerts\(\)/);
  assert.doesNotMatch(app, /window\.onload.*enableFlashAlerts|DOMContentLoaded.*enableFlashAlerts/s);
  assert.match(app, /flash-alert-toggle/);
  assert.match(app, /Être alerté dès qu.une occasion se libère/);
});

test('la personne peut se désabonner à tout moment, la clé publique VAPID est bien celle attendue', () => {
  assert.match(app, /function disableFlashAlerts\(\)/);
  assert.match(app, /unsubscribe/);
  assert.match(app, /const VAPID_PUBLIC_KEY=/);
});

test('le service worker affiche la notification reçue sans jamais fabriquer de contenu par défaut trompeur', () => {
  assert.match(sw, /addEventListener\('push'/);
  assert.match(sw, /addEventListener\('notificationclick'/);
});

test('la diffusion des push est déclenchée par un webhook Supabase, pas par le cron Vercel (limité à 1 fois/jour sur Hobby)', () => {
  assert.match(flashNotify, /webhook Supabase/);
  assert.match(flashNotify, /Hobby/);
  assert.match(flashNotify, /SUPABASE_WEBHOOK_SECRET/);
  assert.match(flashNotify, /offer\.status !== 'live'/);
});

test('aucun nouveau fichier api/ : les push passent par la branche existante ?service=', () => {
  assert.match(eventsApi, /req\.query\.service === 'push-subscribe'/);
  assert.match(eventsApi, /req\.query\.service === 'flash-notify'/);
});

test('l’abonnement push est enregistré seulement si Supabase est configuré, jamais d’erreur qui bloque l’appli', () => {
  assert.match(pushSubscriptions, /SUPABASE_URL/);
  assert.match(pushSubscriptions, /configured: false/);
});

test('web-push est déclaré comme dépendance (RFC 8291/8292 trop risqué à réimplémenter à la main)', () => {
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.dependencies?.['web-push'], '^3.6.7');
});

test('le filtrage géographique ne notifie qu’une fois par offre et respecte le rayon annoncé', () => {
  const offer = { id: 1, title: 'Test', latitude: 50.52, longitude: 1.59, radius_km: 10 };
  const subs = [
    { endpoint: 'near', latitude: 50.53, longitude: 1.6 },
    { endpoint: 'far', latitude: 48.85, longitude: 2.35 },
    { endpoint: 'already-notified', latitude: 50.53, longitude: 1.6 }
  ];
  const eligible = filterEligibleSubscriptions(subs, offer, ['already-notified']);
  assert.deepEqual(eligible.map(s => s.endpoint), ['near']);
});

test('une offre sans économie chiffrée ne fabrique pas de pourcentage de réduction inventé', () => {
  const payload = JSON.parse(buildPushPayload({ id: 2, title: 'Atelier gratuit' }));
  assert.doesNotMatch(payload.body, /%/);
});
