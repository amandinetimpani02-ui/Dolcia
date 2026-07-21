import { DECISION_CODES as C, validateDecisionCodes, DECISION_CODES_VERSION } from './decision-codes.js';

export const GEO_RULES_VERSION = '1.0.1';

export const GEO_THRESHOLDS = Object.freeze({
  locationReliable: 0.85,
  locationUsable: 0.5,
  travelMinutes: { '2h': 15, evening: 15, morning: 25, afternoon: 30, afternoon_evening: 35, day: 45, stay: 90 }
});

function km(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

function openForArrival(periods, arrival, minimumMinutes = 60) {
  if (!Array.isArray(periods) || !periods.length || !(arrival instanceof Date) || Number.isNaN(arrival.getTime())) return null;
  const target = arrival.getDay() * 1440 + arrival.getHours() * 60 + arrival.getMinutes();
  return periods.some(period => {
    if (!period?.open) return false;
    const value = point => point.day * 1440 + Number(String(point.time || '0000').slice(0, 2)) * 60 + Number(String(point.time || '0000').slice(2, 4));
    const start = value(period.open);
    let end = period.close ? value(period.close) : start + 24 * 60;
    if (end <= start) end += 7 * 1440;
    const adjusted = target < start && target + 7 * 1440 >= start ? target + 7 * 1440 : target;
    return adjusted >= start && adjusted + minimumMinutes <= end;
  });
}

const TRUSTED_EVIDENCE_TYPES = new Set(['official_website', 'official_site_jsonld', 'tourism_office', 'ticketing_platform', 'verified_partner', 'partner_declared_and_checked', 'editorial_review', 'editorial_verified']);
const EVIDENCE_MAX_AGE_DAYS = 365;

export function evaluateRarityEvidence(value) {
  if (value?.level === 'low') return { level: 'low', evidence: null, codes: [C.LOW_RARITY] };
  if (value?.level !== 'high') return { level: 'unknown', evidence: null, codes: [C.RARITY_UNVERIFIED, C.EVIDENCE_MISSING] };
  if (!value.source || !value.checkedAt) return { level: 'unknown', evidence: null, codes: [C.RARITY_UNVERIFIED, C.EVIDENCE_MISSING] };
  if (!TRUSTED_EVIDENCE_TYPES.has(value.sourceType)) return { level: 'unknown', evidence: null, codes: [C.RARITY_UNVERIFIED, C.EVIDENCE_UNTRUSTED_SOURCE] };
  const checkedAt = new Date(value.checkedAt).getTime();
  if (!Number.isFinite(checkedAt) || Math.abs(Date.now() - checkedAt) / 86400000 > EVIDENCE_MAX_AGE_DAYS) return { level: 'unknown', evidence: null, codes: [C.RARITY_UNVERIFIED, C.EVIDENCE_STALE] };
  return { level: 'high', evidence: value, codes: [C.HIGH_RARITY, C.EVIDENCE_VALID] };
}

export async function classifyCandidate(candidate, context, services = {}) {
  const codes = [], blocking = [], evidence = [];
  const confidence = Number(candidate.locationConfidence ?? (Number.isFinite(candidate.lat) && Number.isFinite(candidate.lng) ? 0.9 : 0));
  if (!Number.isFinite(candidate.lat) || !Number.isFinite(candidate.lng) || confidence < GEO_THRESHOLDS.locationUsable) {
    codes.push(C.COORDINATES_UNRELIABLE); blocking.push(C.COORDINATES_UNRELIABLE);
    return finish('location_unknown', codes, blocking, evidence, null, null, confidence, context);
  }
  codes.push(confidence >= GEO_THRESHOLDS.locationReliable ? C.COORDINATES_RELIABLE : C.COORDINATES_USABLE_APPROXIMATE);
  if (!candidate.adminComponents) codes.push(C.ADMIN_COMPONENTS_INCOMPLETE);
  if (candidate.businessStatus === 'CLOSED_PERMANENTLY') {
    codes.push(C.CLOSED_PERMANENTLY); blocking.push(C.CLOSED_PERMANENTLY);
    return finish('outside', codes, blocking, evidence, km(context.origin, candidate), null, confidence, context);
  }
  if (candidate.audienceCompatible === false) { codes.push(C.AUDIENCE_INCOMPATIBLE); blocking.push(C.AUDIENCE_INCOMPATIBLE); }
  if (candidate.dateCompatible === false) { codes.push(C.DATE_INCOMPATIBLE); blocking.push(C.DATE_INCOMPATIBLE); }

  const distance = km(context.origin, candidate);
  const travelMinutes = await (services.travelMinutes ? services.travelMinutes(context.origin, candidate, context.travelMode || 'driving') : Promise.resolve(candidate.travelMinutes ?? null));
  const wide = candidate.retrievalScope === 'signature' || candidate.categoryScope === 'wide';
  codes.push(wide ? C.CATEGORY_SCOPE_WIDE : C.CATEGORY_SCOPE_NARROW);
  const baseBudget = GEO_THRESHOLDS.travelMinutes[context.duration] ?? 30;
  const budget = wide ? baseBudget * 1.35 : baseBudget;
  if (travelMinutes == null) codes.push(C.TRAVEL_TIME_UNAVAILABLE);
  else if (travelMinutes <= budget) codes.push(C.TRAVEL_COMPATIBLE_WITH_DURATION);
  else { codes.push(C.TRAVEL_INCOMPATIBLE_WITH_DURATION); blocking.push(C.TRAVEL_INCOMPATIBLE_WITH_DURATION); }

  const arrival = new Date(context.start || Date.now());
  if (travelMinutes != null) arrival.setMinutes(arrival.getMinutes() + travelMinutes);
  const compatible = openForArrival(candidate.openingPeriods, arrival, context.minimumVisitMinutes || 60);
  if (candidate.officialEvent === true && candidate.dateCompatible !== false) codes.push(C.HOURS_COMPATIBLE);
  else if (compatible === true) codes.push(C.HOURS_COMPATIBLE);
  else if (compatible === false) { codes.push(C.HOURS_INCOMPATIBLE); blocking.push(C.HOURS_INCOMPATIBLE); }
  else codes.push(C.HOURS_UNKNOWN);

  const rarityResult = evaluateRarityEvidence(candidate.rarityEvidence);
  const rarity = rarityResult.level;
  codes.push(...rarityResult.codes);
  if (rarityResult.evidence) evidence.push(rarityResult.evidence);
  if (rarity === 'unknown' && candidate.retrievalScope === 'signature') codes.push(C.SOURCE_EVIDENCE_MISSING);
  codes.push(context.userWidenedSearch ? C.USER_WIDENED_SEARCH : C.DEFAULT_SCOPE);

  // Une faible distance à vol d'oiseau ne suffit pas : sur une baie, une rivière ou
  // une frontière communale, le trajet réel et la destination choisie priment.
  const localityMismatch = candidate.destinationLocalityMatch === false && distance > 2;
  const localFit = candidate.retrievalScope !== 'signature' && !localityMismatch && distance <= Math.min(8, Math.max(3, baseBudget / 4)) && codes.includes(C.TRAVEL_COMPATIBLE_WITH_DURATION) && !blocking.length;
  let status = localFit ? 'core' : 'outside';
  if (!blocking.length && !localFit && codes.includes(C.TRAVEL_COMPATIBLE_WITH_DURATION) && (rarity === 'high' || context.userWidenedSearch)) status = 'extended';
  if (codes.includes(C.HOURS_UNKNOWN) && context.surface !== 'explorer') { blocking.push(C.HOURS_UNKNOWN); status = 'outside'; }
  return finish(status, codes, [...new Set(blocking)], evidence, distance, travelMinutes, confidence, context);
}

export function applyAlternativeCheck(items = []) {
  const cores = items.filter(item => item.result?.status === 'core');
  return items.map(item => {
    if (item.result?.status !== 'extended') return item;
    const equivalent = cores.some(core => core.category === item.category && core.experienceKind === item.experienceKind && Math.abs((core.qualityScore || 0) - (item.qualityScore || 0)) <= 10);
    const code = equivalent ? C.CORE_EQUIVALENT_EXISTS : C.NO_CORE_EQUIVALENT;
    return { ...item, result: finish(equivalent ? 'outside' : 'extended', [...item.result.decision_codes, code], equivalent ? [...item.result.blocking_reasons, code] : item.result.blocking_reasons, item.result.evidence, item.result.distance_km, item.result.travel_minutes, item.result.location_confidence, { travelMode: item.result.travel_mode }) };
  });
}

function finish(status, codes, blocking, evidence, distance, travelMinutes, confidence, context) {
  const unique = [...new Set(codes)], validation = validateDecisionCodes(unique);
  if (!validation.valid) throw new Error(`Invalid decision codes: ${JSON.stringify(validation)}`);
  const rarityTrustedWhenRequired = status !== 'extended' || unique.includes(C.HIGH_RARITY) || unique.includes(C.USER_WIDENED_SEARCH);
  const premiumEligible = ['core', 'extended'].includes(status) && blocking.length === 0 && !unique.includes(C.HOURS_UNKNOWN) && rarityTrustedWhenRequired && !unique.includes(C.EVIDENCE_UNTRUSTED_SOURCE);
  return { status, premium_eligible: premiumEligible, decision_codes_version: DECISION_CODES_VERSION, geo_rules_version: GEO_RULES_VERSION, decision_codes: unique, distance_km: distance == null ? null : Math.round(distance * 10) / 10, travel_minutes: travelMinutes, travel_mode: context.travelMode || 'driving', location_confidence: confidence, blocking_reasons: [...new Set(blocking)], evidence };
}
