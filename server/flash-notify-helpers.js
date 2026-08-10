// Fonctions pures du pipeline de notification push, séparées de flash-notify.js pour rester
// testables sans dépendre du paquet web-push (ni du réseau) : la logique de filtrage/dédoublonnage
// est ce qui peut réellement se tromper silencieusement, donc c'est ce qui doit être vérifié.

const EARTH_RADIUS_KM = 6371;
function distanceKm(lat1, lng1, lat2, lng2) {
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ne garde qu'un abonnement par offre : jamais déjà notifié pour cette offre précise, et dans le
// rayon annoncé de l'offre (ou gardé si la position est inconnue, plutôt que de le perdre en silence).
export function filterEligibleSubscriptions(subscriptions, offer, alreadyNotifiedEndpoints = []) {
  const notified = new Set(alreadyNotifiedEndpoints);
  const radiusKm = Number(offer.radius_km) || 15;
  return (subscriptions || []).filter(sub => {
    if (notified.has(sub.endpoint)) return false;
    if (sub.latitude == null || sub.longitude == null || offer.latitude == null || offer.longitude == null) return true;
    const distance = distanceKm(sub.latitude, sub.longitude, offer.latitude, offer.longitude);
    return distance == null || distance <= radiusKm;
  });
}

export function buildPushPayload(offer) {
  const savingPercent = offer.original_price && offer.dolcia_price
    ? Math.round((1 - offer.dolcia_price / offer.original_price) * 100)
    : null;
  return JSON.stringify({
    title: 'Une occasion vérifiée vient de se libérer',
    body: `${offer.title}${savingPercent ? ` · -${savingPercent}%` : ''}`,
    url: '/agenda',
    tag: `flash-offer-${offer.id}`
  });
}
