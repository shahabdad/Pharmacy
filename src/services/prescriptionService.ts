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
  imageUri: string;
  message:  string;
  address:  string;
  phone:    string;
  userId:   string;   // required — always pass from AuthContext
  userName: string;   // for display in admin panel
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
  // ── Step 1: upload image ──────────────────────────────────────────────────
  const blob       = await uriToBlob(payload.imageUri);
  const filename   = `prescriptions/${payload.userId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);
  const task       = uploadBytesResumable(storageRef, blob);

  const imageUrl: string = await new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    );
  });

  // ── Step 2: save to Firestore ─────────────────────────────────────────────
  const docRef = await addDoc(collection(db, 'prescriptions'), {
    userId:    payload.userId,
    userName:  payload.userName,
    shopId:    DEFAULT_SHOP.id,      // Automatically assign default shop
    shopName:  DEFAULT_SHOP.name,    // Store shop name for easy reference
    imageUrl,
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
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));
  },

  async getShopPrescriptions(shopId: string): Promise<Prescription[]> {
    const q    = query(collection(db, 'prescriptions'), where('shopId', '==', shopId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));
  },

  async getPrescription(id: string): Promise<Prescription | null> {
    const snap = await getDoc(doc(db, 'prescriptions', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Prescription) : null;
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
