const PROXY = '/api';
const state = {
  step: 0,
  radiusKm: 10,
  city: { name: 'Le Touquet-Paris-Plage', lat: 50.5214, lng: 1.5912 },
  answers: {},
  places: [],
  events: [],
  weather: null,
  programVariant: 0,
};

const ambience = {
  start: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
  who: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=85',
  when: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',
  duration: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1400&q=85',
  vibe: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85',
  budget: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85',
  food: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85',
  nature: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',
  culture: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=1400&q=85',
  wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85',
  festive: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1400&q=85',
  sport: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1400&q=85',
  family: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85',
  romantic: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1400&q=85',
  insolite: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85'
};

const steps = [
  {
    key: 'when', count: 'Étape 1 sur 4', title: 'Pour quel moment ?', subtitle: 'Dolcia commence par votre disponibilité. Le reste suivra naturellement.', bg: ambience.when,
    options: [
      ['now', 'Maintenant', 'Une idée prête à vivre tout de suite', ambience.start],
      ['afternoon', 'Cet après-midi', 'Une sélection adaptée à la météo du jour', ambience.nature],
      ['tonight', 'Ce soir', 'Sortie, dîner, spectacle ou programme complet', ambience.festive],
      ['weekend', 'Ce week-end', 'Deux jours composés intelligemment', ambience.insolite],
      ['custom', 'Je choisis mes dates', 'Pour un séjour ou une escapade', ambience.romantic],
    ]
  },
  {
    key: 'duration', count: 'Étape 2 sur 4', title: 'Combien de temps ?', subtitle: 'Deux heures, une journée ou plusieurs jours : Dolcia ne propose pas la même expérience.', bg: ambience.duration,
    options: [
      ['2h', 'Deux heures', 'Une parenthèse courte, efficace, bien choisie', ambience.food],
      ['halfday', 'Demi-journée', 'Deux ou trois étapes qui s’enchaînent bien', ambience.nature],
      ['day', 'Une journée', 'Matin, déjeuner, après-midi et soirée', ambience.start],
      ['3days', 'Trois jours', 'Un vrai séjour composé par Dolcia', ambience.romantic],
      ['week', 'Une semaine', 'Des idées renouvelées chaque jour', ambience.insolite],
    ]
  },
  {
    key: 'who', count: 'Étape 3 sur 4', title: 'Avec qui ?', subtitle: 'Les propositions changent totalement selon les personnes qui vivent le moment avec vous.', bg: ambience.who,
    options: [
      ['couple', 'En couple', 'Moments à deux, élégants, fluides, mémorables', ambience.romantic],
      ['family', 'En famille', 'Enfants occupés, parents sereins, timing réaliste', ambience.family],
      ['friends', 'Entre amis', 'Une énergie plus festive, plus vivante, plus spontanée', ambience.festive],
      ['solo', 'En solo', 'Découvrir, respirer, se faire plaisir sans compromis', ambience.insolite],
    ]
  },
  {
    key: 'vibe', count: 'Étape 4 sur 4', title: 'Quelle envie ?', subtitle: 'Ce n’est pas une catégorie. C’est l’ambiance du moment que vous voulez vivre.', bg: ambience.vibe,
    large: true,
    options: [
      ['food', 'Gastronomie', 'Restaurants, dégustations, marchés, expériences gourmandes', ambience.food],
      ['nature', 'Nature et balade', 'Grand air, plage, parcs, panoramas, marche', ambience.nature],
      ['culture', 'Culture', 'Expositions, patrimoine, cinéma, théâtre, événements', ambience.culture],
      ['wellness', 'Bien-être', 'Spa, détente, piscine, parenthèse calme', ambience.wellness],
      ['sport', 'Sport et loisirs', 'Golf, activités, mouvement, sensations douces', ambience.sport],
      ['festive', 'Sortir', 'Bars, soirée, casino, musique, ambiance nocturne', ambience.festive],
      ['free', 'Gratuit', 'Uniquement ce qui est indiqué gratuit ou entrée libre', ambience.insolite],
      ['surprise-base', 'Je suis ouvert', 'Dolcia pourra varier les propositions après analyse', ambience.start],
    ]
  }
];

