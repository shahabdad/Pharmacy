import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { DEFAULT_SHOP } from '../constants/shops';
import { db, storage } from '../firebase/config';
import { Prescription, PrescriptionStatus } from '../types';

// ─── Home screen upload flow ──────────────────────────────────────────────────

export interface OrderPayload {
  imageUri: string | null;  // null when user types medicine names instead of uploading
  message:  string;
  address:  string;
  phone:    string;
  userId:   string;
  userName: string;
}

/**
 * 1. Upload image to Firebase Storage → get download URL
 * 2. Save prescription doc to Firestore (prescriptions collection)
 * 3. Returns the new document ID
 */
export async function submitPrescriptionOrder(
  payload: OrderPayload,
  onProgress?: (pct: number) => void,
): Promise<string> {
  // ── Step 1: upload image (only if provided) ───────────────────────────────
  let imageUrl = '';
  if (payload.imageUri) {
    const blob       = await uriToBlob(payload.imageUri);
    const filename   = `prescriptions/${payload.userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    const task       = uploadBytesResumable(storageRef, blob);

    imageUrl = await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)),
      );
    });
  } else {
    // Text-only order — no image to upload
    onProgress?.(100);
  }

  // ── Step 2: save to Firestore ─────────────────────────────────────────────
  const docRef = await addDoc(collection(db, 'prescriptions'), {
    userId:    payload.userId,
    userName:  payload.userName,
    shopId:    DEFAULT_SHOP.id,
    shopName:  DEFAULT_SHOP.name,
    imageUrl:  imageUrl || null,   // null instead of empty string for text-only orders
    message:   payload.message,
    address:   payload.address,
    phone:     payload.phone,
    status:    'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}

// ─── Firestore Timestamp → JS Date helper ────────────────────────────────────
/**
 * Firestore returns timestamps as { seconds, nanoseconds } objects with a
 * .toDate() method. Calling new Date(timestamp) on them produces "Invalid Date".
 * This helper safely converts any timestamp shape to a real JS Date.
 */
function toJsDate(value: any): Date {
  if (!value) return new Date();
  // Firestore Timestamp object
  if (typeof value.toDate === 'function') return value.toDate();
  // Already a Date
  if (value instanceof Date) return value;
  // Plain { seconds, nanoseconds } shape (e.g. from JSON serialization)
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  // Fallback: try native Date constructor
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

function normalizePrescription(id: string, data: any): Prescription {
  return {
    ...data,
    id,
    createdAt: toJsDate(data.createdAt),
    updatedAt: toJsDate(data.updatedAt),
  } as Prescription;
}

// ─── Prescription CRUD ────────────────────────────────────────────────────────

export const prescriptionService = {
  async uploadPrescription(
    userId: string,
    shopId: string = DEFAULT_SHOP.id, // Default to MadicCare if not specified
    imageUri: string,
    medicineList?: string[],
  ): Promise<Prescription> {
    const blob     = await uriToBlob(imageUri);
    const imageRef = ref(storage, `prescriptions/${userId}/${Date.now()}`);
    const task     = uploadBytesResumable(imageRef, blob);

    const imageURL: string = await new Promise((resolve, reject) => {
      task.on('state_changed', undefined, reject, async () =>
        resolve(await getDownloadURL(task.snapshot.ref)),
      );
    });

    const data = {
      userId,
      shopId:       shopId || DEFAULT_SHOP.id, // Fallback to default shop
      shopName:     DEFAULT_SHOP.name,         // Store shop name
      imageURL,
      medicineList: medicineList ?? [],
      status:       'pending' as PrescriptionStatus,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    };

    const docRef  = await addDoc(collection(db, 'prescriptions'), data);
    const chatRef = await addDoc(collection(db, 'chats'), {
      prescriptionId: docRef.id,
      messages:       [],
      createdAt:      serverTimestamp(),
    });
    await updateDoc(docRef, { chatId: chatRef.id });

    return {
      id: docRef.id,
      ...data,
      chatId:    chatRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Prescription;
  },

  async getUserPrescriptions(userId: string): Promise<Prescription[]> {
    const q    = query(collection(db, 'prescriptions'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizePrescription(d.id, d.data()));
  },

  async getShopPrescriptions(shopId: string): Promise<Prescription[]> {
    const q    = query(collection(db, 'prescriptions'), where('shopId', '==', shopId));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizePrescription(d.id, d.data()));
  },

  async getPrescription(id: string): Promise<Prescription | null> {
    const snap = await getDoc(doc(db, 'prescriptions', id));
    return snap.exists() ? normalizePrescription(snap.id, snap.data()!) : null;
  },

  async updatePrescriptionQuote(id: string, quoteAmount: number, adminMessage: string): Promise<void> {
    await updateDoc(doc(db, 'prescriptions', id), {
      status: 'quoted' as PrescriptionStatus, quoteAmount, adminMessage,
      updatedAt: serverTimestamp(),
    });
  },

  async approvePrescription(id: string): Promise<void> {
    await updateDoc(doc(db, 'prescriptions', id), {
      status: 'approved' as PrescriptionStatus, updatedAt: serverTimestamp(),
    });
  },

  async rejectPrescription(id: string): Promise<void> {
    await updateDoc(doc(db, 'prescriptions', id), {
      status: 'rejected' as PrescriptionStatus, updatedAt: serverTimestamp(),
    });
  },

  async deliverPrescription(id: string): Promise<void> {
    await updateDoc(doc(db, 'prescriptions', id), {
      status: 'delivered' as PrescriptionStatus, updatedAt: serverTimestamp(),
    });
  },

  async deletePrescription(id: string): Promise<void> {
    await deleteDoc(doc(db, 'prescriptions', id));
  },
};
