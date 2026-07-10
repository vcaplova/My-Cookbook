import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { PinIcon, EditIcon, ImageIcon, StarIcon } from '../components/Icons';

function RecipeImg({ recipe, phClass }) {
  if (recipe.img) return <img src={recipe.img} alt="" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />;
  return <div className={phClass}><ImageIcon size={32} strokeWidth={1.5} /></div>;
}

const StarSvg = ({ on }) => <StarIcon size={14} fill={on ? '#D4A843' : 'none'} stroke={on ? '#D4A843' : '#9C856A'} />;

const PinSolid = ({ size = 11, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    <line x1="12" y1="17" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const ClockSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const PeopleSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
  </svg>
);

export default function LibraryPage({ onAdd }) {
  const {
    filtered, recipes, colById, view, filter,
    maxTime, setMaxTime, servingsBand, setServingsBand,
    activeTags, setActiveTags, allTags, toggleStar, togglePin, toast,
    removeTag,
  } = useLibrary();
  const navigate = useNavigate();
  const [tagEdit, setTagEdit] = useState(false);

  const title =
    filter === 'recent' ? 'Recently Added' :
    filter === 'favourites' ? 'Favourites' :
    filter.indexOf('col:') === 0 ? (colById(filter.slice(4))?.name || 'Collection') :
    'All Recipes';
  const sub =
    filter === 'recent' ? 'Added in the last 36 hours' :
    filter === 'favourites' ? 'Recipes you starred' :
    filter.indexOf('col:') === 0 ? 'A collection from your library' :
    'Your personal cookbook, always within reach';

  const timePills = [['', 'Any'], ['15', 'Under 15m'], ['30', 'Under 30m'], ['60', 'Under 1h'], ['120', 'Under 2h']];
  const servPills = [['', 'Any'], ['1', '1–2'], ['4', '3–4'], ['6', '5–6'], ['8', '7+']];

  const open = (id) => navigate('/recipe/' + id);
  const doPin = (e, r) => {
    e.stopPropagation();
    togglePin(r.id);
    toast(r.pinned ? `"${r.title}" unpinned` : `"${r.title}" pinned`);
  };
  const doStar = (e, r) => { e.stopPropagation(); toggleStar(r.id); };
  const clickTag = (e, t) => {
    if (tagEdit) {
      if (!e.target.classList.contains('tx')) return;
      removeTag(t);
      toast(`"${t}" removed`);
    } else {
      setActiveTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
    }
  };

  const listSorted = filtered.slice().sort((a, b) => {
    if (b.pinned !== a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    return a.title.localeCompare(b.title);
  });

  return (
    <main className="main">
      <div className="main-header">
        <div>
          <h1 className="main-title">{title}</h1>
          <p className="main-sub">{sub}</p>
        </div>
        <span className="main-count">{filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}</span>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Cook time</label>
          <div className="filter-pills">
            {timePills.map(([v, label]) => (
              <span key={v || 'any'} className={String(maxTime || '') === v ? 'fpill on' : 'fpill'} onClick={() => setMaxTime(v ? parseInt(v) : 0)}>{label}</span>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">Servings</label>
          <div className="filter-pills">
            {servPills.map(([v, label]) => (
              <span key={v || 'any'} className={servingsBand === v ? 'fpill on' : 'fpill'} onClick={() => setServingsBand(v)}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-bar-wrap">
          <div className={tagEdit ? 'tag-bar edit-mode' : 'tag-bar'}>
            {allTags.map((t) => (
              <span key={t} className={activeTags.includes(t) ? 'tag-pill on' : 'tag-pill'} onClick={(e) => clickTag(e, t)}>
                {t}<span className="tx">✕</span>
              </span>
            ))}
          </div>
          <button className="btn-tag-edit" title="Edit tags" onClick={() => setTagEdit((v) => !v)}>
            <EditIcon size={11} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-bowl">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#C0694A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2>{recipes.length === 0 ? 'Your library is empty' : 'No recipes match'}</h2>
          <p>{recipes.length === 0 ? 'Add your first recipe to start the collection.' : 'Try loosening the filters or clearing the search.'}</p>
          {recipes.length === 0 && (
            <button className="btn-cta" onClick={onAdd}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add your first recipe
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="recipe-grid">
          {filtered.map((r) => (
            <div key={r.id} className="recipe-card" onClick={() => open(r.id)}>
              <div className="card-img">
                <RecipeImg recipe={r} phClass="card-img-ph" />
                {r.pinned && <div className="pin-corner"><div className="pin-corner-label"><PinSolid /></div></div>}
                <button className={r.pinned ? 'card-pin-btn pinned' : 'card-pin-btn'} title={r.pinned ? 'Unpin' : 'Pin'} onClick={(e) => doPin(e, r)}>
                  <PinSolid />
                </button>
                <button className={r.starred ? 'card-fav on' : 'card-fav'} onClick={(e) => doStar(e, r)}>
                  <StarSvg on={r.starred} />
                </button>
              </div>
              <div className="card-body">
                <div
                  className="card-title"
                  onClick={(e) => { e.stopPropagation(); open(r.id); }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); open(r.id); }}
                >{r.title}</div>
                <div className="card-meta">
                  <span className="card-meta-i"><ClockSm />{r.cookTime || '—'}</span>
                  <span className="card-meta-i"><PeopleSm />{r.servings}</span>
                </div>
                <div className="card-cols">
                  {r.collections.map((cid) => {
                    const c = colById(cid);
                    return c ? <span key={cid} className="card-col">{c.emoji || '🍽'} {c.name}</span> : null;
                  })}
                </div>
                <div className="card-tags">
                  {r.tags.map((t) => <span key={t} className="card-tag">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="recipe-list">
          {listSorted.map((r) => (
            <div key={r.id} className={r.pinned ? 'list-item pinned-item' : 'list-item'} onClick={() => open(r.id)}>
              <div className="list-img" style={{ position: 'relative' }}>
                {r.pinned && <div className="list-pin-corner"><div className="list-pin-corner-label"><PinSolid size={9} color="#fff" /></div></div>}
                <RecipeImg recipe={r} phClass="list-img-ph" />
              </div>
              <div className="list-body">
                <div
                  className="list-title"
                  onClick={(e) => { e.stopPropagation(); open(r.id); }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); open(r.id); }}
                >{r.title}</div>
                <div className="list-meta">
                  <span className="list-meta-i"><ClockSm />{r.cookTime || '—'}</span>
                  <span className="list-meta-i"><PeopleSm />{r.servings}</span>
                </div>
                <div className="list-tags">
                  {r.tags.slice(0, 2).map((t) => <span key={t} className="card-tag">{t}</span>)}
                </div>
              </div>
              <button className={r.pinned ? 'list-pin pinned' : 'list-pin'} onClick={(e) => doPin(e, r)}>
                <PinIcon size={13} />
              </button>
              <button className={r.starred ? 'list-fav on' : 'list-fav'} onClick={(e) => doStar(e, r)}>
                <StarSvg on={r.starred} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
