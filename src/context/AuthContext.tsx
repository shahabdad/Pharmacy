import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRoleFromEmail, isAdminEmail } from '../constants/adminEmails';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser:      User | null;
  loading:      boolean;
  isAdmin:      boolean;
  refreshUser:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  appUser:      null,
  loading:      true,
  isAdmin:      false,
  refreshUser:  async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser,      setAppUser]      = useState<User | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [isAdmin,      setIsAdmin]      = useState(false);

  async function fetchAppUser(fbUser: FirebaseUser) {
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      let userData: User;
      
      if (snap.exists()) {
        userData = snap.data() as User;
        
        // Verify and update role if email is in admin list but role is not admin
        const shouldBeAdmin = isAdminEmail(fbUser.email || '');
        if (shouldBeAdmin && userData.role !== 'admin') {
          userData = { ...userData, role: 'admin' };
          await setDoc(doc(db, 'users', fbUser.uid), userData, { merge: true });
        }
      } else {
        // Fallback: build from Firebase Auth profile (e.g. Google sign-in)
        const autoRole = getRoleFromEmail(fbUser.email || '');
        userData = {
          uid:       fbUser.uid,
          name:      fbUser.displayName ?? 'User',
          email:     fbUser.email ?? '',
          phone:     fbUser.phoneNumber ?? '',
          role:      autoRole,
          region:    'lahore',
          createdAt: new Date(),
        };
        // Save to Firestore
        await setDoc(doc(db, 'users', fbUser.uid), userData);
      }
      
      setAppUser(userData);
      setIsAdmin(userData.role === 'admin');
    } catch (error) {
      console.error('Error fetching user:', error);
      // On error, fall back to email-based role so admin still works
      const fallbackRole = getRoleFromEmail(fbUser.email || '');
      const fallbackUser: User = {
        uid:       fbUser.uid,
        name:      fbUser.displayName ?? 'User',
        email:     fbUser.email ?? '',
        phone:     '',
        role:      fallbackRole,
        region:    'lahore',
        createdAt: new Date(),
      };
      setAppUser(fallbackUser);
      setIsAdmin(fallbackRole === 'admin');
    }
  }

  async function refreshUser() {
    if (firebaseUser) await fetchAppUser(firebaseUser);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Keep loading=true until appUser is fully resolved
        await fetchAppUser(fbUser);
      } else {
        setAppUser(null);
        setIsAdmin(false);
      }
      // Only set loading=false after everything is resolved
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
