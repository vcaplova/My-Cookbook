import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Stores each signed-in user's entire library (recipes, collections, etc.)
// as a single Firestore document at users/{uid}/library/main.
//
// Known limitation: Firestore documents cap out at 1MB. Recipes with
// embedded photos (compressed to roughly 80-200KB each) could approach that
// limit with a large, photo-heavy library. If that ever becomes a real
// problem, the fix is splitting recipes into their own per-recipe documents
// (users/{uid}/recipes/{id}) instead of one big blob — a bigger change,
// not needed unless you actually hit the ceiling.
export class FirestoreStorageAdapter {
  constructor(uid) {
    this.uid = uid;
    this.docRef = doc(db, 'users', uid, 'library', 'main');
  }

  async loadLibrary() {
    try {
      const snap = await getDoc(this.docRef);
      if (!snap.exists()) return null;
      const data = snap.data();
      if (!data || data.v !== 1) return null;
      return data;
    } catch (e) {
      console.warn('Could not load library from Firestore:', e);
      return null;
    }
  }

  async saveLibrary(data) {
    try {
      await setDoc(this.docRef, { v: 1, ...data });
      return true;
    } catch (e) {
      console.warn('Could not save library to Firestore:', e);
      return false;
    }
  }

  async clearLibrary() {
    try {
      await setDoc(this.docRef, { v: 1 });
    } catch (e) {
      console.warn('Could not clear library in Firestore:', e);
    }
  }
}
