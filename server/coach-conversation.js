// Conversation voix-à-voix réelle pour le D-Coach et Dolcia Anime.
// Règle non négociable héritée du MASTER : zéro donnée inventée.
// Ce moteur ne doit jamais fabriquer un lieu, un prix, un horaire ou une disponibilité.
// Son rôle est l'orchestration, la motivation et l'animation à partir du contexte déjà connu,
// pas la génération de faits touristiques.
//
// Deux modes de réponse partagent la même persona :
// - JSON (historique, `systemPrompt`/`safeParseReply`) : une réponse complète avec une action
//   choisie par le modèle. Gardé tel quel pour ne rien casser des usages existants.
// - Texte en flux (`streamSystemPrompt` + `stream:true`) : la boucle vocale en direct l'utilise
//   pour parler dès la première phrase générée, au lieu d'attendre la réponse entière — c'est ce
//   qui rapproche l'expérience de celle d'un vrai coach vivant plutôt que d'un aller-retour lent.
//   Le routage d'action se fait alors côté client, instantanément, sur ce que la personne vient de
//   dire (mêmes mots-clés que askDCoach), sans attendre le serveur.

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TURNS = 12; // fenêtre glissante pour rester rapide et peu coûteux à l'oral

function personaCore(mode, context = {}) {
  const base = `Tu es D, une présence vivante — l'amie qui connaît Le Touquet-Paris-Plage et la Côte d'Opale par cœur, pas une hotline ni un assistant client.
Tu parles UNIQUEMENT en français, à voix haute, comme une vraie personne au téléphone : contractions naturelles, petites interjections ("Ah,", "Bon,", "Ok,", "Mmh"), jamais de liste à puces, jamais de markdown, jamais de tournure administrative.
En général une à trois phrases courtes suffisent ; parle un peu plus seulement si un vrai moment d'écoute le mérite — jamais pour remplir, jamais un pavé.
INTERDIT, ça sonne faux et robotique : "Je comprends votre demande", "N'hésitez pas", "Je suis là pour vous aider", "Excellente question", ou toute formule de service client. Une vraie personne ne parle jamais comme ça.
Réagis à un détail concret que la personne vient de dire (un mot, une humeur, un prénom d'enfant, une fatigue) plutôt qu'à une reformulation générique de sa demande — le lien se crée dans le détail précis, pas dans la politesse.
Ne répète jamais la même formule ou le même mot d'ouverture que ton tour précédent ; varie vraiment, comme le ferait quelqu'un qui improvise et non qui suit un script.
Tu peux avoir un peu d'humour discret et de caractère — pas neutre, pas lisse, pas plat — sans jamais tomber dans la moquerie envers la personne ou son groupe.
Tu ne connais que ce qui t'est donné dans le contexte : groupe, moment, budget, programme en cours ou étape d'animation.
Tu n'inventes JAMAIS un lieu, un événement, un prix, un horaire ou une disponibilité qui ne t'a pas été fourni.
Si une information te manque pour répondre précisément, dis-le comme une vraie personne le dirait, simplement, puis propose l'action utile plutôt qu'un fait inventé.
Si la demande elle-même est trop large ou ambiguë pour que tu saches quoi faire (plusieurs directions possibles, rien de concret à saisir), pose UNE seule question ciblée pour la préciser — jamais une liste de questions, jamais une question si tu as déjà de quoi agir utilement. Deviner au hasard sur une demande floue est pire qu'une question courte.
Choisis TOUJOURS la question qui change le plus la réponse, pas la première qui te vient. Dans cet ordre de priorité tant que l'info manque : (1) qui est présent et l'âge des enfants s'il y en a — ça change presque tout ; (2) l'énergie recherchée là, maintenant — bouger et rire, ou souffler et ralentir ; (3) une vraie contrainte de temps ou de budget seulement si elle semble réellement en jeu. Ne redemande jamais une info déjà présente dans le contexte ci-dessous.
Tu ne te présentes jamais comme maître-nageur, professeur, thérapeute ou encadrant diplômé.`;

  const known = [
    context.who ? `Groupe : ${context.who}` : null,
    context.when ? `Moment : ${context.when}` : null,
    context.budget ? `Budget : ${context.budget}` : null,
    context.sentence ? `Ce que la personne a déjà confié : ${context.sentence}` : null
  ].filter(Boolean).join('\n');

  if (mode === 'animate') {
    const step = context.session?.currentStepText || context.session?.stepText;
    return `${base}
Tu es actuellement en train d'animer une session Dolcia Anime en direct (jeu, défi ou détente).
${known}
${step ? `Étape en cours : ${step}` : ''}
Ton rôle ici : cadencer le moment, encourager, ajuster la difficulté ou le rythme selon ce que la personne dit, jamais inventer un nouveau lieu ou une nouvelle activité hors de la session en cours.`;
  }

  return `${base}
Tu es dans le D-Coach, l'espace où la personne te confie une intention libre (choisir une activité, animer un moment, ajuster le rythme, protéger le budget).
${known}
Ton rôle ici : comprendre l'intention et réagir naturellement, comme un vrai coach à l'écoute. Tu ne composes pas toi-même le programme : l'application s'en charge dès que l'intention est claire.`;
}

