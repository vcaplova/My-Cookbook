import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { PALETTES } from '../../lib/palettes';
import { XIcon, DownloadIcon, GoogleIcon } from '../Icons';

export default function SettingsModal({ open, onClose }) {
  const { palette, setPalette, exportJSON, syncing } = useLibrary();
  const { user, signInWithGoogle, signOutUser, authError } = useAuth();

  if (!open) return null;

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal settings-modal">
        <div className="modal-head">
          <h2 className="modal-title">Settings</h2>
          <button className="btn-x" onClick={onClose}><XIcon /></button>
        </div>

        <div className="settings-section">
          <p className="settings-label">Account</p>
          {user ? (
            <div className="account-row">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="account-avatar" referrerPolicy="no-referrer" />
                : <div className="account-avatar account-avatar-fallback">{(user.displayName || user.email || '?')[0].toUpperCase()}</div>}
              <div className="account-info">
                <p className="account-name">{user.displayName || 'Signed in'}</p>
                <p className="account-email">{user.email}</p>
              </div>
              <button className="btn-secondary" style={{ width: 'auto', padding: '0 16px' }} onClick={signOutUser}>Sign out</button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 20px' }} onClick={signInWithGoogle}>
              <GoogleIcon size={16} /> Sign in with Google
            </button>
          )}
          {authError && <p className="settings-hint" style={{ color: '#c0392b', marginTop: 8 }}>{authError}</p>}
          <p className="settings-hint" style={{ marginTop: 8 }}>
            {user
              ? (syncing ? 'Syncing your recipes to your account…' : 'Your recipes are synced to your Google account and available on any device you sign in on.')
              : 'Without signing in, your recipes stay on this device only. Sign in to sync them to your account and access them anywhere.'}
          </p>
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
          <p className="settings-label">Your Library</p>
          <button className="btn-secondary" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 20px' }} onClick={exportJSON}>
            <DownloadIcon size={15} /> Export library as JSON
          </button>
          <p className="settings-hint" style={{ marginTop: 8 }}>Downloads a backup of all your recipes and collections.</p>
        </div>

        <div className="settings-section">
          <p className="settings-label">Adding Recipes</p>
          <p className="settings-hint">
            To add a recipe from a link or photo, ask Claude to use the "Cookbook Import" skill, then paste its
            reply into Add Recipe. No account or API key needed — it runs on your own Claude usage.
          </p>
        </div>
      </div>
    </div>
  );
}
