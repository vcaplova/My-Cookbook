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
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, search]);

  if (!open) return null;

  const apply = (v) => { setValue(v); setSearch(v); };
  const close = () => { setSearch(value.trim()); onClose(); };

  return (
    <div className="search-popup-back open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="search-popup">
        <SearchIcon size={18} className="search-popup-icon" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          placeholder="Search recipes, tags…"
          value={value}
          onChange={(e) => apply(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') close(); }}
        />
        {value && (
          <button type="button" className="search-popup-clear" onClick={() => apply('')}><XIcon size={12} /></button>
        )}
      </div>
    </div>
  );
}
