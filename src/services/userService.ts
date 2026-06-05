import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

// ─── Timestamp normalizer ─────────────────────────────────────────────────────
function toDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

function normalizeUser(id: string, data: any): User {
  return {
    ...data,
    uid: id,
    createdAt: toDate(data.createdAt),
  } as User;
}

// ─── User service ─────────────────────────────────────────────────────────────
export const userService = {

  /** Fetch all users once */
  async getAllUsers(): Promise<User[]> {
    const q    = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeUser(d.id, d.data()));
  },

  /** Real-time listener for all users */
  listenToAllUsers(callback: (users: User[]) => void): () => void {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => normalizeUser(d.id, d.data())));
    });
  },

  /** Update a user's role */
  async updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { role });
  },

  /** Block / unblock a user (adds a `blocked` field) */
  async setUserBlocked(uid: string, blocked: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { blocked });
  },

  /** Permanently delete a user document from Firestore */
  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid));
  },
};

