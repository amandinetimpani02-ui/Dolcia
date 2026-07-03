
var S={city:{n:'Le Touquet-Paris-Plage',lat:50.5214,lng:1.5912},radius:5,cat:'all',moment:'now',weather:null,acts:[],events:null,saved:[],live:false,loading:true,loadError:false,step:0,ans:{}};
var PROXY='https://dolcia.vercel.app/api';
var SUPA_URL='https://tfbfbducqnpugajdnmdk.supabase.co';
var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYmZiZHVjcW5wdWdhamRubWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTQ4NzUsImV4cCI6MjA5NTk3MDg3NX0.3QDzbrTOhpb5p8rMvelDshEsb9d_So8F7Rz1XjwBBms';

var IMGS={beach:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',restaurant:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',spa:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80',night_club:'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=900&q=80',casino:'https://images.unsplash.com/photo-1563941406054-949cc56e6b72?w=900&q=80',museum:'https://images.unsplash.com/photo-1555921015-5532091f6026?w=900&q=80',park:'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&q=80',golf_course:'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=900&q=80',bar:'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=80',cafe:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&q=80',movie_theater:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&q=80',bowling_alley:'https://images.unsplash.com/photo-1545451092-8d4abbd4e023?w=900&q=80',swimming_pool:'https://images.unsplash.com/photo-1508578427060-72f870c6cc5c?w=900&q=80',natural_feature:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',gym:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',lodging:'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80'};
var CI={beach:'Plage & Nature',park:'Nature',spa:'Spa & Bien-\u00eatre',restaurant:'Gastronomie',cafe:'Caf\u00e9',bar:'Bar & Cocktails',night_club:'Soir\u00e9e',casino:'Casino',movie_theater:'Cin\u00e9ma',museum:'Culture',art_gallery:'Art',amusement_park:'Loisirs',swimming_pool:'Piscine',golf_course:'Golf',gym:'Sport',bowling_alley:'Bowling',natural_feature:'Panorama',tourist_attraction:'Tourisme',lodging:'H\u00e9bergement'};
var CATS=[{id:'all',l:'Pour vous'},{id:'lodging',l:'H\u00e9bergement'},{id:'restaurant',l:'Gastronomie'},{id:'beach',l:'Plage'},{id:'spa',l:'Spa'},{id:'museum',l:'Culture'},{id:'bar',l:'Bar'},{id:'night_club',l:'Soir\u00e9e'},{id:'casino',l:'Casino'},{id:'movie_theater',l:'Cin\u00e9ma'},{id:'park',l:'Nature'},{id:'gym',l:'Sport'},{id:'swimming_pool',l:'Piscine'},{id:'golf_course',l:'Golf'},{id:'cafe',l:'Caf\u00e9'},{id:'bowling_alley',l:'Bowling'}];

function H(){return new Date().getHours();}
function ds(d){return d<1?(Math.round(d*10)/10*1000)+'m':d.toFixed(1)+'km';}
function cbg(c){var m={beach:'linear-gradient(135deg,#1a5276,#2980b9)',spa:'linear-gradient(135deg,#1a2a4a,#2e4d7a)',restaurant:'linear-gradient(135deg,#2c1810,#8b3a0f)',cafe:'linear-gradient(135deg,#2c1a0a,#6b4010)',bar:'linear-gradient(135deg,#1a0a2a,#4a1070)',night_club:'linear-gradient(135deg,#0a0a1a,#1a0a40)',casino:'linear-gradient(135deg,#0a1a0a,#0a3a0a)',museum:'linear-gradient(135deg,#1a1a0a,#3a3a1a)',movie_theater:'linear-gradient(135deg,#1a0a0a,#3a0a0a)',park:'linear-gradient(135deg,#0a1a0a,#1a3a0a)',golf_course:'linear-gradient(135deg,#0a1a0a,#1a3a0a)',amusement_park:'linear-gradient(135deg,#1a0a1a,#3a1a0a)',swimming_pool:'linear-gradient(135deg,#0a1a2a,#0a2a3a)',natural_feature:'linear-gradient(135deg,#1a0a00,#5E2A00)',bowling_alley:'linear-gradient(135deg,#1a0a1a,#2a0a2a)',gym:'linear-gradient(135deg,#0a0a1a,#1a1a3a)'};return m[c]||'linear-gradient(135deg,#111,#1a1a1a)';}
function snack(msg){var el=document.getElementById('snack');if(!el)return;el.textContent=msg;el.classList.add('on');setTimeout(function(){el.classList.remove('on');},2400);}
function show(id){['splash','onb','home'].forEach(function(s){var e=document.getElementById(s);if(!e)return;e.style.display=s===id?'flex':'none';e.classList.toggle('active',s===id);});}
function goOnb(){S.step=0;S.ans={};show('onb');setTimeout(renderOnb,50);}

function goHome(){
  show('home');
  S.loading=true;S.loadError=false;
  renderHome();
  loadActs();
}

function doGeo(){
  var sub=document.getElementById('sp-sub');if(sub)sub.textContent='Localisation en cours...';
  if(!navigator.geolocation){goOnb();return;}
  navigator.geolocation.getCurrentPosition(function(pos){
    S.city={lat:pos.coords.latitude,lng:pos.coords.longitude,n:'Ma position'};
    fetch('https://nominatim.openstreetmap.org/reverse?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&format=json')
      .then(function(r){return r.json();}).then(function(d){
        var name=(d.address&&(d.address.city||d.address.town||d.address.village))||'Ma position';
        S.city.n=name;
        var el=document.getElementById('sp-city');if(el)el.textContent=name;
        var hc=document.getElementById('hdr-city');if(hc)hc.textContent=name.substring(0,16);
        if(sub)sub.textContent='\u2713 Localis\u00e9';
      }).catch(function(){goOnb();});
  },function(){goOnb();});
}

var ONB=[
  {key:'dates',sn:'\u00c9tape 1 de 4',q:'Pour quand\u00a0?',cal:true,bg:IMGS.beach},
  {key:'who',sn:'\u00c9tape 2 de 4',q:'Vous \u00eates combien\u00a0?',bg:IMGS.restaurant,opts:[
    {id:'couple',l:'En couple',s:'2 personnes'},
    {id:'famille',l:'En famille',s:'Avec enfants'},
    {id:'amis',l:'Entre amis',s:'Groupe'},
    {id:'solo',l:'Solo',s:'Pour soi'}
  ]},
  {key:'vibe',sn:'\u00c9tape 3 de 4',q:'Quelle envie\u00a0?',bg:IMGS.spa,opts:[
    {id:'outdoor',l:'Plein air',s:'Nature & Sport'},
    {id:'chill',l:'D\u00e9tente',s:'Spa & Bien-\u00eatre'},
    {id:'food',l:'Gastronomie',s:'Manger bien'},
    {id:'party',l:'Soir\u00e9e',s:'Bar & Club'}
  ]},
  {key:'budget',sn:'\u00c9tape 4 de 4',q:'Votre budget\u00a0?',bg:IMGS.night_club,opts:[
    {id:'free',l:'Gratuit',s:'Activit\u00e9s sans frais'},
    {id:'low',l:'Raisonnable',s:'Moins de 30\u20ac / activit\u00e9'},
    {id:'mid',l:'Confort',s:'30 \u00e0 80\u20ac / activit\u00e9'},
    {id:'high',l:'Premium',s:'Budget illimit\u00e9'}
  ]}
];

// CALENDRIER
var CAL={y:new Date().getFullYear(),m:new Date().getMonth(),s:null,e:null};
var MOIS=['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre'];
var JOURS=['Lu','Ma','Me','Je','Ve','Sa','Di'];

var _onbActiveLayer=1;
function crossfadeOnbBg(url){
  if(!url)return;
  var showId=_onbActiveLayer===1?'onb-bg1':'onb-bg2';
  var hideId=_onbActiveLayer===1?'onb-bg2':'onb-bg1';
  var show=document.getElementById(showId),hide=document.getElementById(hideId);
  if(show){show.style.backgroundImage='url("'+url+'")';requestAnimationFrame(function(){show.classList.add('on');});}
  if(hide)hide.classList.remove('on');
  _onbActiveLayer=_onbActiveLayer===1?2:1;
}

function renderOnb(){
  var step=ONB[S.step];if(!step)return;
  crossfadeOnbBg(step.bg);
  var wrapEl=document.getElementById('onb-wrap');if(wrapEl)wrapEl.classList.toggle('onb-compact',!!step.cal);
  var prog=document.getElementById('onb-prog');
  if(prog)prog.innerHTML=ONB.map(function(_,i){return'<div class="onb-prog-dot'+(i<=S.step?' on':'')+'"></div>';}).join('');
  var sn=document.getElementById('onb-sn');if(sn)sn.textContent=step.sn;
  var q=document.getElementById('onb-q');
  if(q){q.style.opacity='0';q.style.transform='translateY(10px)';q.innerHTML=(step.q||'').split('\n').join('<br>');
    setTimeout(function(){q.style.transition='all .3s var(--ease)';q.style.opacity='1';q.style.transform='none';},20);}
  var grid=document.getElementById('onb-grid');if(!grid)return;
  grid.style.opacity='0';
  if(step.cal){
    grid.innerHTML='<div id="cal-inner"></div>';
    setTimeout(function(){renderCal();grid.style.transition='opacity .3s .1s';grid.style.opacity='1';},20);
  } else {
    grid.innerHTML=step.opts.map(function(o){
      var sel=S.ans[step.key]===o.id;
      return'<div class="onb-opt'+(sel?' sel':'')+'" data-action="onb-pick" data-key="'+step.key+'" data-val="'+o.id+'">'
        +'<div class="onb-opt-txt"><div class="onb-opt-l">'+o.l+'</div><div class="onb-opt-s">'+o.s+'</div></div>'
        +'<div class="onb-opt-chk">'+(sel?'&#10003;':'')+'</div></div>';
    }).join('');
    setTimeout(function(){grid.style.transition='opacity .3s .1s';grid.style.opacity='1';},20);
  }
}

function renderCal(){
  var el=document.getElementById('cal-inner');if(!el)return;
  var now=new Date(),y=CAL.y,m=CAL.m;
  var first=new Date(y,m,1).getDay();first=(first+6)%7;
  var dim=new Date(y,m+1,0).getDate();
  var td=now.getDate(),tm=now.getMonth(),ty=now.getFullYear();
  function fd(d){if(!d)return null;var p=function(n){return String(n).padStart(2,'0');};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());}
  function cellCls(day){
    var d=new Date(y,m,day),dd=fd(d),ds=fd(CAL.s),de=fd(CAL.e);
    var cls='cal-cell';
    var past=new Date(ty,tm,td);past.setHours(0,0,0,0);
    if(d<past)return cls+' past';
    if(day===td&&m===tm&&y===ty)cls+=' today';
    if(ds&&de){if(dd===ds&&dd===de)cls+=' sel-s sel-e';else if(dd===ds)cls+=' sel-s';else if(dd===de)cls+=' sel-e';else if(dd>ds&&dd<de)cls+=' sel-r';}
    else if(ds&&!de&&dd===ds)cls+=' sel-s sel-e';
    return cls;
  }
  var info='Choisissez votre date d\'arriv\u00e9e';
  if(CAL.s&&!CAL.e)info='Choisissez votre date de d\u00e9part (ou tapez la m\u00eame pour 1 jour)';
  if(CAL.s&&CAL.e){var diff=Math.round((CAL.e-CAL.s)/(86400000));var opt={day:'numeric',month:'long'};info=CAL.s.toLocaleDateString('fr-FR',opt)+(diff>0?' \u2192 '+CAL.e.toLocaleDateString('fr-FR',opt)+' \u00b7 '+diff+' jour'+(diff>1?'s':''):'');}
  var html='<div class="cal-nav"><div class="cal-nav-btn" onclick="calNav(-1)">&#8249;</div>'
    +'<div class="cal-month-lbl">'+MOIS[m]+' '+y+'</div>'
    +'<div class="cal-nav-btn" onclick="calNav(1)">&#8250;</div></div>'
    +'<div class="cal-days-hdr">'+JOURS.map(function(j){return'<div class="cal-day-lbl">'+j+'</div>';}).join('')+'</div>'
    +'<div class="cal-grid">';
  for(var i=0;i<first;i++)html+='<div class="cal-cell empty"></div>';
  for(var d=1;d<=dim;d++)html+='<div class="'+cellCls(d)+'" onclick="calClick('+d+')">'+d+'</div>';
  html+='</div><div class="cal-info">'+info+'</div>'
    +'<button class="cal-cta'+(CAL.s?' rdy':'')+'" onclick="calOk()">Continuer \u2192</button>';
  el.innerHTML=html;
}

