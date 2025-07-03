import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  const isEmulatorConnected = {
    auth: false,
    firestore: false,
    storage: false,
    functions: false,
  };

  // Auth emulator
  if (!isEmulatorConnected.auth) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    isEmulatorConnected.auth = true;
  }

  // Firestore emulator
  if (!isEmulatorConnected.firestore) {
    connectFirestoreEmulator(db, 'localhost', 8080);
    isEmulatorConnected.firestore = true;
  }

  // Storage emulator
  if (!isEmulatorConnected.storage) {
    connectStorageEmulator(storage, 'localhost', 9199);
    isEmulatorConnected.storage = true;
  }

  // Functions emulator
  if (!isEmulatorConnected.functions) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    isEmulatorConnected.functions = true;
  }
}

export default app;