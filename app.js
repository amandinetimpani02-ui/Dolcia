/* ============================================================
   DOLCIA v20 — app.js
   Architecture : conserve le contrat api existant (LOCAL_API / PROD_API,
   /api/places, /api/events, /api/weather). Si les vraies API répondent
   (une fois déployé sur Vercel avec GOOGLE_KEY / OPENAGENDA_KEY /
   OPENWEATHER_KEY configurées), elles remplacent automatiquement les
   données de démonstration ci-dessous. Aucune donnée démo n'est jamais
   affichée comme "vérifiée" à l'utilisateur — voir DEMO_MODE.
   ============================================================ */

const LOCAL_API = '/api';
const PROD_API = 'https://dolcia.vercel.app/api';

const state = {
  city: { name: 'Le Touquet-Paris-Plage', lat: 50.5214, lng: 1.5912 },
  brief: { text: '', when: null, who: null, budget: null },
  understood: {},
  items: [],
  animeItems: [],
  pepitesItems: [],
  agenda: JSON.parse(localStorage.getItem('dolcia_agenda') || '[]'),
  favs: JSON.parse(localStorage.getItem('dolcia_favs') || '[]'),
  budgetTotal: 120,
  budgetSpent: 0,
  diagnostics: [],
  currentDepth: 'explore',
  current: null,
  DEMO_MODE: false,
  filters: { maxDist:15, openNow:false, walkable:false, freeOnly:false, kidsOk:false, sort:'pertinence' }
};

const $ = id => document.getElementById(id);
const screens = ['splash','brief','clarify','loading','results'];
function showScreen(id){ screens.forEach(s => $(s)?.classList.toggle('active', s===id)); updateDChatVisibility(id); }
function saveAgenda(){ localStorage.setItem('dolcia_agenda', JSON.stringify(state.agenda)); }
function saveFavs(){ localStorage.setItem('dolcia_favs', JSON.stringify(state.favs)); }
function flash(msg){
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div'); t.className='toast'; t.textContent=msg;
  document.body.appendChild(t); setTimeout(()=>t.remove(),2400);
}

/* ---------------- Brief vivant : compréhension légère du texte libre ----------------
   Ceci est un analyseur local simple (mots-clés) qui simule la compréhension de L'Éclat
   pendant la saisie. En production, cette étape est confiée au moteur IA serveur
   décrit dans le Product Book (section 39 / 28 : classification structurée, jamais
   d'invention de fait). */
const KEYWORDS = {
  who: { couple:['couple','deux','amoureux'], family:['famille','enfant','ado','fille','fils'], friends:['amis','copains','bande'], solo:['seul','solo','moi-même'] },
  when: { now:['maintenant','tout de suite'], tonight:['ce soir','soirée'], tomorrow:['demain'], weekend:['week-end','weekend'], stay:['séjour','jours','semaine'] },
  vibe: { food:['manger','restaurant','gastro','dîner','déjeuner'], nature:['plage','balade','nature','marche','dune'], culture:['expo','musée','concert','théâtre'], wellness:['spa','détente','calme','bien-être'], sport:['sport','vélo','actif'], festive:['sortir','bar','soirée','fête'], free:['gratuit','sans payer'] },
  budget: { free:['gratuit','sans budget','0 €','0€'], light:['petit budget','pas cher'], comfortable:['budget confortable'], open:['sans limite','peu importe le prix'] }
};
function analyzeBrief(text){
  const low = text.toLowerCase();
  const found = {};
  for (const dim in KEYWORDS){
    for (const key in KEYWORDS[dim]){
      if (KEYWORDS[dim][key].some(w => low.includes(w))){ found[dim] = key; break; }
    }
  }
  return found;
}
function renderUnderstood(){
  const parts = [];
  if (state.understood.who) parts.push({couple:'en couple',family:'en famille',friends:'entre amis',solo:'en solo'}[state.understood.who]);
  if (state.understood.when) parts.push({now:'maintenant',tonight:'ce soir',tomorrow:'demain',weekend:'ce week-end',stay:'pour un séjour'}[state.understood.when]);
  if (state.understood.vibe) parts.push('envie de ' + {food:'gastronomie',nature:'nature',culture:'culture',wellness:'bien-être',sport:'sport',festive:'sortir',free:'gratuit'}[state.understood.vibe]);
  if (state.brief.budget) parts.push('budget ' + {free:'0 €',light:'léger',comfortable:'confortable',open:'sans limite'}[state.brief.budget]);
  $('understoodLine').textContent = parts.length ? ('Compris : ' + parts.join(' · ')) : '';
}

/* ---------------------------------------------------------------
   MOTEUR DE QUESTIONS DÉCISIVES
   Principe non négociable du Product Book (section 39) : L'Éclat pose
   au maximum trois questions, uniquement celles qui changent réellement
   la proposition, jamais une déjà répondue. Si D devine au lieu de
   demander, les propositions sont fausses et l'appli ne sert à rien —
   donc ce moteur bloque le passage à "Explorer/Programme/Anime" tant
   que les dimensions décisives manquent, sauf refus explicite (Passer).
   --------------------------------------------------------------- */
const CLARIFY_QUESTIONS = [
  {
    id:'who', dim:'who',
    condition: () => !state.understood.who,
    text:'Vous êtes combien, et avec qui ?',
    options:[['couple','En couple'],['family','En famille, avec enfants'],['friends','Entre amis'],['solo','Solo']]
  },
  {
    id:'vibe', dim:'vibe',
    condition: () => !state.understood.vibe,
    text:'Là, tout de suite : retrouver de l\'énergie, ou décrocher complètement ?',
    options:[['festive','Retrouver de l\'énergie'],['wellness','Décrocher, calme'],['nature','Prendre l\'air'],['food','Se faire plaisir à table']]
  },
  {
    id:'budget', dim:'budget',
    condition: () => !state.brief.budget,
    text:'Quel budget pour ce moment, pour ne jamais le dépasser ?',
    options:[['free','0 €'],['light','Léger'],['comfortable','Confortable'],['open','Sans limite']]
  },
  {
    id:'when', dim:'when',
    condition: () => !state.understood.when,
    text:'C\'est pour quand ?',
    options:[['now','Maintenant'],['tonight','Ce soir'],['tomorrow','Demain'],['weekend','Ce week-end']]
  }
];

