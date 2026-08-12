function plainText(t=''){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function distanceKm(a,b,c,d){const R=6371,x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180,q=Math.sin(x/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
const CATALOG_STOPWORDS = new Set(['le','la','les','l','de','du','des','un','une','et','a','au','aux','d','en']);
function catalogNameTokens(name=''){return plainText(name).replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(token=>token.length>1&&!CATALOG_STOPWORDS.has(token));}
function catalogNameMatch(nameA='',nameB=''){const tokensA=new Set(catalogNameTokens(nameA)),tokensB=catalogNameTokens(nameB);if(!tokensA.size||!tokensB.length)return false;return tokensB.some(token=>tokensA.has(token));}
const CATALOG_MATCH_RADIUS_KM = 0.12;
const CATALOG_QUALITY_RANK = { verified: 3, documented: 2, unverified: 1 };
function mergeCatalogEntries(existing,incoming){
  const existingRank = CATALOG_QUALITY_RANK[existing.quality] || 0;
  const incomingRank = CATALOG_QUALITY_RANK[incoming.quality] || 0;
  const primary = incomingRank > existingRank ? incoming : existing;
  const secondary = incomingRank > existingRank ? existing : incoming;
  const merged = { ...secondary, ...Object.fromEntries(Object.entries(primary).filter(([,value])=>value!=null&&value!=='')) };
  merged.sources = [...new Set([...(existing.sources||[existing.source]),...(incoming.sources||[incoming.source])].filter(Boolean))];
  merged.photos = [...new Set([...(existing.photos||[]),...(incoming.photos||[])])];
  merged.bookingUrl = incoming.bookingUrl || existing.bookingUrl || null;
  return merged;
}
function mergeIntoMasterCatalog(existingItems,incomingItems){
  const catalog=[...existingItems];
  for(const incoming of incomingItems){
    const matchIndex=catalog.findIndex(existing=>{
      if(!Number.isFinite(incoming.lat)||!Number.isFinite(incoming.lng))return false;
      if(!Number.isFinite(existing.lat)||!Number.isFinite(existing.lng))return false;
      if(distanceKm(incoming.lat,incoming.lng,existing.lat,existing.lng)>CATALOG_MATCH_RADIUS_KM)return false;
      return catalogNameMatch(incoming.name,existing.name);
    });
    if(matchIndex===-1){catalog.push(incoming);continue}
    catalog[matchIndex]=mergeCatalogEntries(catalog[matchIndex],incoming);
  }
  return catalog;
}

console.log('=== Cas exact de la discussion : Bagatelle vu par Dolcia (Google Places) puis par Viator ===');
const dolciaVersion = [{ id: 'g-bagatelle', name: 'Bagatelle', source: 'Google Places', quality: 'documented', lat: 50.5089, lng: 1.5766, rating: 4.3, photos: ['/g1.jpg'] }];
const viatorVersion = [{ id: 'viator-9284', name: "Parc d'Attractions Bagatelle", source: 'Viator', quality: 'verified', lat: 50.5091, lng: 1.5768, bookingUrl: 'https://viator.com/bagatelle', photos: ['/v1.jpg'] }];
const catalog = mergeIntoMasterCatalog(dolciaVersion, viatorVersion);
console.log('Nombre de fiches dans le catalogue (attendu: 1, jamais 2) ->', catalog.length);
console.log('Fiche fusionnée:', JSON.stringify(catalog[0], null, 2));

console.log('\n=== Cas négatif : deux restaurants différents, "Le Phare", dans deux villes différentes ===');
const phareTouquet = [{ id: 'r1', name: 'Le Phare', source: 'Google Places', quality: 'documented', lat: 50.52, lng: 1.59 }];
const phareAilleurs = [{ id: 'r2', name: 'Le Phare', source: 'Google Places', quality: 'documented', lat: 43.5, lng: 5.4 }];
const catalog2 = mergeIntoMasterCatalog(phareTouquet, phareAilleurs);
console.log('Nombre de fiches (attendu: 2, ce sont deux lieux différents) ->', catalog2.length);
