import { useEffect, useRef, useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { SearchIcon, XIcon } from '../Icons';

export default function SearchModal({ open, onClose }) {
  const { search, setSearch } = useLibrary();
  const [value, setValue] = useState(search);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(search);
      // Focus after the modal has actually painted, so the keyboard opens reliably.
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, search]);

  if (!open) return null;

  const doSearch = () => {
    setSearch(value.trim());
    onClose();
  };
  const doClear = () => {
    setValue('');
    setSearch('');
  };

  return (
    <div className="modal-back open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal search-modal">
        <div className="modal-head">
          <h2 className="modal-title">Search</h2>
          <button className="btn-x" onClick={onClose}><XIcon /></button>
        </div>
        <p className="modal-sub">Search your recipes by title, tag, or collection.</p>

        <div className="field-wrap">
          <SearchIcon size={16} className="field-icon" />
          <input
            ref={inputRef}
            className="field-input"
            type="text"
            inputMode="search"
            placeholder="Search recipes, tags…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
          />
          {value && (
            <button type="button" className="search-modal-clear" onClick={doClear}><XIcon size={12} /></button>
          )}
        </div>

        <button className="btn-primary" onClick={doSearch}>Search</button>
      </div>
    </div>
  );
}
