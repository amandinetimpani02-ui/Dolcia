// Relie enfin les campagnes du Studio partenaire (jusqu'ici purement locales, jamais persistées)
// au vrai pipeline d'envoi déjà construit (flash_offers -> webhook Supabase -> flash-notify.js).
// Pas de nouveau système d'envoi : une campagne approuvée devient simplement une ligne flash_offers
// réelle, qui déclenche le pipeline déjà existant et déjà testé — aucune duplication.
//
// Ce qui reste honnêtement hors scope ici : une vraie console d'approbation avec authentification
// équipe (admin.html est encore une coquille non connectée, volontairement, en attendant les rôles
// et le journal d'audit). En attendant, l'approbation passe par cet endpoint protégé par un secret
// partagé — un pont manuel, pas une solution finale d'administration.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ error: 'Supabase not configured', configured: false });

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${url}/rest/v1/partner_campaigns?select=*&order=created_at.desc`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      const rows = await response.json().catch(() => []);
      return res.status(200).json({ campaigns: Array.isArray(rows) ? rows : [] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST required' });
  const body = req.body || {};

  if (body.action === 'submit') {
    const { companyName, title, trigger, originalPrice, dolciaPrice, quantity, expiresAt, radiusKm, latitude, longitude } = body;
    if (!companyName || !title || !trigger) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const response = await fetch(`${url}/rest/v1/partner_campaigns`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({
          company_name: companyName, title, trigger, status: 'a_controler',
          original_price: originalPrice ?? null, dolcia_price: dolciaPrice ?? null, quantity: quantity ?? null,
          expires_at: expiresAt ?? null, radius_km: radiusKm ?? null, latitude: latitude ?? null, longitude: longitude ?? null,
          created_at: new Date().toISOString()
        })
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return res.status(502).json({ error: 'Could not submit campaign', detail: detail.slice(0, 300) });
      }
      const rows = await response.json().catch(() => []);
      return res.status(200).json({ campaign: rows[0] || null });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (body.action === 'approve') {
    const bridgeSecret = process.env.ADMIN_BRIDGE_SECRET;
    if (bridgeSecret && req.headers['x-admin-secret'] !== bridgeSecret) return res.status(401).json({ error: 'Invalid admin secret' });
    const campaignId = body.id;
    if (!campaignId) return res.status(400).json({ error: 'Missing id' });
    try {
      const fetchResponse = await fetch(`${url}/rest/v1/partner_campaigns?id=eq.${campaignId}&select=*`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      const rows = await fetchResponse.json().catch(() => []);
      const campaign = rows[0];
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

      // Seules les campagnes de type offre chiffrable (place libérée, offre flash) deviennent une
      // vraie ligne flash_offers, qui déclenche le pipeline d'envoi déjà construit et déjà testé.
      // Les autres déclencheurs (événement rare, plan B météo) restent hors scope de ce pont : ce
      // sont des formes de données différentes, à traiter séparément plutôt que de forcer une
      // correspondance qui fabriquerait des champs (prix, stock) qui n'existent pas vraiment.
      const bridgeable = campaign.original_price != null && campaign.dolcia_price != null;
      if (!bridgeable) {
        await fetch(`${url}/rest/v1/partner_campaigns?id=eq.${campaignId}`, {
          method: 'PATCH', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approuvee_sans_envoi' })
        });
        return res.status(200).json({ approved: true, bridgedToPush: false, reason: 'Type de campagne non chiffrable en offre, pas de pont automatique' });
      }

      const offerResponse = await fetch(`${url}/rest/v1/flash_offers`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({
          title: campaign.title, original_price: campaign.original_price, dolcia_price: campaign.dolcia_price,
          quantity_remaining: campaign.quantity ?? 1, expires_at: campaign.expires_at, radius_km: campaign.radius_km ?? 15,
          latitude: campaign.latitude, longitude: campaign.longitude, status: 'live',
          reason: `Campagne partenaire approuvée · ${campaign.company_name}`
        })
      });
      if (!offerResponse.ok) {
        const detail = await offerResponse.text().catch(() => '');
        return res.status(502).json({ error: 'Could not bridge to flash_offers', detail: detail.slice(0, 300) });
      }
      await fetch(`${url}/rest/v1/partner_campaigns?id=eq.${campaignId}`, {
        method: 'PATCH', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approuvee_et_envoyee' })
      });
      return res.status(200).json({ approved: true, bridgedToPush: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
