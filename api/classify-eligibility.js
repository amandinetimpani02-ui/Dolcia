import { classifyCandidate, applyAlternativeCheck } from '../server/geo-eligibility.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const expected = process.env.DOLCIA_TEST_SECRET;
  if (!expected || req.headers['x-dolcia-test-secret'] !== expected) return res.status(404).json({ error: 'Not found' });
  const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates.slice(0, 100) : [];
  const context = req.body?.context;
  if (!context?.origin || !candidates.length) return res.status(400).json({ error: 'Invalid payload' });
  try {
    const classified = [];
    for (const candidate of candidates) classified.push({ ...candidate, result: await classifyCandidate(candidate, context) });
    return res.status(200).json({ results: applyAlternativeCheck(classified).map(item => ({ id: item.id, ...item.result })) });
  } catch (error) { return res.status(500).json({ error: error.message }); }
}
