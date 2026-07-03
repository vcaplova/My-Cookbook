import { useRef, useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { importRecipeFromUrl, importRecipeFromImages } from '../../lib/ai';
import { storage } from '../../lib/storage';
import { XIcon, LinkIcon, ImageIcon, DownloadIcon } from '../Icons';

export default function ImportModal({ open, onClose, onDraft }) {
  const { toast } = useLibrary();
  const [tab, setTab] = useState('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // { name, dataUrl, mediaType, base64 }
  const fileRef = useRef(null);

  if (!open) return null;

  const reset = () => { setUrl(''); setImages([]); setLoading(false); setTab('url'); };
  const close = () => { reset(); onClose(); };

  const emptyDraft = { title: '', cookTime: '', servings: 4, img: '', ingredients: [''], steps: [''], tags: [], collections: [], notes: '' };

  const toDraft = (parsed) => ({
    title: parsed.title || '',
    cookTime: parsed.cookTime || '',
    servings: parseInt(parsed.servings) || 4,
    img: parsed.img || '',
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    collections: [],
    notes: '',
  });

  const doUrlImport = async () => {
    const u = url.trim();
    if (!u) return;
    setLoading(true);
    try {
      const parsed = await importRecipeFromUrl(storage.getApiKey(), u);
      const draft = toDraft(parsed);
      reset(); onClose(); onDraft(draft, null);
    } catch (err) {
      setLoading(false);
      toast(err.message || 'Import failed. Please try again.');
    }
  };

  const doImageImport = async () => {
    if (!images.length) return;
    setLoading(true);
    try {
      const parsed = await importRecipeFromImages(storage.getApiKey(), images);
      const draft = toDraft(parsed);
      if (!draft.img && images[0]) draft.img = images[0].dataUrl;
      reset(); onClose(); onDraft(draft, null);
    } catch (err) {
      setLoading(false);
      toast(err.message || 'Import failed. Please try again.');
    }
  };

  const addFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const base64 = dataUrl.split(',')[1];
        setImages((imgs) => [...imgs, { name: file.name, dataUrl, mediaType: file.type, base64 }]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget && !loading) close(); }}>
      <div className="modal">
        {!loading ? (
          <div>
            <div className="modal-head">
              <h2 className="modal-title">Add a recipe</h2>
              <button className="btn-x" onClick={close}><XIcon /></button>
            </div>
            <p className="modal-sub">Paste a URL, upload a photo, or write from scratch.</p>

            <div className="import-tabs">
              <button className={tab === 'url' ? 'import-tab active' : 'import-tab'} onClick={() => setTab('url')}>
                <LinkIcon /> From URL
              </button>
              <button className={tab === 'image' ? 'import-tab active' : 'import-tab'} onClick={() => setTab('image')}>
                <ImageIcon /> From Image
              </button>
            </div>

            {tab === 'url' ? (
              <div>
                <div className="field-wrap" style={{ marginTop: 16 }}>
                  <LinkIcon size={16} />
                  <input className="field-input" type="url" placeholder="https://www.seriouseats.com/…"
                    value={url} onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') doUrlImport(); }} autoFocus />
                </div>
                <button className="btn-primary" onClick={doUrlImport}>Import Recipe</button>
              </div>
            ) : (
              <div>
                <div className="img-upload-area"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
                  <input type="file" ref={fileRef} accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => addFiles(e.target.files)} />
                  <div className="img-upload-content">
                    <ImageIcon size={32} strokeWidth={1.5} />
                    <p className="img-upload-label">Drop photos here or <span className="img-upload-link">browse</span></p>
                    <p className="img-upload-hint">Upload one or more images — Claude will read them all together</p>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="img-thumbs">
                    {images.map((img, i) => (
                      <div key={i} className="img-thumb">
                        <img src={img.dataUrl} alt="" />
                        <button className="img-thumb-rm" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}><XIcon size={9} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn-primary" disabled={!images.length} onClick={doImageImport}>
                  <DownloadIcon size={15} /> <span>Extract Recipe from {images.length > 1 ? images.length + ' Images' : 'Image'}</span>
                </button>
              </div>
            )}

            <div className="modal-or">or</div>
            <button className="btn-secondary" onClick={() => { reset(); onClose(); onDraft(emptyDraft, null, true); }}>
              Write it from scratch
            </button>
          </div>
        ) : (
          <div>
            <div className="modal-head"><h2 className="modal-title">Importing…</h2></div>
            <p className="modal-sub">Claude is reading {tab === 'url' ? 'the URL' : 'your photos'} and building the recipe.</p>
            <div className="load-wrap">
              <div className="spinner"></div>
              <div className="load-txt">
                <strong>{tab === 'url' ? (url.length > 60 ? url.slice(0, 57) + '…' : url) : images.length + ' image' + (images.length > 1 ? 's' : '')}</strong>
                Extracting ingredients, steps, and details…
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
