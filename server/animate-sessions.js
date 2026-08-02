// Sessions Dolcia Anime partagées : une personne "prend la main" (avance les étapes), les autres
// suivent en direct sur leur propre téléphone via un code court ou un QR — exactement comme un
// animateur de club où chacun voit le même programme sans se regrouper autour d'un seul écran.
// La famille déjà liée au compte (proches enregistrés) n'a jamais besoin de ce code : elle est
// déjà dans le Cercle. Le code sert uniquement aux amis externes, pour une durée choisie et limitée
// (24h à une semaine) — jamais un accès permanent non maîtrisé.

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans caractères ambigus (0/O, 1/I)

function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return code;
}

const DURATION_HOURS = { '24h': 24, '2j': 48, '3j': 72, '1semaine': 168 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(200).json({ error: 'Supabase not configured', configured: false });

  if (req.method === 'GET') {
    const code = String(req.query.code || '').toUpperCase().trim();
    if (!code) return res.status(400).json({ error: 'Missing code' });
    try {
      const response = await fetch(`${url}/rest/v1/animate_live_sessions?code=eq.${encodeURIComponent(code)}&select=*`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      const rows = await response.json().catch(() => []);
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row) return res.status(404).json({ error: 'Session introuvable ou code invalide' });
      if (new Date(row.expires_at) < new Date()) return res.status(410).json({ error: 'Ce code a expiré' });
      return res.status(200).json({ state: row.state, updatedAt: row.updated_at });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST required' });

  const body = req.body || {};
  const action = body.action;

  if (action === 'create') {
    const durationKey = DURATION_HOURS[body.duration] ? body.duration : '24h';
    const code = generateCode();
    const expiresAt = new Date(Date.now() + DURATION_HOURS[durationKey] * 3600 * 1000).toISOString();
    try {
      const response = await fetch(`${url}/rest/v1/animate_live_sessions`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ code, state: body.state || {}, expires_at: expiresAt, updated_at: new Date().toISOString() })
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return res.status(502).json({ error: 'Could not create session', detail: detail.slice(0, 300) });
      }
      return res.status(200).json({ code, expiresAt, durationLabel: durationKey });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (action === 'update') {
    const code = String(body.code || '').toUpperCase().trim();
    if (!code) return res.status(400).json({ error: 'Missing code' });
    try {
      await fetch(`${url}/rest/v1/animate_live_sessions?code=eq.${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: body.state || {}, updated_at: new Date().toISOString() })
      });
      return res.status(200).json({ updated: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}

export { generateCode, DURATION_HOURS };
