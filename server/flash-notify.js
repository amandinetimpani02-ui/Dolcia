// Déclenché par un webhook Supabase Database (configuré dans le dashboard Supabase, pas ici) dès
// qu'une offre flash passe en statut 'live' — pas par un cron Vercel, limité à une fois par jour
// sur le plan Hobby et donc inutilisable pour une alerte "dernière minute".
// Règle non négociable : une seule offre déclenche un seul envoi par personne abonnée et proche,
// jamais de répétition, jamais d'alerte sans offre réelle et vérifiée derrière.
import webpush from 'web-push';
import { filterEligibleSubscriptions, buildPushPayload } from './flash-notify-helpers.js';

async function fetchSubscriptions(url, key) {
  const response = await fetch(`${url}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth,latitude,longitude`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  if (!response.ok) return [];
  return response.json();
}

async function fetchAlreadyNotified(url, key, offerId) {
  const response = await fetch(`${url}/rest/v1/push_notifications_sent?offer_id=eq.${offerId}&select=endpoint`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  if (!response.ok) return [];
  const rows = await response.json();
  return rows.map(row => row.endpoint);
}

async function recordNotified(url, key, offerId, endpoints) {
  if (!endpoints.length) return;
  await fetch(`${url}/rest/v1/push_notifications_sent`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates' },
    body: JSON.stringify(endpoints.map(endpoint => ({ offer_id: offerId, endpoint, sent_at: new Date().toISOString() })))
  }).catch(() => {});
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL, SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(200).json({ sent: 0, configured: false });
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return res.status(200).json({ sent: 0, configured: false, reason: 'VAPID keys missing' });

  // Le webhook Supabase envoie la ligne insérée/modifiée sous body.record (format standard des
  // Database Webhooks Supabase). On n'accepte que les offres réellement passées en 'live'.
  const offer = req.body?.record || req.body?.offer || req.body;
  if (!offer?.id || offer.status !== 'live') return res.status(200).json({ sent: 0, skipped: 'not live' });

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@dolcia.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  try {
    const [subscriptions, alreadyNotified] = await Promise.all([
      fetchSubscriptions(SUPABASE_URL, SUPABASE_KEY),
      fetchAlreadyNotified(SUPABASE_URL, SUPABASE_KEY, offer.id)
    ]);
    const eligible = filterEligibleSubscriptions(subscriptions, offer, alreadyNotified);
    const payload = buildPushPayload(offer);
    const sentEndpoints = [];

    await Promise.all(eligible.map(async sub => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
        sentEndpoints.push(sub.endpoint);
      } catch { /* abonnement expiré ou invalide : on ignore, pas de blocage des autres envois */ }
    }));

    await recordNotified(SUPABASE_URL, SUPABASE_KEY, offer.id, sentEndpoints);
    return res.status(200).json({ sent: sentEndpoints.length, eligible: eligible.length });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
