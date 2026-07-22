const store = globalThis.__dolciaCache || new Map();
globalThis.__dolciaCache = store;

export function cached(key) {
  const hit = store.get(key);
  if (!hit || hit.expires < Date.now()) {
    if (hit) store.delete(key);
    return null;
  }
  return hit.value;
}

export function remember(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  if (store.size > 400) {
    const first = store.keys().next().value;
    store.delete(first);
  }
  return value;
}
