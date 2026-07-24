# Dolcia v20 — App front-end complète

## Contenu du zip
- `index.html` — structure de l'app (splash, brief vivant, questions décisives, Explorer/Programme/Anime, animation en direct, chat avec D, fiches, agenda)
- `style.css` — design system noir/or, Cormorant Garamond + DM Sans, matière de verre spatial
- `app.js` — toute la logique
- `manifest.json` — PWA

Ces trois fichiers remplacent (ou se fusionnent avec) tes `index.html` / `style.css` / `app.js` actuels.

## Important : ce qui est réel vs démo

Je n'ai aucun accès réseau dans l'environnement où j'ai construit ceci — je n'ai donc jamais pu appeler tes vraies clés (`GOOGLE_KEY`, `OPENAGENDA_KEY`, `OPENWEATHER_KEY`) ni les tester. Le code appelle bien tes vraies routes (`/api/places`, `/api/events`, `/api/weather`) en premier ; s'il n'y a pas de réponse, un jeu de données de démonstration prend le relais et **c'est toujours affiché comme tel à l'écran** (bandeau "Mode démonstration"), jamais présenté comme vérifié — conforme à la règle "zéro donnée fabriquée".

Une fois ces fichiers déployés sur ton vrai Vercel, avec tes vraies variables déjà configurées, tout bascule automatiquement sur les données réelles sans rien changer au code.

## Brancher une vraie IA pour le chat avec D

Le chat avec D (`sendToD` dans `app.js`) essaie d'abord `POST /api/events?service=chat`. S'il échoue, un moteur de secours local répond (jamais un mur d'erreur pour l'utilisateur).

Pour le rendre réellement intelligent, ajoute une branche à ton `api/events.js` existant — **je n'ai pas créé de nouveau fichier API**, conformément à ta règle. Voici le code à ajouter en tête de ton handler existant :

```js
// À ajouter dans api/events.js, avant la logique OpenAgenda existante
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { service } = req.query;

  if (service === 'chat' && req.method === 'POST') {
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

    const { message, context } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const systemPrompt = `Tu es D, la présence vivante de Dolcia (aussi appelée L'Éclat) — concierge de luxe,
animatrice et copilote budgétaire pour les loisirs au Touquet-Paris-Plage et en Côte d'Opale.
Ton chaleureux, précis, jamais robotique. Tu ne dois JAMAIS inventer un prix, un horaire, une
adresse ou une disponibilité — si tu ne sais pas, dis-le simplement. Contexte actuel : budget
restant ${context?.budgetRemaining ?? '?'} €, ${context?.agendaCount ?? 0} activité(s) en agenda,
activité en cours : ${context?.currentActivity ?? 'aucune'}. Réponds en 1 à 3 phrases, jamais plus.`;

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }]
        })
      });
      const d = await r.json();
      const reply = d.content?.find(c => c.type === 'text')?.text || null;
      if (!reply) throw new Error('Réponse vide');
      return res.status(200).json({ reply });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ... reste de ta logique OpenAgenda existante inchangée ...
}
```

Puis dans Vercel → Environment Variables, ajoute `ANTHROPIC_API_KEY` (clé récupérable sur console.anthropic.com), pour Production, Preview et Development.

**Attention à la limite Vercel Hobby (12 fonctions)** — comme documenté dans ton Product Book (section 45.1), n'ajoute jamais un nouveau fichier dans `/api`. Cette branche `?service=chat` s'ajoute à un fichier existant, donc ne consomme aucune fonction supplémentaire.

## Ce qui reste à fusionner avec ton vrai projet
- Stripe (Visibilité/Premium/Flash)
- Supabase (persistance partenaires, comptes, Cercle)
- Le vrai scoring/moteur de vérité (confirmé/probable/à vérifier) sur données réelles
- pro.html (espace partenaire)

Dis-moi quand tu veux qu'on fasse cette fusion.
