import { useEffect, useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { XIcon, PlusIcon, ImageIcon } from '../Icons';

export default function ReviewModal({ open, draft, editingId, isManual, onClose, onBack }) {
  const { collections, addRecipe, updateRecipe, toast } = useLibrary();
  const [form, setForm] = useState(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open && draft) {
      setForm({
        title: draft.title || '',
        cookTime: draft.cookTime || '',
        servings: draft.servings || 4,
        img: draft.img || '',
        ingredients: draft.ingredients?.length ? draft.ingredients.slice() : [''],
        steps: draft.steps?.length ? draft.steps.slice() : [''],
        tags: draft.tags ? draft.tags.slice() : [],
        collections: draft.collections ? draft.collections.slice() : [],
        notes: draft.notes || '',
      });
      setTagInput('');
    }
  }, [open, draft]);

  if (!open || !form) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setRow = (k, i, v) => setForm((f) => {
    const arr = f[k].slice(); arr[i] = v; return { ...f, [k]: arr };
  });
  const addRow = (k) => setForm((f) => ({ ...f, [k]: [...f[k], ''] }));
  const delRow = (k, i) => setForm((f) => ({ ...f, [k]: f[k].filter((_, j) => j !== i) }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };
  const toggleCol = (id) => set('collections', form.collections.includes(id)
    ? form.collections.filter((c) => c !== id)
    : [...form.collections, id]);

  const save = () => {
    const title = form.title.trim();
    if (!title) { toast('Give the recipe a title first'); return; }
    const clean = {
      ...form,
      title,
      servings: parseInt(form.servings) || 4,
      ingredients: form.ingredients.map((s) => s.trim()).filter(Boolean),
      steps: form.steps.map((s) => s.trim()).filter(Boolean),
    };
    if (editingId != null) {
      updateRecipe(editingId, clean);
      toast(`"${title}" updated`, true);
    } else {
      addRecipe(clean);
      toast(`"${title}" saved to library`, true);
    }
    onClose();
  };

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal review-modal">
        <div className="modal-head">
          <h2 className="modal-title">{editingId != null ? 'Edit recipe' : 'Review & edit'}</h2>
          <button className="btn-x" onClick={onClose}><XIcon /></button>
        </div>
        <p className="modal-sub">Check everything looks right before saving.</p>

        <div className="review-hero">
          {form.img
            ? <img src={form.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            : <div className="review-hero-ph"><ImageIcon size={30} strokeWidth={1.5} /></div>}
        </div>

        <div className="review-grid">
          <div className="field full"><label>Recipe Title</label><input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div className="field"><label>Cook Time</label><input type="text" value={form.cookTime} onChange={(e) => set('cookTime', e.target.value)} placeholder="e.g. 45m" /></div>
          <div className="field"><label>Servings</label><input type="number" min="1" value={form.servings} onChange={(e) => set('servings', e.target.value)} /></div>
          <div className="field full"><label>Image URL</label><input type="url" value={form.img} onChange={(e) => set('img', e.target.value)} /></div>
        </div>

        <p className="sec-title">Ingredients</p>
        <div className="editable-list">
          {form.ingredients.map((v, i) => (
            <div key={i} className="edit-row">
              <span className="row-num">{i + 1}</span>
              <input type="text" value={v} onChange={(e) => setRow('ingredients', i, e.target.value)} />
              <button className="btn-del-row" onClick={() => delRow('ingredients', i)}><XIcon size={11} /></button>
            </div>
          ))}
        </div>
        <button className="btn-add-row" onClick={() => addRow('ingredients')}><PlusIcon size={13} strokeWidth={2.5} /> Add ingredient</button>

        <p className="sec-title" style={{ marginTop: 20 }}>Steps</p>
        <div className="editable-list">
          {form.steps.map((v, i) => (
            <div key={i} className="edit-row">
              <span className="row-num">{i + 1}</span>
              <textarea rows={2} value={v} onChange={(e) => setRow('steps', i, e.target.value)} />
              <button className="btn-del-row" onClick={() => delRow('steps', i)}><XIcon size={11} /></button>
            </div>
          ))}
        </div>
        <button className="btn-add-row" onClick={() => addRow('steps')}><PlusIcon size={13} strokeWidth={2.5} /> Add step</button>

        <p className="sec-title" style={{ marginTop: 20 }}>Tags</p>
        <div className="tags-input-wrap">
          {form.tags.map((t) => (
            <span key={t} className="tag-chip">
              {t}
              <button type="button" onClick={() => set('tags', form.tags.filter((x) => x !== t))}><XIcon size={9} /></button>
            </span>
          ))}
          <input type="text" placeholder="Type a tag and press Enter…" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
        </div>

        <p className="sec-title" style={{ marginTop: 20 }}>Collections</p>
        <div className="cols-check">
          {collections.map((c) => (
            <label key={c.id} className={form.collections.includes(c.id) ? 'col-check on' : 'col-check'}>
              <input type="checkbox" checked={form.collections.includes(c.id)} onChange={() => toggleCol(c.id)} />
              <span className="col-check-dot" style={{ background: c.color }}></span> {c.emoji || '🍽'} {c.name}
            </label>
          ))}
        </div>

        <p className="sec-title" style={{ marginTop: 20 }}>Personal Notes</p>
        <div className="field full">
          <textarea rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)}
            placeholder="Your variations, tips, tweaks, what you'd do differently…"
            style={{ width: '100%', background: 'var(--parchment)', border: '1.5px solid var(--linen)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        <div className="review-footer">
          <button className="btn-back" onClick={onBack || onClose}>← {editingId != null || !onBack ? 'Cancel' : 'Back'}</button>
          <button className="btn-save" onClick={save}>{editingId != null ? 'Save Changes' : 'Save to Library'}</button>
        </div>
      </div>
    </div>
  );
}
