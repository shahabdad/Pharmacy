import {
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DEFAULT_SHOP } from '../constants/shops';
import { Prescription, Product, User } from '../types';

export interface ReportData {
  summary: {
    totalRevenue: number;
    totalPrescriptions: number;
    totalUsers: number;
    totalProducts: number;
  };
  prescriptionStats: {
    pending: number;
    quoted: number;
    approved: number;
    delivered: number;
    rejected: number;
  };
  revenueByMonth: { month: string; amount: number }[];
  categoryDistribution: { category: string; count: number }[];
  recentGrowth: { date: string; count: number }[];
}

export const reportService = {
  async getAdminReports(): Promise<ReportData> {
    const shopId = DEFAULT_SHOP.id;

    // Fetch all required collections
    const [prescSnap, userSnap, prodSnap] = await Promise.all([
      getDocs(query(collection(db, 'prescriptions'), where('shopId', '==', shopId))),
      getDocs(collection(db, 'users')),
      getDocs(query(collection(db, 'products'), where('shopId', '==', shopId))),
    ]);

    const prescriptions = prescSnap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));
    const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    const users = userSnap.docs.map(d => ({ uid: d.id, ...d.data() } as unknown as User));

    // Calculate Summary
    const totalRevenue = prescriptions
      .filter(p => p.status === 'approved' || p.status === 'delivered')
      .reduce((sum, p) => sum + (p.quoteAmount || 0), 0);

    // Prescription Stats
    const prescStats = {
      pending: prescriptions.filter(p => p.status === 'pending').length,
      quoted: prescriptions.filter(p => p.status === 'quoted').length,
      approved: prescriptions.filter(p => p.status === 'approved').length,
      delivered: prescriptions.filter(p => p.status === 'delivered').length,
      rejected: prescriptions.filter(p => p.status === 'rejected').length,
    };

    // Revenue by Month (Last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueMap: Record<string, number> = {};
    
    prescriptions.forEach(p => {
      if (p.status === 'approved' || p.status === 'delivered') {
        const date = p.createdAt instanceof Date ? p.createdAt : (p.createdAt as any)?.toDate?.() || new Date();
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        revenueMap[key] = (revenueMap[key] || 0) + (p.quoteAmount || 0);
      }
    });

    const revenueByMonth = Object.entries(revenueMap)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-6);

    // Category Distribution
    const catMap: Record<string, number> = {};
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    // User Growth (Last 7 days)
    const growthMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        growthMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }

    users.forEach(u => {
      const date = u.createdAt instanceof Date ? u.createdAt : (u.createdAt as any)?.toDate?.() || new Date();
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (growthMap[dayKey] !== undefined) {
        growthMap[dayKey]++;
      }
    });
    const recentGrowth = Object.entries(growthMap).map(([date, count]) => ({ date, count }));

    return {
      summary: {
        totalRevenue,
        totalPrescriptions: prescriptions.length,
        totalUsers: users.length,
        totalProducts: products.length,
      },
      prescriptionStats: prescStats,
      revenueByMonth,
      categoryDistribution,
      recentGrowth,
    };
  }
};
