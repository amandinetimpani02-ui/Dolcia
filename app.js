const app = document.querySelector('#app');
const APP_BUILD = '20.14.0-signature-atelier';
// Clé PUBLIQUE VAPID : par construction non secrète (comme une clé publishable Stripe), doit
// correspondre exactement à VAPID_PUBLIC_KEY côté serveur (Vercel). La clé privée, elle, ne
// vit jamais ici.
const VAPID_PUBLIC_KEY='BDV_C0Bk-svwZf6nDMrcnGEIFhaPR76rxiIbjo55u5atHGxzP5HLsdu_OLe2KiaEBi0B6TT3U3xl5Hs2qHWZlOo';

const IMAGES = {
  hero:'/assets/hero-le-touquet.png',
  couple:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=85',
  family:'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1000&q=85',
  friends:'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=85',
  solo:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=85',
  slow:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
  culture:'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1000&q=85',
  food:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85',
  outside:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
  night:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85',
  active:'https://images.unsplash.com/photo-1530137073520-4ea6e2f10a48?auto=format&fit=crop&w=1000&q=85',
  fallback:'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1000&q=85'
};

const FLOW = [
  {key:'duration', eyebrow:'Le moment de la journée', title:'Quand et combien de temps êtes-vous disponible ?', sub:'Dolcia cherchera uniquement des expériences compatibles avec ce créneau.', options:[
    ['2h','Environ 2 heures','Un moment court, à l’heure de votre choix',IMAGES.food],['morning','La matinée','Du petit-déjeuner jusqu’à midi',IMAGES.outside],['afternoon','L’après-midi','De midi jusqu’en fin de journée',IMAGES.slow],['afternoon_evening','L’après-midi + la soirée','Une seule composition, de l’après-midi jusqu’à la nuit',IMAGES.night],['evening','La soirée','À partir de 18 heures',IMAGES.night],['day','La journée complète','Du matin au soir',IMAGES.family],['stay','Plusieurs jours','Hébergement et programme jour par jour',IMAGES.culture]
  ]},
  {key:'who', eyebrow:'Le contexte', title:'Avec qui partagez-vous ce moment ?', sub:'Dolcia adapte ensuite les lieux et le rythme aux personnes présentes.', options:[
    ['couple','En amoureux','Une parenthèse complice',IMAGES.couple],['family','En famille','Pensé pour petits et grands',IMAGES.family],['friends','Entre amis','Des souvenirs à plusieurs',IMAGES.friends],['colleagues','Entre collègues','Sortir du cadre ensemble',IMAGES.friends],['solo','Pour moi','Suivre ses propres envies',IMAGES.solo]
  ]},
  {key:'vibes', eyebrow:'Votre humeur ou votre envie', title:'Qu’est-ce qui vous ferait vraiment du bien maintenant ?', sub:'Choisissez tout ce qui vous ressemble à cet instant. Dolcia fera la différence entre vous détendre, bien manger, bouger, découvrir ou vibrer.', multi:true, options:[
    ['play','Rire & se défouler','Jeux, parcs, bowling, karting, laser game, escape game',IMAGES.active],
    ['breathe','Prendre l’air','Plage, balade, animaux, vélo, nautisme et aventure',IMAGES.outside],
    ['create','Voir, apprendre & créer','Ateliers, spectacles, cinéma, musées et visites guidées',IMAGES.culture],
    ['taste','Bien manger','Une vraie table, un brunch, un goûter ou une dégustation',IMAGES.food],
    ['recharge','Me faire du bien','Spa, massage, thalasso, yoga et parenthèse calme',IMAGES.slow],
    ['vibrate','Vibrer ensemble','Concert, fête, spectacle, casino ou ambiance nocturne',IMAGES.night]
  ]},
  {key:'budget', eyebrow:'Le budget', title:'Votre enveloppe pour ce moment', sub:'Le montant s’adapte automatiquement à la durée choisie.', options:[]}
];

const DESTINATIONS = {
  touquet:{name:'Le Touquet-Paris-Plage',lat:50.5214,lng:1.5912,radius:12000},
  opale:{name:'Côte d’Opale',lat:50.7275,lng:1.6063,radius:52000},
  lille:{name:'Lille',lat:50.6292,lng:3.0573,radius:22000},
  paris:{name:'Paris',lat:48.8566,lng:2.3522,radius:25000},
  lyon:{name:'Lyon',lat:45.764,lng:4.8357,radius:24000},
  bordeaux:{name:'Bordeaux',lat:44.8378,lng:-0.5792,radius:26000},
  marseille:{name:'Marseille',lat:43.2965,lng:5.3698,radius:30000}
};

const state = {
  view:'home', step:0, dateMode:'today', month:new Date(), dateStart:new Date(), dateEnd:new Date(),
  location:{name:'Le Touquet-Paris-Plage',lat:50.5214,lng:1.5912}, answers:{vibes:[]}, items:[], allItems:[], program:[], alternatives:[], majorMoments:[], majorChoice:null, broadcastVenues:[], weather:null, radius:12000,
  agenda:JSON.parse(localStorage.getItem('dolcia_agenda_v2')||'[]'),
  favorites:JSON.parse(localStorage.getItem('dolcia_favorites_v2')||'[]'),
  feedback:JSON.parse(localStorage.getItem('dolcia_feedback_v2')||'{}'),
  feedbackContext:JSON.parse(localStorage.getItem('dolcia_feedback_context_v1')||'{}'),
  experienceFeelings:JSON.parse(localStorage.getItem('dolcia_experience_feelings_v1')||'{}'),
  experienceTags:JSON.parse(localStorage.getItem('dolcia_experience_tags_v1')||'{}'),
  experienceMemories:JSON.parse(localStorage.getItem('dolcia_experience_memories_v1')||'{}'),
  tasteProfile:JSON.parse(localStorage.getItem('dolcia_taste_profile_v2')||'{}')
};
state.budgetPlan=JSON.parse(localStorage.getItem('dolcia_budget_plan_v1')||'{"amount":null,"margin":0,"includesStay":true,"includesMeals":true,"includesTransport":false}');
state.groupParticipants=JSON.parse(localStorage.getItem('dolcia_group_participants_v1')||'[{"id":"me","name":"Moi","role":"organizer","kind":"account"}]');
state.circleProfiles=JSON.parse(localStorage.getItem('dolcia_circle_profiles_v1')||'[]');
state.ownerSensitivity=JSON.parse(localStorage.getItem('dolcia_owner_sensitivity_v1')||'{}');
if(!state.circleProfiles.some(person=>person.id==='me'))state.circleProfiles.unshift({id:'me',name:'Moi',kind:'account',relationship:'Mon profil',...state.ownerSensitivity});
state.groupParticipants=state.groupParticipants.map(person=>({...person,selected:person.selected!==false}));
state.agendaProposals=JSON.parse(localStorage.getItem('dolcia_agenda_proposals_v1')||'[]');
state.flashOffers=[];
state.flashAlertsEnabled=Boolean(localStorage.getItem('dolcia_flash_alerts_endpoint'));
state.reservations=JSON.parse(localStorage.getItem('dolcia_reservations_v1')||'[]');
state.passWallet=JSON.parse(localStorage.getItem('dolcia_pass_wallet_v1')||'{"status":"inactive","title":"","holder":"","rights":[],"privileges":[],"updatedAt":null}');
state.animateHistory=JSON.parse(localStorage.getItem('dolcia_animate_history_v1')||'[]');
state.companionMemory=JSON.parse(localStorage.getItem('dolcia_companion_memory_v1')||'{"interactions":0,"lastChoice":"","rituals":[],"tone":"warm"}');
state.programPreferences=JSON.parse(localStorage.getItem('dolcia_program_preferences_v1')||'{"energy":"ask","dining":"ask","fatigue":"unknown"}');
state.liveMoment={checkedAt:null,weatherKey:null,offerIds:[],changes:[],watcher:null};
state.dDialogue={asked:[],dirty:false,mood:'concierge',messages:[],suggestedAction:'none'};
state.dVisualMood='idle';
let animateNudgeTimer=null;

