/* DOLCIA V2 PREMIUM — CALENDRIER D'ABORD + API DIAGNOSTIC
   Règle absolue : aucune activité inventée.
   Les activités affichées viennent uniquement de Google Places, OpenAgenda ou partenaires réels.
*/

/* DOLCIA V13 SAFE ADDITIVE PATCH - base stable conservée */
function v13DurationDays(){
  try{
    if(typeof S !== "undefined" && S.dateStart && S.dateEnd){
      const a=new Date(S.dateStart.getFullYear(),S.dateStart.getMonth(),S.dateStart.getDate());
      const b=new Date(S.dateEnd.getFullYear(),S.dateEnd.getMonth(),S.dateEnd.getDate());
      return Math.max(1,Math.round((b-a)/86400000)+1);
    }
    if(typeof state !== "undefined" && state.answers && state.answers.duration){
      if(state.answers.duration==="3days") return 3;
      if(state.answers.duration==="week") return 7;
      return 1;
    }
  }catch(e){}
  return 1;
}
const V13_EXTRA_KEYWORDS = [
  "concert","théâtre","pièce de théâtre","spectacle","humour","festival","exposition","musée",
  "brocante","vide grenier","marché nocturne","marché local","atelier Leroy Merlin","atelier Cultura",
  "atelier IKEA","atelier enfant","atelier créatif","escape game","bowling","mini golf","spa","massage",
  "brunch","restaurant terrasse","bar à cocktails","glacier","salon de thé","paddle","location vélo",
  "centre équestre","coucher de soleil","food truck","rooftop"
];

const API_BASES = [""];
const app = document.getElementById("app");

const IMG = {
  splash:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
  date:"https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1600&q=85",
  map:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=85",
  couple:"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85",
  famille:"https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=85",
  amis:"https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85",
  solo:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  pro:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85",
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
  culture:{label:"Culture", types:["museum","art_gallery","movie_theater"], keywords:["musée","cinéma","théâtre","exposition","concert","festival","spectacle"], oa:["concert","festival","théâtre","cinéma","exposition","culture"]},
  bienetre:{label:"Bien-être", types:["spa","beauty_salon","swimming_pool"], keywords:["spa","massage","yoga","bien-être"], oa:["yoga","méditation","bien-être"]},
  sport:{label:"Loisirs", types:["golf_course","bowling_alley","amusement_park","aquarium","zoo"], keywords:["escape game","karting","laser game","paddle","golf","bowling","parc attractions"], oa:["sport","loisirs","compétition"]},
  night:{label:"Sortir", types:["bar","night_club","casino","restaurant"], keywords:["cocktail","bar","club","soirée","concert ce soir"], oa:["soirée","club","dj","concert"]},
  famille_exp:{label:"Famille", types:["amusement_park","zoo","aquarium","park","movie_theater","bowling_alley"], keywords:["enfants","famille","parc","ferme pédagogique","atelier enfant"], oa:["famille","enfant","atelier"]},
  gratuit:{label:"Gratuit", types:["park","tourist_attraction"], keywords:["gratuit","entrée libre","plage","parc","marché"], oa:["gratuit","entrée libre"]}
};


// Sources complémentaires à rechercher pour éviter l'effet "plage/parc/plage".
const EXTRA_KEYWORDS = [
  "concert", "festival", "théâtre", "pièce de théâtre", "spectacle", "humour", "one man show",
  "exposition", "musée", "galerie", "atelier enfant", "atelier créatif", "Leroy Merlin atelier",
  "Cultura atelier", "IKEA atelier", "brocante", "vide grenier", "marché nocturne", "marché local",
  "brunch", "restaurant terrasse", "bar à cocktails", "glacier", "salon de thé",
  "escape game", "bowling", "mini golf", "paddle", "vélo", "centre équestre", "spa", "massage"
];
const COMPOSITION_ORDER = ["food","culture","sport","bienetre","nature","food","night","culture","famille_exp"];

const STEPS = [
  {key:"where", title:"Où voulez-vous vivre ce moment ?", sub:"Autour de vous ou dans une destination précise.", options:[
    {id:"gps", label:"Autour de moi", sub:"Dolcia utilise votre position", img:IMG.map, big:true},
    {id:"destination", label:"Une autre destination", sub:"Rechercher une ville, une région ou un pays", img:IMG.splash},
    {id:"manual", label:"Une autre ville", sub:"À saisir dans la prochaine version", img:IMG.date}
  ]},
  {key:"who", title:"Avec qui vivez-vous ce moment ?", sub:"Dolcia adapte l’expérience au contexte : couple, famille, amis, solo ou professionnel.", options:[
    {id:"couple", label:"En couple", sub:"Une expérience à deux", img:IMG.couple, big:true},
    {id:"famille", label:"En famille", sub:"Enfants, bébé, grands-parents", img:IMG.famille},
    {id:"amis", label:"Entre amis", sub:"Sorties, rires et découvertes", img:IMG.amis},
    {id:"solo", label:"Solo", sub:"Pour soi, sans compromis", img:IMG.solo},
    {id:"pro", label:"Professionnel", sub:"Clients, équipe, séminaire", img:IMG.pro}
  ]},
  {key:"pace", title:"Quel rythme souhaitez-vous ?", sub:"Deux heures, un après-midi, une journée ou tout le séjour.", options:[
    {id:"2h", label:"2 heures", sub:"Court, efficace, inspirant", img:IMG.food},
    {id:"halfday", label:"Demi-journée", sub:"Une belle respiration", img:IMG.nature, big:true},
    {id:"day", label:"Journée", sub:"Un vrai programme", img:IMG.culture},
    {id:"stay", label:"Tout le séjour", sub:"Programme jour par jour", img:IMG.date}
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
    {id:"free", label:"Gratuit", sub:"0 €", img:IMG.gratuit},
    {id:"low", label:"Budget défini", sub:"Montant indiqué selon la durée", img:IMG.nature},
    {id:"mid", label:"Budget choisi", sub:"Budget intermédiaire clair", img:IMG.food, big:true},
    {id:"premium", label:"Sans limite", sub:"Sans limite de budget", img:IMG.bienetre},
    {id:"custom", label:"Budget personnalisé", sub:"À définir plus tard", img:IMG.soir}
  ]}
];

let S = {
  phase:"splash",
  step:0,
  answers:{vibe:[]},
  dateMode:"today",
  calendarMonth:new Date(),
  dateStart:null,
  dateEnd:null,
  location:{name:"Une destination-Paris-Plage", lat:50.5214, lng:1.5912},
  radius:12000,
  items:[],
  places:[],
  events:[],
  weather:null,
  program:[],
  current:null,
  agenda:JSON.parse(localStorage.getItem("dolcia_agenda")||"[]"),
  ratings:JSON.parse(localStorage.getItem("dolcia_ratings")||"{}"),
  diagnostics:[],
  apiReport:null
};