function calNav(dir){CAL.m+=dir;if(CAL.m>11){CAL.m=0;CAL.y++;}if(CAL.m<0){CAL.m=11;CAL.y--;}renderCal();}

function calClick(day){
  var d=new Date(CAL.y,CAL.m,day);
  var now=new Date();now.setHours(0,0,0,0);if(d<now)return;
  if(!CAL.s||CAL.e){CAL.s=d;CAL.e=null;}
  else if(d<=CAL.s){CAL.s=d;CAL.e=null;}
  else CAL.e=d;
  renderCal();
}

function calOk(){
  if(!CAL.s)return;
  var end=CAL.e||CAL.s;
  var diff=Math.round((end-CAL.s)/86400000);
  S.ans.dateFrom=CAL.s.toISOString().split('T')[0];
  S.ans.dateTo=end.toISOString().split('T')[0];
  S.ans.vacDays=diff;
  if(diff===0)S.ans.duration='day';
  else if(diff<=2)S.ans.duration='weekend';
  else S.ans.duration='vacation';
  S.selectedDate=S.ans.dateFrom;S.moment='custom';
  advanceOnb();
}

function advanceOnb(){
  var wrap=document.getElementById('onb-wrap');
  if(wrap){
    wrap.style.transition='opacity .18s';wrap.style.opacity='0';
    setTimeout(function(){S.step++;if(S.step>=ONB.length){goHome();}else{renderOnb();wrap.style.opacity='1';wrap.style.transition='opacity .22s';}},180);
  } else {S.step++;if(S.step>=ONB.length)goHome();else renderOnb();}
}

function nextStep(){advanceOnb();}

function isOpen(cat,h){var hrs=CAT_HOURS[cat];if(!hrs)return true;var o=hrs[0],c=hrs[1];return c>o?(h>=o&&h<c):(h>=o||h<c);}
function hFor(m){var h=H();if(m==='tonight')return 20;if(m==='tomorrow')return 10;if(m==='weekend')return 11;if(m==='halfday')return 14;return h;}

// Categories STRICTEMENT associees a chaque vibe
var VIBE_CATS={
  outdoor:['beach','park','natural_feature','golf_course','gym','tourist_attraction'],
  chill:['spa','cafe','museum','art_gallery','movie_theater','swimming_pool','library'],
  food:['restaurant','cafe','bar'],
  party:['bar','night_club','casino','bowling_alley','movie_theater']
};

// Categories EXCLUES par vibe
var VIBE_EXCL={
  outdoor:['spa','casino','night_club','movie_theater','bowling_alley','museum'],
  chill:['beach','park','natural_feature','golf_course','gym','night_club','casino'],
  food:['beach','park','natural_feature','golf_course','gym','spa','museum','night_club','casino','bowling_alley','movie_theater','swimming_pool'],
  party:['beach','park','natural_feature','golf_course','gym','spa','museum','swimming_pool']
};

// Categories EXCLUES par profil
var WHO_EXCL={
  famille:['bar','night_club','casino'],
  couple:[],
  amis:[],
  solo:[],
  all:[]
};

// FIX CRITIQUE : ces objets etaient reference dans score()/isOpen() sans etre definis nulle part
// -> ReferenceError garantie des qu'un scoring etait tente (ecran "Pour vous" casse).
// Regles 100% GENERIQUES par categorie Google Places universelle. AUCUNE donnee de lieu.
// Fonctionne a l'identique pour Le Touquet, Deauville, Paris, ou tout rayon 5/10/20/50km.
var CAT_HOURS={}; // pas d'horaires fictifs invente — isOpen() reste neutre, seul isOpen reel (Google) filtre deja
var MOMENT_BAD={
  now:[],
  tonight:['museum','golf_course','gym','park','swimming_pool'], // generalement fermes/peu adaptes le soir
  tomorrow:[],
  weekend:[],
  halfday:[]
};
var MOMENT_OK={
  now:[],
  tonight:['restaurant','bar','casino','night_club','movie_theater'],
  tomorrow:['museum','park','beach','golf_course','natural_feature','tourist_attraction'],
  weekend:['beach','golf_course','museum','restaurant','natural_feature'],
  halfday:['spa','museum','restaurant','cafe']
};
var WHO_BEST={
  famille:['amusement_park','beach','bowling_alley','movie_theater','swimming_pool','park'],
  couple:['restaurant','spa','natural_feature','casino','museum'],
  amis:['bar','bowling_alley','casino','night_club'],
  solo:['museum','park','beach','natural_feature','spa'],
  all:[]
};

// BUDGET — filtrage strict selon le PDF de reference v9
// Gratuit = priceN 0 uniquement. Raisonnable = max niveau 1 (~30e), exclut categories intrinsequement cheres.
// Confort = max niveau 2 (~80e). Premium = aucun filtre.
var BUDGET_MAXLVL={free:0,low:1,mid:2,high:99};
var BUDGET_EXPENSIVE_CATS=['spa','golf_course']; // toujours chers, exclus meme sans priceN connu en dessous de Confort
function budgetAllows(a,budget){
  if(!budget||budget==='high')return true;
  var maxLvl=BUDGET_MAXLVL[budget];
  if(maxLvl===undefined)return true;
  if(budget==='free')return a.priceN===0;
  if(BUDGET_EXPENSIVE_CATS.indexOf(a.cat)>=0&&maxLvl<2)return false;
  if(a.priceN===undefined||a.priceN===null||a.priceN<0)return true;
  return a.priceN<=maxLvl;
}

function score(a){
  var h=H(),hc=hFor(S.moment),w=S.weather,main=w?w.weather[0].main:null,temp=w?w.main.temp:15;
  var rain=['Rain','Drizzle','Thunderstorm'].indexOf(main)>=0;
  var moment=S.moment,who=S.ans.who||'all',vibe=S.ans.vibe||'',budget=S.ans.budget||'';
  // Sur plusieurs jours (weekend/vacances), l'envie devient une PREFERENCE et non une exclusion :
  // un sejour de 2 jours a besoin d'hebergement + restos + activites variees, pas d'une seule categorie.
  var multiDay=(S.ans.vacDays||0)>=1;

  // EXCLUSIONS ABSOLUES
  if(a.isOpen===false)return 0;
  if(!isOpen(a.cat,hc))return 0;
  if((MOMENT_BAD[moment]||[]).indexOf(a.cat)>=0)return 0;

  // EXCLUSION PAR VIBE - stricte uniquement pour une envie ponctuelle (pas sur un sejour multi-jours)
  if(!multiDay&&vibe&&VIBE_EXCL[vibe]&&VIBE_EXCL[vibe].indexOf(a.cat)>=0)return 0;

  // EXCLUSION PAR PROFIL
  if(who&&WHO_EXCL[who]&&WHO_EXCL[who].indexOf(a.cat)>=0)return 0;

  // EXCLUSION PAR BUDGET
  if(budget&&!budgetAllows(a,budget))return 0;

  // EXCLUSION METEO stricte
  if(rain&&['beach','park','natural_feature','golf_course'].indexOf(a.cat)>=0&&vibe==='outdoor'&&!multiDay)return 0;

  var s=50;

  // BONUS moment
  if((MOMENT_OK[moment]||[]).indexOf(a.cat)>=0)s+=20;
  if(a.isOpen===true)s+=12;

  // BONUS vibe (preference, meme sur sejour multi-jours) / PENALITE souple si hors-vibe sur sejour multi-jours
  if(vibe&&VIBE_CATS[vibe]&&VIBE_CATS[vibe].indexOf(a.cat)>=0)s+=25;
  else if(multiDay&&vibe&&VIBE_EXCL[vibe]&&VIBE_EXCL[vibe].indexOf(a.cat)>=0)s-=15;

  // Hebergement : toujours pertinent sur un sejour de plusieurs jours, jamais exclu par l'envie
  if(a.cat==='lodging'&&multiDay)s+=30;

  // BONUS profil
  if((WHO_BEST[who]||[]).indexOf(a.cat)>=0)s+=15;

  // BONUS budget: recompense les activites gratuites quand budget serre
  if((budget==='free'||budget==='low')&&a.priceN===0)s+=10;

  // BONUS meteo positif
  if(!rain&&temp>20&&['beach','park','natural_feature'].indexOf(a.cat)>=0)s+=18;
  if(rain&&['spa','museum','movie_theater','casino','swimming_pool','bowling_alley','restaurant','cafe'].indexOf(a.cat)>=0)s+=15;
  if(temp<12&&['spa','restaurant','cafe','museum','movie_theater'].indexOf(a.cat)>=0)s+=8;

  // BONUS heure
  if(h>=18&&h<=21&&main==='Clear'&&['natural_feature','beach'].indexOf(a.cat)>=0)s+=25;
  if(h>=12&&h<=14&&['restaurant','cafe'].indexOf(a.cat)>=0)s+=12;
  if(h>=19&&h<=22&&a.cat==='restaurant')s+=12;
  if(h>=21&&['bar','casino','night_club'].indexOf(a.cat)>=0)s+=12;

  // BONUS qualite
  var r=a.rating||0;
  if(r>=4.8)s+=12;else if(r>=4.5)s+=7;else if(r>=4.0)s+=3;else if(r>0&&r<3.5)s-=10;

  // PLAFOND par categorie
  var CAP={cafe:75,bar:80,bowling_alley:78,museum:82,art_gallery:80};
  if(CAP[a.cat]&&s>CAP[a.cat])s=CAP[a.cat];

  return Math.max(1,Math.min(100,Math.round(s)));
}