function buildClarifyQueue(){
  // Jamais plus de trois questions — on garde les plus décisives en premier (qui > vibe > budget > quand).
  state.clarifyQueue = CLARIFY_QUESTIONS.filter(q => q.condition()).slice(0,3);
  state.clarifyIndex = 0;
}
function renderClarifyStep(){
  const total = state.clarifyQueue.length;
  const q = state.clarifyQueue[state.clarifyIndex];
  if (!q){ loadExperience(); return; }
  $('clarifyQuestion').textContent = q.text;
  $('clarifyProgress').innerHTML = Array.from({length: total}).map((_,i)=>{
    const cls = i < state.clarifyIndex ? 'done' : (i === state.clarifyIndex ? 'current' : '');
    return `<span class="${cls}"></span>`;
  }).join('');
  $('clarifyOptions').innerHTML = q.options.map(([val,label])=>
    `<button class="chip-big" data-clarify-val="${val}">${label}</button>`
  ).join('');
}
function answerClarify(val){
  const q = state.clarifyQueue[state.clarifyIndex];
  if (!q) return;
  if (q.dim === 'budget') state.brief.budget = val;
  else state.understood[q.dim] = val;
  renderUnderstood();
  advanceClarify();
}
function skipClarify(){ advanceClarify(); }
function skipAllClarify(){ state.clarifyIndex = state.clarifyQueue.length; loadExperience(); }
function advanceClarify(){
  state.clarifyIndex++;
  if (state.clarifyIndex >= state.clarifyQueue.length) loadExperience();
  else { showScreen('clarify'); renderClarifyStep(); }
}
function startClarifyOrLoad(){
  buildClarifyQueue();
  if (state.clarifyQueue.length){ showScreen('clarify'); renderClarifyStep(); }
  else loadExperience();
}

/* ---------------- Navigation ---------------- */
function goToBrief(){ showScreen('brief'); $('briefText').focus(); }
function backFromBrief(){ showScreen('splash'); }

function initChips(){
  document.querySelectorAll('.chip-row').forEach(row=>{
    row.addEventListener('click', e=>{
      const chip = e.target.closest('.chip'); if(!chip) return;
      const group = row.dataset.group;
      row.querySelectorAll('.chip').forEach(c=>c.classList.toggle('selected', c===chip && !c.classList.contains('selected')));
      const selected = row.querySelector('.chip.selected');
      state.brief[group] = selected ? selected.dataset.val : null;
      if (group !== 'budget') state.understood[group] = state.brief[group];
      renderUnderstood();
    });
  });
}

function toggleRefine(){ $('refinePanel').classList.toggle('hidden'); }

/* ---------------- API + fallback démo ---------------- */
function apiBases(){ return [LOCAL_API, PROD_API]; }
async function fetchJson(path){
  let lastErr = null;
  for (const base of apiBases()){
    try{
      const r = await fetch(base+path);
      const text = await r.text();
      let d = {}; try{ d = JSON.parse(text); }catch{ d = { raw:text }; }
      if(!r.ok) throw new Error(`${base}${path} -> ${r.status} ${d.error||''}`);
      state.diagnostics.push({ok:true,url:base+path,count:d.results?.length||d.events?.length||0});
      return d;
    }catch(e){ lastErr = e; state.diagnostics.push({ok:false,url:base+path,error:e.message}); }
  }
  throw lastErr || new Error('API indisponible');
}

/* Jeu de données de démonstration — structure identique aux vraies réponses,
   jamais présentée comme vérifiée dans l'UI (voir demo-notice + badge "à vérifier"). */
function demoExploreItems(){
  const vibe = state.understood.vibe || 'food';
  const base = [
    { id:'d1', kind:'place', title:'Table face à la dune', category:'food', desc:'Cuisine de la mer, terrasse abritée, vue sur les dunes.', rating:4.6, reviews:212, priceN:3, dist:1.2, open:true, forKids:true, isNew:false, source:'Exemple — Google Places', confidence:'check' },
    { id:'d2', kind:'place', title:'Balade des trois estuaires', category:'nature', desc:'Sentier côtier entre plage et forêt domaniale.', rating:4.8, reviews:340, priceN:0, free:true, dist:2.4, open:true, forKids:true, isNew:false, source:'Exemple — Google Places', confidence:'check' },
    { id:'d3', kind:'event', title:'Marché artisanal du soir', category:'culture', desc:'Créateurs locaux, musique live, en centre-ville.', rating:null, reviews:0, priceN:0, free:true, dist:0.6, open:true, forKids:true, isNew:true, date:'ce soir 18h30', source:'Exemple — OpenAgenda', confidence:'check' },
    { id:'d4', kind:'place', title:'Spa face à la mer', category:'wellness', desc:'Piscine chauffée, hammam, soins sur réservation.', rating:4.7, reviews:180, priceN:3, dist:0.8, open:true, forKids:false, isNew:false, source:'Exemple — Google Places', confidence:'check' },
    { id:'d5', kind:'place', title:'Escape game des corsaires', category:'sport', desc:'Énigmes en équipe, 6 joueurs max, 60 minutes.', rating:4.5, reviews:96, priceN:2, dist:1.6, open:true, forKids:true, isNew:true, source:'Exemple — Google Places', confidence:'check' },
    { id:'d6', kind:'event', title:'Concert acoustique de plage', category:'festive', desc:'Scène ouverte au coucher du soleil.', rating:null, reviews:0, priceN:0, free:true, dist:1.9, open:true, forKids:false, isNew:false, date:'ce soir 20h', source:'Exemple — OpenAgenda', confidence:'check' },
  ];
  return base.sort((a,b)=> (a.category===vibe?-1:0) - (b.category===vibe?-1:0));
}
/* Pépites locales — le pilier 2 de l'ADN Dolcia : des activités ultra-niches,
   festives, populaires et peu chères, souvent hors de la ville de séjour et
   introuvables sans être du coin (affiche locale, bouche-à-oreille). Quand
   l'activité est un atelier enfant, Dolcia propose systématiquement un duo :
   une découverte du village pour les grands pendant ce temps-là. */
function demoPepitesItems(){
  return [
    {
      id:'p1', title:'Atelier vitraux du Vieux Moulin', icon:'craft',
      desc:'Un maître-verrier de village ouvre son atelier deux après-midi par semaine — connu uniquement par une affiche à l\'entrée du bourg.',
      distanceKm:14, price:'8 € l\'enfant', forKids:true,
      pairing:'Pendant l\'atelier (1h30), les grands peuvent flâner au marché couvert du village à 4 minutes à pied — brocante le même jour.'
    },
    {
      id:'p2', title:'Après-midi cirque en plein champ', icon:'circus',
      desc:'Troupe locale, initiation jonglage et fil bas, ambiance bon enfant, entrée à prix libre — repérée sur le panneau d\'affichage de la mairie.',
      distanceKm:19, price:'Prix libre', forKids:true,
      pairing:'À 6 minutes, une chapelle romane ouverte au public avec un banc à l\'ombre — parfait pour les grands-parents pendant que les enfants s\'essaient au trapèze.'
    },
    {
      id:'p3', title:'Fête de la moule-frites du quartier', icon:'party',
      desc:'Kermesse populaire annuelle, musique locale, petite restauration à prix serré — jamais référencée nulle part, seulement sur les lampadaires du quartier.',
      distanceKm:0.8, price:'À partir de 9 €', forKids:false,
      pairing:null
    },
    {
      id:'p4', title:'Atelier poterie du potier de Camiers', icon:'craft',
      desc:'Un artisan potier ouvre son four à bois un samedi sur deux, initiation tournage pour petits et grands — connu du village, jamais mis en avant ailleurs.',
      distanceKm:11, price:'12 € par personne', forKids:true,
      pairing:'À deux pas, un sentier de découverte du village fléché par la mairie — 25 minutes de balade tranquille pour les grands pendant l\'atelier.'
    }
  ];
}

