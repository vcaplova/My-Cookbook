import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../lib/useIsMobile';
import { EditIcon, TrashIcon, MoreIcon } from './Icons';

export default function DetailBarActions({ onEdit, onDelete }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  if (!isMobile) {
    return (
      <>
        <button className="btn-icon" title="Edit recipe" onClick={onEdit}><EditIcon /></button>
        <button className="btn-icon btn-icon-del" title="Delete recipe" onClick={onDelete}><TrashIcon size={14} /></button>
      </>
    );
  }

  return (
    <div className="detail-more-wrap" ref={wrapRef}>
      <button className="btn-icon" title="More options" onClick={() => setOpen((o) => !o)}><MoreIcon /></button>
      {open && (
        <div className="detail-more-menu">
          <button onClick={() => { setOpen(false); onEdit(); }}><EditIcon size={14} /> Edit recipe</button>
          <button className="danger" onClick={() => { setOpen(false); onDelete(); }}><TrashIcon size={14} /> Delete recipe</button>
        </div>
      )}
    </div>
  );
}
