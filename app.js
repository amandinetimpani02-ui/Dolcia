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
  {key:'vibes', eyebrow:'Les envies', title:'Qu’avez-vous envie de ressentir ?', sub:'Vous pouvez choisir plusieurs atmosphères. Nous nous chargeons de les accorder.', multi:true, options:[
    ['food','Bien manger','Tables, brunchs et découvertes',IMAGES.food],['outside','Prendre l’air','Nature, plage et horizons',IMAGES.outside],['culture','Être surpris','Art, scènes et patrimoine',IMAGES.culture],['slow','Ralentir','Bien-être et douceur',IMAGES.slow],['active','Bouger','Loisirs et sensations',IMAGES.active],['night','Vibrer le soir','Concerts, bars et nuits',IMAGES.night]
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
  location:{name:'Le Touquet-Paris-Plage',lat:50.5214,lng:1.5912}, answers:{vibes:[]}, items:[], allItems:[], program:[], weather:null, radius:12000,
  agenda:JSON.parse(localStorage.getItem('dolcia_agenda_v2')||'[]'), ratings:JSON.parse(localStorage.getItem('dolcia_ratings_v2')||'{}')
};

const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => d.toLocaleDateString('fr-FR',{day:'numeric',month:'long'});
const iso = d => d.toISOString().slice(0,10);
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();
const save = () => {localStorage.setItem('dolcia_agenda_v2',JSON.stringify(state.agenda));localStorage.setItem('dolcia_ratings_v2',JSON.stringify(state.ratings))};

function shell(content, active='discover'){
  return `<main class="app"><header class="topbar"><button class="brand" onclick="home()">dolc<i>ia</i></button><div class="top-actions"><button class="location" onclick="useLocation()">${esc(state.location.name)}</button><button class="avatar" onclick="showToast('Votre espace personnel arrive bientôt')">VD</button></div></header>${content}${nav(active)}</main>`;
}
function nav(active){return `<nav class="bottom-nav" aria-label="Navigation"><button class="nav-item ${active==='discover'?'active':''}" onclick="home()">Découvrir</button><button class="nav-item ${active==='compose'?'active':''}" onclick="startCompose()">Composer</button><button class="nav-item ${active==='agenda'?'active':''}" onclick="renderAgenda()">Agenda ${state.agenda.length?`· ${state.agenda.length}`:''}</button></nav>`}

function home(){
  state.view='home';
  app.innerHTML=shell(`<section class="hero"><div class="hero-photo"></div><div class="hero-copy"><span class="kicker">Chaque instant mérite une expérience</span><h1>Vos prochaines émotions<br><em>commencent ici.</em></h1><p>Dolcia imagine votre moment à partir d’expériences réelles, choisies selon vos envies, votre rythme et votre destination.</p><div class="hero-cta"><button class="primary" onclick="startCompose()">Composer mon moment <span class="arrow">→</span></button><button class="round-action" onclick="document.querySelector('#inspiration').scrollIntoView({behavior:'smooth'})" aria-label="Voir les inspirations">↓</button></div></div><div class="hero-index"><b>01</b> / 03</div></section>
  <section class="section" id="inspiration"><div class="section-head"><div><span class="kicker">L’inspiration du moment</span><h2>Et si c’était<br>pour aujourd’hui ?</h2></div><p class="section-copy">Une sélection éditoriale pour donner envie. Votre programme final sera construit uniquement avec des lieux et événements issus de sources réelles.</p></div><div class="moments">
    ${moment('Ce soir','Une table, puis la mer',IMAGES.food)}${moment('En famille','Dehors, sans courir',IMAGES.family)}${moment('À deux','Une échappée douce',IMAGES.couple)}
  </div></section>
  <section class="drops-section"><div class="drops-head"><div><span class="kicker">Les drops Dolcia</span><h2>Des raisons de<br><em>sortir maintenant.</em></h2></div><p>Des propositions qui changent avec l’heure, la météo et vos goûts. Les offres commerciales ne s’affichent que lorsqu’elles viennent d’un partenaire vérifié.</p></div><div class="drops">
    ${dropCard('Ce soir seulement','Une soirée déjà composée','Table, spectacle et dernier verre — en un seul élan.',IMAGES.night,'#c9a96e')}
    ${dropCard('Plan B magique','La pluie devient une bonne idée','Dolcia réorganise votre moment avec des expériences intérieures.',IMAGES.culture,'#b8895c')}
    ${dropCard('Échappée surprise','24 heures pour décrocher','Un programme complet adapté à votre budget et votre rayon.',IMAGES.outside,'#e2cf9b')}
  </div><button class="desire-cta" onclick="startCompose()"><span>Je ne sais pas quoi faire</span><strong>Dolcia, décide pour moi</strong><b>→</b></button></section>`);
}
function moment(kicker,title,image){return `<button class="moment-card" onclick="startCompose()"><img src="${image}" alt=""><span class="moment-copy"><small>${kicker}</small><h3>${title}</h3></span></button>`}
function dropCard(tag,title,copy,image,color){return `<button class="drop" style="--accent:${color}" onclick="startCompose()"><div class="drop-visual" style="background-image:url('${image}')"><span>${tag}</span></div><div class="drop-copy"><h3>${title}</h3><p>${copy}</p><b>Créer ce moment →</b></div></button>`}

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
  app.innerHTML=shell(`<section class="composer"><div class="composer-shell"><div class="composer-head"><div><span class="kicker">Le moment</span><h2>Où et quel jour voulez-vous sortir ?</h2></div><div class="step-count">Point de départ<div class="progress"><span style="width:12%"></span></div></div></div><p class="step-lead">Choisissez un raccourci ou n’importe quelle date dans le calendrier. Vous indiquerez ensuite si vous disposez de deux heures, d’une matinée, d’un après-midi, d’une soirée, d’une journée ou de plusieurs jours.</p><div class="destination-row">${Object.entries(DESTINATIONS).map(([id,d])=>`<button class="destination-pill ${state.location.name===d.name?'active':''}" onclick="setDestination('${id}')">${d.name}</button>`).join('')}<button class="destination-pill" onclick="useLocation()">Autour de moi</button></div><div class="date-grid"><div class="date-presets">${[['today','Aujourd’hui en journée','Pour une sortie aujourd’hui'],['tonight','Ce soir','À partir de 18 heures'],['tomorrow','Demain','Pour demain, à votre rythme'],['weekend','Ce week-end','Du samedi au dimanche']].map(x=>`<button class="date-pill ${state.dateMode===x[0]?'active':''}" onclick="setDate('${x[0]}')"><b>${x[1]}</b><br><small>${x[2]}</small></button>`).join('')}</div>${calendar()}</div><div class="composer-actions"><button class="secondary" onclick="home()">← Accueil</button><button class="primary" onclick="state.step=0;renderComposer()">Valider cette date →</button></div></div></section>`,'compose');
}
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
    const partners=`/api/partner-events?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const nationalTourism=`/api/datatourisme?lat=${state.location.lat}&lng=${state.location.lng}&radius=${Math.round(state.radius/1000)}&after=${iso(state.dateStart)}&before=${iso(state.dateEnd)}`;
    const placeQueries=queries.slice(0,24).map(q=>`/api/places?lat=${state.location.lat}&lng=${state.location.lng}&radius=${state.radius}&mode=text&keyword=${encodeURIComponent(q+' '+state.location.name)}`);
    const get=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('source');return r.json()};
    const weatherJob=get(weather).then(d=>{if(!d.error)state.weather=d;markLoaded('weather',d.error?'Indisponible':`${Math.round(d.main?.temp||0)}°`)}).catch(()=>markLoaded('weather','Indisponible'));
    const eventJob=get(event).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);markLoaded('events',`${found.length} trouvés`);updateLivePreview()}).catch(()=>markLoaded('events','Source au repos'));
    const officialJob=/Touquet|Opale/.test(state.location.name)?get(officialTouquet).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);markLoaded('events',`${found.length}+ officiels`);updateLivePreview()}).catch(()=>null):Promise.resolve();
    const partnerJob=get(partners).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);if(found.length)markLoaded('events',`${found.length}+ partenaires`);updateLivePreview()}).catch(()=>null);
    const nationalJob=get(nationalTourism).then(d=>{const found=normalizeEvents(d.events||[]);state.items.push(...found);if(found.length)markLoaded('events',`${found.length}+ offices de tourisme`);updateLivePreview()}).catch(()=>null);
    let placesFound=0;
    const placeJobs=placeQueries.map(url=>get(url).then(d=>{const found=normalizePlaces(d.results||[]);placesFound+=found.length;state.items.push(...found);markLoaded('places',`${placesFound} trouvés`);updateLivePreview()}).catch(()=>null));
    await Promise.allSettled([weatherJob,eventJob,officialJob,partnerJob,nationalJob,...placeJobs]);
    state.allItems=scoreItems(dedupe(state.items));
    state.program=buildProgram(state.allItems);
    state.items=state.program.map(slot=>slot.item);
  }catch(_){/* L'état de repli reste volontairement non technique. */}
  renderResults();
}
function markLoaded(key,text){const el=document.querySelector(`#load-${key}`);if(el){el.textContent=text;el.classList.add('done')}}
function updateLivePreview(){const el=document.querySelector('#live-preview');if(!el)return;el.innerHTML=dedupe(state.items).slice(0,3).map(i=>`<span>${esc(i.name)}</span>`).join('')}
function queriesForVibes(){
  const selectedMap={food:['restaurant','brunch salon de thé','gastronomie dégustation'],outside:['plage balade nature','sports nautiques','accrobranche aventure plein air'],culture:['musée exposition patrimoine','spectacle théâtre cinéma','atelier créatif visite insolite'],slow:['spa thalasso bien-être','yoga détente'],active:['parc attractions loisirs','escape game','bowling','karting','laser game','réalité virtuelle'],night:['concert bar soirée','casino cabaret']};
  const broad=[
    'restaurants cafés brunch gastronomie','parcs jardins plages réserves naturelles','animations famille enfants aire de jeux',
    'parc attractions parc de loisirs parc à thème','bowling','laser game','escape game','karting circuit',
    'trampoline park parc indoor','réalité virtuelle jeux immersifs','accrobranche parcours aventure','paintball airsoft',
    'mini golf golf practice','escalade salle bloc','sports nautiques voile surf paddle kayak','équitation poney centre équestre',
    'piscine centre aquatique aquapark','zoo aquarium ferme pédagogique','musées expositions monuments patrimoine',
    'cinéma théâtre spectacle concert','ateliers stages cours créatifs','marchés brocantes fêtes locales','spa thalasso bien-être',
    'casino cabaret club soirée'
  ];
  const selected=(state.answers.vibes||[]).flatMap(v=>selectedMap[v]||[]);
  if(state.answers.duration==='stay')selected.unshift('hôtels hébergements résidences de tourisme');
  return [...new Set([...selected,...broad])];
}
function normalizePlaces(items){return items.map((p,i)=>{const photos=(p.photos||[]).map(x=>`/api/photo?ref=${encodeURIComponent(x.photo_reference)}&maxwidth=1200`);return {id:'g-'+(p.place_id||i),name:p.name,source:'Google Places',category:category(p.types?.join(' ')+' '+p.name),address:p.vicinity||p.formatted_address,lat:p.geometry?.location?.lat,lng:p.geometry?.location?.lng,rating:p.rating,reviews:p.user_ratings_total,price:p.price_level,isOpen:p.opening_hours?.open_now,photo:photos[0]||null,photos,booking:null}})}
function normalizeEvents(items){return items.map((e,i)=>({id:'e-'+(e.uid||e.id||i),name:typeof e.title==='object'?(e.title.fr||Object.values(e.title)[0]):e.title,source:e.source||'OpenAgenda',category:category(`${e.type||''} ${typeof e.title==='object'?JSON.stringify(e.title):e.title}`),address:e.address||e.location||'',date:e.date,photo:typeof e.image==='string'?e.image:(e.image?.base||e.thumbnail),booking:e.registrationUrl,free:e.free,priceLabel:e.priceLabel,official:e.official,partner:e.partner}))}
function category(text=''){const t=text.toLowerCase();if(/hotel|hôtel|lodging|hébergement/.test(t))return'hotel';if(/feu d.artifice|bal populaire|concert|spectacle|soirée/.test(t))return'night';if(/restaurant|cafe|food|gastr/.test(t))return'food';if(/museum|art|cinema|theater|culture|expo/.test(t))return'culture';if(/spa|beauty|yoga|bien/.test(t))return'slow';if(/bar|night|music/.test(t))return'night';if(/park|parc|nature|plage|garden|forêt/.test(t))return'outside';return'active'}
function dedupe(items){const seen=new Set();return items.filter(x=>{const k=(x.name||'').toLowerCase().trim();if(!k||seen.has(k))return false;seen.add(k);return true})}
function itemImage(i){return i.photo||IMAGES[i.category]||IMAGES.fallback}
function distanceKm(a,b,c,d){const R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,q=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function scoreItems(items){
  const temp=state.weather?.main?.temp??18,cond=(state.weather?.weather?.[0]?.main||'').toLowerCase(),vibes=state.answers.vibes||[],who=state.answers.who;
  const budget=state.answers.budget;
  return items.filter(i=>{
    if(budget==='free')return i.free||i.price===0;
    if(budget==='budget1'&&i.price!=null)return i.price<=1;
    if(budget==='budget2'&&i.price!=null)return i.price<=2;
    if(budget==='budget3'&&i.price!=null)return i.price<=3;
    return true;
  }).map(i=>{
    const text=(i.name||'').toLowerCase(),distance=i.lat&&i.lng?distanceKm(state.location.lat,state.location.lng,i.lat,i.lng):null;let score=50;
    if(vibes.includes(i.category))score+=24;if(i.source==='OpenAgenda')score+=18;if(i.rating>=4.5)score+=12;if(i.reviews>100)score+=5;if(i.isOpen===true)score+=10;if(distance!==null&&distance<3)score+=8;
    if(i.official)score+=35;
    if(i.date&&iso(new Date(i.date))===iso(state.dateStart))score+=30;
    if(temp>=25&&/paddle|surf|voile|kayak|plage|nautique/.test(text))score+=35;if(temp>=25&&['outside','slow'].includes(i.category))score+=12;
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
    const learned=state.ratings[i.id];if(learned?.value==='like')score+=18;if(learned?.value==='dislike')score-=30;
    return {...i,score,distance};
  }).sort((a,b)=>b.score-a.score)
}

function buildProgram(pool, excludedIds=[]){
  const available=pool.filter(item=>!excludedIds.includes(item.id));
  const used=new Set(), slots=[];
  const duration=state.answers.duration||'2h';
  const templates={
    '2h':[['Votre moment',['active','culture','outside','slow','food','night']]],
    morning:[['09:30 · Commencer doucement',['food','outside','slow']],['11:00 · Découvrir',['active','culture','outside']]],
    afternoon:[['14:00 · Explorer',['active','culture','outside']],['16:30 · Faire une pause',['slow','food','outside']]],
    evening:[['19:00 · Ouvrir la soirée',['food','culture']],['21:00 · Vibrer',['night','culture','active']],['23:00 · Le final',['night','outside']]],
    day:[['09:30 · Prendre l’air',['outside','active','culture']],['12:30 · Bien manger',['food']],['15:00 · Être surpris',['culture','active','slow','outside']],['19:30 · Passer à table',['food']],['22:30 · Prolonger l’émotion',['night','culture','outside']]],
    stay:[['Votre hébergement',['hotel']],['Jour 1 · Première émotion',['outside','culture','active']],['Jour 1 · La soirée',['food','night']],['Jour 2 · L’inattendu',['culture','active','slow']],['Jour 2 · Le temps fort',['night','outside','food']]]
  };
  const wanted=templates[duration]||templates['2h'];
  for(const [label,categories] of wanted){
    let candidates=available.filter(item=>!used.has(item.id)&&categories.includes(item.category));
    if(label.includes('final')||label.includes('Vibrer')||label.includes('Prolonger'))candidates.sort((a,b)=>(Number(b.official)-Number(a.official))||(b.score-a.score));
    const item=candidates[0]||available.find(value=>!used.has(value.id));
    if(item){used.add(item.id);slots.push({label,item})}
  }
  return slots;
}

function renderResults(){
  const criteria=[fmt(state.dateStart),label('who'),label('duration'),label('budget')].filter(Boolean);
  app.innerHTML=shell(`<section class="results-hero"><div class="results-photo" style="background-image:url('${IMAGES.hero}')"></div><div class="results-copy"><span class="kicker">Composé pour vous</span><h1>Votre moment<br>prend forme.</h1><p>${state.weather?.main?.temp?`${Math.round(state.weather.main.temp)}°, `:''}${esc(state.location.name)}. Un agenda équilibré selon votre créneau, vos envies et les événements du jour.</p><div class="tags">${criteria.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div><button class="surprise-hero" onclick="surprise()"><span>Recomposer tout l’agenda</span><strong>Surprends-moi</strong><b>↻</b></button></div></section><section class="program">${weatherPlan()}<div class="program-head"><div><span class="kicker">Votre agenda imaginé par Dolcia</span><h2>${state.program.length?'Votre journée prend vie':'Une autre piste ?'}</h2></div><div class="program-actions"><button class="secondary" onclick="surprise()">Tout régénérer</button><button class="secondary" onclick="startCompose()">Modifier mes choix</button></div></div>${state.program.length?state.program.map(programSlot).join(''):emptyState()}${state.program.length?`<button class="add-all" onclick="addAll()"><span>Conserver ce programme</span><strong>Ajouter cet agenda à mes sorties</strong><b>→</b></button>`:''}</section>`,'discover');
}
function weatherPlan(){const condition=(state.weather?.weather?.[0]?.main||'').toLowerCase();if(!/rain|drizzle|thunder|snow/.test(condition))return'';return `<aside class="plan-b"><span>Plan B météo activé</span><strong>La météo change. Votre moment reste magique.</strong><p>Les expériences intérieures passent en priorité. Les propositions extérieures restent disponibles si vous souhaitez les conserver.</p><button onclick="toggleOutdoor()">Voir aussi les idées dehors</button></aside>`}
function toggleOutdoor(){state.items=[...state.items].sort((a,b)=>(b.category==='outside')-(a.category==='outside'));renderResults()}
function label(key){const base=FLOW.find(x=>x.key===key),s=key==='budget'?{...base,...budgetStep()}:base,v=state.answers[key];return s?.options.find(o=>o[0]===v)?.[1]}
function experience(i,index){const reaction=state.ratings[i.id]?.value;return `<article class="experience"><img class="exp-image" src="${itemImage(i)}" alt=""><div class="exp-copy"><span class="exp-label">${index===0?'Le choix Dolcia':esc(i.source)}</span><h3>${esc(i.name)}</h3><p>${esc(i.address||'À proximité de votre destination')}</p><div class="exp-meta">${i.distance!=null?`<span>${i.distance.toFixed(1)} km</span>`:''}${i.rating?`<span>${i.rating}/5${i.reviews?` · ${i.reviews} avis`:''}</span>`:''}${i.price!=null?`<span>${i.price===0?'Gratuit':'€'.repeat(Math.min(i.price,4))}</span>`:''}${i.isOpen===true?'<span>Ouvert</span>':''}${i.date?`<span>${new Date(i.date).toLocaleDateString('fr-FR')}</span>`:''}<span>${why(i)}</span></div></div><div class="exp-actions reactions"><button class="icon-action ${reaction==='favorite'?'selected':''}" onclick="rate('${i.id}','favorite')" aria-label="Mettre en favori">♥</button><button class="icon-action ${reaction==='like'?'selected':''}" onclick="rate('${i.id}','like')" aria-label="J’aime">↑</button><button class="icon-action ${reaction==='dislike'?'selected':''}" onclick="rate('${i.id}','dislike')" aria-label="Moins de propositions comme celle-ci">↓</button><button class="icon-action" onclick="openDetail('${i.id}')" aria-label="Voir la fiche">↗</button><button class="icon-action" onclick="addAgenda('${i.id}')" aria-label="Ajouter à l’agenda">＋</button></div></article>`}
function programSlot(slot,index){return `<section class="program-slot"><div class="slot-heading"><span>${slot.label}</span><button onclick="regenerateSlot(${index})">Changer cette idée ↻</button></div>${experience(slot.item,index)}</section>`}
function why(i){if(i.source==='OpenAgenda')return'Disponible à vos dates';if(i.rating>=4.5)return'Très apprécié';return'Accordé à vos envies'}
function emptyState(){return `<div class="empty-state"><span class="kicker">Toujours une alternative</span><h3>Élargissons l’horizon.</h3><p>Aucune source réelle n’a répondu pour le moment. Relancez la composition ou élargissez la zone de recherche.</p><div class="empty-actions"><button class="primary" onclick="surprise()">Surprends-moi autrement</button><button class="secondary" onclick="state.step=2;renderComposer()">Changer d’ambiance</button></div></div>`}

function openDetail(id){const i=state.items.find(x=>x.id===id)||state.agenda.find(x=>x.id===id);if(!i)return;const photos=(i.photos?.length?i.photos:[itemImage(i)]).slice(0,5);document.body.insertAdjacentHTML('beforeend',`<div class="modal" id="modal" onclick="if(event.target===this)closeDetail()"><article class="detail"><button class="close" onclick="closeDetail()">×</button><div class="detail-image" id="detailHero" style="background-image:url('${photos[0]}')"></div>${photos.length>1?`<div class="photo-strip">${photos.map((p,n)=>`<button class="photo-thumb ${n===0?'active':''}" style="background-image:url('${p}')" onclick="selectPhoto(this,'${p}')" aria-label="Photo ${n+1}"></button>`).join('')}</div>`:''}<div class="detail-body"><span class="kicker">${esc(i.source)}</span><h2>${esc(i.name)}</h2><p>${whyDetail(i)}</p><div class="tags"><span class="tag" style="color:var(--ink);border-color:var(--line)">${esc(i.address||state.location.name)}</span>${i.rating?`<span class="tag" style="color:var(--ink);border-color:var(--line)">${i.rating}/5</span>`:''}</div><div class="detail-actions"><button class="primary" onclick="addAgenda('${i.id}')">Ajouter à mon agenda</button><button class="secondary" ${i.booking?`onclick="window.open('${esc(i.booking)}','_blank')"`:'disabled'}>${i.booking?'Réserver':'Réservation bientôt'}</button></div></div></article></div>`)}
function selectPhoto(button,url){document.querySelector('#detailHero').style.backgroundImage=`url('${url}')`;document.querySelectorAll('.photo-thumb').forEach(x=>x.classList.remove('active'));button.classList.add('active')}
function whyDetail(i){return i.source==='OpenAgenda'?'Cette expérience a lieu pendant les dates choisies et correspond à l’ambiance recherchée.':'Cette adresse réelle correspond à vos envies, à votre destination et au rythme du moment.'}
function closeDetail(){document.querySelector('#modal')?.remove()}
function addAgenda(id){const i=state.items.find(x=>x.id===id);if(!i)return;if(!state.agenda.some(x=>x.id===id)){state.agenda.push({...i,agendaDate:i.date||state.dateStart.toISOString()});save()}showToast('Ajouté à votre agenda');closeDetail()}
function addAll(){const short=['morning','afternoon','evening'].includes(state.answers.duration);state.items.slice(0,state.answers.duration==='2h'?2:short?3:5).forEach(i=>{if(!state.agenda.some(x=>x.id===i.id))state.agenda.push({...i,agendaDate:i.date||state.dateStart.toISOString()})});save();showToast('Votre sélection est dans l’agenda')}
function surprise(){if(!state.allItems.length){state.radius=Math.min(state.radius*1.6,60000);showToast('Dolcia élargit la recherche…');return compose()}const pool=[...state.allItems].sort(()=>Math.random()-.5);state.program=buildProgram(pool);state.items=state.program.map(slot=>slot.item);renderResults();showToast('Dolcia a entièrement recomposé votre agenda')}
function regenerateSlot(index){const current=state.program[index];if(!current)return;const excluded=state.program.map(slot=>slot.item.id);const categories=slotCategories(current.label);const replacement=state.allItems.find(item=>!excluded.includes(item.id)&&categories.includes(item.category))||state.allItems.find(item=>!excluded.includes(item.id));if(!replacement)return showToast('Pas encore d’autre idée réelle pour ce créneau');state.program[index]={...current,item:replacement};state.items=state.program.map(slot=>slot.item);renderResults();showToast('Cette activité a été remplacée')}
function slotCategories(label){if(/manger|table/.test(label))return['food'];if(/soir|Vibrer|final|Prolonger/.test(label))return['night','culture','food','outside'];if(/hébergement/.test(label))return['hotel'];return['outside','active','culture','slow']}
function rate(id,value){const current=state.ratings[id]?.value;state.ratings[id]={value:current===value?null:value,date:new Date().toISOString()};save();state.items=scoreItems(state.items);renderResults();showToast(value==='favorite'?'Favori enregistré':value==='like'?'Dolcia apprend ce qui vous plaît':'Cette idée sera moins proposée')}
function renderAgenda(){app.innerHTML=shell(`<section class="agenda-view"><span class="kicker">Votre temps libre</span><h2>Les moments<br>qui vous attendent.</h2><p>Réorganisez votre programme. Dolcia conserve l’ordre choisi.</p>${state.agenda.length?state.agenda.map((i,n)=>`<article class="agenda-card"><img src="${itemImage(i)}" alt=""><div><h3>${esc(i.name)}</h3><p>${new Date(i.agendaDate).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} · ${esc(i.address||state.location.name)}</p><div class="agenda-tools"><button onclick="moveAgenda(${n},-1)" ${n===0?'disabled':''}>↑ Plus tôt</button><button onclick="moveAgenda(${n},1)" ${n===state.agenda.length-1?'disabled':''}>↓ Plus tard</button></div></div><button class="icon-action" onclick="removeAgenda('${i.id}')" aria-label="Retirer">×</button></article>`).join(''):`<div class="empty-state"><h3>Votre agenda respire encore.</h3><p>Ajoutez une expérience depuis une proposition Dolcia. Elle restera ici, prête quand vous le serez.</p><button class="primary" onclick="startCompose()">Composer un moment</button></div>`}</section>`,'agenda')}
function moveAgenda(index,direction){const next=index+direction;if(next<0||next>=state.agenda.length)return;[state.agenda[index],state.agenda[next]]=[state.agenda[next],state.agenda[index]];save();renderAgenda()}
function removeAgenda(id){state.agenda=state.agenda.filter(x=>x.id!==id);save();renderAgenda()}
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2400)}

window.home=home;window.startCompose=startCompose;window.renderComposer=renderComposer;window.pick=pick;window.nextStep=nextStep;window.backStep=backStep;window.setDate=setDate;window.setDestination=setDestination;window.moveMonth=moveMonth;window.pickDate=pickDate;window.useLocation=useLocation;window.compose=compose;window.renderAgenda=renderAgenda;window.moveAgenda=moveAgenda;window.openDetail=openDetail;window.selectPhoto=selectPhoto;window.closeDetail=closeDetail;window.addAgenda=addAgenda;window.addAll=addAll;window.surprise=surprise;window.regenerateSlot=regenerateSlot;window.rate=rate;window.toggleOutdoor=toggleOutdoor;window.removeAgenda=removeAgenda;window.showToast=showToast;window.state=state;
home();
