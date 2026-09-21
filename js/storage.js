// filepath: js/storage.js
const KEY_FAVS = 'wb_favorites';
const KEY_RECENTS = 'wb_recents';
const KEY_CTX = 'wb_context';

function safeParse(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function safeSet(storage, key, val) {
  try { storage.setItem(key, JSON.stringify(val)); } catch {}
}

export const Storage = {
  getFavorites: () => safeParse(localStorage.getItem(KEY_FAVS), []),
  isFavorite: (id) => Storage.getFavorites().includes(id),
  toggleFavorite: (id) => {
    const favs = new Set(Storage.getFavorites());
    favs.has(id) ? favs.delete(id) : favs.add(id);
    safeSet(localStorage, KEY_FAVS, [...favs]);
  },
  getRecents: () => safeParse(localStorage.getItem(KEY_RECENTS), []),
  pushRecent: (id) => {
    const list = [id, ...Storage.getRecents().filter(x => x !== id)].slice(0, 10);
    safeSet(localStorage, KEY_RECENTS, list);
  },
  getContext: () => safeParse(sessionStorage.getItem(KEY_CTX), {}),
  setContext: (data) => {
    const next = { ...Storage.getContext(), ...data };
    safeSet(sessionStorage, KEY_CTX, next);
    return next;
  },
  clearContext: () => {
    try { sessionStorage.removeItem(KEY_CTX); } catch {}
  }
};