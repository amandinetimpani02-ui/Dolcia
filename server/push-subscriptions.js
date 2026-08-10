// Enregistre l'abonnement push d'une personne — jamais activé sans son geste explicite
// (bouton "Activer les alertes"), jamais d'inscription automatique au chargement.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ saved: false, configured: false });

  if (req.method === 'DELETE') {
    const endpoint = req.body?.endpoint;
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    try {
      await fetch(`${url}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      return res.status(200).json({ removed: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST or DELETE required' });

  const body = req.body || {};
  const subscription = body.subscription;
  const lat = Number(body.lat), lng = Number(body.lng);
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid push subscription' });
  }

  const row = {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
    updated_at: new Date().toISOString()
  };

  try {
    const response = await fetch(`${url}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(row)
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ error: 'Could not save subscription', detail: errText.slice(0, 300) });
    }
    return res.status(200).json({ saved: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