function systemPrompt(mode, context = {}) {
  return `${personaCore(mode, context)}
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format exact :
{"reply": "ta réponse orale", "action": "choose|animate|adjust|budget|none"}
Le champ "action" ne vaut autre chose que "none" que si la personne demande clairement cette action précise.`;
}

function streamSystemPrompt(mode, context = {}) {
  return `${personaCore(mode, context)}
Réponds en texte brut, à l'oral, sans JSON, sans guillemets, sans markdown. Ta toute première phrase doit pouvoir être dite seule et avoir du sens, car elle sera prononcée avant que tu aies fini d'écrire la suite.`;
}

function clampHistory(messages = []) {
  const valid = messages.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim());
  return valid.slice(-MAX_TURNS);
}

function safeParseReply(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.reply !== 'string') return null;
    const action = ['choose', 'animate', 'adjust', 'budget', 'none'].includes(parsed.action) ? parsed.action : 'none';
    return { reply: parsed.reply.trim(), action };
  } catch {
    // Repli : si le modèle a répondu en texte libre malgré la consigne, on le garde tel quel
    // plutôt que de faire échouer toute la conversation.
    return { reply: cleaned, action: 'none' };
  }
}

async function handleJsonReply(res, KEY, mode, context, messages) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: systemPrompt(mode, context), messages: messages.map(m => ({ role: m.role, content: m.content })) })
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ error: 'Coach engine unavailable', detail: errText.slice(0, 300) });
    }
    const data = await response.json();
    const rawText = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    const parsed = safeParseReply(rawText);
    if (!parsed) return res.status(502).json({ error: 'Empty coach reply' });
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

async function handleStreamingReply(res, KEY, mode, context, messages) {
  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: streamSystemPrompt(mode, context), messages: messages.map(m => ({ role: m.role, content: m.content })), stream: true })
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text?.().catch(() => '') || '';
    return res.status(502).json({ error: 'Coach engine unavailable', detail: errText.slice(0, 300) });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const event = JSON.parse(payload);
          if (event.type === 'content_block_delta' && event.delta?.text) {
            res.write(`data: ${JSON.stringify({ t: event.delta.text })}\n\n`);
          }
        } catch { /* ligne SSE partielle ou non pertinente, ignorée */ }
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
  } finally {
    res.end();
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const body = req.body || {};
  const mode = body.mode === 'animate' ? 'animate' : 'dcoach';
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const messages = clampHistory(body.messages);
  if (!messages.length) return res.status(400).json({ error: 'Missing messages' });

  if (body.stream === true) return handleStreamingReply(res, KEY, mode, context, messages);
  return handleJsonReply(res, KEY, mode, context, messages);
}

export { personaCore, systemPrompt, streamSystemPrompt, clampHistory, safeParseReply };