function getFiltered(){
  var CG={restaurant:['restaurant','meal_takeaway','bakery'],beach:['beach'],spa:['spa','beauty_salon'],park:['park'],museum:['museum','art_gallery'],bar:['bar'],night_club:['night_club'],gym:['gym'],amusement_park:['amusement_park','zoo','aquarium'],swimming_pool:['swimming_pool'],casino:['casino'],movie_theater:['movie_theater'],cafe:['cafe','bakery'],golf_course:['golf_course'],natural_feature:['natural_feature'],bowling_alley:['bowling_alley'],lodging:['lodging']};
  var all=S.acts;
  var budget=S.ans.budget||'';
  if(budget)all=all.filter(function(a){return budgetAllows(a,budget);});
  if(S.cat!=='all'){
    var g=CG[S.cat]||[S.cat];
    var filtered=all.filter(function(a){
      if(a.isOpen===false)return false;
      var ok=g.indexOf(a.cat)>=0;
      if(!ok&&a.types)for(var i=0;i<g.length;i++)if(a.types.indexOf(g[i])>=0){ok=true;break;}
      return ok;
    }).map(function(a){
      var s=50+(a.isOpen===true?15:0)+Math.round((a.rating||3.5)*8)+(a.dist<0.5?10:a.dist<1?5:0)+(a.priceN===0?8:0);
      return Object.assign({},a,{score:Math.min(99,s)});
    }).sort(function(a,b){return b.score-a.score;});
    return filtered;
  }
  // Pour vous - scoring complet, jamais vide
  var scored=all.map(function(a){return Object.assign({},a,{score:score(a)});}).filter(function(a){return a.score>0;}).sort(function(a,b){return b.score-a.score;});
  if(!scored.length)scored=all.map(function(a){return Object.assign({},a,{score:Math.round((a.rating||3.5)*15)});}).sort(function(a,b){return b.score-a.score;});
  return scored;
}

function getSuggestions(a){
  var LINKS={beach:['restaurant','bar','cafe','natural_feature'],natural_feature:['bar','restaurant','cafe','beach'],park:['cafe','restaurant','gym'],golf_course:['restaurant','spa','bar'],spa:['restaurant','cafe','natural_feature'],museum:['cafe','restaurant','bar'],casino:['restaurant','bar','night_club'],restaurant:['bar','casino','movie_theater','natural_feature'],cafe:['museum','park','natural_feature'],bar:['restaurant','casino','night_club'],movie_theater:['restaurant','cafe','bar'],swimming_pool:['restaurant','spa','cafe'],bowling_alley:['bar','restaurant','cafe'],gym:['cafe','restaurant','spa']};
  var LLBLS={beach:{restaurant:'Manger sur la plage',bar:'Verre avec vue mer',cafe:'Pause caf\u00e9',natural_feature:'Coucher de soleil apr\u00e8s'},natural_feature:{bar:'Verre avec la vue',restaurant:'D\u00eener panoramique',cafe:'Caf\u00e9 panoramique',beach:'Descendre sur la plage'},park:{cafe:'Pause caf\u00e9',restaurant:'D\u00e9jeuner apr\u00e8s',gym:'Continuer le sport'},golf_course:{restaurant:'D\u00e9jeuner au club',spa:'Spa apr\u00e8s l\u2019effort',bar:'Verre apr\u00e8s'},spa:{restaurant:'D\u00eener l\u00e9ger apr\u00e8s',cafe:'Th\u00e9 apr\u00e8s le soin',natural_feature:'Promenade'},museum:{cafe:'Caf\u00e9 apr\u00e8s',restaurant:'D\u00e9jeuner culturel',bar:'Verre en fin de journ\u00e9e'},casino:{restaurant:'D\u00eener avant',bar:'Verre sur place',night_club:'Continuer la soir\u00e9e'},restaurant:{bar:'Digestif',casino:'Soir\u00e9e jeux',movie_theater:'Cin\u00e9ma apr\u00e8s',natural_feature:'Promenade digestive'},bar:{restaurant:'Manger avant',casino:'Casino apr\u00e8s',night_club:'Club apr\u00e8s'},movie_theater:{restaurant:'D\u00eener avant',cafe:'Caf\u00e9 avant',bar:'Verre apr\u00e8s'},swimming_pool:{restaurant:'D\u00e9jeuner apr\u00e8s',spa:'Spa & d\u00e9tente',cafe:'Caf\u00e9 r\u00e9cup'},bowling_alley:{bar:'Bi\u00e8re entre parties',restaurant:'Manger apr\u00e8s',cafe:'Pause'},gym:{cafe:'Caf\u00e9 apr\u00e8s',restaurant:'D\u00e9jeuner r\u00e9cup',spa:'Spa & r\u00e9cup'}};
  var cats=LINKS[a.cat]||['restaurant','cafe','bar'];
  var labels=LLBLS[a.cat]||{};
  var sugs=[];
  cats.forEach(function(cat){
    var found=S.acts.filter(function(x){return x.cat===cat&&x.id!==a.id&&(x.dist||0)<3&&x.isOpen!==false;}).sort(function(x,y){return(x.dist||0)-(y.dist||0);})[0];
    if(found)sugs.push({act:found,label:labels[cat]||(CI[cat]||cat)});
  });
  return sugs.slice(0,3);
}

function addToCalendar(a){
  if(!a)return;
  var d=new Date(),h=H(),sh=Math.min(h+1,22);
  var pad=function(n){return String(n).padStart(2,'0');};
  var ds2=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
  var url='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(a.name+' \u2014 Dolcia')+'&dates='+ds2+'T'+pad(sh)+'0000/'+ds2+'T'+pad(Math.min(sh+2,23))+'5900&location='+encodeURIComponent(a.address||a.name);
  window.open(url,'_blank');snack('Agenda ouvert...');
}

function updateHeroBg(){
  var f=getFiltered();var top=f[0];if(!top)return;
  var bg=document.getElementById('hero-bg'),img=document.getElementById('hero-img');
  if(bg)bg.style.backgroundImage='url("'+(IMGS[top.cat]||IMGS.beach)+'")';
  if(top.photoRef&&S.live&&img&&['restaurant','spa','casino','movie_theater','bowling_alley','swimming_pool','golf_course','bar','cafe','night_club','amusement_park','lodging'].indexOf(top.cat)>=0){img.onload=function(){img.classList.add('loaded');};img.src=PROXY+'/photo?ref='+top.photoRef+'&maxwidth=900';}
}

// PAS DE FALLBACK INVENTE. Zero activite fictive, zero fausse donnee (regle absolue du produit).
// Tant que Google Places n'a pas repondu, on affiche un etat de chargement honnete (voir renderCards).

function loadActs(){
  var lat=S.city.lat,lng=S.city.lng,radius=(S.radius||5)*1000;
  var types=['restaurant','spa','casino','night_club','museum','bar','cafe','amusement_park','swimming_pool','golf_course','bowling_alley','gym','movie_theater','park','tourist_attraction','natural_feature','beach','art_gallery','lodging'];
  var all=[],done=0;
  types.forEach(function(t){
    fetch(PROXY+'/places?lat='+lat+'&lng='+lng+'&radius='+radius+'&type='+t)
      .then(function(r){return r.json();}).then(function(d){if(d.results&&d.results.length)all=all.concat(d.results);}).catch(function(){})
      .finally(function(){
        done++;
        if(done===types.length){
          if(all.length)processActs(all);
          else{S.loading=false;S.loadError=true;renderHome();}
        }
      });
  });
  loadWeather();loadEvents();
  fetch(SUPA_URL+'/rest/v1/fiches?select=*&active=eq.true',{headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY}})
    .then(function(r){return r.json();}).then(function(data){
      if(!data||!data.length)return;
      var P=['Gratuit','\u20ac','\u20ac\u20ac','\u20ac\u20ac\u20ac','\u20ac\u20ac\u20ac\u20ac'];
      data.forEach(function(f){
        if(S.acts.find(function(a){return a.id===f.id;}))return;
        S.acts.push({id:f.id,name:f.name,cat:f.cat,dist:0,rating:f.rating||0,reviews:f.reviews||0,priceN:f.price_level>=0?f.price_level:-1,price:f.price_level>=0?P[f.price_level]:'',isOpen:null,phone:f.phone||null,address:f.address||'',photoRef:null,types:[f.cat]});
      });
      renderHome();
    }).catch(function(){});
}

function processActs(results){
  var seen={},acts=[];
  var pri=['restaurant','spa','casino','night_club','museum','beach','park','amusement_park','swimming_pool','golf_course','bowling_alley','gym','movie_theater','bar','cafe','art_gallery','natural_feature','bakery','tourist_attraction','lodging'];
  results.forEach(function(p){
    if(!p.place_id||seen[p.place_id])return;seen[p.place_id]=1;
    var t2=p.types||[],cat='tourist_attraction';
    for(var pi=0;pi<pri.length;pi++){if(t2.indexOf(pri[pi])>=0){cat=pri[pi];break;}}
    var dist=0;if(p.geometry&&p.geometry.location){var dlat=p.geometry.location.lat-S.city.lat,dlng=p.geometry.location.lng-S.city.lng;dist=Math.round(Math.sqrt(dlat*dlat+dlng*dlng)*111000)/1000;}
    var P=['Gratuit','\u20ac','\u20ac\u20ac','\u20ac\u20ac\u20ac','\u20ac\u20ac\u20ac\u20ac'],pN=p.price_level!==undefined?p.price_level:-1;
    var op=null;if(p.opening_hours&&p.opening_hours.open_now!==undefined)op=p.opening_hours.open_now;
    acts.push({id:p.place_id,name:p.name,cat:cat,types:t2,dist:dist,rating:p.rating||0,reviews:p.user_ratings_total||0,priceN:pN,price:pN>=0?P[pN]:'',isOpen:op,photoRef:p.photos&&p.photos[0]?p.photos[0].photo_reference:null,phone:p.formatted_phone_number||null,address:p.vicinity||''});
  });
  if(!acts.length){S.loading=false;S.loadError=true;renderHome();return;}
  S.acts=acts;S.live=true;S.loading=false;S.loadError=false;
  var dot=document.getElementById('api-dot'),txt=document.getElementById('api-txt');
  if(dot)dot.className='api-dot live';if(txt)txt.textContent=acts.length+' activit\u00e9s';
  renderHome();updateHeroBg();
}

