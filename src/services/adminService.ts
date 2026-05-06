import { collection, getDocs, query, where } from 'firebase/firestore';
import { DEFAULT_SHOP } from '../constants/shops';
import { db } from '../firebase/config';
import { Order, Prescription } from '../types';

/**
 * Admin Service
 * 
 * Provides admin-specific functionality:
 * - Dashboard statistics
 * - Analytics
 * - Reports
 */

export interface DashboardStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(shopId: string = DEFAULT_SHOP.id): Promise<DashboardStats> {
    try {
      // Get prescriptions
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('shopId', '==', shopId)
      );
      const prescriptionsSnap = await getDocs(prescriptionsQuery);
      const prescriptions = prescriptionsSnap.docs.map(d => d.data() as Prescription);

      // Get orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('shopId', '==', shopId)
      );
      const ordersSnap = await getDocs(ordersQuery);
      const orders = ordersSnap.docs.map(d => d.data() as Order);

      // Calculate stats
      const totalPrescriptions = prescriptions.length;
      const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const completedOrders = orders.filter(o => o.status === 'delivered').length;
      
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        totalPrescriptions,
        pendingPrescriptions,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(shopId: string = DEFAULT_SHOP.id, limit: number = 10) {
    try {
      // Get recent prescriptions
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('shopId', '==', shopId)
      );
      const prescriptionsSnap = await getDocs(prescriptionsQuery);
      const prescriptions = prescriptionsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Prescription))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      // Get recent orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('shopId', '==', shopId)
      );
      const ordersSnap = await getDocs(ordersQuery);
      const orders = ordersSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Order))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      // Combine and sort by date
      const activities = [
        ...prescriptions.map(p => ({
          type: 'prescription' as const,
          id: p.id,
          title: `New prescription from ${p.userName || 'User'}`,
          timestamp: new Date(p.createdAt),
          status: p.status,
        })),
        ...orders.map(o => ({
          type: 'order' as const,
          id: o.id,
          title: `Order #${o.id.slice(0, 8)} - ₨${o.totalAmount}`,
          timestamp: new Date(o.createdAt),
          status: o.status,
        })),
      ]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      return activities;
    } catch (error) {
      console.error('Get recent activity error:', error);
      throw error;
    }
  },
};
