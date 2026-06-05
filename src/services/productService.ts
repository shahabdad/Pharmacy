import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { DEFAULT_SHOP } from '../constants/shops';
import { db } from '../firebase/config';
import { Product } from '../types';

// ─── Normalise Firestore doc → Product ───────────────────────────────────────
const normalizeProduct = (id: string, data: any): Product => ({
  ...data,
  id,
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt ?? Date.now()),
  updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt ?? Date.now()),
} as Product);

export const productService = {

  // ── Create ──────────────────────────────────────────────────────────────────
  async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    const productData = {
      ...data,
      shopId:    data.shopId || DEFAULT_SHOP.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'products'), productData);

    return {
      id: docRef.id,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;
  },

  // ── Read (Real-time) ────────────────────────────────────────────────────────
  listenToShopProducts(shopId: string, callback: (products: Product[]) => void): () => void {
    const q = query(collection(db, 'products'), where('shopId', '==', shopId));
    return onSnapshot(q, snap => {
      const products = snap.docs.map(d => normalizeProduct(d.id, d.data()));
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(products);
    });
  },

  // ── One-shot fetches ────────────────────────────────────────────────────────
  async getShopProducts(shopId: string): Promise<Product[]> {
    const q = query(collection(db, 'products'), where('shopId', '==', shopId));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeProduct(d.id, d.data()));
  },

  async getProduct(productId: string): Promise<Product | null> {
    const snap = await getDoc(doc(db, 'products', productId));
    return snap.exists() ? normalizeProduct(snap.id, snap.data()) : null;
  },

  // ── Mutations ───────────────────────────────────────────────────────────────
  async updateProduct(productId: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await updateDoc(doc(db, 'products', productId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
  },
};

