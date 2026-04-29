import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Shop } from '../types';

export const shopService = {
  /**
   * Get all shops
   */
  async getAllShops(): Promise<Shop[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'shops'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Shop));
    } catch (error) {
      console.error('Get all shops error:', error);
      throw error;
  }
  },

  /**
   * Get shops by region
   */
  async getShopsByRegion(region: string): Promise<Shop[]> {
    try {
      const q = query(collection(db, 'shops'), where('region', '==', region));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Shop));
    } catch (error) {
      console.error('Get shops by region error:', error);
      throw error;
    }
  },

  /**
   * Get single shop
   */
  async getShop(shopId: string): Promise<Shop | null> {
    try {
      const docSnapshot = await getDoc(doc(db, 'shops', shopId));
      return docSnapshot.exists()
        ? ({ id: docSnapshot.id, ...docSnapshot.data() } as Shop)
        : null;
    } catch (error) {
      console.error('Get shop error:', error);
      throw error;
    }
  },

  /**
   * Create new shop (admin only)
   */
  async createShop(shopData: Omit<Shop, 'id' | 'createdAt'>): Promise<Shop> {
    try {
      const docRef = await addDoc(collection(db, 'shops'), {
        ...shopData,
        createdAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...shopData,
        createdAt: new Date(),
      } as Shop;
    } catch (error) {
      console.error('Create shop error:', error);
      throw error;
    }
  },

  /**
   * Update shop details
   */
  async updateShop(shopId: string, updates: Partial<Shop>): Promise<void> {
    try {
      await updateDoc(doc(db, 'shops', shopId), updates);
    } catch (error) {
      console.error('Update shop error:', error);
      throw error;
    }
  },
};
