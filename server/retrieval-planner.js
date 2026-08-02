const SIGNATURE = [
  { match: /aquarium|animaux|zoo|faune|parc animalier/i, queries: ['aquarium', 'zoo parc animalier'], radius: 55000, reason: 'ANIMAL_SIGNATURE' },
  { match: /parc.*attraction|parc.*theme|fete foraine/i, queries: ['parc attractions parc à thème'], radius: 45000, reason: 'THEME_PARK_SIGNATURE' },
  { match: /nautique|char a voile|foil|kitesurf|surf|voile|catamaran/i, queries: ['base nautique char à voile', 'wing foil kitesurf surf voile'], radius: 30000, reason: 'COAST_SIGNATURE' }
];
// Un grand événement régional (fête de ville, festival, braderie exceptionnelle...) n'est pas un
// centre d'intérêt personnel comme l'aquarium ou le nautique : c'est exactement ce qu'une pépite
// locale doit faire remonter d'elle-même, sans que la personne ait à deviner le bon mot-clé. Cette
// vérification tourne donc systématiquement dès qu'une recherche régionale est possible, qu'elle
// soit demandée explicitement ou non — elle ne remplace jamais le résultat local, elle s'y ajoute.
const MAJOR_EVENT_SIGNATURE = { match: /grand evenement|festival|f[eê]te|concert|spectacle|carnaval|foire|kermesse/i, queries: ['festival concert spectacle fête locale'], radius: 50000, reason: 'MAJOR_EVENT_SIGNATURE' };

function plain(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function buildRetrievalPlan({ queries = [], duration = '2h', momentSentence = '', widened = false, localRadius = 12000 } = {}) {
  const local = [...new Set(queries.map(String).filter(Boolean))].slice(0, 24).map(query => ({ query, radius: Math.min(Math.max(Number(localRadius) || 12000, 3000), 25000), scope: 'local', reason: 'LOCAL_ABUNDANCE' }));
  const allowRegional = widened || ['day', 'stay', 'afternoon_evening'].includes(duration);
  if (!allowRegional) return local;
  // Les requêtes locales couvrent volontairement beaucoup de familles de loisirs.
  // Elles ne constituent jamais, à elles seules, une demande d'élargissement.
  // Une recherche régionale ciblée (aquarium, nautique, parc à thème) n'est déclenchée que par les
  // mots réellement exprimés par l'utilisateur, ou par son choix explicite d'élargir — ce sont des
  // centres d'intérêt personnels, pas des pépites que Dolcia doit deviner à sa place.
  const corpus = plain(widened ? `${queries.join(' ')} ${momentSentence}` : momentSentence);
  const regional = SIGNATURE.filter(rule => rule.match.test(corpus)).flatMap(rule => rule.queries.map(query => ({ query, radius: rule.radius, scope: 'signature', reason: rule.reason })));
  // Les grands événements régionaux, eux, sont vérifiés systématiquement dès qu'une recherche
  // régionale est possible — jamais conditionnés à un mot-clé tapé par la personne.
  regional.push({ query: MAJOR_EVENT_SIGNATURE.queries[0], radius: MAJOR_EVENT_SIGNATURE.radius, scope: 'signature', reason: MAJOR_EVENT_SIGNATURE.reason });
  return [...local, ...regional].filter((item, index, all) => all.findIndex(other => other.query === item.query && other.scope === item.scope) === index).slice(0, 30);
}
