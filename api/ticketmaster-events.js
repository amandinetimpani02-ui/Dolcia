import { cached, remember } from './_cache.js';

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');
  const key=process.env.TICKETMASTER_KEY;
  if(!key)return res.status(200).json({events:[],unavailable:true,reason:'TICKETMASTER_KEY absent'});
  const {lat,lng,radius=12,after,before}=req.query;
  if(!lat||!lng)return res.status(400).json({events:[],error:'Coordonnées manquantes'});
  const cacheKey=`ticketmaster:${lat}:${lng}:${radius}:${after}:${before}`;
  const hit=cached(cacheKey);if(hit)return res.status(200).json(hit);
  const params=new URLSearchParams({apikey:key,latlong:`${lat},${lng}`,radius:String(radius),unit:'km',locale:'fr-fr',size:'100',sort:'date,asc'});
  if(after)params.set('startDateTime',`${String(after).slice(0,10)}T00:00:00Z`);
  if(before)params.set('endDateTime',`${String(before).slice(0,10)}T23:59:59Z`);
  try{
    const response=await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
    if(!response.ok)throw new Error(`Ticketmaster ${response.status}`);
    const data=await response.json();
    const events=(data._embedded?.events||[]).map(event=>({
      id:`ticketmaster-${event.id}`,title:event.name,date:event.dates?.start?.dateTime||event.dates?.start?.localDate,
      location:[event._embedded?.venues?.[0]?.name,event._embedded?.venues?.[0]?.address?.line1,event._embedded?.venues?.[0]?.city?.name].filter(Boolean).join(', '),
      lat:Number(event._embedded?.venues?.[0]?.location?.latitude)||null,lng:Number(event._embedded?.venues?.[0]?.location?.longitude)||null,
      image:[...(event.images||[])].sort((a,b)=>(b.width||0)-(a.width||0))[0]?.url||null,
      registrationUrl:event.url||null,source:'Ticketmaster',official:true,type:event.classifications?.[0]?.segment?.name||'Événement'
    }));
    return res.status(200).json(remember(cacheKey,{events,source:'Ticketmaster'},15*60*1000));
  }catch(error){return res.status(200).json({events:[],unavailable:true,error:error.message})}
}
