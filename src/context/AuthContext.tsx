import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser:      User | null;
  loading:      boolean;
  refreshUser:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  appUser:      null,
  loading:      true,
  refreshUser:  async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser,      setAppUser]      = useState<User | null>(null);
  const [loading,      setLoading]      = useState(true);

  async function fetchAppUser(fbUser: FirebaseUser) {
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        setAppUser(snap.data() as User);
      } else {
        // Fallback: build from Firebase Auth profile (e.g. Google sign-in)
        setAppUser({
          uid:       fbUser.uid,
          name:      fbUser.displayName ?? 'User',
          email:     fbUser.email ?? '',
          phone:     fbUser.phoneNumber ?? '',
          role:      'user',
          region:    'lahore',
          createdAt: new Date(),
        });
      }
    } catch {
      setAppUser(null);
    }
  }

  async function refreshUser() {
    if (firebaseUser) await fetchAppUser(firebaseUser);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchAppUser(fbUser);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
