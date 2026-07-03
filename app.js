const PROXY = '/api';
const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

const S = {
  city: { n: 'Le Touquet-Paris-Plage', lat: 50.5214, lng: 1.5912 },
  radiusKm: 8,
  tab: 'discover',
  cat: 'all',
  moment: 'now',
  acts: [],
  events: [],
  weather: null,
  saved: JSON.parse(localStorage.getItem('dolcia_saved') || '[]'),
  loading: false,
  error: '',
  started: localStorage.getItem('dolcia_started') === '1'
};

const TYPES = ['restaurant','spa','bar','cafe','casino','night_club','movie_theater','museum','art_gallery','park','tourist_attraction','beach','natural_feature','golf_course','bowling_alley','gym','swimming_pool','amusement_park'];
const CAT_LABEL = {all:'Pour vous',restaurant:'Gastronomie',spa:'Bien-être',bar:'Bars',cafe:'Cafés',casino:'Casino',night_club:'Sorties',movie_theater:'Cinéma',museum:'Culture',art_gallery:'Art',park:'Nature',tourist_attraction:'Patrimoine',beach:'Plage',natural_feature:'Panorama',golf_course:'Golf',bowling_alley:'Loisirs',gym:'Sport',swimming_pool:'Piscine',amusement_park:'Famille'};
const CAT_IMG = {
  restaurant:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80',
  spa:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80',
  bar:'https://images.unsplash.com/photo-1572116469696-31de0f17cc34b?w=1000&q=80',
  cafe:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80',
  night_club:'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1000&q=80',
  casino:'https://images.unsplash.com/photo-1563941406054-949cc56e6b72?w=1000&q=80',
  movie_theater:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&q=80',
  museum:'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1000&q=80',
  art_gallery:'https://images.unsplash.com/photo-1577720643272-265f09367456?w=1000&q=80',
  park:'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&q=80',
  tourist_attraction:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000&q=80',
  beach:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80',
  natural_feature:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80',
  golf_course:'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1000&q=80',
  bowling_alley:'https://images.unsplash.com/photo-1545451092-8d4abbd4e023?w=1000&q=80',
  gym:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&q=80',
  swimming_pool:'https://images.unsplash.com/photo-1508578427060-72f870c6cc5c?w=1000&q=80',
  amusement_park:'https://images.unsplash.com/photo-1505731110654-99d7f7f8e39c?w=1000&q=80'
};

function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); setTimeout(()=>toastEl.classList.remove('on'),2200); }
function km(d){ return !d ? '' : d < 1 ? `${Math.round(d*1000)} m` : `${d.toFixed(1)} km`; }
function h(){ return new Date().getHours(); }
function dist(p){ const dlat=(p.geometry?.location?.lat||S.city.lat)-S.city.lat; const dlng=(p.geometry?.location?.lng||S.city.lng)-S.city.lng; return Math.sqrt(dlat*dlat+dlng*dlng)*111; }
function img(a, w=900){ return a.photoRef ? `${PROXY}/photo?ref=${encodeURIComponent(a.photoRef)}&maxwidth=${w}` : (CAT_IMG[a.cat] || CAT_IMG.tourist_attraction); }
function saveStore(){ localStorage.setItem('dolcia_saved', JSON.stringify(S.saved)); }

function normalizePlace(p){
  const pri = TYPES;
  const types = p.types || [];
  let cat = pri.find(t=>types.includes(t)) || 'tourist_attraction';
  const d = dist(p);
  const price = typeof p.price_level === 'number' ? p.price_level : null;
  return {
    id: p.place_id || p.id || p.name,
    name: p.name,
    cat, types, dist: d,
    rating: p.rating || 0,
    reviews: p.user_ratings_total || 0,
    price,
    isOpen: p.opening_hours?.open_now,
    address: p.vicinity || p.formatted_address || '',
    photoRef: p.photos?.[0]?.photo_reference || null
  };
}
function score(a){
  let s = 50;
  if(a.rating >= 4.7) s += 22; else if(a.rating >= 4.4) s += 16; else if(a.rating >= 4.0) s += 9;
  if(a.reviews > 500) s += 9; else if(a.reviews > 100) s += 6;
  if(a.dist < .7) s += 10; else if(a.dist < 2) s += 6;
  if(a.isOpen === true) s += 10; if(a.isOpen === false) s -= 22;
  const hour = h();
  if(hour >= 18 && ['restaurant','bar','casino','night_club','movie_theater'].includes(a.cat)) s += 14;
  if(hour >= 8 && hour <= 17 && ['beach','park','tourist_attraction','natural_feature','museum','art_gallery'].includes(a.cat)) s += 12;
  if(S.cat !== 'all' && a.cat === S.cat) s += 22;
  return Math.max(1, Math.min(99, Math.round(s)));
}
function filtered(){
  let a = [...S.acts];
  if(S.cat !== 'all') a = a.filter(x => x.cat === S.cat || x.types.includes(S.cat));
  return a.map(x=>({...x, score:score(x)})).sort((a,b)=>b.score-a.score).slice(0,30);
}