function save(){
  localStorage.setItem("dolcia_agenda", JSON.stringify(S.agenda));
  localStorage.setItem("dolcia_ratings", JSON.stringify(S.ratings));
}



function renderSafeAgenda(){
  const selectedDate = (S && S.dateStart) ? niceDate(S.dateStart) : "aujourd’hui";
  const placeName = (S && S.location && S.location.name) ? S.location.name : "votre destination";
  const hasProgram = Array.isArray(S.program) && S.program.length > 0;
  const body = hasProgram
    ? `<div class="lux-agenda">${S.program.map((s,i)=>safeAgendaSlotHTML(s,i)).join("")}</div>`
    : `<div class="empty compact-empty">
        <h3>Aucune activité réelle n’a encore remonté.</h3>
        <p>Dolcia n’invente rien. Modifiez vos critères, élargissez le rayon ou testez les API.</p>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="gold-btn" onclick="startDate()">Recomposer</button>
          <button class="outline-btn" onclick="expandSearch()">Élargir</button>
          <button class="outline-btn" onclick="runApiDiagnostic()">Tester</button>
        </div>
      </div>`;

  app.innerHTML = `<section class="screen concierge-results">
    <div class="scroll" style="bottom:calc(76px + var(--safeBottom))">
      <header class="topbar results compact-top">
        <button class="iconbtn" onclick="startDate()">←</button>
        <div class="logo">Dolcia</div>
        <button class="ghostbtn" onclick="startDate()">Modifier</button>
      </header>

      <section class="concierge-hero compact-hero screen-inner">
        <div class="eyebrow">Concierge loisirs</div>
        <h2>${hasProgram ? "Votre programme." : "Recherche en cours."}</h2>
        <p>${selectedDate} · ${placeName}${S.weather?.main?.temp ? " · " + Math.round(S.weather.main.temp) + "°C" : ""}</p>
        <div class="chips">${criteriaChips().slice(0,5).map(c=>`<span class="chip">${c}</span>`).join("")}</div>
      </section>

      <section class="agenda-shell compact-agenda screen-inner">
        <div class="agenda-top compact-agenda-top">
          <div><h3>${sameDay(S.dateStart,S.dateEnd) ? "Agenda du jour" : "Agenda du séjour"}</h3></div>
          ${hasProgram ? `<button class="outline-btn" onclick="validateAllProgram()">Tout ajouter</button>` : `<button class="outline-btn" onclick="startDate()">Recomposer</button>`}
        </div>
        ${body}
      </section>

      ${Array.isArray(S.items)&&S.items.length ? `<section class="section screen-inner compact-section"><div class="section-head"><h3>Autres idées</h3><span class="section-caption">${S.items.length} résultats réels</span></div><div class="cards-grid">${S.items.slice(0,12).map(cardHTML).join("")}</div></section>` : ""}
    </div>
    <nav class="bottom-nav">
      <button class="navtab active" onclick="renderSafeAgenda()">Agenda</button>
      <button class="navtab" onclick="startDate()">Composer</button>
      <button class="navtab" onclick="renderAgenda()">Mes sorties</button>
    </nav>
    <div id="detail" class="detail"></div><div id="rating" class="rating-panel"></div>
  </section>`;
}

function safeAgendaSlotHTML(s,i){
  const it=s && s.item ? s.item : null;
  if(!it) return "";
  const ok = !!(S.acceptedSlots && S.acceptedSlots[it.id]);
  return `<article class="lux-slot" onclick="openDetail('${it.id}')">
    <div class="lux-time">${(typeof cleanSlotLabel==="function" ? cleanSlotLabel(s.slot) : (s.slot||"Moment"))}${ok ? " · validé" : ""}</div>
    <div class="lux-card">
      <div class="lux-photo" style="background-image:url('${imageFor(it)}')"></div>
      <div class="lux-copy">
        <div class="exp-type">${it.source || "Source réelle"} · ${SOURCE_MAP[it.category]?.label || "Expérience"}</div>
        <h4>${escapeHtml(it.name)}</h4>
        <div class="meta">${it.distance!=null?`<span>${it.distance.toFixed(1)} km</span>`:""}${it.rating?`<span>★ ${Number(it.rating).toFixed(1)}</span>`:""}${it.priceLabel?`<span>${it.priceLabel}</span>`:""}${it.time?`<span>${it.time}</span>`:""}</div>
        <p>${whyText(it)}</p>
        <div class="slot-controls" onclick="event.stopPropagation()">
          <button class="outline-btn ${ok?'validated':''}" onclick="validateSlot(${i})">${ok?'Validé':'Valider'}</button>
          <button class="dark-btn" onclick="regenSlot(${i})">Changer</button>
          <button class="${it.bookingUrl?'gold-btn':'outline-btn disabled'}" onclick="${it.bookingUrl?`book('${it.id}')`:`toast('Réservation bientôt disponible avec les partenaires Dolcia')`}">${it.bookingUrl?'Réserver':'Bientôt'}</button>
        </div>
      </div>
    </div>
  </article>`;
}


function durationDays(){
  if(!S || !S.dateStart || !S.dateEnd) return 1;
  const a = new Date(S.dateStart.getFullYear(), S.dateStart.getMonth(), S.dateStart.getDate());
  const b = new Date(S.dateEnd.getFullYear(), S.dateEnd.getMonth(), S.dateEnd.getDate());
  return Math.max(1, Math.round((b-a)/86400000)+1);
}
function budgetLabel(id){
  const days = durationDays();
  const isHalf = S.answers && S.answers.pace === "halfday";
  const isTwoH = S.answers && S.answers.pace === "2h";
  let lowMax, midMin, midMax;
  if(isTwoH){ lowMax=30; midMin=30; midMax=80; }
  else if(isHalf){ lowMax=45; midMin=45; midMax=120; }
  else if(days<=1){ lowMax=70; midMin=70; midMax=180; }
  else if(days===2){ lowMax=140; midMin=140; midMax=350; }
  else if(days===3){ lowMax=220; midMin=220; midMax=500; }
  else { lowMax=Math.round(70*days); midMin=lowMax; midMax=Math.round(170*days); }
  const map = {
    free: ["Gratuit", "0 €"],
    low: ["Budget défini", `jusqu’à ${lowMax} €/pers.`],
    mid: ["Budget choisi", `${midMin} à ${midMax} €/pers.`],
    premium: ["Sans limite", "sans limite"],
    custom: ["Budget personnalisé", "à définir"]
  };
  return map[id] || [id,""];
}


