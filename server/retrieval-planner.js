const SIGNATURE = [
  { match: /aquarium|animaux|zoo|faune|parc animalier/i, queries: ['aquarium', 'zoo parc animalier'], radius: 55000, reason: 'ANIMAL_SIGNATURE' },
  { match: /parc.*attraction|parc.*theme|fete foraine/i, queries: ['parc attractions parc à thème'], radius: 45000, reason: 'THEME_PARK_SIGNATURE' },
  { match: /grand evenement|festival|concert|spectacle/i, queries: ['festival concert spectacle'], radius: 50000, reason: 'MAJOR_EVENT_SIGNATURE' },
  { match: /nautique|char a voile|foil|kitesurf|surf|voile|catamaran/i, queries: ['base nautique char à voile', 'wing foil kitesurf surf voile'], radius: 30000, reason: 'COAST_SIGNATURE' }
];

function plain(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function buildRetrievalPlan({ queries = [], duration = '2h', momentSentence = '', widened = false, localRadius = 12000 } = {}) {
  const local = [...new Set(queries.map(String).filter(Boolean))].slice(0, 24).map(query => ({ query, radius: Math.min(Math.max(Number(localRadius) || 12000, 3000), 25000), scope: 'local', reason: 'LOCAL_ABUNDANCE' }));
  const allowRegional = widened || ['day', 'stay', 'afternoon_evening'].includes(duration);
  if (!allowRegional) return local;
  const corpus = plain(`${queries.join(' ')} ${momentSentence}`);
  const regional = SIGNATURE.filter(rule => rule.match.test(corpus)).flatMap(rule => rule.queries.map(query => ({ query, radius: rule.radius, scope: 'signature', reason: rule.reason })));
  return [...local, ...regional].filter((item, index, all) => all.findIndex(other => other.query === item.query && other.scope === item.scope) === index).slice(0, 30);
}
