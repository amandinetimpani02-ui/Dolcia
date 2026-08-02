import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { systemPrompt, streamSystemPrompt, clampHistory, safeParseReply } from '../server/coach-conversation.js';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../premium.css', import.meta.url), 'utf8');
const eventsApi = readFileSync(new URL('../api/events.js', import.meta.url), 'utf8');
const voiceSynthesis = readFileSync(new URL('../server/voice-synthesis.js', import.meta.url), 'utf8');

test('la conversation en direct passe par la branche existante, sans nouveau fichier API', () => {
  assert.match(eventsApi, /req\.query\.service === 'coach'/);
  assert.doesNotMatch(app, /\/api\/coach(?!versation)/); // pas de nouvel endpoint dédié créé côté client
});

test('le D-Coach et Dolcia Anime proposent une conversation continue, sans remplacer la dictée ni la narration existantes', () => {
  assert.match(app, /toggleLiveConversation\('dcoach'\)/);
  assert.match(app, /toggleLiveConversation\('animate'\)/);
  // repli conservés tels quels
  assert.match(app, /function startDCoachVoice\(\)/);
  assert.match(app, /function speakAnimateStep\(\)/);
});

test('la boucle vocale se coupe proprement à la fermeture du D-Coach et à la pause de Dolcia Anime', () => {
  assert.match(app, /function closeDCoach\(\)\{\s*stopLiveConversation\(\)/);
  assert.match(app, /function pauseDolciaAnimate\(\)\{stopDolciaTheme\(\);stopLiveConversation\(\)/);
});

test('le moteur serveur ne fabrique jamais un fait touristique : la consigne l’interdit explicitement', () => {
  const prompt = systemPrompt('dcoach', { who: 'À deux', when: 'La soirée', budget: '80 € pour le groupe' });
  assert.match(prompt, /inventes JAMAIS un lieu, un événement, un prix, un horaire/i);
  assert.match(prompt, /JSON valide/);
});

test('le contexte d’animation transmet l’étape en cours sans exposer de nouvelles données', () => {
  const prompt = systemPrompt('animate', { session: { currentStepText: 'Mission : chasse au trésor sur la plage.' } });
  assert.match(prompt, /Mission : chasse au trésor sur la plage\./);
  assert.match(prompt, /animer une session Dolcia Anime en direct/);
});

test('la fenêtre de conversation reste bornée pour rester rapide et peu coûteuse à l’oral', () => {
  const long = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `message ${i}` }));
  const clamped = clampHistory(long);
  assert.ok(clamped.length <= 12);
  assert.equal(clamped.at(-1).content, 'message 29');
});

test('un message vide ou mal formé est écarté avant l’appel au modèle', () => {
  const clamped = clampHistory([{ role: 'user', content: '   ' }, { role: 'system', content: 'ignore' }, { role: 'user', content: 'Bonjour Dolcia' }]);
  assert.equal(clamped.length, 1);
  assert.equal(clamped[0].content, 'Bonjour Dolcia');
});

test('la réponse JSON du modèle est validée et repliée proprement si elle est malformée', () => {
  const ok = safeParseReply('{"reply":"Je vous écoute.","action":"animate"}');
  assert.equal(ok.reply, 'Je vous écoute.');
  assert.equal(ok.action, 'animate');

  const badAction = safeParseReply('{"reply":"Bien reçu.","action":"n\'importe quoi"}');
  assert.equal(badAction.action, 'none');

  const notJson = safeParseReply('Je vous écoute, dites-moi tout.');
  assert.equal(notJson.reply, 'Je vous écoute, dites-moi tout.');
  assert.equal(notJson.action, 'none');
});

test('les indicateurs visuels d’écoute, réflexion et parole restent premium et accessibles au mouvement réduit', () => {
  assert.match(css, /\.d-coach-live-voice,\.animate-live-voice/);
  assert.match(css, /\.d-coach-live-voice\.listening/);
  assert.match(css, /\.d-coach-live-voice\.thinking/);
  assert.match(css, /\.d-coach-live-voice\.speaking/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.d-coach-mic,\.d-coach-status i,\.d-coach-live-voice i,\.animate-live-voice i/);
});

test('le mode streaming parle en texte brut, sans enveloppe JSON, pour pouvoir commencer avant la fin de la génération', () => {
  const prompt = streamSystemPrompt('dcoach', { who: 'À deux', when: 'La soirée', budget: '80 € pour le groupe' });
  assert.doesNotMatch(prompt, /JSON valide/);
  assert.doesNotMatch(prompt, /"action"/);
  assert.match(prompt, /inventes JAMAIS un lieu, un événement, un prix, un horaire/i);
  assert.match(prompt, /sera prononcée avant que tu aies fini d.écrire la suite/);
});

test('la boucle vocale en direct demande le flux et découpe la réponse phrase par phrase pour parler sans attendre la fin', () => {
  assert.match(app, /stream:true,messages:liveConversation\.messages/);
  assert.ok(app.includes("const sentenceEnd=/^([\\s\\S]*?[.!?…])(\\s+)/;"));
  assert.match(app, /function queueSpeech\(mode,text\)/);
  assert.match(app, /function drainSpeechQueue\(mode\)/);
});

test('le routage vers choisir/animer/ajuster/budget est décidé instantanément côté client, sans attendre le serveur', () => {
  assert.match(app, /function liveActionFromText\(text\)/);
  assert.match(app, /liveConversation\.pendingAction=liveActionFromText\(userText\)/);
});

test('Dolcia peut être interrompue en direct pendant qu’elle parle (barge-in), avec un garde-fou contre le faux déclenchement', () => {
  assert.match(app, /function startBargeInWatcher\(mode\)/);
  assert.match(app, /transcript\.length<3/);
  assert.match(app, /},420\)/);
});

