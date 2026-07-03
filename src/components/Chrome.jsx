import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import {
  BrandIcon, SearchIcon, SettingsIcon,
  GridIcon, ListIcon, PlusIcon, BookIcon, ClockIcon, StarIcon, WarnIcon,
} from './Icons';
import { useState } from 'react';
import { useIsMobile } from '../lib/useIsMobile';

export function TopBar({ onAdd, onSettings }) {
  const { search, setSearch, view, setView, setFilter, setActiveTags } = useLibrary();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchActive, setSearchActive] = useState(false);

  const cancelSearch = () => { setSearch(''); setSearchActive(false); };
  const closeSearch = () => setSearchActive(false);

  if (isMobile && searchActive) {
    return (
      <header className="topbar topbar-search-active">
        <div className="search-wrap search-wrap-expanded">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="Search recipes, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') closeSearch(); }}
          />
        </div>
        <button type="button" className="search-cancel-btn" onClick={cancelSearch}>Cancel</button>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div className="brand" style={{ cursor: 'pointer' }} onClick={() => { setFilter('all'); setActiveTags([]); navigate('/'); }}>
        <div className="brand-icon"><BrandIcon /></div>
        <div className="brand-name">My Cookbook<small>Recipe Library</small></div>
      </div>
      <div className="topbar-mid">
        {isMobile ? (
          <button type="button" className="search-wrap search-wrap-btn" onClick={() => setSearchActive(true)}>
            <SearchIcon className="search-icon" />
            <span className={search ? 'search-fake-input has-value' : 'search-fake-input'}>
              {search || 'Search recipes, tags…'}
            </span>
          </button>
        ) : (
          <div className="search-wrap">
            <SearchIcon className="search-icon" />
            <input type="text" placeholder="Search recipes, tags…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}
      </div>
      <div className="topbar-right">
        <button className="btn-icon" title="Settings" onClick={onSettings}><SettingsIcon /></button>
        <div className="view-toggle">
          <button className={view === 'grid' ? 'vbtn on' : 'vbtn'} title="Grid" onClick={() => setView('grid')}><GridIcon /></button>
          <button className={view === 'list' ? 'vbtn on' : 'vbtn'} title="List" onClick={() => setView('list')}><ListIcon /></button>
        </div>
        <button className="btn-add" onClick={onAdd}>
          <PlusIcon stroke="#fff" /> <span className="btn-add-label">Add Recipe</span>
        </button>
      </div>
    </header>
  );
}

export function Sidebar({ onNewCollection }) {
  const { recipes, collections, filter, setFilter } = useLibrary();
  const navigate = useNavigate();
  const now = Date.now();
  const counts = {
    all: recipes.length,
    recent: recipes.filter((r) => now - r.addedAt < 1000 * 60 * 60 * 36).length,
    fav: recipes.filter((r) => r.starred).length,
  };
  const go = (f) => { setFilter(f); navigate('/'); };
  return (
    <nav className="sidebar">
      <div>
        <p className="sb-label">Library</p>
        <div className={filter === 'all' ? 'nav-item active' : 'nav-item'} onClick={() => go('all')}>
          <span className="nav-icon"><BookIcon /></span>
          <span className="nav-text">All Recipes</span>
          <span className="nav-count">{counts.all}</span>
        </div>
        <div className={filter === 'recent' ? 'nav-item active' : 'nav-item'} onClick={() => go('recent')}>
          <span className="nav-icon"><ClockIcon /></span>
          <span className="nav-text">Recently Added</span>
          <span className="nav-count">{counts.recent}</span>
        </div>
        <div className={filter === 'favourites' ? 'nav-item active' : 'nav-item'} onClick={() => go('favourites')}>
          <span className="nav-icon"><StarIcon /></span>
          <span className="nav-text">Favourites</span>
          <span className="nav-count">{counts.fav}</span>
        </div>
      </div>
      <div className="sb-divider"></div>
      <div>
        <p className="sb-label">Collections</p>
        <div>
          {collections.map((c) => {
            const count = recipes.filter((r) => r.collections.indexOf(c.id) >= 0).length;
            const f = 'col:' + c.id;
            return (
              <div key={c.id} className={filter === f ? 'nav-item active' : 'nav-item'} onClick={() => go(f)}>
                <span className="nav-icon" style={{ fontSize: 15 }}>{c.emoji || '🍽'}</span>
                <span className="nav-text">{c.name}</span>
                <span className="nav-count">{count}</span>
              </div>
            );
          })}
        </div>
        <button className="btn-new-col" onClick={onNewCollection}>
          <PlusIcon size={13} strokeWidth={2.5} /> New collection
        </button>
      </div>
    </nav>
  );
}

export function Toast() {
  const { toastState } = useLibrary();
  if (!toastState) return null;
  return <div className={toastState.ok ? 'toast show ok' : 'toast show'}>{toastState.msg}</div>;
}

export function ConfirmDialog() {
  const { confirmState, setConfirmState } = useLibrary();
  if (!confirmState) return null;
  const close = () => setConfirmState(null);
  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal" style={{ width: 400 }}>
        <div className="del-confirm">
          <div className="del-confirm-icon"><WarnIcon /></div>
          <p>{confirmState.message}</p>
          <div className="del-confirm-btns">
            <button className="btn-del-cancel" onClick={close}>Cancel</button>
            <button className="btn-del-confirm" onClick={() => { confirmState.onConfirm(); close(); }}>{confirmState.confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BottomNav({ onNewCollection }) {
  const { filter, setFilter, collections } = useLibrary();
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const go = (f) => { setFilter(f); setSheetOpen(false); navigate('/'); };
  const isCol = filter.indexOf('col:') === 0;
  return (
    <>
      <div className="bottom-nav">
        <button className={filter === 'all' ? 'bnav-item active' : 'bnav-item'} onClick={() => go('all')}><BookIcon size={20} /> All</button>
        <button className={filter === 'recent' ? 'bnav-item active' : 'bnav-item'} onClick={() => go('recent')}><ClockIcon size={20} /> Recent</button>
        <button className={filter === 'favourites' ? 'bnav-item active' : 'bnav-item'} onClick={() => go('favourites')}><StarIcon size={20} /> Favs</button>
        <button className={isCol || sheetOpen ? 'bnav-item active' : 'bnav-item'} onClick={() => setSheetOpen((o) => !o)}><ListIcon size={20} strokeWidth={2} /> Collections</button>
      </div>
      <div className={sheetOpen ? 'col-sheet-back open' : 'col-sheet-back'} onClick={() => setSheetOpen(false)}></div>
      <div className={sheetOpen ? 'col-sheet open' : 'col-sheet'}>
        <div className="col-sheet-handle"></div>
        <p className="col-sheet-title">Collections</p>
        <div>
          {collections.map((c) => (
            <div key={c.id} className={filter === 'col:' + c.id ? 'nav-item active' : 'nav-item'} onClick={() => go('col:' + c.id)}>
              <span className="nav-icon" style={{ fontSize: 15 }}>{c.emoji || '🍽'}</span>
              <span className="nav-text">{c.name}</span>
            </div>
          ))}
        </div>
        <div className="nav-item" style={{ color: 'var(--s-dim)', gap: 11, padding: '12px 20px' }} onClick={() => { setSheetOpen(false); onNewCollection(); }}>
          <PlusIcon size={13} strokeWidth={2.5} />
          <span style={{ fontSize: 13.5 }}>New collection</span>
        </div>
      </div>
    </>
  );
}
