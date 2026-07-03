/* DOLCIA V1 PREMIUM
   Règle absolue : aucune activité inventée.
   Les cartes affichées viennent uniquement de Google Places, OpenAgenda ou partenaires réels.
   Les images d'ambiance peuvent être utilisées pour l'onboarding/design, mais jamais pour inventer un lieu.
*/
const API_BASES = ["", "https://dolcia.vercel.app"]; // fallback production si une Preview Vercel n'a pas les variables
const app = document.getElementById("app");

const IMG = {
  splash:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
  couple:"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85",
  famille:"https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=85",
  amis:"https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85",
  solo:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  pro:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85",
  now:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  soir:"https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=85",
  demain:"https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1200&q=85",
  weekend:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
  sejour:"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  food:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
  nature:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
  culture:"https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1200&q=85",
  bienetre:"https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
  sport:"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=85",
  night:"https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1200&q=85",
  famille_exp:"https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=85",
  gratuit:"https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=85",
  fallback:"https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1200&q=85"
};

const SOURCE_MAP = {
  food:{label:"Gastronomie", types:["restaurant","cafe","bakery","bar"], keywords:["restaurant","gastronomie","brunch","marché","dégustation"], oa:["gastronomie","food","marché"]},
  nature:{label:"Nature", types:["park","tourist_attraction"], keywords:["plage","balade","point de vue","randonnée","jardin"], oa:["balade","randonnée","nature"]},
  culture:{label:"Culture & événements", types:["museum","art_gallery","movie_theater"], keywords:["musée","cinéma","théâtre","exposition","concert"], oa:["concert","festival","théâtre","cinéma","exposition","culture"]},
  bienetre:{label:"Bien-être", types:["spa","beauty_salon","swimming_pool"], keywords:["spa","massage","yoga","bien-être"], oa:["yoga","méditation","bien-être"]},
  sport:{label:"Sport & loisirs", types:["golf_course","bowling_alley","amusement_park","aquarium","zoo"], keywords:["escape game","karting","laser game","paddle","golf","bowling","parc attractions"], oa:["sport","loisirs","compétition"]},
  night:{label:"Sortir", types:["bar","night_club","casino","restaurant"], keywords:["cocktail","bar","club","soirée","concert ce soir"], oa:["soirée","club","dj","concert"]},
  famille_exp:{label:"Famille", types:["amusement_park","zoo","aquarium","park","movie_theater","bowling_alley"], keywords:["enfants","famille","parc","ferme pédagogique","atelier enfant"], oa:["famille","enfant","atelier"]},
  gratuit:{label:"Gratuit", types:["park","tourist_attraction"], keywords:["gratuit","entrée libre","plage","parc","marché"], oa:["gratuit","entrée libre"]}
};