const vibeTypes = {
  food: ['restaurant','cafe','bakery','bar'],
  nature: ['tourist_attraction','park','natural_feature','beach'],
  culture: ['museum','art_gallery','movie_theater','tourist_attraction'],
  wellness: ['spa','beauty_salon','swimming_pool'],
  sport: ['golf_course','gym','bowling_alley','amusement_park'],
  festive: ['bar','night_club','casino','restaurant'],
  free: ['tourist_attraction','park','museum','beach'],
  'surprise-base': ['restaurant','tourist_attraction','museum','park','spa','bar','movie_theater','bowling_alley']
};

const labels = {
  now:'Maintenant', afternoon:'Cet après-midi', tonight:'Ce soir', weekend:'Ce week-end', custom:'Dates libres',
  '2h':'2 heures', halfday:'Demi-journée', day:'Journée', '3days':'3 jours', week:'Semaine',
  couple:'En couple', family:'En famille', friends:'Entre amis', solo:'Solo',
  food:'Gastronomie', nature:'Nature', culture:'Culture', wellness:'Bien-être', sport:'Sport', festive:'Sortir', free:'Gratuit', 'surprise-base':'Ouvert'
};

const $ = (id) => document.getElementById(id);
const screens = ['splash','wizard','loading','results'];

function showScreen(id){ screens.forEach(s => $(s).classList.toggle('active', s === id)); }
function normalizeText(s){ return String(s || '').replace(/<[^>]*>/g,'').trim(); }
function safeRating(n){ return Number(n || 0) > 0 ? Number(n).toFixed(1) : null; }
function distanceKm(place){ return place.dist ? `${place.dist.toFixed(place.dist < 1 ? 1 : 1)} km` : ''; }

function getLocation(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    state.city.lat = pos.coords.latitude;
    state.city.lng = pos.coords.longitude;
    state.city.name = 'Autour de vous';
  }, () => {}, { enableHighAccuracy:false, timeout:5000 });
}

function renderStep(){
  const s = steps[state.step];
  $('wizardBg').style.backgroundImage = `url('${s.bg}')`;
  $('stepCount').textContent = s.count;
  $('stepTitle').textContent = s.title;
  $('stepSubtitle').textContent = s.subtitle;
  $('progressFill').style.width = `${((state.step + 1) / steps.length) * 100}%`;
  $('backBtn').style.visibility = state.step === 0 ? 'hidden' : 'visible';
  $('options').innerHTML = s.options.map(o => {
    const selected = state.answers[s.key] === o[0];
    return `<article class="option-card ${s.large ? 'large' : ''} ${selected ? 'selected' : ''}" data-choice="${o[0]}">
      <div class="option-photo" style="background-image:url('${o[3]}')"></div>
      <div class="option-shade"></div>
      <div class="option-content">
        <div><div class="option-title">${o[1]}</div><div class="option-sub">${o[2]}</div></div>
        <div class="option-check"></div>
      </div>
    </article>`;
  }).join('');
}

function selectOption(value){
  const s = steps[state.step];
  state.answers[s.key] = value;
  renderStep();
  setTimeout(() => {
    if(state.step < steps.length - 1){ state.step++; renderStep(); }
    else loadExperience();
  }, 240);
}

function typesForAnswers(){
  let types = vibeTypes[state.answers.vibe] || vibeTypes['surprise-base'];
  if(state.answers.who === 'family') types = types.filter(t => !['bar','night_club','casino'].includes(t)).concat(['amusement_park','park','movie_theater']);
  if(state.answers.vibe === 'free') types = ['tourist_attraction','park','museum','beach'];
  return [...new Set(types)].slice(0, 8);
}

