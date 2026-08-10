import { personaCore } from './coach-conversation.js';

const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1';
const MAX_SDP_LENGTH = 120_000;

export default async function realtimeVoiceHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: 'OPENAI_API_KEY not configured', fallback: true });

  const body = req.body || {};
  const sdp = typeof body.sdp === 'string' ? body.sdp : '';
  if (!sdp || sdp.length > MAX_SDP_LENGTH) return res.status(400).json({ error: 'Invalid SDP offer' });
  const mode = body.mode === 'animate' ? 'animate' : 'dcoach';
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const session = {
    type: 'realtime',
    model: REALTIME_MODEL,
    output_modalities: ['audio'],
    instructions: `${personaCore(mode, context)}
Tu es en conversation voix-à-voix en temps réel. Laisse la personne t'interrompre naturellement. Ne monopolise jamais la parole. Pose une seule question décisive lorsque c'est nécessaire, puis écoute. Ne récite jamais un questionnaire.`,
    audio: { input: { turn_detection: { type: 'semantic_vad', create_response: true, interrupt_response: true } } }
  };

  try {
    const form = new FormData();
    form.set('sdp', new Blob([sdp], { type: 'application/sdp' }), 'offer.sdp');
    form.set('session', new Blob([JSON.stringify(session)], { type: 'application/json' }), 'session.json');
    const upstream = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form
    });
    const answer = await upstream.text();
    if (!upstream.ok) return res.status(502).json({ error: 'Realtime voice unavailable', fallback: true, detail: answer.slice(0, 300) });
    return res.status(200).json({ sdp: answer, model: REALTIME_MODEL });
  } catch (error) {
    return res.status(502).json({ error: 'Realtime voice unavailable', fallback: true, detail: String(error?.message || error).slice(0, 300) });
  }
}

export { REALTIME_MODEL };