async function loadAll(){
  S.loading = true; S.error = ''; render();
  try{
    const radius = S.radiusKm * 1000;
    const calls = TYPES.map(type => fetch(`${PROXY}/places?lat=${S.city.lat}&lng=${S.city.lng}&radius=${radius}&type=${type}`).then(r=>r.json()).catch(()=>({results:[]})));
    const [weather, events, ...places] = await Promise.all([
      fetch(`${PROXY}/weather?lat=${S.city.lat}&lng=${S.city.lng}`).then(r=>r.json()).catch(()=>null),
      fetch(`${PROXY}/events?lat=${S.city.lat}&lng=${S.city.lng}&radius=30&size=100`).then(r=>r.json()).catch(()=>({events:[]})),
      ...calls
    ]);
    const seen = new Set();
    const acts = [];
    places.flatMap(x=>x.results||[]).forEach(p=>{ if(!p.place_id || seen.has(p.place_id)) return; seen.add(p.place_id); acts.push(normalizePlace(p)); });
    S.weather = weather?.weather ? weather : null;
    S.events = Array.isArray(events?.events) ? events.events : [];
    S.acts = acts;
    if(!acts.length) S.error = 'Les activités ne remontent pas. Vérifiez les variables Vercel GOOGLE_KEY et le dossier /api.';
  }catch(e){
    S.error = e.message || 'Impossible de charger les activités';
  }finally{ S.loading = false; render(); }
}