function v13RenderSafeAgenda(){
  try{
    const selectedDate = (typeof S !== "undefined" && S.dateStart && typeof niceDate==="function") ? niceDate(S.dateStart) : "aujourd’hui";
    const placeName = (typeof S !== "undefined" && S.location && S.location.name) ? S.location.name : "votre destination";
    const hasProgram = Array.isArray(S.program) && S.program.length > 0;
    const hasItems = Array.isArray(S.items) && S.items.length > 0;
    const chips = (typeof criteriaChips==="function" ? criteriaChips() : []).slice(0,5).map(c=>`<span class="chip">${c}</span>`).join("");
    const body = hasProgram
      ? `<div class="lux-agenda">${S.program.map((s,i)=>safeAgendaSlotHTML(s,i)).join("")}</div>`
      : `<div class="empty compact-empty">
          <h3>Aucune activité réelle n’a encore remonté.</h3>
          <p>Dolcia n’invente rien. Élargissez le rayon ou modifiez vos critères.</p>
          <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
            <button class="gold-btn" onclick="startDate()">Recomposer</button>
            <button class="outline-btn" onclick="expandSearch()">Élargir</button>
          </div>
        </div>`;
    app.innerHTML = `<section class="screen concierge-results">
      <div class="scroll" style="bottom:calc(76px + var(--safeBottom))">
        <header class="topbar results compact-top">
          <button class="iconbtn" onclick="startDate()">←</button>
          <div class="logo">Dolcia</div>
          <button class="ghostbtn" onclick="startDate()">Modifier</button>
        </header>
        <section class="concierge-hero compact-hero screen-inner">
          <div class="eyebrow">Concierge loisirs</div>
          <h2>${hasProgram ? "Votre programme." : "Recherche en cours."}</h2>
          <p>${selectedDate} · ${placeName}</p>
          <div class="chips">${chips}</div>
        </section>
        <section class="agenda-shell compact-agenda screen-inner">
          <div class="agenda-top compact-agenda-top">
            <div><h3>${(typeof sameDay==="function" && S.dateStart && S.dateEnd && !sameDay(S.dateStart,S.dateEnd)) ? "Agenda du séjour" : "Agenda du jour"}</h3></div>
            ${hasProgram ? `<button class="outline-btn" onclick="validateAllProgram()">Tout ajouter</button>` : `<button class="outline-btn" onclick="startDate()">Recomposer</button>`}
          </div>
          ${body}
        </section>
        ${hasItems ? `<section class="section screen-inner compact-section"><div class="section-head"><h3>Autres idées</h3><span class="section-caption">${S.items.length} résultats réels</span></div><div class="cards-grid">${S.items.slice(0,12).map(cardHTML).join("")}</div></section>` : ""}
      </div>
      <nav class="bottom-nav">
        <button class="navtab active" onclick="v13RenderSafeAgenda()">Agenda</button>
        <button class="navtab" onclick="startDate()">Composer</button>
        <button class="navtab" onclick="renderAgenda()">Mes sorties</button>
      </nav>
      <div id="detail" class="detail"></div><div id="rating" class="rating-panel"></div>
    </section>`;
  }catch(e){
    try{ renderResults(); }catch(_){ app.innerHTML = `<section class="screen"><div class="empty"><h3>Dolcia</h3><p>Relancez l’application.</p><button onclick="location.reload()">Recharger</button></div></section>`; }
  }
}

