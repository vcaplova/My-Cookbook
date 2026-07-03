import { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { XIcon } from '../Icons';

const ClipboardIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

function parseSkillOutput(raw) {
  let text = raw.trim();
  if (text.indexOf('```') >= 0) {
    const s = text.indexOf('{');
    const e = text.lastIndexOf('}');
    if (s >= 0 && e > s) text = text.slice(s, e + 1);
  }
  const parsed = JSON.parse(text);
  return {
    title: parsed.title || '',
    cookTime: parsed.cookTime || '',
    servings: parseInt(parsed.servings) || 4,
    img: parsed.img || '',
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    collections: [],
    notes: '',
  };
}

export default function ImportModal({ open, onClose, onDraft }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const reset = () => { setText(''); setError(''); };
  const close = () => { reset(); onClose(); };

  const emptyDraft = { title: '', cookTime: '', servings: 4, img: '', ingredients: [''], steps: [''], tags: [], collections: [], notes: '' };

  const doParse = () => {
    if (!text.trim()) return;
    try {
      const draft = parseSkillOutput(text);
      if (!draft.title) throw new Error('No title found');
      reset(); onClose(); onDraft(draft, null);
    } catch {
      setError("Couldn't read that — make sure you pasted the whole JSON block the skill gave you.");
    }
  };

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">Add a recipe</h2>
          <button className="btn-x" onClick={close}><XIcon /></button>
        </div>
        <p className="modal-sub">Paste what the Cookbook Import skill gave you, or write it from scratch.</p>

        <div style={{ marginTop: 16 }}>
          <textarea
            rows={8}
            placeholder={'Ask Claude to use the "Cookbook Import" skill with a recipe link or photo, then paste its reply here…'}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            style={{ width: '100%', background: 'var(--parchment)', border: '1.5px solid var(--linen)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontFamily: 'monospace', fontSize: 12.5, color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
          {error && <p style={{ color: '#c0392b', fontSize: 12.5, marginTop: 8 }}>{error}</p>}
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={doParse}>
            <ClipboardIcon /> <span>Add This Recipe</span>
          </button>
        </div>

        <div className="modal-or">or</div>
        <button className="btn-secondary" onClick={() => { reset(); onClose(); onDraft(emptyDraft, null, true); }}>
          Write it from scratch
        </button>
      </div>
    </div>
  );
}