const STEPS = [
  {key:"who", title:"Avec qui vivez-vous ce moment ?", sub:"Dolcia adapte l’expérience au contexte : couple, famille, amis, solo ou professionnel.", options:[
    {id:"couple", label:"En couple", sub:"Une expérience à deux", img:IMG.couple, big:true},
    {id:"famille", label:"En famille", sub:"Enfants, bébé, grands-parents", img:IMG.famille},
    {id:"amis", label:"Entre amis", sub:"Sorties, rires et découvertes", img:IMG.amis},
    {id:"solo", label:"Solo", sub:"Pour soi, sans compromis", img:IMG.solo},
    {id:"pro", label:"Professionnel", sub:"Clients, équipe, séminaire", img:IMG.pro}
  ]},
  {key:"when", title:"Pour quel moment ?", sub:"Aujourd’hui, demain, ce week-end ou pendant un séjour.", options:[
    {id:"now", label:"Maintenant", sub:"Une idée tout de suite", img:IMG.now},
    {id:"soir", label:"Ce soir", sub:"Une soirée qui se dessine", img:IMG.soir, big:true},
    {id:"demain", label:"Demain", sub:"Préparer sans stress", img:IMG.demain},
    {id:"weekend", label:"Ce week-end", sub:"Deux jours à composer", img:IMG.weekend},
    {id:"sejour", label:"Séjour", sub:"3 jours, 4 jours, vacances", img:IMG.sejour}
  ]},
  {key:"duration", title:"Combien de temps avez-vous ?", sub:"Dolcia ne propose pas la même chose pour deux heures, un après-midi ou trois jours.", options:[
    {id:"2h", label:"2 heures", sub:"Court, efficace, inspirant", img:IMG.food},
    {id:"halfday", label:"Demi-journée", sub:"Une belle respiration", img:IMG.nature, big:true},
    {id:"day", label:"Journée", sub:"Un vrai programme", img:IMG.culture},
    {id:"weekend", label:"Week-end", sub:"Samedi + dimanche", img:IMG.weekend},
    {id:"stay", label:"3 à 4 jours", sub:"Un séjour complet", img:IMG.sejour}
  ]},
  {key:"vibe", title:"Qu’avez-vous envie de vivre ?", sub:"Choisissez une ou plusieurs envies. Dolcia compose ensuite.", multi:true, options:[
    {id:"food", label:"Gastronomie", sub:"Tables, brunchs, marchés", img:IMG.food},
    {id:"nature", label:"Nature", sub:"Balades, plages, points de vue", img:IMG.nature},
    {id:"culture", label:"Culture", sub:"Concerts, expo, théâtre", img:IMG.culture, big:true},
    {id:"bienetre", label:"Bien-être", sub:"Spa, massage, détente", img:IMG.bienetre},
    {id:"sport", label:"Loisirs", sub:"Parcs, bowling, sensations", img:IMG.sport},
    {id:"night", label:"Sortir", sub:"Bars, clubs, casino", img:IMG.night},
    {id:"famille_exp", label:"Famille", sub:"Idées adaptées aux enfants", img:IMG.famille_exp},
    {id:"gratuit", label:"Gratuit", sub:"Le meilleur sans dépenser", img:IMG.gratuit}
  ]},
  {key:"budget", title:"Quel budget indicatif ?", sub:"Dolcia filtre sans rendre l’expérience froide.", options:[
    {id:"free", label:"Gratuit", sub:"Uniquement si la donnée indique gratuit", img:IMG.gratuit},
    {id:"low", label:"Raisonnable", sub:"Sortir sans exploser le budget", img:IMG.nature},
    {id:"mid", label:"Confort", sub:"De belles expériences", img:IMG.food, big:true},
    {id:"premium", label:"Premium", sub:"Le meilleur du moment", img:IMG.bienetre}
  ]}
];

let S = {
  step:0,
  answers:{vibe:[]},
  location:{name:"Le Touquet-Paris-Plage", lat:50.5214, lng:1.5912},
  radius:12000,
  items:[],
  places:[],
  events:[],
  weather:null,
  program:[],
  current:null,
  agenda:JSON.parse(localStorage.getItem("dolcia_agenda")||"[]"),
  ratings:JSON.parse(localStorage.getItem("dolcia_ratings")||"{}"),
  diagnostics:[]
};

function save(){
  localStorage.setItem("dolcia_agenda", JSON.stringify(S.agenda));
  localStorage.setItem("dolcia_ratings", JSON.stringify(S.ratings));
}

function renderSplash(){
  app.innerHTML = `
  <section class="screen">
    <div class="bg-photo" style="background-image:url('${IMG.splash}')"></div>
    <header class="topbar"><div class="logo">DOL<span class="gold">CIA</span></div><button class="ghostbtn" onclick="diagnosticModal()">Diagnostic</button></header>
    <div class="hero screen-inner">
      <div class="eyebrow">Le premier moteur d’inspiration du temps libre</div>
      <h1>Vos prochaines émotions commencent ici.</h1>
      <p>Dolcia compose des journées, des soirées et des séjours à partir de vraies activités autour de vous. Aucun lieu inventé. Jamais.</p>
      <button class="gold-btn" onclick="start()">Commencer</button>
    </div>
  </section>`;
}

function start(){ S.step=0; S.answers={vibe:[]}; renderStep(); }

