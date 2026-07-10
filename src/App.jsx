import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { TopBar, Sidebar, Toast, ConfirmDialog, BottomNav } from './components/Chrome';
import LibraryPage from './pages/LibraryPage';
import ShoppingListPage from './pages/ShoppingListPage';
import RecipePage from './pages/RecipePage';
import CookPage from './pages/CookPage';
import ImportModal from './components/modals/ImportModal';
import ReviewModal from './components/modals/ReviewModal';
import CollectionModal from './components/modals/CollectionModal';
import SettingsModal from './components/modals/SettingsModal';
import './styles/app.css';

function AppShell() {
  const { loaded } = useLibrary();

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
  const editCollection = (id) => setColModal({ open: true, editId: id });

  return (
    <>
      <TopBar onAdd={openAdd} onSettings={() => setSettingsOpen(true)} />
      <div className="layout">
        <Sidebar onNewCollection={() => setColModal({ open: true, editId: null })} onEditCollection={editCollection} />
        <Routes>
          <Route path="/" element={<LibraryPage onAdd={openAdd} />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
        </Routes>
      </div>
      <Routes>
        <Route path="/" element={null} />
        <Route path="/shopping-list" element={null} />
        <Route path="/recipe/:id" element={<RecipePage onEdit={editRecipe} />} />
        <Route path="/recipe/:id/cook" element={<CookPage onEdit={editRecipe} />} />
      </Routes>

      <BottomNav onNewCollection={() => setColModal({ open: true, editId: null })} onEditCollection={editCollection} />

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
      <AuthProvider>
        <LibraryProvider>
          <AppShell />
        </LibraryProvider>
      </AuthProvider>
    </HashRouter>
  );
}
