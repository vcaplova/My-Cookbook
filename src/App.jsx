import { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { TopBar, Sidebar, Toast, ConfirmDialog, BottomNav } from './components/Chrome';
import LibraryPage from './pages/LibraryPage';
import RecipePage from './pages/RecipePage';
import CookPage from './pages/CookPage';
import ImportModal from './components/modals/ImportModal';
import ReviewModal from './components/modals/ReviewModal';
import CollectionModal from './components/modals/CollectionModal';
import SettingsModal from './components/modals/SettingsModal';
import './styles/app.css';

function AppShell() {
  const { loaded } = useLibrary();
  const location = useLocation();
  const isDetailView = /^\/recipe\//.test(location.pathname);

  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [colModal, setColModal] = useState({ open: false, editId: null });
  const [review, setReview] = useState({ open: false, draft: null, editingId: null, fromImport: false });

  if (!loaded) return null;

  const openDraft = (draft, editingId = null, isManual = false) => {
    setReview({ open: true, draft, editingId, fromImport: !isManual && editingId == null });
  };

  const openAdd = () => setImportOpen(true);
  const editRecipe = (r) => openDraft(r, r.id);

  return (
    <>
      {!isDetailView && <TopBar onAdd={openAdd} onSettings={() => setSettingsOpen(true)} />}
      <div className="layout">
        <Sidebar onNewCollection={() => setColModal({ open: true, editId: null })} />
        <Routes>
          <Route path="/" element={<LibraryPage onAdd={openAdd} />} />
        </Routes>
      </div>
      <Routes>
        <Route path="/" element={null} />
        <Route path="/recipe/:id" element={<RecipePage onEdit={editRecipe} />} />
        <Route path="/recipe/:id/cook" element={<CookPage />} />
      </Routes>

      <BottomNav onNewCollection={() => setColModal({ open: true, editId: null })} />

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onDraft={openDraft} />
      <ReviewModal
        open={review.open}
        draft={review.draft}
        editingId={review.editingId}
        onClose={() => setReview({ open: false, draft: null, editingId: null, fromImport: false })}
        onBack={review.fromImport ? () => { setReview({ open: false, draft: null, editingId: null, fromImport: false }); setImportOpen(true); } : null}
      />
      <CollectionModal open={colModal.open} editId={colModal.editId} onClose={() => setColModal({ open: false, editId: null })} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast />
      <ConfirmDialog />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <LibraryProvider>
        <AppShell />
      </LibraryProvider>
    </HashRouter>
  );
}
