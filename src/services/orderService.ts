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
import { DEFAULT_SHOP } from '../constants/shops';
import { db } from '../firebase/config';
import { Order, OrderItem, OrderStatus } from '../types';

export const orderService = {
  /**
   * Create a new order
   * Automatically assigns to default shop (MadicCare) if no shopId provided
   */
  async createOrder(
    userId: string,
    shopId: string = DEFAULT_SHOP.id, // Default to MadicCare
    items: OrderItem[],
    totalAmount: number
  ): Promise<Order> {
    try {
      const orderData = {
        userId,
        shopId:    shopId || DEFAULT_SHOP.id, // Fallback to default shop
        shopName:  DEFAULT_SHOP.name,         // Store shop name for reference
        items,
        totalAmount,
        status: 'pending' as OrderStatus,
        whatsappNotified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Create associated chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        orderId: docRef.id,
        messages: [],
        createdAt: serverTimestamp(),
      });

      // Update order with chat ID
      await updateDoc(docRef, { chatId: chatRef.id });

      return {
        id: docRef.id,
        ...orderData,
        chatId: chatRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  },

  /**
   * Get all orders for a shop
   */
  async getShopOrders(shopId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('shopId', '==', shopId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
    } catch (error) {
      console.error('Get shop orders error:', error);
      throw error;
    }
  },

  /**
   * Get single order
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docSnapshot = await getDoc(doc(db, 'orders', orderId));
      return docSnapshot.exists()
        ? ({ id: docSnapshot.id, ...docSnapshot.data() } as Order)
        : null;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  /**
   * Mark as WhatsApp notified
   */
  async markWhatsAppNotified(orderId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        whatsappNotified: true,
      });
    } catch (error) {
      console.error('Mark WhatsApp notified error:', error);
      throw error;
    }
  },
};
