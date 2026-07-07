import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// These are the standard Firebase *client* config values — safe to have in
// the bundled app. Firebase's real security comes from Firestore security
// rules (see the rules shipped alongside this project / given to the user),
// not from hiding this config.
const firebaseConfig = {
  apiKey: 'AIzaSyA_ZmPqRKm-CeMAltJJyCc1rdDkrx5Ywd4',
  authDomain: 'my-cookbook-16aa3.firebaseapp.com',
  projectId: 'my-cookbook-16aa3',
  storageBucket: 'my-cookbook-16aa3.firebasestorage.app',
  messagingSenderId: '265761955284',
  appId: '1:265761955284:web:9c365d7b324de032c04a41',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