const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => d.toLocaleDateString('fr-FR',{day:'numeric',month:'long'});
const iso = d => {const date=new Date(d);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();
const save = () => {localStorage.setItem('dolcia_agenda_v2',JSON.stringify(state.agenda));localStorage.setItem('dolcia_favorites_v2',JSON.stringify(state.favorites));localStorage.setItem('dolcia_feedback_v2',JSON.stringify(state.feedback));localStorage.setItem('dolcia_feedback_context_v1',JSON.stringify(state.feedbackContext));localStorage.setItem('dolcia_experience_feelings_v1',JSON.stringify(state.experienceFeelings));localStorage.setItem('dolcia_experience_tags_v1',JSON.stringify(state.experienceTags));localStorage.setItem('dolcia_experience_memories_v1',JSON.stringify(state.experienceMemories));localStorage.setItem('dolcia_taste_profile_v2',JSON.stringify(state.tasteProfile));localStorage.setItem('dolcia_group_participants_v1',JSON.stringify(state.groupParticipants));localStorage.setItem('dolcia_circle_profiles_v1',JSON.stringify(state.circleProfiles));localStorage.setItem('dolcia_owner_sensitivity_v1',JSON.stringify(state.ownerSensitivity));localStorage.setItem('dolcia_agenda_proposals_v1',JSON.stringify(state.agendaProposals));localStorage.setItem('dolcia_budget_plan_v1',JSON.stringify(state.budgetPlan));localStorage.setItem('dolcia_reservations_v1',JSON.stringify(state.reservations));localStorage.setItem('dolcia_pass_wallet_v1',JSON.stringify(state.passWallet));localStorage.setItem('dolcia_animate_history_v1',JSON.stringify(state.animateHistory));localStorage.setItem('dolcia_companion_memory_v1',JSON.stringify(state.companionMemory));localStorage.setItem('dolcia_program_preferences_v1',JSON.stringify(state.programPreferences))};

function dMascotMark(className=''){
  return `<span class="eclat-d d-companion ${className} is-${state.dVisualMood||'idle'}" role="img" aria-label="D, votre compagnon Dolcia"><b>D</b><i class="d-star">✦</i><span class="d-face" aria-hidden="true"><i></i><i></i><em></em></span></span>`;
}
function setDVisualState(mood='idle',duration=0){
  const allowed=['idle','listening','thinking','speaking','delighted','calm','encouraging'];
  state.dVisualMood=allowed.includes(mood)?mood:'idle';
  document.querySelectorAll('.eclat-d.d-companion').forEach(node=>{
    [...node.classList].filter(name=>name.startsWith('is-')).forEach(name=>node.classList.remove(name));
    node.classList.add(`is-${state.dVisualMood}`);
  });
  if(duration)window.setTimeout(()=>{if(state.dVisualMood===mood)setDVisualState('idle')},duration);
}
function dRelationshipLine(){
  const people=currentGroupProfiles().map(person=>person.name).filter(name=>name&&name!=='Moi');
  if(people.length)return `Je garde aussi ${esc(people.slice(0,3).join(', '))} en tête.`;
  if(state.companionMemory.interactions>2)return 'Je reconnais déjà votre façon de choisir.';
  return 'Je vous accompagne sans décider à votre place.';
}

function shell(content, active='discover'){
  return `<main class="app"><header class="topbar"><button class="brand" onclick="home()">dolc<i>ia</i></button><div class="top-actions"><button class="location" onclick="useLocation()">${esc(state.location.name)}</button><button class="avatar" onclick="openAccount()">VD</button></div></header>${content}${nav(active)}</main>`;
}
function nav(active){return `<nav class="bottom-nav essential-nav" aria-label="Navigation principale"><button class="nav-item ${active==='discover'?'active':''}" onclick="home()"><span>⌁</span>Explorer</button><button class="nav-item signature ${active==='compose'||active==='agenda'||active==='pass'?'active':''}" onclick="openMyMoment()"><b>D<i>✦</i></b><span>Mon moment${state.agenda.length?` · ${state.agenda.length}`:''}</span></button><button class="nav-item ${active==='services'?'active':''}" onclick="openMeHub()"><span>◯</span>Moi</button></nav>`}
function openMyMoment(){openDCoach()}
function openMeHub(){document.querySelector('#meHub')?.remove();const hasPass=state.passWallet.status==='active'||state.reservations.some(r=>r.status!=='cancelled'),amount=state.budgetPlan.amount;document.body.insertAdjacentHTML('beforeend',`<div class="modal me-hub" id="meHub"><article><button class="close" onclick="document.querySelector('#meHub')?.remove()">×</button><span class="kicker">Tout ce qui vous appartient</span><h2>Moi.</h2><p>Trois accès seulement. Dolcia conserve toute la richesse derrière eux.</p><div class="me-hub-grid"><button onclick="document.querySelector('#meHub')?.remove();openAccount()"><span>01</span><b>Mon profil & mon cercle</b><small>Mes proches, nos goûts et notre constellation</small></button><button onclick="document.querySelector('#meHub')?.remove();openBudgetEditor()"><span>02</span><b>Budget & tout compris</b><small>${amount==null?'Définir une enveloppe pour le groupe':`${amount.toLocaleString('fr-FR')} € prévus pour ce moment`}</small></button>${hasPass?`<button onclick="document.querySelector('#meHub')?.remove();renderPass()"><span>03</span><b>Mon Pass Dolcia</b><small>Prestations réservées et déjà comprises</small></button>`:`<button onclick="document.querySelector('#meHub')?.remove();renderAgenda()"><span>03</span><b>Mes moments</b><small>Programme, réservations et propositions du groupe</small></button>`}</div><aside class="inclusive-whisper"><b>Dolcia Tout Compris</b><span>Dans les destinations partenaires, repas, activités et avantages rejoindront automatiquement le Pass — jamais avant d’être réellement disponibles.</span></aside></article></div>`)}
function openComposition(){if(state.program.length)return renderSurprise();startCompose()}

function dCoachContext(){
  const people=currentGroupSize(),budget=state.budgetPlan.amount;
  const when=state.answers.duration?({
    '2h':'Environ 2 heures',morning:'La matinée',afternoon:'L’après-midi',
    afternoon_evening:'Après-midi + soirée',evening:'La soirée',
    day:'La journée',stay:'Le séjour'
  }[state.answers.duration]||'Votre moment'):'Moment à préciser';
  const who=state.answers.who?({solo:'Pour moi',couple:'À deux',family:'En famille',friends:'Entre amis',colleagues:'Entre collègues'}[state.answers.who]||`${people} personnes`):`${people} personne${people>1?'s':''}`;
  return {
    when,
    who,
    budget:budget==null?'Budget encore libre':`${budget.toLocaleString('fr-FR')} € pour le groupe`,
    hasProgram:Boolean(state.program.length||state.agenda.length),
    sentence:state.answers.momentSentence||'',
    people:currentGroupProfiles().map(person=>person.name).filter(Boolean).slice(0,6),
    childrenAges:state.answers.childrenAges||[],
    energy:state.programPreferences.energy||'ask',
    relationshipMemory:{
      interactions:Number(state.companionMemory.interactions)||0,
      lastChoice:state.companionMemory.lastChoice||'',
      rituals:(state.companionMemory.rituals||[]).slice(-3),
      tone:state.companionMemory.tone||'warm'
    },
    availableIdeas:dCoachLiveCount(),
    programSize:state.program.length,
    agendaSize:state.agenda.length
  };
}
function dCoachConversationMarkup(){
  const messages=(state.dDialogue.messages||[]).slice(-6);
  if(!messages.length)return`<div class="d-coach-thread empty"><span>D est prêt à discuter, pas seulement à cocher des cases.</span></div>`;
  return`<div class="d-coach-thread" aria-live="polite">${messages.map(message=>`<div class="${message.role==='user'?'from-user':'from-d'}">${message.role==='assistant'?dMascotMark('tiny'):''}<p>${esc(message.content)}</p></div>`).join('')}</div>`;
}
function dCoachRemember(userText,reply=''){
  state.companionMemory.interactions=(Number(state.companionMemory.interactions)||0)+1;
  state.companionMemory.lastChoice=userText.slice(0,120);
  const ritual=[...new Set([...(state.companionMemory.rituals||[]),...((reply.match(/«([^»]{3,60})»/g)||[]).slice(-1))])].slice(-5);
  state.companionMemory.rituals=ritual;
  save();
}
function dCoachNextQuestion(){
  // Une question à la fois. Jamais deux fois la même.
  const asked=new Set(state.dDialogue.asked||[]);
  if(!state.answers.duration&&!asked.has('duration'))return{
    id:'duration',mood:'tempo',eyebrow:'Le temps disponible',
    voice:'Je commence par la seule information qui change vraiment tout.',
    title:'Combien de temps avons-nous pour rendre ce moment mémorable ?',
    choices:[['2h','Deux heures','Une respiration bien composée'],['afternoon_evening','Après-midi + soirée','Un vrai récit jusqu’à la nuit'],['day','Toute la journée','Plusieurs émotions, sans répétition'],['stay','Plusieurs jours','Un séjour vivant, jour après jour']]
  };
  if(!state.answers.who&&!asked.has('who'))return{
    id:'who',mood:'group',eyebrow:'Les personnes qui comptent',
    voice:'Le même lieu ne raconte pas la même histoire selon les personnes présentes.',
    title:'Pour qui est-ce que je compose ce moment ?',
    choices:[['solo','Pour moi','Je suis votre rythme'],['couple','À deux','Créer une vraie complicité'],['family','En famille','Chaque âge compte'],['friends','Entre amis','Du lien et de vrais souvenirs']]
  };
  if(!(state.answers.vibes||[]).length&&!state.answers.momentSentence&&!asked.has('impulse'))return{
    id:'impulse',mood:'inspire',eyebrow:'Votre élan maintenant',
    voice:'Je ne vous enferme pas dans une catégorie. Donnez-moi seulement la couleur dominante.',
    title:'De quoi avez-vous vraiment besoin maintenant ?',
    choices:[['play','Rire et nous défouler','Du jeu, du mouvement, de la surprise'],['breathe','Prendre l’air','De l’espace et une respiration'],['recharge','Décrocher complètement','Du calme, du soin, aucune course'],['vibrate','Vibrer ensemble','Un moment fort à partager']]
  };
  return{
    id:'ready',mood:'ready',eyebrow:'Dolcia a compris l’essentiel',
    voice:state.answers.momentSentence?`J’ai retenu : ${state.answers.momentSentence}`:'Je peux maintenant agir sans vous faire passer un interrogatoire.',
    title:state.program.length?'Je garde le fil. Que voulez-vous faire évoluer ?':'Je vous propose les idées justes, ou je compose tout pour vous.',
    choices:[['choose','Laisser D décider','Le meilleur accord, expliqué et modifiable'],['animate','D anime ce moment','Jeux, défis ou séance guidée'],['adjust','Affiner une nuance','Rythme, distance, surprise ou météo'],['budget','Protéger le budget','Équilibrer sans appauvrir l’expérience']]
  };
}
function dCoachChoiceValue(questionId,value){
  if(questionId==='duration')state.answers.duration=value;
  if(questionId==='who')state.answers.who=value;
  if(questionId==='impulse')state.answers.vibes=[value];
}
function dCoachLiveCount(){
  return (state.allItems||[]).filter(item=>typeof geoVisible!=='function'||geoVisible(item)).length;
}
function dCoachRerank(){
  if(!state.allItems.length)return;
  state.allItems=scoreItems(state.allItems);
  state.dDialogue.dirty=true;
  document.body.classList.add('d-results-reordering');
  setTimeout(()=>document.body.classList.remove('d-results-reordering'),520);
}
function answerDCoach(questionId,value){
  if(questionId==='ready')return dCoachChoose(value);
  dCoachChoiceValue(questionId,value);
  state.dDialogue.asked=[...new Set([...(state.dDialogue.asked||[]),questionId])];
  dCoachRerank();save();
  document.querySelector('#dCoach article')?.classList.add('answering');
  setTimeout(()=>openDCoach(),220);
}
function openDCoach(){
  stopLiveConversation();
  document.querySelector('#dCoach')?.remove();
  const context=dCoachContext();
  const question=dCoachNextQuestion(),count=dCoachLiveCount();
  state.dDialogue.mood=question.mood;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal d-coach mood-${question.mood}" id="dCoach" data-question="${question.id}">
    <div class="d-coach-scene" aria-hidden="true"></div>
    <article>
      <button class="close" onclick="closeDCoach()" aria-label="Fermer">×</button>
      <header>${dMascotMark('large')}<div><small>Dolcia · une seule présence, plusieurs talents</small><strong>Je vous écoute et je garde le fil.</strong></div></header>
      <div class="d-coach-known"><span>${esc(context.when)}</span><span>${esc(context.who)}</span><span>${esc(context.budget)}</span></div>
      <section class="d-coach-dialogue">
        <span class="d-coach-eyebrow">${esc(question.eyebrow)}</span>
        <p class="d-coach-voice">« ${esc(question.voice)} ${dRelationshipLine()} »</p>
        <h2>${esc(question.title)}</h2>
        <p class="d-coach-hint">Répondez d’un geste, écrivez ou parlez : D comprend les trois de la même façon.</p>
        <div class="d-coach-actions ${question.id==='ready'?'ready-actions':''}">
          ${question.choices.map(([id,label,detail],index)=>`<button onclick="answerDCoach('${question.id}','${id}')"><b>0${index+1}</b><span><strong>${esc(label)}</strong><small>${esc(detail)}</small></span><i>→</i></button>`).join('')}
        </div>
        ${dCoachConversationMarkup()}
        <div class="d-coach-free">
          <input id="dCoachInput" value="" placeholder="Ou dites-le naturellement à D…">
          <button class="d-coach-send" onclick="askDCoach()">Envoyer</button>
          <button class="d-coach-mic" onclick="startDCoachVoice()" aria-label="Parler à Dolcia"><span></span></button>
        </div>
        <button class="d-coach-live-voice" onclick="toggleLiveConversation('dcoach')" aria-pressed="false"><i></i><span>Parler en direct avec Dolcia</span></button>
        <div class="d-coach-live-impact" aria-live="polite"><i></i><span>${count?`${count} possibilités réévaluées en direct`:'D prépare votre terrain de jeu'}</span><b>Votre catalogue reste entièrement accessible</b></div>
        <div class="d-coach-status" id="dCoachStatus" aria-live="polite"><i></i><span>D écoute, rebondit et vous laisse toujours le dernier mot.</span></div>
      </section>
    </article>
  </div>`);
  requestAnimationFrame(()=>document.querySelector('#dCoach article')?.classList.add('question-visible'));
}
function closeDCoach(){
  stopLiveConversation();document.querySelector('#dCoach')?.remove();
  if(state.dDialogue.dirty&&state.view==='results'){state.dDialogue.dirty=false;renderResults()}
}
function dCoachChoose(mode){
  if(mode==='animate'){closeDCoach();return openDolciaAnimate()}
  if(mode==='budget'){closeDCoach();return openBudgetEditor()}
  if(mode==='adjust')return renderDCoachAdjustments();
  closeDCoach();
  if(state.program.length)return renderSurprise();
  if(!state.answers.budget)state.answers.budget='flexible';
  save();
  if(state.allItems.length)return surprise(true);
  compose();
}
function renderDCoachAdjustments(){
  const target=document.querySelector('.d-coach-dialogue');if(!target)return;
  target.innerHTML=`<button class="d-coach-back" onclick="openDCoach()">← Revenir</button><p class="d-coach-voice">« Je change la couleur du moment, pas tout ce que vous m’avez déjà confié. »</p><h2>Quel réglage ferait vraiment la différence ?</h2><div class="d-coach-tuning">
    <button onclick="applyDCoachAdjustment('soft')"><span>Respirer davantage</span><small>Un rythme plus doux, sans rendre le moment vide</small></button>
    <button onclick="applyDCoachAdjustment('alive')"><span>Plus de vie</span><small>Un temps fort supplémentaire, sans tout transformer en sport</small></button>
    <button onclick="applyDCoachAdjustment('near')"><span>Rester tout près</span><small>La destination d’abord ; une escapade seulement si elle le mérite</small></button>
    <button onclick="applyDCoachAdjustment('budget')"><span>Dépenser plus justement</span><small>Alterner signatures, plaisirs simples et gratuit vérifié</small></button>
    <button onclick="applyDCoachAdjustment('weather')"><span>Activer le plan B</span><small>Réorganiser selon la météo et les horaires fiables</small></button>
    <button onclick="applyDCoachAdjustment('surprise')"><span>Un inattendu maîtrisé</span><small>Quelque chose que vous n’auriez pas pensé à chercher</small></button>
  </div>`;
}
function dCoachAdjustmentSentence(kind){
  return {
    soft:'Je veux un rythme plus doux et respirable, avec une vraie variété.',
    alive:'Je veux plus de vie et un temps fort, sans enchaîner uniquement des activités intenses.',
    near:`Je veux rester dans ${state.location.name}. Ne sortir de la destination que pour une pépite exceptionnelle, rare et réellement pertinente.`,
    budget:'Je veux mieux équilibrer mon budget : alternez plaisir signature, expériences simples et gratuit confirmé.',
    weather:'Réorganisez selon la météo et gardez uniquement des horaires réellement compatibles.',
    surprise:'Ajoutez un inattendu maîtrisé, cohérent avec le groupe, le moment et toutes nos contraintes.'
  }[kind]||'Rééquilibrez ce moment sans perdre ce qui nous ressemble.';
}
async function applyDCoachAdjustment(kind){
  const sentence=dCoachAdjustmentSentence(kind);
  state.answers.momentSentence=[state.answers.momentSentence,sentence].filter(Boolean).join(' ');
  if(kind==='near')state.radius=Math.min(state.radius,12000);
  save();setDCoachStatus('Je rééquilibre le rythme, les distances et le budget…',true);
  await new Promise(resolve=>setTimeout(resolve,420));
  closeDCoach();
  if(state.allItems.length)return refreshRecommendations();
  compose();
}
function setDCoachStatus(message,active=false){
  const status=document.querySelector('#dCoachStatus');if(!status)return;
  status.classList.toggle('active',active);status.querySelector('span').textContent=message;
}
function absorbDCoachSentence(value){
  const text=plainText(value),vibes=new Set(state.answers.vibes||[]);
  if(/famille|enfant|fille|fils|ado|bebe/.test(text))state.answers.who='family';
  else if(/couple|a deux|amoureux|mari|femme/.test(text))state.answers.who='couple';
  else if(/ami|copain|copine/.test(text))state.answers.who='friends';
  else if(/seul|seule|pour moi/.test(text))state.answers.who='solo';
  if(/2 ?h|deux heures|une heure/.test(text))state.answers.duration='2h';
  else if(/apres.midi.*soir|soir.*apres.midi/.test(text))state.answers.duration='afternoon_evening';
  else if(/journee|toute la journee/.test(text))state.answers.duration='day';
  else if(/week.end|sejour|plusieurs jours|semaine/.test(text))state.answers.duration='stay';
  if(/rire|jeu|defoul|bouger|sport/.test(text))vibes.add('play');
  if(/air|mer|plage|nature|balade/.test(text))vibes.add('breathe');
  if(/calme|repos|spa|massage|detendre|souffler/.test(text))vibes.add('recharge');
  if(/concert|fete|danser|vibrer|soiree/.test(text))vibes.add('vibrate');
  if(/manger|restaurant|gourmand|brunch|deguster/.test(text))vibes.add('taste');
  if(/culture|musee|expo|atelier|creer|decouvrir/.test(text))vibes.add('create');
  state.answers.vibes=[...vibes];
}
async function askDCoach(){
  const input=document.querySelector('#dCoachInput'),value=input?.value.trim();if(!value)return showToast('Dites-moi ce que vous voulez que Dolcia prenne en charge');
  state.answers.momentSentence=value;absorbDCoachSentence(value);dCoachRerank();save();
  const text=plainText(value);
  state.dDialogue.messages=[...(state.dDialogue.messages||[]),{role:'user',content:value}].slice(-12);
  input.value='';setDCoachStatus('D réfléchit à ce qui ferait vraiment la différence…',true);
  document.querySelector('.d-coach-thread')?.replaceWith(htmlNode(dCoachConversationMarkup()));
  try{
    const response=await fetch('/api/events?service=coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'dcoach',messages:state.dDialogue.messages,context:buildLiveContext('dcoach')})});
    if(!response.ok)throw new Error('coach unavailable');
    const answer=await response.json(),reply=String(answer.reply||'').trim();
    if(!reply)throw new Error('empty coach reply');
    state.dDialogue.messages=[...state.dDialogue.messages,{role:'assistant',content:reply}].slice(-12);
    state.dDialogue.suggestedAction=answer.action||liveActionFromText(text);
    dCoachRemember(value,reply);
    document.querySelector('.d-coach-thread')?.replaceWith(htmlNode(dCoachConversationMarkup()));
    setDCoachStatus(state.dDialogue.suggestedAction&&state.dDialogue.suggestedAction!=='none'?'D a une proposition prête. Vous décidez si elle l’applique.':'Je vous écoute. On peut continuer naturellement.',false);
    const action=state.dDialogue.suggestedAction;
    if(action&&action!=='none')mountDCoachSuggestion(action);
  }catch(_){
    const fallback=/anime.moi|animation|occuper.*sans sortir|defi guide|coach|séance guidée|seance guidee/.test(text)?'animate':/budget|moins cher|économ|econom|gratuit|dépens|depens/.test(text)?'budget':/plus doux|plus vivant|plus proche|rééquilibr|reequilibr|plan b|météo|meteo/.test(text)?'adjust':'none';
    const reply=fallback==='animate'?'Ça sent le moment qui a besoin d’un vrai animateur. Je peux lancer une session guidée, et vous gardez la main sur le rythme.':fallback==='budget'?'On peut faire mieux sans faire moins bien. Je vous montre où dépenser fort et où garder de la légèreté ?':fallback==='adjust'?'Je garde ce qui vous plaît et je change seulement la nuance. Rien ne part à la poubelle.':'D’accord. Je garde cette nuance en tête et je réordonne les idées sans vous enfermer.';
    state.dDialogue.messages=[...state.dDialogue.messages,{role:'assistant',content:reply}].slice(-12);
    state.dDialogue.suggestedAction=fallback;dCoachRemember(value,reply);
    document.querySelector('.d-coach-thread')?.replaceWith(htmlNode(dCoachConversationMarkup()));
    setDCoachStatus('D reste avec vous. La conversation peut continuer.',false);
    if(fallback!=='none')mountDCoachSuggestion(fallback);
  }
}
function htmlNode(markup){const template=document.createElement('template');template.innerHTML=markup.trim();return template.content.firstElementChild}
function mountDCoachSuggestion(action){
  document.querySelector('.d-coach-suggestion')?.remove();
  const labels={choose:['Composer maintenant','D prépare un programme modifiable'],animate:['Lancer D animateur','Jeux, défis ou séance guidée'],adjust:['Ajuster avec D','Rythme, distance ou intensité'],budget:['Ouvrir le budget vivant','Équilibrer sans niveler']};
  const [label,detail]=labels[action]||labels.choose;
  document.querySelector('.d-coach-thread')?.insertAdjacentHTML('afterend',`<div class="d-coach-suggestion"><div><strong>${esc(label)}</strong><span>${esc(detail)}</span></div><button onclick="dCoachChoose('${action}')">Oui, allons-y</button><button class="ghost" onclick="this.parentElement.remove()">Pas encore</button></div>`);
}
function startDCoachVoice(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition)return showToast('La voix n’est pas disponible sur ce navigateur. Vous pouvez écrire exactement la même chose.');
  const recognition=new Recognition(),button=document.querySelector('.d-coach-mic');
  recognition.lang='fr-FR';recognition.interimResults=true;
  recognition.onstart=()=>{button?.classList.add('listening');setDCoachStatus('Je vous écoute. Parlez naturellement…',true)};
  recognition.onresult=event=>{const transcript=Array.from(event.results).map(result=>result[0].transcript).join('');const input=document.querySelector('#dCoachInput');if(input)input.value=transcript};
  recognition.onerror=()=>setDCoachStatus('Je n’ai pas bien entendu. Réessayez ou écrivez-moi.',false);
  recognition.onend=()=>{button?.classList.remove('listening');const value=document.querySelector('#dCoachInput')?.value.trim();if(value)askDCoach();else setDCoachStatus('Prête à vous écouter.',false)};
  recognition.start();
}

// Conversation voix-à-voix réelle, façon Speak : Dolcia commence à parler dès la première phrase
// générée par le flux serveur, sans attendre la réponse complète — et peut être interrompue en
// direct si la personne se remet à parler pendant qu'elle parle (barge-in). Le routage d'action
// (choisir/animer/ajuster/budget) est évalué instantanément côté client sur ce que la personne
// vient de dire, sans attendre le réseau. Séparé de startDCoachVoice/speakAnimateStep pour ne
// jamais toucher la dictée simple ni la narration scriptée déjà testées.
const liveConversation={active:false,mode:null,messages:[],recognition:null,watcher:null,reader:null,audio:null,speaking:false,speechQueue:[],pendingAction:null,turnId:0,realtimePeer:null,realtimeStream:null,realtimeChannel:null,realtimeAudio:null,realtimeTranscript:''};
function liveConversationSupported(){return Boolean((window.SpeechRecognition||window.webkitSpeechRecognition)&&'speechSynthesis'in window)}
function realtimeConversationSupported(){return Boolean(window.RTCPeerConnection&&navigator.mediaDevices?.getUserMedia)}
function liveButton(mode){return mode==='animate'?document.querySelector('.animate-live-voice'):document.querySelector('.d-coach-live-voice')}
function buildLiveContext(mode){
  if(mode==='animate'){
    const session=state.activeAnimate;
    return{session:session?{currentStepText:`${animateCoachLine(session)} ${animateStepText(session)}`}:null};
  }
  const context=dCoachContext();
  return{
    who:context.who,when:context.when,budget:context.budget,sentence:context.sentence,
    people:context.people,childrenAges:context.childrenAges,energy:context.energy,
    relationshipMemory:context.relationshipMemory,availableIdeas:context.availableIdeas,
    programSize:context.programSize,agendaSize:context.agendaSize
  };
}
function setLiveStatus(mode,text){
  if(mode==='animate'){const line=document.querySelector('#animateLive .animate-coach-line');if(line)line.textContent=`« ${text} »`;return}
  setDCoachStatus(text,true);
}
// Même détection d'intention que askDCoach, mais évaluée sans attendre le réseau : dès que la
// personne a parlé, on sait déjà où naviguer une fois que Dolcia aura fini sa phrase.
function liveActionFromText(text){
  const t=plainText(text||'');
  if(/anime|jeu|occuper|defi|coach|séance|seance/.test(t))return'animate';
  if(/budget|moins cher|économ|econom|gratuit|dépens|depens/.test(t))return'budget';
  if(/plus doux|plus vivant|plus proche|rééquilibr|reequilibr|plan b|météo|meteo/.test(t))return'adjust';
  return'none';
}
function stopLiveConversation(){
  const mode=liveConversation.mode;
  liveConversation.active=false;liveConversation.speaking=false;liveConversation.speechQueue=[];liveConversation.pendingAction=null;
  liveConversation.turnId++;
  try{liveConversation.recognition?.abort?.()}catch{}
  try{liveConversation.watcher?.abort?.()}catch{}
  try{liveConversation.reader?.cancel?.()}catch{}
  try{liveConversation.audio?.pause?.()}catch{}
  try{liveConversation.realtimeChannel?.close?.()}catch{}
  try{liveConversation.realtimePeer?.close?.()}catch{}
  try{liveConversation.realtimeStream?.getTracks?.().forEach(track=>track.stop())}catch{}
  try{liveConversation.realtimeAudio?.pause?.()}catch{}
  liveConversation.recognition=null;liveConversation.watcher=null;liveConversation.reader=null;liveConversation.audio=null;
  liveConversation.realtimePeer=null;liveConversation.realtimeStream=null;liveConversation.realtimeChannel=null;liveConversation.realtimeAudio=null;liveConversation.realtimeTranscript='';
  liveConversation.messages=[];liveConversation.mode=null;
  if('speechSynthesis'in window)window.speechSynthesis.cancel();
  liveButton(mode)?.classList.remove('listening','thinking','speaking');
  liveButton(mode)?.setAttribute('aria-pressed','false');
}
function stopBargeInWatcher(){try{liveConversation.watcher?.abort?.()}catch{}liveConversation.watcher=null}
function queueSpeech(mode,text){if(text&&text.trim()){liveConversation.speechQueue.push(text.trim());drainSpeechQueue(mode)}}
// Voix neuronale ElevenLabs si configurée côté serveur, repli silencieux et automatique sur la
// synthèse du navigateur sinon — jamais de blocage, jamais d'erreur visible pour la personne.
function voiceMoodFromText(text=''){
  const value=plainText(text);
  if(/bravo|rire|genial|magnifique|lance|parti|vivant|peps/.test(value))return'joyful';
  if(/souffl|calme|doucement|tranquille|repos|ralenti/.test(value))return'calm';
  if(/vous pouvez|je reste|ensemble|continue|capitaine|confiance/.test(value))return'encouraging';
  return'warm'
}
function browserVoiceProfile(mood){
  return mood==='joyful'?{rate:1.04,pitch:1.08}:mood==='calm'?{rate:.9,pitch:.98}:mood==='encouraging'?{rate:.97,pitch:1.04}:{rate:.98,pitch:1.02}
}
function speakBrowserFallback(text,onDone){
  const mood=voiceMoodFromText(text);
  if(!('speechSynthesis'in window))return onDone();
  window.speechSynthesis.cancel();
  const voice=new SpeechSynthesisUtterance(text);
  const profile=browserVoiceProfile(mood);
  voice.lang='fr-FR';voice.rate=profile.rate;voice.pitch=profile.pitch;
  voice.onend=onDone;voice.onerror=onDone;
  window.speechSynthesis.speak(voice);
}
// Repli si MediaSource est absent ou ne supporte pas audio/mpeg (certaines versions de Safari) :
// attend le fichier entier avant de jouer. Fonctionne toujours, juste moins rapide au démarrage.
function playPremiumVoiceBuffered(text,onDone){
  const mood=voiceMoodFromText(text);
  fetch('/api/events?service=speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,mood})})
    .then(response=>{if(!response.ok)throw new Error('unavailable');return response.blob()})
    .then(blob=>{
      const url=URL.createObjectURL(blob),audio=new Audio(url);
      liveConversation.audio=audio;
      const cleanup=()=>{URL.revokeObjectURL(url);if(liveConversation.audio===audio)liveConversation.audio=null};
      audio.onended=()=>{cleanup();onDone()};
      audio.onerror=()=>{cleanup();speakBrowserFallback(text,onDone,mood)};
      audio.play().catch(()=>{cleanup();speakBrowserFallback(text,onDone,mood)});
    })
    .catch(()=>speakBrowserFallback(text,onDone,mood));
}
// Lecture en flux réel : la voix commence dès les premiers octets reçus plutôt que d'attendre le
// fichier audio complet — c'est ce qui rapproche vraiment le délai de réaction de celui de Speak,
// plus que n'importe quelle réécriture de dialogue. Repli en cascade si MediaSource n'est pas
// utilisable sur l'appareil (certains Safari iOS anciens).
function playPremiumVoice(text,onDone){
  const mood=voiceMoodFromText(text);
  if(!('MediaSource'in window)||!window.MediaSource.isTypeSupported?.('audio/mpeg'))return playPremiumVoiceBuffered(text,onDone);
  let settled=false;
  const finish=(fn)=>{if(settled)return;settled=true;fn()};
  const mediaSource=new MediaSource(),audio=new Audio();
  liveConversation.audio=audio;
  const objectUrl=URL.createObjectURL(mediaSource);
  audio.src=objectUrl;
  const cleanup=()=>{try{URL.revokeObjectURL(objectUrl)}catch{}if(liveConversation.audio===audio)liveConversation.audio=null};
  audio.onended=()=>finish(()=>{cleanup();onDone()});
  audio.onerror=()=>finish(()=>{cleanup();playPremiumVoiceBuffered(text,onDone)});
  mediaSource.addEventListener('sourceopen',async()=>{
    let sourceBuffer;
    try{sourceBuffer=mediaSource.addSourceBuffer('audio/mpeg')}catch{return finish(()=>{cleanup();playPremiumVoiceBuffered(text,onDone)})}
    try{
      const response=await fetch('/api/events?service=speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,mood})});
      if(!response.ok||!response.body)throw new Error('unavailable');
      const reader=response.body.getReader();
      let startedPlaying=false;
      while(true){
        const{done,value}=await reader.read();
        if(done)break;
        if(settled)return;
        await new Promise(resolve=>{sourceBuffer.addEventListener('updateend',resolve,{once:true});sourceBuffer.appendBuffer(value)});
        if(!startedPlaying){startedPlaying=true;audio.play().catch(()=>{})}
      }
      if(!settled&&mediaSource.readyState==='open')mediaSource.endOfStream();
    }catch{
      finish(()=>{cleanup();playPremiumVoiceBuffered(text,onDone)});
    }
  });
}
function drainSpeechQueue(mode){
  if(liveConversation.speaking||!liveConversation.speechQueue.length)return;
  liveConversation.speaking=true;
  const text=liveConversation.speechQueue.shift(),button=liveButton(mode);
  button?.classList.remove('thinking','listening');button?.classList.add('speaking');
  setDVisualState('speaking');
  setLiveStatus(mode,text);
  const finish=()=>{
    liveConversation.speaking=false;stopBargeInWatcher();
    if(!liveConversation.active){setDVisualState('idle');return}
    if(liveConversation.speechQueue.length)return drainSpeechQueue(mode);
    button?.classList.remove('speaking');setDVisualState('listening');
    finishLiveTurn(mode);
  };
  playPremiumVoice(text,finish);
  startBargeInWatcher(mode);
}
// Barge-in : pendant que Dolcia parle, un second micro discret écoute en parallèle. Si la personne
// se remet à parler, Dolcia s'arrête net et laisse la main — comme une vraie conversation.
// Limite connue : sans contrôle fin de l'écho microphone (non exposé par l'API Web Speech), une
// voix qui sort par haut-parleur peut, rarement, se redéclencher elle-même ; un court délai avant
// d'activer l'écoute limite ce risque sans le supprimer entièrement.
function startBargeInWatcher(mode){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition||liveConversation.watcher)return;
  setTimeout(()=>{
    if(!liveConversation.active||!liveConversation.speaking||liveConversation.watcher)return;
    try{
      const watcher=new Recognition();
      liveConversation.watcher=watcher;
      watcher.lang='fr-FR';watcher.interimResults=true;watcher.continuous=true;
      watcher.onresult=event=>{
        const transcript=event.results[event.results.length-1]?.[0]?.transcript.trim();
        if(!transcript||transcript.length<3||!liveConversation.active)return;
        liveConversation.turnId++;
        try{liveConversation.reader?.cancel?.()}catch{}
        try{liveConversation.audio?.pause?.()}catch{}
        liveConversation.audio=null;
        window.speechSynthesis.cancel();
        liveConversation.speechQueue=[];liveConversation.speaking=false;
        stopBargeInWatcher();
        liveButton(mode)?.classList.remove('speaking');
        listenOnce(mode);
      };
      watcher.onerror=()=>{};
      watcher.onend=()=>{if(liveConversation.watcher===watcher)liveConversation.watcher=null};
      watcher.start();
    }catch{liveConversation.watcher=null}
  },420);
}
function finishLiveTurn(mode){
  if(!liveConversation.active)return;
  const action=liveConversation.pendingAction;liveConversation.pendingAction=null;
  if(action&&action!=='none'&&mode==='dcoach'){stopLiveConversation();return dCoachChoose(action)}
  listenOnce(mode);
}
function listenOnce(mode){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition)return stopLiveConversation();
  const recognition=new Recognition();
  liveConversation.recognition=recognition;
  recognition.lang='fr-FR';recognition.interimResults=false;
  const button=liveButton(mode);
  recognition.onstart=()=>{button?.classList.remove('thinking','speaking');button?.classList.add('listening');setDVisualState('listening');setLiveStatus(mode,'Je vous écoute…')};
  recognition.onresult=event=>{const transcript=event.results[0]?.[0]?.transcript.trim();if(transcript)sendLiveTurn(mode,transcript)};
  recognition.onerror=()=>{if(liveConversation.active){button?.classList.remove('listening');setLiveStatus(mode,'Je n’ai pas bien entendu. Reparlez quand vous voulez.')}};
  recognition.onend=()=>{if(liveConversation.active)button?.classList.remove('listening')};
  try{recognition.start()}catch{stopLiveConversation()}
}
async function sendLiveTurn(mode,userText){
  const turnId=++liveConversation.turnId;
  liveConversation.messages.push({role:'user',content:userText});
  liveConversation.pendingAction=liveActionFromText(userText);
  const button=liveButton(mode);
  button?.classList.remove('listening');button?.classList.add('thinking');setDVisualState('thinking');
  setLiveStatus(mode,'Je réfléchis…');
  let full='',pending='';
  try{
    const response=await fetch('/api/events?service=coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,stream:true,messages:liveConversation.messages,context:buildLiveContext(mode)})});
    if(liveConversation.turnId!==turnId)return;
    if(!response.ok||!response.body){button?.classList.remove('thinking');setLiveStatus(mode,'Je n’ai pas pu répondre. Réessayez ou écrivez-moi.');liveConversation.pendingAction=null;listenOnce(mode);return}
    const reader=response.body.getReader();liveConversation.reader=reader;
    const decoder=new TextDecoder();let buffer='';
    const sentenceEnd=/^([\s\S]*?[.!?…])(\s+)/;
    while(true){
      const{done,value}=await reader.read();
      if(liveConversation.turnId!==turnId)return;
      if(done)break;
      buffer+=decoder.decode(value,{stream:true});
      const parts=buffer.split('\n\n');buffer=parts.pop();
      for(const part of parts){
        const line=part.split('\n').find(l=>l.startsWith('data:'));if(!line)continue;
        const payload=line.slice(5).trim();if(!payload)continue;
        let event;try{event=JSON.parse(payload)}catch{continue}
        if(event.error){button?.classList.remove('thinking');setLiveStatus(mode,'Je n’ai pas pu répondre. Réessayez ou écrivez-moi.');liveConversation.pendingAction=null;listenOnce(mode);return}
        if(event.t){
          full+=event.t;pending+=event.t;
          let match;
          while((match=sentenceEnd.exec(pending))){queueSpeech(mode,match[1]);pending=pending.slice(match[0].length)}
          if(pending.length>70){
            const commaBreak=/^([\s\S]{20,90}?,)(\s+)/.exec(pending);
            if(commaBreak){queueSpeech(mode,commaBreak[1]);pending=pending.slice(commaBreak[0].length)}
          }
        }
      }
    }
    if(pending.trim())queueSpeech(mode,pending.trim());
    if(!full.trim()){button?.classList.remove('thinking');setLiveStatus(mode,'Je n’ai pas pu répondre. Réessayez ou écrivez-moi.');liveConversation.pendingAction=null;listenOnce(mode);return}
    liveConversation.messages.push({role:'assistant',content:full.trim()});
    if(!liveConversation.speaking&&!liveConversation.speechQueue.length)finishLiveTurn(mode);
  }catch(e){
    if(liveConversation.turnId!==turnId)return;
    button?.classList.remove('thinking');
    setLiveStatus(mode,'La connexion a été interrompue. Réessayez.');
    liveConversation.pendingAction=null;
  }
}
function realtimeEventText(event){
  return event.transcript||event.text||event.delta||event.item?.content?.map(part=>part.transcript||part.text||'').join('')||'';
}
function stopGPTRealtimeOnly(){
  try{liveConversation.realtimeChannel?.close?.()}catch{}
  try{liveConversation.realtimePeer?.close?.()}catch{}
  try{liveConversation.realtimeStream?.getTracks?.().forEach(track=>track.stop())}catch{}
  try{liveConversation.realtimeAudio?.pause?.()}catch{}
  liveConversation.realtimePeer=null;liveConversation.realtimeStream=null;liveConversation.realtimeChannel=null;liveConversation.realtimeAudio=null;liveConversation.realtimeTranscript='';
}
async function startGPTRealtime(mode){
  const peer=new RTCPeerConnection();
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  if(!liveConversation.active||liveConversation.mode!==mode){stream.getTracks().forEach(track=>track.stop());peer.close();return}
  liveConversation.realtimePeer=peer;liveConversation.realtimeStream=stream;
  const audio=document.createElement('audio');audio.autoplay=true;audio.setAttribute('aria-hidden','true');liveConversation.realtimeAudio=audio;
  peer.ontrack=event=>{audio.srcObject=event.streams[0]};
  stream.getTracks().forEach(track=>peer.addTrack(track,stream));
  const channel=peer.createDataChannel('oai-events');liveConversation.realtimeChannel=channel;
  channel.onopen=()=>{liveButton(mode)?.classList.add('listening');setDVisualState('listening');setLiveStatus(mode,'Je vous écoute. Parlez naturellement…')};
  channel.onmessage=message=>{
    let event;try{event=JSON.parse(message.data)}catch{return}
    const button=liveButton(mode);
    if(event.type==='input_audio_buffer.speech_started'){button?.classList.remove('thinking','speaking');button?.classList.add('listening');setDVisualState('listening');setLiveStatus(mode,'Je vous écoute…')}
    if(event.type==='input_audio_buffer.speech_stopped'||event.type==='response.created'){button?.classList.remove('listening');button?.classList.add('thinking');setDVisualState('thinking');setLiveStatus(mode,'Je vous réponds…')}
    if(event.type?.includes('output_audio')||event.type?.includes('audio_transcript')){button?.classList.remove('thinking','listening');button?.classList.add('speaking');setDVisualState('speaking');const text=realtimeEventText(event);if(text)liveConversation.realtimeTranscript+=text}
    if(event.type==='response.done'){button?.classList.remove('thinking','speaking');button?.classList.add('listening');setDVisualState('listening');if(liveConversation.realtimeTranscript.trim()){liveConversation.messages.push({role:'assistant',content:liveConversation.realtimeTranscript.trim()});liveConversation.realtimeTranscript=''}setLiveStatus(mode,'Je vous écoute…')}
    if(event.type==='error'){setLiveStatus(mode,'La conversation directe a été interrompue. Je repasse en mode compatible.');stopGPTRealtimeOnly();listenOnce(mode)}
  };
  peer.onconnectionstatechange=()=>{if(['failed','disconnected'].includes(peer.connectionState)&&liveConversation.active&&liveConversation.realtimePeer===peer){stopGPTRealtimeOnly();listenOnce(mode)}};
  const offer=await peer.createOffer();await peer.setLocalDescription(offer);
  const response=await fetch('/api/events?service=realtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sdp:offer.sdp,mode,context:buildLiveContext(mode)})});
  const answer=await response.json();
  if(!response.ok||!answer.sdp)throw new Error(answer.error||'Realtime unavailable');
  await peer.setRemoteDescription({type:'answer',sdp:answer.sdp});
}
async function toggleLiveConversation(mode){
  const button=liveButton(mode);
  if(liveConversation.active&&liveConversation.mode===mode)return stopLiveConversation();
  if(!realtimeConversationSupported()&&!liveConversationSupported())return showToast('La conversation vocale n’est pas disponible sur ce navigateur. Vous pouvez écrire exactement la même chose.');
  stopLiveConversation();
  liveConversation.active=true;liveConversation.mode=mode;liveConversation.messages=[];liveConversation.speechQueue=[];liveConversation.pendingAction=null;
  button?.setAttribute('aria-pressed','true');
  if(realtimeConversationSupported()){
    try{return await startGPTRealtime(mode)}catch{stopGPTRealtimeOnly();setLiveStatus(mode,'Je passe en mode vocal compatible…')}
  }
  if(liveConversationSupported())listenOnce(mode);else stopLiveConversation();
}

function retiredHomeArchive(){
  state.view='home';
  setTimeout(mountHomeConcierge,0);
  app.innerHTML=shell(`<section class="hero"><div class="hero-photo"></div><div class="hero-copy"><span class="kicker">Chaque instant mérite une expérience</span><h1>Vos prochaines émotions<br><em>commencent ici.</em></h1><p>Parlez à L’Éclat. En quelques mots, Dolcia comprend votre moment et transforme un choix immense en expérience faite pour vous.</p><div class="hero-cta"><button class="primary" onclick="openEclatDialogue()"><b>D ✦</b>&nbsp; Dolcia vous écoute <span class="arrow">→</span></button><button class="round-action" onclick="renderResults()" aria-label="Explorer librement toutes les possibilités">∞</button></div></div><div class="hero-index"><b>01</b> / 03</div></section>
  <div id="homeMajor" class="home-major-shell"><div class="home-major-loading">Dolcia vérifie les grands rendez-vous d’aujourd’hui…</div></div>
  <section class="live-pulse" id="livePulse"><div class="pulse-weather"><span>Maintenant au Touquet</span><strong id="pulseTemp">Météo en direct</strong><small id="pulseWeather">Actualisation…</small></div><div class="pulse-events"><div><span>À vivre aujourd’hui</span><strong>Les événements qui comptent</strong></div><div id="pulseEventList" class="pulse-event-list"><p>Dolcia vérifie les agendas officiels…</p></div></div></section>
  <section class="local-now"><div class="local-now-copy"><span class="kicker">Votre concierge au Touquet</span><h2>Vous êtes ici.<br><em>Vivez-le vraiment.</em></h2><p>Premier séjour ou vie locale : Dolcia part de votre humeur et de vos envies maintenant, puis transforme votre temps libre en programme réel, varié et adapté à la météo.</p></div><div class="life-shortcuts"><button onclick="quickLife('couple')"><span>Maintenant · à deux</span><strong>Qu’est-ce qui nous ferait du bien ?</strong><b>→</b></button><button onclick="quickLife('family')"><span>Maintenant · en famille</span><strong>Qu’avons-nous envie de vivre ?</strong><b>→</b></button><button onclick="quickLife('friends')"><span>Aujourd’hui · entre amis</span><strong>Quelle ambiance voulons-nous ?</strong><b>→</b></button></div></section>
  <section class="section" id="inspiration"><div class="section-head"><div><span class="kicker">L’inspiration du moment</span><h2>Et si c’était<br>pour aujourd’hui ?</h2></div><p class="section-copy">Une sélection éditoriale pour donner envie. Votre programme final sera construit uniquement avec des lieux et événements issus de sources réelles.</p></div><div class="moments">
    ${moment('Ce soir','Une table, puis la mer',IMAGES.food)}${moment('En famille','Dehors, sans courir',IMAGES.family)}${moment('À deux','Une échappée douce',IMAGES.couple)}
  </div></section>
  <section class="drops-section"><div class="drops-head"><div><span class="kicker">Les drops Dolcia</span><h2>Des raisons de<br><em>sortir maintenant.</em></h2></div><p>Des propositions qui changent avec l’heure, la météo et vos goûts. Les offres commerciales ne s’affichent que lorsqu’elles viennent d’un partenaire vérifié.</p></div><div class="drops">
    ${dropCard('Ce soir seulement','Une soirée déjà composée','Table, spectacle et dernier verre — en un seul élan.',IMAGES.night,'#c9a96e')}
    ${dropCard('Plan B magique','La pluie devient une bonne idée','Dolcia réorganise votre moment avec des expériences intérieures.',IMAGES.culture,'#b8895c')}
    ${dropCard('Échappée surprise','24 heures pour décrocher','Un programme complet adapté à votre budget et votre rayon.',IMAGES.outside,'#e2cf9b')}
  </div><button class="desire-cta" onclick="startCompose()"><span>La signature Dolcia</span><strong>Compose-moi mon expérience</strong><b>→</b></button></section>`);loadHomePulse();
}
function home(){state.view='home';app.innerHTML=shell(`<section class="eclat-home"><div class="eclat-home-atmosphere"></div><div class="eclat-home-copy"><span class="kicker">Chaque instant mérite une expérience</span><div class="eclat-home-mark"><span>D<i>✦</i></span><small>Dolcia vous écoute</small></div><h1>Vos prochaines émotions<br><em>commencent ici.</em></h1><p>Parlez naturellement. Dolcia comprend avec qui vous êtes, ce que vous ressentez, le temps disponible et votre budget total.</p><div class="eclat-home-actions"><button class="primary" onclick="openEclatDialogue()">Composer mon moment <b>→</b></button><button class="secondary" onclick="openExplorer()">Voir toutes les activités <b>∞</b></button></div><div class="eclat-prompts"><button onclick="startLocalDiscovery()">« Je croyais tout connaître ici. »</button><button onclick="openEclatDialogue()">« Deux heures à deux, avec 80 €. »</button><button onclick="openEclatDialogue()">« Surprenez-nous, mais sans voiture. »</button></div></div></section><section class="home-live-minimal"><div id="homeMajor" class="home-major-shell"><div class="home-major-loading">Dolcia vérifie les rendez-vous qui comptent aujourd’hui…</div></div><div class="live-pulse" id="livePulse"><div class="pulse-weather"><span>Maintenant au Touquet</span><strong id="pulseTemp">Météo en direct</strong><small id="pulseWeather">Actualisation…</small></div><div class="pulse-events"><div><span>À vivre aujourd’hui</span><strong>Les événements vérifiés</strong></div><div id="pulseEventList" class="pulse-event-list"><p>Dolcia consulte les agendas officiels…</p></div></div></div></section>`);loadHomePulse()}
function startLocalDiscovery(){state.answers.momentSentence='Je vis ou je reviens souvent ici. Montrez-moi une expérience crédible que je n’aurais pas pensé à chercher.';state.answers.duration=state.answers.duration||'2h';state.answers.vibes=[];state.localDiscovery=true;save();showToast('Dolcia cherche une surprise locale prouvable, jamais inventée');compose()}
function retiredMountHomeConcierge(){return}
function openEclatBrief(voice){openEclatDialogue(voice)}
function openEclatDialogue(voice=false){
  document.querySelector('#eclatDialogue')?.remove();
  state.eclatBrief={step:0,answers:{}};
  document.body.insertAdjacentHTML('beforeend',`<div class="modal eclat-dialogue" id="eclatDialogue" data-scene="time"><div class="eclat-film" id="eclatScene" aria-hidden="true"><span class="eclat-film-current" style="background-image:url('${IMAGES.hero}')"></span></div><div class="eclat-aura" aria-hidden="true"></div><article><button class="close" onclick="document.querySelector('#eclatDialogue')?.remove()" aria-label="Fermer">×</button><header class="eclat-presence">${dMascotMark('large')}<div><small>Dolcia vous écoute</small><strong>Votre moment prend vie</strong></div></header><div class="eclat-context" id="eclatContext"><span>Une seule conversation</span></div><div id="eclatQuestion"></div><div class="eclat-film-caption"><span></span> Images d’inspiration · les propositions resteront vérifiées</div></article></div>`);
  renderEclatQuestion();if(voice)setTimeout(startEclatVoice,250)
}
const ECLAT_LABELS={now:'Maintenant',tonight:'Ce soir',tomorrow:'Demain',custom:'À la date choisie',couple:'En amoureux',family:'En famille',friends:'Entre amis',colleagues:'Entre collègues',solo:'Pour moi',play:'Rire et bouger',breathe:'Prendre l’air',recharge:'Décrocher',taste:'Bien manger',create:'Découvrir',vibrate:'Vibrer ensemble','0':'Gratuit confirmé','60':'60 €','150':'150 €','300':'300 €',flexible:'Expérience prioritaire'};
function eclatSceneFor(step,answers={}){const byWho={couple:IMAGES.couple,family:IMAGES.family,friends:IMAGES.friends,colleagues:IMAGES.friends,solo:IMAGES.solo};const byVibe={play:IMAGES.active,breathe:IMAGES.outside,recharge:IMAGES.slow,taste:IMAGES.food,create:IMAGES.culture,vibrate:IMAGES.night};if(step===0)return {id:'time',image:IMAGES.hero,line:'Le temps s’ouvre devant vous'};if(step===1)return {id:answers.date==='tonight'?'night':'people',image:answers.date==='tonight'?IMAGES.night:IMAGES.hero,line:'Le décor s’accorde à votre rythme'};if(step===2)return {id:answers.who||'people',image:byWho[answers.who]||IMAGES.friends,line:'Chaque personne compte dans l’expérience'};return {id:answers.vibe||'desire',image:byVibe[answers.vibe]||byWho[answers.who]||IMAGES.hero,line:'Dolcia affine l’émotion juste'} }
function updateEclatScene(){const brief=state.eclatBrief,dialogue=document.querySelector('#eclatDialogue'),layer=document.querySelector('#eclatScene .eclat-film-current'),context=document.querySelector('#eclatContext');if(!brief||!dialogue||!layer)return;const scene=eclatSceneFor(brief.step,brief.answers);dialogue.dataset.scene=scene.id;layer.classList.remove('is-revealed');requestAnimationFrame(()=>{layer.style.backgroundImage=`url('${scene.image}')`;layer.classList.add('is-revealed')});const values=['date','who','vibe','budget'].map(key=>brief.answers[key]).filter(Boolean);if(context)context.innerHTML=`<b>${scene.line}</b>${values.map(value=>`<span>${esc(ECLAT_LABELS[value]||value)}</span>`).join('')}`}
function renderEclatQuestion(){const target=document.querySelector('#eclatQuestion'),brief=state.eclatBrief;if(!target||!brief)return;const screens=[
  {q:'Quand voulez-vous que ce moment commence ?',sub:'Je ne vous reposerai pas cette question.',options:[['now','Maintenant'],['tonight','Ce soir'],['tomorrow','Demain'],['custom','Choisir une date']]},
  {q:'Avec qui allons-nous vivre ce moment ?',sub:'Je chercherai le meilleur accord pour les personnes présentes.',options:[['couple','En amoureux'],['family','En famille'],['friends','Entre amis'],['colleagues','Entre collègues'],['solo','Pour moi']]},
  {q:'De quoi avez-vous vraiment besoin maintenant ?',sub:'Choisissez l’élan dominant. Je garderai une part d’inattendu maîtrisé.',options:[['play','Rire et bouger'],['breathe','Prendre l’air'],['recharge','Décrocher complètement'],['taste','Bien manger'],['create','Découvrir et créer'],['vibrate','Vibrer ensemble']]},
  {q:'Quelle enveloppe totale souhaitez-vous respecter ?',sub:'Pour tout le groupe et tout le moment. Vous pourrez la modifier sans recommencer.',options:[['0','0 € · uniquement du gratuit confirmé'],['60','Jusqu’à 60 €'],['150','Jusqu’à 150 €'],['300','Jusqu’à 300 €'],['flexible','Priorité à l’expérience']]}
  ];const screen=screens[brief.step];target.classList.remove('question-arrival');target.innerHTML=`<div class="dialogue-progress"><i style="--progress:${(brief.step+1)*25}%"></i><span>0${brief.step+1} / 04</span></div><h2>${screen.q}</h2><p>${screen.sub}</p><div class="dialogue-choices">${screen.options.map(([id,label])=>`<button onclick="answerEclat('${id}')"><span>${label}</span><b>→</b></button>`).join('')}</div><div class="dialogue-free"><input id="eclatFree" placeholder="${brief.step===3?'Ou indiquez votre montant total…':'Ou dites-le avec vos mots…'}" ${brief.step===3?'inputmode="decimal"':''}><button onclick="answerEclatFree()">Continuer</button><button class="voice" onclick="startEclatVoice()" aria-label="Parler à Dolcia">●</button></div>`;requestAnimationFrame(()=>target.classList.add('question-arrival'));updateEclatScene()}
function answerEclat(value){const brief=state.eclatBrief;if(!brief)return;if(brief.step===0){brief.answers.date=value;if(value==='custom')return renderEclatCustomDate();brief.answers.duration=value==='tonight'?'evening':value==='tomorrow'?'day':'2h'}if(brief.step===1)brief.answers.who=value;if(brief.step===2){brief.answers.vibe=value;return advanceAfterVibe()}if(brief.step===3)brief.answers.budget=value;if(brief.step<3){brief.step++;renderEclatQuestion()}else finishEclat()}
function renderEclatCustomDate(){const target=document.querySelector('#eclatQuestion');if(!target)return;const today=iso(new Date());target.innerHTML=`<span class="dialogue-step">Votre moment</span><h2>Quand puis-je prendre soin de votre temps ?</h2><p>Choisissez la date et le rythme ici, sans quitter Dolcia.</p><div class="eclat-custom-date"><input id="eclatDate" type="date" min="${today}" value="${today}"><select id="eclatDuration"><option value="2h">Environ 2 heures</option><option value="morning">La matinée</option><option value="afternoon">L’après-midi</option><option value="afternoon_evening">L’après-midi + la soirée</option><option value="evening">La soirée</option><option value="day">La journée complète</option><option value="stay">Plusieurs jours</option></select><button onclick="answerEclatCustomDate()">Continuer →</button></div>`}
function answerEclatCustomDate(){const value=document.querySelector('#eclatDate')?.value,duration=document.querySelector('#eclatDuration')?.value;if(!value)return showToast('Choisissez une date');const date=new Date(`${value}T12:00:00`);state.eclatBrief.answers.dateObject=date.toISOString();state.eclatBrief.answers.date='custom';state.eclatBrief.answers.duration=duration||'2h';state.eclatBrief.step=1;renderEclatQuestion()}
function stayRhythmInsight(){const brief=state.eclatBrief?.answers||{},sentence=plainText(state.answers.momentSentence||''),vibe=brief.vibe||'';if(/semaine sportive|stage sportif|sport tous les jours|vacances sportives|beaucoup de sport/.test(sentence))return{id:'sport',confidence:.98,voice:'Vous voulez conserver une vraie intensité sportive pendant le séjour.'};if(/farniente|plage et repos|repos total|ne rien faire|se reposer surtout|vacances tranquilles/.test(sentence))return{id:'rest',confidence:.96,voice:'Vous cherchez surtout la douceur, la plage et du temps libre.'};if(/alterner|equilibr|un peu de sport|sport et repos|temps forts et repos/.test(sentence))return{id:'balanced',confidence:.94,voice:'Vous souhaitez alterner les temps forts et les journées plus douces.'};if(vibe==='recharge')return{id:'rest',confidence:.82,voice:'Je vous imagine dans un séjour surtout doux, avec seulement quelques élans choisis.'};return{id:'adaptive',confidence:.45,voice:'Je peux équilibrer le séjour, mais une nuance changera vraiment son rythme.'}}
function advanceAfterVibe(){const brief=state.eclatBrief;if(!brief)return;const stay=brief.answers.duration==='stay';if(stay&&!brief.answers.stayRhythm){const insight=stayRhythmInsight();brief.answers.rhythmInsight=insight;if(insight.confidence>=.8)brief.answers.stayRhythm=insight.id;else return renderStayRhythmQuestion(insight)}brief.step=3;renderEclatQuestion()}
function renderStayRhythmQuestion(insight=stayRhythmInsight()){const target=document.querySelector('#eclatQuestion');if(!target)return;target.innerHTML=`<div class="dialogue-progress"><i style="--progress:72%"></i><span>UNE NUANCE DÉCISIVE</span></div><span class="dialogue-step">Dolcia a compris l’essentiel</span><h2>${esc(insight.voice)}</h2><p>Dois-je équilibrer librement, ou souhaitez-vous donner une dominante claire au séjour ?</p><div class="dialogue-options stay-rhythm-options"><button onclick="answerStayRhythm('adaptive')"><strong>Équilibrez pour nous</strong><small>Temps forts et respirations selon l’énergie réelle du groupe</small><b>→</b></button><button onclick="answerStayRhythm('rest')"><strong>Surtout douceur & plage</strong><small>Repos dominant, avec quelques découvertes choisies</small><b>→</b></button><button onclick="answerStayRhythm('balanced')"><strong>Des journées contrastées</strong><small>Une journée active peut être suivie d’une journée plus douce</small><b>→</b></button><button onclick="answerStayRhythm('sport')"><strong>Une vraie semaine sportive</strong><small>Conserver volontairement une intensité élevée</small><b>→</b></button></div>`}
function answerStayRhythm(value){if(!state.eclatBrief)return;state.eclatBrief.answers.stayRhythm=value;state.eclatBrief.step=3;renderEclatQuestion()}
function answerEclatFree(){const value=document.querySelector('#eclatFree')?.value.trim();if(!value)return showToast('Dites-moi simplement ce que vous souhaitez');if(state.eclatBrief.step===3){const amount=Number(value.replace(/[^0-9,.]/g,'').replace(',','.'));if(!Number.isFinite(amount)||amount<0)return showToast('Indiquez un budget total valide');state.eclatBrief.answers.budget=String(amount);return finishEclat()}state.answers.momentSentence=[state.answers.momentSentence,value].filter(Boolean).join(' · ');if(state.eclatBrief.step===2)return advanceAfterVibe();if(state.eclatBrief.step<3){state.eclatBrief.step++;renderEclatQuestion()}else finishEclat()}
function startEclatVoice(){const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return showToast('La conversation vocale n’est pas disponible sur ce navigateur');const recognition=new Recognition();recognition.lang='fr-FR';recognition.onstart=()=>showToast('Dolcia vous écoute…');recognition.onresult=event=>{const input=document.querySelector('#eclatFree');if(input){input.value=event.results[0][0].transcript;answerEclatFree()}};recognition.start()}
function finishEclat(){const a=state.eclatBrief.answers;if(a.date==='custom'&&a.dateObject){const date=new Date(a.dateObject);state.dateMode='custom';state.dateStart=new Date(date);state.dateEnd=new Date(date);state.dateEnd.setHours(23,59,59,999)}else setDate(a.date||'now');state.answers.who=a.who||state.answers.who||'solo';state.answers.vibes=[a.vibe||'breathe'];const amount=a.budget==='flexible'?null:Number(a.budget);state.budgetPlan.amount=Number.isFinite(amount)?amount:null;state.answers.budget=a.budget==='0'?'free':a.budget==='flexible'?'flexible':'custom';state.answers.duration=a.duration||(a.date==='tonight'?'evening':'2h');state.answers.stayRhythm=state.answers.duration==='stay'?(a.stayRhythm||inferStayRhythm()):null;resetMomentCatalogFilters();save();document.querySelector('#eclatDialogue')?.remove();compose()}
function openAccount(){const profile=JSON.parse(localStorage.getItem('dolcia_profile_v1')||'null'),people=state.circleProfiles;document.querySelector('#accountSpace')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="modal account-space" id="accountSpace"><article class="circle-account"><button class="close" onclick="document.querySelector('#accountSpace')?.remove()">×</button><span class="kicker">Votre espace privé</span><h2>${profile?'Bonjour '+esc(profile.name):'Dolcia apprend à vous connaître.'}</h2><p>Vos goûts vous appartiennent. Pour chaque moment, choisissez simplement qui vous accompagne.</p><div class="account-profile"><label>Votre prénom<input id="accountName" value="${esc(profile?.name||'')}"></label><label class="consent"><input id="accountConsent" type="checkbox" ${profile?.consent?'checked':''}> Mémoriser mes préférences pour personnaliser mes propositions.</label><button class="primary" onclick="saveAccount()">${profile?'Mettre à jour':'Créer mon espace Dolcia'}</button><button class="constellation-link" onclick="openConstellation()">Ouvrir Notre constellation <span>Vos expériences, vos émotions, vos proches →</span></button></div><section class="circle-section"><div><span class="kicker">Mon Cercle Dolcia</span><h3>Avec qui vivez-vous ce moment ?</h3><p>Famille, amis et proches restent disponibles, sans devoir les recréer à chaque sortie.</p></div><div class="circle-list">${people.length?people.map(circlePersonCard).join(''):'<div class="circle-empty">Votre cercle est encore vide. Ajoutez un proche ou un enfant en quelques secondes.</div>'}</div><div class="circle-add"><button onclick="openCirclePerson('account')">Inviter un compte Dolcia</button><button onclick="openCirclePerson('child')">Ajouter un enfant</button><button onclick="openCirclePerson('relative')">Ajouter un proche</button><button onclick="openCirclePerson('guest')">Invité ponctuel</button></div></section><small class="privacy-note">Les profils sont privés. Vous pouvez consulter, corriger ou effacer ce que Dolcia retient. La synchronisation sécurisée entre téléphones sera activée avec les comptes Supabase ; aujourd’hui, ces informations restent sur cet appareil.</small></article></div>`)}
function circlePersonCard(person){const active=state.groupParticipants.some(item=>item.id===person.id&&item.selected!==false),detail=[person.relationship,person.ageBand,person.email?'Compte Dolcia':''].filter(Boolean).join(' · '),signal=[person.momentNeed,person.energy].filter(Boolean).join(' · ');return `<article class="circle-person ${active?'active':''}"><button class="circle-toggle" onclick="toggleCirclePerson('${person.id}')"><b>${esc(person.name).slice(0,1)}</b><span><strong>${esc(person.name)}</strong><small>${esc(detail||'Profil du cercle')}</small>${signal?`<small class="moment-signal">Aujourd’hui · ${esc(signal)}</small>`:''}</span><i>${active?'Avec moi':'Disponible'}</i></button><button class="sensitivity-edit" onclick="openSensitivity('${person.id}')">Sa sensibilité</button><button class="circle-remove" onclick="removeCirclePerson('${person.id}')" aria-label="Retirer ${esc(person.name)}">×</button></article>`}
function openCirclePerson(kind){document.querySelector('#circlePersonModal')?.remove();const titles={account:'Inviter un proche sur Dolcia',child:'Ajouter un enfant',relative:'Ajouter un proche',guest:'Ajouter un invité ponctuel'};document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="circlePersonModal"><article class="circle-person-modal"><button class="close" onclick="document.querySelector('#circlePersonModal')?.remove()">×</button><span class="kicker">Mon Cercle</span><h2>${titles[kind]}</h2><label>Prénom ou surnom<input id="circleName" autocomplete="off"></label>${kind==='account'?'<label>E-mail du compte Dolcia<input id="circleEmail" type="email" placeholder="prenom@exemple.fr"></label>':''}${kind==='child'?'<label>Tranche d’âge<select id="circleAge"><option>0–3 ans</option><option>4–7 ans</option><option>8–11 ans</option><option>12–15 ans</option><option>16–17 ans</option></select></label>':'<label>Votre lien<select id="circleRelation"><option>Conjoint·e</option><option>Ami·e</option><option>Famille</option><option>Collègue</option><option>Autre</option></select></label>'}<label>À prendre en compte<input id="circleConstraint" placeholder="Ex. poussette, mobilité, allergie (facultatif)"></label><button class="primary" onclick="saveCirclePerson('${kind}')">Ajouter à mon cercle</button></article></div>`);setTimeout(()=>document.querySelector('#circleName')?.focus(),50)}
function saveCirclePerson(kind){const name=document.querySelector('#circleName')?.value.trim();if(!name)return showToast('Indiquez un prénom ou un surnom');const person={id:`circle-${Date.now()}`,name,kind,email:document.querySelector('#circleEmail')?.value.trim()||'',ageBand:document.querySelector('#circleAge')?.value||'',relationship:document.querySelector('#circleRelation')?.value||(kind==='child'?'Enfant':''),constraint:document.querySelector('#circleConstraint')?.value.trim()||''};state.circleProfiles.push(person);state.groupParticipants.push({...person,role:'participant',selected:true});save();document.querySelector('#circlePersonModal')?.remove();openAccount();showToast(kind==='account'?'Invitation préparée et proche ajouté':'Personne ajoutée à ce moment')}
function sensitivityOptions(selected=[]){return [['play','Rire & jouer'],['breathe','Prendre l’air'],['create','Découvrir & créer'],['taste','Bien manger'],['recharge','Se détendre'],['vibrate','Vibrer']].map(([id,label])=>`<label><input type="checkbox" value="${id}" ${selected.includes(id)?'checked':''}> ${label}</label>`).join('')}
function openSensitivity(id){const person=state.circleProfiles.find(item=>item.id===id);if(!person)return;document.querySelector('#sensitivityModal')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="sensitivityModal"><article class="sensitivity-modal"><button class="close" onclick="document.querySelector('#sensitivityModal')?.remove()">×</button><span class="kicker">Une sensibilité, jamais une étiquette</span><h2>${esc(person.name)}</h2><p>Les goûts durables aident Dolcia. L’envie d’aujourd’hui ne modifiera pas automatiquement ce profil.</p><h3>Ce qui lui plaît généralement</h3><div class="sensitivity-grid" id="durableLikes">${sensitivityOptions(person.likes||[])}</div><h3>À éviter durablement</h3><div class="sensitivity-grid avoid" id="durableAvoids">${sensitivityOptions(person.avoids||[])}</div><div class="moment-brief"><label>Son énergie aujourd’hui<select id="personEnergy"><option value="">Je ne sais pas</option><option ${person.energy==='Douce'?'selected':''}>Douce</option><option ${person.energy==='Équilibrée'?'selected':''}>Équilibrée</option><option ${person.energy==='Élevée'?'selected':''}>Élevée</option></select></label><label>Son besoin du moment<select id="personMoment"><option value="">Aucun signal particulier</option><option ${person.momentNeed==='Se retrouver'?'selected':''}>Se retrouver</option><option ${person.momentNeed==='S’amuser'?'selected':''}>S’amuser</option><option ${person.momentNeed==='Souffler'?'selected':''}>Souffler</option><option ${person.momentNeed==='Découvrir'?'selected':''}>Découvrir</option><option ${person.momentNeed==='Être surpris'?'selected':''}>Être surpris</option></select></label></div><label class="moment-refusal">Une chose à éviter aujourd’hui<input id="personMomentAvoid" value="${esc(person.momentAvoid||'')}" placeholder="Ex. trop marcher, bruit, activité sportive…"></label><button class="primary" onclick="saveSensitivity('${id}')">Enregistrer cette nuance</button><small>« Pas aujourd’hui » expire avec ce moment. « À éviter durablement » reste modifiable dans le profil.</small></article></div>`)}
function checkedValues(selector){return [...document.querySelectorAll(`${selector} input:checked`)].map(input=>input.value)}
function saveSensitivity(id){const person=state.circleProfiles.find(item=>item.id===id);if(!person)return;person.likes=checkedValues('#durableLikes');person.avoids=checkedValues('#durableAvoids');person.energy=document.querySelector('#personEnergy')?.value||'';person.momentNeed=document.querySelector('#personMoment')?.value||'';person.momentAvoid=document.querySelector('#personMomentAvoid')?.value.trim()||'';if(id==='me')state.ownerSensitivity={likes:person.likes,avoids:person.avoids,energy:person.energy,momentNeed:person.momentNeed,momentAvoid:person.momentAvoid};const participant=state.groupParticipants.find(item=>item.id===id);if(participant)Object.assign(participant,person);save();document.querySelector('#sensitivityModal')?.remove();openAccount();showToast('Dolcia cherchera le point d’accord du groupe')}
function currentGroupProfiles(){return state.groupParticipants.filter(person=>person.selected!==false).map(person=>{const full=state.circleProfiles.find(profile=>profile.id===person.id)||person;return {id:full.id,name:full.name||'Participant',kind:full.kind||'',ageBand:full.ageBand||'',constraint:full.constraint||'',likes:Array.isArray(full.likes)?full.likes:[],avoids:Array.isArray(full.avoids)?full.avoids:[],energy:full.energy||'',momentNeed:full.momentNeed||'',momentAvoid:full.momentAvoid||''}})}
function toggleCirclePerson(id){const person=state.circleProfiles.find(item=>item.id===id);if(!person)return;const existing=state.groupParticipants.find(item=>item.id===id);if(existing)existing.selected=existing.selected===false;else state.groupParticipants.push({...person,role:'participant',selected:true});save();openAccount();showToast(state.groupParticipants.find(item=>item.id===id)?.selected?'Ajouté à ce moment':'Retiré de ce moment')}
function removeCirclePerson(id){if(id==='me')return showToast('Votre profil principal ne peut pas être retiré');state.circleProfiles=state.circleProfiles.filter(item=>item.id!==id);state.groupParticipants=state.groupParticipants.filter(item=>item.id!==id);save();openAccount();showToast('Profil retiré de votre cercle')}
function saveAccount(){const name=document.querySelector('#accountName')?.value.trim(),consent=document.querySelector('#accountConsent')?.checked;if(!name||!consent)return showToast('Indiquez votre prénom et acceptez la mémorisation');localStorage.setItem('dolcia_profile_v1',JSON.stringify({name,consent,updatedAt:new Date().toISOString()}));document.querySelector('#accountSpace')?.remove();showToast('Votre espace Dolcia est créé sur cet appareil')}
function memoryItem(id){return state.agenda.find(item=>item.id===id)||state.allItems.find(item=>item.id===id)||state.items.find(item=>item.id===id)}
function openConstellation(){document.querySelector('#accountSpace')?.remove();document.querySelector('#constellationSpace')?.remove();const ids=[...new Set([...Object.keys(state.experienceMemories),...Object.keys(state.experienceFeelings)])],records=ids.map(id=>({id,item:memoryItem(id),memory:state.experienceMemories[id]||{},feeling:state.experienceFeelings[id]})).filter(record=>record.item);const learned=Object.entries(state.tasteProfile).filter(([,value])=>value).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,6);document.body.insertAdjacentHTML('beforeend',`<div class="modal constellation-space" id="constellationSpace"><article><button class="close" onclick="document.querySelector('#constellationSpace')?.remove()">×</button><span class="kicker">Votre mémoire visible et corrigeable</span><h2>Notre constellation.</h2><p>Les moments réellement vécus deviennent une carte personnelle. Dolcia distingue vos goûts durables de votre envie du jour.</p><div class="constellation-summary"><span><b>${records.length}</b> expérience${records.length>1?'s':''} racontée${records.length>1?'s':''}</span><span><b>${state.favorites.length}</b> coup${state.favorites.length>1?'s':''} de cœur</span><span><b>${state.circleProfiles.length+1}</b> personne${state.circleProfiles.length?'s':''} dans votre cercle</span></div>${learned.length?`<section class="learned-tastes"><span class="kicker">Ce que Dolcia a compris — modifiable</span><div>${learned.map(([category,value])=>`<button onclick="resetTaste('${esc(category)}')"><b>${esc(category)}</b><small>${value>0?'Vous semble plaire':'À proposer avec prudence'} · effacer ×</small></button>`).join('')}</div></section>`:''}<section class="constellation-list">${records.length?records.map(({id,item,memory,feeling})=>`<article><img src="${itemImage(item)}" alt=""><div><span>${memory.reaction?esc(memory.reaction):feeling?esc(feeling):'Souvenir enregistré'}</span><h3>${esc(item.name)}</h3><small>${memory.at?new Date(memory.at).toLocaleDateString('fr-FR'):'Date non renseignée'} · ${(memory.people||[]).map(person=>esc(person.name)).join(', ')||'Participants non renseignés'}</small><button onclick="forgetExperience('${id}')">Effacer ce souvenir</button></div></article>`).join(''):'<div class="constellation-empty"><h3>Votre constellation commence après votre première expérience.</h3><p>Une réaction suffit. Photos et souvenirs resteront toujours facultatifs.</p></div>'}</section><small class="privacy-note">Dolcia ne déduit jamais que vous connaissez ou ignorez un lieu sans preuve. Vous gardez le droit de correction et d’effacement.</small></article></div>`)}
function resetTaste(category){delete state.tasteProfile[category];save();openConstellation();showToast('Cette préférence a été effacée')}
function forgetExperience(id){delete state.experienceMemories[id];delete state.experienceFeelings[id];delete state.experienceTags[id];save();openConstellation();showToast('Ce souvenir et son apprentissage contextuel ont été effacés')}
function rememberExperience(id,reaction){const item=memoryItem(id);if(!item)return;state.experienceMemories[id]={reaction,at:new Date().toISOString(),people:state.groupParticipants.filter(person=>person.selected!==false).map(({id,name,kind})=>({id,name,kind})),who:state.answers.who||'unknown',category:item.category||'other'};save();showToast('Ce moment rejoint Notre constellation');openDetailRefresh(id)}
async function loadHomePulse(){
  const today=iso(new Date());
  const list=document.querySelector('#pulseEventList');
  const emptyPulse=()=>`<div class="pulse-empty"><span>Le champ des possibles reste ouvert</span><strong>Et si votre prochain moment commençait ici ?</strong><p>Dolcia n’affiche que les rendez-vous assez fiables. Les expériences disponibles autour de vous restent accessibles dès maintenant.</p><button onclick="startCompose()">Composer mon moment <b>→</b></button></div>`;
  try{
    const [weather,official,tickets,major]=await Promise.allSettled([
      get(`/api/weather?lat=${state.location.lat}&lng=${state.location.lng}`),
      get(`/api/touquet-events?after=${today}&before=${today}`),
      get(`/api/ticketmaster-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=12&after=${today}&before=${today}`),
      get(`/api/major-events?date=${today}&days=30&lat=${state.location.lat}&lng=${state.location.lng}`)
    ]);
    if(state.view!=='home')return;
    const w=weather.status==='fulfilled'&&weather.value&&typeof weather.value==='object'?weather.value:null;
    const temp=document.querySelector('#pulseTemp'),label=document.querySelector('#pulseWeather');
    if(temp)temp.textContent=w?.main?.temp!=null?`${Math.round(w.main.temp)}° au Touquet`:'Le Touquet aujourd’hui';
    if(label)label.textContent=w?.weather?.[0]?.description||'Votre moment, à votre rythme';
    const officialEvents=official.status==='fulfilled'&&Array.isArray(official.value?.events)?official.value.events:[];
    const ticketEvents=tickets.status==='fulfilled'&&Array.isArray(tickets.value?.events)?tickets.value.events:[];
    const raw=[...officialEvents,...ticketEvents];
    let normalized=[];
    try{normalized=Array.isArray(raw)?normalizeEvents(raw):[]}catch(_){normalized=[]}
    const events=dedupe(normalized).slice(0,3);
    const majorSeed=major.status==='fulfilled'&&Array.isArray(major.value?.events)?major.value.events:[];
    try{state.majorMoments=detectMajorMoments(normalized,majorSeed.map(event=>({...event,kind:event.kind||'event',score:Number(event.score)||100})))||[]}catch(_){state.majorMoments=[]}
    renderHomeMajor(state.majorMoments[0]||null);
    if(list)list.innerHTML=events.length?events.map(event=>`<button onclick="openHomeEvent('${esc(event.id||'')}')"><span>${event.date?new Date(event.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'Aujourd’hui'}</span><strong>${esc(event.name)}</strong><b>→</b></button>`).join(''):emptyPulse();
  }catch(_){
    renderHomeMajor(null);
    if(list)list.innerHTML=emptyPulse();
  }
}
function majorMomentTiming(moment){if(!moment)return'';const date=new Date(moment.date),day=date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});return moment.timeKnown===false?day:`${day} · ${date.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`}
function majorMomentAction(moment){if(moment?.kind==='astronomy')return{eyebrow:'Un phénomène rare à anticiper',description:`${moment.visibilityLabel||'Visible depuis votre région'}. Dolcia peut prévoir le bon créneau, un lieu adapté et les précautions utiles.`,button:'Préparer ce moment'};if(moment?.broadcastable)return{eyebrow:'Un grand rendez-vous qui rassemble',description:'Dolcia peut l’intégrer à votre programme et chercher uniquement des lieux de diffusion réellement confirmés.',button:'L’intégrer à mon moment'};return{eyebrow:'Un rendez-vous à ne pas manquer',description:'Dolcia peut l’intégrer à votre programme sans sacrifier le reste de vos envies.',button:'L’intégrer à mon moment'}}
function renderHomeMajor(moment){const target=document.querySelector('#homeMajor');if(!target)return;if(!moment){target.innerHTML='';target.hidden=true;return}const copy=majorMomentAction(moment);target.hidden=false;target.innerHTML=`<article class="home-major-card"><div><span class="kicker">${esc(copy.eyebrow)}</span><h2>${esc(moment.title||moment.name)}</h2><p>${esc(majorMomentTiming(moment))}. ${esc(copy.description)}</p>${moment.safetyNote?`<p class="major-safety">${esc(moment.safetyNote)}</p>`:''}${moment.sourceUrl?`<a class="major-source" href="${esc(moment.sourceUrl)}" target="_blank" rel="noopener">Source officielle · ${esc(moment.source||'Organisateur')}</a>`:''}</div><div class="home-major-actions"><button class="primary" onclick="acceptHomeMajor('${esc(moment.id)}')">${esc(copy.button)}</button><button class="secondary" onclick="dismissHomeMajor()">Pas cette fois</button></div></article>`}
function acceptHomeMajor(id){const moment=state.majorMoments.find(item=>item.id===id);if(!moment)return startCompose();const date=new Date(moment.date);state.majorChoice=id;state.dateMode='major';if(moment.kind==='astronomy'){state.dateStart=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12,0);state.dateEnd=new Date(date.getFullYear(),date.getMonth(),date.getDate(),22,0);state.answers={duration:'afternoon_evening',vibes:['breathe']}}else{state.dateStart=new Date(date.getFullYear(),date.getMonth(),date.getDate(),18,0);state.dateEnd=new Date(date.getFullYear(),date.getMonth(),date.getDate(),23,59);state.answers={duration:'evening',vibes:['vibrate']}}openEclatDialogue()}
function dismissHomeMajor(){const target=document.querySelector('#homeMajor');if(target){target.innerHTML='';target.hidden=true}}
function openHomeEvent(id){startCompose();showToast('Choisissez votre timing : Dolcia intégrera les événements du jour')}
function moment(kicker,title,image){return `<button class="moment-card" onclick="startCompose()"><img src="${image}" alt=""><span class="moment-copy"><small>${kicker}</small><h3>${title}</h3></span></button>`}
function dropCard(tag,title,copy,image,color){return `<button class="drop" style="--accent:${color}" onclick="startCompose()"><div class="drop-visual" style="background-image:url('${image}')"><span>${tag}</span></div><div class="drop-copy"><h3>${title}</h3><p>${copy}</p><b>Créer ce moment →</b></div></button>`}
function quickLife(who){const hour=new Date().getHours();state.dateMode=hour>=17?'tonight':'today';state.dateStart=new Date();state.dateEnd=new Date();state.answers={duration:hour>=17?'evening':hour>=13?'afternoon':'day',who,vibes:[],budget:'flexible'};openEclatDialogue()}