function renderSplash(){
  S.phase="splash";
  app.innerHTML = `
  <section class="screen">
    <div class="bg-photo" style="background-image:url('${IMG.splash}')"></div>
    <header class="topbar"><div class="logo">DOL<span class="gold">CIA</span></div><button class="ghostbtn" onclick="runApiDiagnostic()">Test API</button></header>
    <div class="hero screen-inner">
      <div class="eyebrow">Le premier moteur d’inspiration du temps libre</div>
      <h1>Vos prochaines émotions commencent ici.</h1>
      <p>Dolcia compose des journées, des soirées et des séjours à partir de vraies activités autour de vous. Aucun lieu inventé. Jamais.</p>
      <button class="gold-btn" onclick="startDate()">Commencer</button>
    </div>
  </section>`;
}
function startDate(){
  S.dateStart = new Date(); S.dateEnd = new Date();
  renderDateStep();
}
function renderDateStep(){
  S.phase="date";
  const d1 = S.dateStart ? niceDate(S.dateStart) : "Choisir";
  const d2 = S.dateEnd && !sameDay(S.dateStart,S.dateEnd) ? " → " + niceDate(S.dateEnd) : "";
  app.innerHTML = `
  <section class="screen">
    <div class="bg-photo" style="background-image:url('${IMG.date}')"></div>
    <header class="topbar"><button class="iconbtn" onclick="renderSplash()">←</button><div class="logo">Dolcia</div><button class="ghostbtn" onclick="runApiDiagnostic()">Test API</button></header>
    <div class="step-wrap screen-inner">
      <div class="progress"><span style="width:12%"></span></div>
      <div class="eyebrow">Étape essentielle</div>
      <h2 class="step-title">Quand souhaitez-vous vivre quelque chose ?</h2>
      <p class="step-sub">Sans date, Dolcia ne peut pas proposer les vrais concerts, festivals, spectacles, marchés, offres flash ou événements éphémères.</p>
      <div class="pill-row" style="padding-bottom:14px">
        ${datePill("now","Maintenant")}
        ${datePill("today","Aujourd’hui")}
        ${datePill("tonight","Ce soir")}
        ${datePill("tomorrow","Demain")}
        ${datePill("weekend","Ce week-end")}
        ${datePill("custom","Choisir mes dates")}
        ${datePill("vacation","Vacances")}
      </div>
      <div class="calendar-panel">
        <div class="cal-head">
          <button class="iconbtn" onclick="calNav(-1)">‹</button>
          <div><b>${monthLabel(S.calendarMonth)}</b><small>${d1}${d2}</small></div>
          <button class="iconbtn" onclick="calNav(1)">›</button>
        </div>
        <div class="cal-days">${["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(x=>`<span>${x}</span>`).join("")}</div>
        <div class="cal-grid">${calendarCells()}</div>
      </div>
      <div class="sticky-continue">
        <button class="dark-btn" onclick="renderSplash()">Retour</button>
        <button class="gold-btn" onclick="goSteps()">Continuer</button>
      </div>
    </div>
  </section>`;
}
function datePill(id,label){return `<button class="pill ${S.dateMode===id?'active':''}" onclick="setDateMode('${id}')">${label}</button>`}
function setDateMode(mode){
  S.dateMode=mode;
  const now=new Date(); let s=new Date(now), e=new Date(now);
  if(mode==="tonight"){s=new Date(now); e=new Date(now);}
  if(mode==="tomorrow"){s.setDate(s.getDate()+1); e=new Date(s);}
  if(mode==="weekend"){const day=now.getDay(); const add=(6-day+7)%7 || 0; s=new Date(now); s.setDate(now.getDate()+add); e=new Date(s); e.setDate(s.getDate()+1);}
  if(mode==="vacation"){e=new Date(s); e.setDate(s.getDate()+3);}
  if(mode==="custom"){/* keep manual calendar */}
  if(mode!=="custom"){S.dateStart=s; S.dateEnd=e; S.calendarMonth=new Date(s.getFullYear(),s.getMonth(),1);}
  renderDateStep();
}
function calendarCells(){
  const y=S.calendarMonth.getFullYear(), m=S.calendarMonth.getMonth();
  const first=new Date(y,m,1); let start=(first.getDay()+6)%7;
  const days=new Date(y,m+1,0).getDate(); let html="";
  for(let i=0;i<start;i++) html+=`<button class="cal-cell empty"></button>`;
  for(let d=1; d<=days; d++){
    const date=new Date(y,m,d);
    const sel = isSelected(date);
    const inrange = inRange(date);
    const today = sameDay(date,new Date());
    html+=`<button class="cal-cell ${sel?'sel':''} ${inrange?'range':''} ${today?'today':''}" onclick="pickCal(${y},${m},${d})">${d}</button>`;
  }
  return html;
}
function pickCal(y,m,d){
  const date=new Date(y,m,d);
  S.dateMode="custom";
  if(!S.dateStart || (S.dateStart && S.dateEnd && !sameDay(S.dateStart,S.dateEnd))){
    S.dateStart=date; S.dateEnd=date;
  } else if(date < S.dateStart){
    S.dateStart=date; S.dateEnd=date;
  } else {
    S.dateEnd=date;
  }
  renderDateStep();
}
function calNav(n){S.calendarMonth=new Date(S.calendarMonth.getFullYear(),S.calendarMonth.getMonth()+n,1); renderDateStep();}
function sameDay(a,b){if(!a||!b)return false; return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function isSelected(d){return sameDay(d,S.dateStart)||sameDay(d,S.dateEnd)}
function inRange(d){return S.dateStart&&S.dateEnd&&d>S.dateStart&&d<S.dateEnd}
function monthLabel(d){return d.toLocaleDateString("fr-FR",{month:"long",year:"numeric"}).replace(/^./,c=>c.toUpperCase())}
function niceDate(d){return d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
function goSteps(){S.step=0; renderStep();}

function renderStep(){
  const st = STEPS[S.step];
  const pct = 12+((S.step+1)/STEPS.length)*82;
  const bg = st.options[0]?.img || IMG.splash;
  app.innerHTML = `
  <section class="screen">
    <div class="bg-photo" style="background-image:url('${bg}')"></div>
    <header class="topbar">
      <button class="iconbtn" onclick="${S.step===0?'renderDateStep()':'prevStep()'}">←</button>
      <div class="logo">Dolcia</div>
      <button class="ghostbtn" onclick="renderDateStep()">Dates</button>
    </header>
    <div class="step-wrap screen-inner">
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="eyebrow">${niceDate(S.dateStart)}${!sameDay(S.dateStart,S.dateEnd)?" → "+niceDate(S.dateEnd):""}</div>
      <h2 class="step-title">${st.title}</h2>
      <p class="step-sub">${st.sub}</p>
      <div class="option-grid">
        ${st.options.map(o=>optionHTML(st,o)).join("")}
      </div>
      <div class="step-actions">
        <button class="dark-btn" onclick="${S.step===0?'renderDateStep()':'prevStep()'}">Retour</button>
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
    <div class="option-label"><b>${st.key==="budget" ? budgetLabel(o.id)[0] : o.label}</b><small>${st.key==="budget" ? budgetLabel(o.id)[1] : (o.sub||"")}</small></div>
  </button>`;
}
function choose(key,id,multi){
  if(multi){
    S.answers[key] = S.answers[key] || [];
    if(S.answers[key].includes(id)) S.answers[key]=S.answers[key].filter(x=>x!==id);
    else S.answers[key].push(id);
  }else{
    S.answers[key]=id;
    if(key==="where" && id==="gps") locateIfPossible().then(()=>{});
    setTimeout(nextStep,150);
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
  S.diagnostics=[]; S.apiReport=null;
  S.items=[]; S.places=[]; S.events=[]; S.program=[];
  let done=false;
  setTimeout(()=>{ if(!done && document.querySelector('.concierge-loading')){ done=true; v13RenderSafeAgenda(); }}, 5000);
  try{
    if(S.answers.where==="gps") await locateIfPossible();
    await Promise.allSettled([loadWeather(), loadAllRealData()]);
    S.items = normalizeAndScore([...(S.places||[]), ...(S.events||[])]);
    S.program = buildProgram(S.items);
    done=true;
    v13RenderSafeAgenda();
  }catch(e){
    try{ S.diagnostics.push("Génération : "+(e.message||e)); }catch(_){}
    done=true;
    v13RenderSafeAgenda();
  }
}

function renderLoading(){
  app.innerHTML = `<section class="screen concierge-loading">
    <div class="bg-photo" style="background-image:url('${IMG.splash}')"></div>
    <div class="loading-center concierge">
      <div class="orbit"></div>
      <h2>Dolcia prépare votre expérience...</h2>
      <p>Recherche des activités réelles. Si une API bloque, Dolcia affichera quand même l’agenda.</p>
      <button class="gold-btn loading-skip" onclick="renderSafeAgenda()">Voir l’agenda</button>
    </div>
  </section>`;
  setTimeout(()=>{ if(document.querySelector('.concierge-loading')) renderSafeAgenda(); }, 1000);
}
function forceResults(){ renderSafeAgenda(); }

function locateIfPossible(){
  return new Promise(resolve=>{
    if(!navigator.geolocation) return resolve();
    navigator.geolocation.getCurrentPosition(pos=>{
      S.location.lat=pos.coords.latitude; S.location.lng=pos.coords.longitude; S.location.name="Autour de vous";
      resolve();
    },()=>resolve(),{timeout:3500, maximumAge:600000});
  });
}
async function apiFetch(path){
  let lastErr = null;
  for(const base of API_BASES){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), 8500);
    try{
      const res = await fetch(base + path, { signal: controller.signal });
      clearTimeout(timer);
      const txt = await res.text();
      let data; try{ data = JSON.parse(txt); }catch{ data = {raw:txt}; }
      if(res.ok && !data.error) return data;
      lastErr = `${base||"local"} ${data.error || data.status || txt || res.statusText}`;
    }catch(e){
      clearTimeout(timer);
      lastErr = `${base||"local"} ${e.name === "AbortError" ? "timeout API" : e.message}`;
    }
  }
  throw new Error(lastErr || "API inaccessible");
}
async function loadWeather(){
  try{ S.weather = await apiFetch(`/api/weather?lat=${S.location.lat}&lng=${S.location.lng}`); }
  catch(e){ S.weather=null; S.diagnostics.push("Météo : "+explainApiError(e.message)); }
}
async function loadAllRealData(){
  S.places=[]; S.events=[];
  const vibes = S.answers.vibe?.length ? S.answers.vibe : ["food","nature","culture","bienetre","sport"];
  const wanted = vibes.map(v=>SOURCE_MAP[v]).filter(Boolean);
  const calls = [];
  const seen = new Set();
  for(const w of wanted){
    for(const type of w.types.slice(0,1)){
      calls.push(apiFetch(`/api/places?lat=${S.location.lat}&lng=${S.location.lng}&radius=${S.radius}&type=${encodeURIComponent(type)}`)
        .then(d=>addPlaces(d.results||[], seen)).catch(e=>S.diagnostics.push(`Google ${type} : ${explainApiError(e.message)}`)));
    }
    for(const kw of w.keywords.slice(0,1)){
      calls.push(apiFetch(`/api/places?mode=text&lat=${S.location.lat}&lng=${S.location.lng}&radius=${S.radius}&keyword=${encodeURIComponent(kw)}`)
        .then(d=>addPlaces(d.results||[], seen)).catch(e=>S.diagnostics.push(`Google text ${kw} : ${explainApiError(e.message)}`)));
    }
  }
  
  for(const kw of EXTRA_KEYWORDS.slice(0,14)){
    calls.push(apiFetch(`/api/places?mode=text&lat=${S.location.lat}&lng=${S.location.lng}&radius=${S.radius}&keyword=${encodeURIComponent(kw)}`)
      .then(d=>addPlaces(d.results||[], seen)).catch(e=>S.diagnostics.push(`Google extra ${kw} : ${explainApiError(e.message)}`)));
  }
  for(const kw of V13_EXTRA_KEYWORDS.slice(0,18)){
    calls.push(apiFetch(`/api/places?mode=text&lat=${S.location.lat}&lng=${S.location.lng}&radius=${S.radius}&keyword=${encodeURIComponent(kw)}`)
      .then(d=>addPlaces(d.results||[], seen)).catch(()=>{}));
  }
  calls.push(loadEvents());
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
      id:"g_"+p.place_id, source:"Google Places", kind:"place", name:p.name,
      address:p.vicinity || p.formatted_address || "", lat:loc?.lat, lng:loc?.lng,
      types:p.types||[], category:categoryFromTypes(p.types||[]),
      rating:p.rating || null, reviews:p.user_ratings_total || 0,
      priceLevel:p.price_level ?? null, priceLabel:p.price_level!=null ? priceLabels[p.price_level] : "",
      isOpen:p.opening_hours?.open_now ?? null, photoRef:p.photos?.[0]?.photo_reference || null,
      bookingUrl:null, raw:p, distance:dist
    });
  }
}
async function loadEvents(){
  try{
    const data = await apiFetch(`/api/events?lat=${S.location.lat}&lng=${S.location.lng}&radius=${Math.max(20, Math.round(S.radius/1000))}&after=${fmt(S.dateStart)}&before=${fmt(S.dateEnd)}&size=100`);
    const list = data.events || data.results || data.data || [];
    for(const ev of list){ const n = normalizeOpenAgenda(ev); if(n) S.events.push(n); }
  }catch(e){ S.diagnostics.push("OpenAgenda : "+explainApiError(e.message)); }
}
function normalizeOpenAgenda(ev){
  const title = textOf(ev.title || ev.name || ev.longDescription || ev.description) || "Événement";
  const timing = ev.timings?.[0] || ev.firstTiming || {};
  const date = timing.begin || ev.date || ev.daterange?.[0]?.from;
  const loc = ev.location || ev.locations?.[0] || {};
  const city = typeof loc==="string" ? loc : (loc.name || loc.city || loc.address || "");
  const registrationUrl = ev.registrationUrl || ev.registration?.[0]?.value || ev.onlineAccessLink || ev.url || null;
  const txt = JSON.stringify(ev).toLowerCase();
  return {
    id:"oa_"+(ev.uid || ev.slug || title+date),
    source:"OpenAgenda", kind:"event", name:title, address:city,
    category:categoryFromText(txt), date:date || null,
    time:date ? new Date(date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "",
    bookingUrl:registrationUrl, rating:null, reviews:0,
    priceLevel: txt.includes("gratuit") || txt.includes("entrée libre") ? 0 : null,
    priceLabel: txt.includes("gratuit") || txt.includes("entrée libre") ? "Gratuit" : "",
    photoUrl: ev.image || ev.thumbnail || null, raw:ev, distance:null
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
  const vibes = S.answers.vibe||[]; const budget=S.answers.budget;
  return items.filter(Boolean).filter(it=>{
    if(budget==="free" && it.priceLevel!==0) return false;
    if(S.answers.who==="famille" && ["night"].includes(it.category)) return false;
    return true;
  }).map(it=>{
    let score=50;
    if(vibes.includes(it.category)) score += 22;
    if(it.kind==="event") score += 18;
    if(it.rating>=4.5) score += 12;
    if(it.reviews>100) score += 5;
    if(it.isOpen===true) score += 10;
    if(it.distance!=null && it.distance<3) score += 8;
    if(S.dateMode==="tonight" && ["food","night","culture"].includes(it.category)) score += 8;
    if(S.answers.who==="famille" && ["famille_exp","sport","nature"].includes(it.category)) score += 10;
    return {...it, score};
  }).sort((a,b)=>b.score-a.score);
}

function buildProgram(items){
  if(!items || !items.length) return [];
  const days = Math.max(1, Math.round((strip(S.dateEnd)-strip(S.dateStart))/(86400000))+1);
  const pace=S.answers.pace;
  let slots;
  if(pace==="2h") slots=["Maintenant"];
  else if(pace==="halfday") slots=["Début","Pause gourmande","Final"];
  else if(pace==="day") slots=["Matin","Midi","Après-midi","Apéritif","Soir"];
  else {
    slots=[];
    for(let i=1;i<=Math.min(days,7);i++) slots.push(`Jour ${i} matin`,`Jour ${i} midi`,`Jour ${i} après-midi`,`Jour ${i} apéritif`,`Jour ${i} soir`);
  }

  const used=new Set();
  const usedCats=[];
  const categoryForSlot = (slot, index)=>{
    const s=(slot||"").toLowerCase();
    if(s.includes("midi")) return ["food"];
    if(s.includes("apéritif")) return ["food","night"];
    if(s.includes("soir")) return ["culture","night","food"];
    if(s.includes("matin")) return ["culture","nature","sport","famille_exp"];
    if(s.includes("après")) return ["sport","bienetre","culture","nature","famille_exp"];
    if(s.includes("pause")) return ["food"];
    return COMPOSITION_ORDER.slice(index,index+4).concat(S.answers.vibe||[]);
  };

  return slots.map((slot,i)=>{
    const cats = categoryForSlot(slot,i);
    let cand = items.find(x=>!used.has(x.id) && cats.includes(x.category) && !sameCategoryTooOften(x.category, usedCats));
    if(!cand) cand = items.find(x=>!used.has(x.id) && cats.includes(x.category));
    if(!cand) cand = items.find(x=>!used.has(x.id) && !sameCategoryTooOften(x.category, usedCats));
    if(!cand) cand = items.find(x=>!used.has(x.id));
    if(cand){ used.add(cand.id); usedCats.push(cand.category); }
    return cand ? {slot, item:cand} : null;
  }).filter(Boolean);
}
function sameCategoryTooOften(cat, usedCats){
  if(!cat) return false;
  const last = usedCats[usedCats.length-1];
  const before = usedCats[usedCats.length-2];
  return last===cat || (last===cat && before===cat);
}

function strip(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}

function renderResults(){
  const days = groupProgramByDay();
  const activeDay = window.dolciaActiveDay || Object.keys(days)[0] || "Jour 1";
  app.innerHTML = `
  <section class="screen concierge-results">
    <div class="scroll" style="bottom:calc(76px + var(--safeBottom))">
      <header class="topbar results">
        <button class="iconbtn" onclick="renderStep()">←</button>
        <div class="logo">Dolcia</div>
        <button class="ghostbtn" onclick="startDate()">Modifier</button>
      </header>

      <section class="concierge-hero screen-inner">
        <div class="eyebrow">Votre concierge loisirs personnel</div>
        <h2>Votre agenda est prêt.</h2>
        <p>${conciergeIntro()}</p>
        <div class="chips">${criteriaChips().slice(0,6).map(c=>`<span class="chip">${c}</span>`).join("")}</div>
      </section>

      ${!S.items.length ? userFriendlyEmptyHTML() : `
        <section class="agenda-shell screen-inner">
          <div class="agenda-top">
            <div>
              <div class="eyebrow">Programme sur mesure</div>
              <h3>${!sameDay(S.dateStart,S.dateEnd) ? "Votre séjour" : "Votre journée"}</h3>
            </div>
            <button class="outline-btn" onclick="validateAllProgram()">Tout ajouter</button>
          </div>

          <div class="day-tabs">
            ${Object.keys(days).map(d=>`<button class="day-tab ${d===activeDay?'active':''}" onclick="setActiveDay('${d}')">${d}</button>`).join("")}
          </div>

          <div class="concierge-note">
            <b>Pourquoi ce programme ?</b>
            <span>Dolcia a combiné vos dates, votre profil, vos envies, la météo et les données réelles disponibles. Aucune activité n’est inventée.</span>
          </div>

          <div class="lux-agenda">
            ${(days[activeDay]||[]).map((s,i)=>agendaSlotHTML(s,i,activeDay)).join("")}
          </div>

          <div class="lux-actions">
            <button class="gold-btn" onclick="validateAllProgram()">Ajouter tout à mon agenda</button>
            <button class="dark-btn" onclick="surprise()">Recomposer cette journée</button>
            <button class="outline-btn" onclick="expandSearch()">Chercher plus large</button>
          </div>
        </section>

        <section class="section screen-inner">
          <div class="section-head"><h3>Remplacer une activité</h3><span class="section-caption">Suggestions réelles</span></div>
          <div class="cards-grid">${S.items.slice(0,8).map(cardHTML).join("")}</div>
        </section>
      `}
    </div>
    <nav class="bottom-nav">
      <button class="navtab active" onclick="renderResults()">Agenda</button>
      <button class="navtab" onclick="startDate()">Composer</button>
      <button class="navtab" onclick="renderAgenda()">Mes sorties</button>
    </nav>
    <div id="detail" class="detail"></div>
    <div id="rating" class="rating-panel"></div>
  </section>`;
}

function groupProgramByDay(){
  const out = {};
  S.program.forEach((s,idx)=>{
    let m = String(s.slot||"").match(/Jour\s+\d+/i);
    let day = m ? m[0].replace("jour","Jour") : (sameDay(S.dateStart,S.dateEnd) ? niceDate(S.dateStart) : "Jour 1");
    if(!out[day]) out[day]=[];
    out[day].push({...s, globalIndex:idx});
  });
  return out;
}
function setActiveDay(day){
  window.dolciaActiveDay = day;
  renderResults();
}
function conciergeIntro(){
  const period = !sameDay(S.dateStart,S.dateEnd) ? `du ${niceDate(S.dateStart)} au ${niceDate(S.dateEnd)}` : `le ${niceDate(S.dateStart)}`;
  const temp = S.weather?.main?.temp ? `${Math.round(S.weather.main.temp)} °C` : "météo actuelle";
  return `J’ai préparé un programme ${period}, autour de ${S.location.name}, adapté à ${labelFor("who",S.answers.who)}, à vos envies et à la ${temp}.`;
}
function userFriendlyEmptyHTML(){
  return `<section class="empty screen-inner">
    <h3>Je continue la recherche.</h3>
    <p>Certaines sources sont temporairement indisponibles ou trop lentes. Dolcia n’invente rien : élargissez le rayon, modifiez les critères ou vérifiez les clés API côté Vercel.</p>
    <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="gold-btn" onclick="expandSearch()">Élargir le rayon</button>
      <button class="outline-btn" onclick="startDate()">Modifier les critères</button>
    </div>
  </section>`;
}
function agendaSlotHTML(s,i,day){
  const idx = s.globalIndex ?? i;
  const it = s.item;
  const ok = !!S.acceptedSlots[it.id];
  return `<article class="lux-slot" onclick="openDetail('${it.id}')">
    <div class="lux-time">${cleanSlotLabel(s.slot)}${ok?' · validé':''}</div>
    <div class="lux-card">
      <div class="lux-photo" style="background-image:url('${imageFor(it)}')"></div>
      <div class="lux-copy">
        <div class="exp-type">${it.source} · ${SOURCE_MAP[it.category]?.label||"Expérience réelle"}</div>
        <h4>${escapeHtml(it.name)}</h4>
        <div class="meta">
          ${it.distance!=null?`<span>${it.distance.toFixed(1)} km</span>`:""}
          ${it.rating?`<span>★ ${it.rating.toFixed(1)}</span>`:""}
          ${it.priceLabel?`<span>${it.priceLabel}</span>`:""}
          ${it.time?`<span>${it.time}</span>`:""}
        </div>
        <p>${whyText(it)}</p>
        <div class="slot-controls" onclick="event.stopPropagation()">
          <button class="outline-btn ${ok?'validated':''}" onclick="validateSlot(${idx})">${ok?'Validé':'Valider'}</button>
          <button class="dark-btn" onclick="regenSlot(${idx})">Changer</button>
          <button class="${it.bookingUrl?'gold-btn':'outline-btn disabled'}" onclick="${it.bookingUrl?`book('${it.id}')`:`toast('Réservation bientôt disponible avec les partenaires Dolcia')`}">${it.bookingUrl?'Réserver':'Bientôt'}</button>
        </div>
      </div>
    </div>
  </article>`;
}
function cleanSlotLabel(slot){
  return String(slot||"").replace(/Jour\s+\d+\s*/i,"").trim() || "Moment";
}

function emptyHTML(){return userFriendlyEmptyHTML()}
function resultTitle(){return !sameDay(S.dateStart,S.dateEnd) ? "Votre séjour se dessine." : (S.dateMode==="tonight"?"Votre soirée se dessine.":"Dolcia a composé votre moment.")}
function summaryText(){const w=S.weather?.main?.temp?`${Math.round(S.weather.main.temp)}°`:"météo actuelle";return `Sélection réelle du ${niceDate(S.dateStart)}${!sameDay(S.dateStart,S.dateEnd)?" au "+niceDate(S.dateEnd):""} autour de ${S.location.name}, adaptée à ${labelFor("who",S.answers.who)} et ${w}.`}
function labelFor(key,id){const st=STEPS.find(s=>s.key===key); if(!st)return id; return st.options.find(o=>o.id===id)?.label || id;}
function criteriaChips(){return [`${niceDate(S.dateStart)}${!sameDay(S.dateStart,S.dateEnd)?" → "+niceDate(S.dateEnd):""}`,labelFor("pace",S.answers.pace),labelFor("who",S.answers.who),labelFor("budget",S.answers.budget),...(S.answers.vibe||[]).map(v=>SOURCE_MAP[v]?.label||v)].filter(Boolean)}
function slotHTML(s){return `<div class="slot"><div class="slot-time">${s.slot}</div>${cardHTML(s.item)}</div>`}
function cardHTML(it){
  const canBook=!!it.bookingUrl;
  return `<article class="exp-card" onclick="openDetail('${it.id}')"><div class="exp-img" style="background-image:url('${imageFor(it)}')"></div><div class="exp-body"><div class="exp-type">${it.source} · ${SOURCE_MAP[it.category]?.label||"Expérience réelle"}</div><div class="exp-title">${escapeHtml(it.name)}</div><div class="meta">${it.distance!=null?`<span>${it.distance.toFixed(1)} km</span>`:""}${it.rating?`<span>★ ${it.rating.toFixed(1)} ${it.reviews?`(${it.reviews})`:""}</span>`:""}${it.priceLabel?`<span>${it.priceLabel}</span>`:""}${it.time?`<span>${it.time}</span>`:""}${it.isOpen===true?`<span>Ouvert</span>`:""}</div><div class="why">${whyText(it)}</div><div class="card-actions" onclick="event.stopPropagation()"><button class="dark-btn" onclick="addAgenda('${it.id}')">Agenda</button><button class="${canBook?'gold-btn':'outline-btn disabled'}" onclick="${canBook?`book('${it.id}')`:`toast('Réservation bientôt disponible chez les partenaires Dolcia')`}">${canBook?'Réserver':'Réserver bientôt'}</button></div></div></article>`;
}
function imageFor(it){if(it.photoUrl)return it.photoUrl; if(it.photoRef)return `/api/photo?ref=${encodeURIComponent(it.photoRef)}&maxwidth=900`; return IMG[it.category]||IMG.fallback;}
function whyText(it){if(it.kind==="event")return "Événement réel disponible aux dates choisies. C’est exactement pourquoi Dolcia commence par le calendrier."; if(S.answers.who==="famille"&&["sport","nature","famille_exp"].includes(it.category))return "Choisi car il fonctionne bien en famille et peut s’intégrer dans une journée avec enfants."; if(it.rating>=4.5)return "Très bien noté : Dolcia privilégie les expériences qui inspirent confiance."; return "Sélectionné car il correspond à vos critères, vos dates, votre localisation et aux données réelles disponibles."}
function openDetail(id){
  const it=S.items.find(x=>x.id===id); if(!it)return;
  const d=document.getElementById("detail"); S.current=it;
  d.innerHTML=`<div class="scroll"><div class="detail-photo" style="background-image:url('${imageFor(it)}')"></div><header class="topbar detailbar"><button class="iconbtn" onclick="closeDetail()">←</button><div class="logo">Dolcia</div><button class="ghostbtn" onclick="rate('${it.id}')">Noter</button></header><div class="detail-content screen-inner"><div class="eyebrow">${it.source}</div><h2 class="detail-title">${escapeHtml(it.name)}</h2><div class="chips">${[SOURCE_MAP[it.category]?.label,it.priceLabel,it.distance!=null?it.distance.toFixed(1)+" km":null,it.rating?"★ "+it.rating:null].filter(Boolean).map(c=>`<span class="chip">${c}</span>`).join("")}</div><p class="why">${whyText(it)}</p><div class="detail-row"><b>Date</b><span>${it.date?new Date(it.date).toLocaleString("fr-FR"):niceDate(S.dateStart)}</span></div><div class="detail-row"><b>Adresse</b><span>${escapeHtml(it.address||"Adresse non fournie par la source")}</span></div><div class="detail-row"><b>Source</b><span>${it.source}</span></div><div class="detail-row"><b>Réservation</b><span>${it.bookingUrl?"Lien réel disponible":"Bientôt disponible via partenaires Dolcia"}</span></div></div></div><div class="fixed-actions"><button class="dark-btn" onclick="addAgenda('${it.id}')">Ajouter à mon agenda</button><button class="${it.bookingUrl?'gold-btn':'outline-btn disabled'}" onclick="${it.bookingUrl?`book('${it.id}')`:`toast('Réserver sera actif dès qu’un partenariat Dolcia existe')`}">${it.bookingUrl?'Réserver':'Réserver bientôt'}</button></div>`;
  d.classList.add("open");
}
function closeDetail(){document.getElementById("detail")?.classList.remove("open");}
function addAgenda(id){const it=S.items.find(x=>x.id===id); if(!it)return; if(!S.agenda.find(x=>x.id===it.id)){S.agenda.push({...it, agendaDate:it.date||S.dateStart.toISOString(), addedAt:new Date().toISOString()}); save();} toast("Ajouté à Mon Agenda Dolcia");}
function renderAgenda(){
  app.innerHTML=`<section class="screen results"><div class="scroll" style="bottom:calc(76px + var(--safeBottom))"><header class="topbar"><button class="iconbtn" onclick="renderResults()">←</button><div class="logo">Agenda</div><button class="ghostbtn" onclick="startDate()">Composer</button></header><section class="section screen-inner" style="padding-top:calc(90px + env(safe-area-inset-top,0px))"><div class="eyebrow">Mon Agenda Dolcia</div><h2>Vos moments à vivre.</h2><p class="step-sub">Activités aujourd’hui, demain, dans un mois ou pendant vos vacances. C’est le compagnon de séjour Dolcia.</p><div class="pill-row"><button class="pill active">À venir</button><button class="pill">Aujourd’hui</button><button class="pill">Séjour</button><button class="pill">Historique</button></div>${S.agenda.length?S.agenda.map(agendaHTML).join(""):`<div class="empty"><h3>Agenda vide</h3><p>Ajoutez une activité réelle depuis une fiche Dolcia.</p></div>`}</section></div><nav class="bottom-nav"><button class="navtab" onclick="renderResults()">Découvrir</button><button class="navtab" onclick="startDate()">Composer</button><button class="navtab active" onclick="renderAgenda()">Agenda</button></nav><div id="rating" class="rating-panel"></div></section>`;
}
function agendaHTML(it){return `<div class="agenda-card"><div class="agenda-img" style="background-image:url('${imageFor(it)}')"></div><div style="flex:1"><div class="agenda-title">${escapeHtml(it.name)}</div><div class="agenda-meta">${it.source} · ${it.time||new Date(it.agendaDate).toLocaleDateString("fr-FR")}</div><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button class="outline-btn" style="height:38px" onclick="calendarLink('${it.id}')">Calendrier</button><button class="dark-btn" style="height:38px" onclick="rate('${it.id}')">Noter</button></div></div></div>`}
function calendarLink(id){const it=S.agenda.find(x=>x.id===id)||S.items.find(x=>x.id===id); if(!it)return; const start=new Date(it.date||it.agendaDate||Date.now()+3600000); const end=new Date(start.getTime()+2*3600000); const fmtCal=d=>d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z"; const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(it.name+" — Dolcia")}&dates=${fmtCal(start)}/${fmtCal(end)}&location=${encodeURIComponent(it.address||"")}&details=${encodeURIComponent("Ajouté depuis Dolcia. Source réelle : "+it.source)}`; window.open(url,"_blank");}
function book(id){const it=S.items.find(x=>x.id===id)||S.agenda.find(x=>x.id===id); if(it?.bookingUrl)window.open(it.bookingUrl,"_blank");}
function rate(id){const it=S.items.find(x=>x.id===id)||S.agenda.find(x=>x.id===id); if(!it)return; const r=document.getElementById("rating")||document.createElement("div"); r.className="rating-panel open"; r.innerHTML=`<div class="eyebrow">Dolcia apprend</div><h3>Avez-vous aimé ?</h3><p class="step-sub">Cette note reste dans Dolcia pour personnaliser les prochaines propositions.</p><div class="stars">${[1,2,3,4,5].map(n=>`<button class="star" onclick="saveRating('${it.id}',${n})">★</button>`).join("")}</div><button class="dark-btn" onclick="closeRating()">Plus tard</button>`; if(!r.parentElement)document.body.appendChild(r);}
function saveRating(id,n){S.ratings[id]={rating:n,date:new Date().toISOString()}; save(); toast("Merci. Dolcia affinera vos prochaines idées."); closeRating();}
function closeRating(){document.querySelectorAll(".rating-panel").forEach(x=>x.classList.remove("open"));}
function surprise(){if(!S.items.length){expandSearch();return;} S.items=shuffle(S.items); S.program=buildProgram(S.items); renderResults();}
function expandSearch(){S.radius=Math.min(S.radius*2,60000); compose();}
async function runApiDiagnostic(){
  S.diagnostics=[]; const tests=[];
  const paths=[`/api/weather?lat=${S.location.lat}&lng=${S.location.lng}`,`/api/places?lat=${S.location.lat}&lng=${S.location.lng}&radius=5000&type=restaurant`,`/api/events?lat=${S.location.lat}&lng=${S.location.lng}&radius=30&after=${fmt(S.dateStart||new Date())}&before=${fmt(S.dateEnd||new Date())}`];
  for(const p of paths){
    try{const d=await apiFetch(p); tests.push("OK "+p+" → "+JSON.stringify(d).slice(0,120));}
    catch(e){tests.push("ERREUR "+p+" → "+e.message);}
  }
  alert("Diagnostic API Dolcia\\n\\n"+tests.join("\\n\\n")+"\\n\\nVariables attendues : GOOGLE_KEY, OPENAGENDA_KEY, OPENWEATHER_KEY.");
}

function explainApiError(msg){
  const m=String(msg||"");
  if(m.includes("referer restrictions") || m.includes("API keys with referer restrictions")){
    return "clé GOOGLE_KEY bloquée : elle est limitée par domaine HTTP referrer. Pour /api/places.js côté serveur Vercel, il faut une clé Google Places séparée sans restriction HTTP referrer, avec restriction par API + quota.";
  }
  if(m.includes("exceeding of requests limitation") || m.includes("temporary blocked")){
    return "compte OpenWeather temporairement bloqué/quota dépassé. Il faut attendre le reset, augmenter le plan, ou changer OPENWEATHER_KEY.";
  }
  if(m.includes("not configured")){
    return "variable Vercel manquante ou non cochée en Production/Preview/Development.";
  }
  return m;
}

function toast(msg){const el=document.createElement("div"); el.textContent=msg; el.style.cssText="position:fixed;left:50%;bottom:110px;z-index:999;transform:translateX(-50%);padding:12px 18px;border-radius:999px;background:rgba(10,10,14,.95);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:13px;box-shadow:0 18px 45px rgba(0,0,0,.45)"; document.body.appendChild(el); setTimeout(()=>el.remove(),2400);}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function distanceKm(lat1,lon1,lat2,lon2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180; const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2; return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function shuffle(a){return [...a].sort(()=>Math.random()-.5);}
renderSplash();