function icon(name){
  const paths = {
    map:'M12 2l7 4v16l-7-4-7 4V6l7-4zM12 2v16M5 6l7 4 7-4',
    heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
    search:'M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4z',
    tune:'M4 7h16M8 7v10M4 17h16M16 7v10',
    cal:'M7 2v4M17 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.search}"/></svg>`;
}
function intro(){
  return `<div class="screen on"><div class="bg-cinema"><div class="bg-slide"></div><div class="bg-slide"></div><div class="bg-slide"></div><div class="bg-slide"></div></div><main class="intro"><div class="brandline"><div class="brand">DOLCIA</div><div class="citychip"><span class="dot"></span>${S.city.n}</div></div><div class="intro-ey">Le Doctolib des loisirs</div><h1 class="intro-title">Découvrez.<br><em>Ressentez.</em><br>Vivez.</h1><p class="intro-sub">Restaurants, événements, sorties, bien-être, famille et expériences locales. Dolcia compose votre moment parfait avec des lieux réellement référencés.</p><div class="intro-actions"><button class="gold-btn" onclick="start()">Commencer l'expérience</button><button class="ghost-btn" onclick="geo()">Me localiser</button></div><div class="trust"><div><b>Réel</b><span>Google Places</span></div><div><b>Local</b><span>OpenAgenda</span></div><div><b>Magique</b><span>Surprenez-moi</span></div></div></main></div>`;
}
function heroBg(){ const top = filtered()[0]; return top ? img(top,1200) : CAT_IMG.beach; }
function main(){
  return `<div class="main"><header class="topbar"><div class="brand">Dolcia</div><button class="iconbtn" onclick="geo()">${icon('map')}</button><button class="iconbtn" onclick="setTab('saved')">${icon('heart')}</button></header><div class="content"><section class="hero"><div class="hero-media" style="background-image:url('${heroBg()}')"></div><div class="hero-copy"><div class="hero-kicker">Vos prochaines émotions commencent ici</div><h1>Que voulez-vous <em>vivre</em> aujourd'hui ?</h1><div class="search">${icon('search')}<input placeholder="Un dîner, une sortie, une activité famille..." oninput="searchText(this.value)"><button class="iconbtn" onclick="openFilters()">${icon('tune')}</button></div></div></section>${quick()}${S.tab==='discover'?discover():S.tab==='agenda'?agenda():saved()}</div>${nav()}</div>`;
}
function quick(){
  const cats = ['all','restaurant','beach','spa','museum','bar','movie_theater','park','bowling_alley','casino'];
  return `<div class="quick">${cats.map(c=>`<button class="pill ${S.cat===c?'on':''}" onclick="setCat('${c}')">${CAT_LABEL[c]}</button>`).join('')}</div>`;
}
function dreams(){
  const d = [
    ['restaurant','Gastronomie',CAT_IMG.restaurant],['spa','Bien-être',CAT_IMG.spa],['beach','Bord de mer',CAT_IMG.beach],['museum','Culture',CAT_IMG.museum],['bar','Cocktails',CAT_IMG.bar],['park','Nature',CAT_IMG.park],['movie_theater','Cinéma',CAT_IMG.movie_theater],['bowling_alley','Loisirs',CAT_IMG.bowling_alley]
  ];
  return `<section class="section"><div class="section-head"><h2 class="section-title">Inspirations</h2><span class="section-link">Sélection</span></div><div class="dream-grid">${d.map(x=>`<div class="dream" style="--img:url('${x[2]}')" onclick="setCat('${x[0]}')"><span>${x[1]}</span></div>`).join('')}</div></section>`;
}
function discover(){
  if(S.loading) return `<section class="section"><div class="loader"></div><div class="empty"><strong>Dolcia cherche...</strong>Les meilleures expériences réelles autour de vous.</div></section>`;
  if(S.error) return `${dreams()}<section class="section"><div class="empty"><strong>Connexion à corriger</strong>${S.error}<br><br><button class="gold-btn" onclick="loadAll()">Réessayer</button></div></section>`;
  const f = filtered();
  return `${dreams()}<section class="section"><div class="section-head"><h2 class="section-title">${CAT_LABEL[S.cat]}</h2><span class="section-link">${f.length} lieux</span></div><div class="cards">${f.map(card).join('')}</div></section>`;
}
function card(a){
  const free = a.price === 0;
  const saved = S.saved.some(x=>x.id===a.id);
  return `<article class="card" onclick="detail('${a.id}')"><div class="card-img" style="background-image:url('${img(a)}')"><div class="badge-row">${a.isOpen===true?'<span class="badge green">Ouvert</span>':''}${free?'<span class="badge gold">Gratuit</span>':''}<span class="badge">${CAT_LABEL[a.cat]||'Expérience'}</span></div><div class="score">${a.score}</div></div><div class="card-body"><div class="meta"><span>${CAT_LABEL[a.cat]||a.cat}</span><span>${km(a.dist)}</span></div><h3 class="card-title">${a.name}</h3><p class="card-sub">${a.address||'Lieu référencé autour de vous'} ${a.rating?`• ${a.rating.toFixed(1)}/5 (${a.reviews||0} avis)`:''}</p><div class="why">Sélectionné pour vous selon la distance, la qualité, l'heure et la météo.</div><div class="actions"><button class="small-btn primary" onclick="event.stopPropagation();detail('${a.id}')">Découvrir</button><button class="small-btn" onclick="event.stopPropagation();toggleSave('${a.id}')">${saved?'Sauvé':'Favori'}</button></div></div></article>`;
}
function agenda(){
  const evs = S.events || [];
  return `<section class="section"><div class="section-head"><h2 class="section-title">Agenda local</h2><span class="section-link">OpenAgenda</span></div>${evs.length?`<div class="events">${evs.slice(0,40).map(eventCard).join('')}</div>`:`<div class="empty"><strong>Aucun événement chargé</strong>Vérifiez OPENAGENDA_KEY dans Vercel ou élargissez le rayon.</div>`}</section>`;
}
function eventCard(e){
  const d = e.date ? new Date(e.date) : e.timings?.[0]?.begin ? new Date(e.timings[0].begin) : null;
  const day = d ? d.getDate() : '—';
  const title = e.ttl || (typeof e.title==='object' ? (e.title.fr||Object.values(e.title)[0]) : e.title) || 'Événement';
  const loc = e.loc || e.location?.name || e.location?.city || '';
  return `<article class="event"><div class="datebox">${day}</div><div><h3>${title}</h3><p>${loc}${e.type?` • ${e.type}`:''}${e.free?' • Gratuit':''}</p></div></article>`;
}
function saved(){
  const items = S.saved;
  return `<section class="section"><div class="section-head"><h2 class="section-title">Favoris</h2><span class="section-link">${items.length}</span></div>${items.length?`<div class="cards">${items.map(card).join('')}</div>`:`<div class="empty"><strong>Vos coups de cœur</strong>Enregistrez vos restaurants, sorties et activités préférées.</div>`}</section>`;
}
function nav(){ return `<nav class="nav"><button class="${S.tab==='discover'?'on':''}" onclick="setTab('discover')">Découvrir</button><button class="surprise" onclick="surprise()">Surprenez-moi</button><button class="${S.tab==='agenda'?'on':''}" onclick="setTab('agenda')">Agenda</button></nav>`; }
function detail(id){
  const a = S.acts.find(x=>x.id===id) || S.saved.find(x=>x.id===id); if(!a) return;
  const html = `<div class="modal" onclick="if(event.target.className==='modal')render()"><div class="sheet"><div class="sheet-hero" style="background-image:url('${img(a,1200)}')"></div><h2 class="sheet-title">${a.name}</h2><p class="card-sub">${a.address||''}</p><div class="row"><span class="chip">${CAT_LABEL[a.cat]||a.cat}</span>${a.rating?`<span class="chip">${a.rating.toFixed(1)}/5 • ${a.reviews||0} avis</span>`:''}${a.dist?`<span class="chip">${km(a.dist)}</span>`:''}${a.isOpen===true?`<span class="chip">Ouvert maintenant</span>`:''}</div><div class="why">Dolcia n'invente rien : ce lieu provient des données Google Places.</div><div class="actions"><button class="small-btn primary" onclick="window.open('https://www.google.com/maps/search/'+encodeURIComponent('${a.name.replaceAll("'","\\'")} ${a.address.replaceAll("'","\\'")}'),'_blank')">Itinéraire</button><button class="small-btn" onclick="toggleSave('${a.id}')">Favori</button></div><br><button class="ghost-btn" onclick="render()">Fermer</button></div></div>`;
  app.insertAdjacentHTML('beforeend', html);
}
function surprise(){
  const f = filtered().filter(a=>a.isOpen!==false);
  if(!f.length){ toast('Aucune activité disponible'); return; }
  const pick = f[Math.floor(Math.random()*Math.min(f.length,8))];
  detail(pick.id);
}
function setTab(t){ S.tab=t; render(); if(t==='agenda' && !S.events.length) loadAll(); }
function setCat(c){ S.cat=c; S.tab='discover'; render(); }
function toggleSave(id){
  const a = S.acts.find(x=>x.id===id) || S.saved.find(x=>x.id===id); if(!a) return;
  const i = S.saved.findIndex(x=>x.id===id);
  if(i>=0){ S.saved.splice(i,1); toast('Retiré des favoris'); } else { S.saved.push(a); toast('Ajouté aux favoris'); }
  saveStore(); render();
}
function searchText(v){
  const q = v.trim().toLowerCase();
  if(!q){ render(); return; }
  const match = Object.keys(CAT_LABEL).find(k=>CAT_LABEL[k].toLowerCase().includes(q));
  if(match) S.cat = match;
}
function openFilters(){ toast('Filtres premium bientôt disponibles'); }
function start(){ localStorage.setItem('dolcia_started','1'); S.started=true; render(); loadAll(); }
function geo(){
  if(!navigator.geolocation){ toast('Géolocalisation indisponible'); return; }
  toast('Localisation en cours');
  navigator.geolocation.getCurrentPosition(pos=>{
    S.city = {n:'Ma position', lat:pos.coords.latitude, lng:pos.coords.longitude}; render(); loadAll();
  },()=>toast('Localisation refusée'));
}
function render(){ app.innerHTML = `<div class="app">${S.started?main():intro()}</div>`; }
render(); if(S.started) loadAll();
window.start=start; window.geo=geo; window.setTab=setTab; window.setCat=setCat; window.toggleSave=toggleSave; window.detail=detail; window.surprise=surprise; window.loadAll=loadAll; window.searchText=searchText; window.openFilters=openFilters; window.render=render;