function loadWeather(){
  fetch(PROXY+'/weather?lat='+S.city.lat+'&lng='+S.city.lng).then(function(r){return r.json();}).then(function(d){if(!d.weather)return;S.weather=d;renderWeatherBar();renderCards(getFiltered());}).catch(function(){});
}

function loadEvents(){
  var today=new Date(),future=new Date(today.getTime()+60*24*60*60*1000);
  function fmt(d){return d.getFullYear()+'-'+(d.getMonth()+1<10?'0':'')+(d.getMonth()+1)+'-'+(d.getDate()<10?'0':'')+d.getDate();}
  fetch(PROXY+'/events?lat='+S.city.lat+'&lng='+S.city.lng+'&after='+fmt(today)+'&before='+fmt(future)+'&size=100')
    .then(function(r){return r.json();}).then(function(d){
      var evts=d.events||d.data||[];if(!evts.length)return;
      S.events=evts.map(function(ev){
        var t=ev.timings&&ev.timings[0]?ev.timings[0].begin:null;
        var date=t?new Date(t):null,timeStr=null;
        if(date){var hh=date.getHours(),mm=date.getMinutes();timeStr=hh+'h'+(mm>0?String(mm).padStart(2,'0'):'');}
        // Utiliser les champs enrichis si disponibles (nouveau proxy)
        var type=ev.type||(function(){
          var kw=JSON.stringify(ev).toLowerCase();
          if(kw.indexOf('concert')>=0)return'Concert';
          if(kw.indexOf('festival')>=0)return'Festival';
          if(kw.indexOf('spectacle')>=0||kw.indexOf('theatre')>=0)return'Spectacle';
          if(kw.indexOf('exposition')>=0||kw.indexOf('expo')>=0)return'Exposition';
          if(kw.indexOf('braderie')>=0||kw.indexOf('brocante')>=0||kw.indexOf('marche')>=0)return'Braderie';
          if(kw.indexOf('randonnee')>=0||kw.indexOf('balade')>=0)return'Sport';
          if(kw.indexOf('atelier')>=0||kw.indexOf('cours')>=0)return'Atelier';
          if(kw.indexOf('dedicace')>=0||kw.indexOf('livre')>=0)return'Culture';
          if(kw.indexOf('famille')>=0||kw.indexOf('enfant')>=0)return'Famille';
          return'\u00c9v\u00e9nement';
        })();
        var title=ev.ttl||ev.title||'\u00c9v\u00e9nement';
        if(typeof title==='object')title=title.fr||title.en||'\u00c9v\u00e9nement';
        var loc=ev.loc||ev.location||'';
        if(typeof loc==='object')loc=loc.name||loc.city||'';
        var kw2=JSON.stringify(ev).toLowerCase();
        return{
          id:ev.uid,ttl:title,loc:loc,
          date:date?date.toISOString():null,
          time:timeStr,type:type,
          emoji:ev.emoji||'',
          free:ev.free||(kw2.indexOf('gratuit')>=0),
          desc:ev.desc||'',
          registrationUrl:ev.registrationUrl||null
        };
      });
      renderEventsStrip();
    }).catch(function(){});
}

function renderHome(){
  renderCatBar();
  var f=getFiltered();
  var ci=CATS.find(function(c){return c.id===S.cat;})||{l:'Pour vous'};
  var ttl=document.getElementById('sec-ttl');if(ttl)ttl.textContent=S.cat==='all'?'Pour vous':ci.l;
  var n=document.getElementById('sec-n');if(n)n.textContent=f.length?(f.length+' r\u00e9sultat'+(f.length>1?'s':'')):'';
  renderCards(f);renderWeatherBar();renderEventsStrip();updateHeroTitle();updateHeroBg();
}

function renderCatBar(){
  var row=document.getElementById('cats-row');if(!row)return;
  row.innerHTML=CATS.map(function(c){return'<div class="cbtn'+(S.cat===c.id?' on':'')+'" data-cat="'+c.id+'">'+c.l+'</div>';}).join('');
}

function renderEventsStrip(){
  var el=document.getElementById('events-strip');if(!el||!S.events||!S.events.length){if(el)el.innerHTML='';return;}
  var today=new Date().getDate();
  var upcoming=S.events.filter(function(ev){if(!ev.date)return false;var d=new Date(ev.date).getDate();return d===today||d===today+1;}).slice(0,8);
  if(!upcoming.length){el.innerHTML='';return;}
  var out='<div class="strip-wrap"><div class="strip-hdr"><div class="strip-lbl"><div class="strip-dot"></div>Ce qui se passe</div></div><div class="strip-row">';
  upcoming.forEach(function(ev){var isT=ev.date&&new Date(ev.date).getDate()===today;out+='<div class="ev-chip" data-action="go-agenda"><div class="ev-chip-when">'+(isT?'Ce soir':'Demain')+(ev.time?' \u00b7 '+ev.time:'')+'</div><div class="ev-chip-name">'+ev.ttl+'</div><div class="ev-chip-loc">'+ev.loc+'</div>'+(ev.free?'<div class="ev-chip-free">Gratuit</div>':'')+'</div>';});
  out+='</div></div>';el.innerHTML=out;
}

function renderWeatherBar(){
  var bar=document.getElementById('weather-bar');if(!bar)return;
  var w=S.weather;if(!w){bar.style.display='none';return;}
  var main=w.weather[0].main,temp=Math.round(w.main.temp),desc=w.weather[0].description;
  var icons={Clear:'&#9728;&#65039;',Clouds:'&#9925;',Rain:'&#127783;',Drizzle:'&#127782;',Thunderstorm:'&#9889;&#65039;',Snow:'&#10052;&#65039;',Mist:'&#127787;'};
  var recos={Clear:temp>20?'Plage & Nature':temp>15?'Balade & Golf':'Outdoor',Clouds:'Balade & Culture',Rain:'Spa & Cinema',Drizzle:'Spa & Bowling',Thunderstorm:'Activit\u00e9s int\u00e9rieur',Snow:'Spa & Fondue'};
  var ico=document.getElementById('wb-icon');if(ico)ico.innerHTML=icons[main]||'&#127777;';
  var txt=document.getElementById('wb-txt');if(txt)txt.innerHTML='<b>'+temp+'&deg; &mdash; '+desc+'</b> &agrave; '+S.city.n;
  var rec=document.getElementById('wb-reco');if(rec)rec.textContent=recos[main]||'Pour vous';
  bar.style.display='flex';
}

function updateHeroTitle(){
  var h=H(),m=S.moment;
  var P={now:h>=5&&h<12?'Bonjour &mdash; que faire <em>ce matin</em>&nbsp;?':h>=12&&h<14?'<em>D&eacute;jeuner</em> &mdash; et apr&egrave;s&nbsp;?':h>=14&&h<18?'Cet <em>apr&egrave;s-midi</em> &mdash; quoi faire&nbsp;?':h>=18&&h<21?'<em>Ce soir</em> &mdash; la soir&eacute;e commence&nbsp;!':'La <em>nuit</em> vous appartient.',tonight:'Que faites-vous <em>ce soir</em>&nbsp;?',tomorrow:'Planifiez <em>demain</em> maintenant.',weekend:'Votre <em>week-end</em> commence ici.',halfday:'Une <em>demi-journ&eacute;e</em> de plaisir.'};
  var ttl=document.getElementById('hero-ttl');if(ttl)ttl.innerHTML=P[m]||'Vos prochaines <em>&eacute;motions</em> commencent ici.';
}

// EXPERIENCES COMBINEES
// La vraie valeur Dolcia : penser à la place des utilisateurs
var COMBOS={
  famille:[
    {
      trigger:['amusement_park','gym','park','swimming_pool','bowling_alley'],
      child_label:'Pour les enfants',
      parent_label:'Pendant ce temps, pour vous',
      parent_cats:['restaurant','spa','cafe','museum','bar'],
      hook:'Et si vous en profitiez aussi\u00a0?'
    }
  ],
  couple:[
    {
      trigger:['restaurant'],
      after_label:'Pour prolonger la soir\u00e9e',
      after_cats:['bar','casino','natural_feature','movie_theater'],
      hook:'La soir\u00e9e ne fait que commencer.'
    },
    {
      trigger:['spa'],
      after_label:'Apr\u00e8s le soin',
      after_cats:['restaurant','natural_feature','cafe'],
      hook:'Prolongez le bien-\u00eatre.'
    }
  ],
  amis:[
    {
      trigger:['bar','bowling_alley','casino'],
      after_label:'Pour continuer',
      after_cats:['restaurant','night_club','casino','bar'],
      hook:'La nuit vous appartient.'
    }
  ],
  solo:[
    {
      trigger:['museum','park','beach','natural_feature'],
      after_label:'Une pause m\u00e9rit\u00e9e',
      after_cats:['cafe','restaurant'],
      hook:'Prenez soin de vous.'
    }
  ]
};

function getCombo(mainAct){
  var who=S.ans.who||'all';
  var combos=COMBOS[who]||[];
  for(var i=0;i<combos.length;i++){
    var c=combos[i];
    if(c.trigger.indexOf(mainAct.cat)>=0){
      // Trouver l'activité complémentaire
      var cats=c.parent_cats||c.after_cats||[];
      var found=null;
      for(var j=0;j<cats.length;j++){
        var match=S.acts.filter(function(x){return x.cat===cats[j]&&x.id!==mainAct.id&&x.isOpen!==false&&(x.dist||0)<2;}).sort(function(a,b){return(b.rating||0)-(a.rating||0);})[0];
        if(match){found=match;break;}
      }
      if(found)return{combo:c,act:found};
    }
  }
  return null;
}

