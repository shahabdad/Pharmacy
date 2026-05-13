import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { DEFAULT_SHOP } from '../constants/shops';
import { db } from '../firebase/config';
import { Order, Prescription, Chat } from '../types';

export interface DashboardStats {
  prescriptions: number;
  activeChats: number;
  revenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'prescription' | 'order' | 'chat';
  text: string;
  time: Date;
  color: string;
  icon: string;
  route: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const shopId = DEFAULT_SHOP.id;

    // Prescriptions count
    const prescSnap = await getDocs(query(collection(db, 'prescriptions'), where('shopId', '==', shopId)));
    
    // Orders count
    const orderSnap = await getDocs(query(collection(db, 'orders'), where('shopId', '==', shopId)));
    
    // Delivered orders for revenue
    const deliveredOrders = orderSnap.docs
      .map(d => d.data() as Order)
      .filter(o => o.status === 'delivered');
    
    const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Active chats (where the last message is from user)
    // For simplicity, we'll just count all chats for now
    const chatSnap = await getDocs(collection(db, 'chats'));

    return {
      prescriptions: prescSnap.size,
      activeChats:   chatSnap.size,
      revenue,
    };
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    const shopId = DEFAULT_SHOP.id;
    const activities: ActivityItem[] = [];

    // Latest 5 Prescriptions
    const prescSnap = await getDocs(query(
      collection(db, 'prescriptions'), 
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc'),
      limit(5)
    ));
    prescSnap.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'prescription',
        text: `New prescription from ${data.userName || 'Customer'}`,
        time: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        color: '#EF4444',
        icon: 'document-text',
        route: '/admin-prescriptions',
      });
    });

    // Latest 5 Chats (if they have messages)
    const chatSnap = await getDocs(query(
      collection(db, 'chats'),
      orderBy('createdAt', 'desc'),
      limit(5)
    ));
    chatSnap.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'chat',
        text: `New chat message from ${data.userName || 'Customer'}`,
        time: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        color: '#F59E0B',
        icon: 'chatbubble',
        route: `/admin-chat-detail?chatId=${doc.id}`,
      });
    });

    // Sort all activities by time descending
    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
  }
};
