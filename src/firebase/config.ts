import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
// Metro resolves 'firebase/auth' to the React Native bundle at runtime,
// which exports getReactNativePersistence. TypeScript ships browser types
// that don't declare it, so we cast to any to silence the TS error.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { getAuth, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL:       process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// getReactNativePersistence exists in the RN bundle Metro resolves at runtime.
// We access it via the module object to avoid the TypeScript type error.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => import('firebase/auth').Persistence;
};

// Only call initializeAuth once — on hot reload getApps() returns the existing app
// which already has auth initialized, so we fall back to getAuth().
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Auth already initialized (hot reload) — just return the existing instance
    return getAuth(app);
  }
})();

export const db         = getFirestore(app);
export const storage    = getStorage(app);
export const realtimeDb = getDatabase(app); // Realtime Database instance

export default app;