function demoAnimeItems(ctx){
  const sets = {
    pool: [{
      id:'a1', title:'Parcours d\'eau parent-enfant',
      desc:'Défis coopératifs doux, adaptés aux enfants sachant nager, surveillance adulte constante requise.',
      energy:'douce',
      steps:[
        { title:'On se rassemble', instruction:'Tout le monde dans l\'eau, en cercle. On respire, on secoue les bras — c\'est parti pour un vrai moment d\'équipe.', seconds:20 },
        { title:'Le pont flottant', instruction:'Par deux, formez un pont avec vos bras : un passe dessous en battant des pieds. On inverse après.', seconds:60 },
        { title:'La ronde des bulles', instruction:'Tout le monde en cercle, une main sur l\'épaule du voisin. Inspirez fort, plongez trois secondes, on souffle les bulles ensemble !', seconds:45 },
        { title:'Le grand final', instruction:'Applaudissements dans l\'eau, le plus fort possible ! Qui a fait le plus grand splash ?', seconds:20 }
      ]
    }],
    beach: [
      { id:'a2', title:'Chasse photo des dunes', desc:'Cinq indices à retrouver le long du sentier côtier, en équipe.', energy:'vive',
        steps:[
          { title:'Briefing d\'équipe', instruction:'Formez deux équipes. Chacune reçoit la même liste : un coquillage spiralé, une trace d\'oiseau, un oyat qui plie dans le vent, un bois flotté, et vous cinq en photo au sommet de la dune.', seconds:30 },
          { title:'C\'est parti !', instruction:'Vous avez 8 minutes. Premier retour ici avec les 5 photos gagne le droit de choisir le prochain jeu.', seconds:480 },
          { title:'On compte les points', instruction:'Chaque équipe montre ses photos. Un point par indice trouvé, deux points si la photo fait rire tout le monde.', seconds:60 }
        ]
      },
      { id:'a3', title:'Olympiades de plage', desc:'Trois épreuves simples adaptées à l\'énergie du groupe.', energy:'vive',
        steps:[
          { title:'Échauffement', instruction:'Tout le monde debout, on s\'étire, on saute sur place dix fois. L\'énergie monte !', seconds:30 },
          { title:'Épreuve 1 — Le relais crabe', instruction:'En équipe, traversez 15 mètres en marchant comme un crabe, à quatre pattes de côté. Le premier relais qui arrive marque le point.', seconds:90 },
          { title:'Épreuve 2 — Le lancer de précision', instruction:'Un cercle est dessiné dans le sable. Chacun lance trois coquillages, le plus près du centre gagne.', seconds:120 },
          { title:'Podium', instruction:'On applaudit tout le monde, vainqueurs et perdants. Photo de groupe pour immortaliser !', seconds:30 }
        ]
      }
    ],
    city: [{ id:'a4', title:'Enquête familiale en centre-ville', desc:'Une intrigue légère à résoudre en marchant, sans application externe.', energy:'douce',
      steps:[
        { title:'Le mystère commence', instruction:'Un objet a disparu de la place du marché. Trois indices sont cachés dans les rues alentour. À vous de mener l\'enquête !', seconds:30 },
        { title:'Indice 1', instruction:'Cherchez la fontaine la plus proche : un mot y est gravé. Notez la première lettre.', seconds:180 },
        { title:'Indice 2', instruction:'Trouvez la boutique avec la façade la plus colorée. Comptez ses fenêtres.', seconds:180 },
        { title:'Résolution', instruction:'Assemblez vos indices. Qui a résolu le mystère en premier ?', seconds:60 }
      ]
    }],
    home: [{ id:'a5', title:'Jeux de voyage du soir', desc:'Retour au calme progressif, adapté à l\'hébergement.', energy:'calme',
      steps:[
        { title:'On se pose', instruction:'Chacun s\'installe confortablement. On va jouer à "Je pars en voyage et j\'emmène..." en ajoutant un objet à chaque tour.', seconds:180 },
        { title:'Respiration du soir', instruction:'Fermez les yeux, respirez lentement. Chacun raconte son moment préféré de la journée en une phrase.', seconds:120 }
      ]
    }]
  };
  return sets[ctx] || sets.beach;
}

function runLoadingStages(){
  const stages = document.querySelectorAll('.loading-stage');
  stages.forEach(s=>s.classList.remove('active','done'));
  return new Promise(resolve=>{
    let i = 0;
    const tick = () => {
      if (i > 0) stages[i-1]?.classList.replace('active','done');
      if (i >= stages.length){ resolve(); return; }
      stages[i].classList.add('active');
      i++;
      setTimeout(tick, 480);
    };
    tick();
  });
}

async function loadExperience(){
  showScreen('loading');
  state.items = []; state.diagnostics = []; state.DEMO_MODE = false;
  const { lat, lng } = state.city;
  const stagesPromise = runLoadingStages();
  try{
    const results = await Promise.all([
      fetchJson(`/places?lat=${lat}&lng=${lng}&radius=8000&type=restaurant`),
      fetchJson(`/events?lat=${lat}&lng=${lng}&radius=15&size=40`)
    ]);
    const places = (results[0].results||[]);
    const events = (results[1].events||[]);
    if (!places.length && !events.length) throw new Error('Aucune donnée réelle retournée');
    // normalisation minimale — à enrichir selon le vrai schéma Google/OpenAgenda
    state.items = [...places, ...events];
  }catch(e){
    state.DEMO_MODE = true;
    state.items = demoExploreItems();
  }
  state.animeItems = demoAnimeItems('beach');
  state.pepitesItems = demoPepitesItems();
  await stagesPromise;
  renderResults();
  showScreen('results');
}

