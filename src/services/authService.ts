import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getRoleFromEmail, isAdminEmail } from '../constants/adminEmails';
import { auth, db, storage } from '../firebase/config';
import { LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });

    // Automatically determine role based on email
    const autoRole = getRoleFromEmail(data.email);
    const finalRole = autoRole === 'admin' ? 'admin' : data.role;

    const userDoc: User = {
      uid: cred.user.uid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: finalRole,
      region: 'Mardan',
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    return userDoc;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);

    // Check if user document exists
    const snap = await getDoc(doc(db, 'users', cred.user.uid));

    if (!snap.exists()) {
      // Create user document if it doesn't exist (e.g., for existing Firebase Auth users)
      const autoRole = getRoleFromEmail(credentials.email);
      const userDoc: User = {
        uid: cred.user.uid,
        name: cred.user.displayName || 'User',
        email: credentials.email,
        phone: cred.user.phoneNumber || '',
        role: autoRole,
        region: 'lahore',
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userDoc);
      return userDoc;
    }

    const userData = snap.data() as User;

    // Verify and update role if email is in admin list but role is not admin
    const shouldBeAdmin = isAdminEmail(credentials.email);
    if (shouldBeAdmin && userData.role !== 'admin') {
      // Update role to admin
      const updatedUser = { ...userData, role: 'admin' as const };
      await setDoc(doc(db, 'users', cred.user.uid), updatedUser, { merge: true });
      return updatedUser;
    }

    return userData;
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

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });

    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }
  },

  async uploadProfilePicture(uid: string, imageUri: string): Promise<string> {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    const imageRef = ref(storage, `profiles/${uid}/${Date.now()}.jpg`);
    const task = uploadBytesResumable(imageRef, blob);

    const downloadURL: string = await new Promise((resolve, reject) => {
      task.on('state_changed', undefined, reject, async () =>
        resolve(await getDownloadURL(task.snapshot.ref)),
      );
    });

    await this.updateUser(uid, { photoURL: downloadURL });
    return downloadURL;
  },
};  