function renderComboBlock(mainAct){
  var res=getCombo(mainAct);
  if(!res)return'';
  var c=res.combo,act=res.act;
  var label=c.parent_label||c.after_label||'Compl\u00e9tez l\'exp\u00e9rience';
  var fallback=IMGS[act.cat]||null;
  var th=fallback?'background-image:url("'+fallback+'");background-size:cover;background-position:center':cbg(act.cat);
  return'<div style="margin:10px 0 0;background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.03));border:1px solid rgba(201,168,76,.18);border-radius:14px;padding:12px 13px;cursor:pointer" data-action="open" data-id="'+act.id+'">'
    +'<div style="font-size:7px;letter-spacing:.32em;text-transform:uppercase;color:rgba(201,168,76,.8);font-weight:600;margin-bottom:6px">'+c.hook+'</div>'
    +'<div style="display:flex;align-items:center;gap:10px">'
    +'<div style="width:52px;height:52px;border-radius:11px;flex-shrink:0;'+th+'"></div>'
    +'<div style="flex:1"><div style="font-size:8px;color:rgba(201,168,76,.6);margin-bottom:2px">'+label+'</div>'
    +'<div style="font-family:var(--cormo);font-size:16px;color:#fff;font-weight:300">'+act.name+'</div>'
    +'<div style="font-size:9px;color:rgba(255,255,255,.4);margin-top:1px">'+(act.dist>0?ds(act.dist):'')+(act.rating>0?' &middot; &#9733;'+act.rating.toFixed(1):'')+'</div>'
    +'</div><div style="font-size:16px;color:rgba(201,168,76,.5)">\u203a</div></div></div>';
}

function renderCards(f){
  var w=document.getElementById('cards');if(!w)return;
  if(!f||!f.length){
    if(S.loading){w.innerHTML='<div class="empty"><div class="empty-ico">&#8987;</div><h3>Recherche en cours\u2026</h3><p>Dolcia interroge Google Places autour de vous</p></div>';return;}
    if(S.loadError){w.innerHTML='<div class="empty"><div class="empty-ico">&#9888;&#65039;</div><h3>Impossible de charger les activit\u00e9s</h3><p>V\u00e9rifiez votre connexion ou r\u00e9essayez dans un instant</p></div>';return;}
    w.innerHTML='<div class="empty"><div class="empty-ico">&#127758;</div><h3>Aucun r\u00e9sultat</h3><p>Essayez un autre filtre ou agrandissez le rayon</p></div>';return;
  }
  var h=H(),wt=S.weather,main=wt?wt.weather[0].main:null,temp=wt?Math.round(wt.main.temp):15,who=S.ans.who||'all';
  w.innerHTML=f.slice(0,20).map(function(a,i){
    var saved=S.saved.some(function(x){return x.id===a.id;});
    var useGP=a.photoRef&&S.live&&['restaurant','spa','casino','movie_theater','bowling_alley','swimming_pool','golf_course','bar','cafe','night_club','amusement_park','lodging'].indexOf(a.cat)>=0;
    var photoUrl=useGP?(PROXY+'/photo?ref='+a.photoRef+'&maxwidth=600'):null;
    var fallback=IMGS[a.cat]||null;
    var imgTag=photoUrl?'<img class="crd-photo" src="'+photoUrl+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">'+(fallback?'<div class="crd-photo" style="background-image:url(\''+fallback+'\');background-size:cover;background-position:center"></div>':''):(fallback?'<div class="crd-photo" style="background-image:url(\''+fallback+'\');background-size:cover;background-position:center"></div>':'<div class="crd-photo" style="'+cbg(a.cat)+'"></div>');
    var badges='';
    if(a.isOpen===true)badges+='<span class="bdg bdg-open">Ouvert</span>';
    if(i===0&&(a.score||0)>=70)badges+='<span class="bdg bdg-hot">N&deg;1</span>';
    else if((a.score||0)>=88)badges+='<span class="bdg bdg-top">Top</span>';
    if(a.priceN===0)badges+='<span class="bdg bdg-free">Gratuit</span>';
    var why='';
    if(main==='Rain'&&['spa','museum','movie_theater','casino','bowling_alley'].indexOf(a.cat)>=0)why='Il pleut &mdash; <em>id\u00e9al par ce temps</em>';
    else if(temp>20&&['beach','natural_feature','park'].indexOf(a.cat)>=0)why=temp+'&deg;C &mdash; <em>conditions parfaites</em>';
    else if(temp<12&&['spa','restaurant','cafe','museum','movie_theater'].indexOf(a.cat)>=0)why='Frais dehors &mdash; <em>parfait pour l\u2019int\u00e9rieur</em>';
    else if(h>=12&&h<=14&&['restaurant','cafe'].indexOf(a.cat)>=0)why='<em>L\u2019heure du d\u00e9jeuner</em>';
    else if(h>=19&&h<=22&&a.cat==='restaurant')why='<em>L\u2019heure du d\u00eener</em>';
    else if(h>=21&&['bar','casino','night_club'].indexOf(a.cat)>=0)why='<em>La soir\u00e9e commence</em>';
    else if(h>=18&&h<=21&&main==='Clear'&&a.cat==='natural_feature')why='<em>Coucher de soleil</em> ce soir';
    else if(who==='famille'&&['amusement_park','beach','bowling_alley','movie_theater','swimming_pool'].indexOf(a.cat)>=0)why='<em>Id\u00e9al en famille</em>';
    else if(who==='couple'&&['restaurant','spa','natural_feature','casino','museum'].indexOf(a.cat)>=0)why='<em>Id\u00e9al en amoureux</em>';
    else if(a.rating>=4.8&&a.reviews>50)why='Not\u00e9 <em>'+a.rating+'/5</em> &mdash; '+a.reviews+' visiteurs';
    else if(a.dist>0&&a.dist<0.5)why='&Agrave; <em>'+ds(a.dist)+'</em> de vous';
    else why='S\u00e9lectionn\u00e9 pour vous';
    var r2=a.rating||0,stars='';for(var si=0;si<5;si++)stars+=(si<Math.round(r2)?'&#9733;':'&#9734;');
    var phoneCta=a.phone?'<a href="tel:'+a.phone+'" style="text-decoration:none;flex:1;display:flex"><div class="crd-btn crd-btn-tel" style="flex:1">Appeler</div></a>':'';
    return'<div class="crd" data-action="open" data-id="'+a.id+'">'
      +'<div class="crd-img">'+imgTag+'<div class="crd-shade"></div>'
      +'<div class="crd-badges">'+badges+'</div>'
      +'<div class="crd-heart'+(saved?' on':'')+'" data-action="save" data-id="'+a.id+'">'+(saved?'&#10084;':'&#9825;')+'</div>'
      +((a.score||0)>=50?'<div class="crd-score"><div class="crd-score-n">'+(a.score||'')+'</div><div class="crd-score-l">score</div></div>':'')
      +'</div><div class="crd-body">'
      +'<div class="crd-meta"><span class="crd-cat">'+(CI[a.cat]||a.cat)+'</span>'+(a.dist>0?'<span class="crd-dist">'+ds(a.dist)+'</span>':'')+'</div>'
      +'<div class="crd-name">'+a.name+'</div>'
      +(r2>0?'<div class="crd-stars"><span class="crd-stars-ico">'+stars+'</span><span class="crd-rating">'+r2.toFixed(1)+'</span>'+(a.reviews>0?'<span class="crd-reviews">('+a.reviews+')</span>':'')+'</div>':'')
      +(a.price?'<div class="crd-price">'+a.price+'</div>':'')
      +'<div class="crd-why">'+why+'</div>'
      +renderComboBlock(a)
      +'<div class="crd-cta"><div class="crd-btn crd-btn-primary" data-action="open" data-id="'+a.id+'">D\u00e9couvrir &#8250;</div>'+phoneCta+'</div>'
      +'</div></div>';
  }).join('');
}

function openDetail(id){
  var a=S.acts.find(function(x){return x.id===id;});if(!a)return;
  var saved=S.saved.some(function(x){return x.id===id;});
  var useGP=['restaurant','spa','casino','movie_theater','bowling_alley','swimming_pool','golf_course','bar','cafe','night_club','amusement_park','lodging'].indexOf(a.cat)>=0;
  var photoUrl=a.photoRef&&S.live&&useGP?(PROXY+'/photo?ref='+a.photoRef+'&maxwidth=900'):null;
  var fallback=IMGS[a.cat]||null;
  var bgTag=photoUrl?'<img class="det-hero-bg" src="'+photoUrl+'" alt="">':(fallback?'<div class="det-hero-bg" style="background-image:url(\''+fallback+'\');background-size:cover;background-position:center"></div>':'<div class="det-hero-bg" style="'+cbg(a.cat)+'"></div>');
  var sugs=getSuggestions(a);
  var sugsHtml='';
  if(sugs.length){
    sugsHtml='<div class="xp-section"><div class="xp-section-ttl">Compl\u00e9tez votre exp\u00e9rience</div>';
    sugs.forEach(function(s){
      var sf=IMGS[s.act.cat]||null;
      var sth=sf?'background-image:url("'+sf+'");background-size:cover;background-position:center':cbg(s.act.cat);
      sugsHtml+='<div class="xp-card" data-action="open" data-id="'+s.act.id+'">'
        +'<div class="xp-card-thumb" style="'+sth+'"></div>'
        +'<div style="flex:1"><div class="xp-card-lbl">'+s.label+'</div><div class="xp-card-name">'+s.act.name+'</div><div class="xp-card-meta">'+ds(s.act.dist||0)+(s.act.rating>0?' &middot; &#9733;'+s.act.rating.toFixed(1):'')+'</div></div>'
        +'<div style="font-size:16px;color:rgba(201,168,76,.4)">&rsaquo;</div></div>';
    });
    sugsHtml+='</div>';
  }
  var aid=a.id;
  var det=document.getElementById('det');
  det.innerHTML='<div class="det-hero">'+bgTag+'<div class="det-shade"></div><div class="det-back" data-action="close-det">&larr;</div></div>'
    +'<div class="det-body"><div class="det-sup">'+(CI[a.cat]||'Activit\u00e9')+'</div>'
    +'<div class="det-title">'+a.name+'</div>'
    +'<div class="det-chips">'
    +(a.priceN===0?'<span class="det-chip g">Gratuit</span>':(a.price?'<span class="det-chip">'+a.price+'</span>':''))
    +(a.dist>0?'<span class="det-chip g">'+ds(a.dist)+'</span>':'')
    +(a.rating>0?'<span class="det-chip">&#9733; '+a.rating.toFixed(1)+(a.reviews>0?' ('+a.reviews+')':'')+'</span>':'')
    +(a.isOpen===true?'<span class="det-chip ok">Ouvert</span>':'')
    +'</div>'
    +(a.phone?'<a href="tel:'+a.phone+'" style="text-decoration:none"><div class="det-row"><div class="det-row-ico">&#128222;</div><div><div class="det-row-l">Appeler</div><div class="det-row-s">'+a.phone+'</div></div></div></a>':'')
    +'<div class="det-row" id="dcal" style="cursor:pointer"><div class="det-row-ico">&#128197;</div><div><div class="det-row-l">Ajouter &agrave; mon agenda</div><div class="det-row-s">Google Calendar</div></div></div>'
    +'<div class="det-row" id="dmap" style="cursor:pointer"><div class="det-row-ico">&#128205;</div><div><div class="det-row-l">Itin&eacute;raire</div><div class="det-row-s">Ouvrir dans Maps</div></div></div>'
    +'<div class="det-row" id="dgoogle" style="cursor:pointer"><div class="det-row-ico">&#128269;</div><div><div class="det-row-l">Voir sur Google</div><div class="det-row-s">Infos, horaires, avis</div></div></div>'
    +sugsHtml+'</div>'
    +'<div class="det-bar">'
    +'<div style="flex:1"><div style="font-family:var(--cormo);font-size:18px;color:#fff;font-weight:300">'+(a.priceN===0?'Gratuit':a.price||'&mdash;')+'</div><div style="font-size:8.5px;color:rgba(255,255,255,.3)">par personne</div></div>'
    +(a.phone?'<a href="tel:'+a.phone+'" style="flex:2;text-decoration:none;display:flex"><div style="flex:1;background:linear-gradient(105deg,#5A3410,var(--gold) 30%,#F5E6B8 55%,var(--gold) 80%,#5A3410);background-size:200%;animation:shimmer 3s linear infinite;color:#000;border-radius:99px;padding:15px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;text-align:center">&#128222; Appeler</div></a>':'<div style="flex:2;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5);border-radius:99px;padding:15px;font-size:10px;cursor:pointer;text-align:center" id="dcal2">&#128197; Agenda</div>')
    +'<button class="det-heart-b'+(saved?' on':'')+'" id="dheart">'+(saved?'&#10084;':'&#9825;')+'</button></div>';
  det.style.display='block';det.scrollTop=0;
  setTimeout(function(){
    var el=document.getElementById('dcal');if(el)el.onclick=function(){addToCalendar(a);};
    var el2=document.getElementById('dcal2');if(el2)el2.onclick=function(){addToCalendar(a);};
    var el3=document.getElementById('dmap');if(el3)el3.onclick=function(){window.open('https://www.google.com/maps/search/'+encodeURIComponent(a.name),'_blank');};
    var el4=document.getElementById('dgoogle');if(el4)el4.onclick=function(){window.open('https://www.google.com/search?q='+encodeURIComponent(a.name),'_blank');};
    var el5=document.getElementById('dheart');if(el5)el5.onclick=function(){toggleSave(aid);};
  },100);
}