/* ---------------- Rendu résultats ---------------- */
function titleForResults(){
  if (state.understood.when === 'stay') return 'Votre séjour se compose.';
  if (state.understood.when === 'tonight') return 'Votre soirée se dessine.';
  return 'Voici ce que Dolcia a imaginé pour vous.';
}
function summaryForResults(){
  return `Sélection autour de ${state.city.name}, adaptée à votre brief.`;
}
function renderResults(){
  $('resultsTitle').textContent = titleForResults();
  $('resultsSummary').textContent = summaryForResults();
  const chips = [];
  if (state.understood.who) chips.push({couple:'En couple',family:'En famille',friends:'Entre amis',solo:'Solo'}[state.understood.who]);
  if (state.understood.when) chips.push({now:'Maintenant',tonight:'Ce soir',tomorrow:'Demain',weekend:'Week-end',stay:'Séjour'}[state.understood.when]);
  if (state.understood.vibe) chips.push({food:'Gastronomie',nature:'Nature',culture:'Culture',wellness:'Bien-être',sport:'Sport',festive:'Sortir',free:'Gratuit'}[state.understood.vibe]);
  $('criteriaLine').innerHTML = chips.map(c=>`<span>${c}</span>`).join('');
  $('demoNotice').classList.toggle('hidden', !state.DEMO_MODE);
  renderDiagnostic();
  renderExplore();
  renderProgram();
  renderAnime('beach');
  updateBudgetRing();
}
function renderDiagnostic(){
  const box = $('diagnosticBox');
  const failed = state.diagnostics.filter(d=>!d.ok);
  if (!state.DEMO_MODE){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = `<h3>Diagnostic données</h3><p>Les API réelles n'ont pas répondu dans cet environnement — vérifie GOOGLE_KEY / OPENAGENDA_KEY / OPENWEATHER_KEY dans Vercel.</p>${
    state.diagnostics.slice(0,10).map(d=>`<div class="debug-line"><span>${d.ok?'OK':'Échec'}</span><b>${d.count??''}</b></div><code>${d.url}${d.error?'\n'+d.error:''}</code>`).join('')
  }`;
}

function priceText(x){ if(x.free||x.priceN===0) return 'Gratuit'; if(x.priceN) return '€'.repeat(Math.max(1,Math.min(4,x.priceN))); return ''; }
function cardHtml(x){
  const meta = [x.source, x.dist!=null?`${x.dist} km`:null, priceText(x), x.rating?`note ${x.rating}/5`:null, x.date||null].filter(Boolean).join(' · ');
  return `<article class="experience-card" data-open="${x.id}">
    <div class="experience-photo"></div>
    <div class="experience-shade"></div>
    <div class="experience-content">
      <div class="source-badge">${x.kind==='event'?'Événement':'Lieu réel'}</div>
      <h3>${x.title}</h3>
      <p>${meta}</p>
      <div class="card-actions">
        <button class="mini-btn gold" data-agenda="${x.id}">Agenda</button>
        <button class="mini-btn dark reserve-disabled" data-reserve="${x.id}">Réserver bientôt</button>
      </div>
    </div>
  </article>`;
}
function applyFilters(items){
  const f = state.filters;
  let out = items.filter(x=>{
    if (f.openNow && x.open !== true) return false;
    if (f.walkable && (x.dist==null || x.dist > 2)) return false;
    if (f.freeOnly && !(x.free || x.priceN===0)) return false;
    if (f.kidsOk && !x.forKids) return false;
    if (x.dist != null && x.dist > f.maxDist) return false;
    return true;
  });
  if (f.sort === 'distance') out.sort((a,b)=>(a.dist??999)-(b.dist??999));
  else if (f.sort === 'rating') out.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if (f.sort === 'new') out.sort((a,b)=>(b.isNew?1:0)-(a.isNew?1:0));
  return out;
}
function renderExplore(){
  const el = $('cardsSection');
  const filtered = applyFilters(state.items);
  $('filterCount').textContent = `${filtered.length} sur ${state.items.length}`;
  if (!filtered.length){
    el.innerHTML = `<div class="empty-state"><h3>Aucune activité ne correspond à ces filtres.</h3><p>Élargissez le rayon, ou retirez un critère — D préfère élargir plutôt que cacher silencieusement des possibilités.</p></div>`;
    return;
  }
  el.innerHTML = `<h3 class="section-title">Votre sélection</h3><div class="cards-grid">${filtered.map(cardHtml).join('')}</div>`;
}
const PEPITE_ICONS = {
  craft: '<circle cx="24" cy="24" r="16"/><path d="M17 24 L22 29 L31 18"/>',
  circus: '<path d="M24 8 L24 40 M14 40 L34 40" stroke-linecap="round"/><circle cx="24" cy="16" r="6"/>',
  party: '<path d="M10 38 L38 38 M14 38 C14 24 34 24 34 38" stroke-linecap="round"/><path d="M24 10 L24 16 M16 14 L19 18 M32 14 L29 18"/>'
};
function pepiteCardHtml(x){
  const pairingHtml = x.pairing ? `
    <div class="pepite-pairing">
      <div class="pairing-label">Pendant ce temps, pour les grands</div>
      <p>${x.pairing}</p>
    </div>` : '';
  return `<article class="pepite-card" data-open="${x.id}">
    <div class="pepite-head">
      <svg class="pepite-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3">${PEPITE_ICONS[x.icon]||PEPITE_ICONS.craft}</svg>
      <div>
        <h4>${x.title}</h4>
        <div class="pepite-meta">
          <span class="detour">${x.distanceKm} km · vaut le détour</span>
          <span class="price">${x.price}</span>
          ${x.forKids?'<span>Atelier enfants</span>':''}
        </div>
      </div>
    </div>
    <div class="pepite-desc">${x.desc}</div>
    ${pairingHtml}
    <div class="pepite-actions">
      <button class="mini-btn gold" data-agenda="${x.id}">Ajouter à l'agenda</button>
    </div>
  </article>`;
}
function renderPepites(){
  $('pepitesSection').innerHTML = state.pepitesItems.map(pepiteCardHtml).join('');
}
function switchAnimeSub(sub){
  document.querySelectorAll('.anime-subtab').forEach(t=>t.classList.toggle('active', t.dataset.sub===sub));
  $('subAnimator').classList.toggle('hidden', sub!=='animator');
  $('subPepites').classList.toggle('hidden', sub!=='pepites');
  if (sub==='pepites') renderPepites();
}
function renderAnime(ctx){
  const items = demoAnimeItems(ctx);
  state.animeItems = items;
  const el = $('animeSection');
  el.innerHTML = `<div class="cards-grid">${items.map(x=>`
    <article class="experience-card" data-open="${x.id}">
      <div class="experience-photo"></div>
      <div class="experience-shade"></div>
      <div class="experience-content">
        <div class="source-badge anime">Programme Dolcia · énergie ${x.energy||'vive'}</div>
        <h3>${x.title}</h3>
        <p>${x.desc}</p>
        <div class="card-actions">
          <button class="mini-btn gold" data-launch="${x.id}">Lancer avec D</button>
          <button class="mini-btn dark" data-agenda="${x.id}">Agenda</button>
        </div>
      </div>
    </article>`).join('')}</div>`;
}

/* ---------------- Mon programme + budget vivant ---------------- */
function renderProgram(){
  const el = $('programSection');
  if (!state.agenda.length){
    el.innerHTML = `<div class="empty-state"><h3>Votre programme est vide.</h3><p>Ajoutez une activité depuis Explorer ou Dolcia Anime pour composer votre moment.</p></div>`;
    return;
  }
  const slots = state.agenda.length<=3 ? ['Début','Suite','Fin'] : ['Matin','Midi','Après-midi','Soir'];
  el.innerHTML = `<div class="program-card"><div class="program-title">Votre composition</div><div class="timeline">${
    state.agenda.map((x,i)=>`<div class="timeline-item" data-open="${x.key}"><div class="time">${slots[i]||''}</div><div><h4>${x.title}</h4><p>${x.source||''}</p></div></div>`).join('')
  }</div></div>`;
}
function updateBudgetRing(){
  const remaining = Math.max(0, state.budgetTotal - state.budgetSpent);
  const pct = Math.round((remaining / state.budgetTotal) * 100);
  const circumference = 308;
  const offset = circumference * (1 - pct/100);
  $('budgetRingFill').style.strokeDashoffset = offset;
  $('budgetPercent').textContent = pct + '%';
  $('budgetText').textContent = `${remaining} € restants sur ${state.budgetTotal} € — recalculé à chaque ajout.`;
}

/* ---------------- Depth tabs ---------------- */
function switchDepth(depth){
  state.currentDepth = depth;
  document.querySelectorAll('.depth-tab').forEach(t=>t.classList.toggle('active', t.dataset.depth===depth));
  $('viewExplore').classList.toggle('hidden', depth!=='explore');
  $('viewProgram').classList.toggle('hidden', depth!=='program');
  $('viewAnime').classList.toggle('hidden', depth!=='anime');
}

/* ---------------- Fiche détail ---------------- */
function findItem(id){
  return state.items.find(i=>i.id===id) || state.animeItems.find(i=>i.id===id) || state.pepitesItems.find(i=>i.id===id);
}
function openItem(id){
  const x = findItem(id); if(!x) return;
  state.current = x;
  $('detailTitle').textContent = x.title;
  $('detailDesc').textContent = x.desc || 'Information issue de la source. Dolcia n\'ajoute aucune donnée inventée.';
  $('detailSource').textContent = x.source || 'Programme Dolcia';
  const conf = x.confidence || (x.kind ? 'check' : 'probable');
  const confLabel = { confirmed:'Confirmé', probable:'Très probable', check:'À vérifier' }[conf] || 'À vérifier';
  $('detailConfidence').textContent = confLabel;
  $('detailConfidence').className = 'confidence-badge ' + conf;
  const distLabel = x.dist!=null ? `${x.dist} km` : (x.distanceKm!=null ? `${x.distanceKm} km · vaut le détour` : null);
  const priceLabel = x.price || priceText(x);
  $('detailMeta').innerHTML = [x.source, distLabel, priceLabel, x.rating?`Note ${x.rating}/5`:null].filter(Boolean).map(m=>`<span>${m}</span>`).join('');
  $('detailWhy').textContent = x.desc ? `Pourquoi cette idée : ${x.desc}` : '';
  $('reserveBtn').textContent = 'Réservation bientôt disponible';
  $('reserveBtn').classList.remove('active');
  $('detail').classList.remove('hidden');
}
function closeOverlays(){ $('detail').classList.add('hidden'); $('agenda').classList.add('hidden'); }

function addToAgenda(id){
  const x = findItem(id); if(!x) return;
  const key = x.id;
  if (state.agenda.some(a=>a.key===key)) { flash('Déjà dans votre agenda'); return; }
  const price = x.priceN ? x.priceN * 12 : (x.free ? 0 : 15);
  state.agenda.push({ key, title:x.title, source:x.source||'Programme Dolcia', price });
  state.budgetSpent += price;
  saveAgenda();
  renderProgram();
  updateBudgetRing();
  flash('Ajouté à votre agenda Dolcia');
}
function removeFromAgenda(key){
  const item = state.agenda.find(a=>a.key===key);
  if (item) state.budgetSpent = Math.max(0, state.budgetSpent - (item.price||0));
  state.agenda = state.agenda.filter(a=>a.key!==key);
  saveAgenda(); renderAgendaList(); renderProgram(); updateBudgetRing();
}
function renderAgendaList(){
  const el = $('agendaList');
  if (!state.agenda.length){
    el.innerHTML = `<div class="empty-state"><h3>Votre agenda est vide.</h3><p>Ajoutez une activité pour construire votre programme.</p></div>`;
    return;
  }
  el.innerHTML = state.agenda.map(a=>`<div class="agenda-item">
    <div class="agenda-thumb"></div>
    <div><h4>${a.title}</h4><p>${a.source}${a.price?` · ${a.price} €`:''}</p></div>
    <button class="agenda-remove" data-remove="${a.key}">Retirer</button>
  </div>`).join('');
}

/* ---------------- Son synthétisé (aucun fichier externe) ---------------- */
let audioCtx = null;
function getAudioCtx(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, duration, type='sine', gainStart=0.18){
  if (liveState.muted) return;
  try{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainStart, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  }catch(e){}
}
function playCountBeep(){ playTone(520, 0.15, 'triangle', 0.2); }
function playGoBeep(){ playTone(720, 0.35, 'triangle', 0.22); }
function playAdvanceChime(){ playTone(660, 0.12, 'sine', 0.14); setTimeout(()=>playTone(880, 0.16, 'sine', 0.12), 90); }
function playClapSound(){
  if (liveState.muted) return;
  try{
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const noise = ctx.createBufferSource(); noise.buffer = buffer;
    const gain = ctx.createGain(); gain.gain.value = 0.35;
    noise.connect(gain); gain.connect(ctx.destination);
    noise.start();
  }catch(e){}
}
function playTadaChime(){
  [523,659,784,1047].forEach((f,i)=> setTimeout(()=>playTone(f, 0.5, 'triangle', 0.16), i*120));
}

/* ---------------- Confettis (canvas 2D, aucune dépendance) ---------------- */
function launchConfetti(canvasId, count=90){
  const canvas = document.getElementById(canvasId); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width; canvas.height = rect.height;
  const colors = ['#E8CC72','#C9A84C','#F5E6B8','#ffffff'];
  const particles = Array.from({length:count}).map(()=>({
    x: canvas.width/2, y: canvas.height*0.35,
    vx: (Math.random()-0.5)*9, vy: Math.random()*-8-3,
    size: Math.random()*5+3, color: colors[Math.floor(Math.random()*colors.length)],
    rot: Math.random()*Math.PI, vrot:(Math.random()-0.5)*0.3, life:1
  }));
  let frame = 0;
  function tick(){
    frame++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.life -= 0.012;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(p.life,0);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      ctx.restore();
    });
    if (frame < 140) requestAnimationFrame(tick); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  tick();
}
function clapBurst(){
  const btn = $('clapBtn'); if(!btn) return;
  btn.classList.remove('clapped'); void btn.offsetWidth; btn.classList.add('clapped');
  playClapSound();
  launchConfetti('confettiCanvas', 26);
}

