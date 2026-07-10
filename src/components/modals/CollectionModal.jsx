import { useEffect, useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { COLLECTION_COLORS, FOOD_EMOJIS } from '../../lib/seed';
import { XIcon } from '../Icons';

export default function CollectionModal({ open, editId, onClose }) {
  const { collections, addCollection, updateCollection, toast } = useLibrary();
  const editing = editId ? collections.find((c) => c.id === editId) : null;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍽');

  useEffect(() => {
    if (open) {
      setName(editing ? editing.name : '');
      setEmoji(editing ? (editing.emoji || '🍽') : '🍽');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  if (!open) return null;

  const save = () => {
    const n = name.trim();
    if (!n) { toast('Give the collection a name'); return; }
    if (editing) {
      updateCollection(editing.id, { name: n, emoji });
      toast(`"${n}" updated`, true);
    } else {
      // Colour is no longer user-facing — assign one automatically so the
      // underlying data stays consistent, cycling through the palette.
      const color = COLLECTION_COLORS[collections.length % COLLECTION_COLORS.length];
      const ok = addCollection(n, color, emoji);
      if (!ok) { toast('A collection with that name already exists'); return; }
      toast(`"${n}" created`, true);
    }
    onClose();
  };

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal col-modal">
        <div className="modal-head">
          <h2 className="modal-title">{editing ? 'Edit Collection' : 'New Collection'}</h2>
          <button className="btn-x" onClick={onClose}><XIcon /></button>
        </div>
        <p className="modal-sub">Give your collection a name and an icon.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label className="field-label">Name</label>
            <input className="col-name-input" type="text" maxLength={40} placeholder="e.g. Summer Salads"
              value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); }} autoFocus />
          </div>
          <div>
            <label className="field-label">Icon</label>
            <div className="emoji-picker">
              {FOOD_EMOJIS.map((e) => (
                <div key={e} className={e === emoji ? 'emoji-opt on' : 'emoji-opt'} onClick={() => setEmoji(e)}>{e}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-back" onClick={onClose}>Cancel</button>
          <button className="btn-save" style={{ flex: 1 }} onClick={save}>{editing ? 'Save Changes' : 'Create Collection'}</button>
        </div>
      </div>
    </div>
  );
}
