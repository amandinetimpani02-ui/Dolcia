import { buildRetrievalPlan } from '../server/retrieval-planner.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const body = req.body || {};
  const queries = Array.isArray(body.queries) ? body.queries.slice(0, 40) : [];
  return res.status(200).json({ plan: buildRetrievalPlan({ queries, duration: String(body.duration || '2h'), momentSentence: String(body.momentSentence || '').slice(0, 500), widened: Boolean(body.widened), localRadius: Number(body.localRadius) || 12000 }) });
}