function startCompose(){openEclatDialogue()}
function renderComposer(){
  if(state.step===-1) return renderDate();
  if(state.step===0) return renderDate();
  const base=FLOW[state.step], s=base.key==='budget'?{...base,...budgetStep()}:base, selected=state.answers[s.key];
  app.innerHTML=shell(`<section class="composer"><div class="composer-shell"><div class="composer-head"><div><span class="kicker">${s.eyebrow}</span><h2>${s.title}</h2></div><div class="step-count">${state.step+1} / ${FLOW.length}<div class="progress"><span style="width:${((state.step+1)/FLOW.length)*100}%"></span></div></div></div><p class="step-lead">${s.sub}</p><div class="choice-grid">${s.options.map(o=>choice(s,o,selected)).join('')}</div><div class="composer-actions"><button class="secondary" onclick="backStep()">← Retour</button><button class="primary" onclick="nextStep()">${state.step===FLOW.length-1?'Composer mon moment':'Continuer →'}</button></div></div></section>`,'compose');
  if(s.key==='who')setTimeout(mountCircleDetails,0);
}
function circleOptions(who){return({family:[['toddlers','Avec des tout-petits'],['children','Avec des enfants'],['teens','Avec des adolescents'],['mixed','Plusieurs âges']],couple:[['romantic','Une parenthèse romantique'],['reconnect','Se retrouver vraiment'],['spontaneous','Quelque chose de spontané']],friends:[['lively','Rire et bouger'],['chill','Prendre le temps'],['celebrate','Fêter quelque chose']],colleagues:[['afterwork','Décompresser après le travail'],['team','Créer un vrai moment d’équipe'],['impress','Faire découvrir une pépite']],solo:[['reset','Souffler'],['explore','Découvrir'],['social','Voir du monde']]}[who]||[])}
function mountCircleDetails(){const grid=document.querySelector('.choice-grid'),who=state.answers.who,options=circleOptions(who);if(!grid||!who||!options.length)return;grid.insertAdjacentHTML('afterend',`<section class="circle-details"><span class="kicker">Votre cercle, aujourd'hui</span><strong>${who==='family'?'Qui sont les petits et les grands ?':'Quel moment voulez-vous partager ?'}</strong><p>Ce choix décrit uniquement cette sortie. Il ne modifie pas vos goûts permanents.</p><div>${options.map(([id,label])=>`<button class="${state.answers.groupDetail===id?'selected':''}" onclick="setGroupDetail('${id}')">${label}</button>`).join('')}</div></section>`)}
function setGroupDetail(value){state.answers.groupDetail=value;renderComposer()}
function budgetStep(){
  const duration=state.answers.duration||'2h';
  const nights=Math.max(1,tripDays()-1),economy=Math.ceil(nights*80/50)*50,comfort=Math.ceil(nights*160/50)*50,premium=Math.ceil(nights*300/50)*50;
  const sets={
    '2h':{title:'Quel budget pour ces deux heures ?',sub:'Budget total par personne pour l’ensemble du moment.',values:[['free','0 €','Uniquement les expériences confirmées gratuites'],['budget1','Jusqu’à 25 €','Une sortie simple et accessible'],['budget2','Jusqu’à 60 €','Plus de possibilités par personne'],['flexible','Sans limite précise','Priorité à l’expérience']]},
    half:{title:'Quel budget pour cette demi-journée ?',sub:'Budget total par personne, activités et repas éventuel compris.',values:[['free','0 €','Uniquement les expériences confirmées gratuites'],['budget1','Jusqu’à 50 €','Une demi-journée accessible'],['budget2','Jusqu’à 120 €','Activités et belle table possibles'],['flexible','Sans limite précise','Priorité à l’expérience']]},
    day:{title:'Quel budget pour toute la journée ?',sub:'Budget total par personne pour le programme complet.',values:[['free','0 €','Une journée uniquement gratuite'],['budget1','Jusqu’à 80 €','Sorties et repas maîtrisés'],['budget2','Jusqu’à 200 €','Une journée très complète'],['flexible','Sans limite précise','Priorité à l’expérience']]},
    stay:{title:`Quel budget pour les ${tripDays()} jours ?`,sub:`Budget total par personne pour ${nights} nuit${nights>1?'s':''}, hébergement et expériences compris.`,values:[['budget1',`Jusqu’à ${economy.toLocaleString('fr-FR')} €`,`Environ 80 € par nuit et par personne, activités comprises`],['budget2',`Jusqu’à ${comfort.toLocaleString('fr-FR')} €`,`Environ 160 € par nuit et par personne`],['budget3',`Jusqu’à ${premium.toLocaleString('fr-FR')} €`,`Séjour premium calculé sur toute la durée`],['flexible','Sans limite précise','Priorité aux meilleures expériences']]}
  };
  const budgetKind=['morning','afternoon','evening'].includes(duration)?'half':duration==='afternoon_evening'?'day':duration;const set=sets[budgetKind]||sets['2h'];return {title:set.title,sub:set.sub,options:set.values.map((x,i)=>[...x,[IMAGES.outside,IMAGES.family,IMAGES.food,IMAGES.slow][i]])}
}
function choice(step,o,selected){const active=step.multi?selected.includes(o[0]):selected===o[0]; return `<button class="choice ${active?'selected':''}" onclick="pick('${step.key}','${o[0]}',${!!step.multi})"><img src="${o[3]}" alt=""><span class="choice-copy"><h3>${o[1]}</h3><p>${o[2]}</p></span></button>`}
function pick(key,val,multi){
  if(multi){
    const a=state.answers[key];
    state.answers[key]=a.includes(val)?a.filter(x=>x!==val):[...a,val];
    renderComposer();
    return;
  }
  if(key==='who'&&state.answers.who!==val)state.answers.groupDetail=null;
  state.answers[key]=val;
  if(key==='duration')state.answers.budget=null;
  renderComposer();
  setTimeout(nextStep,220);
}
function nextStep(){if(state.step>=0){const s=FLOW[state.step],v=state.answers[s.key];if(!v||(Array.isArray(v)&&!v.length))return showToast('Choisissez une option pour continuer')} if(state.step<FLOW.length-1){state.step++;renderComposer()}else compose()}
function backStep(){if(state.step<=1){state.step=-1;renderDate()}else{state.step--;renderComposer()}}