function toggleSave(id){
  var a=S.acts.find(function(x){return x.id===id;});if(!a)return;
  var idx=S.saved.findIndex(function(x){return x.id===id;});
  if(idx>=0){S.saved.splice(idx,1);snack('Retir\u00e9 des favoris');}else{S.saved.push(a);snack('\u2665 Ajout\u00e9 aux favoris');}
  var on=idx<0;
  document.querySelectorAll('[data-action="save"][data-id="'+id+'"]').forEach(function(b){b.innerHTML=on?'&#10084;':'&#9825;';b.classList.toggle('on',on);});
  var hb=document.getElementById('dheart');if(hb){hb.innerHTML=on?'&#10084;':'&#9825;';hb.classList.toggle('on',on);}
}

var _lastSurprise=null;
function doSurprise(){
  var all=getFiltered().filter(function(a){return a.id!==_lastSurprise;});
  if(!all.length)all=getFiltered();
  if(!all.length){snack('Aucune activit\u00e9 disponible');return;}
  var pick=all[Math.floor(Math.random()*Math.min(all.length,6))];
  if(!pick)return;_lastSurprise=pick.id;window._sid=pick.id;
  var fallback=IMGS[pick.cat]||null;
  var bgStyle=fallback?'background-image:url("'+fallback+'");background-size:cover;background-position:center':cbg(pick.cat);
  openSheet('<div class="s-bar"></div>'
    +'<div style="width:100%;height:148px;border-radius:17px;overflow:hidden;position:relative;margin-bottom:15px;'+bgStyle+'">'
    +'<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,.92),transparent 65%)"></div>'
    +'<div style="position:absolute;bottom:13px;left:14px;font-family:var(--cormo);font-size:21px;color:#fff;font-weight:300">'+pick.name+'</div>'
    +'</div>'
    +'<div class="s-ey">Dolcia a choisi pour vous</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:15px">'
    +(pick.dist>0?'<span style="padding:3px 10px;background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.2);border-radius:99px;font-size:10.5px;color:var(--gold2)">'+ds(pick.dist)+'</span>':'')
    +(pick.rating>0?'<span style="padding:3px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:99px;font-size:10.5px;color:rgba(255,255,255,.6)">&#9733; '+pick.rating.toFixed(1)+'</span>':'')
    +'</div>'
    +'<div style="display:flex;gap:8px">'
    +'<button class="btn-gold" style="flex:2;padding:14px;font-size:10px" data-action="sopen">Voir &rsaquo;</button>'
    +'<button style="flex:1;padding:14px;border-radius:99px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.45);font-size:12px;cursor:pointer" data-action="other">Autre</button>'
    +'</div>');
}

// Categories du matin/apres-midi selon l'envie (preference, pas exclusion, pour un sejour multi-jours)
function vibeCatsForPeriod(vibe,period){
  if(vibe==='outdoor')return period==='morning'?['beach','park','natural_feature','tourist_attraction']:['golf_course','beach','park','gym','natural_feature'];
  if(vibe==='chill')return period==='morning'?['spa','museum','art_gallery']:['spa','swimming_pool','art_gallery','museum'];
  if(vibe==='food')return['restaurant','cafe'];
  if(vibe==='party')return period==='morning'?['museum','park','beach']:['bowling_alley','casino','museum'];
  return period==='morning'?['beach','park','museum','natural_feature','tourist_attraction']:['spa','golf_course','bowling_alley','museum','swimming_pool'];
}
function eveningCatsFor(who,vibe){
  if(who==='famille')return['restaurant','movie_theater','bowling_alley'];
  if(vibe==='party')return['bar','casino','night_club'];
  if(vibe==='chill')return['restaurant','spa'];
  return['restaurant','bar','casino'];
}
// Pioche un candidat reel (jamais invente) parmi S.acts, en respectant le budget choisi et en excluant les ids deja utilises.
// Variete volontaire : tirage aleatoire parmi le top 3 le mieux note, pour que "regenerer" donne un resultat different a chaque fois.
function pickFromPool(cats,usedIds){
  var budget=S.ans.budget||'';
  var pool=S.acts.filter(function(a){
    if(usedIds[a.id])return false;
    if(a.isOpen===false)return false;
    if(budget&&!budgetAllows(a,budget))return false;
    return cats.indexOf(a.cat)>=0;
  });
  if(!pool.length)return null;
  pool.sort(function(a,b){return(b.rating||0)-(a.rating||0);});
  var top=pool.slice(0,Math.min(3,pool.length));
  return top[Math.floor(Math.random()*top.length)];
}
function buildStayProgram(){
  var dayCount=Math.max(1,(S.ans.vacDays||0)+1);
  var vibe=S.ans.vibe||'',who=S.ans.who||'';
  var used={},slots=[];
  var hotel=pickFromPool(['lodging'],used);
  if(hotel){slots.push({label:'H\u00e9bergement \u2014 tout le s\u00e9jour',cats:['lodging'],act:hotel});used[hotel.id]=1;}
  for(var d=1;d<=dayCount;d++){
    var suffix=dayCount>1?' \u2014 Jour '+d:'';
    var parts=[
      {label:'Matin'+suffix,cats:vibeCatsForPeriod(vibe,'morning')},
      {label:'D\u00e9jeuner'+suffix,cats:['restaurant','cafe']},
      {label:'Apr\u00e8s-midi'+suffix,cats:vibeCatsForPeriod(vibe,'afternoon')},
      {label:'Soir'+suffix,cats:eveningCatsFor(who,vibe)}
    ];
    parts.forEach(function(p){
      var a=pickFromPool(p.cats,used);
      if(a)used[a.id]=1;
      slots.push({label:p.label,cats:p.cats,act:a});
    });
  }
  return slots;
}
function renderStaySheetHtml(){
  var slots=S.stayProgram||[];
  var dayCount=Math.max(1,(S.ans.vacDays||0)+1);
  var html='<div class="s-bar"></div><div class="s-ey">Votre s\u00e9jour</div><div class="s-ttl">'+dayCount+' jour'+(dayCount>1?'s':'')+' compos\u00e9'+(dayCount>1?'s':'')+' <em style="font-style:italic;color:var(--gold2)">par Dolcia</em></div>';
  slots.forEach(function(s,i){
    var a=s.act;
    html+='<div style="display:flex;gap:8px;margin-bottom:9px;align-items:stretch">';
    html+='<div style="width:60px;flex-shrink:0;display:flex;align-items:center"><div style="font-size:7px;color:rgba(201,168,76,.7);text-transform:uppercase;letter-spacing:.05em;line-height:1.3">'+s.label+'</div></div>';
    if(a){
      html+='<div style="flex:1;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;cursor:pointer" data-action="open" data-id="'+a.id+'"><div style="font-family:var(--cormo);font-size:14px;color:#fff;margin-bottom:3px">'+a.name+'</div><div style="font-size:9.5px;color:rgba(255,255,255,.38)">'+(a.dist>0?ds(a.dist)+' \u00b7 ':'')+(a.price||'')+(a.rating>0?' \u00b7 \u2605'+a.rating.toFixed(1):'')+'</div></div>';
      html+='<div style="width:36px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(201,168,76,.6);font-size:15px" data-action="regen-slot" data-idx="'+i+'">&#8635;</div>';
    } else {
      html+='<div style="flex:1;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.1);border-radius:12px;padding:10px 12px;font-size:10.5px;color:rgba(255,255,255,.32);display:flex;align-items:center">Aucune option disponible pour l\u2019instant dans cette cat\u00e9gorie</div>';
    }
    html+='</div>';
  });
  html+='<div style="display:flex;gap:8px;margin-top:4px">'
    +'<button class="btn-gold" style="flex:2;padding:12px;font-size:9.5px" data-action="regen-all">Tout r\u00e9g\u00e9n\u00e9rer &#8635;</button>'
    +'<button style="flex:1;padding:12px;border-radius:99px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.45);font-size:11px;cursor:pointer" data-action="cs">Fermer</button>'
    +'</div>';
  return html;
}
function regenSlot(idx){
  var slots=S.stayProgram;if(!slots||!slots[idx])return;
  var slot=slots[idx];
  var used={};slots.forEach(function(s,i){if(i!==idx&&s.act)used[s.act.id]=1;});
  if(slot.act)used[slot.act.id]=1;
  var a=pickFromPool(slot.cats,used);
  if(!a){snack('Aucune autre option disponible');return;}
  slot.act=a;
  var sheet=document.getElementById('sheet');if(sheet)sheet.innerHTML=renderStaySheetHtml();
}
function regenAllStay(){
  S.stayProgram=buildStayProgram();
  var sheet=document.getElementById('sheet');if(sheet)sheet.innerHTML=renderStaySheetHtml();
}
function doProgram(){
  if((S.ans.vacDays||0)>=1){
    S.stayProgram=buildStayProgram();
    if(!S.stayProgram.some(function(s){return s.act;})){snack('Pas assez de r\u00e9sultats disponibles pour l\u2019instant');return;}
    openSheet(renderStaySheetHtml());
    return;
  }
  var acts=getFiltered(),moment=S.moment;
  var SLOTS={now:[{t:'Maintenant',l:'Activit\u00e9',c:['beach','park','gym','museum','tourist_attraction']},{t:'+2h',l:'Pause',c:['cafe','restaurant']},{t:'+4h',l:'Pour finir',c:['bar','restaurant','spa','movie_theater']}],tonight:[{t:'19h',l:'Ap\u00e9ritif',c:['bar','restaurant']},{t:'20h30',l:'D\u00eener',c:['restaurant']},{t:'22h30',l:'Soir\u00e9e',c:['casino','bar','night_club','bowling_alley']}],tomorrow:[{t:'9h30',l:'Matin',c:['beach','park','gym','cafe']},{t:'12h30',l:'D\u00e9jeuner',c:['restaurant']},{t:'15h',l:'Apr\u00e8s-midi',c:['museum','spa','amusement_park']}],weekend:[{t:'Sam 10h',l:'Matin',c:['beach','park','golf_course']},{t:'Sam 13h',l:'D\u00e9j.',c:['restaurant']},{t:'Sam 20h',l:'Soir\u00e9e',c:['casino','bar','night_club']},{t:'Dim 10h',l:'D\u00e9c.',c:['museum','park','tourist_attraction']},{t:'Dim 13h',l:'D\u00e9j.',c:['restaurant']}],halfday:[{t:'Matin',l:'D\u00e9part',c:['beach','park','museum']},{t:'D\u00e9jeuner',l:'Pause',c:['restaurant','cafe']},{t:'Apr\u00e8s-midi',l:'Retour',c:['spa','movie_theater']}]};
  var slots=SLOTS[moment]||SLOTS.now;
  var prog=slots.map(function(s){var c=acts.filter(function(a){return s.c.indexOf(a.cat)>=0;});return Object.assign({},s,{act:c[0]||null});}).filter(function(s){return s.act;});
  if(!prog.length){snack('Pas assez de r\u00e9sultats');return;}
  var html='<div class="s-bar"></div><div class="s-ey">Votre programme</div><div class="s-ttl">Compos\u00e9 <em style="font-style:italic;color:var(--gold2)">par Dolcia</em></div>';
  prog.forEach(function(s){var a=s.act;html+='<div style="display:flex;gap:9px;margin-bottom:10px"><div style="width:52px;flex-shrink:0"><div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.18);border-radius:9px;padding:6px 4px;text-align:center"><div style="font-size:6px;color:rgba(201,168,76,.55);text-transform:uppercase;letter-spacing:.06em">'+s.l+'</div><div style="font-family:var(--cormo);font-size:12px;color:var(--gold2)">'+s.t+'</div></div></div><div style="flex:1;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;cursor:pointer" data-action="open" data-id="'+a.id+'"><div style="font-family:var(--cormo);font-size:14px;color:#fff;margin-bottom:3px">'+a.name+'</div><div style="font-size:9.5px;color:rgba(255,255,255,.38)">'+ds(a.dist||0)+(a.price&&a.priceN>0?' &middot; '+a.price:'')+'</div></div></div>';});
  html+='<button class="btn-gold" style="padding:13px;font-size:10px;margin-top:7px" data-action="cs">Fermer</button>';
  openSheet(html);
}

