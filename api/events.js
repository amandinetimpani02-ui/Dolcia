const CATS = [
  { type: "Concert & Musique", icon: "music", words: ["concert", "musique", "music"] },
  { type: "Festival", icon: "festival", words: ["festival"] },
  { type: "Théâtre & Danse", icon: "theater", words: ["théâtre", "theatre", "danse", "ballet", "opéra", "opera"] },
  { type: "Spectacle & Humour", icon: "stage", words: ["humour", "comédie", "comedie", "stand up", "spectacle"] },
  { type: "Cinéma", icon: "film", words: ["cinéma", "cinema", "film", "projection"] },
  { type: "Exposition & Art", icon: "art", words: ["exposition", "vernissage", "galerie", "musée", "musee"] },
  { type: "Gastronomie & Food", icon: "food", words: ["restaurant", "gastronomie", "dégustation", "degustation"] },
  { type: "Braderie & Brocante", icon: "shop", words: ["braderie", "vide-grenier", "brocante"] },
  { type: "Marchés & Foires", icon: "market", words: ["marché", "marche", "foire", "salon"] },
  { type: "Sport & Randonnée", icon: "sport", words: ["randonnée", "randonnee", "balade", "vélo", "velo", "trail", "sport"] },
  { type: "Bien-être & Nature", icon: "nature", words: ["yoga", "méditation", "meditation", "bien-être", "bien etre", "nature", "jardin"] },
  { type: "Atelier & Cours", icon: "learn", words: ["atelier", "cours", "initiation", "formation", "stage"] },
  { type: "Famille & Enfants", icon: "family", words: ["famille", "enfant", "jeune public", "kids"] },
  { type: "Loisirs & Activités", icon: "leisure", words: ["bowling", "karting", "laser", "escape", "jeu", "loisir", "loto", "bingo", "tombola"] },
  { type: "Soirées & Clubs", icon: "party", words: ["soirée", "soiree", "club", "dj", "discothèque", "discotheque"] },
  { type: "Culture & Patrimoine", icon: "culture", words: ["dédicace", "dedicace", "livre", "conférence", "conference", "patrimoine"] },
  { type: "Évènements locaux", icon: "event", words: ["inauguration", "cérémonie", "ceremonie", "fête locale", "fete locale", "fête communale"] },
  { type: "Solidarité & Humanitaire", icon: "heart", words: ["don du sang", "humanitaire", "solidarité", "solidarite", "caritatif", "caritative"] }
];

function textOf(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return Object.values(v).join(" ");
  return String(v);
}

function cleanTitle(ev) {
  return textOf(ev.title || ev.name || ev.longDescription || "Évènement").trim();
}

function detectCategory(ev) {
  const blob = [
    textOf(ev.title),
    textOf(ev.description),
    textOf(ev.longDescription),
    textOf(ev.keywords),
    textOf(ev.conditions)
  ].join(" ").toLowerCase();

  for (const cat of CATS) {
    if (cat.words.some(w => blob.includes(w.toLowerCase()))) return cat;
  }

  return { type: "Évènements locaux", icon: "event" };
}

function isFree(ev) {
  const blob = [
    textOf(ev.conditions),
    textOf(ev.description),
    textOf(ev.longDescription),
    textOf(ev.registration)
  ].join(" ").toLowerCase();

  return blob.includes("gratuit") || blob.includes("entrée libre") || blob.includes("entree libre");
}

function getLocation(ev) {
  const loc = ev.location || {};
  return loc.name || loc.city || loc.address || "";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { lat, lng, radius = 30, after, before, size = 100 } = req.query;
  const AK = process.env.OPENAGENDA_KEY;

  if (!AK) {
    return res.status(500).json({ error: "OPENAGENDA_KEY not configured" });
  }

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing lat/lng" });
  }

  const params = new URLSearchParams({
    key: AK,
    latLng: `${lat},${lng}`,
    radius: String(radius),
    limit: String(size),
    lang: "fr"
  });

  if (after) params.append("timings[gte]", after);
  if (before) params.append("timings[lte]", before);

  try {
    const r = await fetch(`https://api.openagenda.com/v2/events?${params.toString()}`);

    if (!r.ok) {
      return res.status(r.status).json({
        error: "OpenAgenda error",
        status: r.status
      });
    }

    const d = await r.json();
    const rawEvents = d.events || [];

    const events = rawEvents.map(ev => {
      const cat = detectCategory(ev);
      const timing = ev.timings?.[0] || {};
      const begin = timing.begin || null;

      return {
        id: ev.uid || ev.slug || ev.id,
        ttl: cleanTitle(ev),
        loc: getLocation(ev),
        date: begin,
        time: begin,
        type: cat.type,
        icon: cat.icon,
        free: isFree(ev),
        desc: textOf(ev.description || ev.longDescription).slice(0, 240),
        registrationUrl: ev.registrationUrl || ev.registration?.[0]?.value || null,
        raw: ev
      };
    });

    return res.status(200).json({
      count: events.length,
      events
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
