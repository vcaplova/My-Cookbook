import { useEffect, useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { PALETTES } from '../../lib/palettes';
import { storage } from '../../lib/storage';
import { XIcon } from '../Icons';

export default function SettingsModal({ open, onClose }) {
  const { palette, setPalette, toast } = useLibrary();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (open) setApiKey(storage.getApiKey());
  }, [open]);

  if (!open) return null;

  const saveKey = () => {
    storage.setApiKey(apiKey.trim());
    toast(apiKey.trim() ? 'API key saved on this device' : 'API key removed', true);
  };

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal settings-modal">
        <div className="modal-head">
          <h2 className="modal-title">Settings</h2>
          <button className="btn-x" onClick={onClose}><XIcon /></button>
        </div>

        <div className="settings-section">
          <p className="settings-label">Colour Palette</p>
          <div className="palette-grid">
            {Object.entries(PALETTES).map(([key, p]) => (
              <div key={key} className={key === palette ? 'palette-card active' : 'palette-card'} onClick={() => setPalette(key)}>
                <div className="palette-swatches">
                  <span className="palette-chip" style={{ background: p.vars['--parchment'] }}></span>
                  <span className="palette-chip" style={{ background: p.vars['--terra'] }}></span>
                  <span className="palette-chip" style={{ background: p.vars['--espresso'] }}></span>
                </div>
                <span className="palette-name">{p.name}</span>
                {key === palette && <span className="palette-check">✓</span>}
              </div>
            ))}
          </div>
          <p className="settings-hint">Changes apply instantly and are remembered on this device.</p>
        </div>

        <div className="settings-section">
          <p className="settings-label">AI Recipe Import</p>
          <p className="settings-hint" style={{ marginBottom: 8 }}>
            Import from URLs and photos is powered by Claude and needs your own Anthropic API key.
            The key is stored only in this browser — it never leaves your device except to call the Anthropic API directly.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="col-name-input" style={{ flex: 1 }} type="password" placeholder="sk-ant-…"
              value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <button className="btn-save" onClick={saveKey}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
