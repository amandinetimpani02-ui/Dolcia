const MAX_ITEMS = 650;

function plain(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function distanceKm(a, b, c, d) {
  const R = 6371;
  const x = (c - a) * Math.PI / 180;
  const y = (d - b) * Math.PI / 180;
  const q = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function isCivic(text) {
  return /\b(hotel de ville|mairie|city hall|town hall|rathaus|ayuntamiento|stadhuis|gemeentehuis|municipal building)\b/.test(plain(text));
}

function isLodging(item) {
  const text = plain(`${item.name || ''} ${item.address || ''} ${(item.types || []).join(' ')}`);
  return !isCivic(text) && /\b(lodging|hotel|hostel|motel|resort|camping|campground|chambre d.hote|bed and breakfast|residence de tourisme|village vacances|hebergement)\b/.test(text);
}

function estimatedTotal(item, context) {
  if (item.free || item.price === 0 || item.freeAccess) return { value: 0, known: true };
  const explicit = String(item.priceLabel || '').match(/(\d+(?:[,.]\d{1,2})?)\s*€/);
  if (explicit) return { value: Number(explicit[1].replace(',', '.')) * context.groupSize, known: true };
  const levels = { 0: 0, 1: 15, 2: 35, 3: 70, 4: 120 };
  if (item.price != null) return { value: (levels[Math.min(4, Number(item.price))] ?? 35) * context.groupSize, known: false };
  return { value: 0, known: false };
}

function intentionMatch(item, intentions) {
  const text = plain(`${item.name || ''} ${item.category || ''}`);
  const rules = {
    play: /active|parc|attraction|bowling|karting|laser|escape|trampoline|virtuelle|paintball|mini.?golf/,
    breathe: /outside|plage|nature|jardin|foret|balade|accrobranche|reserve|nautique|voile|surf|paddle|kayak|equitation|velo/,
    create: /culture|atelier|cours|stage|spectacle|cinema|musee|exposition|visite|patrimoine/,
    taste: /food|restaurant|brunch|gastronomie|cafe|marche|degustation/,
    recharge: /slow|spa|thalasso|massage|yoga|bien.etre/,
    vibrate: /night|bar|soiree|casino|cabaret|club|concert|festival|fete|feu d.artifice/
  };
  return intentions.some(id => rules[id]?.test(text));
}

function validForContext(item, context) {
  if (!item?.id || !item?.name || !item?.source) return false;
  if (item.category === 'hotel' && !isLodging(item)) return false;
  if (item.businessStatus === 'CLOSED_PERMANENTLY') return false;
  if (item.source === 'Google Places' && (!item.placeId || !item.address || item.lat == null || item.lng == null)) return false;
  const text = plain(`${item.name || ''} ${item.address || ''}`);
  if (!context.animal && /chien|chiens|canin|dog park|dog beach/.test(text)) return false;
  if (['family', 'friends'].includes(context.who) && /golf/.test(text) && /competition|championnat|trophee|coupe/.test(text)) return false;
  if (item.lat != null && item.lng != null && distanceKm(context.lat, context.lng, item.lat, item.lng) > context.radiusKm) return false;
  if (context.pilot === 'touquet' && /\bcalais\b|\bboulogne-sur-mer\b|\bdunkerque\b/.test(text)) return false;
  if (item.source !== 'Google Places') {
    if (!item.date) return false;
    const value = new Date(item.date);
    if (Number.isNaN(value.getTime()) || value < new Date(context.start) || value > new Date(context.end)) return false;
  }
  if (context.budget === 'free' && !(item.free || item.price === 0 || item.freeAccess)) return false;
  if (context.budget === 'budget1' && item.price != null && item.price > 1) return false;
  if (context.budget === 'budget2' && item.price != null && item.price > 2) return false;
  if (context.budget === 'budget3' && item.price != null && item.price > 3) return false;
  if (context.budget === 'custom' && context.budgetAmount != null) {
    const estimate = estimatedTotal(item, context);
    if (estimate.known && estimate.value > context.budgetAmount) return false;
  }
  return true;
}

function rank(item, context, memory) {
  const text = plain(item.name);
  const distance = item.lat != null && item.lng != null ? distanceKm(context.lat, context.lng, item.lat, item.lng) : null;
  let relevance = 50;
  let truth = 0;
  let moment = 0;
  let affinity = 0;
  if (intentionMatch(item, context.vibes)) relevance += 24;
  if (item.official) truth += 35;
  if (item.date && new Date(item.date).toDateString() === new Date(context.start).toDateString()) truth += 30;
  if (item.address) truth += 4;
  if (item.detailsKnown) truth += 7;
  if (item.rating >= 4.5) relevance += 12;
  if (item.reviews > 100) relevance += 5;
  if (item.isOpen === true) moment += 10;
  if (distance != null && distance < 3) moment += 8;
  if (context.temperature >= 25 && /paddle|surf|voile|foil|kite|kayak|plage|nautique|aquatique|piscine/.test(text)) moment += 42;
  if (/rain|drizzle|thunder|snow/.test(context.weather) && ['culture', 'slow', 'food'].includes(item.category)) moment += 22;
  if (['tonight', 'evening'].includes(context.dateMode) && ['food', 'night', 'culture'].includes(item.category)) moment += 14;
  if (context.who === 'family' && ['outside', 'active'].includes(item.category)) moment += 12;
  if (context.who === 'family' && context.groupDetail === 'toddlers') {
    if (/aire de jeux|ferme|zoo|aquarium|parc|plage|poney|manege/.test(text)) moment += 24;
    if (/casino|club|karting|paintball|thalasso/.test(text)) moment -= 30;
  }
  if (context.who === 'family' && context.groupDetail === 'teens' && /escape|laser|karting|surf|paddle|accrobranche|realite virtuelle|bowling/.test(text)) moment += 26;
  if (context.who === 'couple' && ['romantic', 'reconnect'].includes(context.groupDetail) && /restaurant|gastronomie|spa|massage|plage|coucher|voile|bar|concert/.test(text)) moment += 22;
  if (context.who === 'colleagues' && /afterwork|bar|restaurant|bowling|escape|degustation|atelier|casino/.test(text)) moment += 24;
  if (context.groupDetail === 'chill' && /spa|plage|balade|restaurant|cafe|jardin/.test(text)) moment += 18;
  if (context.groupDetail === 'lively' && /bowling|karting|laser|escape|concert|bar|parc/.test(text)) moment += 18;
  if (context.duration === 'stay' && item.category === 'hotel') moment += 32;
  if (context.budget === 'custom' && context.budgetAmount != null) {
    const estimate = estimatedTotal(item, context);
    const ratio = estimate.value / Math.max(1, context.budgetAmount);
    if (estimate.known && ratio <= .35) relevance += 16;
    else if (estimate.known && ratio <= .7) relevance += 8;
    else if (!estimate.known) truth -= 5;
  }
  if (memory.favorites.includes(item.id)) affinity += 20;
  if (memory.feedback[item.id] === 'like') affinity += 18;
  if (memory.feedback[item.id] === 'dislike') affinity -= 35;
  affinity += Number(memory.tasteProfile[item.category] || 0) * 4;
  if (item.sponsored) relevance += 0.001; // uniquement un départage à pertinence égale
  const total = relevance + truth + moment + affinity;
  const reasons = [];
  if (truth >= 30) reasons.push('information officielle ou datée');
  if (moment >= 25) reasons.push('très adapté au moment');
  if (affinity >= 15) reasons.push('proche de vos goûts');
  if (distance != null && distance < 3) reasons.push('tout près');
  return { ...item, score: total, distance, ranking: { confidence: truth >= 35 ? 'confirmed' : truth >= 15 ? 'probable' : 'documented', reasons: reasons.slice(0, 3) } };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const body = req.body || {};
  const context = body.context || {};
  if (!Number.isFinite(context.lat) || !Number.isFinite(context.lng) || !context.start || !context.end) {
    return res.status(400).json({ error: 'Invalid recommendation context' });
  }
  const safeContext = {
    lat: Number(context.lat), lng: Number(context.lng), radiusKm: Math.min(Math.max(Number(context.radiusKm) || 12, 1), 80),
    start: context.start, end: context.end, pilot: context.pilot === 'touquet' ? 'touquet' : 'other',
    who: String(context.who || ''), groupDetail: String(context.groupDetail || ''), childrenAges: Array.isArray(context.childrenAges) ? context.childrenAges.slice(0, 8) : [], momentSentence: String(context.momentSentence || '').slice(0, 500), duration: String(context.duration || ''), dateMode: String(context.dateMode || ''),
    budget: String(context.budget || ''), budgetAmount: Number.isFinite(Number(context.budgetAmount)) ? Math.max(0, Number(context.budgetAmount)) : null,
    groupSize: Math.min(Math.max(Number(context.groupSize) || 1, 1), 20), vibes: Array.isArray(context.vibes) ? context.vibes.slice(0, 8) : [],
    temperature: Number(context.temperature) || 18, weather: plain(context.weather), animal: Boolean(context.animal)
  };
  const memory = {
    favorites: Array.isArray(body.memory?.favorites) ? body.memory.favorites.slice(0, 500) : [],
    feedback: body.memory?.feedback && typeof body.memory.feedback === 'object' ? body.memory.feedback : {},
    tasteProfile: body.memory?.tasteProfile && typeof body.memory.tasteProfile === 'object' ? body.memory.tasteProfile : {}
  };
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  const ranked = items.filter(item => validForContext(item, safeContext)).map(item => rank(item, safeContext, memory))
    .sort((a, b) => b.score - a.score || Number(Boolean(b.sponsored)) - Number(Boolean(a.sponsored)));
  return res.status(200).json({ items: ranked, engine: 'dolcia-private-ranking-v1', count: ranked.length });
}
