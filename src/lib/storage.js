// Storage layer with a swappable adapter, so the app is backend-ready.
// Today: localStorage. Tomorrow: swap in an ApiStorageAdapter that talks to a
// server without touching any component code.

const STORAGE_KEY = 'mise_en_place_v1';
const PALETTE_KEY = 'mep-palette';
const API_KEY_KEY = 'mep-anthropic-key';

export class LocalStorageAdapter {
  async loadLibrary() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== 1) return null;
      return data;
    } catch (e) {
      console.warn('Could not load library:', e);
      return null;
    }
  }

  async saveLibrary(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, ...data }));
    } catch (e) {
      console.warn('Could not save library:', e);
    }
  }

  async clearLibrary() {
    localStorage.removeItem(STORAGE_KEY);
  }

  getPalette() {
    return localStorage.getItem(PALETTE_KEY);
  }
  setPalette(key) {
    localStorage.setItem(PALETTE_KEY, key);
  }

  getApiKey() {
    return localStorage.getItem(API_KEY_KEY) || '';
  }
  setApiKey(key) {
    if (key) localStorage.setItem(API_KEY_KEY, key);
    else localStorage.removeItem(API_KEY_KEY);
  }
}

// Example skeleton for a future backend:
// export class ApiStorageAdapter {
//   constructor(baseUrl, token) { this.baseUrl = baseUrl; this.token = token; }
//   async loadLibrary() { return (await fetch(`${this.baseUrl}/library`)).json(); }
//   async saveLibrary(data) { await fetch(`${this.baseUrl}/library`, { method: 'PUT', body: JSON.stringify(data) }); }
// }

export const storage = new LocalStorageAdapter();