/* ---------------------------------------------------------------
   DISCUTER AVEC D — la mascotte vivante de Dolcia
   L'IA tient une place centrale : chaque message tente d'abord la
   vraie IA via ta route existante (POST /api/events?service=chat,
   respecte ta règle "jamais de nouveau fichier API" — voir le
   README pour le code serveur à ajouter dans events.js). Si la
   route ne répond pas (hors ligne, pas encore branchée, ou dans cet
   environnement de démonstration sans accès réseau), un moteur
   conversationnel local prend le relais — jamais un silence, jamais
   un message d'erreur technique affiché à l'utilisateur.
   --------------------------------------------------------------- */
const dChat = { history: [], open:false, muted:false };

async function askDReal(userText){
  const payload = {
    message: userText,
    context: {
      screen: state.currentDepth,
      budgetRemaining: Math.max(0, state.budgetTotal - state.budgetSpent),
      agendaCount: state.agenda.length,
      currentActivity: liveState.item ? liveState.item.title : null,
      brief: state.understood
    }
  };
  for (const base of apiBases()){
    try{
      const r = await fetch(`${base}/events?service=chat`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
      });
      if (!r.ok) throw new Error('chat api ' + r.status);
      const d = await r.json();
      if (d && d.reply) return d.reply;
      throw new Error('réponse vide');
    }catch(e){ /* on tente la base suivante, puis le repli local */ }
  }
  return null;
}