function renderStep(){
  const st = STEPS[S.step];
  const pct = ((S.step+1)/STEPS.length)*100;
  const bg = st.options[0]?.img || IMG.splash;
  app.innerHTML = `
  <section class="screen">
    <div class="bg-photo" style="background-image:url('${bg}')"></div>
    <header class="topbar">
      <button class="iconbtn" onclick="${S.step===0?'renderSplash()':'prevStep()'}">←</button>
      <div class="logo">Dolcia</div>
      <button class="ghostbtn" onclick="renderSplash()">Quitter</button>
    </header>
    <div class="step-wrap screen-inner">
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="eyebrow">Étape ${S.step+1} sur ${STEPS.length}</div>
      <h2 class="step-title">${st.title}</h2>
      <p class="step-sub">${st.sub}</p>
      <div class="option-grid">
        ${st.options.map(o=>optionHTML(st,o)).join("")}
      </div>
      <div class="step-actions">
        <button class="dark-btn" onclick="${S.step===0?'renderSplash()':'prevStep()'}">Retour</button>
        <button class="gold-btn" onclick="nextStep()">Continuer</button>
      </div>
    </div>
  </section>`;
}
function optionHTML(st,o){
  const val = S.answers[st.key];
  const selected = st.multi ? (Array.isArray(val)&&val.includes(o.id)) : val===o.id;
  return `<button class="option-card ${o.big?'big':''} ${selected?'selected':''}" onclick="choose('${st.key}','${o.id}',${!!st.multi})">
    <div class="option-img" style="background-image:url('${o.img}')"></div>
    <div class="option-label"><b>${o.label}</b><small>${o.sub||""}</small></div>
  </button>`;
}
function choose(key,id,multi){
  if(multi){
    S.answers[key] = S.answers[key] || [];
    if(S.answers[key].includes(id)) S.answers[key]=S.answers[key].filter(x=>x!==id);
    else S.answers[key].push(id);
  }else{
    S.answers[key]=id;
    setTimeout(nextStep,180);
  }
  renderStep();
}
function prevStep(){ if(S.step>0){S.step--; renderStep();} }
function nextStep(){
  const st=STEPS[S.step];
  const val=S.answers[st.key];
  if(!val || (Array.isArray(val)&&!val.length)) return;
  if(S.step<STEPS.length-1){S.step++; renderStep();} else compose();
}

async function compose(){
  renderLoading();
  S.diagnostics=[];
  await locateIfPossible();
  await Promise.all([loadWeather(), loadAllRealData()]);
  S.items = normalizeAndScore([...S.places, ...S.events]);
  S.program = buildProgram(S.items);
  renderResults();
}

function renderLoading(){
  app.innerHTML = `<section class="screen">
    <div class="bg-photo" style="background-image:url('${IMG.soir}')"></div>
    <div class="loading-center">
      <div class="orbit"></div>
      <h2>Dolcia compose votre expérience...</h2>
      <p>Météo, événements, lieux réels, distance, budget, moment et envies. Dolcia n’invente rien.</p>
    </div>
  </section>`;
}

function locateIfPossible(){
  return new Promise(resolve=>{
    if(!navigator.geolocation) return resolve();
    navigator.geolocation.getCurrentPosition(pos=>{
      S.location.lat=pos.coords.latitude; S.location.lng=pos.coords.longitude; S.location.name="Autour de vous";
      resolve();
    },()=>resolve(),{timeout:2500, maximumAge:600000});
  });
}

async function apiFetch(path){
  let lastErr = null;
  for(const base of API_BASES){
    try{
      const res = await fetch(base + path);
      const txt = await res.text();
      let data; try{ data = JSON.parse(txt); }catch{ data = {raw:txt}; }
      if(res.ok && !data.error) return data;
      lastErr = data.error || data.status || txt || res.statusText;
    }catch(e){ lastErr = e.message; }
  }
  throw new Error(lastErr || "API inaccessible");
}

async function loadWeather(){
  try{
    S.weather = await apiFetch(`/api/weather?lat=${S.location.lat}&lng=${S.location.lng}`);
  }catch(e){
    S.weather=null; S.diagnostics.push("Météo : "+e.message);
  }
}

async function loadAllRealData(){
  S.places=[]; S.events=[];
  const vibes = S.answers.vibe?.length ? S.answers.vibe : ["food","nature","culture","bienetre","sport"];
  const wanted = vibes.map(v=>SOURCE_MAP[v]).filter(Boolean);
  const calls = [];
  const seen = new Set();

  for(const w of wanted){
    for(const type of w.types.slice(0,4)){
      calls.push(apiFetch(`/api/places?lat=${S.location.lat}&lng=${S.location.lng}&radius=${S.radius}&type=${encodeURIComponent(type)}`)
        .then(d=>addPlaces(d.results||[], seen)).catch(e=>S.diagnostics.push(`Google ${type} : ${e.message}`)));
    }
    for(const kw of w.keywords.slice(0,5)){
      calls.push(apiFetch(`/api/places?mode=text&lat=${S.location.lat}&lng=${S.location.lng}&radius=${S.radius}&keyword=${encodeURIComponent(kw)}`)
        .then(d=>addPlaces(d.results||[], seen)).catch(e=>S.diagnostics.push(`Google text ${kw} : ${e.message}`)));
    }
  }
  calls.push(loadEvents(wanted));
  await Promise.allSettled(calls);
}