async function fetchJson(url){
  const r = await fetch(url);
  const d = await r.json().catch(() => ({}));
  if(!r.ok) throw new Error(d.error || d.message || `Erreur ${r.status}`);
  return d;
}

async function loadExperience(){
  showScreen('loading');
  state.places = []; state.events = []; state.weather = null;
  const {lat,lng} = state.city;
  const radius = state.radiusKm * 1000;
  try{
    const weatherP = fetchJson(`${PROXY}/weather?lat=${lat}&lng=${lng}`).then(d => state.weather = d).catch(() => null);
    const eventsP = fetchJson(`${PROXY}/events?lat=${lat}&lng=${lng}&radius=${state.radiusKm}&size=100`).then(d => state.events = d.events || d.data || []).catch(() => []);
    const placesP = Promise.all(typesForAnswers().map(t => fetchJson(`${PROXY}/places?lat=${lat}&lng=${lng}&radius=${radius}&type=${encodeURIComponent(t)}`).catch(() => ({results:[]}))));
    const placesResults = await placesP;
    await Promise.all([weatherP, eventsP]);
    state.places = normalizePlaces(placesResults.flatMap(d => d.results || []));
    renderResults();
    showScreen('results');
  }catch(e){
    renderFailure(e.message);
    showScreen('results');
  }
}

function normalizePlaces(raw){
  const seen = new Set();
  return raw.filter(p => p && p.place_id && !seen.has(p.place_id) && seen.add(p.place_id)).map(p => {
    const loc = p.geometry?.location || {};
    const dist = loc.lat ? haversine(state.city.lat,state.city.lng,loc.lat,loc.lng) : null;
    const priceN = typeof p.price_level === 'number' ? p.price_level : null;
    const photoRef = p.photos?.[0]?.photo_reference || null;
    const open = p.opening_hours?.open_now;
    return {
      id: p.place_id,
      name: p.name,
      address: p.vicinity || p.formatted_address || '',
      types: p.types || [],
      rating: p.rating || null,
      reviews: p.user_ratings_total || 0,
      priceN,
      open,
      dist,
      photoRef,
      lat: loc.lat,
      lng: loc.lng,
      source: 'Google Places'
    };
  }).filter(p => p.name).sort((a,b) => scorePlace(b) - scorePlace(a)).slice(0, 40);
}