/* Repli local : une vraie personnalité, pas un mur d'erreur.
   Ton chaleureux, précis sur ce que Dolcia sait réellement, jamais
   d'invention de fait (prix, horaires, disponibilité) — conforme
   au principe "zéro donnée fabriquée" même en conversation. */
function localDReply(userText){
  const low = userText.toLowerCase();
  const budgetRemaining = Math.max(0, state.budgetTotal - state.budgetSpent);

  if (/budget|combien.*reste|argent|prix/.test(low))
    return `Il vous reste ${budgetRemaining} € sur les ${state.budgetTotal} € prévus. Je recalcule à chaque activité ajoutée — vous ne dépasserez jamais sans me le dire explicitement.`;

  if (/bonjour|salut|coucou|hello/.test(low))
    return `Bonjour ! Je suis D, votre concierge et animateur. Dites-moi votre envie du moment, ou demandez-moi où en est votre programme.`;

  if (/comment (ça|tu) va|ça va\b/.test(low))
    return `Toujours prête à composer votre prochain moment ! Et vous, plutôt envie de bouger ou de souffler aujourd'hui ?`;

  if (liveState.item && /fatigu|pause|trop dur|difficile|ralent/.test(low))
    return `On peut ralentir le rythme, ce n'est pas une compétition. Je mets l'étape en pause si vous voulez — dites simplement "pause".`;

  if (liveState.item && /(c'est|super|génial|top|adoré|aimé)/.test(low))
    return `Ravie que ça vous plaise ! Je m'en souviens pour vous proposer des moments similaires la prochaine fois.`;

  if (/pluie|météo|temps qu'il fait/.test(low))
    return `Je surveille la météo en continu. S'il pleut, je recompose automatiquement vers une option abritée sans casser votre programme.`;

  if (/agenda|programme|prochain/.test(low)){
    const next = state.agenda[0];
    return next ? `Votre prochaine étape : ${next.title}. Je peux la déplacer ou en proposer une autre si vous voulez.` : `Votre agenda est vide pour l'instant — dites-moi votre envie et je compose quelque chose.`;
  }

  if (/pépite|caché|secret|local/.test(low))
    return `Les pépites locales sont mon terrain de jeu préféré — allez voir l'onglet "Pépites locales" dans Dolcia Anime, ce sont des trouvailles qu'on ne voit que sur une affiche de village.`;

  if (/merci/.test(low))
    return `Avec plaisir ! C'est exactement pour ça que j'existe.`;

  return `Je note. Pour que je vous propose la bonne chose, dites-moi : plutôt envie de bouger, de vous détendre, ou de découvrir quelque chose de nouveau ?`;
}

function appendDMessage(role, text){
  dChat.history.push({role, text});
  const el = $('dChatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'd-msg ' + (role === 'd' ? 'from-d' : 'from-user');
  bubble.textContent = text;
  el.appendChild(bubble);
  el.scrollTop = el.scrollHeight;
}
function showTyping(){
  const el = $('dChatMessages');
  const t = document.createElement('div');
  t.className = 'd-typing'; t.id = 'dTypingIndicator';
  t.innerHTML = '<span></span><span></span><span></span>';
  el.appendChild(t); el.scrollTop = el.scrollHeight;
}
function hideTyping(){ document.getElementById('dTypingIndicator')?.remove(); }

async function sendToD(userText){
  if (!userText.trim()) return;
  appendDMessage('user', userText);
  $('dChatInput').value = '';
  showTyping();
  const start = Date.now();
  let reply = await askDReal(userText);
  if (!reply) reply = localDReply(userText);
  // Un temps de "frappe" réaliste, jamais instantané comme un robot, jamais trop long non plus.
  const elapsed = Date.now() - start;
  const wait = Math.max(0, Math.min(1400, 500 + userText.length*8) - elapsed);
  setTimeout(()=>{
    hideTyping();
    appendDMessage('d', reply);
    if (!dChat.muted) speakLive(reply);
  }, wait);
}

function openDChat(){
  dChat.open = true;
  $('dChatDrawer').classList.remove('hidden');
  $('dChatFab').classList.add('hidden');
  if (!dChat.history.length){
    showTyping();
    setTimeout(()=>{ hideTyping(); appendDMessage('d', 'Je suis là. Une question sur votre programme, votre budget, ou juste envie de papoter ?'); }, 700);
  }
}
function closeDChat(){
  dChat.open = false;
  $('dChatDrawer').classList.add('hidden');
  $('dChatFab').classList.remove('hidden');
}
function updateDChatVisibility(screenId){
  const fab = $('dChatFab');
  if (!fab) return;
  const eligible = ['results','detail','agenda'].includes(screenId) || screenId === undefined;
  if (screenId === 'splash' || screenId === 'brief' || screenId === 'clarify' || screenId === 'loading'){
    fab.classList.add('hidden');
    $('dChatDrawer').classList.add('hidden');
  } else if (!dChat.open){
    fab.classList.remove('hidden');
  }
}

/* ---------------- Animation en direct : D anime vraiment ---------------- */
const liveState = { item:null, stepIndex:0, timerId:null, remaining:0, paused:false, muted:false };

function speakLive(text){
  if (liveState.muted) return;
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR'; u.rate = 0.98; u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

function launchLive(id){
  const x = state.animeItems.find(i=>i.id===id);
  if (!x || !x.steps || !x.steps.length){ flash('Cette activité n\'a pas encore de script d\'animation.'); return; }
  liveState.item = x; liveState.stepIndex = 0; liveState.paused = false;
  $('liveEnd').classList.add('hidden');
  $('liveAnim').classList.remove('hidden');
  $('liveBg').className = 'live-bg energy-' + (x.energy === 'vive' ? 'vive' : (x.energy === 'calme' ? 'calme' : 'douce'));
  renderLiveProgress();
  runLiveStep();
}

function renderLiveProgress(){
  const total = liveState.item.steps.length;
  $('liveProgress').innerHTML = Array.from({length: total}).map((_,i)=>{
    const cls = i < liveState.stepIndex ? 'done' : (i === liveState.stepIndex ? 'current' : '');
    return `<span class="${cls}"></span>`;
  }).join('');
}

function runLiveStep(){
  clearInterval(liveState.timerId);
  const step = liveState.item.steps[liveState.stepIndex];
  if (!step){ endLive(); return; }

  $('liveStepLabel').textContent = step.title;
  $('liveInstruction').textContent = step.instruction;
  $('eclatLive').classList.add('talking');
  $('liveBubble').classList.remove('pulse'); void $('liveBubble').offsetWidth; $('liveBubble').classList.add('pulse');
  if (liveState.stepIndex > 0) playAdvanceChime();
  speakLive(step.instruction);
  setTimeout(()=> $('eclatLive').classList.remove('talking'), Math.min(4000, step.instruction.length*55));

  renderLiveProgress();

  if (step.seconds){
    liveState.remaining = step.seconds;
    $('liveTimerWrap').classList.remove('hidden-timer');
    updateLiveTimerDisplay(step.seconds);
    liveState.timerId = setInterval(()=>{
      if (liveState.paused) return;
      liveState.remaining--;
      updateLiveTimerDisplay(step.seconds);
      if (liveState.remaining <= 0){
        clearInterval(liveState.timerId);
        advanceLive();
      }
    }, 1000);
  } else {
    $('liveTimerWrap').classList.add('hidden-timer');
  }
}
function updateLiveTimerDisplay(total){
  const circumference = 377;
  const pct = liveState.remaining / total;
  $('liveTimerFill').style.strokeDashoffset = circumference * (1 - pct);
  const m = Math.floor(liveState.remaining/60), s = liveState.remaining%60;
  $('liveTimerText').textContent = m>0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`;

  if (liveState.remaining <= 3 && liveState.remaining >= 1){
    const el = $('liveCountdown');
    el.classList.remove('hidden');
    el.innerHTML = `<span>${liveState.remaining}</span>`;
    void el.offsetWidth;
    playCountBeep();
  } else if (liveState.remaining === 0){
    const el = $('liveCountdown');
    el.classList.remove('hidden');
    el.innerHTML = `<span>Go !</span>`;
    playGoBeep();
    setTimeout(()=> el.classList.add('hidden'), 700);
  } else {
    $('liveCountdown').classList.add('hidden');
  }
}
function advanceLive(){
  liveState.stepIndex++;
  if (liveState.stepIndex >= liveState.item.steps.length){ endLive(); return; }
  runLiveStep();
}
function endLive(){
  clearInterval(liveState.timerId);
  window.speechSynthesis?.cancel();
  $('liveEnd').classList.remove('hidden');
  playTadaChime();
  setTimeout(()=> launchConfetti('confettiCanvasEnd', 130), 100);
  speakLive('Bravo à toute l\'équipe, quel beau moment !');
}
function closeLive(){
  clearInterval(liveState.timerId);
  window.speechSynthesis?.cancel();
  $('liveAnim').classList.add('hidden');
  $('liveEnd').classList.add('hidden');
  $('liveCountdown').classList.add('hidden');
}
function toggleLivePause(){
  liveState.paused = !liveState.paused;
  $('livePauseBtn').textContent = liveState.paused ? 'Reprendre' : 'Pause';
}
function toggleLiveSound(){
  liveState.muted = !liveState.muted;
  $('soundToggle').classList.toggle('muted', liveState.muted);
  if (liveState.muted) window.speechSynthesis?.cancel();
}

/* ---------------- Reconnaissance vocale (accélérateur, jamais imposé) ---------------- */
function initVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = $('micBtn');
  if (!SR){ btn.style.opacity = .35; btn.title = 'Dictée non disponible sur ce navigateur'; return; }
  const rec = new SR(); rec.lang = 'fr-FR'; rec.interimResults = false;
  let listening = false;
  btn.addEventListener('click', ()=>{
    if (listening) { rec.stop(); return; }
    rec.start(); listening = true; btn.classList.add('listening');
  });
  rec.onresult = e => {
    const text = e.results[0][0].transcript;
    $('briefText').value = ($('briefText').value + ' ' + text).trim();
    state.understood = { ...state.understood, ...analyzeBrief($('briefText').value) };
    renderUnderstood();
  };
  rec.onend = () => { listening = false; btn.classList.remove('listening'); };
}

function initParallax(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (reduced || !finePointer) return;
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    const target = document.querySelector('.screen.active .spatial-window, .screen.active .brief-wrap');
    if (target) target.style.transform = `translate(${x*4}px, ${y*4}px)`;
  }, { passive:true });
}

function initCardTilt(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (reduced || !finePointer) return;
  document.addEventListener('mousemove', e=>{
    const card = e.target.closest('.experience-card, .pepite-card');
    document.querySelectorAll('.experience-card.tilting, .pepite-card.tilting').forEach(c=>{
      if (c !== card){ c.style.transform=''; c.classList.remove('tilting'); }
    });
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add('tilting');
    card.style.transform = `perspective(700px) rotateX(${py*-6}deg) rotateY(${px*6}deg) translateY(-5px)`;
  }, { passive:true });
  document.addEventListener('mouseleave', ()=>{
    document.querySelectorAll('.tilting').forEach(c=>{ c.style.transform=''; c.classList.remove('tilting'); });
  }, true);
}

function initDChatVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = $('dChatMic');
  if (!SR){ btn.style.opacity = .35; return; }
  const rec = new SR(); rec.lang = 'fr-FR'; rec.interimResults = false;
  let listening = false;
  btn.addEventListener('click', ()=>{
    if (listening){ rec.stop(); return; }
    rec.start(); listening = true; btn.classList.add('listening');
  });
  rec.onresult = e => sendToD(e.results[0][0].transcript);
  rec.onend = () => { listening = false; btn.classList.remove('listening'); };
}

/* ---------------- Init ---------------- */
function init(){
  initChips();
  initVoice();
  initParallax();
  initCardTilt();

  $('startBtn').addEventListener('click', goToBrief);
  $('briefBack').addEventListener('click', backFromBrief);
  $('toggleRefine').addEventListener('click', toggleRefine);
  $('briefText').addEventListener('input', e=>{
    state.brief.text = e.target.value;
    state.understood = { ...state.understood, ...analyzeBrief(e.target.value) };
    renderUnderstood();
  });
  $('sendBriefBtn').addEventListener('click', startClarifyOrLoad);
  $('clarifySkip').addEventListener('click', skipClarify);
  $('clarifySkipAll').addEventListener('click', skipAllClarify);
  $('clarifyOptions').addEventListener('click', e=>{
    const btn = e.target.closest('[data-clarify-val]'); if(!btn) return;
    answerClarify(btn.dataset.clarifyVal);
  });

  $('resultsBack').addEventListener('click', ()=>showScreen('brief'));
  $('restartResults').addEventListener('click', ()=>{ state.brief={text:'',when:null,who:null,budget:null}; state.understood={}; showScreen('splash'); });
  $('diagBtn').addEventListener('click', ()=>{ if(state.diagnostics.length) alert(JSON.stringify(state.diagnostics,null,2)); else alert('Le diagnostic apparaît après une recherche.'); });

  document.querySelectorAll('.depth-tab').forEach(t=>t.addEventListener('click', ()=>switchDepth(t.dataset.depth)));
  $('regenProgramBtn').addEventListener('click', ()=>{ state.agenda.sort(()=>Math.random()-0.5); renderProgram(); flash('Programme régénéré'); });

  $('filterToggleBtn').addEventListener('click', ()=>{
    $('filterPanel').classList.toggle('hidden');
    $('filterToggleBtn').classList.toggle('active');
  });
  $('filterDist').addEventListener('input', e=>{
    state.filters.maxDist = Number(e.target.value);
    $('filterDistLabel').textContent = state.filters.maxDist + ' km';
    renderExplore();
  });
  $('filterToggles').addEventListener('click', e=>{
    const chip = e.target.closest('[data-toggle]'); if(!chip) return;
    const key = chip.dataset.toggle;
    state.filters[key] = !state.filters[key];
    chip.classList.toggle('toggle-on', state.filters[key]);
    renderExplore();
  });
  $('filterSort').addEventListener('click', e=>{
    const chip = e.target.closest('[data-sort]'); if(!chip) return;
    document.querySelectorAll('#filterSort .chip').forEach(c=>c.classList.toggle('selected', c===chip));
    state.filters.sort = chip.dataset.sort;
    renderExplore();
  });

  document.querySelectorAll('.anime-subtab').forEach(t=>t.addEventListener('click', ()=>switchAnimeSub(t.dataset.sub)));

  $('animeContextRow').addEventListener('click', e=>{
    const chip = e.target.closest('[data-ctx]'); if(!chip) return;
    document.querySelectorAll('#animeContextRow .chip').forEach(c=>c.classList.toggle('selected', c===chip));
    renderAnime(chip.dataset.ctx);
  });

  $('closeDetail').addEventListener('click', closeOverlays);
  $('closeAgenda').addEventListener('click', closeOverlays);
  $('clearAgenda').addEventListener('click', ()=>{ state.agenda=[]; state.budgetSpent=0; saveAgenda(); renderAgendaList(); renderProgram(); updateBudgetRing(); });
  $('addAgendaBtn').addEventListener('click', ()=> state.current && addToAgenda(state.current.id));
  $('routeBtn').addEventListener('click', ()=>{
    const x = state.current; if(!x) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.title+' '+state.city.name)}`,'_blank');
  });
  $('detailFav').addEventListener('click', ()=>{
    const x = state.current; if(!x) return;
    if (state.favs.includes(x.id)) state.favs = state.favs.filter(k=>k!==x.id); else state.favs.push(x.id);
    saveFavs(); flash(state.favs.includes(x.id)?'Ajouté aux favoris':'Retiré des favoris');
  });

  $('dChatFab').addEventListener('click', openDChat);
  $('dChatClose').addEventListener('click', closeDChat);
  $('dChatSend').addEventListener('click', ()=> sendToD($('dChatInput').value));
  $('dChatInput').addEventListener('keydown', e=>{ if(e.key==='Enter') sendToD($('dChatInput').value); });
  initDChatVoice();
  $('liveEndClose').addEventListener('click', closeLive);
  $('livePauseBtn').addEventListener('click', toggleLivePause);
  $('liveNextBtn').addEventListener('click', advanceLive);
  $('soundToggle').addEventListener('click', toggleLiveSound);
  $('clapBtn').addEventListener('click', clapBurst);
  $('liveEnd').addEventListener('click', e=>{
    const chip = e.target.closest('[data-feeling]'); if(!chip) return;
    document.querySelectorAll('#liveEnd .chip').forEach(c=>c.classList.toggle('selected', c===chip));
    flash('Merci, Dolcia s\'en souviendra pour la prochaine fois');
  });

  document.addEventListener('click', e=>{
    const open = e.target.closest('[data-open]');
    if (open && !e.target.closest('button')) openItem(open.dataset.open);
    const launch = e.target.closest('[data-launch]');
    if (launch){ e.stopPropagation(); launchLive(launch.dataset.launch); }
    const ag = e.target.closest('[data-agenda]');
    if (ag){ e.stopPropagation(); addToAgenda(ag.dataset.agenda); }
    const rm = e.target.closest('[data-remove]');
    if (rm){ e.stopPropagation(); removeFromAgenda(rm.dataset.remove); }
    const nav = e.target.closest('[data-tab]');
    if (nav){
      if (nav.dataset.tab==='agenda'){ renderAgendaList(); $('agenda').classList.remove('hidden'); }
      if (nav.dataset.tab==='surprise'){ switchDepth('anime'); }
      if (nav.dataset.tab==='discover'){ switchDepth('explore'); }
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b===nav));
    }
  });
}
init();