function addPlaces(results, seen){
  const priceLabels=["Gratuit","€","€€","€€€","€€€€"];
  for(const p of results){
    if(!p.place_id || seen.has("g_"+p.place_id)) continue;
    seen.add("g_"+p.place_id);
    const loc=p.geometry?.location;
    const dist= loc ? distanceKm(S.location.lat,S.location.lng,loc.lat,loc.lng) : null;
    S.places.push({
      id:"g_"+p.place_id,
      source:"Google Places",
      kind:"place",
      name:p.name,
      address:p.vicinity || p.formatted_address || "",
      lat:loc?.lat, lng:loc?.lng,
      types:p.types||[],
      category:categoryFromTypes(p.types||[]),
      rating:p.rating || null,
      reviews:p.user_ratings_total || 0,
      priceLevel:p.price_level ?? null,
      priceLabel:p.price_level!=null ? priceLabels[p.price_level] : "",
      isOpen:p.opening_hours?.open_now ?? null,
      photoRef:p.photos?.[0]?.photo_reference || null,
      bookingUrl:null,
      raw:p,
      distance:dist
    });
  }
}

async function loadEvents(wanted){
  const after = new Date();
  const before = new Date();
  const days = S.answers.duration==="stay" ? 7 : S.answers.duration==="weekend" ? 4 : 2;
  before.setDate(before.getDate()+days);
  try{
    const data = await apiFetch(`/api/events?lat=${S.location.lat}&lng=${S.location.lng}&radius=${Math.max(20, Math.round(S.radius/1000))}&after=${fmt(after)}&before=${fmt(before)}`);
    const list = data.events || data.results || data.data || [];
    for(const ev of list){
      const n = normalizeOpenAgenda(ev);
      if(n) S.events.push(n);
    }
  }catch(e){ S.diagnostics.push("OpenAgenda : "+e.message); }
}
function normalizeOpenAgenda(ev){
  const title = textOf(ev.title || ev.name || ev.longDescription || ev.description) || "Événement";
  const timing = ev.timings?.[0] || ev.firstTiming || {};
  const date = timing.begin || ev.date || ev.daterange?.[0]?.from;
  const loc = ev.location || ev.locations?.[0] || {};
  const city = loc.city || loc.address || loc.name || "";
  const registrationUrl = ev.registrationUrl || ev.registration?.[0]?.value || ev.onlineAccessLink || ev.url || null;
  const txt = JSON.stringify(ev).toLowerCase();
  return {
    id:"oa_"+(ev.uid || ev.slug || title+date),
    source:"OpenAgenda",
    kind:"event",
    name:title,
    address:city,
    category:categoryFromText(txt),
    date:date || null,
    time:date ? new Date(date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "",
    bookingUrl:registrationUrl,
    rating:null,
    reviews:0,
    priceLevel: txt.includes("gratuit") || txt.includes("entrée libre") ? 0 : null,
    priceLabel: txt.includes("gratuit") || txt.includes("entrée libre") ? "Gratuit" : "",
    photoUrl: ev.image || ev.thumbnail || null,
    raw:ev,
    distance:null
  };
}
function textOf(v){ if(!v)return ""; if(typeof v==="string")return v; if(typeof v==="object")return Object.values(v).join(" "); return String(v); }
function fmt(d){ return d.toISOString().split("T")[0]; }

function categoryFromTypes(types){
  if(types.includes("restaurant")||types.includes("cafe")||types.includes("bakery")||types.includes("bar")) return "food";
  if(types.includes("spa")||types.includes("beauty_salon")||types.includes("swimming_pool")) return "bienetre";
  if(types.includes("museum")||types.includes("art_gallery")||types.includes("movie_theater")) return "culture";
  if(types.includes("night_club")||types.includes("casino")) return "night";
  if(types.includes("amusement_park")||types.includes("zoo")||types.includes("aquarium")||types.includes("bowling_alley")) return "sport";
  if(types.includes("park")||types.includes("tourist_attraction")) return "nature";
  return "culture";
}
function categoryFromText(t){
  if(/concert|festival|théâtre|theatre|expo|cinéma|cinema|spectacle|culture/.test(t)) return "culture";
  if(/sport|randonnée|randonnee|balade|vélo|velo/.test(t)) return "nature";
  if(/gastronomie|restaurant|marché|marche|food|dégustation/.test(t)) return "food";
  if(/soirée|club|dj|bar/.test(t)) return "night";
  if(/atelier|cours|stage/.test(t)) return "culture";
  if(/enfant|famille/.test(t)) return "famille_exp";
  return "culture";
}

function normalizeAndScore(items){
  const vibes = S.answers.vibe||[];
  const budget=S.answers.budget;
  return items.filter(Boolean).filter(it=>{
    if(budget==="free" && it.priceLevel!==0) return false;
    if(S.answers.who==="famille" && ["night"].includes(it.category)) return false;
    return true;
  }).map(it=>{
    let score=50;
    if(vibes.includes(it.category)) score += 22;
    if(it.kind==="event") score += 12;
    if(it.rating>=4.5) score += 12;
    if(it.reviews>100) score += 5;
    if(it.isOpen===true) score += 10;
    if(it.distance!=null && it.distance<3) score += 8;
    if(S.answers.when==="soir" && ["food","night","culture"].includes(it.category)) score += 8;
    if(S.answers.who==="famille" && ["famille_exp","sport","nature"].includes(it.category)) score += 10;
    return {...it, score};
  }).sort((a,b)=>b.score-a.score);
}

function buildProgram(items){
  if(!items.length) return [];
  const duration=S.answers.duration;
  const slots = duration==="2h" ? ["Maintenant"] :
    duration==="halfday" ? ["Début","Pause","Final"] :
    duration==="day" ? ["Matin","Midi","Après-midi","Soir"] :
    duration==="weekend" ? ["Samedi matin","Samedi midi","Samedi soir","Dimanche matin","Dimanche midi","Dimanche après-midi"] :
    ["Jour 1 matin","Jour 1 soir","Jour 2 matin","Jour 2 après-midi","Jour 2 soir","Jour 3 matin","Jour 3 soir"];

  const used=new Set();
  const prefs = {
    "Matin":["nature","culture","sport","famille_exp"],
    "Midi":["food"],
    "Après-midi":["bienetre","sport","culture","nature"],
    "Soir":["food","night","culture"],
    "Début":["nature","culture","sport","bienetre"],
    "Pause":["food"],
    "Final":["food","culture","night","bienetre"],
    "Maintenant":[...(S.answers.vibe||[])]
  };
  return slots.map((slot,i)=>{
    const key = Object.keys(prefs).find(k=>slot.includes(k)) || slot;
    const cats = prefs[key] || (S.answers.vibe||[]);
    let cand = items.find(x=>!used.has(x.id) && cats.includes(x.category)) || items.find(x=>!used.has(x.id));
    if(cand) used.add(cand.id);
    return cand ? {slot, item:cand} : null;
  }).filter(Boolean);
}

function renderResults(){
  const cover = S.program[0]?.item ? imageFor(S.program[0].item) : IMG.splash;
  const title = resultTitle();
  app.innerHTML = `
  <section class="screen results">
    <div class="scroll" style="bottom:calc(76px + var(--safeBottom))">
      <div class="cover">
        <div class="cover-photo" style="background-image:url('${cover}')"></div>
        <header class="topbar results"><button class="iconbtn" onclick="renderStep()">←</button><div class="logo">Dolcia</div><button class="ghostbtn" onclick="start()">Recommencer</button></header>
        <div class="results-copy screen-inner">
          <div class="eyebrow">Votre sélection Dolcia</div>
          <h2>${title}</h2>
          <p>${summaryText()}</p>
          <div class="chips">${criteriaChips().map(c=>`<span class="chip">${c}</span>`).join("")}</div>
          <div class="result-actions">
            <button class="gold-btn" onclick="surprise()">Surprends-moi avec ces critères</button>
            <button class="outline-btn" onclick="expandSearch()">Élargir</button>
          </div>
        </div>
      </div>
      ${S.diagnostics.length?`<div class="diagnostic"><b>Diagnostic API</b><br>${S.diagnostics.slice(0,6).join("<br>")}</div>`:""}
      ${!S.items.length ? emptyHTML() : `
        <section class="section screen-inner">
          <div class="section-head"><h3>Votre programme</h3><span class="section-caption">${S.program.length} étapes réelles</span></div>
          <div class="timeline">${S.program.map((s,i)=>slotHTML(s,i)).join("")}</div>
        </section>
        <section class="section screen-inner">
          <div class="section-head"><h3>Autres idées réelles</h3><span class="section-caption">Vous pouvez remplacer une étape</span></div>
          <div class="cards-grid">${S.items.slice(0,12).map(cardHTML).join("")}</div>
        </section>
      `}
    </div>
    <nav class="bottom-nav">
      <button class="navtab active" onclick="renderResults()">Découvrir</button>
      <button class="navtab center" onclick="surprise()">Surprendre</button>
      <button class="navtab" onclick="renderAgenda()">Agenda</button>
    </nav>
    <div id="detail" class="detail"></div>
    <div id="rating" class="rating-panel"></div>
  </section>`;
}

function emptyHTML(){
  return `<section class="empty screen-inner">
    <h3>Aucune activité réelle n’a remonté.</h3>
    <p>Dolcia n’invente rien. Vérifiez les variables Vercel GOOGLE_KEY / OPENAGENDA_KEY, le dossier /api, les quotas Google Places, ou cliquez sur Élargir.</p>
    <div style="margin-top:20px"><button class="gold-btn" onclick="expandSearch()">Élargir le rayon</button></div>
  </section>`;
}

function resultTitle(){
  const when = S.answers.when==="soir"?"Votre soirée se dessine.":S.answers.duration==="stay"?"Votre séjour commence ici.":"Dolcia a composé votre moment.";
  return when;
}
function summaryText(){
  const w = S.weather?.main?.temp ? `${Math.round(S.weather.main.temp)}°` : "météo actuelle";
  return `Sélection réelle autour de ${S.location.name}, adaptée à ${labelFor("who",S.answers.who)}, ${labelFor("duration",S.answers.duration)} et ${w}.`;
}
function labelFor(key,id){
  const st=STEPS.find(s=>s.key===key); if(!st)return id;
  return st.options.find(o=>o.id===id)?.label || id;
}
function criteriaChips(){
  return [labelFor("when",S.answers.when),labelFor("duration",S.answers.duration),labelFor("who",S.answers.who),labelFor("budget",S.answers.budget),...(S.answers.vibe||[]).map(v=>SOURCE_MAP[v]?.label||v)].filter(Boolean);
}
function slotHTML(s,i){
  return `<div class="slot">
    <div class="slot-time">${s.slot}</div>
    ${cardHTML(s.item, true)}
  </div>`;
}
function cardHTML(it, compact=false){
  const img=imageFor(it);
  const canBook=!!it.bookingUrl;
  return `<article class="exp-card" onclick="openDetail('${it.id}')">
    <div class="exp-img" style="background-image:url('${img}')"></div>
    <div class="exp-body">
      <div class="exp-type">${it.source} · ${SOURCE_MAP[it.category]?.label||"Expérience réelle"}</div>
      <div class="exp-title">${escapeHtml(it.name)}</div>
      <div class="meta">
        ${it.distance!=null?`<span>${it.distance.toFixed(1)} km</span>`:""}
        ${it.rating?`<span>★ ${it.rating.toFixed(1)} ${it.reviews?`(${it.reviews})`:""}</span>`:""}
        ${it.priceLabel?`<span>${it.priceLabel}</span>`:""}
        ${it.time?`<span>${it.time}</span>`:""}
        ${it.isOpen===true?`<span>Ouvert</span>`:""}
      </div>
      <div class="why">${whyText(it)}</div>
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="dark-btn" onclick="addAgenda('${it.id}')">Agenda</button>
        <button class="${canBook?'gold-btn':'outline-btn disabled'}" onclick="${canBook?`book('${it.id}')`:`toast('Réservation bientôt disponible chez les partenaires Dolcia')`}">${canBook?'Réserver':'Réserver bientôt'}</button>
      </div>
    </div>
  </article>`;
}
function imageFor(it){
  if(it.photoUrl) return it.photoUrl;
  if(it.photoRef) return `/api/photo?ref=${encodeURIComponent(it.photoRef)}&maxwidth=900`;
  return IMG[it.category] || IMG.fallback;
}
function whyText(it){
  if(it.kind==="event") return "Événement réel détecté dans l’agenda local : idéal pour enrichir votre programme sans chercher ailleurs.";
  if(S.answers.who==="famille" && ["sport","nature","famille_exp"].includes(it.category)) return "Choisi car il fonctionne bien en famille et peut s’intégrer facilement dans une journée avec enfants.";
  if(S.answers.when==="soir" && ["food","night","culture"].includes(it.category)) return "Pertinent pour ce soir : Dolcia privilégie les lieux et événements adaptés à une sortie en fin de journée.";
  if(it.rating>=4.5) return "Très bien noté : Dolcia privilégie les expériences qui inspirent confiance et donnent envie de sortir.";
  return "Sélectionné car il correspond à vos critères, à votre localisation et aux données réelles disponibles.";
}
function openDetail(id){
  const it=S.items.find(x=>x.id===id); if(!it)return;
  const d=document.getElementById("detail");
  S.current=it;
  d.innerHTML=`<div class="scroll">
    <div class="detail-photo" style="background-image:url('${imageFor(it)}')"></div>
    <header class="topbar detailbar"><button class="iconbtn" onclick="closeDetail()">←</button><div class="logo">Dolcia</div><button class="ghostbtn" onclick="rate('${it.id}')">Noter</button></header>
    <div class="detail-content screen-inner">
      <div class="eyebrow">${it.source}</div>
      <h2 class="detail-title">${escapeHtml(it.name)}</h2>
      <div class="chips">${[SOURCE_MAP[it.category]?.label,it.priceLabel,it.distance!=null?it.distance.toFixed(1)+" km":null,it.rating?"★ "+it.rating:null].filter(Boolean).map(c=>`<span class="chip">${c}</span>`).join("")}</div>
      <p class="why">${whyText(it)}</p>
      <div class="detail-row"><b>Adresse</b><span>${escapeHtml(it.address||"Adresse non fournie par la source")}</span></div>
      <div class="detail-row"><b>Source</b><span>${it.source}</span></div>
      <div class="detail-row"><b>Réservation</b><span>${it.bookingUrl?"Lien réel disponible":"Bientôt disponible via partenaires Dolcia"}</span></div>
      <div class="detail-row"><b>Agenda</b><span>Ajoutez l’activité pour recevoir plus tard des rappels intelligents et permettre à Dolcia d’apprendre vos goûts.</span></div>
    </div>
  </div>
  <div class="fixed-actions">
    <button class="dark-btn" onclick="addAgenda('${it.id}')">Ajouter à mon agenda</button>
    <button class="${it.bookingUrl?'gold-btn':'outline-btn disabled'}" onclick="${it.bookingUrl?`book('${it.id}')`:`toast('Réserver sera actif dès qu’un partenariat Dolcia existe')`}">${it.bookingUrl?'Réserver':'Réserver bientôt'}</button>
  </div>`;
  d.classList.add("open");
}
function closeDetail(){ document.getElementById("detail")?.classList.remove("open"); }

function addAgenda(id){
  const it=S.items.find(x=>x.id===id); if(!it)return;
  if(!S.agenda.find(x=>x.id===it.id)){
    const when = it.date || new Date().toISOString();
    S.agenda.push({...it, agendaDate:when, addedAt:new Date().toISOString()});
    save();
  }
  toast("Ajouté à Mon Agenda Dolcia");
}
function renderAgenda(){
  app.innerHTML = `<section class="screen results">
    <div class="scroll" style="bottom:calc(76px + var(--safeBottom))">
      <header class="topbar"><button class="iconbtn" onclick="renderResults()">←</button><div class="logo">Agenda</div><button class="ghostbtn" onclick="start()">Composer</button></header>
      <section class="section screen-inner" style="padding-top:calc(90px + env(safe-area-inset-top,0px))">
        <div class="eyebrow">Mon Agenda Dolcia</div>
        <h2>Vos moments à vivre.</h2>
        <p class="step-sub">C’est ici que Dolcia devient utile avant même la réservation : vos activités, vos rappels, puis demain vos réservations.</p>
        <div class="pill-row"><button class="pill active">À venir</button><button class="pill">Aujourd’hui</button><button class="pill">Ce week-end</button><button class="pill">Séjour</button></div>
        ${S.agenda.length?S.agenda.map(agendaHTML).join(""):`<div class="empty"><h3>Agenda vide</h3><p>Ajoutez une activité réelle depuis une fiche Dolcia.</p></div>`}
      </section>
    </div>
    <nav class="bottom-nav">
      <button class="navtab" onclick="renderResults()">Découvrir</button>
      <button class="navtab center" onclick="surprise()">Surprendre</button>
      <button class="navtab active" onclick="renderAgenda()">Agenda</button>
    </nav>
    <div id="rating" class="rating-panel"></div>
  </section>`;
}
function agendaHTML(it){
  return `<div class="agenda-card">
    <div class="agenda-img" style="background-image:url('${imageFor(it)}')"></div>
    <div style="flex:1">
      <div class="agenda-title">${escapeHtml(it.name)}</div>
      <div class="agenda-meta">${it.source} · ${it.time||"Rappel intelligent à venir"}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="outline-btn" style="height:38px" onclick="calendarLink('${it.id}')">Calendrier</button>
        <button class="dark-btn" style="height:38px" onclick="rate('${it.id}')">Noter</button>
      </div>
    </div>
  </div>`;
}
function calendarLink(id){
  const it=S.agenda.find(x=>x.id===id)||S.items.find(x=>x.id===id); if(!it)return;
  const start = new Date(it.date || Date.now()+3600000);
  const end = new Date(start.getTime()+2*3600000);
  const fmtCal=d=>d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
  const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(it.name+" — Dolcia")}&dates=${fmtCal(start)}/${fmtCal(end)}&location=${encodeURIComponent(it.address||"")}&details=${encodeURIComponent("Ajouté depuis Dolcia. Source réelle : "+it.source)}`;
  window.open(url,"_blank");
}
function book(id){ const it=S.items.find(x=>x.id===id)||S.agenda.find(x=>x.id===id); if(it?.bookingUrl) window.open(it.bookingUrl,"_blank"); }

function rate(id){
  const it=S.items.find(x=>x.id===id)||S.agenda.find(x=>x.id===id); if(!it)return;
  const r=document.getElementById("rating") || document.createElement("div");
  r.className="rating-panel open";
  r.innerHTML=`<div class="eyebrow">Dolcia apprend</div><h3>Avez-vous aimé ?</h3><p class="step-sub">Cette note reste dans Dolcia pour personnaliser les prochaines propositions.</p>
    <div class="stars">${[1,2,3,4,5].map(n=>`<button class="star" onclick="saveRating('${it.id}',${n})">★</button>`).join("")}</div>
    <button class="dark-btn" onclick="closeRating()">Plus tard</button>`;
  if(!r.parentElement) document.body.appendChild(r);
}
function saveRating(id,n){
  S.ratings[id]={rating:n,date:new Date().toISOString()};
  save();
  toast("Merci. Dolcia affinera vos prochaines idées.");
  closeRating();
}
function closeRating(){ document.querySelectorAll(".rating-panel").forEach(x=>x.classList.remove("open")); }

function surprise(){
  if(!S.items.length){ expandSearch(); return; }
  S.items = shuffle(S.items);
  S.program = buildProgram(S.items);
  renderResults();
}
function expandSearch(){
  S.radius = Math.min(S.radius*2, 60000);
  compose();
}
function diagnosticModal(){
  alert("Diagnostic Dolcia\\n\\nVariables attendues sur Vercel : GOOGLE_KEY, OPENAGENDA_KEY, OPENWEATHER_KEY.\\nDossier attendu : /api/places.js, /api/events.js, /api/weather.js, /api/photo.js.\\nRègle : si aucune donnée réelle ne remonte, Dolcia n’invente rien.");
}

function toast(msg){
  const el=document.createElement("div");
  el.textContent=msg;
  el.style.cssText="position:fixed;left:50%;bottom:110px;z-index:999;transform:translateX(-50%);padding:12px 18px;border-radius:999px;background:rgba(10,10,14,.95);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:13px;box-shadow:0 18px 45px rgba(0,0,0,.45)";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2400);
}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function distanceKm(lat1,lon1,lat2,lon2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5);}
renderSplash();
