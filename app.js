const app = document.querySelector('#app');

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
    ['2h','Environ 2 heures','Un moment court, à l’heure de votre choix',IMAGES.food],['morning','La matinée','Du petit-déjeuner jusqu’à midi',IMAGES.outside],['afternoon','L’après-midi','De midi jusqu’en fin de journée',IMAGES.slow],['evening','La soirée','À partir de 18 heures',IMAGES.night],['day','La journée complète','Du matin au soir',IMAGES.family],['stay','Plusieurs jours','Hébergement et programme jour par jour',IMAGES.culture]
  ]},
  {key:'who', eyebrow:'Le contexte', title:'Avec qui partagez-vous ce moment ?', sub:'Dolcia adapte ensuite les lieux et le rythme aux personnes présentes.', options:[
    ['couple','À deux','Une parenthèse complice',IMAGES.couple],['family','En famille','Pensé pour petits et grands',IMAGES.family],['friends','Entre amis','Des souvenirs à plusieurs',IMAGES.friends],['solo','Pour moi','Suivre ses propres envies',IMAGES.solo]
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
  location:{name:'Le Touquet-Paris-Plage',lat:50.5214,lng:1.5912}, answers:{vibes:[]}, items:[], allItems:[], program:[], alternatives:[], weather:null, radius:12000,
  agenda:JSON.parse(localStorage.getItem('dolcia_agenda_v2')||'[]'),
  favorites:JSON.parse(localStorage.getItem('dolcia_favorites_v2')||'[]'),
  feedback:JSON.parse(localStorage.getItem('dolcia_feedback_v2')||'{}'),
  starRatings:JSON.parse(localStorage.getItem('dolcia_stars_v2')||'{}'),
  tasteProfile:JSON.parse(localStorage.getItem('dolcia_taste_profile_v2')||'{}')
};

const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => d.toLocaleDateString('fr-FR',{day:'numeric',month:'long'});
const iso = d => {const date=new Date(d);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();
const save = () => {localStorage.setItem('dolcia_agenda_v2',JSON.stringify(state.agenda));localStorage.setItem('dolcia_favorites_v2',JSON.stringify(state.favorites));localStorage.setItem('dolcia_feedback_v2',JSON.stringify(state.feedback));localStorage.setItem('dolcia_stars_v2',JSON.stringify(state.starRatings));localStorage.setItem('dolcia_taste_profile_v2',JSON.stringify(state.tasteProfile))};

function shell(content, active='discover'){
  return `<main class="app"><header class="topbar"><button class="brand" onclick="home()">dolc<i>ia</i></button><div class="top-actions"><button class="location" onclick="useLocation()">${esc(state.location.name)}</button><button class="avatar" onclick="showToast('Votre espace personnel arrive bientôt')">VD</button></div></header>${content}${nav(active)}</main>`;
}
function nav(active){return `<nav class="bottom-nav" aria-label="Navigation"><button class="nav-item ${active==='discover'?'active':''}" onclick="home()">Découvrir</button><button class="nav-item ${active==='compose'?'active':''}" onclick="startCompose()">Composer</button><button class="nav-item ${active==='agenda'?'active':''}" onclick="renderAgenda()">Agenda ${state.agenda.length?`· ${state.agenda.length}`:''}</button><button class="nav-item ${active==='services'?'active':''}" onclick="renderServices()">Services</button></nav>`}

function home(){
  state.view='home';
  app.innerHTML=shell(`<section class="hero"><div class="hero-photo"></div><div class="hero-copy"><span class="kicker">Chaque instant mérite une expérience</span><h1>Vos prochaines émotions<br><em>commencent ici.</em></h1><p>Dolcia imagine votre moment à partir d’expériences réelles, choisies selon vos envies, votre rythme et votre destination.</p><div class="hero-cta"><button class="primary" onclick="startCompose()">Composer mon expérience <span class="arrow">→</span></button><button class="round-action" onclick="document.querySelector('#livePulse').scrollIntoView({behavior:'smooth'})" aria-label="Voir ce qui se passe maintenant">↓</button></div></div><div class="hero-index"><b>01</b> / 03</div></section>
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
async function loadHomePulse(){const today=iso(new Date());try{const [weather,official,tickets]=await Promise.allSettled([get(`/api/weather?lat=${state.location.lat}&lng=${state.location.lng}`),get(`/api/touquet-events?after=${today}&before=${today}`),get(`/api/ticketmaster-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=12&after=${today}&before=${today}`)]);if(state.view!=='home')return;const w=weather.status==='fulfilled'?weather.value:null;const temp=document.querySelector('#pulseTemp'),label=document.querySelector('#pulseWeather');if(temp&&w?.main?.temp!=null)temp.textContent=`${Math.round(w.main.temp)}° au Touquet`;if(label)label.textContent=w?.weather?.[0]?.description||'Météo locale';const raw=[...(official.status==='fulfilled'?official.value.events||[]:[]),...(tickets.status==='fulfilled'?tickets.value.events||[]:[])];const events=dedupe(normalizeEvents(raw)).slice(0,3);const list=document.querySelector('#pulseEventList');if(list)list.innerHTML=events.length?events.map(event=>`<button onclick="openHomeEvent('${esc(event.id||'')}')"><span>${event.date?new Date(event.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'Aujourd’hui'}</span><strong>${esc(event.name)}</strong><b>→</b></button>`).join(''):'<p>Aucun événement officiel suffisamment documenté pour aujourd’hui. Dolcia ne fabrique rien.</p>'}catch(_){const list=document.querySelector('#pulseEventList');if(list)list.innerHTML='<p>Les sources officielles sont momentanément indisponibles.</p>'}}
function openHomeEvent(id){startCompose();showToast('Choisissez votre timing : Dolcia intégrera les événements du jour')}
function moment(kicker,title,image){return `<button class="moment-card" onclick="startCompose()"><img src="${image}" alt=""><span class="moment-copy"><small>${kicker}</small><h3>${title}</h3></span></button>`}
function dropCard(tag,title,copy,image,color){return `<button class="drop" style="--accent:${color}" onclick="startCompose()"><div class="drop-visual" style="background-image:url('${image}')"><span>${tag}</span></div><div class="drop-copy"><h3>${title}</h3><p>${copy}</p><b>Créer ce moment →</b></div></button>`}
function quickLife(who){const hour=new Date().getHours();state.dateMode=hour>=17?'tonight':'today';state.dateStart=new Date();state.dateEnd=new Date();state.answers={duration:hour>=17?'evening':hour>=13?'afternoon':'day',who,vibes:[],budget:'flexible'};state.step=2;state.view='compose';renderComposer()}

function startCompose(){state.step=-1; state.view='compose'; renderComposer()}
function renderComposer(){
  if(state.step===-1) return renderDate();
  const base=FLOW[state.step], s=base.key==='budget'?{...base,...budgetStep()}:base, selected=state.answers[s.key];
  app.innerHTML=shell(`<section class="composer"><div class="composer-shell"><div class="composer-head"><div><span class="kicker">${s.eyebrow}</span><h2>${s.title}</h2></div><div class="step-count">${state.step+1} / ${FLOW.length}<div class="progress"><span style="width:${((state.step+1)/FLOW.length)*100}%"></span></div></div></div><p class="step-lead">${s.sub}</p><div class="choice-grid">${s.options.map(o=>choice(s,o,selected)).join('')}</div><div class="composer-actions"><button class="secondary" onclick="backStep()">← Retour</button><button class="primary" onclick="nextStep()">${state.step===FLOW.length-1?'Composer mon moment':'Continuer →'}</button></div></div></section>`,'compose');
}
function budgetStep(){
  const duration=state.answers.duration||'2h';
  const sets={
    '2h':{title:'Quel budget pour ces deux heures ?',sub:'Budget total par personne pour l’ensemble du moment.',values:[['free','0 €','Uniquement les expériences confirmées gratuites'],['budget1','Jusqu’à 25 €','Une sortie simple et accessible'],['budget2','Jusqu’à 60 €','Plus de possibilités par personne'],['flexible','Sans limite précise','Priorité à l’expérience']]},
    half:{title:'Quel budget pour cette demi-journée ?',sub:'Budget total par personne, activités et repas éventuel compris.',values:[['free','0 €','Uniquement les expériences confirmées gratuites'],['budget1','Jusqu’à 50 €','Une demi-journée accessible'],['budget2','Jusqu’à 120 €','Activités et belle table possibles'],['flexible','Sans limite précise','Priorité à l’expérience']]},
    day:{title:'Quel budget pour toute la journée ?',sub:'Budget total par personne pour le programme complet.',values:[['free','0 €','Une journée uniquement gratuite'],['budget1','Jusqu’à 80 €','Sorties et repas maîtrisés'],['budget2','Jusqu’à 200 €','Une journée très complète'],['flexible','Sans limite précise','Priorité à l’expérience']]},
    stay:{title:'Quel budget pour tout le séjour ?',sub:'Budget total par personne, hébergement inclus. Dolcia adapte le programme au nombre de nuits.',values:[['budget1','Jusqu’à 300 €','Court séjour et hébergement accessible'],['budget2','Jusqu’à 800 €','Hôtel et expériences confortables'],['budget3','Jusqu’à 1 500 €','Séjour premium plus complet'],['flexible','Sans limite précise','Priorité aux meilleures expériences']]}
  };
  const set=sets[['morning','afternoon','evening'].includes(duration)?'half':duration];return {title:set.title,sub:set.sub,options:set.values.map((x,i)=>[...x,[IMAGES.outside,IMAGES.family,IMAGES.food,IMAGES.slow][i]])}
}
function choice(step,o,selected){const active=step.multi?selected.includes(o[0]):selected===o[0]; return `<button class="choice ${active?'selected':''}" onclick="pick('${step.key}','${o[0]}',${!!step.multi})"><img src="${o[3]}" alt=""><span class="choice-copy"><h3>${o[1]}</h3><p>${o[2]}</p></span></button>`}
function pick(key,val,multi){if(multi){const a=state.answers[key];state.answers[key]=a.includes(val)?a.filter(x=>x!==val):[...a,val]}else{state.answers[key]=val;if(key==='duration')state.answers.budget=null}renderComposer()}
function nextStep(){if(state.step>=0){const s=FLOW[state.step],v=state.answers[s.key];if(!v||(Array.isArray(v)&&!v.length))return showToast('Choisissez une option pour continuer')} if(state.step<FLOW.length-1){state.step++;renderComposer()}else compose()}
function backStep(){if(state.step<=0){state.step=-1;renderDate()}else{state.step--;renderComposer()}}

function renderDate(){
  app.innerHTML=shell(`<section class="composer"><div class="composer-shell"><div class="composer-head"><div><span class="kicker">Le moment</span><h2>Où et quel jour voulez-vous sortir ?</h2></div><div class="step-count">Point de départ<div class="progress"><span style="width:12%"></span></div></div></div><p class="step-lead">Choisissez votre date ou votre séjour. Pour plusieurs jours, Dolcia comprend automatiquement qu’il faut composer un séjour complet : elle ne vous redemandera pas la durée.</p><div class="destination-row">${Object.entries(DESTINATIONS).map(([id,d])=>`<button class="destination-pill ${state.location.name===d.name?'active':''}" onclick="setDestination('${id}')">${d.name}</button>`).join('')}<button class="destination-pill" onclick="useLocation()">Autour de moi</button></div><div class="date-grid"><div class="date-presets">${[['today','Aujourd’hui en journée','Pour une sortie aujourd’hui'],['tonight','Ce soir','À partir de 18 heures'],['tomorrow','Demain','Pour demain, à votre rythme'],['weekend','Ce week-end','Du samedi au dimanche']].map(x=>`<button class="date-pill ${state.dateMode===x[0]?'active':''}" onclick="setDate('${x[0]}')"><b>${x[1]}</b><br><small>${x[2]}</small></button>`).join('')}</div>${calendar()}</div><div class="composer-actions"><button class="secondary" onclick="home()">← Accueil</button><button class="primary" onclick="confirmDate()">Valider cette date →</button></div></div></section>`,'compose');
}
function confirmDate(){if(tripDays()>1){state.answers.duration='stay';state.step=1}else state.step=0;renderComposer()}
function setDestination(id){const d=DESTINATIONS[id];if(!d)return;state.location={name:d.name,lat:d.lat,lng:d.lng};state.radius=d.radius;renderDate()}
function setDate(mode){const now=new Date();state.dateMode=mode;let d=new Date(now);if(mode==='tomorrow')d.setDate(d.getDate()+1);if(mode==='weekend'){const add=(6-d.getDay()+7)%7;d.setDate(d.getDate()+add)}state.dateStart=d;state.dateEnd=mode==='weekend'?new Date(d.getFullYear(),d.getMonth(),d.getDate()+1):new Date(d);state.month=new Date(d.getFullYear(),d.getMonth(),1);renderDate()}
function calendar(){const y=state.month.getFullYear(),m=state.month.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,count=new Date(y,m+1,0).getDate();let cells='';for(let i=0;i<first;i++)cells+='<button class="cal-cell empty"></button>';for(let d=1;d<=count;d++){const date=new Date(y,m,d),selected=sameDay(date,state.dateStart)||sameDay(date,state.dateEnd),inRange=state.dateStart&&state.dateEnd&&date>state.dateStart&&date<state.dateEnd;cells+=`<button class="cal-cell ${selected?'selected':''} ${inRange?'in-range':''}" onclick="pickDate(${y},${m},${d})">${d}</button>`}const range=state.dateStart?`${fmt(state.dateStart)}${state.dateEnd&&!sameDay(state.dateStart,state.dateEnd)?` → ${fmt(state.dateEnd)} · ${tripDays()} jours`:''}`:'Choisissez une date';return `<div class="calendar"><div class="cal-head"><button onclick="moveMonth(-1)">←</button><div><b>${state.month.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</b><small>${range}</small></div><button onclick="moveMonth(1)">→</button></div><div class="cal-hint">Cliquez sur l’arrivée, puis sur le départ</div><div class="cal-days">${['L','M','M','J','V','S','D'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cal-grid">${cells}</div></div>`}
function moveMonth(n){state.month=new Date(state.month.getFullYear(),state.month.getMonth()+n,1);renderDate()}
function pickDate(y,m,d){const date=new Date(y,m,d);if(state.dateMode!=='custom'||!state.dateStart||!sameDay(state.dateStart,state.dateEnd)){state.dateStart=date;state.dateEnd=date;state.dateMode='custom'}else if(date<state.dateStart){state.dateEnd=state.dateStart;state.dateStart=date}else{state.dateEnd=date}renderDate()}
function tripDays(){if(!state.dateStart||!state.dateEnd)return 1;return Math.max(1,Math.round((state.dateEnd-state.dateStart)/86400000)+1)}

async function useLocation(){
  if(!navigator.geolocation)return showToast('La géolocalisation n’est pas disponible');
  showToast('Localisation en cours…');navigator.geolocation.getCurrentPosition(p=>{state.location={name:'Autour de vous',lat:p.coords.latitude,lng:p.coords.longitude};state.radius=18000;renderDate()},()=>showToast('Localisation non autorisée'),{timeout:5000,maximumAge:600000});
}

async function compose(){
  state.view='loading';app.innerHTML=shell(`<section class="loading"><div class="loading-card"><div class="loader"></div><span class="kicker">Concierge Dolcia</span><h2>Nous composons votre moment.</h2><p>Nous croisons vos envies, la date, la météo et les expériences réelles autour de ${esc(state.location.name)}.</p><div class="live-search"><div class="live-line"><span>Météo locale</span><b id="load-weather">En cours</b></div><div class="live-line"><span>Événements aux bonnes dates</span><b id="load-events">En cours</b></div><div class="live-line"><span>Lieux accordés à vos envies</span><b id="load-places">En cours</b></div><div class="live-preview" id="live-preview"></div></div></div></section>`,'compose');
  state.items=[]; const queries=queriesForVibes();
  try{
    const weather=`/api/weather?lat=${state.location.lat}&lng=${state.location.lng}`;
    const event=`/api/events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(new Date(state.dateEnd.getTime()+86400000))}&size=40`;
    const officialTouquet=`/api/touquet-events?after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const ticketmaster=`/api/ticketmaster-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const partners=`/api/partner-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const nationalTourism=`/api/datatourisme?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const placeQueries=queries.slice(0,24).map(q=>`/api/places?lat=${state.location.lat}&lng=${state.location.lng}&radius=${state.radius}&mode=text&keyword=${encodeURIComponent(q+' '+state.location.name)}`);
    const get=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('source');return r.json()};
    const weatherJob=get(weather).then(d=>{if(!d.error)state.weather=d;markLoaded('weather',d.error?'Indisponible':`${Math.round(d.main?.temp||0)}°`)}).catch(()=>markLoaded('weather','Indisponible'));
    const eventJob=get(event).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);markLoaded('events',`${found.length} trouvés`);updateLivePreview()}).catch(()=>markLoaded('events','Source au repos'));
    const officialJob=/Touquet|Opale/.test(state.location.name)?get(officialTouquet).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);markLoaded('events',`${found.length}+ officiels`);updateLivePreview()}).catch(()=>null):Promise.resolve();
    const ticketmasterJob=get(ticketmaster).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);updateLivePreview()}).catch(()=>null);
    const partnerJob=get(partners).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);if(found.length)markLoaded('events',`${found.length}+ partenaires`);updateLivePreview()}).catch(()=>null);
    const nationalJob=get(nationalTourism).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);if(found.length)markLoaded('events',`${found.length}+ offices de tourisme`);updateLivePreview()}).catch(()=>null);
    let placesFound=0;
    const placeJobs=placeQueries.map(url=>get(url).then(d=>{const found=normalizePlaces(d.results||[]);placesFound+=found.length;state.items.push(...found);markLoaded('places',`${placesFound} trouvés`);updateLivePreview()}).catch(()=>null));
    await Promise.allSettled([weatherJob,eventJob,officialJob,ticketmasterJob,partnerJob,nationalJob,...placeJobs]);
    state.allItems=scoreItems(dedupe(state.items));
    state.program=buildProgram(state.allItems);
    state.alternatives=buildAlternatives(state.allItems);
    state.items=state.program.map(slot=>slot.item);
  }catch(_){/* L'état de repli reste volontairement non technique. */}
  renderResults();
}
function markLoaded(key,text){const el=document.querySelector(`#load-${key}`);if(el){el.textContent=text;el.classList.add('done')}}
function updateLivePreview(){const el=document.querySelector('#live-preview');if(!el)return;el.innerHTML=dedupe(state.items).slice(0,3).map(i=>`<span>${esc(i.name)}</span>`).join('')}
function queriesForVibes(){
  const selectedMap={
    play:['parc attractions parc à thème','bowling','laser game','escape game','karting','trampoline park','réalité virtuelle','paintball mini golf'],
    breathe:['plage balade nature jardin','accrobranche parcours aventure','réserve naturelle animaux','sports nautiques voile surf paddle kayak','équitation poney','golf vélo escalade'],
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
  if(['day','stay'].includes(state.answers.duration))selected.push('concert spectacle soirée casino bar');
  if(state.answers.duration==='stay'){const lodging={family:'hôtel familial piscine',sea:'hôtel vue mer',character:'hôtel de charme',simple:'hôtel central bien placé'}[state.answers.lodging]||'hôtels hébergements résidences de tourisme';selected.unshift(lodging)}
  return [...new Set([...selected,...broad])];
}
function normalizePlaces(items){return items.map((p,i)=>{const photos=(p.photos||[]).map(x=>`/api/photo?ref=${encodeURIComponent(x.photo_reference)}&maxwidth=1200`);return {id:'g-'+(p.place_id||i),placeId:p.place_id,name:p.name,source:'Google Places',category:category(p.types?.join(' ')+' '+p.name),address:p.formatted_address||p.vicinity||'',lat:p.geometry?.location?.lat,lng:p.geometry?.location?.lng,rating:p.rating,reviews:p.user_ratings_total,price:p.price_level,isOpen:p.opening_hours?.open_now,businessStatus:p.business_status,photo:photos[0]||null,photos,booking:null}})}
function normalizeEvents(items){return items.map((e,i)=>({id:'e-'+(e.uid||e.id||i),name:typeof e.title==='object'?(e.title.fr||Object.values(e.title)[0]):e.title,source:e.source||'OpenAgenda',category:category(`${e.type||''} ${typeof e.title==='object'?JSON.stringify(e.title):e.title}`),address:e.address||e.location||'',lat:e.lat??e.latitude,lng:e.lng??e.longitude,date:e.date,photo:typeof e.image==='string'?e.image:(e.image?.base||e.thumbnail),booking:e.registrationUrl,free:e.free,priceLabel:e.priceLabel,official:e.official,partner:e.partner,sponsored:e.sponsored,sponsorshipTier:e.sponsorshipTier}))}
function category(text=''){const t=text.toLowerCase();if(/hotel|hôtel|lodging|hébergement/.test(t))return'hotel';if(/feu d.artifice|bal populaire|concert|spectacle|soirée/.test(t))return'night';if(/restaurant|cafe|food|gastr/.test(t))return'food';if(/museum|art|cinema|theater|culture|expo/.test(t))return'culture';if(/spa|beauty|yoga|bien/.test(t))return'slow';if(/bar|night|music/.test(t))return'night';if(/park|parc|nature|plage|garden|forêt/.test(t))return'outside';return'active'}
function dedupe(items){const seen=new Set();return items.filter(x=>{const k=(x.name||'').toLowerCase().trim();if(!k||seen.has(k))return false;seen.add(k);return true})}
function itemImage(i){return i.photo||IMAGES[i.category]||IMAGES.fallback}
function distanceKm(a,b,c,d){const R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,q=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function scoreItems(items){
  const temp=state.weather?.main?.temp??18,cond=(state.weather?.weather?.[0]?.main||'').toLowerCase(),vibes=state.answers.vibes||[],who=state.answers.who;
  const budget=state.answers.budget;
  return items.filter(i=>{
    if(i.source==='Google Places'&&(!i.placeId||!i.address||i.lat==null||i.lng==null||i.businessStatus==='CLOSED_PERMANENTLY'))return false;
    if(i.lat!=null&&i.lng!=null){
      const km=distanceKm(state.location.lat,state.location.lng,i.lat,i.lng);
      if(km>state.radius/1000)return false;
    }
    const addressText=`${i.address||''} ${i.name||''}`.toLowerCase();
    if(state.location.name==='Le Touquet-Paris-Plage'&&/\bcalais\b|\bboulogne-sur-mer\b|\bdunkerque\b/.test(addressText))return false;
    const activityText=`${i.name||''} ${i.address||''}`.toLowerCase();
    if(['family','friends'].includes(who)&&/golf/.test(activityText)&&/compétition|competition|championnat|trophée|trophee|coupe/.test(activityText))return false;
    if(i.source!=='Google Places'){
      if(!i.date)return false;
      const day=iso(new Date(i.date));
      if(day<iso(state.dateStart)||day>iso(state.dateEnd))return false;
    }
    if(budget==='free')return i.free||i.price===0;
    if(budget==='budget1'&&i.price!=null)return i.price<=1;
    if(budget==='budget2'&&i.price!=null)return i.price<=2;
    if(budget==='budget3'&&i.price!=null)return i.price<=3;
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
    if(budget==='budget1'&&i.price===1)score+=12;
    if(budget==='budget2'&&i.price===2)score+=14;
    if(budget==='budget3'&&i.price>=2)score+=16;
    if(state.answers.duration==='stay'&&i.category==='hotel')score+=32;
    if(budget==='flexible'){
      if(i.price>=2)score+=22;
      if(i.price>=3)score+=8;
      if(i.free||i.price===0)score-=12;
      if(i.rating>=4.6&&i.reviews>100)score+=10;
    }
    if(state.favorites.includes(i.id))score+=20;
    if(state.feedback[i.id]==='like')score+=18;if(state.feedback[i.id]==='dislike')score-=30;
    score+=(state.tasteProfile[i.category]||0)*4;
    if(state.starRatings[i.id])score+=(state.starRatings[i.id]-3)*5;
    return {...i,score,distance};
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
  const available=pool.filter(item=>!excludedIds.includes(item.id));
  const used=new Set(), usedKinds=new Set(), slots=[];
  const wanted=programTemplates();
  for(const [label,categories] of wanted){
    let candidates=available.filter(item=>!used.has(item.id)&&categories.includes(item.category)&&(!usedKinds.has(experienceKind(item))||experienceKind(item)==='event'));
    candidates.sort((a,b)=>slotScore(b,label)-slotScore(a,label));
    const strictSlot=categories.length===1&&categories[0]==='hotel';
    const item=candidates[0]||(strictSlot?null:available.find(value=>!used.has(value.id)));
    if(item){used.add(item.id);usedKinds.add(experienceKind(item));slots.push({label,item})}
  }
  return slots;
}

function experienceKind(item){const t=`${item.name||''} ${item.category||''}`.toLowerCase();if(/golf|tennis|padel|sport/.test(t))return'sport';if(/restaurant|brunch|café|food/.test(t))return'food';if(/concert|spectacle|festival|fête|feu d.artifice|atelier|exposition/.test(t))return'event';if(/spa|massage|thalasso|yoga/.test(t))return'wellness';if(/plage|voile|foil|surf|paddle|kayak|nautique|aquatique/.test(t))return'water';if(/parc|bowling|laser|escape|karting/.test(t))return'play';return item.category||'other'}

function buildAlternatives(pool){
  const used=new Set();
  return programTemplates().map(([label,categories])=>{
    let candidates=pool.filter(item=>!used.has(item.id)&&categories.includes(item.category));
    candidates.sort((a,b)=>slotScore(b,label)-slotScore(a,label));
    const items=candidates.slice(0,3);
    items.forEach(item=>used.add(item.id));
    return {label,items};
  }).filter(group=>group.items.length);
}

function programTemplates(){
  const templates={
    '2h':[['Votre moment',['active','culture','outside','slow','food','night']]],
    morning:[['09:30 · Commencer doucement',['food','outside','slow']],['11:00 · Découvrir',['active','culture','outside']]],
    afternoon:[['14:00 · Explorer',['active','culture','outside']],['16:30 · Faire une pause',['slow','food','outside']]],
    evening:[['19:00 · Ouvrir la soirée',['food','culture']],['21:00 · Le temps fort',['night','culture','active']],['23:00 · Prolonger',['night','outside']]],
    day:[['09:30 · Commencer la journée',['outside','active','culture']],['12:30 · Déjeuner',['food']],['15:00 · Activité de l’après-midi',['active','culture','slow','outside']],['19:30 · Dîner',['food']],['22:30 · Événement ou sortie du soir',['night','culture','outside']]],
    stay:[['Votre hébergement',['hotel']],['Jour 1 · Première expérience',['outside','culture','active']],['Jour 1 · Dîner et soirée',['food','night']],['Jour 2 · Découverte',['culture','active','slow']],['Jour 2 · Temps fort',['night','outside','food']]]
  };
  return templates[state.answers.duration||'2h']||templates['2h'];
}

function slotScore(item,label){
  let score=item.score||0;
  if(item.official&&item.date)score+=25;
  if(/Événement|temps fort|soir|Prolonger/.test(label)&&item.official)score+=35;
  if(/Déjeuner|Dîner/.test(label)&&item.category==='food')score+=30;
  if(item.distance!=null)score+=Math.max(0,12-item.distance);
  return score;
}

function renderResults(){
  state.view='results';
  const criteria=criteriaLabels();
  app.innerHTML=shell(`<section class="results-hero"><div class="results-photo" style="background-image:url('${IMAGES.hero}')"></div><div class="results-copy"><span class="kicker">Composé pour vous</span><h1>Votre moment<br>prend forme.</h1><p>${state.weather?.main?.temp?`${Math.round(state.weather.main.temp)}°, `:''}${esc(state.location.name)}. Plusieurs choix pertinents pour chaque moment, uniquement à la date et dans la destination sélectionnées.</p><div class="tags">${criteria.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><button class="surprise-hero" onclick="surprise()"><span>Confiez votre temps à Dolcia</span><strong>${composeCta()}</strong><b>→</b></button></div></section><section class="program">${weatherPlan()}<div class="program-head"><div><span class="kicker">Le catalogue organisé</span><h2>${state.alternatives.length?'Choisissez ce qui vous plaît':'Une autre piste ?'}</h2></div><div class="program-actions"><button class="secondary" onclick="surprise()">${composeCta()}</button><button class="secondary" onclick="startCompose()">Modifier mes choix</button></div></div>${state.alternatives.length?state.alternatives.map(alternativeGroup).join(''):emptyState()}${state.alternatives.length?`<div class="agenda-guidance"><strong>Vous choisissez activité par activité.</strong><span>Retrouvez uniquement vos choix dans l’onglet Agenda en bas de l’écran.</span><button onclick="renderAgenda()">Ouvrir mon agenda →</button></div>`:''}</section>`,'discover');
}
function renderSurprise(){
  state.view='surprise';
  const criteria=criteriaLabels();
  app.innerHTML=shell(`<section class="surprise-cover"><div class="surprise-cover-photo"></div><div class="surprise-cover-copy"><span class="kicker">Votre programme composé</span><h1>Votre moment.<br><em>Aux petits oignons.</em></h1><p>Dolcia a choisi et ordonné chaque étape selon la durée, la date, la météo, votre budget et ce qu’elle apprend de vos goûts.</p><div class="tags">${criteria.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><div class="surprise-controls"><button class="primary" onclick="adoptSurprise()">Ajouter ce programme à mon agenda</button><button class="secondary" onclick="surprise(true)">Tout recomposer ↻</button><button class="secondary" onclick="renderResults()">Retour aux propositions</button></div></div></section><section class="program surprise-program"><div class="surprise-note"><strong>Un vrai programme, pas une liste.</strong><span>Chaque activité correspond à un créneau. Changez une seule idée, précisez votre envie ou adoptez le programme composé.</span></div>${state.answers.duration==='stay'?lodgingPreference():''}${state.program.length?state.program.map(programSlot).join(''):emptyState()}<div class="agenda-guidance"><strong>Votre programme est prêt.</strong><span>Adoptez-le en entier ou ajoutez seulement certains moments.</span><button onclick="renderAgenda()">Voir mon agenda →</button></div></section>`,'discover');
}
function lodgingPreference(){const value=state.answers.lodging;return `<aside class="lodging-preference"><div><span>Votre hébergement</span><strong>${value?'Préférence enregistrée':'Quel séjour vous ressemble ?'}</strong><p>Dolcia ne confondra jamais un lieu à visiter avec un hébergement.</p></div><div>${[['family','Familial + piscine'],['sea','Vue mer'],['character','Hôtel de charme'],['simple','Simple et bien placé']].map(([id,label])=>`<button class="${value===id?'selected':''}" onclick="setLodging('${id}')">${label}</button>`).join('')}</div></aside>`}
function setLodging(value){state.answers.lodging=value;showToast('Votre préférence d’hébergement est prise en compte');compose()}
function weatherPlan(){const condition=(state.weather?.weather?.[0]?.main||'').toLowerCase();if(!/rain|drizzle|thunder|snow/.test(condition))return'';return `<aside class="plan-b"><span>Plan B météo activé</span><strong>La météo change. Votre moment reste magique.</strong><p>Les expériences intérieures passent en priorité. Les propositions extérieures restent disponibles si vous souhaitez les conserver.</p><button onclick="toggleOutdoor()">Voir aussi les idées dehors</button></aside>`}
function toggleOutdoor(){state.items=[...state.items].sort((a,b)=>(b.category==='outside')-(a.category==='outside'));renderResults()}
function label(key){const base=FLOW.find(x=>x.key===key),s=key==='budget'?{...base,...budgetStep()}:base,v=state.answers[key];return s?.options.find(o=>o[0]===v)?.[1]}
function criteriaLabels(){const vibeStep=FLOW.find(step=>step.key==='vibes');const vibes=(state.answers.vibes||[]).map(value=>vibeStep.options.find(option=>option[0]===value)?.[1]).filter(Boolean);return [fmt(state.dateStart),label('duration'),label('who'),label('budget'),...vibes].filter(Boolean)}
function experience(i,index,slotLabel=''){const added=state.agenda.some(item=>item.id===i.id),fallback=IMAGES[i.category]||IMAGES.fallback;return `<article class="experience"><img class="exp-image" src="${itemImage(i)}" alt="" onerror="this.onerror=null;this.src='${fallback}'"><div class="exp-copy"><span class="exp-label">${i.sponsored?'Partenaire Dolcia · mis en avant':i.official?'Événement vérifié':index===0?'Le choix Dolcia':esc(i.source)}</span><h3>${esc(i.name)}</h3><p>${esc(i.address||'À proximité de votre destination')}</p><div class="exp-meta">${i.distance!=null?`<span>${i.distance.toFixed(1)} km</span>`:''}${i.rating?`<span>${i.rating}/5${i.reviews?` · ${i.reviews} avis`:''}</span>`:''}${i.price!=null?`<span>${i.price===0?'Gratuit':'€'.repeat(Math.min(i.price,4))}</span>`:''}${i.isOpen===true?'<span>Ouvert aujourd’hui</span>':''}${i.date?`<span>${new Date(i.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>`:''}<span>${why(i)}</span></div></div><div class="exp-actions clear-actions"><button class="detail-button" onclick="openDetail('${i.id}')">Voir les détails</button><button class="agenda-button ${added?'added':''}" onclick="addAgenda('${i.id}','${esc(slotLabel)}')">${added?'Ajouté à mon agenda':'Ajouter à mon agenda'}</button></div></article>`}
function programSlot(slot,index){return `<section class="program-slot"><div class="slot-heading"><span>${slot.label}</span><button onclick="regenerateSlot(${index})">Changer cette idée ↻</button></div>${experience(slot.item,index,slot.label)}</section>`}
function alternativeGroup(group,index){return `<section class="alternative-group"><div class="slot-heading"><span>${group.label}</span><small>${group.items.length} choix pour ce moment</small></div><div class="alternative-list">${group.items.map((item,itemIndex)=>experience(item,index*3+itemIndex,group.label)).join('')}</div></section>`}
function why(i){if(i.source==='OpenAgenda')return'Disponible à vos dates';if(i.rating>=4.5)return'Très apprécié';return'Accordé à vos envies'}
function composeCta(){return ({'2h':'Compose-moi 2 heures parfaites',morning:'Compose-moi ma matinée',afternoon:'Compose-moi mon après-midi',evening:'Compose-moi ma soirée',day:'Compose-moi ma journée',stay:'Compose-moi mon séjour'})[state.answers.duration]||'Compose mon moment'}
function emptyState(){return `<div class="empty-state"><span class="kicker">Toujours une alternative</span><h3>Élargissons l’horizon.</h3><p>Aucune source réelle n’a répondu pour le moment. Relancez la composition ou élargissez la zone de recherche.</p><div class="empty-actions"><button class="primary" onclick="surprise()">${composeCta()}</button><button class="secondary" onclick="state.step=2;renderComposer()">Changer mes envies</button></div></div>`}

async function openDetail(id){
  const item=state.allItems.find(x=>x.id===id)||state.items.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);
  if(!item)return;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal"><article class="detail detail-loading"><button class="close" onclick="closeDetail()">×</button><div class="loader"></div><p>Dolcia vérifie cette adresse…</p></article></div>`);
  let details=null;
  if(item.source==='Google Places'&&item.placeId){
    try{const response=await fetch(`/api/place-details?id=${encodeURIComponent(item.placeId)}`);details=await response.json()}catch(_){details={verified:false,status:'UNAVAILABLE'}}
    if(!details.verified){const modal=document.querySelector('#modal');if(modal)modal.innerHTML=`<article class="detail invalid-place"><button class="close" onclick="closeDetail()">×</button><div class="detail-body"><span class="kicker">Vérification impossible</span><h2>Cette adresse n’est pas assez documentée.</h2><p>Dolcia préfère retirer cette proposition plutôt que vous présenter une fiche incertaine.</p><button class="secondary" onclick="closeDetail()">Revenir aux propositions</button></div></article>`;return}
    Object.assign(item,{name:details.name||item.name,address:details.address,phone:details.phone,website:details.website,googleUrl:details.googleUrl,rating:details.rating||item.rating,reviews:details.reviews||item.reviews,isOpen:details.openNow,summary:details.summary,hours:details.hours,photos:details.photos?.length?details.photos:item.photos,photo:details.photos?.[0]||item.photo});
  }
  const photos=(item.photos?.length?item.photos:[itemImage(item)]).slice(0,6);
  const verified=item.source==='Google Places'?details?.verified:Boolean(item.official&&item.date&&item.address);
  const facts=[
    item.address?`<div><b>Adresse</b><span>${esc(item.address)}</span></div>`:'',
    item.date?`<div><b>Date</b><span>${new Date(item.date).toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'})}</span></div>`:'',
    item.phone?`<div><b>Téléphone</b><span>${esc(item.phone)}</span></div>`:'',
    item.rating?`<div><b>Avis Google</b><span>${item.rating}/5${item.reviews?` · ${item.reviews} avis`:''}</span></div>`:'',
    item.isOpen!=null?`<div><b>Ouverture</b><span>${item.isOpen?'Ouvert actuellement':'Fermé actuellement'}</span></div>`:'',
    item.hours?.length?`<div><b>Horaires</b><span>${item.hours.map(esc).join('<br>')}</span></div>`:''
  ].filter(Boolean).join('');
  const links=[item.googleUrl?`<button class="secondary" onclick="window.open('${esc(item.googleUrl)}','_blank')">Voir sur la carte</button>`:'',item.website?`<button class="secondary" onclick="window.open('${esc(item.website)}','_blank')">Site officiel</button>`:'',item.booking?`<button class="secondary" onclick="window.open('${esc(item.booking)}','_blank')">Réserver</button>`:''].join('');
  const modal=document.querySelector('#modal');if(!modal)return;
  modal.setAttribute('onclick','if(event.target===this)closeDetail()');
  modal.innerHTML=`<article class="detail"><button class="close" onclick="closeDetail()">×</button><div class="detail-image" id="detailHero" style="background-image:url('${photos[0]}')"></div>${photos.length>1?`<div class="photo-strip">${photos.map((p,n)=>`<button class="photo-thumb ${n===0?'active':''}" style="background-image:url('${p}')" onclick="selectPhoto(this,'${p}')" aria-label="Photo ${n+1}"></button>`).join('')}</div>`:''}<div class="detail-body"><span class="kicker">${verified?'Information vérifiée':esc(item.source)}</span><h2>${esc(item.name)}</h2><p>${esc(item.summary||whyDetail(item))}</p><div class="verified-facts">${facts}</div><div class="preference-panel"><strong>Aidez Dolcia à vous connaître</strong><div class="preference-actions"><button class="${state.favorites.includes(item.id)?'selected':''}" onclick="rate('${item.id}','favorite')">♥ Favori</button><button class="${state.feedback[item.id]==='like'?'selected':''}" onclick="rate('${item.id}','like')">Cette idée me plaît</button><button class="${state.feedback[item.id]==='dislike'?'selected':''}" onclick="rate('${item.id}','dislike')">Pas pour moi</button></div><div class="star-rating"><span>Votre note</span>${[1,2,3,4,5].map(value=>`<button class="${(state.starRatings[item.id]||0)>=value?'selected':''}" onclick="saveStars('${item.id}',${value})">★</button>`).join('')}</div></div><div class="detail-actions"><button class="primary" onclick="addAgenda('${item.id}')">Ajouter à mon agenda</button>${links}</div></div></article>`;
}
function selectPhoto(button,url){document.querySelector('#detailHero').style.backgroundImage=`url('${url}')`;document.querySelectorAll('.photo-thumb').forEach(x=>x.classList.remove('active'));button.classList.add('active')}
function whyDetail(i){return i.source==='OpenAgenda'?'Cette expérience a lieu pendant les dates choisies et correspond à l’ambiance recherchée.':'Cette adresse réelle correspond à vos envies, à votre destination et au rythme du moment.'}
function closeDetail(){document.querySelector('#modal')?.remove()}
function addAgenda(id,slotLabel=''){const i=state.allItems.find(x=>x.id===id)||state.items.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!i)return;const returnTo=state.view;if(!state.agenda.some(x=>x.id===id)){state.agenda.push({...i,agendaDate:agendaDateFor(i,slotLabel),agendaSlot:slotLabel,addedAt:new Date().toISOString()});save();showToast('Activité ajoutée à votre agenda')}else showToast('Cette activité est déjà dans votre agenda');closeDetail();if(returnTo==='surprise')renderSurprise();else if(returnTo==='results')renderResults()}
function agendaDateFor(item,slotLabel=''){if(item.date)return item.date;const date=new Date(state.dateStart);const match=slotLabel.match(/(\d{2}):(\d{2})/);if(match)date.setHours(Number(match[1]),Number(match[2]),0,0);return date.toISOString()}
function adoptSurprise(){state.program.forEach(slot=>{if(!state.agenda.some(item=>item.id===slot.item.id))state.agenda.push({...slot.item,agendaDate:agendaDateFor(slot.item,slot.label),agendaSlot:slot.label,addedAt:new Date().toISOString(),fromSurprise:true})});state.agenda.sort((a,b)=>new Date(a.agendaDate)-new Date(b.agendaDate));save();showToast('Votre programme est ajouté à l’agenda');renderAgenda()}
function surprise(forceNew=false){if(!state.allItems.length){state.radius=Math.min(state.radius*1.6,60000);showToast('Dolcia compose votre programme…');return compose()}if(forceNew||state.view!=='surprise'){const pool=[...state.allItems].sort(()=>Math.random()-.5);state.program=buildProgram(pool);state.items=state.program.map(slot=>slot.item)}renderSurprise();showToast(forceNew?'Un nouveau programme vient d’être composé':'Votre programme est prêt')}
function regenerateSlot(index){const current=state.program[index];if(!current)return;const excluded=state.program.map(slot=>slot.item.id);const categories=slotCategories(current.label);const strict=categories.length===1&&categories[0]==='hotel';const replacement=state.allItems.find(item=>!excluded.includes(item.id)&&categories.includes(item.category))||(strict?null:state.allItems.find(item=>!excluded.includes(item.id)));if(!replacement)return showToast(strict?'Aucun autre hébergement réel et vérifié pour le moment':'Pas encore d’autre idée réelle pour ce créneau');state.program[index]={...current,item:replacement};state.items=state.program.map(slot=>slot.item);state.view==='surprise'?renderSurprise():renderResults();showToast('Cette activité a été remplacée')}
function slotCategories(label){if(/manger|table/.test(label))return['food'];if(/soir|Vibrer|final|Prolonger/.test(label))return['night','culture','food','outside'];if(/hébergement/.test(label))return['hotel'];return['outside','active','culture','slow']}
function rate(id,value){const item=state.allItems.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!item)return;if(value==='favorite'){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]}else{const previous=state.feedback[id];state.feedback[id]=previous===value?null:value;const delta=value==='like'?1:-1;state.tasteProfile[item.category]=Math.max(-5,Math.min(8,(state.tasteProfile[item.category]||0)+delta))}save();closeDetail();state.allItems=scoreItems(state.allItems);state.alternatives=buildAlternatives(state.allItems);state.program=buildProgram(state.allItems);state.items=state.program.map(slot=>slot.item);state.view==='surprise'?renderSurprise():renderResults();showToast(value==='favorite'?'Vos favoris sont mémorisés':value==='like'?'Dolcia comprend mieux vos goûts':'Dolcia proposera moins ce type d’idée')}
function saveStars(id,value){const item=state.allItems.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!item)return;state.starRatings[id]=value;state.tasteProfile[item.category]=Math.max(-5,Math.min(8,(state.tasteProfile[item.category]||0)+(value-3)));save();showToast('Votre note affine les prochains programmes');closeDetail()}
function renderAgenda(){state.view='agenda';state.agenda.sort((a,b)=>new Date(a.agendaDate)-new Date(b.agendaDate));app.innerHTML=shell(`<section class="agenda-view"><span class="kicker">Votre agenda personnel</span><h2>Les moments<br>qui vous attendent.</h2><p>Chaque activité conserve sa date, son créneau et son ordre. Dolcia apprend de ce que vous gardez.</p>${state.agenda.length?state.agenda.map((i,n)=>`<article class="agenda-card ${i.fromSurprise?'from-surprise':''}"><img src="${itemImage(i)}" alt="" onerror="this.onerror=null;this.src='${IMAGES[i.category]||IMAGES.fallback}'"><div>${i.agendaSlot?`<span class="agenda-slot">${esc(i.agendaSlot)}</span>`:''}<h3>${esc(i.name)}</h3><p>${new Date(i.agendaDate).toLocaleString('fr-FR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})} · ${esc(i.address||state.location.name)}</p><div class="agenda-tools"><button onclick="moveAgenda(${n},-1)" ${n===0?'disabled':''}>Plus tôt</button><button onclick="moveAgenda(${n},1)" ${n===state.agenda.length-1?'disabled':''}>Plus tard</button><button onclick="openDetail('${i.id}')">Voir la fiche</button></div></div><button class="remove-agenda" onclick="removeAgenda('${i.id}')">Retirer</button></article>`).join(''):`<div class="empty-state"><h3>Votre agenda respire encore.</h3><p>Ajoutez une activité ou laissez « Surprends-moi » composer votre programme complet.</p><button class="primary" onclick="startCompose()">Créer un moment</button></div>`}</section>`,'agenda')}
function renderServices(){state.view='services';const services=[['babysitting','Babysitting de confiance','Profils vérifiés, disponibilités et contact d’urgence.'],['driver','Chauffeur & mobilité','Trajet programmé selon votre agenda Dolcia.'],['concierge','Concierge humain','Une demande spéciale prise en charge de bout en bout.'],['home','Ménage & intendance','Préparer, entretenir ou remettre en ordre votre hébergement.'],['shopping','Courses & livraisons','Ce qu’il vous faut, au bon endroit et au bon moment.'],['booking','Réservations difficiles','Dolcia sollicite ses partenaires pour vous.']];app.innerHTML=shell(`<section class="services-view"><div class="services-hero"><span class="kicker">Dolcia Services</span><h2>Profitez.<br>On s’occupe du reste.</h2><p>Des services coordonnés avec votre séjour, fournis uniquement par des professionnels identifiés et disponibles.</p></div><div class="trust-banner"><strong>La confiance avant la vitesse.</strong><span>Les services seront activés territoire par territoire après vérification des professionnels. Aucun prestataire fictif ne sera proposé.</span></div><div class="service-grid">${services.map(service=>`<article class="service-card"><span class="service-status">Bientôt au Touquet</span><h3>${service[1]}</h3><p>${service[2]}</p><button onclick="serviceInterest('${service[0]}')">M’avertir à l’ouverture</button></article>`).join('')}</div></section>`,'services')}
function serviceInterest(type){const interests=JSON.parse(localStorage.getItem('dolcia_service_interests')||'[]');if(!interests.includes(type))interests.push(type);localStorage.setItem('dolcia_service_interests',JSON.stringify(interests));showToast('Votre intérêt est enregistré. Aucun push ne sera envoyé sans votre accord.')}
function moveAgenda(index,direction){const next=index+direction;if(next<0||next>=state.agenda.length)return;[state.agenda[index],state.agenda[next]]=[state.agenda[next],state.agenda[index]];save();renderAgenda()}
function removeAgenda(id){state.agenda=state.agenda.filter(x=>x.id!==id);save();renderAgenda()}
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2400)}

window.home=home;window.startCompose=startCompose;window.renderComposer=renderComposer;window.pick=pick;window.nextStep=nextStep;window.backStep=backStep;window.setDate=setDate;window.setDestination=setDestination;window.moveMonth=moveMonth;window.pickDate=pickDate;window.useLocation=useLocation;window.compose=compose;window.renderResults=renderResults;window.renderSurprise=renderSurprise;window.renderAgenda=renderAgenda;window.renderServices=renderServices;window.serviceInterest=serviceInterest;window.moveAgenda=moveAgenda;window.openDetail=openDetail;window.selectPhoto=selectPhoto;window.closeDetail=closeDetail;window.addAgenda=addAgenda;window.adoptSurprise=adoptSurprise;window.surprise=surprise;window.regenerateSlot=regenerateSlot;window.rate=rate;window.saveStars=saveStars;window.toggleOutdoor=toggleOutdoor;window.removeAgenda=removeAgenda;window.showToast=showToast;window.state=state;
home();