function showLoc(){
  openSheet('<div class="s-bar"></div><div class="s-ttl">Ma position</div>'
    +'<div class="loc-btn" onclick="geoApp()"><div style="width:36px;height:36px;border-radius:9px;background:rgba(0,208,132,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">&#128205;</div><div><div style="font-family:var(--cormo);font-size:14px;color:#fff">Me localiser</div><div style="font-size:10.5px;color:rgba(0,208,132,.75);margin-top:1px">'+S.city.n+'</div></div></div>'
    +'<div style="font-size:7px;letter-spacing:.3em;text-transform:uppercase;color:rgba(201,168,76,.55);margin-bottom:6px;font-weight:600">Rayon de recherche</div>'
    +'<div class="rad-row">'+[2,5,10,20,50].map(function(r){return'<button class="rad-b'+(S.radius===r?' on':'')+'" data-rad="'+r+'">'+r+'<span style="display:block;font-size:7.5px;opacity:.55">km</span></button>';}).join('')+'</div>'
    +'<div id="rad-hint" style="padding:8px 12px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:9px;font-size:10.5px;color:rgba(255,255,255,.26);text-align:center;margin-bottom:13px">'+rh()+'</div>'
    +'<button class="btn-gold" onclick="geoApp()">Me localiser &rsaquo;</button>');
}
function rh(){return{2:'A pied',5:'Quartier et environs',10:'Ville et communes voisines',20:'Agglom\u00e9ration',50:'Grand territoire'}[S.radius]||'';}
function geoApp(){
  if(!navigator.geolocation){snack('GPS non disponible');return;}
  navigator.geolocation.getCurrentPosition(function(pos){
    fetch('https://nominatim.openstreetmap.org/reverse?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&format=json')
      .then(function(r){return r.json();}).then(function(d){var n=(d.address&&(d.address.city||d.address.town||d.address.village))||'Ma position';S.city={n:n,lat:pos.coords.latitude,lng:pos.coords.longitude};snack('&#128205; '+n);closeSheet();S.acts=[];loadActs();var hc=document.getElementById('hdr-city');if(hc)hc.textContent=n.substring(0,16);}).catch(function(){});
  },function(){snack('GPS refus\u00e9');});
}

function switchTab(tab){
  document.querySelectorAll('.ntab').forEach(function(b){b.classList.toggle('on',b.dataset.t===tab);});
  var sc=document.getElementById('scroll');if(!sc)return;
  if(tab==='discover'){sc.scrollTop=0;renderHome();}
  else if(tab==='agenda')sc.innerHTML=buildAgenda();
  else if(tab==='services')sc.innerHTML=buildServices();
  else if(tab==='saved')sc.innerHTML=buildSaved();
}

function buildAgenda(){
  var evs=S.events||[];
  var filter=S.agendaFilter||'all';
  var dateFilter=S.agendaDate||'all';
  var now=new Date(),today=now.getDate(),todayM=now.getMonth();

  var filtered=evs.slice();
  if(filter!=='all')filtered=filtered.filter(function(ev){return ev.type===filter;});
  if(dateFilter==='today')filtered=filtered.filter(function(ev){if(!ev.date)return false;var d=new Date(ev.date);return d.getDate()===today&&d.getMonth()===todayM;});
  else if(dateFilter==='weekend'){
    var wd=now.getDay();
    var sat=new Date(now);sat.setDate(now.getDate()+(wd===6?0:6-wd));
    var sun=new Date(now);sun.setDate(now.getDate()+(wd===0?0:7-wd));
    filtered=filtered.filter(function(ev){if(!ev.date)return false;var d=new Date(ev.date),dd=d.getDate(),dm=d.getMonth();return(dd===sat.getDate()&&dm===sat.getMonth())||(dd===sun.getDate()&&dm===sun.getMonth());});
  }
  else if(dateFilter==='month')filtered=filtered.filter(function(ev){if(!ev.date)return false;var d=new Date(ev.date);return d.getMonth()===todayM&&d.getFullYear()===now.getFullYear();});

  var DTYPES=['Concert','Festival','Spectacle','Exposition','Culture','Braderie','Sport','Atelier','Famille','F\u00eate','Cin\u00e9ma'];
  var typesPresents=DTYPES.filter(function(t){return evs.some(function(ev){return ev.type===t;});});

  function dfBtn(d,cur){
    var labels={all:'Tout',today:'Ce jour',weekend:'Week-end',month:'Ce mois'};
    var on=d===cur;
    var st='flex-shrink:0;padding:5px 12px;border-radius:99px;font-size:10px;cursor:pointer;white-space:nowrap;';
    st+=on?'border:1.5px solid rgba(201,168,76,.5);background:rgba(201,168,76,.12);color:var(--gold2);':'border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:rgba(255,255,255,.5);';
    return'<div style="'+st+'" onclick="S.agendaDate=\''+d+'\';var sc=document.getElementById(\'scroll\');if(sc)sc.innerHTML=buildAgenda();">'+labels[d]+'</div>';
  }
  function tfBtn(t,cur){
    var on=t===cur;
    var st='flex-shrink:0;padding:4px 10px;border-radius:99px;font-size:9.5px;cursor:pointer;white-space:nowrap;';
    st+=on?'border:1px solid rgba(167,139,250,.4);background:rgba(167,139,250,.1);color:var(--purple);':'border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);color:rgba(255,255,255,.4);';
    return'<div style="'+st+'" onclick="S.agendaFilter=\''+t+'\';var sc=document.getElementById(\'scroll\');if(sc)sc.innerHTML=buildAgenda();">'+(t==='all'?'Tous':t)+'</div>';
  }

  var html='<div class="page"><div class="pg-ey">Agenda local</div><div class="pg-ttl">Ce qui se passe ici</div>';
  html+='<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin-bottom:8px">'+['all','today','weekend','month'].map(function(d){return dfBtn(d,dateFilter);}).join('')+'</div>';
  if(typesPresents.length)html+='<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px">'+['all'].concat(typesPresents).map(function(t){return tfBtn(t,filter);}).join('')+'</div>';

  if(!filtered.length){
    html+='<div class="empty"><div class="empty-ico">&#128197;</div><h3>Aucun \u00e9v\u00e9nement</h3><p>Essayez une autre p\u00e9riode ou un autre filtre</p></div>';
  } else {
    filtered.slice(0,50).forEach(function(ev){
      var d=ev.date?new Date(ev.date):null;
      var day=d?d.getDate():'?';
      var mon=d?['jan','f\u00e9v','mar','avr','mai','jun','jul','ao\u00fb','sep','oct','nov','d\u00e9c'][d.getMonth()]:'';
      html+='<div class="ev-item">'
        +'<div class="ev-date-b"><div class="ev-d">'+day+'</div><div class="ev-m">'+mon+'</div></div>'
        +'<div style="flex:1">'
        +'<div class="ev-ttl">'+(ev.emoji?ev.emoji+' ':'')+ev.ttl+'</div>'
        +'<div class="ev-loc">'+ev.loc+(ev.time?' \u00b7 '+ev.time:'')+'</div>'
        +'<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">'
        +'<span class="ev-tag">'+ev.type+'</span>'
        +(ev.free?'<span class="ev-tag free">Gratuit</span>':'')
        +'</div>'
        +(ev.desc?'<div style="font-size:9px;color:rgba(255,255,255,.3);margin-top:3px;line-height:1.4">'+ev.desc.substring(0,100)+'</div>':'')
        +'</div></div>';
    });
  }
  return html+'</div>';
}