function haversine(lat1,lon1,lat2,lon2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function scorePlace(p){
  let s = 40;
  if(p.open === true) s += 18;
  if(p.rating) s += p.rating * 8;
  if(p.reviews > 80) s += 8;
  if(p.dist != null && p.dist < 2) s += 8;
  if(state.answers.vibe === 'free' && p.priceN === 0) s += 30;
  if(state.answers.vibe === 'free' && p.priceN && p.priceN > 0) s -= 50;
  if(state.answers.who === 'family' && p.types.some(t => ['bar','night_club','casino'].includes(t))) s -= 100;
  return s;
}

function photoUrl(p, max=900){
  if(p.photoRef) return `${PROXY}/photo?ref=${encodeURIComponent(p.photoRef)}&maxwidth=${max}`;
  return '';
}

function renderResults(){
  const a = state.answers;
  $('resultsHeroPhoto').style.backgroundImage = `url('${ambience[a.vibe] || ambience.start}')`;
  $('resultsTitle').textContent = titleForResults();
  $('resultsSummary').textContent = summaryForResults();
  $('criteriaLine').innerHTML = [a.when,a.duration,a.who,a.vibe].map(x => `<span>${labels[x] || x}</span>`).join('');
  renderProgram(); renderCards(); renderEvents();
}

function titleForResults(){
  const a = state.answers;
  if(a.duration === '3days') return 'Votre séjour peut commencer.';
  if(a.when === 'tonight') return 'Votre soirée se dessine.';
  if(a.vibe === 'free') return 'Sortir sans dépenser.';
  return 'Vos prochaines émotions commencent ici.';
}
function summaryForResults(){
  const temp = state.weather?.main?.temp ? `${Math.round(state.weather.main.temp)}°` : 'météo actuelle';
  return `Sélection réelle autour de ${state.city.name}, adaptée à ${labels[state.answers.who]?.toLowerCase()}, ${labels[state.answers.duration]?.toLowerCase()} et ${temp}.`;
}

function renderProgram(){
  const places = state.places.slice();
  if(!places.length){ $('programSection').innerHTML = ''; return; }
  const count = state.answers.duration === '2h' ? 1 : state.answers.duration === 'halfday' ? 3 : state.answers.duration === '3days' ? 6 : 4;
  const offset = state.programVariant % Math.max(1, Math.min(places.length, 8));
  const picks = [...places.slice(offset), ...places.slice(0, offset)].slice(0, count);
  const slots = labelsForSlots(count);
  $('programSection').innerHTML = `<h3 class="section-title">Programme proposé</h3><div class="program-card"><div class="program-title">Une composition Dolcia, sans donnée inventée</div><div class="timeline">${picks.map((p,i)=>`<div class="timeline-item" data-open="${p.id}"><div class="time">${slots[i]}</div><div><h4>${p.name}</h4><p>${distanceKm(p)} ${p.rating ? `- note ${safeRating(p.rating)}/5` : ''} - ${p.source}</p></div></div>`).join('')}</div></div>`;
}
function labelsForSlots(count){
  if(count===1) return ['Maint.'];
  if(count===3) return ['Début','Pause','Suite'];
  if(count===6) return ['Jour 1','Soir 1','Jour 2','Soir 2','Jour 3','Final'];
  return ['Matin','Midi','Après-midi','Soir'];
}

function whyText(p){
  const parts=[];
  if(p.open === true) parts.push('ouvert actuellement');
  if(p.rating) parts.push(`noté ${safeRating(p.rating)}/5`);
  if(p.dist != null) parts.push(`à ${distanceKm(p)}`);
  if(state.weather?.weather?.[0]?.main === 'Rain') parts.push('utile par temps de pluie si l’activité est intérieure');
  if(!parts.length) parts.push('sélectionné depuis Google Places selon vos critères');
  return parts.join(', ') + '.';
}

function renderCards(){
  if(!state.places.length){
    $('cardsSection').innerHTML = `<div class="empty-state"><h3>Aucune activité réelle n'a remonté.</h3><p>Dolcia n'invente rien. Vérifiez les variables Vercel GOOGLE_KEY, les fichiers api/places.js et votre quota Google Places, ou cliquez sur Élargir.</p></div>`;
    return;
  }
  $('cardsSection').innerHTML = `<h3 class="section-title">Toutes les possibilités</h3>` + state.places.slice(0,18).map(p => {
    const img = photoUrl(p);
    const bg = img ? `background-image:url('${img}')` : `background:linear-gradient(135deg,#171720,#0b0b10)`;
    return `<article class="activity-card" data-open="${p.id}">
      <div class="activity-photo" style="${bg}"></div><div class="activity-gradient"></div>
      <div class="activity-body">
        <div class="badge-row">
          <span class="badge gold">${p.source}</span>${p.open===true?'<span class="badge">Ouvert</span>':''}${p.rating?`<span class="badge">${safeRating(p.rating)}/5</span>`:''}${p.dist?`<span class="badge">${distanceKm(p)}</span>`:''}
        </div>
        <h3 class="activity-title">${p.name}</h3>
        <p class="why">${whyText(p)}</p>
        <div class="card-actions"><button class="primary" data-open="${p.id}">Découvrir</button><a class="muted" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + p.address)}">Itinéraire</a></div>
      </div>
    </article>`;
  }).join('');
}

function normalizeEvent(ev){
  const title = normalizeText(ev.ttl || ev.title || ev.name || 'Événement');
  const loc = normalizeText(ev.loc || ev.location?.name || ev.location?.city || '');
  const date = ev.date || ev.time || ev.timings?.[0]?.begin || null;
  const free = ev.free || JSON.stringify(ev).toLowerCase().includes('gratuit') || JSON.stringify(ev).toLowerCase().includes('entrée libre');
  return {title,loc,date,free,type:ev.type || 'Événement local'};
}
function renderEvents(){
  const events = (state.events || []).map(normalizeEvent).filter(e => e.title).slice(0,12);
  if(!events.length){ $('eventsSection').innerHTML = ''; return; }
  $('eventsSection').innerHTML = `<h3 class="section-title">Événements réels à proximité</h3><div class="events-grid">${events.map(e=>`<article class="event-chip"><p class="eyebrow">${e.type}</p><h4>${e.title}</h4><p>${e.loc || ''}</p><p>${e.date ? new Date(e.date).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''} ${e.free ? '- Gratuit' : ''}</p></article>`).join('')}</div>`;
}

function openDetail(id){
  const p = state.places.find(x => x.id === id); if(!p) return;
  const img = photoUrl(p, 1200);
  $('detailContent').innerHTML = `<div class="detail-hero" style="${img ? `background-image:url('${img}')` : 'background:linear-gradient(135deg,#171720,#07070a)'}"></div>
    <div class="detail-info"><p class="eyebrow">${p.source}</p><h2>${p.name}</h2><p>${whyText(p)}</p><div class="detail-sheet"><p>${p.address || 'Adresse non fournie par Google Places.'}</p><p>${p.rating ? `Note Google : ${safeRating(p.rating)}/5 (${p.reviews || 0} avis).` : 'Note non fournie.'}</p><p>${p.open === true ? 'Ouvert actuellement.' : p.open === false ? 'Fermé actuellement selon Google.' : 'Horaire actuel non fourni.'}</p></div></div>
    <div class="fixed-bar"><a class="primary" style="text-decoration:none;flex:1;text-align:center;border-radius:16px;padding:15px;color:#090704" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + p.address)}">Ouvrir dans Maps</a></div>`;
  $('detail').classList.add('active');
}

function renderFailure(msg){
  $('resultsHeroPhoto').style.backgroundImage = `url('${ambience.start}')`;
  $('resultsTitle').textContent = 'Connexion aux activités impossible.';
  $('resultsSummary').textContent = 'Dolcia n’invente aucune donnée : tant que Google Places ne répond pas, nous affichons cette alerte.';
  $('criteriaLine').innerHTML = '';
  $('programSection').innerHTML = '';
  $('cardsSection').innerHTML = `<div class="empty-state"><h3>Erreur de chargement</h3><p>${msg || 'Vérifiez Vercel et les variables API.'}</p></div>`;
  $('eventsSection').innerHTML = '';
}

function restart(){ state.step=0; state.answers={}; state.programVariant=0; renderStep(); showScreen('wizard'); }

window.addEventListener('DOMContentLoaded', () => {
  getLocation();
  $('startBtn').addEventListener('click', () => { renderStep(); showScreen('wizard'); });
  $('backBtn').addEventListener('click', () => { if(state.step>0){state.step--; renderStep();} });
  $('skipBtn').addEventListener('click', () => loadExperience());
  $('options').addEventListener('click', e => { const card=e.target.closest('[data-choice]'); if(card) selectOption(card.dataset.choice); });
  $('restartBtn').addEventListener('click', restart);
  $('expandBtn').addEventListener('click', () => { state.radiusKm = Math.min(50, state.radiusKm + 10); loadExperience(); });
  $('surpriseBtn').addEventListener('click', () => { state.programVariant++; renderProgram(); window.scrollTo({top:0,behavior:'smooth'}); });
  document.body.addEventListener('click', e => { const o=e.target.closest('[data-open]'); if(o) openDetail(o.dataset.open); });
  $('detailClose').addEventListener('click', () => $('detail').classList.remove('active'));
});
