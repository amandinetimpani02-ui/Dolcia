const CATS = [
  { type: 'Concert & Musique', words: ['concert','musique','music'] },
  { type: 'Festival', words: ['festival'] },
  { type: 'Theatre & Danse', words: ['théâtre','theatre','danse','ballet','opéra','opera'] },
  { type: 'Spectacle & Humour', words: ['humour','comedie','comédie','one-man-show','stand up','spectacle'] },
  { type: 'Cinéma', words: ['cinema','cinéma','film','projection'] },
  { type: 'Exposition & Art', words: ['exposition','vernissage','galerie','musée','musee'] },
  { type: 'Culture & Patrimoine', words: ['dedicace','dédicace','livre','conférence','conference','patrimoine'] },
  { type: 'Gastronomie & Food', words: ['restaurant','gastronomie','dégustation','degustation'] },
  { type: 'Food Truck & Resto', words: ['food truck','foodtruck','street food'] },
  { type: 'Braderie & Brocante', words: ['braderie','vide-grenier','brocante'] },
  { type: 'Marchés & Foires', words: ['marché','marche','foire','salon'] },
  { type: 'Sport & Randonnée', words: ['randonnée','randonnee','balade','vélo','velo','trail','sport','competition'] },
  { type: 'Bien-être & Nature', words: ['yoga','méditation','meditation','bien-être','bien etre','nature','jardin'] },
  { type: 'Atelier & Cours', words: ['atelier','cours','initiation','formation','stage'] },
  { type: 'Famille & Enfants', words: ['famille','enfant','jeune public','kids'] },
  { type: 'Loisirs & Activités', words: ['bowling','karting','laser','escape','jeu','loisir','loto','bingo','tombola'] },
  { type: 'Soirées & Clubs', words: ['soirée','soiree','club','dj','discothèque','discotheque'] },
  { type: 'Événement local', words: ['inauguration','cérémonie','ceremonie','fête locale','fete locale','fête communale','fete communale'] },
  { type: 'Solidarité & Humanitaire', words: ['don du sang','humanitaire','solidarité','solidarite','caritatif','caritative'] }
];

function textOf(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(textOf).join(' ');
  if (typeof v === 'object') return Object.values(v).map(textOf).join(' ');
  return String(v);
}
function clean(v) { return textOf(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function detectCategory(ev) {
  const blob = [ev.title, ev.description, ev.longDescription, ev.keywords, ev.conditions].map(textOf).join(' ').toLowerCase();
  return CATS.find(c => c.words.some(w => blob.includes(w.toLowerCase()))) || { type: 'Événement local' };
}
function isFree(ev) {
  const blob = [ev.conditions, ev.description, ev.longDescription, ev.registration].map(textOf).join(' ').toLowerCase();
  return blob.includes('gratuit') || blob.includes('entrée libre') || blob.includes('entree libre');
}
function locationOf(ev) {
  const loc = ev.location || {};
  return clean(loc.name || loc.city || loc.address || '');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 30, after, before, size = 100 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });

  const AK = process.env.OPENAGENDA_KEY;
  if (!AK) return res.status(500).json({ error: 'OPENAGENDA_KEY not configured' });

  const now = new Date();
  const future = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const iso = d => d.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    key: AK,
    latLng: `${lat},${lng}`,
    radius: String(radius),
    limit: String(size),
    lang: 'fr'
  });
  params.append('timings[gte]', after || iso(now));
  params.append('timings[lte]', before || iso(future));

  try {
    const r = await fetch(`https://api.openagenda.com/v2/events?${params.toString()}`);
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: 'OpenAgenda error', status: r.status, message: d.message || null });
    const raw = d.events || [];
    const events = raw.map(ev => {
      const cat = detectCategory(ev);
      const begin = ev.timings?.[0]?.begin || null;
      return {
        id: ev.uid || ev.slug || ev.id,
        ttl: clean(ev.title || ev.name || 'Événement'),
        loc: locationOf(ev),
        date: begin,
        time: begin,
        type: cat.type,
        free: isFree(ev),
        desc: clean(ev.description || ev.longDescription).slice(0, 240),
        registrationUrl: ev.registrationUrl || null
      };
    });
    return res.status(200).json({ count: events.length, events });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