test('une interruption ou une fermeture annule proprement le tour en cours grâce à un identifiant de tour', () => {
  assert.match(app, /liveConversation\.turnId\+\+/);
  assert.match(app, /const turnId=\+\+liveConversation\.turnId/);
  assert.match(app, /if\(liveConversation\.turnId!==turnId\)return/);
});

test('le coach/animateur a une vraie présence humaine, pas un ton d’assistant client générique', () => {
  const prompt = systemPrompt('dcoach', { who: 'En famille', when: 'La journée' });
  assert.match(prompt, /présence vivante/);
  assert.match(prompt, /INTERDIT.*Je comprends votre demande/s);
  assert.match(prompt, /Réagis à un détail concret/);
  assert.match(prompt, /Ne répète jamais la même formule/);
  const streamed = streamSystemPrompt('animate', { session: { currentStepText: 'Mission en cours.' } });
  assert.match(streamed, /présence vivante/);
});

test('D distingue une info factuelle manquante (jamais inventée) d’une demande trop vague (une seule question ciblée, jamais une liste)', () => {
  const prompt = systemPrompt('dcoach', { who: 'En famille' });
  assert.match(prompt, /pose UNE seule question ciblée/);
  assert.match(prompt, /jamais une liste de questions/);
  assert.match(prompt, /Deviner au hasard sur une demande floue est pire qu.une question courte/);
});

test('quand D doit poser une question, elle vise celle qui change le plus la réponse (qui/énergie/contrainte), jamais au hasard, et ne redemande jamais une info déjà connue', () => {
  const prompt = systemPrompt('dcoach', {});
  assert.match(prompt, /qui est présent et l.âge des enfants/);
  assert.match(prompt, /l.énergie recherchée là, maintenant/);
  assert.match(prompt, /Ne redemande jamais une info déjà présente dans le contexte/);
});

test('dès l’ouverture du D-Coach, il est dit explicitement que cliquer ou parler sont deux chemins équivalents', () => {
  assert.match(app, /Répondez d’un geste, écrivez ou parlez/);
  assert.match(css, /\.d-coach-hint\{/);
});

test('les répliques scriptées de Dolcia Anime varient d’une session à l’autre au lieu de se répéter mécaniquement', () => {
  assert.match(app, /function pickVoiceLine\(options\)/);
  assert.match(app, /Math\.random\(\)\*options\.length/);
  const matches = app.match(/pickVoiceLine\(\[/g) || [];
  assert.ok(matches.length >= 5, 'chaque état (lancement, great, calmer, livelier, skip, défaut) doit proposer plusieurs formulations');
});

test('la voix de D essaie une vraie voix neuronale (ElevenLabs) et retombe silencieusement sur la synthèse du navigateur sans jamais planter', () => {
  assert.match(app, /function playPremiumVoice\(text,onDone\)/);
  assert.match(app, /\/api\/events\?service=speak/);
  assert.match(app, /function speakBrowserFallback\(text,onDone\)/);
  assert.match(eventsApi, /req\.query\.service === 'speak'/);
});

test('la voix joue en flux réel (MediaSource) dès les premiers octets, sans attendre le fichier audio complet', () => {
  assert.match(app, /function playPremiumVoiceBuffered\(text,onDone\)/);
  assert.match(app, /'MediaSource'in window/);
  assert.match(app, /MediaSource\.isTypeSupported\?\.\('audio\/mpeg'\)/);
  assert.match(app, /mediaSource\.addSourceBuffer\('audio\/mpeg'\)/);
  assert.match(app, /sourceBuffer\.appendBuffer\(value\)/);
  assert.match(app, /finish\(\(\)=>\{cleanup\(\);playPremiumVoiceBuffered\(text,onDone\)\}\)/, 'le repli en cascade vers la lecture par blob doit exister si MediaSource échoue');
});

test('une phrase longue sans ponctuation finale rapide est quand même coupée sur une virgule pour ne pas faire attendre la voix', () => {
  assert.match(app, /pending\.length>70/);
  assert.match(app, /\[\\s\\S\]\{20,90\}\?,/);
});

test('sans clé ElevenLabs configurée, le serveur répond proprement (503, repli explicite) au lieu de planter', () => {
  assert.match(voiceSynthesis, /ELEVENLABS_API_KEY/);
  assert.match(voiceSynthesis, /ELEVENLABS_VOICE_ID/);
  assert.match(voiceSynthesis, /fallback: 'browser-speech'/);
  assert.match(voiceSynthesis, /res\.status\(503\)/);
});

test('les cartes Explorer sont immersives (image pleine largeur) et non plus une simple liste à vignettes', () => {
  assert.match(css, /\.result-first \.experience\{display:grid;grid-template-columns:1fr/);
  assert.match(css, /\.result-first \.exp-image\{width:100%/);
  assert.match(css, /cubic-bezier\(\.16,1,\.3,1\)/);
});

test('les propositions au niveau de qualité le plus élevé portent un ruban "Sélection Dolcia" visible directement sur la carte', () => {
  assert.match(app, /isSignature\?'<span class="signature-ribbon">✦ Sélection Dolcia<\/span>':''/);
  assert.match(css, /\.signature-ribbon\{/);
});

test('un filtre premium "Sélection Dolcia" existe pour voir uniquement les propositions extrêmement fiables, sans avoir à parler', () => {
  assert.match(app, /id:'signature',label:'Sélection Dolcia'/);
  assert.match(app, /\(item\.rating\|\|0\)>=4\.6&&\(item\.reviews\|\|0\)>=50/);
  assert.match(css, /\.lens-signature/);
});
