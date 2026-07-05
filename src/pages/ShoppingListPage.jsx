import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { PlusIcon, XIcon, TrashIcon } from '../components/Icons';

export default function ShoppingListPage() {
  const {
    shoppingList, toggleShoppingItem, removeShoppingItem, addManualShoppingItem,
    clearCheckedShoppingItems, clearShoppingList, confirm, toast,
  } = useLibrary();
  const navigate = useNavigate();
  const [manualInput, setManualInput] = useState('');

  const groups = useMemo(() => {
    const byRecipe = new Map();
    const other = [];
    shoppingList.forEach((item) => {
      if (item.recipeId == null) { other.push(item); return; }
      if (!byRecipe.has(item.recipeId)) byRecipe.set(item.recipeId, { recipeId: item.recipeId, recipeTitle: item.recipeTitle, items: [] });
      byRecipe.get(item.recipeId).items.push(item);
    });
    const recipeGroups = Array.from(byRecipe.values());
    if (other.length) recipeGroups.push({ recipeId: null, recipeTitle: 'Other Items', items: other });
    return recipeGroups;
  }, [shoppingList]);

  const checkedCount = shoppingList.filter((i) => i.checked).length;

  const submitManual = () => {
    if (!manualInput.trim()) return;
    addManualShoppingItem(manualInput);
    setManualInput('');
  };

  const doClearAll = () => {
    confirm('Clear your entire shopping list? This cannot be undone.', () => {
      clearShoppingList();
      toast('Shopping list cleared', true);
    }, 'Clear');
  };

  return (
    <main className="main">
      <div className="main-header">
        <div>
          <h1 className="main-title">Shopping List</h1>
          <p className="main-sub">Ingredients you've added from your recipes</p>
        </div>
        <span className="main-count">{shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="shop-add-row">
        <input
          type="text"
          className="shop-add-input"
          placeholder="Add an item…"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitManual(); }}
        />
        <button className="shop-add-btn" onClick={submitManual}><PlusIcon size={14} strokeWidth={2.5} stroke="#fff" /></button>
      </div>

      {shoppingList.length > 0 && (
        <div className="shop-actions">
          <button className="shop-clear-btn" disabled={!checkedCount} onClick={clearCheckedShoppingItems}>Clear checked ({checkedCount})</button>
          <button className="btn-icon btn-icon-del" title="Clear entire list" onClick={doClearAll}><TrashIcon size={14} /></button>
        </div>
      )}

      {shoppingList.length === 0 ? (
        <div className="empty">
          <div className="empty-bowl">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#C0694A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2>Your shopping list is empty</h2>
          <p>Add ingredients from any recipe, or type items in above.</p>
        </div>
      ) : (
        <div className="shop-groups">
          {groups.map((group) => (
            <div key={group.recipeId ?? 'other'} className="shop-group">
              <div className="shop-group-title" onClick={() => group.recipeId != null && navigate(`/recipe/${group.recipeId}`)} style={{ cursor: group.recipeId != null ? 'pointer' : 'default' }}>
                {group.recipeTitle}
              </div>
              <div>
                {group.items.map((item) => (
                  <div key={item.id} className={item.checked ? 'shop-item checked' : 'shop-item'}>
                    <label className="shop-item-check">
                      <input type="checkbox" checked={item.checked} onChange={() => toggleShoppingItem(item.id)} />
                      <span className="shop-item-box"></span>
                      <span className="shop-item-text">{item.text}</span>
                    </label>
                    <button className="shop-item-remove" onClick={() => removeShoppingItem(item.id)}><XIcon size={11} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
