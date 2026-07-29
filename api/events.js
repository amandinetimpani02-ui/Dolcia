import { cached, remember } from './utils.js';
import recommendationsHandler from '../server/recommendations.js';
import flashOffersHandler from '../server/flash-offers.js';
import coachConversationHandler from '../server/coach-conversation.js';
import realtimeVoiceHandler from '../server/realtime-voice.js';
import voiceSynthesisHandler from '../server/voice-synthesis.js';
import pushSubscriptionsHandler from '../server/push-subscriptions.js';
import flashNotifyHandler from '../server/flash-notify.js';

const CATS = [
  { type: "Concert & Musique", words: ["concert", "musique", "music"] },
  { type: "Festival", words: ["festival"] },
  { type: "Théâtre & Danse", words: ["théâtre", "theatre", "danse", "ballet", "opéra", "opera"] },
  { type: "Spectacle & Humour", words: ["humour", "comédie", "comedie", "one-man-show", "stand up", "spectacle"] },
  { type: "Cinéma", words: ["cinéma", "cinema", "film", "projection"] },
  { type: "Exposition & Art", words: ["exposition", "vernissage", "galerie", "musée", "musee"] },
  { type: "Gastronomie & Food", words: ["restaurant", "gastronomie", "dégustation", "degustation", "food"] },
  { type: "Food Trucks & Marchés", words: ["food truck", "foodtruck", "street food", "marché", "marche", "foire", "salon"] },
  { type: "Braderies & Brocantes", words: ["braderie", "vide-grenier", "brocante"] },
  { type: "Sport & Randonnée", words: ["randonnée", "randonnee", "balade", "vélo", "velo", "trail", "sport"] },
  { type: "Bien-être & Nature", words: ["yoga", "méditation", "meditation", "bien-être", "bien etre", "nature", "jardin"] },
  { type: "Atelier & Cours", words: ["atelier", "cours", "initiation", "formation", "stage"] },
  { type: "Famille & Enfants", words: ["famille", "enfant", "jeune public", "kids"] },
  { type: "Soirées & Clubs", words: ["soirée", "soiree", "club", "dj", "discothèque", "discotheque"] },
  { type: "Culture & Patrimoine", words: ["dédicace", "dedicace", "livre", "conférence", "conference", "patrimoine"] },
  { type: "Solidarité & Humanitaire", words: ["don du sang", "humanitaire", "solidarité", "solidarite", "caritatif"] }
];

function textOf(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return Object.values(v).join(" ");
  return String(v);
}
function cleanTitle(ev) {
  return textOf(ev.title || ev.name || ev.longDescription || "Événement").trim();
}
function classify(ev) {
  const blob = JSON.stringify(ev).toLowerCase();
  const found = CATS.find(c => c.words.some(w => blob.includes(w.toLowerCase())));
  return found ? found.type : "Événement local";
}
function isFree(ev) {
  const blob = JSON.stringify(ev).toLowerCase();
  return blob.includes("gratuit") || blob.includes("entrée libre") || blob.includes("entree libre");
}

export default async function handler(req, res) {
  if (req.query.service === 'recommendations') return recommendationsHandler(req, res);
  if (req.query.service === 'flash-offers') return flashOffersHandler(req, res);
  if (req.query.service === 'coach') return coachConversationHandler(req, res);
  if (req.query.service === 'realtime') return realtimeVoiceHandler(req, res);
  if (req.query.service === 'speak') return voiceSynthesisHandler(req, res);
  if (req.query.service === 'push-subscribe') return pushSubscriptionsHandler(req, res);
  if (req.query.service === 'flash-notify') return flashNotifyHandler(req, res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 30, after, before, size = 80 } = req.query;
  const AK = process.env.OPENAGENDA_KEY;
  if (!AK) return res.status(500).json({ error: 'OPENAGENDA_KEY not configured' });
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });
  const cacheKey = `events:${Number(lat).toFixed(2)}:${Number(lng).toFixed(2)}:${radius}:${after || ''}:${before || ''}:${size}`;
  const hit = cached(cacheKey);
  if (hit) {
    res.setHeader('X-Dolcia-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(hit);
  }

  const params = new URLSearchParams({
    key: AK,
    latLng: `${lat},${lng}`,
    radius: String(radius),
    size: String(size),
    limit: String(size),
    lang: 'fr'
  });
  if (after) params.append('timings[gte]', after);
  if (before) params.append('timings[lte]', before);

  try {
    const r = await fetch(`https://api.openagenda.com/v2/events?${params.toString()}`);
    const d = await r.json();
    const raw = d.events || d.data || d.results || [];
    const events = raw.map(ev => {
      const timing = ev.timings && ev.timings[0] ? ev.timings[0] : {};
      const loc = ev.location || (ev.locations && ev.locations[0]) || {};
      return {
        ...ev,
        title: cleanTitle(ev),
        type: classify(ev),
        free: isFree(ev),
        location: loc.name || loc.city || loc.address || "",
        date: timing.begin || null,
        registrationUrl: ev.registrationUrl || ev.onlineAccessLink || ev.url || null,
        image: ev.image || ev.thumbnail || null
      };
    });
    const payload = { ...d, events };
    res.setHeader('X-Dolcia-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(remember(cacheKey, payload, 10 * 60 * 1000));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