function buildServices(){
  return'<div class="page"><div class="pg-ey">Services Dolcia</div><div class="pg-ttl">&Agrave; votre service,<br>maintenant.</div>'
    +'<div style="font-size:11px;color:rgba(255,255,255,.38);font-weight:300;margin-bottom:16px;line-height:1.65">Prestataires valid\u00e9s Dolcia. Le premier disponible prend la mission.</div>'
    +'<div class="svc-sos" onclick="openDispatch(\'chauffeur\')"><span style="font-size:28px;flex-shrink:0">&#128663;</span><div><div style="font-family:var(--cormo);font-size:17px;color:#fff;font-weight:300">SOS Chauffeur</div><div style="font-size:10px;color:rgba(255,255,255,.45);margin-top:2px">Rentrons en s\u00e9curit\u00e9</div></div></div>'
    +'<div class="svc-grid">'
    +'<div class="svc" onclick="openDispatch(\'menage\')"><span class="svc-e">&#129529;</span><div class="svc-n">M\u00e9nage</div><div class="svc-d">Airbnb & B&B</div></div>'
    +'<div class="svc" onclick="openDispatch(\'baby\')"><span class="svc-e">&#128118;</span><div class="svc-n">Baby-sitter</div><div class="svc-d">Valid\u00e9es BAFA</div></div>'
    +'<div class="svc" onclick="openDispatch(\'vtc\')"><span class="svc-e">&#128664;</span><div class="svc-n">VTC Prestige</div><div class="svc-d">Mercedes, Tesla</div></div>'
    +'<div class="svc" onclick="snack(\'Bient\u00f4t disponible\')"><span class="svc-e">&#127870;</span><div class="svc-n">Traiteur</div><div class="svc-d">Bient\u00f4t</div></div>'
    +'<div class="svc" onclick="snack(\'Bient\u00f4t disponible\')"><span class="svc-e">&#127999;</span><div class="svc-n">Billets</div><div class="svc-d">Bient\u00f4t</div></div>'
    +'<div class="svc" onclick="openDispatch(\'conciergerie\')"><span class="svc-e">&#128273;</span><div class="svc-n">Conciergerie</div><div class="svc-d">24h/24</div></div>'
    +'</div></div>';
}

function buildSaved(){
  if(!S.saved.length)return'<div class="page"><div class="pg-ey">Mes favoris</div><div class="pg-ttl">Favoris</div><div class="empty"><div class="empty-ico">&#9825;</div><h3>Aucun favori</h3><p>Appuyez sur &#9825; pour sauvegarder</p></div></div>';
  return'<div class="page"><div class="pg-ey">Mes favoris</div><div class="pg-ttl">'+S.saved.length+' activit\u00e9'+(S.saved.length>1?'s':'')+'</div>'
    +S.saved.map(function(a){var fallback=IMGS[a.cat]||null;var th=fallback?'background-image:url("'+fallback+'");background-size:cover':cbg(a.cat);return'<div class="fav-item" data-action="open" data-id="'+a.id+'"><div class="fav-thumb" style="'+th+'"></div><div style="flex:1"><div style="font-family:var(--cormo);font-size:14px;color:#fff;font-weight:300">'+a.name+'</div><div style="font-size:9.5px;color:rgba(255,255,255,.38);margin-top:1px">'+(CI[a.cat]||'')+' &middot; '+ds(a.dist||0)+'</div></div><div style="font-size:15px;color:var(--gold2)">&rsaquo;</div></div>';}).join('')+'</div>';
}

var DISPATCH={chauffeur:{ttl:'SOS Chauffeur',sub:'Demande envoy\u00e9e.',e:'&#128663;',pr:[{n:'Marc D.',d:'Mercedes',r:'4.9'},{n:'Sophie L.',d:'Tesla',r:'4.8'}]},baby:{ttl:'Baby-sitter',sub:'BAFA, casier v\u00e9rifi\u00e9.',e:'&#128118;',pr:[{n:'Emma P.',d:'BAFA',r:'5.0'},{n:'Julie M.',d:'3 ans exp.',r:'4.9'}]},vtc:{ttl:'VTC Prestige',sub:'V\u00e9hicules premium.',e:'&#128664;',pr:[{n:'Pierre V.',d:'Mercedes Classe E',r:'4.9'}]},menage:{ttl:'M\u00e9nage',sub:'Certifi\u00e9es Dolcia.',e:'&#129529;',pr:[{n:'Maria S.',d:'5 ans exp.',r:'5.0'}]},conciergerie:{ttl:'Conciergerie',sub:'24h/24.',e:'&#128273;',pr:[{n:'Service Dolcia',d:'Disponible',r:'4.9'}]}};
function openDispatch(type){
  var cfg=DISPATCH[type];if(!cfg){snack('Bient\u00f4t disponible');return;}
  var html='<div class="s-bar"></div><div class="s-ey">Service &agrave; la demande</div><div class="s-ttl">'+cfg.ttl+'</div><div style="font-size:11.5px;color:rgba(255,255,255,.42);margin-bottom:16px">'+cfg.sub+'</div><div style="margin-bottom:14px">';
  cfg.pr.forEach(function(p,i){html+='<div class="dp" id="dp'+i+'"><div style="width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">'+cfg.e+'</div><div style="flex:1"><div style="font-size:13px;color:#fff">'+p.n+'</div><div style="font-size:10px;color:rgba(255,255,255,.38)">'+p.d+' &middot; &#9733;'+p.r+'</div></div><div id="dps'+i+'" style="font-size:9.5px;color:rgba(255,255,255,.28)">En attente&hellip;</div></div>';});
  html+='</div><button class="btn-gold" id="dbtn">Envoyer la demande &rsaquo;</button>';
  openSheet(html);
  setTimeout(function(){
    var btn=document.getElementById('dbtn');
    if(btn)btn.onclick=function(){
      cfg.pr.forEach(function(p,i){setTimeout(function(){var s=document.getElementById('dps'+i),c=document.getElementById('dp'+i);if(s){s.textContent='Alert\u00e9';s.style.color='rgba(201,168,76,.8)';}if(c)c.classList.add('alerted');},800+i*700);});
      setTimeout(function(){var s=document.getElementById('dps0'),c=document.getElementById('dp0');if(s){s.textContent='\u2713 Accept\u00e9';s.style.color='#00D084';s.style.fontWeight='600';}if(c)c.classList.add('accepted');snack('\u2713 '+cfg.pr[0].n+' arrive !');},800+cfg.pr.length*700+1200);
    };
  },100);
}

function openSheet(html){var s=document.getElementById('sheet');if(s)s.innerHTML=html;var o=document.getElementById('ov');if(o)o.style.display='flex';}
function closeSheet(){var o=document.getElementById('ov');if(o)o.style.display='none';}

document.addEventListener('click',function(e){
  var el=e.target.closest('[data-action]');if(!el)return;
  var a=el.dataset.action,id=el.dataset.id;
  if(a==='open'&&id)openDetail(id);
  else if(a==='save'&&id){e.stopPropagation();toggleSave(id);}
  else if(a==='sopen'){if(window._sid){closeSheet();setTimeout(function(){openDetail(window._sid);},50);}}
  else if(a==='other'){closeSheet();setTimeout(doSurprise,50);}
  else if(a==='cs')closeSheet();
  else if(a==='regen-slot'){e.stopPropagation();var idx=parseInt(el.dataset.idx);regenSlot(idx);}
  else if(a==='regen-all'){e.stopPropagation();regenAllStay();}
  else if(a==='close-det'){var det=document.getElementById('det');if(det)det.style.display='none';}
  else if(a==='tab'){switchTab(id);}
  else if(a==='go-agenda')switchTab('agenda');
  else if(a==='onb-pick'){var key=el.dataset.key,val=el.dataset.val;if(key&&val){S.ans[key]=val;document.querySelectorAll('.onb-opt').forEach(function(c){var ok2=c.dataset.key===key&&c.dataset.val===val;c.classList.toggle('sel',ok2);var chk=c.querySelector('.onb-opt-chk');if(chk)chk.innerHTML=ok2?'&#10003;':'';});setTimeout(advanceOnb,360);}}
});

document.addEventListener('click',function(e){
  var cat=e.target.closest('[data-cat]');
  if(cat){S.cat=cat.dataset.cat;renderCatBar();renderCards(getFiltered());return;}
  var rad=e.target.closest('[data-rad]');
  if(rad){S.radius=parseInt(rad.dataset.rad);document.querySelectorAll('.rad-b').forEach(function(b){b.classList.toggle('on',parseInt(b.dataset.rad)===S.radius);});var rh_el=document.getElementById('rad-hint');if(rh_el)rh_el.textContent=rh();S.acts=[];loadActs();}
});

document.querySelectorAll('.hpill').forEach(function(p){
  p.addEventListener('click',function(){
    document.querySelectorAll('.hpill').forEach(function(x){x.classList.remove('on');});
    p.classList.add('on');S.moment=p.dataset.p;renderHome();
  });
});

function getSplashWords(){
  var h=new Date().getHours();
  var pool;
  if(h>=5&&h<12)pool=['Petit-d\u00e9jeuner face \u00e0 la mer.','Le grand air vous attend.','Caf\u00e9 en terrasse. Maintenant.'];
  else if(h>=12&&h<14)pool=['Une bonne table. Maintenant.','Le d\u00e9jeuner vous attend.','Une pause bien m\u00e9rit\u00e9e.'];
  else if(h>=14&&h<18)pool=['Balade, spa ou farniente.','Spa &amp; bien-\u00eatre. Maintenant.','L\u2019apr\u00e8s-midi vous appartient.'];
  else if(h>=18&&h<23)pool=['D\u00eener romantique. Ce soir.','Soir\u00e9e casino. Pour l\u2019audace.','La soir\u00e9e commence.'];
  else pool=['La nuit vous appartient.','Pour les noctambules.'];
  return pool.concat(['L\u2019inattendu vous attend.']);
}
function renderSplashWords(){
  var el=document.getElementById('sp-words');if(!el)return;
  var words=getSplashWords();
  el.innerHTML=words.map(function(w){return'<div class="sp-word">'+w+'</div>';}).join('');
  el.querySelectorAll('.sp-word').forEach(function(k,i){k.style.animationDelay=(i*3+.1)+'s';});
}
window.addEventListener('load',function(){renderSplashWords();show('splash');});
