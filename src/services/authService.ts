import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });

    const userDoc: User = {
      uid:       cred.user.uid,
      name:      data.name,
      email:     data.email,
      phone:     data.phone,
      role:      data.role,
      region:    'lahore',
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    return userDoc;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    const cred    = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const snap    = await getDoc(doc(db, 'users', cred.user.uid));
    if (!snap.exists()) throw new Error('User document not found');
    return snap.data() as User;
  },

  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;
    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.exists() ? (snap.data() as User) : null;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  getAuthState() {
    return auth.currentUser;
  },
};
