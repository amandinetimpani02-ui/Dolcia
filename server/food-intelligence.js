const TYPE_LABELS = Object.freeze({
  italian_restaurant: 'Italien', japanese_restaurant: 'Japonais', sushi_restaurant: 'Sushi', french_restaurant: 'Français',
  seafood_restaurant: 'Fruits de mer', pizza_restaurant: 'Pizza', hamburger_restaurant: 'Burger', indian_restaurant: 'Indien',
  thai_restaurant: 'Thaï', chinese_restaurant: 'Chinois', mediterranean_restaurant: 'Méditerranéen',
  vegetarian_restaurant: 'Végétarien', vegan_restaurant: 'Vegan', brunch_restaurant: 'Brunch',
  fast_food_restaurant: 'Restauration rapide', cafe: 'Café', bakery: 'Boulangerie'
});

const plain = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function foodSubcategory(item) {
  if (item?.category !== 'food') return null;
  for (const type of item.types || []) if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  const text = plain(`${item.name || ''} ${item.description || ''}`);
  const rules = [[/friterie|baraque a frites|fricadelle/,'Friterie'],[/poke|healthy|salade|leger/,'Salade & léger'],[/gastronom|etoile|michelin/,'Gastronomique'],[/brunch/,'Brunch'],[/fruit.? de mer|poisson|huitre/,'Fruits de mer'],[/sushi|maki|japon/,'Sushi'],[/pizza|pizzeria/,'Pizza'],[/burger|hamburger/,'Burger'],[/creperie|galette/,'Crêperie'],[/italien|pasta|trattoria/,'Italien'],[/vegetar|vegan/,'Végétarien']];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || null;
}

export function foodContextualDelta(item, context, memory = {}) {
  const kind = foodSubcategory(item);
  if (!kind) return { delta: 0, kind: null, reasons: [] };
  let delta = Number(memory.tasteProfile?.[`food:${kind}`] || 0) * 4;
  const reasons = [];
  if (['free','budget1'].includes(context.budget)) {
    if (kind === 'Gastronomique' || Number(item.price) >= 3) delta -= 25;
    if (['Friterie','Restauration rapide','Pizza','Crêperie'].includes(kind) || Number(item.price) <= 1) delta += 14;
    reasons.push('accordé au budget de ce moment');
  }
  if (context.budget === 'custom' && context.budgetAmount != null) {
    const perPerson = context.budgetAmount / Math.max(1, context.groupSize || 1);
    if (perPerson < 25 && (kind === 'Gastronomique' || Number(item.price) >= 3)) delta -= 25;
    if (perPerson < 25 && ['Friterie','Pizza','Crêperie','Salade & léger'].includes(kind)) delta += 12;
  }
  if (context.who === 'family' && ['Pizza','Burger','Crêperie','Friterie'].includes(kind)) delta += 6;
  if (/rain|drizzle|thunder|snow/.test(context.weather || '') && ['Café','Brunch','Crêperie'].includes(kind)) delta += 5;
  return { delta, kind, reasons };
}

export function gemFairnessDelta(item) {
  const text = plain(`${item.name || ''} ${item.type || ''} ${item.description || ''} ${item.source || ''}`);
  return /datatourisme|association|atelier|artisan|braderie|vide.grenier|fete de village|ferme|patrimoine/.test(text) ? 12 : 0;
}
