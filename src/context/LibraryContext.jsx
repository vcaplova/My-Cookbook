import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { SEED_COLLECTIONS, SEED_RECIPES } from '../lib/seed';
import { storage } from '../lib/storage';
import { parseMinutes } from '../lib/utils';
import { PALETTES, DEFAULT_PALETTE, applyPalette } from '../lib/palettes';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [globalTags, setGlobalTags] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [shoppingList, setShoppingList] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // View/filter state
  const [view, setView] = useState('grid');
  const [unitMode, setUnitMode] = useState('original');
  const [filter, setFilter] = useState('all'); // 'all' | 'recent' | 'favourites' | 'col:<id>'
  const [activeTags, setActiveTags] = useState([]);
  const [search, setSearch] = useState('');
  const [maxTime, setMaxTime] = useState(0);
  const [servingsBand, setServingsBand] = useState('');

  // Palette
  const [palette, setPaletteState] = useState(DEFAULT_PALETTE);

  // Toast + confirm
  const [toastState, setToastState] = useState(null);
  const toastTimer = useRef(null);
  const [confirmState, setConfirmState] = useState(null);

  // Load once
  useEffect(() => {
    (async () => {
      const data = await storage.loadLibrary();
      if (data) {
        setRecipes(Array.isArray(data.recipes) && data.recipes.length ? data.recipes : SEED_RECIPES);
        setCollections(Array.isArray(data.collections) && data.collections.length ? data.collections : SEED_COLLECTIONS);
        setGlobalTags(Array.isArray(data.globalTags) ? data.globalTags : []);
        setNextId(typeof data.nextId === 'number' ? data.nextId : 100);
        setShoppingList(Array.isArray(data.shoppingList) ? data.shoppingList : []);
        if (data.view === 'list') setView('list');
      } else {
        setRecipes(SEED_RECIPES);
        setCollections(SEED_COLLECTIONS);
        setNextId(7);
      }
      const savedPalette = storage.getPalette();
      const key = savedPalette && PALETTES[savedPalette] ? savedPalette : DEFAULT_PALETTE;
      setPaletteState(key);
      applyPalette(key);
      setLoaded(true);
    })();
  }, []);

  const toast = useCallback((msg, ok = false) => {
    clearTimeout(toastTimer.current);
    setToastState({ msg, ok });
    toastTimer.current = setTimeout(() => setToastState(null), 2600);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const ok = await storage.saveLibrary({ recipes, collections, nextId, view, globalTags, shoppingList });
      if (!ok) {
        toast("Storage is full — this change wasn't saved. Try removing a photo or two.");
      }
    })();
  }, [recipes, collections, nextId, view, globalTags, shoppingList, loaded, toast]);

  const confirm = useCallback((message, onConfirm, confirmLabel = 'Delete') => {
    setConfirmState({ message, onConfirm, confirmLabel });
  }, []);

  const setPalette = useCallback((key) => {
    if (!PALETTES[key]) return;
    setPaletteState(key);
    applyPalette(key);
    storage.setPalette(key);
  }, []);

  // ── Recipe actions ─────────────────────────────
  const addRecipe = useCallback((draft) => {
    setRecipes((rs) => {
      return [...rs, { ...draft, id: nextIdRef.current, starred: false, pinned: false, addedAt: Date.now() }];
    });
    setNextId((n) => n + 1);
  }, []);

  // keep a ref to nextId to avoid stale closure in addRecipe
  const nextIdRef = useRef(nextId);
  useEffect(() => { nextIdRef.current = nextId; }, [nextId]);

  const updateRecipe = useCallback((id, patch) => {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteRecipe = useCallback((id) => {
    setRecipes((rs) => rs.filter((r) => r.id !== id));
  }, []);

  const toggleStar = useCallback((id) => {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r)));
  }, []);

  const togglePin = useCallback((id) => {
    setRecipes((rs) => rs.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)));
  }, []);

  // ── Collection actions ─────────────────────────
  const addCollection = useCallback((name, color, emoji) => {
    const id = name.trim();
    if (!id) return false;
    let ok = true;
    setCollections((cs) => {
      if (cs.some((c) => c.id.toLowerCase() === id.toLowerCase())) { ok = false; return cs; }
      return [...cs, { id, name: id, color, emoji }];
    });
    return ok;
  }, []);

  const updateCollection = useCallback((id, patch) => {
    setCollections((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCollection = useCallback((id) => {
    setCollections((cs) => cs.filter((c) => c.id !== id));
    setRecipes((rs) => rs.map((r) => ({ ...r, collections: r.collections.filter((c) => c !== id) })));
  }, []);

  // ── Tags ───────────────────────────────────────
  const allTags = useMemo(() => {
    const map = {};
    recipes.forEach((r) => r.tags.forEach((t) => { map[t] = 1; }));
    globalTags.forEach((t) => { map[t] = 1; });
    return Object.keys(map).sort();
  }, [recipes, globalTags]);

  const renameTag = useCallback((oldTag, newTagRaw) => {
    const newTag = newTagRaw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!newTag || newTag === oldTag) return;
    setRecipes((rs) => rs.map((r) => {
      const idx = r.tags.indexOf(oldTag);
      if (idx < 0) return r;
      const tags = r.tags.slice();
      if (tags.indexOf(newTag) < 0) tags[idx] = newTag; else tags.splice(idx, 1);
      return { ...r, tags };
    }));
    setGlobalTags((ts) => ts.map((t) => (t === oldTag ? newTag : t)));
    setActiveTags((ts) => ts.map((t) => (t === oldTag ? newTag : t)));
  }, []);

  const removeTag = useCallback((tag) => {
    setRecipes((rs) => rs.map((r) => (r.tags.includes(tag) ? { ...r, tags: r.tags.filter((t) => t !== tag) } : r)));
    setGlobalTags((ts) => ts.filter((t) => t !== tag));
    setActiveTags((ts) => ts.filter((t) => t !== tag));
  }, []);

  // ── Shopping list ────────────────────────────────
  const shoppingListRef = useRef(shoppingList);
  useEffect(() => { shoppingListRef.current = shoppingList; }, [shoppingList]);

  const addToShoppingList = useCallback((recipeId, recipeTitle, text) => {
    const already = shoppingListRef.current.some((i) => i.recipeId === recipeId && i.text === text);
    if (already) {
      toast('Already on your shopping list');
      return;
    }
    setShoppingList((list) => [...list, { id: Date.now() + Math.random(), recipeId, recipeTitle, text, checked: false }]);
    toast('Added to shopping list', true);
  }, [toast]);

  const addAllToShoppingList = useCallback((recipeId, recipeTitle, ingredientTexts) => {
    const existing = shoppingListRef.current.filter((i) => i.recipeId === recipeId).map((i) => i.text);
    const newOnes = ingredientTexts.filter((ing) => !existing.includes(ing));
    if (!newOnes.length) {
      toast('All ingredients are already on your list');
      return;
    }
    setShoppingList((list) => [
      ...list,
      ...newOnes.map((text) => ({ id: Date.now() + Math.random(), recipeId, recipeTitle, text, checked: false })),
    ]);
    toast(`Added ${newOnes.length} ingredient${newOnes.length > 1 ? 's' : ''} to shopping list`, true);
  }, [toast]);

  const toggleShoppingItem = useCallback((itemId) => {
    setShoppingList((list) => list.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)));
  }, []);

  const removeShoppingItem = useCallback((itemId) => {
    setShoppingList((list) => list.filter((i) => i.id !== itemId));
  }, []);

  const addManualShoppingItem = useCallback((text) => {
    const t = text.trim();
    if (!t) return;
    setShoppingList((list) => [...list, { id: Date.now() + Math.random(), recipeId: null, recipeTitle: null, text: t, checked: false }]);
  }, []);

  const clearCheckedShoppingItems = useCallback(() => {
    setShoppingList((list) => list.filter((i) => !i.checked));
  }, []);

  const clearShoppingList = useCallback(() => {
    setShoppingList([]);
  }, []);

  // ── Library-level actions ──────────────────────
  const clearLibrary = useCallback(() => {
    storage.clearLibrary();
    setRecipes([]);
    setCollections(SEED_COLLECTIONS);
    setGlobalTags([]);
    setNextId(1);
  }, []);

  const exportJSON = useCallback(() => {
    try {
      const data = { recipes, collections };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cookbook-library.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Library exported', true);
    } catch (e) {
      toast('Export failed: ' + e.message);
    }
  }, [recipes, collections, toast]);

  // ── Filtered list ──────────────────────────────
  const filtered = useMemo(() => {
    const now = Date.now();
    let list = recipes.slice();
    if (filter === 'recent') list = list.filter((r) => now - r.addedAt < 1000 * 60 * 60 * 36);
    else if (filter === 'favourites') list = list.filter((r) => r.starred);
    else if (filter.indexOf('col:') === 0) {
      const colId = filter.slice(4);
      list = list.filter((r) => r.collections.indexOf(colId) >= 0);
    }
    if (activeTags.length) list = list.filter((r) => activeTags.every((t) => r.tags.indexOf(t) >= 0));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().indexOf(q) >= 0 ||
        r.tags.some((t) => t.indexOf(q) >= 0) ||
        r.collections.some((c) => String(c).toLowerCase().indexOf(q) >= 0));
    }
    if (maxTime) list = list.filter((r) => parseMinutes(r.cookTime) <= maxTime);
    if (servingsBand) {
      list = list.filter((r) => {
        const s = r.servings || 0;
        if (servingsBand === '1') return s <= 2;
        if (servingsBand === '4') return s >= 3 && s <= 4;
        if (servingsBand === '6') return s >= 5 && s <= 6;
        if (servingsBand === '8') return s >= 7;
        return true;
      });
    }
    // Pinned recipes first, then newest
    list.sort((a, b) => (b.pinned - a.pinned) || (b.addedAt - a.addedAt));
    return list;
  }, [recipes, filter, activeTags, search, maxTime, servingsBand]);

  const colById = useCallback((id) => collections.find((c) => c.id === id), [collections]);

  const value = {
    loaded, recipes, collections, filtered, allTags,
    view, setView, filter, setFilter, activeTags, setActiveTags,
    search, setSearch, maxTime, setMaxTime, servingsBand, setServingsBand,
    palette, setPalette, unitMode, setUnitMode,
    addRecipe, updateRecipe, deleteRecipe, toggleStar, togglePin,
    addCollection, updateCollection, deleteCollection, colById,
    renameTag, removeTag, clearLibrary, exportJSON,
    shoppingList, addToShoppingList, addAllToShoppingList, toggleShoppingItem,
    removeShoppingItem, addManualShoppingItem, clearCheckedShoppingItems, clearShoppingList,
    toastState, toast, confirmState, setConfirmState, confirm,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
