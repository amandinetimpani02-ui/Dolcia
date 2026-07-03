const CATS = [
  { type: 'Concert & Musique', words: ['concert','musique','music'] },
  { type: 'Festival', words: ['festival'] },
  { type: 'Théâtre & Danse', words: ['théâtre','theatre','danse','ballet','opéra','opera'] },
  { type: 'Spectacle & Humour', words: ['humour','comédie','comedie','one-man-show','stand up','spectacle'] },
  { type: 'Cinéma', words: ['cinéma','cinema','film','projection'] },
  { type: 'Exposition & Art', words: ['exposition','vernissage','galerie','musée','musee'] },
  { type: 'Culture & Patrimoine', words: ['dédicace','dedicace','livre','conférence','conference','patrimoine'] },
  { type: 'Gastronomie & Food', words: ['restaurant','gastronomie','dégustation','degustation'] },
  { type: 'Food Trucks & Marchés', words: ['food truck','foodtruck','street food','marché','marche','foire','salon'] },
  { type: 'Braderies & Brocantes', words: ['braderie','vide-grenier','brocante'] },
  { type: 'Sport & Randonnée', words: ['randonnée','randonnee','balade','vélo','velo','trail','sport','compétition','competition'] },
  { type: 'Bien-être & Nature', words: ['yoga','méditation','meditation','bien-être','bien etre','nature','jardin'] },
  { type: 'Atelier & Cours', words: ['atelier','cours','initiation','formation','stage'] },
  { type: 'Famille & Enfants', words: ['famille','enfant','jeune public','kids'] },
  { type: 'Loisirs & Activités', words: ['bowling','karting','laser','escape','jeu','loisir','loto','bingo','tombola'] },
  { type: 'Soirées & Clubs', words: ['soirée','soiree','club','dj','discothèque','discotheque'] },
  { type: 'Évènements locaux', words: ['inauguration','cérémonie','ceremonie','fête locale','fete locale','fête communale'] },
  { type: 'Solidarité & Humanitaire', words: ['don du sang','humanitaire','solidarité','solidarite','caritatif','caritative'] }
];
function txt(v){ if(!v) return ''; if(typeof v === 'string') return v; if(typeof v === 'object') return Object.values(v).join(' '); return String(v); }
function cat(ev){ const blob=[txt(ev.title),txt(ev.description),txt(ev.longDescription),txt(ev.keywords),txt(ev.conditions)].join(' ').toLowerCase(); return CATS.find(c=>c.words.some(w=>blob.includes(w))) || {type:'Évènements locaux'}; }
function free(ev){ const blob=[txt(ev.conditions),txt(ev.description),txt(ev.longDescription),txt(ev.registration)].join(' ').toLowerCase(); return blob.includes('gratuit') || blob.includes('entrée libre') || blob.includes('entree libre'); }
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { lat, lng, radius = 30, after, before, size = 100 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });
  const AK = process.env.OPENAGENDA_KEY;
  if (!AK) return res.status(500).json({ error: 'OPENAGENDA_KEY not configured' });
  const params = new URLSearchParams({ key: AK, latLng: `${lat},${lng}`, radius: String(radius), limit: String(size), lang: 'fr' });
  if (after) params.append('timings[gte]', after);
  if (before) params.append('timings[lte]', before);
  try {
    const r = await fetch(`https://api.openagenda.com/v2/events?${params.toString()}`);
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: 'OpenAgenda error', status: r.status, events: [] });
    const events = (d.events || []).map(ev => {
      const c = cat(ev); const timing = ev.timings?.[0] || {}; const begin = timing.begin || null;
      const title = txt(ev.title || ev.name || 'Événement').trim();
      const loc = ev.location?.name || ev.location?.city || ev.location?.address || '';
      return { id: ev.uid || ev.slug || ev.id, ttl: title, loc, date: begin, time: begin, type: c.type, free: free(ev), desc: txt(ev.description || ev.longDescription).slice(0,240), registrationUrl: ev.registrationUrl || null };
    });
    return res.status(200).json({ count: events.length, events });
  } catch (e) { return res.status(500).json({ error: e.message, events: [] }); }
}