function renderDate(){
  app.innerHTML=shell(`<section class="composer moment-editor"><div class="composer-shell"><div class="composer-head"><div><span class="kicker">Un seul choix, au même endroit</span><h2>Où et quand voulez-vous sortir ?</h2></div><div class="step-count">Votre moment<div class="progress"><span style="width:25%"></span></div></div></div><p class="step-lead">Choisissez la destination, la date et le créneau sur cet écran. Dolcia ne vous reposera pas la même question ensuite.</p><div class="destination-row">${Object.entries(DESTINATIONS).map(([id,d])=>`<button class="destination-pill ${state.location.name===d.name?'active':''}" onclick="setDestination('${id}')">${d.name}</button>`).join('')}<button class="destination-pill" onclick="useLocation()">Autour de moi</button></div><div class="date-presets compact-presets">${[['now','Maintenant',`Dès ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`],['tonight','Ce soir','À partir de 18 h'],['tomorrow','Demain','À votre rythme'],['weekend','Ce week-end','Samedi + dimanche']].map(x=>`<button class="date-pill ${state.dateMode===x[0]?'active':''}" onclick="setDate('${x[0]}')"><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div><div class="moment-layout">${calendar()}<aside class="time-choice-panel"><span class="kicker">Votre créneau</span><h3>Combien de temps avez-vous ?</h3>${compactTimeChoices()}</aside></div><div class="composer-actions"><button class="secondary" onclick="home()">← Accueil</button><button class="primary" onclick="confirmDate()">Continuer →</button></div></div></section>`,'compose');
}
function compactTimeChoices(){
  if(tripDays()>1)return`<button class="time-chip selected">Séjour de ${tripDays()} jours</button>`;
  if(state.dateMode==='tonight')return`<button class="time-chip selected">Ce soir · à partir de 18 h</button>`;
  const hour=new Date().getHours();
  const choices=state.dateMode==='now'
    ?[['2h','À partir de maintenant · 2 heures'],...(hour<18?[['afternoon_evening','Maintenant + la soirée']]:[['evening','Le reste de la soirée']])]
    :[['2h','2 heures'],['morning','Matinée'],['afternoon','Après-midi'],['afternoon_evening','Après-midi + soirée'],['evening','Soirée'],['day','Journée complète']];
  return `<div class="time-chip-grid">${choices.map(([id,label])=>`<button class="time-chip ${state.answers.duration===id?'selected':''}" onclick="selectDuration('${id}')">${label}</button>`).join('')}</div>`
}
function selectDuration(value){state.answers.duration=value;state.answers.budget=null;renderDate()}
function confirmDate(){if(tripDays()>1||state.dateMode==='weekend')state.answers.duration='stay';if(!state.answers.duration)return showToast('Choisissez votre créneau sur ce même écran');state.step=1;renderComposer()}
function setDestination(id){const d=DESTINATIONS[id];if(!d)return;state.location={name:d.name,lat:d.lat,lng:d.lng};state.radius=d.radius;renderDate()}
function setDate(mode){const now=new Date();state.dateMode=mode;let d=new Date(now);if(mode==='now')state.answers.duration=now.getHours()>=18?'evening':'afternoon_evening';if(mode==='tonight'){d.setHours(Math.max(18,now.getHours()),now.getMinutes(),0,0);state.answers.duration='evening'}if(mode==='tomorrow'){d.setDate(d.getDate()+1);d.setHours(9,0,0,0);state.answers.duration=null}if(mode==='weekend'){const add=(6-d.getDay()+7)%7;d.setDate(d.getDate()+add);d.setHours(9,0,0,0);state.answers.duration='stay'}state.dateStart=d;state.dateEnd=mode==='weekend'?new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,23,59):new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59);state.month=new Date(d.getFullYear(),d.getMonth(),1);renderDate()}
function calendar(){const y=state.month.getFullYear(),m=state.month.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,count=new Date(y,m+1,0).getDate();let cells='';for(let i=0;i<first;i++)cells+='<button class="cal-cell empty"></button>';for(let d=1;d<=count;d++){const date=new Date(y,m,d),selected=sameDay(date,state.dateStart)||sameDay(date,state.dateEnd),inRange=state.dateStart&&state.dateEnd&&date>state.dateStart&&date<state.dateEnd;cells+=`<button class="cal-cell ${selected?'selected':''} ${inRange?'in-range':''}" onclick="pickDate(${y},${m},${d})">${d}</button>`}const range=state.dateStart?`${fmt(state.dateStart)}${state.dateEnd&&!sameDay(state.dateStart,state.dateEnd)?` → ${fmt(state.dateEnd)} · ${tripDays()} jours`:''}`:'Choisissez une date';return `<div class="calendar"><div class="cal-head"><button onclick="moveMonth(-1)">←</button><div><b>${state.month.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</b><small>${range}</small></div><button onclick="moveMonth(1)">→</button></div><div class="cal-hint">Cliquez sur l’arrivée, puis sur le départ</div><div class="cal-days">${['L','M','M','J','V','S','D'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cal-grid">${cells}</div></div>`}
function moveMonth(n){state.month=new Date(state.month.getFullYear(),state.month.getMonth()+n,1);renderDate()}
function pickDate(y,m,d){const date=new Date(y,m,d);if(state.dateMode!=='custom'||!state.dateStart||!sameDay(state.dateStart,state.dateEnd)){state.dateStart=date;state.dateEnd=date;state.dateMode='custom';state.answers.duration=null}else if(date<state.dateStart){state.dateEnd=state.dateStart;state.dateStart=date}else{state.dateEnd=date;if(!sameDay(state.dateStart,state.dateEnd))state.answers.duration='stay'}renderDate()}
function tripDays(){if(!state.dateStart||!state.dateEnd)return 1;const start=Date.UTC(state.dateStart.getFullYear(),state.dateStart.getMonth(),state.dateStart.getDate()),end=Date.UTC(state.dateEnd.getFullYear(),state.dateEnd.getMonth(),state.dateEnd.getDate());return Math.max(1,Math.round((end-start)/86400000)+1)}

async function useLocation(){
  if(!navigator.geolocation)return showToast('La géolocalisation n’est pas disponible');
  showToast('Localisation en cours…');navigator.geolocation.getCurrentPosition(p=>{state.location={name:'Autour de vous',lat:p.coords.latitude,lng:p.coords.longitude};state.radius=18000;renderDate()},()=>showToast('Localisation non autorisée'),{timeout:5000,maximumAge:600000});
}

async function openExplorer(force=false){
  if(state.explorerLoading)return;
  if(state.allItems.length&&!force)return renderResults();
  state.explorerLoading=true;
  state.catalogAttempted=true;
  try{await compose(true)}finally{state.explorerLoading=false}
}

async function compose(explorerOnly=false){
  state.catalogAttempted=true;
  state.catalogSourceStatus={attempted:0,responded:0,failed:0};
  state.view='loading';app.innerHTML=shell(`<section class="loading"><div class="loading-card"><div class="loader"></div><span class="kicker">Concierge Dolcia</span><h2>Nous composons votre moment.</h2><p>Nous croisons vos envies, la date, la météo et les expériences réelles autour de ${esc(state.location.name)}.</p><div class="live-search"><div class="live-line"><span>Météo locale</span><b id="load-weather">En cours</b></div><div class="live-line"><span>Événements aux bonnes dates</span><b id="load-events">En cours</b></div><div class="live-line"><span>Lieux accordés à vos envies</span><b id="load-places">En cours</b></div><div class="live-preview" id="live-preview"></div></div></div></section>`,'compose');
  state.items=[]; const queries=queriesForVibes();
  try{
    const weather=`/api/weather?lat=${state.location.lat}&lng=${state.location.lng}`;
    const event=`/api/events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(new Date(state.dateEnd.getTime()+86400000))}&size=40`;
    const officialTouquet=`/api/touquet-events?after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const ticketmaster=`/api/ticketmaster-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const partners=`/api/partner-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const nationalTourism=`/api/datatourisme?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const majorMoments=`/api/major-events?date=${iso(state.dateStart)}&days=30&lat=${state.location.lat}&lng=${state.location.lng}`;
    const broadcastVenues=state.majorChoice?`/api/utils?action=broadcast-venues&event=${encodeURIComponent(state.majorChoice)}&lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}`:null;
    const get=async url=>{
      const tracksCatalog=!/\/api\/(weather|major-events)/.test(url);
      if(tracksCatalog)state.catalogSourceStatus.attempted+=1;
      try{
        const response=await fetch(url);
        if(!response.ok)throw new Error('source');
        const data=await response.json();
        if(tracksCatalog)state.catalogSourceStatus.responded+=1;
        return data;
      }catch(error){
        if(tracksCatalog)state.catalogSourceStatus.failed+=1;
        throw error;
      }
    };
    let retrievalPlan=queries.slice(0,24).map(query=>({query,radius:state.radius,scope:'local',reason:'LOCAL_FALLBACK'}));
    try{const planned=await fetch('/api/utils?action=retrieval-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({queries,duration:state.answers.duration,momentSentence:state.answers.momentSentence||'',widened:Boolean(state.catalogFilters?.widened),localRadius:state.radius})}).then(response=>response.json());if(planned.plan?.length)retrievalPlan=planned.plan}catch(_){}
    const placeQueries=retrievalPlan.map(entry=>({...entry,url:`/api/places?lat=${state.location.lat}&lng=${state.location.lng}&radius=${entry.radius}&mode=text&keyword=${encodeURIComponent(entry.query+' '+state.location.name)}`}));
    const weatherJob=get(weather).then(d=>{if(!d.error)state.weather=d;markLoaded('weather',d.error?'Indisponible':`${Math.round(d.main?.temp||0)}°`)}).catch(()=>markLoaded('weather','Indisponible'));
    const eventJob=get(event).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);markLoaded('events',`${found.length} trouvés`);updateLivePreview()}).catch(()=>markLoaded('events','Source au repos'));
    const officialJob=/Touquet|Opale/.test(state.location.name)?get(officialTouquet).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);markLoaded('events',`${found.length}+ officiels`);updateLivePreview()}).catch(()=>null):Promise.resolve();
    const ticketmasterJob=get(ticketmaster).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);updateLivePreview()}).catch(()=>null);
    const partnerJob=get(partners).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);if(found.length)markLoaded('events',`${found.length}+ partenaires`);updateLivePreview()}).catch(()=>null);
    const nationalJob=get(nationalTourism).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);if(found.length)markLoaded('events',`${found.length}+ offices de tourisme`);updateLivePreview()}).catch(()=>null);
    const majorJob=get(majorMoments).then(d=>{state.majorMoments=(d.events||[]).map(event=>({...event,kind:event.kind||'major_event',score:Number(event.score)||100}))}).catch(()=>{state.majorMoments=[]});
    const broadcastJob=broadcastVenues?get(broadcastVenues).then(d=>{state.broadcastVenues=d.venues||[]}).catch(()=>{state.broadcastVenues=[]}):Promise.resolve();
    let placesFound=0;
    const placeJobs=placeQueries.map(entry=>get(entry.url).then(d=>{const found=normalizePlaces(d.results||[]).map(item=>({...item,retrievalScope:entry.scope,retrievalReason:entry.reason,retrievalMaxKm:entry.radius/1000})).filter(retrievalBoundaryAccepts);placesFound+=found.length;state.items.push(...found);markLoaded('places',`${placesFound} trouvés${retrievalPlan.some(item=>item.scope==='signature')?' · exception régionale demandée':''}`);updateLivePreview()}).catch(()=>null));
    await Promise.allSettled([weatherJob,eventJob,officialJob,ticketmasterJob,partnerJob,nationalJob,majorJob,broadcastJob,...placeJobs]);
    state.majorMoments=detectMajorMoments(state.items,state.majorMoments);
    const deduped=dedupe(state.items);
    await enrichPlaceAvailability(deduped);
    state.allItems=(await rankItemsServer(deduped).catch(()=>scoreItems(deduped))).filter(geoVisible);
    injectDolciaAutonomousChoices();
    state.program=buildProgram(state.allItems);
    if(state.majorChoice)state.program=injectMajorMoment(state.program);
    state.alternatives=buildAlternatives(state.allItems);
    state.items=state.program.map(slot=>slot.item);
  }catch(_){/* L'état de repli reste volontairement non technique. */}
  // Le compagnon D reste disponible même si une source ou un enrichissement échoue.
  // Cette protection doit vivre hors du bloc réseau : aucun incident fournisseur ne
  // peut produire un écran vide lorsque Dolcia sait animer le moment localement.
  injectDolciaAutonomousChoices();
  if(!state.program.length&&state.allItems.length){
    state.program=buildProgram(state.allItems);
    state.alternatives=buildAlternatives(state.allItems);
    state.items=state.program.map(slot=>slot.item);
  }
  explorerOnly?renderResults():(state.majorChoice?renderSurprise():renderResults());
}
function markLoaded(key,text){const el=document.querySelector(`#load-${key}`);if(el){el.textContent=text;el.classList.add('done')}}
function updateLivePreview(){const el=document.querySelector('#live-preview');if(!el)return;el.innerHTML=dedupe(state.items).slice(0,3).map(i=>`<span>${esc(i.name)}</span>`).join('')}
function detectMajorMoments(items,seed=[]){const day=iso(state.dateStart),patterns=/coupe du monde|demi.?finale|finale|fête nationale|feu d.artifice|bal populaire|festival|carnaval|braderie|concert exceptionnel|cérémonie|défilé|inauguration|éclipse|eclipse|pluie d.étoiles|grandes marées|phénomène astronomique/i;const local=dedupe(items).filter(item=>item.date&&iso(new Date(item.date))===day&&item.official&&patterns.test(item.name||'')).map(item=>({...item,title:item.name,kind:item.kind||'local',score:80+(item.booking?5:0)}));return [...new Map([...seed,...local].map(item=>[`${(item.title||item.name||'').toLowerCase()}:${item.date}`,item])).values()].sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,4)}
function majorMomentPrompt(){const moment=state.majorMoments[0];if(!moment)return'';const chosen=state.majorChoice===moment.id,copy=majorMomentAction(moment),showVenues=chosen&&moment.broadcastable===true,venues=showVenues?(state.broadcastVenues.length?`<div class="broadcast-list">${state.broadcastVenues.map(venue=>`<div class="broadcast-place"><div><b>${esc(venue.name)}</b><span class="${venue.confirmation==='confirmed'?'confirmed':'to-confirm'}">${venue.confirmation==='confirmed'?'Diffusion confirmée':'Diffusion à confirmer'}${venue.distance!=null?` · ${venue.distance.toFixed(1)} km`:''}${venue.rating?` · Google ${venue.rating}/5`:''}</span></div><div>${venue.phone?`<a href="tel:${esc(venue.phone)}">Appeler</a>`:''}${venue.sourceUrl?`<a href="${esc(venue.sourceUrl)}" target="_blank" rel="noopener">Voir le lieu</a>`:''}</div></div>`).join('')}</div>`:'<div class="broadcast-empty"><b>Aucun lieu confirmé dans la destination.</b><span>Dolcia ne transforme pas un établissement probable en diffusion certaine.</span></div>'):'';return `<section class="major-moment"><span class="kicker">${esc(copy.eyebrow)}</span><div><h2>${esc(moment.title||moment.name)}</h2><p>${esc(majorMomentTiming(moment))}. ${esc(copy.description)}</p>${moment.safetyNote?`<p class="major-safety">${esc(moment.safetyNote)}</p>`:''}</div><div class="major-actions"><button class="primary" onclick="chooseMajorMoment('${esc(moment.id)}')">${chosen&&moment.broadcastable?'Actualiser les lieux':esc(copy.button)}</button><button class="secondary" onclick="dismissMajorMoment('${esc(moment.id)}')">Pas cette fois</button></div>${venues}${moment.sourceUrl?`<a class="major-source" href="${esc(moment.sourceUrl)}" target="_blank" rel="noopener">Vérifié par ${esc(moment.source||'la source officielle')}</a>`:''}</section>`}
async function chooseMajorMoment(id){const moment=state.majorMoments.find(item=>item.id===id);if(!moment)return;state.majorChoice=id;showToast(moment.kind==='astronomy'?'Dolcia prépare ce moment rare…':'Dolcia ajuste votre programme…');if(moment.broadcastable===true){try{const response=await fetch(`/api/utils?action=broadcast-venues&event=${encodeURIComponent(id)}&lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}`),data=await response.json();state.broadcastVenues=data.venues||[]}catch(_){state.broadcastVenues=[]}}else state.broadcastVenues=[];state.program=injectMajorMoment(state.program.length?state.program:buildProgram(state.allItems));state.items=state.program.map(slot=>slot.item);renderSurprise()}
function injectMajorMoment(program){const moment=state.majorMoments.find(item=>item.id===state.majorChoice);if(!moment)return program;const date=new Date(moment.date),hasTime=moment.timeKnown!==false,minutes=hasTime?date.getHours()*60+date.getMinutes():16*60,isAstronomy=moment.kind==='astronomy',item={id:moment.id,name:moment.title||moment.name,source:moment.source||'Source officielle',sourceUrl:moment.sourceUrl||'',category:isAstronomy?'outside':'night',date:moment.date,address:isAstronomy?(moment.visibilityLabel||state.location.name):(moment.broadcastable?'Lieu de diffusion à choisir':state.location.name),official:true,timeKnown:hasTime,summary:isAstronomy?`${moment.summary||moment.stage||'Phénomène naturel vérifié'}. L’horaire local précis devra être confirmé avant le jour J.${moment.safetyNote?` ${moment.safetyNote}`:''}`:`${moment.stage||'Grand rendez-vous'}${hasTime?` confirmé à ${date.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`:''}.`,quality:hasTime?'official':'official-partial'};let closest=-1,distance=Infinity;program.forEach((entry,index)=>{const match=entry.label.match(/(\d{2}):(\d{2})/);if(!match)return;const value=Number(match[1])*60+Number(match[2]),delta=Math.abs(value-minutes);if(delta<distance){distance=delta;closest=index}});const label=hasTime?`${date.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · Le grand rendez-vous`:`À préciser · ${isAstronomy?'Le phénomène du jour':'Le grand rendez-vous'}`,slot={label,item};if(closest>=0){const copy=[...program];copy[closest]=slot;return copy.sort((a,b)=>slotMinutes(a.label)-slotMinutes(b.label))}return [...program,slot].sort((a,b)=>slotMinutes(a.label)-slotMinutes(b.label))}
function slotMinutes(label){const match=label.match(/(\d{2}):(\d{2})/);return match?Number(match[1])*60+Number(match[2]):0}
function dismissMajorMoment(id){state.majorMoments=state.majorMoments.filter(item=>item.id!==id);renderResults()}
function queriesForVibes(){
  const selectedMap={
    play:['parc attractions parc à thème','bowling','laser game','escape game','karting','trampoline park','réalité virtuelle','paintball mini golf'],
    breathe:['plage balade nature jardin','accrobranche parcours aventure','réserve naturelle paysage','sports nautiques voile surf paddle kayak','golf vélo escalade'],
    create:['atelier créatif cours stage','concert spectacle théâtre cinéma','musée exposition patrimoine','visite guidée'],
    taste:['restaurant','brunch salon de thé','gastronomie dégustation marché'],
    recharge:['spa thalasso bien-être','massage yoga détente'],
    vibrate:['concert bar soirée','casino cabaret club','festival fête locale spectacle']
  };
  const broad=[
    'restaurants cafés brunch gastronomie','parcs jardins plages réserves naturelles','animations famille enfants aire de jeux',
    'parc attractions parc de loisirs parc à thème','bowling','laser game','escape game','karting circuit',
    'trampoline park parc indoor','réalité virtuelle jeux immersifs','accrobranche parcours aventure','paintball airsoft',
    'mini golf golf practice','escalade salle bloc','base nautique location matériel','char à voile','wing foil kite surf foil','voile catamaran dériveur location','surf paddle kayak location',
    'tennis location court réservation','padel squash badminton location terrain','équitation poney centre équestre',
    'piscine centre aquatique aquapark','zoo aquarium ferme pédagogique','musées expositions monuments patrimoine',
    'cinéma théâtre spectacle concert','ateliers stages cours créatifs','marchés brocantes fêtes locales','spa thalasso bien-être',
    'casino cabaret club soirée'
  ];
  const selected=(state.answers.vibes||[]).flatMap(v=>selectedMap[v]||[]);
  const temperature=state.weather?.main?.temp;
  if(temperature>=25)selected.unshift('base nautique location','char à voile','wing foil kite surf','surf paddle kayak','centre aquatique piscine');
  if(['day','stay','afternoon_evening'].includes(state.answers.duration))selected.push('concert spectacle soirée casino bar');
  if(state.answers.duration==='stay'){const lodging={family:'hôtel familial piscine',sea:'hôtel vue mer',character:'hôtel de charme',simple:'hôtel central bien placé'}[state.answers.lodging]||'hôtels hébergements résidences de tourisme';selected.unshift(lodging)}
  if(state.answers.who==='family'&&state.answers.familyRhythm==='balanced')selected.unshift('atelier enfants encadré club enfants','spa massage parents proche activité enfants','activité parents enfants même lieu');
  return [...new Set([...selected,...broad])];
}
function normalizePlaces(items){return items.map((p,i)=>{const photos=(p.photos||[]).map(x=>`/api/photo?ref=${encodeURIComponent(x.photo_reference)}&maxwidth=1200`),types=p.types||[],placeText=`${p.name||''} ${types.join(' ')}`.toLowerCase(),business=/restaurant|cafe|bar|lodging|campground|store|office|spa|school|travel_agency|tourist_information/.test(placeText),naturalType=types.some(type=>['beach','park','natural_feature','hiking_area','national_park'].includes(type)),naturalName=/^(plage|beach|parc|jardin|promenade|sentier)(\b|\s)/i.test(String(p.name||'').trim()),freeAccess=!business&&(naturalType||naturalName),experienceKind=/aquarium/.test(placeText)?'aquarium':/parc.*attraction|theme.?park|labyrinthe|labyparc|bagatelle/.test(placeText)?'theme_park':/foil|kitesurf|surf|paddle|kayak|voile|catamaran|nautique|aquatique/.test(placeText)?'water':/reserve naturelle|plage|promenade|sentier|hiking|natural_feature/.test(placeText)?'nature':/restaurant|cafe|food/.test(placeText)?'food':category(placeText);return {id:'g-'+(p.place_id||i),placeId:p.place_id,name:p.name,source:'Google Places',category:category(placeText),experienceKind,address:p.formatted_address||p.vicinity||'',lat:p.geometry?.location?.lat,lng:p.geometry?.location?.lng,rating:p.rating,reviews:p.user_ratings_total,price:p.price_level,freeAccess,isOpen:p.opening_hours?.open_now,businessStatus:p.business_status,photo:photos[0]||null,photos,booking:null,types}})}
async function enrichPlaceAvailability(items){
  const evening=['evening','afternoon_evening'].includes(state.answers.duration),priority=item=>(item.retrievalScope==='signature'?45:0)+(evening&&['food','night','culture','slow','outside'].includes(item.category)?30:0);
  const candidates=items.filter(item=>item.source==='Google Places'&&item.placeId).sort((a,b)=>priority(b)-priority(a)||(b.rating||0)-(a.rating||0)||(b.reviews||0)-(a.reviews||0)).slice(0,60);
  let cursor=0;
  const worker=async()=>{while(cursor<candidates.length){const item=candidates[cursor++];try{const response=await fetch(`/api/place-details?id=${encodeURIComponent(item.placeId)}`),details=await response.json();if(!details.verified)continue;item.openingPeriods=details.openingPeriods||[];item.hours=details.hours||[];item.detailsKnown=true;item.phone=details.phone||null;item.website=details.website||null;item.booking=details.website||item.booking;item.businessStatus=details.businessStatus||item.businessStatus;item.types=details.types||[];if(details.photos?.length){item.photos=details.photos;item.photo=details.photos[0]}}catch(_){item.detailsKnown=false}}};
  await Promise.all(Array.from({length:Math.min(8,candidates.length)},worker));
}
function normalizeEvents(items){return items.map((e,i)=>({id:'e-'+(e.uid||e.id||i),name:typeof e.title==='object'?(e.title.fr||Object.values(e.title)[0]):e.title,source:e.source||'OpenAgenda',category:category(`${e.type||''} ${typeof e.title==='object'?JSON.stringify(e.title):e.title}`),address:e.address||e.location||'',lat:e.lat??e.latitude,lng:e.lng??e.longitude,date:e.date,endDate:e.endDate||null,timeKnown:e.timeKnown!==false&&/T\d{2}:\d{2}/.test(e.date||''),photo:typeof e.image==='string'?e.image:(e.image?.base||e.thumbnail),booking:e.registrationUrl,free:e.free,priceLabel:e.priceLabel,official:e.official,partner:e.partner,sponsored:e.sponsored,sponsorshipTier:e.sponsorshipTier,programId:e.programId||e.program_id||null,programTitle:e.programTitle||null,audience:e.audience||null,description:e.description||'',establishmentId:e.establishmentId||e.establishment_id||null,checkedAt:e.checkedAt||e.checked_at||null}))}
function plainText(text=''){return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function isCivicBuilding(text=''){
  const t=plainText(text).replace(/[_-]+/g,' ');
  return /\b(hotel de ville|mairie|city hall|town hall|municipal building|municipal office|local government office|civic center|civic centre|rathaus|ayuntamiento|municipio|municipalidad|prefeitura|prefectura|stadhuis|gemeentehuis|radhus|raadhuis|palazzo comunale|casa comunale|comune di|camara municipal|hotel communal|maison communale)\b/.test(t);
}
function isLodgingText(text=''){
  const t=plainText(text);
  if(isCivicBuilding(t)||/visite guidee|visite de l.hotel|histoire et architecture|monument|musee/.test(t))return false;
  return /\b(lodging|hotel|hostel|motel|resort|campground|camping|chambre d.hote|bed and breakfast|residence de tourisme|village vacances|hebergement)\b/.test(t);
}
function category(text=''){const t=plainText(text);if(isLodgingText(t))return'hotel';if(/feu d.artifice|bal populaire|concert|spectacle|soiree/.test(t))return'night';if(/restaurant|cafe|food|gastr/.test(t))return'food';if(/museum|musee|art|cinema|theater|theatre|culture|expo|visite|patrimoine|hotel de ville|mairie/.test(t))return'culture';if(/spa|beauty|yoga|bien/.test(t))return'slow';if(/bar|night|music/.test(t))return'night';if(/park|parc|nature|plage|garden|foret/.test(t))return'outside';return'active'}
function dedupe(items){const seen=new Map();return items.filter(x=>{const name=(x.name||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();const date=x.date?iso(new Date(x.date)):'';const k=`${name}:${date}`;if(!name)return false;const previous=seen.get(k);if(previous){previous.sources=[...new Set([...(previous.sources||[previous.source]),x.source].filter(Boolean))];return false}x.sources=[x.source].filter(Boolean);seen.set(k,x);return true})}
function qualityGate(item){if(!item?.name)return false;if(item.category==='hotel'&&!isLodgingText(`${item.name||''} ${item.address||''}`))return false;if(item.source==='Google Places')return Boolean(item.placeId&&item.address&&item.lat!=null&&item.lng!=null&&item.businessStatus!=='CLOSED_PERMANENTLY');if(item.date){const date=new Date(item.date);if(Number.isNaN(date.getTime()))return false;return Boolean(item.source&&(item.address||item.booking||item.official))}return Boolean(item.address&&item.source)}
function qualityLevel(item){if(item.source==='Google Places'&&item.address&&item.placeId&&item.photos?.length)return'verified';if(item.official&&item.date&&item.address&&item.booking)return'verified';if(item.official&&item.date&&(item.address||item.booking))return'official-partial';return'documented'}
function itemImage(i){return i.photo||IMAGES[i.category]||IMAGES.fallback}
function distanceKm(a,b,c,d){const R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,q=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function retrievalBoundaryAccepts(item){if(!Number.isFinite(item.lat)||!Number.isFinite(item.lng))return false;const distance=distanceKm(state.location.lat,state.location.lng,item.lat,item.lng),maximum=Math.min(item.retrievalMaxKm||state.radius/1000,item.retrievalScope==='signature'?60:25);item.distance=distance;return distance<=maximum}
// Un restaurant, un hôtel ou une sortie nocturne existe déjà en abondance dans la ville : le vrai
// critère n'est PAS la distance, c'est la commune. Cucq est à 2km du Touquet mais reste une autre
// ville — proposer un restaurant là-bas n'a pas plus de sens qu'à 10km. Pour food/night, on exige
// donc que la commune réelle corresponde à la destination (destinationLocalityMatch), quelle que
// soit la distance. Les hôtels restent sur la logique distance + élargissement sur demande, car un
// hôtel hors ville reste une vraie option quand aucun n'est disponible dans le budget en ville.
const ABUNDANT_LOCAL_CATEGORIES=['food','hotel','night'];
const STRICT_LOCALITY_CATEGORIES=['food','night'];
const WIDEN_ELIGIBLE_CATEGORIES=['hotel'];
function withinAbundantLocalReach(item){
  if(!ABUNDANT_LOCAL_CATEGORIES.includes(item.category))return true;
  if(STRICT_LOCALITY_CATEGORIES.includes(item.category)){
    const match=item.geoEligibility?.destinationLocalityMatch;
    if(match===false)return false;
    if(match==null&&item.distance!=null&&item.distance>5)return false;
    return true;
  }
  if(item.geoEligibility?.status==='extended')return true;
  const widened=WIDEN_ELIGIBLE_CATEGORIES.includes(item.category)&&Boolean(state.catalogFilters?.abundantWidened?.[item.category]);
  const cap=widened?20:5;
  return item.distance==null||item.distance<=cap;
}
// Vrai seulement si : la catégorie est éligible à l'élargissement (hôtels uniquement), la personne
// a un budget précis, aucune option locale (≤5km) ne le respecte, et une option plus loin le
// respecterait — donc élargir servirait réellement à quelque chose. Jamais pour food/night.
function localAbundanceBudgetGap(category){
  if(!WIDEN_ELIGIBLE_CATEGORIES.includes(category))return false;
  if(!state.answers.budget||state.answers.budget==='flexible'||state.answers.budget==='free')return false;
  if(state.catalogFilters?.abundantWidened?.[category])return false;
  const compatible=item=>!['exceptional','unknown'].includes(itemBudgetBand(item));
  const local=state.allItems.some(item=>item.category===category&&item.geoEligibility?.premium_eligible===true&&(item.distance==null||item.distance<=5)&&compatible(item));
  if(local)return false;
  return state.allItems.some(item=>item.category===category&&item.geoEligibility?.premium_eligible===true&&item.distance!=null&&item.distance>5&&item.distance<=20&&compatible(item));
}
function confirmWidenAbundant(category){
  if(!WIDEN_ELIGIBLE_CATEGORIES.includes(category))return;
  state.catalogFilters=state.catalogFilters||{};
  state.catalogFilters.abundantWidened=state.catalogFilters.abundantWidened||{};
  state.catalogFilters.abundantWidened[category]=true;
  if(state.radius<20000)state.radius=20000;
  save();
  showToast('Recherche élargie aux environs pour cette catégorie uniquement');
  compose(true);
}
function declineWidenAbundant(category){
  state.catalogFilters=state.catalogFilters||{};
  state.catalogFilters.abundantWidenDeclined=state.catalogFilters.abundantWidenDeclined||{};
  state.catalogFilters.abundantWidenDeclined[category]=true;
  save();
  renderResults();
}
function abundantWidenPrompt(category){
  if(state.catalogFilters?.abundantWidenDeclined?.[category])return'';
  if(!localAbundanceBudgetGap(category))return'';
  const label=category==='hotel'?'hôtel':category==='night'?'sortie':'restaurant';
  return `<div class="widen-prompt"><strong>Aucun ${label} à votre budget n'est disponible à ${esc(state.location.name)}.</strong><p>Souhaitez-vous élargir la recherche aux environs pour cette catégorie ?</p><div><button onclick="confirmWidenAbundant('${category}')">Oui, élargir</button><button onclick="declineWidenAbundant('${category}')">Non, je reste à ${esc(state.location.name)}</button></div></div>`;
}
function geoVisible(item){return item.geoEligibility?.premium_eligible===true&&['core','extended'].includes(item.geoEligibility?.status)&&withinAbundantLocalReach(item)}
function geoCore(item){return item.geoEligibility?.premium_eligible===true&&item.geoEligibility?.status==='core'}
async function rankItemsServer(items){
  const payload={context:{lat:state.location.lat,lng:state.location.lng,locationName:state.location.name,radiusKm:state.radius/1000,start:state.dateStart.toISOString(),end:state.dateEnd.toISOString(),pilot:state.location.name==='Le Touquet-Paris-Plage'?'touquet':'other',who:state.answers.who,groupDetail:state.answers.groupDetail||'',childrenAges:state.answers.childrenAges||[],momentSentence:state.answers.momentSentence||'',duration:state.answers.duration,dateMode:state.dateMode,budget:state.answers.budget,budgetAmount:state.budgetPlan.amount,groupSize:currentGroupSize(),groupProfiles:currentGroupProfiles(),vibes:state.answers.vibes||[],temperature:state.weather?.main?.temp??18,weather:(state.weather?.weather?.[0]?.main||''),animal:Boolean(state.answers.animal)},memory:{favorites:state.favorites,feedback:state.feedback,tasteProfile:state.tasteProfile},items};
  const response=await fetch('/api/events?service=recommendations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!response.ok)throw new Error('ranking unavailable');
  const data=await response.json();
  return Array.isArray(data.items)?data.items:[];
}
function currentGroupSize(){const active=state.groupParticipants.filter(person=>person.selected!==false);if(active.length>1)return active.length;return state.answers.who==='family'?Math.max(3,1+(state.answers.childrenAges||[]).length):state.answers.who==='couple'?2:['friends','colleagues'].includes(state.answers.who)?4:1}
function estimateItemCost(item){if(item.free||item.price===0||item.freeAccess)return{total:0,known:true,label:'Gratuit confirmé'};const explicit=String(item.priceLabel||'').match(/(\d+(?:[,.]\d{1,2})?)\s*€/);if(explicit){const unit=Number(explicit[1].replace(',','.'));return{total:Math.round(unit*currentGroupSize()),known:true,label:`${unit.toLocaleString('fr-FR')} € par personne`}}const levels={0:0,1:15,2:35,3:70,4:120};if(item.price!=null){const unit=levels[Math.min(4,Number(item.price))]??35;return{total:Math.round(unit*currentGroupSize()),known:false,label:'Estimation Dolcia'}}return{total:0,known:false,label:'Tarif à confirmer'} }
function itemBudgetBand(item){if(item.budgetBand)return item.budgetBand;const estimate=estimateItemCost(item),amount=state.budgetPlan.amount;if(estimate.known&&estimate.total===0)return'free';if(!estimate.known||amount==null)return'unknown';const ratio=estimate.total/Math.max(1,amount);return ratio<=.12?'light':ratio<=.3?'balanced':ratio<=.55?'signature':'exceptional'}
function budgetBandLabel(item){return({free:'Libre ou gratuit',light:'Plaisir léger',balanced:'Équilibre choisi',signature:'Moment signature',exceptional:'Exception assumée',unknown:'Prix à confirmer'})[itemBudgetBand(item)]}
function programEmotion(item,index,total){const kind=experienceKind(item);if(index===0)return'L’élan';if(index===total-1)return'Le souvenir';if(kind==='food')return'La respiration';if(kind==='wellness')return'Le relâchement';if(kind==='event'||item.official)return'Le temps fort';if(item.discoveryPick||item.distanceMerit==='proven_rarity')return'L’inattendu maîtrisé';return'La découverte'}
function programArcPanel(){if(!state.program.length)return'';return`<aside class="program-arc"><div class="program-arc-title"><span>La courbe de votre moment</span><strong>Pas une succession d’adresses.<br>Une expérience que vous dirigez.</strong><p>Dolcia repère les changements d’énergie et de dépense, puis vous propose les arbitrages utiles. Elle ne choisit jamais le rythme à votre place.</p></div><div class="program-arc-line">${state.program.map((slot,index)=>{const item=slot.item,band=itemBudgetBand(item),travel=item.geoEligibility?.travel_minutes;return`<article class="arc-${band}"><i></i><small>${esc(slot.label.split('·')[0].trim())}</small><b>${programEmotion(item,index,state.program.length)}</b><span>${budgetBandLabel(item)}${travel!=null?` · ${travel} min`:''}</span></article>`}).join('')}</div></aside>`}
function programBudgetPanel(){const amount=state.budgetPlan.amount;if(amount==null)return`<aside class="budget-orchestra"><div><span>Budget du groupe</span><strong>Priorité à l’expérience</strong></div><button onclick="openBudgetEditor()">Définir une enveloppe</button></aside>`;const costs=state.program.map(slot=>estimateItemCost(slot.item)),documented=costs.filter(cost=>cost.known).reduce((sum,cost)=>sum+cost.total,0),estimated=costs.filter(cost=>!cost.known&&cost.total>0).reduce((sum,cost)=>sum+cost.total,0),remaining=amount-documented-estimated;return`<aside class="budget-orchestra ${remaining<0?'over':''}"><div><span>Enveloppe totale du groupe</span><strong>${amount.toLocaleString('fr-FR')} €</strong><small>${currentGroupSize()} personne${currentGroupSize()>1?'s':''} · ${tripDays()} jour${tripDays()>1?'s':''}</small></div><div><span>Prix documentés</span><strong>${documented.toLocaleString('fr-FR')} €</strong><small>Confirmés par les sources</small></div><div><span>Estimations prudentes</span><strong>${estimated?estimated.toLocaleString('fr-FR')+' €':'—'}</strong><small>Jamais présentées comme un prix certain</small></div><div><span>${remaining<0?'Dépassement estimé':'Budget restant estimé'}</span><strong>${Math.abs(remaining).toLocaleString('fr-FR')} €</strong><small>${remaining<0?'Dolcia doit recomposer':'Disponible pour enrichir le moment'}</small></div><button onclick="openBudgetEditor()">Ajuster</button></aside>`}
function openBudgetEditor(){document.body.insertAdjacentHTML('beforeend',`<div class="modal budget-editor" id="budgetEditor"><article><button class="close" onclick="document.querySelector('#budgetEditor')?.remove()">×</button><span class="kicker">Votre enveloppe réelle</span><h2>Combien souhaitez-vous consacrer à tout le moment ?</h2><label>Budget total du groupe<input id="budgetAmount" type="number" min="0" step="10" value="${state.budgetPlan.amount??''}" placeholder="Ex. 300"></label><label>Marge exceptionnelle autorisée<select id="budgetMargin"><option value="0">Aucun dépassement</option><option value="10" ${state.budgetPlan.margin===10?'selected':''}>Jusqu’à 10 % si cela vaut vraiment le coup</option><option value="20" ${state.budgetPlan.margin===20?'selected':''}>Jusqu’à 20 % après confirmation</option></select></label><div class="budget-checks"><label><input id="budgetMeals" type="checkbox" ${state.budgetPlan.includesMeals?'checked':''}> Repas inclus</label><label><input id="budgetStay" type="checkbox" ${state.budgetPlan.includesStay?'checked':''}> Hébergement inclus</label><label><input id="budgetTransport" type="checkbox" ${state.budgetPlan.includesTransport?'checked':''}> Transport inclus</label></div><button class="primary" onclick="saveBudgetPlan()">Recomposer dans cette enveloppe</button></article></div>`) }
function saveBudgetPlan(){const amount=Number(document.querySelector('#budgetAmount')?.value);if(!Number.isFinite(amount)||amount<0)return showToast('Indiquez un budget total valide');state.budgetPlan={amount,margin:Number(document.querySelector('#budgetMargin')?.value||0),includesMeals:Boolean(document.querySelector('#budgetMeals')?.checked),includesStay:Boolean(document.querySelector('#budgetStay')?.checked),includesTransport:Boolean(document.querySelector('#budgetTransport')?.checked)};state.answers.budget=amount===0?'free':'custom';save();document.querySelector('#budgetEditor')?.remove();refreshRecommendations()}
function scoreItems(items){
  const temp=state.weather?.main?.temp??18,cond=(state.weather?.weather?.[0]?.main||'').toLowerCase(),vibes=state.answers.vibes||[],who=state.answers.who;
  const budget=state.answers.budget;
  return items.filter(i=>{
    if(!qualityGate(i))return false;
    if(i.source==='Google Places'&&(!i.placeId||!i.address||i.lat==null||i.lng==null||i.businessStatus==='CLOSED_PERMANENTLY'))return false;
    if(i.lat!=null&&i.lng!=null){
      const km=distanceKm(state.location.lat,state.location.lng,i.lat,i.lng);
      if(km>state.radius/1000)return false;
    }
    const addressText=`${i.address||''} ${i.name||''}`.toLowerCase();
    if(state.location.name==='Le Touquet-Paris-Plage'&&/\bcalais\b|\bboulogne-sur-mer\b|\bdunkerque\b/.test(addressText))return false;
    const activityText=`${i.name||''} ${i.address||''}`.toLowerCase();
    if(/chien|chiens|canin|dog park|dog beach/.test(activityText))return false;
    if(['family','friends'].includes(who)&&/golf/.test(activityText)&&/compétition|competition|championnat|trophée|trophee|coupe/.test(activityText))return false;
    if(i.source!=='Google Places'){
      if(!i.date)return false;
      const day=iso(new Date(i.date));
      if(day<iso(state.dateStart)||day>iso(state.dateEnd))return false;
    }
    const isOfficialHighlight=i.official&&i.date&&iso(new Date(i.date))===iso(state.dateStart)&&/feu d.artifice|bal populaire|fête nationale/.test(activityText);
    /* Les envies ordonnent le catalogue ; elles ne doivent jamais supprimer toutes les autres possibilités pertinentes. */
    if(budget==='free')return i.free||i.price===0||i.freeAccess;
    if(budget==='budget1'&&i.price!=null)return i.price<=1;
    if(budget==='budget2'&&i.price!=null)return i.price<=2;
    if(budget==='budget3'&&i.price!=null)return i.price<=3;
    if(budget==='custom'&&state.budgetPlan.amount!=null){const estimate=estimateItemCost(i);if(estimate.known&&estimate.total>state.budgetPlan.amount*(1+(state.budgetPlan.margin||0)/100))return false}
    return true;
  }).map(i=>{
    const text=(i.name||'').toLowerCase(),distance=i.lat&&i.lng?distanceKm(state.location.lat,state.location.lng,i.lat,i.lng):null;let score=50;
    if(matchesIntentions(i,vibes))score+=24;if(i.source==='OpenAgenda')score+=18;if(i.rating>=4.5)score+=12;if(i.reviews>100)score+=5;if(i.isOpen===true)score+=10;if(distance!==null&&distance<3)score+=8;
    if(i.official)score+=35;
    if(i.date&&iso(new Date(i.date))===iso(state.dateStart))score+=30;
    if(temp>=25&&/paddle|surf|voile|foil|kite|kayak|plage|nautique|aquatique|piscine/.test(text))score+=42;if(temp>=25&&['outside','slow'].includes(i.category))score+=12;
    if(/rain|drizzle|thunder|snow/.test(cond)){if(['culture','slow','food'].includes(i.category))score+=22;if(i.category==='outside')score-=15}
    if((state.dateMode==='tonight'||state.answers.duration==='evening')&&['food','night','culture'].includes(i.category))score+=14;
    if(state.answers.duration==='morning'&&['food','outside','active'].includes(i.category))score+=10;
    if(state.answers.duration==='afternoon'&&['outside','culture','active','slow'].includes(i.category))score+=10;
    if(who==='family'&&['outside','active'].includes(i.category))score+=12;
    if(who==='family'&&vibes.includes('recharge')&&['outside','slow'].includes(i.category))score+=24;
    if(budget==='budget1'&&i.price===1)score+=12;
    if(budget==='budget2'&&i.price===2)score+=14;
    if(budget==='budget3'&&i.price>=2)score+=16;
    if(state.answers.duration==='stay'&&i.category==='hotel')score+=32;
    if(budget==='custom'&&state.budgetPlan.amount!=null){const estimate=estimateItemCost(i);if(!estimate.known)score-=5;else if(estimate.total===0)score+=3}
    if(budget==='flexible'){
      if(i.rating>=4.6&&i.reviews>100)score+=10;
    }
    if(state.favorites.includes(i.id))score+=20;
    if(state.feedback[i.id]==='like')score+=18;if(state.feedback[i.id]==='dislike')score-=30;
    score+=(state.tasteProfile[i.category]||0)*4;
    if(state.experienceFeelings[i.id])score+=(feelingWeight(state.experienceFeelings[i.id])||0)*5;
    return {...i,score,distance,quality:qualityLevel(i),budgetBand:itemBudgetBand(i)};
  }).sort((a,b)=>(b.score-a.score)||(Number(b.sponsored)-Number(a.sponsored)))
}

function matchesIntentions(item,intentions){
  const text=`${item.name||''} ${item.category||''}`.toLowerCase();
  const rules={
    play:/active|parc|attraction|bowling|karting|laser|escape|trampoline|virtuelle|paintball|mini.?golf/,
    breathe:/outside|plage|nature|jardin|forêt|balade|accrobranche|réserve|nautique|voile|surf|paddle|kayak|équitation|vélo/,
    create:/culture|atelier|cours|stage|spectacle|cinéma|musée|exposition|visite|patrimoine/,
    taste:/food|restaurant|brunch|gastronomie|café|marché|dégustation/,
    recharge:/slow|spa|thalasso|massage|yoga|bien-être/,
    vibrate:/night|bar|soirée|casino|cabaret|club|concert|festival|fête|feu d.artifice/
  };
  return intentions.some(intent=>rules[intent]?.test(text));
}

function buildProgram(pool, excludedIds=[]){
  const available=pool.filter(item=>!excludedIds.includes(item.id)&&item.geoEligibility?.premium_eligible!==false&&!(item.ranking?.groupFit?.vetoes>0));
  const used=new Set(), usedKinds=new Set(), slots=[],dayLoads=new Map();
  const wanted=programTemplates();
  for(const [label,categories] of wanted){
    let candidates=available.filter(item=>!used.has(item.id)&&categories.includes(item.category)&&isTimeCompatible(item,label)&&(state.answers.duration==='stay'||!usedKinds.has(experienceKind(item))||experienceKind(item)==='event'));
    const previousBand=slots.length?itemBudgetBand(slots[slots.length-1].item):null,previousEnergy=slots.length?experienceEnergy(slots[slots.length-1].item):null;
    const day=programDayNumber(label),rhythmContext={day,currentDayLoad:dayLoads.get(day)||0,previousDayLoad:day>1?(dayLoads.get(day-1)||0):0};
    candidates.sort((a,b)=>programBalanceScore(b,label,previousBand,previousEnergy,rhythmContext)-programBalanceScore(a,label,previousBand,previousEnergy,rhythmContext));
    const item=candidates[0];
    if(item){used.add(item.id);usedKinds.add(experienceKind(item));slots.push({label,item});if(day)dayLoads.set(day,(dayLoads.get(day)||0)+energyLoad(item))}
  }
  const vibes=state.answers.vibes||[];
  if(slots.length>=3&&vibes.length){
    const target=slots.findIndex((slot,index)=>index>0&&index<slots.length-1&&slot.item.category!=='hotel'&&slot.item.category!=='food');
    if(target>=0){const current=slots[target],[label,categories]=wanted.find(([candidateLabel])=>candidateLabel===current.label)||[];const discovery=available.filter(item=>!used.has(item.id)&&categories?.includes(item.category)&&isTimeCompatible(item,label)&&!matchesIntentions(item,vibes)&&((item.rating>=4.5&&item.reviews>=30)||item.official)).sort((a,b)=>slotScore(b,label)-slotScore(a,label))[0];if(discovery&&slotScore(discovery,label)>=slotScore(current.item,label)-12)slots[target]={label,item:{...discovery,discoveryPick:true}}}
  }
  return slots;
}

function programBalanceScore(item,label,previousBand,previousEnergy=null,rhythmContext={}){let score=slotScore(item,label),band=itemBudgetBand(item),energy=experienceEnergy(item),energyChoice=state.programPreferences.energy,diningChoice=state.programPreferences.dining;
  /* Aucun contraste n'est imposé : ces pondérations n'existent qu'après un choix explicite du groupe. */
  if(energyChoice==='continue'){if(energy==='high')score+=30;if(energy==='soft')score-=10}
  if(energyChoice==='contrast'){if(energy==='soft')score+=24;if(energy==='high')score-=18}
  if(energyChoice==='recover'){if(energy==='soft')score+=34;if(energy==='high')score-=34}
  if(/Dîner/.test(label)){
    if(diningChoice==='signature'&&['signature','exceptional'].includes(band))score+=30;
    if(diningChoice==='light'&&['light','balanced'].includes(band))score+=26;
    if(diningChoice==='budget'&&['free','light'].includes(band))score+=32;
    if(diningChoice==='delivery'&&experienceKind(item)==='food'&&/livraison|livrer|a emporter|take.?away|room service/.test(plainText(`${item.name||''} ${(item.types||[]).join(' ')}`)))score+=44;
  }
  const rhythm=state.answers.stayRhythm||'adaptive';
  if(state.answers.duration==='stay'&&rhythm==='sport'&&energy==='high')score+=20;
  if(state.answers.duration==='stay'&&rhythm==='rest'){if(energy==='soft')score+=26;if(energy==='high')score-=28}
  if(item.distanceMerit==='proven_rarity')score+=8;if(item.distanceMerit==='ordinary')score-=22;return score}

function experienceKind(item){const t=`${item.name||''} ${item.category||''}`.toLowerCase();if(/golf|tennis|padel|sport/.test(t))return'sport';if(/restaurant|brunch|café|food/.test(t))return'food';if(/concert|spectacle|festival|fête|feu d.artifice|atelier|exposition/.test(t))return'event';if(/spa|massage|thalasso|yoga/.test(t))return'wellness';if(/plage|voile|foil|surf|paddle|kayak|nautique|aquatique/.test(t))return'water';if(/parc|bowling|laser|escape|karting/.test(t))return'play';return item.category||'other'}
function experienceEnergy(item){const t=plainText(`${item.name||''} ${item.category||''}`);if(/karting|laser|paintball|accrobranche|trampoline|surf|foil|kite|char a voile|tennis|padel|squash|badminton|golf|sport|escalade|velo|kayak|parc d.attraction/.test(t))return'high';if(/spa|massage|thalasso|yoga|balade|jardin|musee|exposition|plage|restaurant|brunch|cafe|degustation|cinema/.test(t))return'soft';return'medium'}
function energyLoad(item){return {soft:1,medium:2,high:3}[experienceEnergy(item)]||2}
function programDayNumber(label){const match=String(label||'').match(/Jour\s+(\d+)/i);return match?Number(match[1]):0}
function inferStayRhythm(){const sentence=plainText(state.answers.momentSentence||'');if(/semaine sportive|stage sportif|sport tous les jours|vacances sportives/.test(sentence))return'sport';if(/repos|recuper|prendre notre temps|sans courir/.test(sentence))return'balanced';return'adaptive'}
function groupRecoveryPressure(){const profiles=currentGroupProfiles(),tired=profiles.filter(person=>person.energy==='Douce'||person.momentNeed==='Souffler').length;return profiles.length?tired/profiles.length:0}
function wantsSustainedEnergy(){const sentence=plainText(state.answers.momentSentence||''),vibes=state.answers.vibes||[];return state.answers.stayRhythm==='sport'||/journee sportive|sport toute la journee|semaine sportive|sport tous les jours|a fond|sans pause|challenge sportif/.test(sentence)||(vibes.length===1&&vibes[0]==='play'&&state.answers.groupDetail==='lively')}

function buildAlternatives(pool){
  return programTemplates().map(([label,categories])=>{
    let candidates=pool.filter(item=>categories.includes(item.category)&&isTimeCompatible(item,label));
    candidates.sort((a,b)=>slotScore(b,label)-slotScore(a,label));
    return {label,items:candidates.slice(0,12),total:candidates.length};
  }).filter(group=>group.items.length);
}

function requiresPublishedSession(item){return /cinema|cinéma|theatre|théâtre|spectacle|visite guidee|visite guidée|atelier|cours|stage|excursion|croisiere|croisière|e.?foil|wing.?foil|kite|surf|char à voile|char a voile|paddle|kayak|catamaran|voile|tennis|padel|squash|badminton|golf|piscine|spa|massage|thalasso|escape game|laser game|bowling|location|école|ecole/.test(`${item.name||''} ${(item.types||[]).join(' ')}`.toLowerCase())}
function requestedMomentLabel(){const date=new Date(state.dateStart),hours=String(date.getHours()).padStart(2,'0'),minutes=String(date.getMinutes()).padStart(2,'0');return `${hours}:${minutes} · Votre moment`}
function momentCompatibility(item){
  const label=requestedMomentLabel();
  if(item.date){if(item.timeKnown===false)return'unknown';const eventDate=new Date(item.date);if(Number.isNaN(eventDate.getTime())||!sameDay(eventDate,state.dateStart))return'incompatible';const delta=Math.abs(eventDate.getHours()*60+eventDate.getMinutes()-(new Date(state.dateStart).getHours()*60+new Date(state.dateStart).getMinutes()));return delta<=120?'confirmed':'incompatible'}
  if(item.source!=='Google Places')return'unknown';
  if(requiresPublishedSession(item))return item.detailsKnown&&isOpenForSlot(item,label)?'open-not-session':'unknown';
  if(item.detailsKnown&&item.openingPeriods?.length)return isOpenForSlot(item,label)?'confirmed':'incompatible';
  if(item.freeAccess)return'autonomous';
  return'unknown';
}
function recommendationEligibleNow(item){const compatible=['confirmed','autonomous'].includes(momentCompatibility(item)),text=plainText(`${item.name||''} ${(item.types||[]).join(' ')}`);if(!geoVisible(item))return false;if(!compatible)return false;if(/office de tourisme|tourist information|mairie|hotel de ville|agence immobiliere|camping|campground/.test(text)&&state.answers.duration!=='stay')return false;if(item.official&&item.date)return true;
  const signature=item.retrievalScope==='signature'&&['day','stay','afternoon_evening'].includes(state.answers.duration);const maximum=state.answers.duration==='stay'?20:(state.answers.duration==='evening'?4:7);if(!signature&&item.distance!=null&&item.distance>maximum)return false;if(signature&&item.distance!=null&&item.distance>60)return false;if(momentCompatibility(item)==='confirmed'&&item.source==='Google Places'&&!item.partner&&!item.official&&((item.rating||0)<4.3||(item.reviews||0)<20))return false;return true}
function isOpenForSlot(item,label){
  const match=(label||'').match(/(\d{2}):(\d{2})/)||requestedMomentLabel().match(/(\d{2}):(\d{2})/);if(!match)return false;
  if(!item.detailsKnown||!item.openingPeriods?.length)return false;
  const date=new Date(state.dateStart),day=date.getDay(),start=day*1440+Number(match[1])*60+Number(match[2]),end=start+75;
  return item.openingPeriods.some(period=>{if(!period.open)return false;const open=period.open.day*1440+Number(String(period.open.time||'0000').slice(0,2))*60+Number(String(period.open.time||'0000').slice(2,4));if(!period.close)return true;let close=period.close.day*1440+Number(String(period.close.time||'0000').slice(0,2))*60+Number(String(period.close.time||'0000').slice(2,4));if(close<=open)close+=7*1440;let target=start;if(target<open&&target+7*1440>=open)target+=7*1440;return target>=open&&target+75<=close});
}
function isTimeCompatible(item,label){const match=(label||'').match(/(\d{2}):(\d{2})/)||requestedMomentLabel().match(/(\d{2}):(\d{2})/);if(!match)return false;if(item.source==='Google Places'){if(requiresPublishedSession(item))return false;return isOpenForSlot(item,label)}if(!item.date)return false;if(item.timeKnown===false)return false;const eventDate=new Date(item.date);if(Number.isNaN(eventDate.getTime()))return false;const slotMinutes=Number(match[1])*60+Number(match[2]),eventMinutes=eventDate.getHours()*60+eventDate.getMinutes();return Math.abs(eventMinutes-slotMinutes)<=90}

function programTemplates(){
  const nights=Math.max(1,tripDays()-1);
  const templates={
    '2h':[['Votre moment',['active','culture','outside','slow','food','night']]],
    morning:[['09:30 · Commencer doucement',['food','outside','slow']],['11:00 · Découvrir',['active','culture','outside']]],
    afternoon:[['14:00 · Explorer',['active','culture','outside']],['16:30 · Faire une pause',['slow','food','outside']]],
    evening:[['19:00 · Ouvrir la soirée',['slow','outside','food','culture']],['21:00 · Le temps fort',['slow','outside','night','culture']],['23:00 · Prolonger',['night','outside','slow']]],
    afternoon_evening:[['16:00 · Première échappée',['active','culture','outside','slow']],['18:30 · Transition plaisir',['food','outside','culture']],['20:30 · Le temps fort',['night','culture','food','slow']],['22:30 · Prolonger si vous en avez envie',['night','food','outside']]],
    day:[['09:30 · Commencer la journée',['outside','active','culture']],['12:30 · Déjeuner',['food']],['15:00 · Activité de l’après-midi',['active','culture','slow','outside']],['19:30 · Dîner',['food']],['22:30 · Événement ou sortie du soir',['night','culture','outside']]],
    stay:[[`Votre hébergement · ${nights} nuit${nights>1?'s':''}`,['hotel']],...Array.from({length:tripDays()},(_,index)=>[[`Jour ${index+1} · Expérience phare`,['outside','culture','active','slow']],[`Jour ${index+1} · Dîner ou soirée`,['food','night']]]).flat()]
  };
  return (templates[state.answers.duration||'2h']||templates['2h']).filter(([label])=>isFutureSlot(label));
}
function isFutureSlot(label){if(!sameDay(new Date(state.dateStart),new Date()))return true;const match=label.match(/(\d{2}):(\d{2})/);if(!match)return true;const slot=new Date(state.dateStart);slot.setHours(Number(match[1]),Number(match[2]),0,0);const minimum=new Date(Date.now()+20*60*1000);return slot>=minimum}

function slotScore(item,label){
  let score=item.score||0;
  if(item.official&&item.date)score+=25;
  if(/Événement|temps fort|soir|Prolonger/.test(label)&&item.official)score+=35;
  if(/Déjeuner|Dîner/.test(label)&&item.category==='food')score+=30;
  if(item.distance!=null)score+=Math.max(0,12-item.distance);
  return score;
}

function retiredResultsArchive(){
  state.view='results';
  const criteria=criteriaLabels();
  app.innerHTML=shell(`<section class="results-hero"><div class="results-photo" style="background-image:url('${IMAGES.hero}')"></div><div class="results-copy"><span class="kicker">Composé pour vous</span><h1>Votre moment<br>prend forme.</h1><p>${state.weather?.main?.temp?`${Math.round(state.weather.main.temp)}°, `:''}${esc(state.location.name)}. Plusieurs choix pertinents pour chaque moment, uniquement à la date et dans la destination sélectionnées.</p><div class="tags">${criteria.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><button class="surprise-hero" onclick="surprise()"><span>Confiez votre temps à Dolcia</span><strong>${composeCta()}</strong><b>→</b></button></div></section>${majorMomentPrompt()}<section class="program">${weatherPlan()}<div class="program-head proposal-intro"><div><span class="kicker">Sélection vérifiée pour vous</span><h2>${state.alternatives.length?'Votre moment peut commencer ici.':'Dolcia cherche une autre voie.'}</h2><p>${state.alternatives.length?'Des idées compatibles avec votre horaire, vos envies et votre destination. Ouvrez une fiche ou ajoutez uniquement ce qui vous plaît.':'Aucune proposition ne passera si elle n’est pas suffisamment fiable.'}</p></div><div class="program-actions"><button class="secondary" onclick="surprise()">${composeCta()}</button><button class="secondary" onclick="startCompose()">Ajuster mes choix</button></div></div>${state.alternatives.length?state.alternatives.map(alternativeGroup).join(''):emptyState()}${state.alternatives.length?`<div class="agenda-guidance"><strong>Vous choisissez activité par activité.</strong><span>Retrouvez uniquement vos choix dans l’onglet Agenda en bas de l’écran.</span><button onclick="renderAgenda()">Ouvrir mon agenda →</button></div>`:''}</section>`,'discover');
}
function catalogFamily(item){const t=plainText(`${item.name||''} ${item.category||''}`);if(item.category==='hotel')return'hotel';if(item.category==='food')return'food';if(item.category==='slow')return'wellness';if(item.category==='night')return'night';if(item.category==='culture')return'culture';if(item.category==='outside'||/plage|nature|jardin|foret|mer|nautique|voile|surf|paddle|kayak/.test(t))return'nature';return'fun'}
function catalogSelection(){
  const filters=state.catalogFilters||{family:'all',sort:'recommended',availability:'all',query:'',limit:60};state.catalogFilters=filters;
  filters.preferred=filters.preferred||[];
  filters.lenses=filters.lenses||[];
  let items=[...state.allItems];
  const momentOrder={confirmed:0,autonomous:1,unknown:2,'open-not-session':3,incompatible:4};
  if(filters.family!=='all')items=items.filter(item=>catalogFamily(item)===filters.family);
  if(filters.availability==='open')items=items.filter(item=>item.isOpen===true);
  if(filters.availability==='scheduled')items=items.filter(item=>item.date&&item.timeKnown!==false);
  filters.lenses.forEach(id=>{const definition=adaptiveLensDefinitions().find(lens=>lens.id===id);if(definition)items=items.filter(definition.test)});
  if(filters.query){const q=plainText(filters.query);items=items.filter(item=>plainText(`${item.name||''} ${item.address||''} ${item.category||''}`).includes(q))}
  const geoOrder={core:0,extended:1,location_unknown:2,outside:3};
  if(filters.sort==='recommended')items.sort((a,b)=>(geoOrder[a.geoEligibility?.status]??2)-(geoOrder[b.geoEligibility?.status]??2)||(momentOrder[momentCompatibility(a)]??9)-(momentOrder[momentCompatibility(b)]??9)||(filters.preferred.length?Number(filters.preferred.includes(catalogFamily(b)))-Number(filters.preferred.includes(catalogFamily(a))):0)||(a.geoEligibility?.travel_minutes??999)-(b.geoEligibility?.travel_minutes??999)||(b.score||0)-(a.score||0));
  if(filters.discoveryMode)items.sort((a,b)=>Number(!filters.preferred.includes(catalogFamily(b)))-Number(!filters.preferred.includes(catalogFamily(a)))||(b.score||0)-(a.score||0));
  if(filters.sort==='distance')items.sort((a,b)=>(a.distance??999)-(b.distance??999));
  if(filters.sort==='rating')items.sort((a,b)=>(b.rating||0)-(a.rating||0)||(b.reviews||0)-(a.reviews||0));
  if(filters.sort==='new')items.sort((a,b)=>Number(Boolean(b.date))-Number(Boolean(a.date))||new Date(a.date||0)-new Date(b.date||0));
  return items;
}
function momentTruth(items=state.items.length?state.items:state.allItems){
  const eligible=items.filter(item=>geoVisible(item)&&recommendationEligibleNow(item));
  const compatible=eligible.filter(item=>confidencePresentation(item)[1]!=='À vérifier');
  const uniqueEvents=eligible.filter(item=>item.official&&item.date&&sameDay(new Date(item.date),state.dateStart));
  const unnecessary=eligible.filter(item=>item.geoEligibility?.status==='outside'||(item.geoEligibility?.status==='extended'&&!item.official&&!item.discoveryPick&&!item.geoEligibility?.decision_codes?.includes('HIGH_RARITY')));
  return{now:sameDay(new Date(state.dateStart),new Date())?'Maintenant':fmt(new Date(state.dateStart)),compatible:compatible.length,uniqueEvents:uniqueEvents.length,unnecessary:unnecessary.length};
}
function momentTruthPanel(items,scope='explorer'){
  const truth=momentTruth(items),trip=truth.unnecessary===0?'aucun trajet inutile':`${truth.unnecessary} trajet${truth.unnecessary>1?'s':''} à arbitrer`;
  return `<section class="moment-truth ${scope}" aria-label="Vérité du moment"><div class="moment-truth-main"><span>Maintenant</span><strong>${esc(truth.now)}</strong></div><div class="moment-truth-facts"><b>${truth.compatible} idée${truth.compatible>1?'s':''} compatible${truth.compatible>1?'s':''}</b><b>${truth.uniqueEvents} rendez-vous unique${truth.uniqueEvents>1?'s':''}</b><b>${trip}</b></div><div class="moment-truth-live" id="momentChangeFeed"><i></i><span>Dolcia veille · météo, places et offres</span></div><button class="moment-truth-decide" onclick="surprise(true)">D compose pour moi</button></section>`;
}
function updateMomentChangeFeed(){
  const feed=document.querySelector('#momentChangeFeed');if(!feed)return;const changes=state.liveMoment.changes.slice(-2);
  feed.classList.toggle('changed',Boolean(changes.length));
  feed.innerHTML=changes.length?`<i></i><span>${changes.map(esc).join(' · ')}</span>`:`<i></i><span>Veille active · aucun changement critique${state.liveMoment.checkedAt?` depuis ${new Date(state.liveMoment.checkedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`:''}</span>`;
}
async function checkMomentChanges(){
  const previousWeather=state.liveMoment.weatherKey,previousOffers=state.liveMoment.offerIds||[],changes=[];
  try{
    const [weatherResponse,offerResponse]=await Promise.all([fetch(`/api/weather?lat=${state.location.lat}&lng=${state.location.lng}`),fetch(`/api/events?service=flash-offers&lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}`)]);
    if(weatherResponse.ok){const weather=await weatherResponse.json(),weatherKey=`${weather?.weather?.[0]?.main||''}:${Math.round(weather?.main?.temp??0)}`;if(previousWeather&&weatherKey!==previousWeather)changes.push('La météo a changé · programme B disponible');state.liveMoment.weatherKey=weatherKey}
    if(offerResponse.ok){const data=await offerResponse.json(),ids=(data.offers||[]).filter(offer=>offer.verified&&new Date(offer.expires_at)>new Date()).map(offer=>String(offer.id));if(previousOffers.length&&ids.some(id=>!previousOffers.includes(id)))changes.push('Une nouvelle offre vérifiée est disponible');state.liveMoment.offerIds=ids}
    const watched=[...state.program.map(slot=>slot.item),...state.items].filter(item=>item.placeId).filter((item,index,list)=>list.findIndex(other=>other.placeId===item.placeId)===index).slice(0,3);
    await Promise.all(watched.map(async item=>{try{const response=await fetch(`/api/place-details?id=${encodeURIComponent(item.placeId)}`),details=await response.json();if(details.verified&&/CLOSED_(TEMPORARILY|PERMANENTLY)/.test(details.businessStatus||''))changes.push(`${item.name} n’est plus disponible · remplacement prêt`)}catch(_){}}));
  }catch(_){}
  state.liveMoment.checkedAt=new Date().toISOString();state.liveMoment.changes=changes;updateMomentChangeFeed();
}
function startMomentWatch(){if(state.liveMoment.watcher)clearInterval(state.liveMoment.watcher);setTimeout(checkMomentChanges,80);state.liveMoment.watcher=setInterval(()=>{if(document.visibilityState==='visible')checkMomentChanges()},120000)}

function nextRecoveryBudget(){
  const options=budgetStep().options||[];
  const current=state.answers.budget||'flexible';
  const index=options.findIndex(option=>option[0]===current);
  if(index<0||index>=options.length-1)return null;
  const next=options[index+1];
  return next?.[0]==='flexible'?{id:next[0],label:'Sans limite précise'}:{id:next[0],label:next[1]};
}
function resetMomentCatalogFilters(){
  state.catalogFilters={
    family:'all',
    sort:'recommended',
    availability:'all',
    query:'',
    limit:60,
    preferred:[],
    lenses:[],
    discoveryMode:false,
    compassStage:'direction'
  };
}
function showWithoutAdvancedFilters(){
  resetMomentCatalogFilters();
  renderResults();
  showToast('Tous les filtres avancés sont retirés. Votre moment et votre budget restent inchangés.');
}
function resetCatalogForRecovery(){
  state.items=[];state.allItems=[];state.program=[];state.alternatives=[];state.catalogAttempted=false;
}
function acceptRecoveryBudget(){
  const next=nextRecoveryBudget();
  if(!next)return openBudgetEditor();
  state.answers.budget=next.id;save();resetCatalogForRecovery();
  showToast(`Budget ajusté : ${next.label}. Toutes vos autres envies sont conservées.`);
  openExplorer(true);
}
function acceptRecoveryDistance(){
  state.catalogFilters=state.catalogFilters||{};
  state.catalogFilters.widened=true;
  state.radius=Math.max(Number(state.radius)||12000,20000);
  save();resetCatalogForRecovery();
  showToast('Recherche élargie aux pépites exceptionnelles jusqu’à 20 km. Les lieux ordinaires éloignés restent exclus.');
  openExplorer(true);
}
function zeroResultRecovery({sourceDown=false,embedded=false}={}){
  const next=nextRecoveryBudget(),freeMoment=state.answers.budget==='free';
  const socialLaugh=state.answers.who==='friends'&&((state.answers.vibes||[]).includes('play')||/rire|fou rire|rigoler|s.amuser|amis/.test(plainText(state.answers.momentSentence||'')));
  const title=sourceDown?'Les sources répondent mal. Votre moment, lui, peut commencer.':freeMoment&&socialLaugh?'À 0 €, entre amis, D a déjà de quoi vous faire rire.':'Aucune correspondance exacte. Jamais aucune solution.';
  const intro=sourceDown?'Je peux relancer les sources sans perdre vos choix, ou lancer immédiatement une animation gratuite avec D.':'Choisissez vous-même le seul critère à assouplir. Dolcia ne change jamais votre budget ni votre zone sans votre accord.';
  return `<section class="zero-cascade ${embedded?'embedded':''}">
    <div class="zero-cascade-head"><span class="eclat-mini">D<i>✦</i></span><div><span class="kicker">${sourceDown?'Connexion incomplète':'Dolcia garde votre cap'}</span><h2>${title}</h2><p>${intro}</p></div></div>
    <div class="zero-cascade-options">
      ${sourceDown?`<button class="recovery-option" onclick="resetCatalogForRecovery();openExplorer(true)"><small>01 · Même demande</small><strong>Réessayer maintenant</strong><span>Je relance toutes les sources. Votre date, votre groupe, votre budget et votre envie restent identiques.</span></button>`:''}
      ${next?`<button class="recovery-option" onclick="acceptRecoveryBudget()"><small>${sourceDown?'02':'01'} · Budget, avec votre accord</small><strong>Voir jusqu’à ${esc(next.label.replace(/^Jusqu’à\s*/i,''))}</strong><span>J’élargis uniquement le prix et je conserve tout le reste.</span></button>`:''}
      <button class="recovery-option" onclick="acceptRecoveryDistance()"><small>${sourceDown?(next?'03':'02'):(next?'02':'01')} · Distance, avec votre accord</small><strong>Voir les pépites jusqu’à 20 km</strong><span>Uniquement pour un événement rare ou une expérience qui mérite réellement le trajet.</span></button>
      <button class="recovery-option animate ${freeMoment&&socialLaugh?'recommended':''}" onclick="openDolciaAnimate()"><small>${sourceDown?(next?'04':'03'):(next?'03':'02')} · Gratuit · sans trajet imposé</small><strong>D anime votre moment</strong><span>${socialLaugh?'Défis, jeux connus et fous rires guidés entre amis au Touquet.':'Une expérience autonome, guidée pas à pas par D, adaptée à votre groupe.'}</span></button>
    </div>
    <div class="zero-cascade-foot">
      <button class="ghost" onclick="showWithoutAdvancedFilters()">Voir sans les filtres avancés</button>
      <button class="ghost" onclick="openDCoach()">Préciser avec D</button>
      <small>Aucune activité incertaine ne sera inventée. Rien n’est élargi, dépensé ou ajouté sans votre validation.</small>
    </div>
  </section>`;
}

function renderResults(){
  if(!state.allItems.length&&!state.catalogAttempted)return openExplorer();
  state.view='results';state.catalogFilters=state.catalogFilters||{family:'all',sort:'recommended',availability:'all',query:'',limit:60};
  const filters=state.catalogFilters;filters.preferred=filters.preferred||[];const allCatalogItems=catalogSelection(),items=allCatalogItems.filter(geoVisible),shown=items.slice(0,filters.limit),families=[['all','Tout'],['fun','Fun & famille'],['nature','Nature & mer'],['culture','Culture & événements'],['food','Restaurants & gourmandises'],['wellness','Bien-être'],['night','Sortir le soir'],['hotel','Hébergements']];
  const visibleBase=state.allItems.filter(geoVisible);
  const counts=Object.fromEntries(families.map(([id])=>[id,id==='all'?visibleBase.length:visibleBase.filter(item=>catalogFamily(item)===id).length]));
  if(!state.allItems.length){
    const sourceDown=!state.catalogSourceStatus||state.catalogSourceStatus.responded===0;
    app.innerHTML=shell(zeroResultRecovery({sourceDown}),'discover');
    return;
  }
  setTimeout(()=>mountThreeFutures(),0);
  setTimeout(startMomentWatch,0);
  app.innerHTML=shell(`<section class="explore-signature result-signature"><div class="explore-signature-copy"><span class="kicker">Votre terrain de jeu · ${esc(state.location.name)}</span><h1>Qu’allons-nous<br><em>vivre maintenant ?</em></h1><p>Écrivez une envie. Les meilleures idées remontent pendant que vous parlez, sans jamais cacher le reste.</p></div><div class="living-brief"><span class="eclat-mini">D<i>✦</i></span><div><label for="catalogSearch">Dites-le simplement à Dolcia</label><input id="catalogSearch" value="${esc(filters.query)}" placeholder="Avec les enfants, face à la mer, sans trop marcher…" oninput="liveCatalogSearch(this.value)"><small><b></b><span>${items.length} possibilités explorées maintenant</span></small></div><button class="voice-live" onclick="startCatalogVoice()" aria-label="Dicter mon envie">◉</button></div><div class="signature-actions"><button class="signature-compose" onclick="surprise()"><span>Dolcia s’occupe de tout</span><strong>${composeCta()}</strong><b>→</b></button><button class="signature-adjust" onclick="openEclatDialogue()">Préciser mon moment</button></div></section><section class="catalog-shell result-first"><div class="catalog-toolbar compact-toolbar"><div class="catalog-families">${families.filter(([id])=>(id==='all'||counts[id]>0)&&(id!=='hotel'||state.answers.duration==='stay')).map(([id,label])=>`<button class="${filters.family===id?'selected':''}" onclick="setCatalogFamily('${id}')">${label}<small>${counts[id]}</small></button>`).join('')}</div><details class="advanced-refinements"><summary><span>Affiner les résultats</span><small>Distance, disponibilité, confiance et tri</small><b>+</b></summary><div class="catalog-controls"><select onchange="setCatalogSort(this.value)"><option value="recommended" ${filters.sort==='recommended'?'selected':''}>Les plus pertinents</option><option value="distance" ${filters.sort==='distance'?'selected':''}>Les plus proches</option><option value="rating" ${filters.sort==='rating'?'selected':''}>Les mieux notés</option><option value="new" ${filters.sort==='new'?'selected':''}>Événements en premier</option></select><select onchange="setCatalogAvailability(this.value)"><option value="all" ${filters.availability==='all'?'selected':''}>Toutes les disponibilités</option><option value="open" ${filters.availability==='open'?'selected':''}>Ouverts maintenant</option><option value="scheduled" ${filters.availability==='scheduled'?'selected':''}>Événements avec horaire</option></select><button onclick="startCompose()">Date, groupe et budget</button></div><div class="refinement-lenses">${adaptiveLensDefinitions().filter(lens=>state.allItems.some(lens.test)).map(lens=>`<button class="${lens.id==='signature'?'lens-signature ':''}${(filters.lenses||[]).includes(lens.id)?'selected':''}" onclick="toggleAdaptiveLens('${lens.id}')">${lens.label}</button>`).join('')}</div></details></div><div class="catalog-summary"><strong>${items.length} idées disponibles</strong><span>Classées selon votre moment · jamais selon le montant payé par un partenaire</span></div>${filters.family==='hotel'?abundantWidenPrompt('hotel'):''}${items.length?`<div class="catalog-list">${shown.map((item,index)=>experience(item,index,'')).join('')}</div>`:zeroResultRecovery({embedded:true})}${shown.length<items.length?`<button class="catalog-more" onclick="showMoreCatalog()">Découvrir ${Math.min(60,items.length-shown.length)} idées de plus</button>`:''}</section>`,'discover')
  document.querySelector('.catalog-toolbar')?.insertAdjacentHTML('beforebegin',momentTruthPanel(items,'explorer'));
}

let catalogSearchTimer;
function interpretCatalogIntent(value){const sentence=value.trim(),t=plainText(sentence),words=t.split(/\s+/).filter(Boolean),preferred=new Set(state.catalogFilters.preferred||[]),vibes=new Set(state.answers.vibes||[]);if(!sentence){state.catalogFilters.query='';return}state.answers.momentSentence=sentence;if(/enfant|fille|fils|famille|ado|bebe|tout.petit/.test(t))state.answers.who='family';else if(/mari|femme|couple|a deux|amoureux/.test(t))state.answers.who='couple';else if(/collegue|equipe|travail|afterwork/.test(t))state.answers.who='colleagues';else if(/ami|copain|copine/.test(t))state.answers.who='friends';else if(/seul|seule|pour moi/.test(t))state.answers.who='solo';if(/bouger|sport|defouler|sensation|aventure|parc d.attraction|laser game|bowling/.test(t)){preferred.add('fun');vibes.add('play')}if(/mer|plage|nature|balade|dehors|nautique|voile|surf|paddle|kayak/.test(t)){preferred.add('nature');vibes.add('breathe')}if(/restaurant|diner|manger|gourmand|deguster|brunch/.test(t)){preferred.add('food');vibes.add('taste')}if(/calme|detendre|massage|spa|souffler|repos|bien.etre/.test(t)){preferred.add('wellness');vibes.add('recharge')}if(/concert|danser|bar|soiree|faire la fete/.test(t)){preferred.add('night');vibes.add('vibrate')}if(/musee|culture|expo|atelier|creatif|decouvrir/.test(t)){preferred.add('culture');vibes.add('create')}state.catalogFilters.preferred=[...preferred];state.answers.vibes=[...vibes];const semantic=preferred.size>0||/avec|sans|envie|besoin|quelque chose|nous|je veux|j aimerais/.test(t);state.catalogFilters.query=semantic?'':(words.length<=3?sentence:'')}
function liveCatalogSearch(value){clearTimeout(catalogSearchTimer);catalogSearchTimer=setTimeout(()=>{interpretCatalogIntent(value);state.catalogFilters.limit=60;save();renderResults();setTimeout(()=>{const input=document.querySelector('#catalogSearch');if(input){input.value=value;input.focus();input.setSelectionRange(input.value.length,input.value.length)}},0)},220)}
function startCatalogVoice(){const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return showToast('La dictée vocale n’est pas disponible sur ce navigateur');const recognition=new Recognition();recognition.lang='fr-FR';recognition.interimResults=true;recognition.onstart=()=>showToast('Dolcia vous écoute…');recognition.onresult=event=>{const value=[...event.results].map(result=>result[0].transcript).join('');const input=document.querySelector('#catalogSearch');if(input)input.value=value;if(event.results[event.results.length-1].isFinal)liveCatalogSearch(value)};recognition.onerror=()=>showToast('Je n’ai pas bien entendu. Réessayez simplement.');recognition.start()}
function futurePool(id){const all=[...state.allItems].filter(recommendationEligibleNow),preferred=state.catalogFilters?.preferred||[];if(id==='local')return all.filter(item=>geoCore(item)&&item.distance!=null&&item.distance<=8&&(item.rating>=4.3||item.official)).sort((a,b)=>(a.distance??99)-(b.distance??99)||(b.score||0)-(a.score||0));if(id==='unexpected')return all.filter(item=>geoCore(item)&&!preferred.includes(catalogFamily(item))&&((item.rating>=4.5&&item.reviews>=30)||item.official)).sort((a,b)=>(b.score||0)-(a.score||0));return all.filter(geoCore).sort((a,b)=>(b.score||0)-(a.score||0))}
function futurePreview(id){const pool=futurePool(id),first=pool[0];if(!first)return null;const confidence=pool.filter(item=>item.ranking?.confidence==='confirmed'||item.quality==='verified'||item.official).length;return{first,count:pool.length,confidence}}
function mountThreeFuturesLegacy(){const shell=document.querySelector('.catalog-shell'),toolbar=document.querySelector('.catalog-toolbar');if(!shell||!toolbar)return;const futures=[['perfect','L’évidence parfaite','Le meilleur accord entre votre groupe, votre envie et le réel.'],['local','La pépite locale','Tout près, très qualitative et moins évidente.'],['unexpected','L’inattendu maîtrisé','Hors de vos habitudes, jamais hors de vos contraintes.']].map(([id,title,copy])=>({id,title,copy,preview:futurePreview(id)})).filter(item=>item.preview);if(!futures.length)return;toolbar.insertAdjacentHTML('beforebegin',`<section class="three-futures"><div class="future-intro"><span class="kicker">Une innovation Dolcia</span><h2>Trois futurs.<br><em>Un seul moment.</em></h2><p>Explorez trois directions calculées dans le même catalogue immense. Rien n'est inventé, rien n'est définitivement masqué.</p></div><div class="future-grid">${futures.map((future,index)=>`<article class="future-card future-${future.id}"><div class="future-image" style="background-image:url('${itemImage(future.preview.first)}')"><span>0${index+1}</span></div><div class="future-copy"><small>${future.preview.count} possibilités · ${future.preview.confidence} solides</small><h3>${future.title}</h3><p>${future.copy}</p><strong>${esc(future.preview.first.name)}</strong><div><button onclick="openFuture('${future.id}')">Explorer cette voie</button><button onclick="composeFuture('${future.id}')">Confier à L’Éclat</button></div></div></article>`).join('')}</div></section>`)}
function openFuture(id){state.catalogFilters.discoveryMode=id==='unexpected';state.catalogFilters.sort=id==='local'?'distance':'recommended';state.catalogFilters.lenses=id==='local'?['near']:[];state.catalogFilters.limit=60;renderResults();showToast(id==='unexpected'?'Dolcia ouvre une voie inattendue mais compatible':id==='local'?'Les pépites proches passent en premier':'Votre meilleur accord passe en premier')}
function composeFuture(id){const pool=futurePool(id);if(!pool.length)return showToast('Cette voie ne contient pas encore assez d’expériences fiables');state.program=buildProgram(pool);state.items=state.program.map(slot=>slot.item);state.catalogFilters.future=id;renderSurprise();showToast('L’Éclat a composé ce futur en programme réel')}
function momentSnapshot(){const group=label('who')||'Votre groupe',duration=label('duration')||'Votre rythme',budget=state.answers.budget==='custom'&&state.budgetPlan.amount!=null?`${state.budgetPlan.amount.toLocaleString('fr-FR')} € pour le groupe`:label('budget')||'Budget à préciser';return [group,duration,budget]}
function horizonSignal(item){const trust=confidencePresentation(item);return[trust[0],trust[1]]}
function mountThreeFutures(){const toolbar=document.querySelector('.catalog-toolbar');if(!toolbar)return;const take=(pool,count,used)=>pool.filter(item=>!used.has(item.id)).slice(0,count),used=new Set(),perfect=take(futurePool('perfect'),5,used);perfect.forEach(i=>used.add(i.id));const local=take(futurePool('local'),3,used);local.forEach(i=>used.add(i.id));const dated=take(state.allItems.filter(i=>i.date&&i.timeKnown!==false).sort((a,b)=>(b.score||0)-(a.score||0)),2,used);dated.forEach(i=>used.add(i.id));const unexpected=take(futurePool('unexpected'),2,used),items=[...perfect,...local,...dated,...unexpected];if(!items.length)return;const directions=[['perfect','Valeurs sûres'],['local','Pépites locales'],['unexpected','Inattendu maîtrisé']],snapshot=momentSnapshot();toolbar.insertAdjacentHTML('beforebegin',`<section class="horizon"><div class="moment-command"><div><span>Votre moment, en un regard</span><strong>${snapshot.map(esc).join(' · ')}</strong></div><button onclick="openEclatDialogue()">Ajuster</button></div><div class="horizon-head"><div><span class="kicker">La sélection vivante de Dolcia</span><h2>Douze idées.<br><em>Déjà très vous.</em></h2><p>Une vitrine éditoriale calculée pour votre moment. Faites défiler, réagissez, ou confiez toute la composition à Dolcia.</p></div><div class="horizon-directions">${directions.map(([id,label])=>`<button onclick="openFuture('${id}')">${label}</button>`).join('')}<button class="compose" onclick="surprise()">Composer mon programme</button></div></div><div class="horizon-grid">${items.map((item,index)=>{const signal=horizonSignal(item);return`<article class="horizon-card" onclick="openDetail('${item.id}')"><div class="horizon-image" style="background-image:url('${itemImage(item)}')"><span>${index<5?'Pour vous':index<8?'Pépite locale':index<10?'À votre date':'Inattendu maîtrisé'}</span><button onclick="event.stopPropagation();openReactionMenu('${item.id}')" aria-label="Réagir à cette activité">${state.favorites.includes(item.id)?'♥':'♡'}</button></div><div class="horizon-card-copy"><div class="horizon-signal ${signal[0]}"><i></i>${signal[1]}</div><small>${why(item)}</small><h3>${esc(item.name)}</h3><p>${esc(item.address||state.location.name)}</p><div class="horizon-quick"><button onclick="event.stopPropagation();openDetail('${item.id}')">Voir la fiche</button><button onclick="event.stopPropagation();addAgenda('${item.id}')">Ajouter au programme</button></div></div></article>`}).join('')}</div><button class="horizon-all" onclick="document.querySelector('.catalog-toolbar')?.scrollIntoView({behavior:'smooth'})">Explorer les ${state.allItems.length} possibilités →</button></section>`)}
function adaptiveLensDefinitions(){return[
  {id:'signature',label:'Sélection Dolcia',test:item=>(item.rating||0)>=4.6&&(item.reviews||0)>=50&&(item.official||item.quality==='verified'||item.ranking?.confidence==='confirmed')},
  {id:'near',label:'À moins de 3 km',test:item=>item.distance!=null&&item.distance<=3},
  {id:'confirmed',label:'Confiance maximale',test:item=>item.ranking?.confidence==='confirmed'||item.quality==='verified'},
  {id:'today',label:'À votre date',test:item=>item.date&&sameDay(new Date(item.date),state.dateStart)},
  {id:'open',label:'Ouvert maintenant',test:item=>item.isOpen===true},
  {id:'free',label:'Gratuit confirmé',test:item=>item.free||item.price===0||item.freeAccess},
  {id:'loved',label:'Très apprécié',test:item=>(item.rating||0)>=4.5&&(item.reviews||0)>=30},
  {id:'bookable',label:'Réservable',test:item=>Boolean(item.booking||item.website)},
  {id:'official',label:'Officiel',test:item=>Boolean(item.official)}
]}
function mountAdaptiveFilters(){const controls=document.querySelector('.catalog-controls');if(!controls)return;const active=state.catalogFilters.lenses||[],definitions=adaptiveLensDefinitions();const counts=Object.fromEntries(definitions.map(lens=>[lens.id,state.allItems.filter(lens.test).length]));controls.insertAdjacentHTML('beforebegin',`<section class="adaptive-filters"><div><span class="kicker">Filtres intelligents</span><strong>Affinez sans perdre le fil.</strong><p>Combinez uniquement les critères qui comptent maintenant. Chaque compteur révèle l'abondance réellement disponible.</p></div><div>${definitions.filter(lens=>counts[lens.id]>0).map(lens=>`<button class="${lens.id==='signature'?'lens-signature ':''}${active.includes(lens.id)?'selected':''}" onclick="toggleAdaptiveLens('${lens.id}')"><span>${lens.label}</span><small>${counts[lens.id]}</small></button>`).join('')}${active.length?'<button class="clear-lenses" onclick="clearAdaptiveLenses()">Réinitialiser les filtres</button>':''}</div></section>`)}
function toggleAdaptiveLens(id){const active=state.catalogFilters.lenses||[];state.catalogFilters.lenses=active.includes(id)?active.filter(value=>value!==id):[...active,id];state.catalogFilters.limit=60;renderResults()}
function clearAdaptiveLenses(){state.catalogFilters.lenses=[];state.catalogFilters.availability='all';state.catalogFilters.family='all';state.catalogFilters.query='';state.catalogFilters.limit=60;renderResults()}
function setCatalogFamily(value){state.catalogFilters.family=value;state.catalogFilters.limit=60;renderResults()}
function mountCatalogPreferences(families){const toolbar=document.querySelector('.catalog-toolbar');if(!toolbar)return;const preferred=state.catalogFilters.preferred||[],choices=families.filter(([id])=>id!=='all'&&id!=='hotel');toolbar.insertAdjacentHTML('afterbegin',`<section class="moment-brief"><div><span class="kicker">Brief du moment</span><strong>Dites simplement ce qui vous ferait plaisir.</strong><p>Une phrase suffit. Dolcia comprend le groupe, l’énergie et l’ambiance sans vous enfermer dans une catégorie.</p></div><div><input id="momentBriefInput" value="${esc(state.answers.momentSentence||'')}" placeholder="Ex. Avec mes enfants de 7 et 13 ans, bouger puis dîner face à la mer"><button onclick="applyMomentBrief()">Comprendre mon envie</button></div></section><section class="catalog-preferences"><div><span class="kicker">Ce qui me tente aujourd’hui</span><strong>Choisissez un ou plusieurs styles</strong><p>Ils remonteront en premier. Toutes les autres propositions resteront visibles.</p></div><div>${choices.map(([id,label])=>`<button class="${preferred.includes(id)?'selected':''}" onclick="toggleCatalogPreference('${id}')">${preferred.includes(id)?'✓ ':''}${label}</button>`).join('')}${preferred.length?'<button onclick="clearCatalogPreferences()">Tout réafficher sans préférence</button>':''}</div></section>`)}
function applyMomentBrief(){const input=document.querySelector('#momentBriefInput'),sentence=input?.value.trim();if(!sentence)return showToast('Décrivez votre envie en une phrase');const t=plainText(sentence),preferred=new Set(state.catalogFilters.preferred||[]),vibes=new Set(state.answers.vibes||[]),ages=[...sentence.matchAll(/\b(\d{1,2})\s*ans?\b/gi)].map(match=>Number(match[1])).filter(age=>age<18);if(/enfant|fille|fils|famille|ado|bebe|tout.petit/.test(t)){state.answers.who='family';if(ages.length)state.answers.childrenAges=ages;if(/bebe|tout.petit|bout.chou/.test(t))state.answers.groupDetail='toddlers';else if(/ado/.test(t))state.answers.groupDetail='teens'}if(/mari|femme|couple|a deux|amoureux/.test(t))state.answers.who='couple';if(/collegue|equipe|travail|afterwork/.test(t))state.answers.who='colleagues';else if(/ami|copain|copine/.test(t))state.answers.who='friends';if(/seul|seule|pour moi/.test(t))state.answers.who='solo';if(/bouger|sport|defouler|sensation|aventure/.test(t)){preferred.add('fun');vibes.add('play')}if(/mer|plage|nature|balade|dehors/.test(t)){preferred.add('nature');vibes.add('breathe')}if(/restaurant|diner|manger|gourmand|deguster|brunch/.test(t)){preferred.add('food');vibes.add('taste')}if(/calme|detendre|massage|spa|souffler|repos/.test(t)){preferred.add('wellness');vibes.add('recharge')}if(/concert|danser|bar|soiree|faire la fete/.test(t)){preferred.add('night');vibes.add('vibrate')}if(/musee|culture|expo|atelier|creatif|decouvrir/.test(t)){preferred.add('culture');vibes.add('create')}state.answers.momentSentence=sentence;state.answers.vibes=[...vibes];state.catalogFilters.preferred=[...preferred];state.catalogFilters.sort='recommended';state.catalogFilters.limit=60;save();renderResults();showToast('Dolcia a compris votre brief et réordonné toutes les propositions')}
function mountVoiceBrief(){const target=document.querySelector('.moment-brief>div:last-child');if(!target)return;target.insertAdjacentHTML('beforeend','<button class="voice-brief" onclick="startVoiceBrief()" title="Parler à Dolcia">◉ Parler à Dolcia</button>')}
function startVoiceBrief(){const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return showToast('La dictée vocale n’est pas disponible dans ce navigateur');const recognition=new Recognition();recognition.lang='fr-FR';recognition.interimResults=false;recognition.onstart=()=>showToast('Dolcia vous écoute…');recognition.onerror=()=>showToast('Dolcia n’a pas bien entendu. Vous pouvez réessayer.');recognition.onresult=event=>{const input=document.querySelector('#momentBriefInput');if(input){input.value=event.results[0][0].transcript;applyMomentBrief()}};recognition.start()}
function mountGuidedCompass(){const brief=document.querySelector('.moment-brief');if(!brief)return;const stage=state.catalogFilters.compassStage||'direction';brief.insertAdjacentHTML('afterend',`<section class="guided-compass"><div><span class="kicker">La boussole Dolcia</span><strong>${stage==='direction'?'Dans quelle direction part-on ?':'Quel ton donner à ce moment ?'}</strong><p>Chaque réponse affine l’ordre des idées sans cacher le reste.</p></div><div>${stage==='direction'?[['energy','Bouger et rire'],['soft','Souffler vraiment'],['share','Vivre quelque chose ensemble'],['unknown','Je ne sais pas, étonnez-moi']].map(([id,label])=>`<button onclick="chooseCompass('${id}')">${label}</button>`).join(''):[['iconic','Une valeur sûre'],['local','Une pépite locale'],['unexpected','Quelque chose d’inattendu'],['mix','Un mélange parfait']].map(([id,label])=>`<button onclick="finishCompass('${id}')">${label}</button>`).join('')}</div></section>`)}
function chooseCompass(path){const preferred=new Set(state.catalogFilters.preferred||[]),vibes=new Set(state.answers.vibes||[]);if(path==='energy'){preferred.add('fun');preferred.add('nature');vibes.add('play')}if(path==='soft'){preferred.add('wellness');preferred.add('food');vibes.add('recharge')}if(path==='share'){preferred.add('culture');preferred.add('food');vibes.add('create')}if(path==='unknown')state.catalogFilters.discoveryMode=true;state.catalogFilters.preferred=[...preferred];state.answers.vibes=[...vibes];state.catalogFilters.compassStage='tone';renderResults()}
function finishCompass(tone){state.catalogFilters.compassTone=tone;state.catalogFilters.compassStage='direction';if(tone==='unexpected')state.catalogFilters.discoveryMode=true;if(tone==='iconic')state.catalogFilters.sort='rating';if(tone==='local')state.catalogFilters.sort='distance';save();renderResults();showToast('La boussole a réordonné le catalogue sans rien masquer')}
function toggleCatalogPreference(value){const list=state.catalogFilters.preferred||[];state.catalogFilters.preferred=list.includes(value)?list.filter(id=>id!==value):[...list,value];state.catalogFilters.sort='recommended';renderResults()}
function clearCatalogPreferences(){state.catalogFilters.preferred=[];renderResults()}
function setCatalogSort(value){state.catalogFilters.sort=value;renderResults()}
function setCatalogAvailability(value){state.catalogFilters.availability=value;state.catalogFilters.limit=60;renderResults()}
function applyCatalogSearch(){state.catalogFilters.query=document.querySelector('#catalogSearch')?.value.trim()||'';state.catalogFilters.limit=60;renderResults()}
function showMoreCatalog(){state.catalogFilters.limit+=60;renderResults()}

function renderSurprise(){
  state.view='surprise';
  const criteria=criteriaLabels();
  setTimeout(mountProgramIntelligence,0);
  setTimeout(startMomentWatch,0);
  setTimeout(()=>document.querySelector('.surprise-cover')?.insertAdjacentHTML('beforebegin',momentTruthPanel(state.program.map(slot=>slot.item),'program')),0);
  const ready=state.program.length>0;
  app.innerHTML=shell(`<section class="surprise-cover"><div class="surprise-cover-photo"></div><div class="surprise-cover-copy"><span class="kicker">${ready?'Votre programme composé':'Dolcia explore encore'}</span><h1>${ready?'Votre moment.<br><em>Aux petits oignons.</em>':'La bonne idée<br><em>mérite d’être vraie.</em>'}</h1><p>${ready?'Dolcia a choisi et ordonné chaque étape selon la durée, la date, la météo, votre budget et ce qu’elle apprend de vos goûts.':'Aucune proposition insuffisamment documentée ne remplira artificiellement votre programme. Élargissez une nuance, pas vos exigences.'}</p><div class="tags">${criteria.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><div class="surprise-controls">${ready?'<button class="primary" onclick="adoptSurprise()">Adopter ce programme</button>':''}<button class="secondary" onclick="surprise(true)">${ready?'Tout recomposer ↻':'Relancer la composition'}</button><button class="secondary" onclick="renderResults()">Explorer toutes les idées</button></div></div></section>${ready?`<section class="program surprise-program">${programBudgetPanel()}${weatherPlan('program')}<div class="surprise-note"><strong>Un vrai programme, pas une liste.</strong><span>Chaque activité correspond à un créneau. Changez une seule idée, précisez votre envie ou adoptez le programme composé.</span></div>${broadcastProgramPanel()}${state.answers.duration==='stay'?lodgingPreference():''}${state.program.map(programSlot).join('')}<div class="agenda-guidance"><strong>Votre programme est prêt.</strong><span>Adoptez-le en entier ou ajoutez seulement certains moments.</span><button onclick="renderAgenda()">Voir mon agenda →</button></div></section>`:programEmptyCinematic()}`,'discover');
}
function programEmptyCinematic(){const strictFree=state.answers.budget==='free';return `<section class="program-empty-cinematic"><div><span class="kicker">${strictFree?'0 € sans compromis':'Une autre voie existe'}</span><h2>${strictFree?'Aucune offre gratuite vérifiée.<br>Créons un vrai moment.':'Ne remplissons jamais<br>le vide avec du médiocre.'}</h2><p>${strictFree?'Dolcia ne transformera jamais un tarif inconnu en gratuit. Elle peut en revanche animer une expérience autonome adaptée à votre groupe, ici et maintenant.':'Modifiez une nuance avec Dolcia, parcourez le catalogue ou laissez Dolcia animer une expérience autonome. Vos contraintes restent conservées.'}</p><div><button class="primary" onclick="openDolciaAnimate()">Dolcia anime ce moment</button><button class="secondary" onclick="openEclatDialogue()">Modifier une nuance</button><button class="secondary" onclick="renderResults()">Voir toutes les idées</button></div><small>Programme Dolcia · aucun lieu, événement ou professionnel inventé</small></div></section>`}
function mountProgramIntelligence(){if(!state.program.length)return;const anchor=document.querySelector('.surprise-note');if(!anchor)return;const discovery=state.program.some(slot=>slot.item.discoveryPick),official=state.program.filter(slot=>slot.item.official&&slot.item.date).length,verified=state.program.filter(slot=>slot.item.quality==='verified'||slot.item.official).length,profiles=currentGroupProfiles().filter(person=>person.likes.length||person.avoids.length||person.momentNeed),strong=state.program.filter(slot=>slot.item.ranking?.groupFit?.ratio>=.75).length;anchor.insertAdjacentHTML('afterend',`${programArcPanel()}<aside class="program-intelligence"><div><span>Signature Dolcia</span><strong>${profiles.length?'J’ai trouvé votre point d’accord':'Pourquoi ce programme vous ressemble'}</strong>${profiles.length?`<small>${profiles.map(person=>esc(person.name)).join(', ')} · aucune étape contraire à un refus durable déclaré</small>`:''}</div><div class="intelligence-signals"><span><b>${verified}</b> choix solidement documentés</span><span><b>${official}</b> rendez-vous officiels à vos dates</span><span><b>${profiles.length?strong:(discovery?'1':'—')}</b> ${profiles.length?'accords forts dans ce programme':(discovery?'pépite inattendue mais cohérente':'surprise ajoutée seulement si elle est assez pertinente')}</span><span><b>100 %</b> ordonné selon votre rythme</span></div></aside>${state.answers.who==='family'?familyRhythmPanel():''}`)}
function familyRhythmPanel(){const value=state.answers.familyRhythm||'together';return `<aside class="family-rhythm"><div><span class="kicker">Le rythme de votre famille</span><strong>Ensemble, ou chacun son moment ?</strong><p>Dolcia peut chercher un temps enfants réellement encadré, une parenthèse pour les parents, puis organiser les retrouvailles. Rien ne sera proposé sans encadrement documenté.</p></div><div>${[['together','Tout vivre ensemble'],['balanced','Un moment chacun + retrouvailles'],['flexible','Dolcia choisit le meilleur équilibre']].map(([id,label])=>`<button class="${value===id?'selected':''}" onclick="setFamilyRhythm('${id}')">${label}</button>`).join('')}</div></aside>`}
function setFamilyRhythm(value){state.answers.familyRhythm=value;save();showToast(value==='together'?'Dolcia privilégie les moments tous ensemble':'Dolcia vérifie les activités encadrées avant de séparer le programme');compose()}
function broadcastProgramPanel(){if(!state.majorChoice)return'';const moment=state.majorMoments.find(item=>item.id===state.majorChoice);if(!moment?.broadcastable)return'';if(!state.broadcastVenues.length)return`<aside class="program-broadcast"><span>Lieu de diffusion</span><strong>Aucune diffusion confirmée dans la destination.</strong><p>Le rendez-vous reste dans le programme. Dolcia continuera à vérifier les annonces ; aucun établissement ne sera présenté comme certain sans preuve.</p></aside>`;return `<aside class="program-broadcast"><span>Où vivre ce rendez-vous ?</span><strong>${state.broadcastVenues.some(v=>v.confirmation==='confirmed')?'Diffusions confirmées':'Lieux à appeler pour confirmer'}</strong><div>${state.broadcastVenues.slice(0,4).map(venue=>`<article><b>${esc(venue.name)}</b><small>${venue.confirmation==='confirmed'?'Confirmé':'À confirmer'}${venue.distance!=null?` · ${venue.distance.toFixed(1)} km`:''}</small>${venue.phone?`<a href="tel:${esc(venue.phone)}">Appeler</a>`:''}${venue.sourceUrl?`<a href="${esc(venue.sourceUrl)}" target="_blank" rel="noopener">Voir</a>`:''}</article>`).join('')}</div></aside>`}
function lodgingPreference(){const value=state.answers.lodging;return `<aside class="lodging-preference"><div><span>Votre hébergement</span><strong>${value?'Préférence enregistrée':'Quel séjour vous ressemble ?'}</strong><p>Dolcia ne confondra jamais un lieu à visiter avec un hébergement.</p></div><div>${[['family','Familial + piscine'],['sea','Vue mer'],['character','Hôtel de charme'],['simple','Simple et bien placé']].map(([id,label])=>`<button class="${value===id?'selected':''}" onclick="setLodging('${id}')">${label}</button>`).join('')}</div></aside>`}
function setLodging(value){state.answers.lodging=value;showToast('Votre préférence d’hébergement est prise en compte');compose()}
// Plan B météo : un seul design premium (noir/or, pas de bleu clair oublié d'une ancienne version),
// utilisable dans Explorer comme dans le programme composé — c'est là que la promesse
// "je déplace la plage à demain" doit vraiment se voir, pas seulement dans la liste libre.
function badWeatherActive(){return /rain|drizzle|thunder|snow/.test((state.weather?.weather?.[0]?.main||'').toLowerCase())}
function weatherPlan(scope='explorer'){
  if(!badWeatherActive()||state.weatherPlanDismissed)return'';
  if(scope==='program'&&!state.program.some(slot=>slot.item.category==='outside'))return'';
  const primary=scope==='program'
    ?'<button class="primary" onclick="applyWeatherPlanB()">Réorganiser mon programme</button>'
    :'<button class="primary" onclick="toggleOutdoor()">Prioriser les idées abritées</button>';
  const secondary=scope==='program'
    ?'<button class="secondary" onclick="dismissWeatherPlan()">Je garde mon programme tel quel</button>'
    :'<button class="secondary" onclick="dismissWeatherPlan()">Voir aussi les idées dehors</button>';
  return `<aside class="plan-b"><i class="plan-b-icon" aria-hidden="true"></i><div><span>Plan B météo</span><strong>${scope==='program'?'La pluie s’invite. Votre programme peut rester magique.':'La météo change. Votre moment reste magique.'}</strong><p>${scope==='program'?'Dolcia peut remplacer chaque moment en extérieur par une idée abritée aussi fiable, sans toucher au reste.':'Les expériences intérieures peuvent passer en priorité, sans rien cacher du reste.'}</p></div><div class="plan-b-actions">${primary}${secondary}</div></aside>`;
}
function dismissWeatherPlan(){state.weatherPlanDismissed=true;if(state.view==='surprise')renderSurprise();else renderResults()}
function applyWeatherPlanB(){
  const used=new Set(state.program.map(slot=>slot.item.id));
  let changed=0;
  state.program=state.program.map(slot=>{
    if(slot.item.category!=='outside')return slot;
    const replacement=state.allItems.filter(item=>item.category!=='outside'&&!used.has(item.id)&&recommendationEligibleNow(item)&&isTimeCompatible(item,slot.label)).sort((a,b)=>(b.score||0)-(a.score||0))[0];
    if(!replacement)return slot;
    used.add(replacement.id);changed++;
    return{...slot,item:replacement};
  });
  if(!changed)return showToast('Aucune alternative abritée assez fiable trouvée pour l’instant');
  state.items=state.program.map(slot=>slot.item);
  save();
  renderSurprise();
  showToast(`${changed} moment${changed>1?'s':''} en extérieur remplacé${changed>1?'s':''} par une idée abritée`);
}
function toggleOutdoor(){state.items=[...state.items].sort((a,b)=>(b.category==='outside')-(a.category==='outside'));renderResults()}
function label(key){const base=FLOW.find(x=>x.key===key),s=key==='budget'?{...base,...budgetStep()}:base,v=state.answers[key];return s?.options.find(o=>o[0]===v)?.[1]}
function criteriaLabels(){const vibeStep=FLOW.find(step=>step.key==='vibes');const vibes=(state.answers.vibes||[]).map(value=>vibeStep.options.find(option=>option[0]===value)?.[1]).filter(Boolean),budget=state.answers.budget==='custom'&&state.budgetPlan.amount!=null?`${state.budgetPlan.amount.toLocaleString('fr-FR')} € pour le groupe`:label('budget');return [fmt(state.dateStart),label('duration'),label('who'),budget,...vibes].filter(Boolean)}
function confidencePresentation(item){const compatibility=momentCompatibility(item);if(item.official&&item.date&&item.timeKnown!==false)return['confirmed','Confirmé'];if(compatibility==='confirmed'||compatibility==='autonomous')return['compatible','Compatible'];return['check','À vérifier']}
function experience(i,index,slotLabel=''){const added=state.agenda.some(item=>item.id===i.id),reserved=state.reservations.some(r=>r.itemId===i.id&&r.status!=='cancelled'),fallback=IMAGES[i.category]||IMAGES.fallback,label=i.partner?'Partenaire Dolcia · réservation intégrée':i.sponsored?'Suggestion partenaire · pertinence vérifiée':i.quality==='verified'?'Informations vérifiées':i.quality==='official-partial'?'Source officielle · détails à confirmer':esc(i.source),trust=confidencePresentation(i),isSignature=(i.rating||0)>=4.6&&(i.reviews||0)>=50&&(i.official||i.quality==='verified'||i.ranking?.confidence==='confirmed'),price=i.free?'<span>Gratuit confirmé</span>':i.freeAccess?'<span>Accès libre · options éventuelles payantes</span>':i.price!=null?`<span>${i.price===0?'Gratuit confirmé':'€'.repeat(Math.min(i.price,4))}</span>`:'<span>Tarif non communiqué</span>',dateMeta=i.date?`<span>${i.timeKnown===false?new Date(i.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})+' · horaire à confirmer':new Date(i.date).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</span>`:'',travel=i.geoEligibility?.travel_minutes,travelMeta=travel!=null?`<span>${travel} min de trajet</span>`:i.distance!=null?`<span>${i.distance.toFixed(1)} km à vol d’oiseau</span>`:'';return `<article class="experience ${i.partner?'partner-ready':''} ${i.geoEligibility?.status==='outside'?'outside-scope':''}">${isSignature?'<span class="signature-ribbon">✦ Sélection Dolcia</span>':''}<button class="quick-heart ${state.favorites.includes(i.id)?'selected':''}" onclick="openReactionMenu('${i.id}')" aria-label="Dire à Dolcia si cette activité vous plaît">${state.favorites.includes(i.id)?'♥':'♡'}</button><img class="exp-image" src="${itemImage(i)}" alt="" onerror="this.onerror=null;this.src='${fallback}'"><div class="exp-copy"><span class="exp-label">${label}<i class="trust-badge ${trust[0]}">${trust[1]}</i></span><h3>${esc(i.name)}</h3><p>${esc(i.address||'Lieu exact à confirmer auprès de la source')}</p><div class="exp-meta">${travelMeta}${i.rating?`<span>Google ${i.rating}/5${i.reviews?` · ${i.reviews} avis`:''}</span>`:''}${price}${i.isOpen===true?'<span>Ouvert actuellement</span>':''}${dateMeta}</div><p class="dolcia-voice"><b>✦ Le regard de Dolcia</b><em>${esc(why(i))}</em></p></div><div class="exp-actions clear-actions"><button class="detail-button" onclick="openDetail('${i.id}')">Voir la fiche</button>${i.partner?`<button class="agenda-button pass-action ${reserved?'added':''}" onclick="reserveWithDolcia('${i.id}','${esc(slotLabel)}')">${reserved?'Réservation confirmée':'Réserver avec Dolcia'}</button>`:`<button class="agenda-button ${added?'added':''}" onclick="addAgenda('${i.id}','${esc(slotLabel)}')">${added?'Ajouté à mon agenda':'Ajouter à mon agenda'}</button>`}</div></article>`}
function sourcePresentation(i){
  if(i.partner)return'Partenaire Dolcia';
  if(i.officialSource)return esc(i.officialSource);
  if(i.official)return'Source officielle';
  return esc(i.source||'Source référencée');
}
function experienceV205(i,index,slotLabel=''){
  const added=state.agenda.some(item=>item.id===i.id),reserved=state.reservations.some(r=>r.itemId===i.id&&r.status!=='cancelled'),fallback=IMAGES[i.category]||IMAGES.fallback,trust=confidencePresentation(i);
  const guided=Boolean(i.autonomousProgram);
  const isSignature=(i.rating||0)>=4.6&&(i.reviews||0)>=50&&(i.official||i.quality==='verified'||i.ranking?.confidence==='confirmed');
  const price=i.free?'<span>Gratuit</span>':i.freeAccess?'<span>Accès libre · options payantes possibles</span>':i.price!=null?`<span>${i.price===0?'Gratuit':'€'.repeat(Math.min(i.price,4))}</span>`:'<span>Tarif non communiqué</span>';
  const dateMeta=i.date?`<span>${i.timeKnown===false?new Date(i.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})+' · horaire à vérifier':new Date(i.date).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</span>`:'';
  const travel=i.geoEligibility?.travel_minutes,travelMeta=travel!=null?`<span>${travel} min de trajet</span>`:i.distance!=null?`<span>${i.distance.toFixed(1)} km à vol d’oiseau</span>`:'';
  return `<article class="experience ${i.partner?'partner-ready':''} ${i.geoEligibility?.status==='outside'?'outside-scope':''}">${isSignature?'<span class="signature-ribbon">✦ Sélection Dolcia</span>':''}<button class="quick-heart ${state.favorites.includes(i.id)?'selected':''}" onclick="openReactionMenu('${i.id}')" aria-label="Dire à Dolcia si cette activité vous plaît">${state.favorites.includes(i.id)?'♥':'♡'}</button><img class="exp-image" src="${itemImage(i)}" alt="" onerror="this.onerror=null;this.src='${fallback}'"><div class="exp-copy"><span class="exp-label"><small>${sourcePresentation(i)}</small><i class="trust-badge ${trust[0]}">${trust[1]}</i></span><h3>${esc(i.name)}</h3><p>${esc(i.address||'Lieu exact à vérifier auprès de la source')}</p><div class="exp-meta">${travelMeta}${i.rating?`<span>Google ${i.rating}/5${i.reviews?` · ${i.reviews} avis`:''}</span>`:''}${price}${dateMeta}</div><p class="dolcia-voice"><b>✦ Pourquoi maintenant</b><em>${esc(why(i))}</em></p></div><div class="exp-actions clear-actions"><button class="detail-button" onclick="openDetail('${i.id}')">Voir</button><button class="agenda-button ${added?'added':''}" onclick="addAgenda('${i.id}','${esc(slotLabel)}')">${added?'Gardé':'Garder'}</button>${i.booking||i.partner?`<button class="agenda-button pass-action ${reserved?'added':''}" onclick="reserveWithDolcia('${i.id}','${esc(slotLabel)}')">${reserved?'Réservé':'Réserver'}</button>`:''}</div></article>`;
}
experience=experienceV205;
function programDecisionPrompt(slot,index){
  if(index>=state.program.length-1)return'';
  const item=slot.item,energy=experienceEnergy(item),band=itemBudgetBand(item),isLunch=/Déjeuner|12:|midi/i.test(slot.label),stay=state.answers.duration==='stay';
  if(isLunch&&['signature','exceptional'].includes(band)&&state.programPreferences.dining==='ask'){
    return `<aside class="d-decision dining">${dMascotMark('decision')}<div class="d-decision-copy"><small>D a repéré un choix utile</small><strong>Après ce beau repas, quelle couleur donner au prochain ?</strong><p>Je vous le demande parce qu’un budget confortable ne signifie pas « gastronomique tout le temps ». Je suivrai votre envie réelle.</p></div><div class="d-decision-options"><button onclick="applyProgramDirection('dining','signature')">Rester sur du gastronomique</button><button onclick="applyProgramDirection('dining','light')">Quelque chose de plus léger</button><button onclick="applyProgramDirection('dining','budget')">Compenser par un plaisir moins cher</button>${stay?`<button onclick="applyProgramDirection('dining','delivery')">Fatigués : livraison ou dîner à l’hôtel</button>`:''}</div></aside>`;
  }
  if(energy==='high'&&state.programPreferences.energy==='ask'){
    return `<aside class="d-decision energy">${dMascotMark('decision')}<div class="d-decision-copy"><small>D veille au rythme, sans l’imposer</small><strong>Vous venez de bouger. Comment voulez-vous poursuivre ?</strong><p>Je peux maintenir l’élan sportif, créer un contraste ou vous laisser récupérer. Aucune option n’est choisie sans vous.</p></div><div class="d-decision-options"><button onclick="applyProgramDirection('energy','continue')">On continue sport +++</button><button onclick="applyProgramDirection('energy','contrast')">On change d’énergie</button><button onclick="applyProgramDirection('energy','recover')">On ralentit vraiment</button></div></aside>`;
  }
  return'';
}
function applyProgramDirection(kind,value){
  if(!['energy','dining','fatigue'].includes(kind))return;
  state.programPreferences[kind]=value;
  state.companionMemory={...state.companionMemory,interactions:(state.companionMemory.interactions||0)+1,lastChoice:`${kind}:${value}`};
  save();
  state.program=buildProgram(state.allItems);
  if(state.majorChoice)state.program=injectMajorMoment(state.program);
  state.items=state.program.map(slot=>slot.item);
  renderSurprise();
  showToast('D a recomposé la suite selon votre choix — rien d’autre n’a été décidé pour vous');
}
function programSlot(slot,index){const protectedMoment=slot.item.id===state.majorChoice;return `<section class="program-slot"><div class="slot-heading"><span>${slot.label}</span><div class="slot-actions">${protectedMoment?'<button onclick="chooseMajorMoment(state.majorChoice)">Actualiser</button>':`<button onclick="regenerateSlot(${index})">Remplacer</button><button onclick="openSlotRefinement(${index})">Affiner</button>`}</div></div>${experience(slot.item,index,slot.label)}${programDecisionPrompt(slot,index)}</section>`}
function openSlotRefinement(index){const slot=state.program[index];if(!slot)return;document.body.insertAdjacentHTML('beforeend',`<div class="modal refine-modal" id="refineModal"><article><button class="close" onclick="document.querySelector('#refineModal')?.remove()">×</button><span class="kicker">L’Éclat affine ce moment</span><h2>Dites-moi simplement votre nuance.</h2><p>« Plus calme », « vue mer », « avec les enfants », « moins cher »… L’Éclat conservera votre horaire, votre groupe et votre budget.</p><input id="refineInput" autocomplete="off" placeholder="Ce que vous aimeriez plutôt…"><div class="refine-live" id="refineLive" aria-live="polite"></div><div><button class="secondary" onclick="document.querySelector('#refineModal')?.remove()">Annuler</button><button class="primary" onclick="applySlotRefinement(${index})">Affiner ce moment</button></div></article></div>`);setTimeout(()=>document.querySelector('#refineInput')?.focus(),50)}
function refineStatus(lines){const target=document.querySelector('#refineLive');if(target)target.innerHTML=lines.map(([stateText,text])=>`<div class="${stateText}"><b>${stateText==='done'?'✓':'✦'}</b><span>${esc(text)}</span></div>`).join('')}
async function applySlotRefinement(index){const input=document.querySelector('#refineInput'),query=input?.value.trim(),slot=state.program[index];if(!query||!slot)return showToast('Précisez ce que vous souhaitez');const steps=[['active',`Je comprends « ${query} »`]];refineStatus(steps);try{steps[0][0]='done';steps.push(['active',`Recherche autour de ${state.location.name}`]);refineStatus(steps);const response=await fetch(`/api/places?lat=${state.location.lat}&lng=${state.location.lng}&radius=${state.radius}&mode=text&keyword=${encodeURIComponent(query+' '+state.location.name)}`),data=await response.json(),raw=normalizePlaces(data.results||[]);steps[1][0]='done';steps.push(['active',`${raw.length} possibilités trouvées · vérification du contexte`]);refineStatus(steps);const ranked=await rankItemsServer(raw),found=ranked.filter(item=>isTimeCompatible(item,slot.label)&&!state.program.some(current=>current.item.id===item.id));steps[2][0]='done';steps.push([found.length?'done':'active',found.length?`${found.length} alternatives compatibles avec ce créneau`:'Aucune alternative assez fiable']);refineStatus(steps);if(!found.length)return;state.program[index]={...slot,item:found[0]};state.items=state.program.map(current=>current.item);setTimeout(()=>{document.querySelector('#refineModal')?.remove();renderSurprise();showToast('L’Éclat a recomposé uniquement ce moment')},450)}catch(_){refineStatus([...steps,['active','La source est momentanément indisponible']])}}
function alternativeGroup(group,index){return `<section class="alternative-group"><div class="slot-heading"><span>${group.label}</span><small>${group.total||group.items.length} possibilités vérifiées · les meilleures en premier</small></div><div class="alternative-list">${group.items.map((item,itemIndex)=>experience(item,index*12+itemIndex,group.label)).join('')}</div></section>`}
function geoWhy(i){if(i.geoEligibility?.status==='outside')return'Hors de la destination · cette proposition est exclue';if(i.geoEligibility?.status!=='extended')return'';const minutes=i.geoEligibility.travel_minutes;return [`Pépite locale exceptionnelle`,minutes!=null?`${minutes} min de trajet`:null,i.geoEligibility.decision_codes?.includes('HIGH_RARITY')?'rareté vérifiée et sourcée':i.official&&i.date?'rendez-vous unique à votre date':'élargissement demandé'].filter(Boolean).join(' · ')}
function why(i){const temp=state.weather?.main?.temp??18,vibes=state.answers.vibes||[],compatibility=momentCompatibility(i),group=i.ranking?.groupFit;if(geoWhy(i))return geoWhy(i);if(compatibility==='incompatible')return'Incompatible avec le créneau choisi';if(compatibility==='unknown'||compatibility==='open-not-session')return requiresPublishedSession(i)?'Séance ou réservation à confirmer':'Horaire à vérifier';if(group?.vetoes)return'Une réserve existe dans votre groupe · visible dans Explorer, exclue du programme composé';if(group?.ratio>=.75)return`Point d’accord fort · ${group.matched} affinités reconnues dans votre groupe`;if(compatibility==='autonomous')return'Accès libre possible · conditions à vérifier';if(i.retrievalScope==='signature')return [`Expérience régionale repérée pour votre journée`,i.geoEligibility?.travel_minutes!=null?`${i.geoEligibility.travel_minutes} min de trajet`:null,`le déplacement reste indiqué clairement`].filter(Boolean).join(' · ');if(compatibility==='confirmed'&&i.source==='Google Places')return [`Ouvert pour votre créneau`,i.geoEligibility?.travel_minutes!=null?`${i.geoEligibility.travel_minutes} min de trajet`:null,i.rating?`${i.rating}/5 · ${i.reviews||0} avis`:null].filter(Boolean).join(' · ');if(i.ranking?.reasons?.length)return i.ranking.reasons.map(reason=>reason.charAt(0).toUpperCase()+reason.slice(1)).join(' · ');if(i.discoveryPick)return'La pépite que vous n’auriez peut-être pas cherchée';if(i.official&&i.date)return'Événement officiel à votre date';if(temp>=25&&/plage|nautique|voile|surf|paddle|kayak|piscine/.test(plainText(i.name||'')))return'Idéal avec la météo du moment';if((state.tasteProfile[i.category]||0)>1)return'Inspiré de ce que vous aimez déjà';if(matchesIntentions(i,vibes))return'Correspond à votre envie maintenant';if(i.rating>=4.6&&i.reviews>=100)return'Valeur sûre très appréciée';if(i.distance!=null&&i.distance<2)return'Belle idée tout près de vous';return'Sélection Dolcia pour élargir vos envies'}
function composeCta(){return ({'2h':'Compose-moi 2 heures parfaites',morning:'Compose-moi ma matinée',afternoon:'Compose-moi mon après-midi',afternoon_evening:'Compose-moi la suite de ma journée',evening:'Compose-moi ma soirée',day:'Compose-moi ma journée',stay:'Compose-moi mon séjour'})[state.answers.duration]||'Compose mon moment'}
function emptyState(){return `<div class="empty-state"><span class="kicker">Toujours une alternative</span><h3>Le catalogue n’a pas encore livré la bonne idée.</h3><p>Dolcia peut relancer les sources, affiner votre envie ou créer une expérience autonome sans inventer un événement.</p><div class="empty-actions"><button class="primary" onclick="openDolciaAnimate()">Dolcia anime ce moment</button><button class="secondary" onclick="surprise()">${composeCta()}</button><button class="secondary" onclick="openEclatDialogue()">Parler à Dolcia</button></div></div>`}

const DOLCIA_ANIMATE_PROGRAMS={
  social:{title:'Le grand défi complice',tone:'Rire ensemble',duration:55,place:'Un espace public autorisé, calme et sûr',steps:[['00:00','Choisissez ensemble trois thèmes qui vous font rire.'],['00:05','Défi photo : recréez une scène de film sans accessoire.'],['00:20','Mission duo : faites deviner un souvenir uniquement avec des gestes.'],['00:35','Final collectif : inventez le slogan de votre journée et photographiez-le.'],['00:50','Chacun nomme son moment préféré.']]},
  party:{title:'La table des jeux cultes',tone:'Fous rires entre adultes',duration:50,place:'Hébergement, salon, terrasse ou espace autorisé',steps:[['00:00','Ni oui ni non express : une minute par personne, avec bienveillance.'],['00:10','Le menteur : chacun raconte trois mini-anecdotes, dont une inventée.'],['00:22','Mime éclair : faites deviner un film, une chanson ou une personne connue du groupe.'],['00:34','Cap ou pas cap complice : proposez uniquement un défi drôle, sûr et respectueux.'],['00:45','Final : élisez ensemble la réplique et le souvenir de la session.']]},
  family:{title:'L’aventure des petits explorateurs',tone:'Jouer en famille',duration:45,place:'Parc, plage ou hébergement autorisé',steps:[['00:00','L’adulte vérifie l’espace et choisit une zone délimitée.'],['00:05','Cherchez cinq couleurs, trois textures et deux sons.'],['00:18','Construisez une histoire avec ce que vous avez observé.'],['00:30','Défi coopération : rejoignez un point sans lâcher le lien du groupe.'],['00:40','Photo-souvenir et retour au calme.']]},
  water:{title:'La piscine devient un terrain de jeu',tone:'Parent-enfant',duration:35,place:'Bassin autorisé et adapté',steps:[['00:00','Avant de commencer : confirmez les règles, la profondeur et la surveillance.'],['00:04','Jeu des couleurs : rejoindre ensemble un repère visible.'],['00:12','Le petit train : avancer lentement en restant à portée de bras.'],['00:20','Les animaux de l’eau : imiter à tour de rôle un déplacement doux.'],['00:28','Retour au calme, respiration et sortie groupée.']]},
  calm:{title:'La parenthèse qui remet tout à zéro',tone:'Souffler vraiment',duration:30,place:'Espace calme, sûr et autorisé',steps:[['00:00','Installez-vous confortablement, sans gêner le passage.'],['00:03','Respirez lentement et observez cinq détails autour de vous.'],['00:10','Marche silencieuse : chacun choisit son rythme.'],['00:20','Étirement doux sans douleur ni performance.'],['00:27','Choisissez ensemble la suite de votre journée.']]}
};
function suggestedAnimateProgram(){const vibes=state.answers.vibes||[],who=state.answers.who;if(state.answers.momentSentence&&/piscine|bassin|eau/.test(plainText(state.answers.momentSentence)))return'water';if(who==='family')return'family';if(vibes.includes('recharge'))return'calm';if(['friends','colleagues'].includes(who)&&vibes.includes('play'))return'party';return'social'}
function openDolciaAnimate(){
  document.querySelector('#dolciaAnimate')?.remove();
  const selected=suggestedAnimateProgram();
  document.body.insertAdjacentHTML('beforeend',`<div class="modal dolcia-animate" id="dolciaAnimate"><article><button class="close" onclick="document.querySelector('#dolciaAnimate')?.remove()">×</button><header><span>D<i>✦</i></span><div><small>Programme autonome Dolcia</small><h2>Et si Dolcia animait ce moment ?</h2><p>Choisissez une direction. Je vous guiderai étape par étape, sans inventer de lieu ni de prestation.</p></div></header><div class="animate-choices">${Object.entries(DOLCIA_ANIMATE_PROGRAMS).map(([id,program])=>`<button class="${selected===id?'selected':''}" onclick="previewDolciaAnimate('${id}')"><small>${esc(program.tone)} · ${program.duration} min</small><strong>${esc(program.title)}</strong><span>${esc(program.place)}</span></button>`).join('')}</div><div id="animatePreview"></div><aside><b>Avant de commencer</b><span>Vous restez responsable du lieu, des règles locales, des personnes et du matériel. Dolcia n’est ni un encadrant diplômé, ni un maître-nageur. Avec des enfants dans l’eau : surveillance adulte active, constante et à portée de bras.</span></aside></article></div>`);
  previewDolciaAnimate(selected)
}
function previewDolciaAnimate(id){
  const program=DOLCIA_ANIMATE_PROGRAMS[id],target=document.querySelector('#animatePreview');if(!program||!target)return;
  document.querySelectorAll('.animate-choices button').forEach(button=>button.classList.toggle('selected',button.getAttribute('onclick')?.includes(`'${id}'`)));
  target.innerHTML=`<section><div><span class="kicker">${esc(program.tone)}</span><h3>${esc(program.title)}</h3><p>${esc(program.place)} · ${program.duration} minutes</p></div><ol>${program.steps.map(step=>`<li><time>${step[0]}</time><span>${esc(step[1])}</span></li>`).join('')}</ol><label><input type="checkbox" id="animateSafety"> J’ai vérifié le lieu, les règles et la sécurité du groupe.</label><div><button class="secondary" onclick="addDolciaAnimate('${id}')">Ajouter au programme</button><button class="primary" onclick="startDolciaAnimate('${id}')">Commencer avec la voix</button></div></section>`
}
function dolciaAnimateItem(id){
  const program=DOLCIA_ANIMATE_PROGRAMS[id];return{id:`dolcia-animate-${id}-${Date.now()}`,name:program.title,tone:program.tone,category:id==='calm'?'slow':id==='water'?'outside':'active',source:'Programme Dolcia',address:program.place,summary:`Expérience autonome guidée par Dolcia · ${program.duration} minutes`,free:true,price:0,detailsKnown:true,autonomousProgram:id,steps:program.steps,quality:'verified',official:false,photo:IMAGES[id==='family'?'family':id==='calm'?'slow':id==='water'?'outside':'friends']}
}
function injectDolciaAutonomousChoices(){
  const strictFree=state.answers.budget==='free';
  const socialLaugh=state.answers.who==='friends'&&((state.answers.vibes||[]).includes('play')||/rire|fou rire|rigoler|s.amuser|amis/.test(plainText(state.answers.momentSentence||'')));
  if(!strictFree||!socialLaugh)return;
  const item=dolciaAnimateItem('social');
  item.id='dolcia-animate-social-catalog';
  item.name='Le Touquet en défis avec D';
  item.address='Au Touquet · départ à choisir avec votre groupe';
  item.summary='Défis, jeux connus et fous rires guidés par D · gratuit · sans réservation';
  item.distance=0;
  item.isOpen=true;
  item.ranking={confidence:'confirmed',reasons:['gratuit confirmé','adapté à votre groupe','sans trajet imposé']};
  item.geoEligibility={status:'core',premium_eligible:true,destinationLocalityMatch:true,travel_minutes:0,decision_codes:['LOCAL_AUTONOMOUS_D']};
  if(!state.allItems.some(candidate=>candidate.id===item.id))state.allItems.unshift(item);
}
function ensureAnimateSafety(){if(!document.querySelector('#animateSafety')?.checked){showToast('Confirmez d’abord le lieu, les règles et la sécurité du groupe');return false}return true}
function addDolciaAnimate(id){if(!ensureAnimateSafety())return;const item=dolciaAnimateItem(id);state.allItems.push(item);state.agenda.push({...item,agendaDate:new Date().toISOString(),agendaSlot:'Programme autonome Dolcia'});save();document.querySelector('#dolciaAnimate')?.remove();renderAgenda();showToast('Programme Dolcia ajouté à votre agenda')}
function startDolciaAnimate(id){
  if(!ensureAnimateSafety())return;
  const item=dolciaAnimateItem(id);
  const roster=currentGroupProfiles().map(person=>person.name).filter(Boolean);
  state.activeAnimate={item,index:0,startedAt:new Date().toISOString(),lastInteractionAt:Date.now(),elan:0,completed:0,adjustments:[],reactions:[],status:'active',roster:roster.length?roster:['Le groupe'],captainIndex:0,streak:0,laughs:0,messages:[],insideJokes:[],nudgeCount:0};
  document.querySelector('#dolciaAnimate')?.remove();
  save();renderDolciaAnimateLive()
}
function pickVoiceLine(options){return options[Math.floor(Math.random()*options.length)]}
function animateCaptain(session){const roster=session.roster?.length?session.roster:['Le groupe'];return roster[session.captainIndex%roster.length]}
function animatePersonalTouch(session){
  const captain=animateCaptain(session),joke=(session.insideJokes||[]).at(-1)||(state.companionMemory.rituals||[]).at(-1);
  if(joke&&session.index>1)return`${captain}, gardez « ${joke} » sous le coude : je sens que ça peut revenir au meilleur moment.`;
  return captain==='Le groupe'?'Je reste avec vous et je règle le rythme en direct.':`${captain}, vous êtes capitaine de cette mission — juste pour lancer le mouvement, pas pour commander la troupe.`;
}
function animateCoachLine(session){
  if(!session.index)return pickVoiceLine([
    `Je lance le groupe. ${animatePersonalTouch(session)}`,
    `Bon, on y va. ${animatePersonalTouch(session)}`,
    `Ok, c’est parti. ${animatePersonalTouch(session)}`
  ]);
  const last=session.reactions.at(-1);
  if(last==='great')return pickVoiceLine([
    'Je vous sens lancés. Je garde cette énergie et je fais monter le moment d’un cran.',
    'Ah, ça, c’est le genre d’énergie que j’aime. On garde ce rythme et on pousse un peu plus.',
    'Voilà, c’est exactement ça. Je monte d’un cran sans rien casser.'
  ]);
  if(last==='calmer')return pickVoiceLine([
    'J’ai compris. Je ralentis sans casser l’ambiance.',
    'Ok, on souffle un peu. Je baisse l’intensité, l’ambiance reste.',
    'Mmh, reçu. On calme le jeu, tranquillement.'
  ]);
  if(last==='livelier')return pickVoiceLine([
    'On réveille le groupe. La prochaine mission sera plus vive et plus collective.',
    'Allez, on secoue un peu tout ça. La suite sera plus vivante, promis.',
    'Ok, plus de peps. Je prépare quelque chose de plus collectif.'
  ]);
  if(last==='skip')return pickVoiceLine([
    'Cette mission ne vous correspondait pas. Je l’oublie pour la suite, sans pénalité.',
    'Pas grave, celle-là n’était pas pour vous. On passe à autre chose, aucun souci.',
    'Ok, on efface celle-ci. Ça ne change rien pour la suite.'
  ]);
  return pickVoiceLine([
    'Le groupe avance. Je garde le fil et j’adapte la suite à vos réactions.',
    'On continue sur cette lancée. J’ajuste au fur et à mesure de ce que vous me dites.',
    'Ça avance bien. Je garde un œil sur le rythme du groupe.'
  ]);
}
function animateStepText(session){
  const base=session.item.steps[session.index][1],last=session.reactions.at(-1);
  if(last==='calmer')return`${base} Faites-le tranquillement, sans vitesse ni compétition.`;
  if(last==='livelier')return`${base} Donnez-vous un mini compte à rebours et célébrez le résultat ensemble.`;
  return base
}
function renderDolciaAnimateLive(options={}){
  const session=state.activeAnimate;if(!session)return;
  document.querySelector('#animateLive')?.remove();
  const step=session.item.steps[session.index],progress=Math.round(session.completed/session.item.steps.length*100),last=session.index===session.item.steps.length-1;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal animate-live" id="animateLive"><article>
    <button class="close" onclick="pauseDolciaAnimate()" aria-label="Mettre la session en pause">×</button>
    <header class="animate-presence">${dMascotMark('large')}<div><small>D anime en direct</small><strong>${esc(session.item.tone||'Votre moment')}</strong></div><div class="animate-elan"><b>${session.elan}</b><span>Élan collectif</span></div></header>
    <p class="animate-coach-line">« ${esc(animateCoachLine(session))} »</p>
    <div class="animate-session-meta"><span>Mission ${session.index+1}/${session.item.steps.length}</span><span>Capitaine · ${esc(animateCaptain(session))}</span><span>${progress}% vécu</span><span>${session.streak||0} série</span></div>
    <h2>${esc(session.item.name)}</h2>
    <div class="animate-live-step"><time>${esc(step[0])}</time><p>${esc(animateStepText(session))}</p></div>
    <div class="animate-response"><small>Comment vit le groupe ?</small><div>
      <button onclick="reactDolciaAnimate('great')">Ça prend ✦</button>
      <button onclick="reactDolciaAnimate('laugh')">On a ri</button>
      <button onclick="reactDolciaAnimate('calmer')">Plus calme</button>
      <button onclick="reactDolciaAnimate('livelier')">Plus vivant</button>
      <button onclick="reactDolciaAnimate('skip')">Pas pour nous</button>
    </div></div>
    ${animateConversationMarkup(session)}
    <div class="animate-talk"><input id="animateTalkInput" placeholder="Une réaction, une anecdote, un clin d’œil…"><button onclick="askAnimateCoach()">Dire à D</button><button onclick="rememberAnimateJoke()">Garder ce clin d’œil</button></div>
    <div class="animate-live-actions"><button onclick="speakAnimateStep()">Dites-le à voix haute</button><button class="animate-live-voice" onclick="toggleLiveConversation('animate')" aria-pressed="false"><i></i>Parler à D en direct</button><button class="primary" onclick="completeDolciaAnimateStep()">${last?'Clore ce moment':'Mission accomplie →'}</button></div>
    <progress value="${session.completed}" max="${session.item.steps.length}"></progress>
    <small class="animate-trust">L’Élan mémorise la progression du groupe. Il ne classe jamais les personnes et ne pénalise aucun refus.</small>
  </article></div>`);
  setDVisualState('encouraging');
  if(options.speak!==false)speakAnimateStep();
  scheduleAnimateNudge()
}
function animateNudgeLine(session){
  const captain=animateCaptain(session);
  if((session.reactions||[]).length===0)return`${captain}, je vous laisse vivre la mission. Un signe suffit si vous voulez plus de rythme ou plus de calme.`;
  if((session.laughs||0)>0)return`Je note que le rire est bien là. On garde cette énergie ou je vous prépare un virage inattendu ?`;
  if((session.streak||0)>=2)return`Belle série. Je peux monter d’un cran, mais seulement si vous en avez envie.`;
  return`Petit point d’étape : l’énergie vous convient, ou j’ajuste la suite ?`
}
function scheduleAnimateNudge(){
  window.clearTimeout(animateNudgeTimer);
  const session=state.activeAnimate;if(!session||session.status!=='active')return;
  animateNudgeTimer=window.setTimeout(()=>{
    if(!state.activeAnimate||state.activeAnimate!==session||!document.querySelector('#animateLive'))return;
    if(Date.now()-(session.lastInteractionAt||0)<42000)return scheduleAnimateNudge();
    const line=animateNudgeLine(session);session.nudgeCount=(session.nudgeCount||0)+1;
    document.querySelector('#animateNudge')?.remove();
    document.querySelector('.animate-live-step')?.insertAdjacentHTML('afterend',`<aside class="animate-nudge" id="animateNudge">${dMascotMark('mini')}<p>${esc(line)}</p><div><button onclick="acceptAnimateNudge('continue')">On continue</button><button onclick="acceptAnimateNudge('adapt')">Adapte la suite</button></div></aside>`);
    setDVisualState('encouraging');playPremiumVoice(line,()=>setDVisualState('idle'))
  },52000)
}
function acceptAnimateNudge(choice){
  const session=state.activeAnimate;if(!session)return;
  session.lastInteractionAt=Date.now();session.adjustments.push({step:session.index,reaction:`nudge_${choice}`,at:new Date().toISOString()});
  document.querySelector('#animateNudge')?.remove();
  if(choice==='adapt'){setDVisualState('thinking',900);document.querySelector('#animateTalkInput')?.focus();showToast('D vous écoute : dites simplement ce qu’il faut changer')}
  else{setDVisualState('delighted',1200);showToast('Parfait, D garde ce rythme')}
  save();scheduleAnimateNudge()
}
function animateConversationMarkup(session){
  const messages=(session.messages||[]).slice(-4);
  if(!messages.length)return`<div class="animate-conversation empty"><span>D écoute aussi ce qui se passe entre les missions.</span></div>`;
  return`<div class="animate-conversation" aria-live="polite">${messages.map(message=>`<p class="${message.role==='user'?'from-group':'from-d'}">${message.role==='assistant'?'<b>D✦</b>':''}<span>${esc(message.content)}</span></p>`).join('')}</div>`
}
async function askAnimateCoach(){
  const session=state.activeAnimate,input=document.querySelector('#animateTalkInput'),text=input?.value.trim();if(!session||!text)return;
  session.lastInteractionAt=Date.now();session.messages=session.messages||[];session.messages.push({role:'user',content:text});setDVisualState('thinking');save();renderDolciaAnimateLive({speak:false});
  try{
    const response=await fetch('/api/events?service=coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'animate',messages:session.messages.slice(-10),context:buildLiveContext('animate')})});
    if(!response.ok)throw new Error('coach');
    const data=await response.json(),reply=String(data.reply||'').trim();
    if(reply){session.messages.push({role:'assistant',content:reply});setDVisualState('speaking');playPremiumVoice(reply,()=>setDVisualState('idle'))}
  }catch(_){
    session.messages.push({role:'assistant',content:`${animateCaptain(session)}, je garde ça en tête. Vous préférez que je relance l’énergie ou que je laisse le groupe savourer ?`});
  }
  state.companionMemory.interactions=(Number(state.companionMemory.interactions)||0)+1;save();renderDolciaAnimateLive({speak:false})
}
function rememberAnimateJoke(){
  const session=state.activeAnimate,input=document.querySelector('#animateTalkInput'),text=input?.value.trim();if(!session||!text)return showToast('D a besoin de quelques mots pour retenir votre clin d’œil');
  session.lastInteractionAt=Date.now();session.insideJokes=[...new Set([...(session.insideJokes||[]),text])].slice(-5);
  state.companionMemory.rituals=[...new Set([...(state.companionMemory.rituals||[]),text])].slice(-8);
  input.value='';save();showToast('D gardera ce clin d’œil pour votre groupe');renderDolciaAnimateLive()
}
function speakAnimateStep(){
  const session=state.activeAnimate;if(!session)return;
  const text=`${animateCoachLine(session)} ${animateStepText(session)}`;
  setDVisualState('speaking');playPremiumVoice(text,()=>setDVisualState('idle'))
}
function reactDolciaAnimate(reaction){
  const session=state.activeAnimate;if(!session)return;
  session.lastInteractionAt=Date.now();
  session.reactions.push(reaction);
  session.adjustments.push({step:session.index,reaction,at:new Date().toISOString()});
  if(reaction==='great'){session.elan+=15;session.streak=(session.streak||0)+1}
  if(reaction==='laugh'){session.elan+=12;session.laughs=(session.laughs||0)+1;session.streak=(session.streak||0)+1}
  if(reaction==='livelier')session.elan+=8;
  if(reaction==='calmer')session.elan+=5;
  if(reaction==='skip'){session.streak=0}
  const visual=reaction==='laugh'||reaction==='great'?'delighted':reaction==='calmer'?'calm':reaction==='livelier'?'encouraging':'thinking';
  setDVisualState(visual);save();renderDolciaAnimateLive()
}
function completeDolciaAnimateStep(){
  const session=state.activeAnimate;if(!session)return;
  session.lastInteractionAt=Date.now();
  session.completed=Math.max(session.completed,session.index+1);
  session.elan+=10;
  if(session.index>=session.item.steps.length-1)return finishDolciaAnimate();
  session.index+=1;session.captainIndex=(session.captainIndex+1)%(session.roster?.length||1);save();renderDolciaAnimateLive()
}
function finishDolciaAnimate(){
  const session=state.activeAnimate;if(!session)return;
  window.clearTimeout(animateNudgeTimer);
  const completedAt=new Date().toISOString(),record={id:session.item.id,title:session.item.name,program:session.item.autonomousProgram,startedAt:session.startedAt,completedAt,elan:session.elan,laughs:session.laughs||0,completed:session.completed,total:session.item.steps.length,adjustments:session.adjustments,insideJokes:session.insideJokes||[]};
  state.animateHistory.unshift(record);state.animateHistory=state.animateHistory.slice(0,30);
  if(!state.agenda.some(item=>item.id===session.item.id))state.agenda.push({...session.item,agendaDate:new Date().toISOString(),agendaSlot:'Programme autonome Dolcia',completedAt,animateElan:session.elan});
  save();document.querySelector('#animateLive')?.remove();state.activeAnimate=null;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal animate-finale" id="animateFinale"><article>${dMascotMark('large')}<small>Moment accompli</small><h2>Votre groupe a créé<br>son propre souvenir.</h2><div><b>${record.elan}</b><span>points d’Élan collectif · ${record.laughs} éclat${record.laughs>1?'s':''} de rire</span></div><p>J’ai retenu votre rythme, vos refus et vos clins d’œil — jamais pour vous noter, seulement pour mieux vous retrouver la prochaine fois.</p><button class="primary" onclick="document.querySelector('#animateFinale')?.remove();renderAgenda()">Retrouver ce moment</button></article></div>`)
}
function pauseDolciaAnimate(){stopLiveConversation();window.clearTimeout(animateNudgeTimer);setDVisualState('idle');if('speechSynthesis'in window)window.speechSynthesis.cancel();document.querySelector('#animateLive')?.remove();if(state.activeAnimate){state.activeAnimate.status='paused';save();showToast('Votre session est en pause. D garde votre progression.')}}
function stopDolciaAnimate(){pauseDolciaAnimate()}

function detailMapUrl(item){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([item.name,item.address||state.location?.name].filter(Boolean).join(' '))}`}
function detailQuickActions(item){const added=state.agenda.some(entry=>entry.id===item.id),liked=state.favorites.includes(item.id);return `<div class="detail-sticky-actions"><button class="detail-back" onclick="closeDetail()">← Retour</button><button class="detail-like ${liked?'selected':''}" onclick="rate('${item.id}','favorite')">${liked?'♥ Dans mes envies':'♡ Cette idée me plaît'}</button><button class="detail-map" onclick="window.open('${detailMapUrl(item)}','_blank')">Itinéraire ↗</button><button class="detail-add ${added?'added':''}" onclick="addAgenda('${item.id}')">${added?'Déjà dans mon agenda':'Ajouter à mon agenda'}</button></div>`}
function saveDetailIdea(id){if(!state.favorites.includes(id))state.favorites.push(id);save();showToast('Cette idée est conservée dans vos envies');const item=state.allItems.find(entry=>entry.id===id)||state.items.find(entry=>entry.id===id);if(item)openDetailRefresh(id)}
async function openDetail(id){
  const item=state.allItems.find(x=>x.id===id)||state.items.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);
  if(!item)return;
  /* La fiche reste utile même lorsqu'une source externe répond mal. */
  const initialPhoto=itemImage(item),initialAddress=item.address||state.location?.name||'Localisation à confirmer';
  document.body.insertAdjacentHTML('beforeend',`<div class="modal detail-modal" id="modal" onclick="if(event.target===this)closeDetail()"><article class="detail detail-progressive">${detailQuickActions(item)}<div class="detail-image" style="background-image:url('${initialPhoto}')"></div><div class="detail-body"><span class="kicker">Fiche disponible · enrichissement en cours</span><h2>${esc(item.name)}</h2><p>${esc(item.summary||whyDetail(item))}</p><div class="verified-facts"><div><b>Localisation connue</b><span>${esc(initialAddress)}</span></div><div><b>Pourquoi Dolcia</b><span>${esc(why(item))}</span></div></div><div class="detail-live-status"><span class="loader"></span><p>Dolcia vérifie les horaires, contacts, photos et liens officiels. Vous pouvez déjà revenir, afficher l’itinéraire ou conserver cette idée.</p></div><div class="detail-actions"><button class="primary" onclick="addAgenda('${item.id}')">Ajouter à mon agenda</button><button class="secondary" onclick="saveDetailIdea('${item.id}')">Garder dans mes envies</button><button class="secondary" onclick="window.open('${detailMapUrl(item)}','_blank')">Voir sur la carte</button></div><small class="build-mark">Dolcia ${APP_BUILD}</small></div></article></div>`);
  let details=null;
  if(item.source==='Google Places'&&item.placeId){
    try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500),response=await fetch(`/api/place-details?id=${encodeURIComponent(item.placeId)}`,{signal:controller.signal});clearTimeout(timer);details=await response.json()}catch(_){details={verified:false,status:'UNAVAILABLE'}}
    if(!details.verified){details=null;item.quality='documented';item.detailWarning='Les informations déjà affichées restent disponibles. Les champs décisifs encore absents sont indiqués séparément.'}
    if(details)Object.assign(item,{name:details.name||item.name,address:details.address||item.address,phone:details.phone,website:details.website,booking:details.booking||item.booking,googleUrl:details.googleUrl,rating:details.rating||item.rating,reviews:details.reviews||item.reviews,isOpen:details.openNow,summary:details.summary,hours:details.hours,photos:details.photos?.length?details.photos:item.photos,photo:details.photos?.[0]||item.photo,officialSource:details.officialSource,officialCheckedAt:details.officialCheckedAt});
  }
  const photos=(item.photos?.length?item.photos:[itemImage(item)]).slice(0,6);
  const verified=item.source==='Google Places'?Boolean(details?.verified):Boolean(item.official&&item.date&&item.address);
  const facts=[
    item.address?`<div><b>Adresse</b><span>${esc(item.address)}</span></div>`:'<div><b>Adresse</b><span>Lieu exact à confirmer · la fiche reste consultable</span></div>',
    item.date?`<div><b>Date</b><span>${new Date(item.date).toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'})}</span></div>`:'',
    item.phone?`<div><b>Téléphone</b><span><a href="tel:${esc(item.phone.replace(/\s+/g,''))}" class="phone-link">${esc(item.phone)}</a></span></div>`:'<div><b>Téléphone</b><span>Non communiqué</span></div>',
    item.rating?`<div><b>Avis Google</b><span>${item.rating}/5${item.reviews?` · ${item.reviews} avis`:''}</span></div>`:'',
    item.isOpen!=null?`<div><b>Ouverture</b><span>${item.isOpen?'Ouvert actuellement':'Fermé actuellement'}</span></div>`:'',
    item.hours?.length?`<div><b>Horaires</b><span>${item.hours.map(esc).join('<br>')}</span></div>`:''
  ].filter(Boolean).join('');
  const links=[`<button class="secondary" onclick="window.open('${item.googleUrl?esc(item.googleUrl):detailMapUrl(item)}','_blank')">Voir sur la carte</button>`,item.phone?`<button class="secondary phone-cta" onclick="window.location.href='tel:${esc(item.phone.replace(/\s+/g,''))}'">Appeler</button>`:'',item.website?`<button class="secondary" onclick="window.open('${esc(item.website)}','_blank')">Site officiel</button>`:'',item.booking?`<button class="secondary" onclick="window.open('${esc(item.booking)}','_blank')">Réserver</button>`:''].join('');
  const modal=document.querySelector('#modal');if(!modal)return;
  modal.setAttribute('onclick','if(event.target===this)closeDetail()');
  modal.innerHTML=`<article class="detail">${detailQuickActions(item)}<div class="detail-image" id="detailHero" style="background-image:url('${photos[0]}')"></div>${photos.length>1?`<div class="photo-strip">${photos.map((p,n)=>`<button class="photo-thumb ${n===0?'active':''}" style="background-image:url('${p}')" onclick="selectPhoto(this,'${p}')" aria-label="Photo ${n+1}"></button>`).join('')}</div>`:''}<div class="detail-body"><span class="kicker">${verified?'Information vérifiée':'Fiche utile · informations partielles'}</span><h2>${esc(item.name)}</h2><p>${esc(item.summary||whyDetail(item))}</p>${item.officialSource?`<div class="source-proof"><b>Confirmé par ${esc(item.officialSource)}</b><span>Source officielle consultée${item.officialCheckedAt?' le '+new Date(item.officialCheckedAt).toLocaleDateString('fr-FR'):''}</span></div>`:''}${item.detailWarning?`<div class="detail-warning">${esc(item.detailWarning)} Vérifiez les informations décisives avant de réserver.</div>`:''}<div class="verified-facts">${facts}</div>${preExperiencePanel(item)}${hasHappened(item)?postExperiencePanel(item):''}<div class="detail-actions"><button class="primary" onclick="addAgenda('${item.id}')">Ajouter à mon agenda</button><button class="secondary" onclick="saveDetailIdea('${item.id}')">Garder dans mes envies</button>${links}</div><small class="build-mark">Dolcia ${APP_BUILD}</small></div></article>`;
}
function preExperiencePanel(item){return `<div class="preference-panel emotion-panel"><span class="emotion-kicker">Avant de le vivre</span><strong>Est-ce que ce moment vous ressemble ?</strong><div class="preference-actions"><button class="${state.favorites.includes(item.id)?'selected':''}" onclick="rate('${item.id}','favorite')">Coup de cœur</button><button class="${state.feedback[item.id]==='like'?'selected':''}" onclick="rate('${item.id}','like')">Ça me donne envie</button><button class="${state.feedback[item.id]==='later'?'selected':''}" onclick="rate('${item.id}','later')">Pas maintenant</button><button class="${state.feedback[item.id]==='dislike'?'selected':''}" onclick="rate('${item.id}','dislike')">Pas pour moi</button></div><small>Ces choix restent privés et affinent uniquement votre concierge.</small></div>`}
function hasHappened(item){const agendaItem=state.agenda.find(x=>x.id===item.id);return Boolean(agendaItem?.agendaDate&&new Date(agendaItem.agendaDate).getTime()<=Date.now())}
function feelingWeight(value){return({unforgettable:3,loved:2,nice:1,notforme:-2,disappointing:-3})[value]||0}
function postExperiencePanel(item){const reactions=['Vécu ensemble','À refaire','Pas pour moi','Une belle surprise','Favori de la famille'],memory=state.experienceMemories[item.id]||{};const feelings=[['unforgettable','Inoubliable'],['loved','J’ai adoré'],['nice','Un joli moment'],['notforme','Pas pour moi'],['disappointing','Décevant']];const tags=[['value','Bon rapport qualité-prix'],['family','Parfait avec les enfants'],['couple','Idéal à deux'],['discovery','Belle découverte'],['welcome','Accueil remarquable'],['again','À refaire'],['expensive','Trop cher'],['far','Trop loin'],['touristy','Trop touristique']];const selected=state.experienceTags[item.id]||[];return `<div class="experience-memory"><span class="emotion-kicker">Après l’expérience · Notre constellation</span><h3>Quel souvenir gardez-vous de ce moment ?</h3><div class="memory-reactions">${reactions.map(label=>`<button class="${memory.reaction===label?'selected':''}" onclick="rememberExperience('${item.id}','${label}')">${label}</button>`).join('')}</div><p>Comment vous êtes-vous senti ?</p><div class="feeling-scale">${feelings.map(([id,label])=>`<button class="${state.experienceFeelings[item.id]===id?'selected':''}" onclick="saveFeeling('${item.id}','${id}')">${label}</button>`).join('')}</div><p>Qu’est-ce qui a compté ?</p><div class="memory-tags">${tags.map(([id,label])=>`<button class="${selected.includes(id)?'selected':''}" onclick="toggleExperienceTag('${item.id}','${id}')">${label}</button>`).join('')}</div><small>Votre ressenti nourrit vos prochaines compositions. Vous pouvez tout consulter, corriger ou effacer dans Notre constellation.</small></div>`}
function selectPhoto(button,url){document.querySelector('#detailHero').style.backgroundImage=`url('${url}')`;document.querySelectorAll('.photo-thumb').forEach(x=>x.classList.remove('active'));button.classList.add('active')}
function whyDetail(i){return i.source==='OpenAgenda'?'Cette expérience a lieu pendant les dates choisies et correspond à l’ambiance recherchée.':'Cette adresse réelle correspond à vos envies, à votre destination et au rythme du moment.'}
function closeDetail(){document.querySelector('#modal')?.remove()}
async function addAgenda(id,slotLabel=''){const i=state.allItems.find(x=>x.id===id)||state.items.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!i)return;const returnTo=state.view;if(i.source==='Google Places'&&i.placeId&&!i.detailsKnown){showToast('Dolcia vérifie le créneau avant de l’ajouter…');try{const response=await fetch(`/api/place-details?id=${encodeURIComponent(i.placeId)}`),details=await response.json();if(details.verified)Object.assign(i,{detailsKnown:true,openingPeriods:details.openingPeriods||[],hours:details.hours||[],phone:details.phone||null,website:details.website||null,booking:details.booking||details.website||i.booking,isOpen:details.openNow,officialSource:details.officialSource||null})}catch(_){}}
  const compatibility=momentCompatibility(i);
  if(compatibility==='incompatible')return showToast('Cette activité n’est pas compatible avec votre horaire');
  if(compatibility==='open-not-session'||(compatibility==='unknown'&&requiresPublishedSession(i)))return showToast('Impossible de l’ajouter sans séance réellement confirmée');
  if(compatibility==='unknown')return showToast('Dolcia doit encore confirmer l’horaire avant l’ajout');
  if(!state.agenda.some(x=>x.id===id)){state.agenda.push({...i,agendaDate:agendaDateFor(i,slotLabel),agendaSlot:slotLabel,addedAt:new Date().toISOString(),timeConfidence:compatibility});save();showToast(compatibility==='autonomous'?'Activité libre ajoutée · vérifiez les conditions':'Activité vérifiée et ajoutée à votre agenda')}else showToast('Cette activité est déjà dans votre agenda');closeDetail();if(returnTo==='surprise')renderSurprise();else if(returnTo==='results')renderResults()}
function agendaDateFor(item,slotLabel=''){if(item.date)return item.date;const date=new Date(state.dateStart);const match=slotLabel.match(/(\d{2}):(\d{2})/);if(match)date.setHours(Number(match[1]),Number(match[2]),0,0);return date.toISOString()}
function adoptSurprise(){state.program.forEach(slot=>{if(!state.agenda.some(item=>item.id===slot.item.id))state.agenda.push({...slot.item,agendaDate:agendaDateFor(slot.item,slot.label),agendaSlot:slot.label,addedAt:new Date().toISOString(),fromSurprise:true})});state.agenda.sort((a,b)=>new Date(a.agendaDate)-new Date(b.agendaDate));save();showToast('Votre programme est ajouté à l’agenda');renderAgenda()}
function surprise(forceNew=false){if(!state.allItems.length){state.radius=Math.min(state.radius*1.6,60000);showToast('Dolcia compose votre programme…');return compose()}if(forceNew||state.view!=='surprise'){const pool=[...state.allItems].sort(()=>Math.random()-.5);state.program=buildProgram(pool);if(state.majorChoice)state.program=injectMajorMoment(state.program);state.items=state.program.map(slot=>slot.item)}renderSurprise();showToast(forceNew?'Un nouveau programme vient d’être composé':'Votre programme est prêt')}
function regenerateSlot(index){const current=state.program[index];if(!current)return;const excluded=state.program.map(slot=>slot.item.id);const categories=slotCategories(current.label);const strict=categories.length===1&&categories[0]==='hotel';const replacement=state.allItems.find(item=>!excluded.includes(item.id)&&categories.includes(item.category))||(strict?null:state.allItems.find(item=>!excluded.includes(item.id)));if(!replacement)return showToast(strict?'Aucun autre hébergement réel et vérifié pour le moment':'Pas encore d’autre idée réelle pour ce créneau');state.program[index]={...current,item:replacement};state.items=state.program.map(slot=>slot.item);state.view==='surprise'?renderSurprise():renderResults();showToast('Cette activité a été remplacée')}
function slotCategories(label){if(/manger|table/.test(label))return['food'];if(/soir|Vibrer|final|Prolonger/.test(label))return['night','culture','food','outside'];if(/hébergement/.test(label))return['hotel'];return['outside','active','culture','slow']}
function rate(id,value){const item=state.allItems.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!item)return;if(value==='favorite'){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]}else{const previous=state.feedback[id],oldDelta=previous==='like'?1:previous==='dislike'?-1:0,newDelta=value==='like'?1:value==='dislike'?-1:0;state.feedback[id]=previous===value?null:value;state.tasteProfile[item.category]=Math.max(-5,Math.min(8,(state.tasteProfile[item.category]||0)-oldDelta+(previous===value?0:newDelta)))}save();refreshRecommendations();showToast(value==='favorite'?'Coup de cœur mémorisé':value==='like'?'Dolcia comprend mieux vos envies':value==='later'?'Cette idée reviendra au meilleur moment':'Dolcia proposera moins ce type d’idée')}
function openReactionMenu(id){const item=state.allItems.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!item)return;document.body.insertAdjacentHTML('beforeend',`<div class="modal reaction-modal" id="reactionModal"><article><button class="close" onclick="document.querySelector('#reactionModal')?.remove()">×</button><span class="kicker">Votre ressenti affine Dolcia</span><h2>${esc(item.name)}</h2><p>Ce choix sera mémorisé avec le contexte de cette sortie, pas comme une vérité valable à chaque instant.</p><div>${[['favorite','♥','Coup de cœur','J’adorerais vivre ça'],['like','✦','Ça me tente','Bonne idée pour ce moment'],['later','◷','Pas aujourd’hui','À reproposer dans un autre contexte'],['dislike','—','Pas pour moi','Éviter durablement ce style']].map(([idReaction,icon,title,copy])=>`<button onclick="contextualRate('${item.id}','${idReaction}')"><b>${icon}</b><span><strong>${title}</strong><small>${copy}</small></span></button>`).join('')}</div></article></div>`)}
function contextualRate(id,value){state.feedbackContext[id]={value,who:state.answers.who||'unknown',groupDetail:state.answers.groupDetail||'',vibes:[...(state.answers.vibes||[])],weather:state.weather?.weather?.[0]?.main||'',temperature:state.weather?.main?.temp??null,dateMode:state.dateMode,at:new Date().toISOString()};document.querySelector('#reactionModal')?.remove();rate(id,value)}
function saveFeeling(id,value){const item=state.allItems.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!item)return;const previous=state.experienceFeelings[id];state.experienceFeelings[id]=previous===value?null:value;state.tasteProfile[item.category]=Math.max(-5,Math.min(8,(state.tasteProfile[item.category]||0)-feelingWeight(previous)+(previous===value?0:feelingWeight(value))));save();refreshRecommendations();showToast('Ce souvenir affine vos prochaines expériences')}
function toggleExperienceTag(id,tag){const current=state.experienceTags[id]||[];state.experienceTags[id]=current.includes(tag)?current.filter(x=>x!==tag):[...current,tag];save();openDetailRefresh(id)}
async function refreshRecommendations(){state.allItems=await rankItemsServer(state.allItems).catch(()=>scoreItems(state.allItems));state.alternatives=buildAlternatives(state.allItems);state.program=buildProgram(state.allItems);state.items=state.program.map(slot=>slot.item);closeDetail();if(state.view==='agenda')renderAgenda();else if(state.view==='surprise')renderSurprise();else renderResults()}
function openDetailRefresh(id){closeDetail();openDetail(id)}
function renderAgendaLegacy(){/* Conservé uniquement pour compatibilité des anciennes données locales. */}
function renderServices(){state.view='services';const services=[['animate','Animateur & coach','Une présence humaine qualifiée pour animer, guider ou encadrer un moment.'],['babysitting','Babysitting de confiance','Profils vérifiés, âges acceptés, disponibilités et contact d’urgence.'],['driver','Chauffeur & navette','Aller, retour, capacité, délai et prix total reliés à votre programme.'],['concierge','Concierge humain','Une demande spéciale prise en charge de bout en bout.'],['home','Ménage & intendance','Préparer, entretenir ou remettre en ordre votre hébergement.'],['booking','Réservations difficiles','Dolcia sollicite ses partenaires pour vous.']];app.innerHTML=shell(`<section class="services-view"><div class="services-hero"><span class="kicker">Le club sans murs</span><h2>Profitez.<br>On s’occupe du reste.</h2><p>Animation, mobilité, garde et conciergerie rejoignent le même programme uniquement lorsqu’un professionnel réellement disponible peut intervenir.</p><div><button class="primary" onclick="openDolciaAnimate()">Essayer Dolcia Anime</button><button class="secondary" onclick="renderAgenda()">Voir mon programme</button></div></div><div class="trust-banner"><strong>La confiance avant la vitesse.</strong><span>Identité, qualifications, assurance, avis, délai d’arrivée et prix total devront être visibles avant réservation. Aucun prestataire fictif ne sera proposé.</span></div><div class="service-grid">${services.map(service=>`<article class="service-card"><span class="service-status">Ouverture territoire par territoire</span><h3>${service[1]}</h3><p>${service[2]}</p><button onclick="serviceInterest('${service[0]}')">M’avertir à l’ouverture</button></article>`).join('')}</div></section>`,'services')}
function serviceInterest(type){const interests=JSON.parse(localStorage.getItem('dolcia_service_interests')||'[]');if(!interests.includes(type))interests.push(type);localStorage.setItem('dolcia_service_interests',JSON.stringify(interests));showToast('Votre intérêt est enregistré. Aucun push ne sera envoyé sans votre accord.')}
function agendaTravelConnector(from,to){
  if(!Number.isFinite(from.lat)||!Number.isFinite(from.lng)||!Number.isFinite(to.lat)||!Number.isFinite(to.lng))return `<div class="agenda-connector"><i></i><span>Trajet à estimer sur place</span></div>`;
  const km=distanceKm(from.lat,from.lng,to.lat,to.lng),walking=km<=1.2,minutes=Math.max(1,Math.round(walking?km*12:km*2.3));
  return `<div class="agenda-connector"><i></i><span>${walking?'À pied':'En voiture'} · environ ${minutes} min · ${km.toFixed(1)} km · estimation</span></div>`;
}
function renderAgenda(){
  state.view='agenda';state.agenda.sort((a,b)=>new Date(a.agendaDate)-new Date(b.agendaDate));
  const groups={};state.agenda.forEach(item=>{const key=iso(new Date(item.agendaDate||state.dateStart));(groups[key]=groups[key]||[]).push(item)});
  const dayKeys=Object.keys(groups).sort();
  const cards=dayKeys.map((dayKey,dayPos)=>{
    const dayItems=groups[dayKey],dateObj=new Date(dayKey+'T12:00:00');
    const weekday=dateObj.toLocaleDateString('fr-FR',{weekday:'long'});
    const header=`<div class="agenda-day-header"><strong>${weekday.charAt(0).toUpperCase()+weekday.slice(1)} ${dateObj.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</strong>${dayKeys.length>1?`<span>Jour ${dayPos+1} sur ${dayKeys.length}</span>`:''}</div>`;
    const dayCards=dayItems.map((item,localIndex)=>{
      const globalIndex=state.agenda.indexOf(item),date=new Date(item.agendaDate||state.dateStart),day=iso(date),time=`${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      const card=`<article class="agenda-card agenda-editable ${item.fromSurprise?'from-surprise':''}"><div class="agenda-time"><input type="time" value="${time}" onchange="updateAgendaTime('${item.id}',this.value)"><input type="date" value="${day}" onchange="updateAgendaDate('${item.id}',this.value)"></div><img src="${itemImage(item)}" alt=""><div><span class="agenda-slot">${esc(item.agendaSlot||'Moment choisi')}</span><h3>${esc(item.name)}</h3><p>${esc(item.address||state.location.name)}</p><div class="agenda-tools"><button onclick="moveAgenda(${globalIndex},-1)" ${globalIndex===0?'disabled':''}>↑ Plus tôt</button><button onclick="moveAgenda(${globalIndex},1)" ${globalIndex===state.agenda.length-1?'disabled':''}>↓ Plus tard</button><button onclick="openDetail('${item.id}')">Voir la fiche</button><button onclick="removeAgenda('${item.id}')">Retirer</button></div></div></article>`;
      const next=dayItems[localIndex+1];
      return card+(next?agendaTravelConnector(item,next):'');
    }).join('');
    return header+dayCards;
  }).join('');app.innerHTML=shell(`<section class="agenda-view agenda-deluxe"><div class="agenda-title"><div><span class="kicker">Votre temps, orchestré</span><h2>Mon programme.</h2><p>Modifiez directement la date et l’heure de chaque moment.</p></div><button class="primary" onclick="openComposition()">${state.program.length?'Revoir mon programme composé':'Compose-moi mon programme'}</button></div>${sharedAgendaPanel()}<div id="flashOfferZone" class="flash-offer-zone"><div class="offer-loading">Dolcia vérifie les opportunités réelles autour de votre programme…</div></div>${cards||`<div class="empty-state"><h3>Votre programme commence ici.</h3><p>Dolcia construira un véritable agenda, heure par heure.</p><button class="primary" onclick="startCompose()">Compose-moi mon programme</button></div>`}</section>`,'agenda');setTimeout(loadFlashOffers,0)}

function reserveWithDolcia(id,slotLabel=''){
  const item=state.allItems.find(x=>x.id===id)||state.items.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!item)return;
  const existing=state.reservations.find(r=>r.itemId===id&&r.status!=='cancelled');if(existing)return renderPass(existing.id);
  const date=item.date||agendaDateFor(item,slotLabel||requestedMomentLabel());
  const reservation={id:`DLC-${Date.now().toString(36).toUpperCase()}`,itemId:item.id,name:item.name,address:item.address||state.location.name,date,status:'confirmed',people:currentGroupSize(),rightLabel:item.category==='food'?'Formule Dolcia réservée':'Expérience Dolcia réservée',createdAt:new Date().toISOString()};
  state.reservations.push(reservation);if(!state.agenda.some(x=>x.id===item.id))state.agenda.push({...item,agendaDate:date,agendaSlot:slotLabel||'Réservation Dolcia',reservationId:reservation.id});
  state.passWallet={status:'active',title:'Mon Pass Dolcia',holder:(JSON.parse(localStorage.getItem('dolcia_profile_v1')||'null')?.name||'Voyageur Dolcia'),rights:state.reservations.filter(r=>r.status!=='cancelled').map(r=>({reservationId:r.id,label:r.rightLabel,status:r.status})),privileges:state.passWallet.privileges||[],updatedAt:new Date().toISOString()};save();renderPass(reservation.id)
}
function passToken(reservation){const seed=`${reservation.id}-${Math.floor(Date.now()/60000)}`;let hash=0;for(const char of seed)hash=((hash<<5)-hash)+char.charCodeAt(0);return Math.abs(hash).toString().padStart(8,'0').slice(0,8)}
function renderPass(focusId){state.view='pass';const active=state.reservations.filter(r=>r.status!=='cancelled'),focus=active.find(r=>r.id===focusId)||active[0];if(!focus){renderAgenda();return}const when=new Date(focus.date);app.innerHTML=shell(`<section class="pass-view"><div class="pass-stage"><span class="kicker">Votre séjour, sans friction</span><h1>Tout est prêt.<br><em>Votre Pass suffit.</em></h1><p>Présentez ce Pass au partenaire. Il confirme la réservation et uniquement ce qui est compris.</p><article class="pass-card"><div class="pass-brand"><span>D<i>✦</i></span><b>DOLCIA PASS</b></div><div class="pass-next"><small>Votre prochain moment</small><h2>${esc(focus.name)}</h2><p>${when.toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'})} · ${esc(focus.address)}</p><strong>${esc(focus.rightLabel)}</strong></div><div class="pass-qr" aria-label="Code de validation Dolcia"><div class="qr-pattern"></div><b>${passToken(focus)}</b><small>Code renouvelé automatiquement</small></div><div class="pass-status"><span></span> Réservation confirmée · ${focus.people} personne${focus.people>1?'s':''}</div></article><div class="pass-switcher">${active.map(r=>`<button class="${r.id===focus.id?'active':''}" onclick="renderPass('${r.id}')"><span>${new Date(r.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</span><b>${esc(r.name)}</b></button>`).join('')}</div><details class="pass-details"><summary>Voir ce qui est compris</summary><p>${esc(focus.rightLabel)}. Les consommations et options supplémentaires sont réglées séparément sauf mention contraire avant validation.</p><small>Identifiant ${focus.id}</small></details></div></section>`,'pass')}
function sharedAgendaPanel(){const people=state.groupParticipants,proposals=state.agendaProposals;return `<section class="shared-agenda"><div><span class="kicker">Programme partagé</span><h3>Tout le groupe, au même rythme.</h3><p>L'organisateur valide. Les proches peuvent consulter, voter ou proposer un changement selon leurs droits.</p></div><div class="participant-row">${people.map(person=>`<span class="participant"><b>${esc(person.name).slice(0,1)}</b>${esc(person.name)}<small>${person.role==='organizer'?'Organisateur':person.kind==='standard'?'Invité':'Participant'}</small></span>`).join('')}<button onclick="openParticipantModal()">+ Ajouter</button><button onclick="shareAgenda()">Inviter par lien</button></div>${proposals.length?`<div class="group-proposals">${proposals.map(proposal=>`<article><span>Proposition au groupe</span><strong>${esc(proposal.title)}</strong><small>${proposal.votes?.yes||0} partant · ${proposal.votes?.maybe||0} pourquoi pas · ${proposal.votes?.no||0} garder le programme</small><div><button onclick="voteProposal('${proposal.id}','yes')">Partant</button><button onclick="voteProposal('${proposal.id}','maybe')">Pourquoi pas</button><button onclick="voteProposal('${proposal.id}','no')">Garder l'actuel</button></div></article>`).join('')}</div>`:''}</section>`}
function openParticipantModal(){openAccount()}
function addParticipant(kind){const input=document.querySelector('#participantName'),name=input?.value.trim();if(!name)return showToast('Indiquez un prénom ou un surnom');state.groupParticipants.push({id:`p-${Date.now()}`,name,role:'participant',kind});save();document.querySelector('#participantModal')?.remove();renderAgenda();showToast(kind==='account'?'Invitation Dolcia préparée':'Accompagnant ajouté')}
async function shareAgenda(){const url=`${location.origin}${location.pathname}?group=${Date.now().toString(36)}`;try{await navigator.clipboard.writeText(url);showToast('Lien du programme copié')}catch(_){showToast('Le lien sera activé avec les comptes Dolcia')}}
async function loadFlashOffers(){const zone=document.querySelector('#flashOfferZone');if(!zone)return;try{const response=await fetch(`/api/events?service=flash-offers&lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}`),data=await response.json();state.flashOffers=(data.offers||[]).filter(offer=>offer.verified&&new Date(offer.expires_at)>new Date());const alertToggle=`<button class="flash-alert-toggle ${state.flashAlertsEnabled?'active':''}" onclick="toggleFlashAlerts()">${state.flashAlertsEnabled?'✓ Alertes activées':'Être alerté dès qu’une occasion se libère'}</button>`;zone.innerHTML=state.flashOffers.length?`<section class="flash-offers"><span class="kicker">Occasions vérifiées maintenant</span><h3>Une meilleure possibilité vient de se libérer.</h3>${alertToggle}${state.flashOffers.slice(0,3).map(offer=>`<article><div><b>-${offer.savingPercent}%</b><span>${esc(offer.title)}</span><small>${offer.distance!=null?`${offer.distance.toFixed(1)} km · `:''}${offer.quantity_remaining} place${offer.quantity_remaining>1?'s':''} · expire ${new Date(offer.expires_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div><div><del>${Number(offer.original_price).toFixed(0)} €</del><strong>${Number(offer.dolcia_price).toFixed(0)} €</strong><button onclick="proposeFlashOffer('${offer.id}')">Proposer au groupe</button></div></article>`).join('')}</section>`:`<div class="no-flash-offer"><span class="kicker">Veille Dolcia</span><strong>Aucune offre exceptionnelle vérifiée pour le moment.</strong><p>Votre programme reste inchangé. Dolcia ne fabrique jamais de réduction.</p>${alertToggle}</div>`}catch(_){zone.innerHTML='<div class="no-flash-offer"><strong>La veille des offres est momentanément indisponible.</strong><p>Votre programme reste intact.</p></div>'}}
// Alertes push : jamais activées sans un geste explicite sur ce bouton. Une seule offre réelle et
// vérifiée déclenche une seule notification par personne abonnée et proche — jamais de répétition,
// jamais d'alerte fabriquée. Repli silencieux si le navigateur ou la configuration ne suivent pas.
function urlBase64ToUint8Array(base64){const padding='='.repeat((4-base64.length%4)%4),base64Safe=(base64+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64Safe);return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)))}
async function toggleFlashAlerts(){if(state.flashAlertsEnabled)return disableFlashAlerts();return enableFlashAlerts()}
async function enableFlashAlerts(){
  if(!('serviceWorker'in navigator)||!('PushManager'in window))return showToast('Les alertes ne sont pas disponibles sur ce navigateur.');
  if(!VAPID_PUBLIC_KEY)return showToast('Les alertes ne sont pas encore configurées.');
  try{
    const permission=await Notification.requestPermission();
    if(permission!=='granted')return showToast('Vous pourrez activer les alertes plus tard, quand vous le souhaitez.');
    const registration=await navigator.serviceWorker.register('/sw.js');
    const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
    const response=await fetch('/api/events?service=push-subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:subscription.toJSON(),lat:state.location.lat,lng:state.location.lng})});
    if(!response.ok)throw new Error('save failed');
    localStorage.setItem('dolcia_flash_alerts_endpoint',subscription.endpoint);
    state.flashAlertsEnabled=true;
    showToast('Alertes activées · uniquement pour des occasions réelles et proches');
    loadFlashOffers();
  }catch(_){showToast('Impossible d’activer les alertes pour le moment.')}
}
async function disableFlashAlerts(){
  try{
    const endpoint=localStorage.getItem('dolcia_flash_alerts_endpoint');
    const registration=await navigator.serviceWorker?.getRegistration?.();
    const subscription=await registration?.pushManager?.getSubscription?.();
    await subscription?.unsubscribe?.();
    if(endpoint)await fetch('/api/events?service=push-subscribe',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint})}).catch(()=>{});
  }catch(_){}
  localStorage.removeItem('dolcia_flash_alerts_endpoint');
  state.flashAlertsEnabled=false;
  showToast('Alertes désactivées');
  loadFlashOffers();
}
function proposeFlashOffer(id){const offer=state.flashOffers.find(item=>String(item.id)===String(id));if(!offer)return;state.agendaProposals.unshift({id:`offer-${offer.id}`,offerId:offer.id,title:`Remplacer un moment par ${offer.title}`,createdAt:new Date().toISOString(),status:'voting',votes:{yes:1,maybe:0,no:0}});save();renderAgenda();showToast('La proposition est visible par le groupe')}
function voteProposal(id,value){const proposal=state.agendaProposals.find(item=>item.id===id);if(!proposal)return;proposal.votes[value]=(proposal.votes[value]||0)+1;save();renderAgenda()}
function updateAgendaTime(id,value){const item=state.agenda.find(x=>x.id===id);if(!item||!value)return;const [hours,minutes]=value.split(':').map(Number),date=new Date(item.agendaDate||state.dateStart);date.setHours(hours,minutes,0,0);item.agendaDate=date.toISOString();save();showToast(`Horaire enregistré : ${value}`)}
function updateAgendaDate(id,value){const item=state.agenda.find(x=>x.id===id);if(!item||!value)return;const current=new Date(item.agendaDate||state.dateStart),[year,month,day]=value.split('-').map(Number);current.setFullYear(year,month-1,day);item.agendaDate=current.toISOString();save();showToast('Date enregistrée')}
function moveAgenda(index,direction){const next=index+direction;if(next<0||next>=state.agenda.length)return;[state.agenda[index],state.agenda[next]]=[state.agenda[next],state.agenda[index]];save();renderAgenda()}
function removeAgenda(id){state.agenda=state.agenda.filter(x=>x.id!==id);save();renderAgenda()}
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2400)}

window.home=home;window.startCompose=startCompose;window.renderComposer=renderComposer;window.pick=pick;window.nextStep=nextStep;window.backStep=backStep;window.setDate=setDate;window.setDestination=setDestination;window.moveMonth=moveMonth;window.pickDate=pickDate;window.selectDuration=selectDuration;window.useLocation=useLocation;window.compose=compose;window.renderResults=renderResults;window.renderSurprise=renderSurprise;window.renderAgenda=renderAgenda;window.renderServices=renderServices;window.serviceInterest=serviceInterest;window.moveAgenda=moveAgenda;window.openDetail=openDetail;window.selectPhoto=selectPhoto;window.closeDetail=closeDetail;window.addAgenda=addAgenda;window.adoptSurprise=adoptSurprise;window.surprise=surprise;window.regenerateSlot=regenerateSlot;window.openSlotRefinement=openSlotRefinement;window.applySlotRefinement=applySlotRefinement;window.rate=rate;window.saveFeeling=saveFeeling;window.toggleExperienceTag=toggleExperienceTag;window.chooseMajorMoment=chooseMajorMoment;window.dismissMajorMoment=dismissMajorMoment;window.acceptHomeMajor=acceptHomeMajor;window.dismissHomeMajor=dismissHomeMajor;window.toggleOutdoor=toggleOutdoor;window.removeAgenda=removeAgenda;window.showToast=showToast;window.state=state;
window.toggleAdaptiveLens=toggleAdaptiveLens;window.clearAdaptiveLenses=clearAdaptiveLenses;
window.setGroupDetail=setGroupDetail;
window.openParticipantModal=openParticipantModal;window.addParticipant=addParticipant;window.shareAgenda=shareAgenda;window.proposeFlashOffer=proposeFlashOffer;window.voteProposal=voteProposal;
window.openFuture=openFuture;window.composeFuture=composeFuture;
window.openEclatDialogue=openEclatDialogue;window.answerEclat=answerEclat;window.answerEclatFree=answerEclatFree;window.startEclatVoice=startEclatVoice;window.openMyMoment=openMyMoment;window.openMeHub=openMeHub;window.openAccount=openAccount;window.saveAccount=saveAccount;
window.answerEclatCustomDate=answerEclatCustomDate;
window.answerStayRhythm=answerStayRhythm;
window.startLocalDiscovery=startLocalDiscovery;window.openConstellation=openConstellation;window.resetTaste=resetTaste;window.forgetExperience=forgetExperience;window.rememberExperience=rememberExperience;
window.openReactionMenu=openReactionMenu;window.contextualRate=contextualRate;
window.reserveWithDolcia=reserveWithDolcia;window.renderPass=renderPass;
window.openBudgetEditor=openBudgetEditor;window.saveBudgetPlan=saveBudgetPlan;
window.openCirclePerson=openCirclePerson;window.saveCirclePerson=saveCirclePerson;window.toggleCirclePerson=toggleCirclePerson;window.removeCirclePerson=removeCirclePerson;
window.openSensitivity=openSensitivity;window.saveSensitivity=saveSensitivity;
window.openDolciaAnimate=openDolciaAnimate;window.previewDolciaAnimate=previewDolciaAnimate;window.addDolciaAnimate=addDolciaAnimate;window.startDolciaAnimate=startDolciaAnimate;window.speakAnimateStep=speakAnimateStep;window.stopDolciaAnimate=stopDolciaAnimate;
window.openDCoach=openDCoach;window.closeDCoach=closeDCoach;window.dCoachChoose=dCoachChoose;window.renderDCoachAdjustments=renderDCoachAdjustments;window.applyDCoachAdjustment=applyDCoachAdjustment;window.askDCoach=askDCoach;window.startDCoachVoice=startDCoachVoice;
window.answerDCoach=answerDCoach;
window.applyProgramDirection=applyProgramDirection;
window.resetCatalogForRecovery=resetCatalogForRecovery;window.showWithoutAdvancedFilters=showWithoutAdvancedFilters;window.acceptRecoveryBudget=acceptRecoveryBudget;window.acceptRecoveryDistance=acceptRecoveryDistance;
window.reactDolciaAnimate=reactDolciaAnimate;window.completeDolciaAnimateStep=completeDolciaAnimateStep;window.pauseDolciaAnimate=pauseDolciaAnimate;
home();
