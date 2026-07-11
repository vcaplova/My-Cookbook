import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { scaleIng } from '../lib/utils';
import { convertIngredient, annotateSteps } from '../lib/units';
import { ChevronLeft, ListIcon, FlameIcon, PinIcon, StarIcon, UnitIcon, ImageIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from '../components/Icons';
import DetailBarActions from '../components/DetailBarActions';

export default function RecipePage({ onEdit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, colById, toggleStar, togglePin, deleteRecipe, confirm, toast, unitMode, setUnitMode, shoppingList, addToShoppingList, addAllToShoppingList, removeFromShoppingListByText, removeManyFromShoppingList } = useLibrary();
  const recipe = recipes.find((r) => r.id === Number(id));

  const [servings, setServings] = useState(recipe?.servings || 4);

  useEffect(() => {
    if (recipe) { setServings(recipe.servings || 4); setUnitMode('original'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate('/'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  if (!recipe) {
    return (
      <div className="detail-panel open">
        <div className="detail-back-drop" onClick={() => navigate('/')}></div>
        <div className="detail-sheet">
          <div className="detail-bar">
            <button className="btn-detail-back" onClick={() => navigate('/')}><ChevronLeft /> Library</button>
          </div>
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Recipe not found.</div>
        </div>
      </div>
    );
  }

  const base = recipe.servings || 4;
  const ratio = servings / base;
  const displayIngredients = recipe.ingredients.map((ing) => convertIngredient(scaleIng(ing, ratio), unitMode));
  const allIngredientsInList = displayIngredients.every((text) => shoppingList.some((item) => item.recipeId === recipe.id && item.text === text));

  const doDelete = () => {
    confirm(`Delete "${recipe.title}"? This cannot be undone.`, () => {
      deleteRecipe(recipe.id);
      toast(`"${recipe.title}" deleted`, true);
      navigate('/');
    });
  };

  return (
    <div className="detail-panel open">
      <div className="detail-back-drop" onClick={() => navigate('/')}></div>
      <div className="detail-sheet">
        <div className="detail-bar">
          <button className="btn-detail-back" onClick={() => navigate('/')}><ChevronLeft /> Library</button>
          <div className="detail-bar-title">{recipe.title}</div>
          <div className="mode-toggle">
            <button className="mbtn on"><ListIcon size={13} /> Read</button>
            <button className="mbtn" onClick={() => navigate(`/recipe/${recipe.id}/cook`)}><FlameIcon /> Cook</button>
          </div>
          <DetailBarActions onEdit={() => onEdit(recipe)} onDelete={doDelete} />
          <button className={recipe.pinned ? 'detail-pin pinned' : 'detail-pin'} title={recipe.pinned ? 'Unpin recipe' : 'Pin recipe'}
            onClick={() => { togglePin(recipe.id); toast(recipe.pinned ? `"${recipe.title}" unpinned` : `"${recipe.title}" pinned`); }}
            onTouchEnd={(e) => { e.preventDefault(); togglePin(recipe.id); toast(recipe.pinned ? `"${recipe.title}" unpinned` : `"${recipe.title}" pinned`); }}>
            <PinIcon size={14} />
          </button>
          <button
            className={recipe.starred ? 'detail-fav on' : 'detail-fav'}
            onClick={() => toggleStar(recipe.id)}
            onTouchEnd={(e) => { e.preventDefault(); toggleStar(recipe.id); }}
          >
            <StarIcon size={16} fill={recipe.starred ? '#D4A843' : 'none'} stroke={recipe.starred ? '#D4A843' : '#9C856A'} />
          </button>
        </div>

        <div className="scroll-mode">
          <div className="scroll-left">
            <div className="d-hero">
              {recipe.img
                ? <img src={recipe.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
                : <div className="d-hero-ph"><ImageIcon size={44} strokeWidth={1.4} /></div>}
            </div>
            <h1 className="d-title">{recipe.title}</h1>
            <div className="d-meta-row">
              <div className="d-meta"><span className="d-meta-label">Cook Time</span><span className="d-meta-val">{recipe.cookTime || '—'}</span></div>
              <div className="d-meta-divider" />
              <div className="d-meta"><span className="d-meta-label">Servings</span>
                <div className="scaler">
                  <button className="scaler-btn" tabIndex={-1} onClick={(e) => { e.currentTarget.blur(); setServings((s) => Math.max(1, s - 1)); }}>−</button>
                  <span className="scaler-val">{servings}</span>
                  <button className="scaler-btn" tabIndex={-1} onClick={(e) => { e.currentTarget.blur(); setServings((s) => s + 1); }}>+</button>
                </div>
              </div>
            </div>
            <div className="d-cols">
              {recipe.collections.map((cid) => {
                const c = colById(cid);
                return c ? <span key={cid} className="d-col-badge">{c.emoji || '🍽'} {c.name}</span> : null;
              })}
            </div>
            <div className="d-tags">
              {recipe.tags.map((t) => <span key={t} className="card-tag">{t}</span>)}
            </div>
            {recipe.notes && recipe.notes.trim() && (
              <div>
                <p className="ing-title" style={{ marginTop: 4 }}>My Notes</p>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.65, background: 'var(--parchment)', borderRadius: 'var(--r-sm)', padding: '12px 14px', border: '1.5px solid var(--linen)', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
                  {recipe.notes}
                </div>
              </div>
            )}
            <div className="ing-title-row">
              <p className="ing-title">Ingredients</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className={allIngredientsInList ? 'btn-add-all-shop added' : 'btn-add-all-shop'}
                  title={allIngredientsInList ? 'Remove all ingredients from shopping list' : 'Add all ingredients to shopping list'}
                  onClick={() => (allIngredientsInList
                    ? removeManyFromShoppingList(recipe.id, displayIngredients)
                    : addAllToShoppingList(recipe.id, recipe.title, displayIngredients))}
                >
                  <ShoppingBagIcon size={13} /> {allIngredientsInList ? 'Remove' : 'Add'}
                </button>
                <button className={unitMode === 'metric' ? 'btn-unit-toggle metric' : 'btn-unit-toggle'} title="Convert units" tabIndex={-1}
                  onClick={(e) => { e.currentTarget.blur(); setUnitMode((m) => (m === 'original' ? 'metric' : 'original')); }}>
                  <span>{unitMode === 'metric' ? 'METRIC' : 'ORIGINAL'}</span> <UnitIcon />
                </button>
              </div>
            </div>
            <div>
              {recipe.ingredients.map((ing, i) => {
                if (ing.startsWith('##')) {
                  return <div key={i} className="ing-section-header">{ing.replace(/^##\s*/, '')}</div>;
                }
                const displayText = displayIngredients[i];
                const inList = shoppingList.some((item) => item.recipeId === recipe.id && item.text === displayText);
                return (
                  <div key={i} className="ing-item">
                    <span className="ing-dot"></span>
                    <span style={{ flex: 1 }}>{displayText}</span>
                    <button
                      className={inList ? 'ing-add-btn added' : 'ing-add-btn'}
                      title={inList ? 'Remove from shopping list' : 'Add to shopping list'}
                      onClick={() => (inList ? removeFromShoppingListByText(recipe.id, displayText) : addToShoppingList(recipe.id, recipe.title, displayText))}
                    >
                      {inList ? <MinusIcon size={11} strokeWidth={2.5} stroke="#fff" /> : <PlusIcon size={11} strokeWidth={2.5} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="scroll-right">
            <p className="steps-title">Method</p>
            <div>
              {recipe.steps.map((s, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-text">{annotateSteps(s)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
