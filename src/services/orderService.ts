import {
    addDoc,
    collection,
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
import { Order, OrderItem, OrderStatus } from '../types';

// ─── Normalise Firestore doc → Order ─────────────────────────────────────────
const normalizeOrder = (id: string, data: any): Order => ({
  ...data,
  id,
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt ?? Date.now()),
  updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt ?? Date.now()),
} as Order);

export const orderService = {

  // ── Create ──────────────────────────────────────────────────────────────────
  async createOrder(
    userId: string,
    shopId: string = DEFAULT_SHOP.id,
    items: OrderItem[],
    totalAmount: number,
    meta?: { userName?: string; userPhone?: string; userAddress?: string }
  ): Promise<Order> {
    const orderData = {
      userId,
      shopId:      shopId || DEFAULT_SHOP.id,
      shopName:    DEFAULT_SHOP.name,
      userName:    meta?.userName    ?? '',
      userPhone:   meta?.userPhone   ?? '',
      userAddress: meta?.userAddress ?? '',
      items,
      totalAmount,
      status:           'pending' as OrderStatus,
      whatsappNotified: false,
      adminNote:        '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // Create associated chat thread
    const chatRef = await addDoc(collection(db, 'chats'), {
      orderId:      docRef.id,
      userId,
      type:         'order',
      participants: [userId, 'admin'],
      messages:     [],
      createdAt:    serverTimestamp(),
    });

    await updateDoc(docRef, { chatId: chatRef.id });

    return {
      id: docRef.id,
      ...orderData,
      chatId:    chatRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order;
  },

  // ── Real-time: user's own orders ────────────────────────────────────────────
  listenToUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    return onSnapshot(q, snap => {
      const orders = snap.docs.map(d => normalizeOrder(d.id, d.data()));
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(orders);
    });
  },

  // ── Real-time: all orders for a shop (admin) ────────────────────────────────
  listenToShopOrders(shopId: string, callback: (orders: Order[]) => void): () => void {
    const q = query(collection(db, 'orders'), where('shopId', '==', shopId));
    return onSnapshot(q, snap => {
      const orders = snap.docs.map(d => normalizeOrder(d.id, d.data()));
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(orders);
    });
  },

  // ── Real-time: ALL orders (admin, no shop filter) ───────────────────────────
  listenToAllOrders(callback: (orders: Order[]) => void): () => void {
    return onSnapshot(collection(db, 'orders'), snap => {
      const orders = snap.docs.map(d => normalizeOrder(d.id, d.data()));
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(orders);
    });
  },

  // ── One-shot fetches ────────────────────────────────────────────────────────
  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeOrder(d.id, d.data()));
  },

  async getShopOrders(shopId: string): Promise<Order[]> {
    const q = query(collection(db, 'orders'), where('shopId', '==', shopId));
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeOrder(d.id, d.data()));
  },

  async getOrder(orderId: string): Promise<Order | null> {
    const snap = await getDoc(doc(db, 'orders', orderId));
    return snap.exists() ? normalizeOrder(snap.id, snap.data()) : null;
  },

  // ── Mutations ───────────────────────────────────────────────────────────────
  async updateOrderStatus(orderId: string, status: OrderStatus, adminNote?: string): Promise<void> {
    const update: any = { status, updatedAt: serverTimestamp() };
    if (adminNote !== undefined) update.adminNote = adminNote;
    await updateDoc(doc(db, 'orders', orderId), update);
  },

  async markWhatsAppNotified(orderId: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), { whatsappNotified: true });
  },
};

