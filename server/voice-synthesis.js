// Voix neuronale réelle pour D, via ElevenLabs. La synthèse native du navigateur
// (speechSynthesis) sonne robotique quel que soit le texte écrit — c'est elle qui
// empêchait "D" de sonner comme une vraie personne, pas les dialogues.
// Ce module relaie l'audio en streaming ; en l'absence de clé, l'appelant (client)
// doit retomber sur speechSynthesis — ce fichier ne fait jamais planter l'appli.

const ELEVEN_STREAM_URL = (voiceId) => `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
  if (!KEY || !VOICE_ID) return res.status(503).json({ error: 'ElevenLabs not configured', fallback: 'browser-speech' });

  const body = req.body || {};
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 600) : '';
  if (!text) return res.status(400).json({ error: 'Missing text' });

  let upstream;
  try {
    upstream = await fetch(ELEVEN_STREAM_URL(VOICE_ID), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': KEY,
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.78, style: 0.35, use_speaker_boost: true }
      })
    });
  } catch (e) {
    return res.status(502).json({ error: e.message, fallback: 'browser-speech' });
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text?.().catch(() => '') || '';
    return res.status(502).json({ error: 'Voice engine unavailable', detail: errText.slice(0, 300), fallback: 'browser-speech' });
  }

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });

  const reader = upstream.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } catch { /* connexion coupée côté client (barge-in) : rien à faire de plus */ }
  finally { res.end(); }
}
