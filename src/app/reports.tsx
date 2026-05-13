import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
    Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { reportService, ReportData } from '../services/reportService';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const { isAdmin } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const T = {
    screenBg: dark ? '#0D1117' : '#F8FAFC',
    headerBg: dark ? '#161B22' : '#FFFFFF',
    cardBg: dark ? '#161B22' : '#FFFFFF',
    border: dark ? '#21262D' : '#E2E8F0',
    textPri: dark ? '#F0F6FC' : '#0F172A',
    textSec: dark ? '#8B949E' : '#64748B',
    accent: '#6366F1',
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getAdminReports();
      setData(res);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.screenBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  if (!data) return null;

  return (
    <View style={{ flex: 1, backgroundColor: T.screenBg, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: T.headerBg, padding: 20, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: dark ? '#21262D' : '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={22} color={T.textPri} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '900', color: T.textPri }}>Business Reports</Text>
            <Text style={{ fontSize: 12, color: T.textSec }}>Real-time analytics & insights</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Summary Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <StatCard title="Revenue" value={`Rs. ${data.summary.totalRevenue.toLocaleString()}`} icon="cash-outline" color="#10B981" bg="#D1FAE5" />
          <StatCard title="Prescriptions" value={data.summary.totalPrescriptions.toString()} icon="document-text-outline" color="#6366F1" bg="#E0E7FF" />
          <StatCard title="Users" value={data.summary.totalUsers.toString()} icon="people-outline" color="#F59E0B" bg="#FEF3C7" />
          <StatCard title="Inventory" value={data.summary.totalProducts.toString()} icon="cube-outline" color="#EF4444" bg="#FEE2E2" />
        </View>

        {/* Prescription Status Bar Chart */}
        <ReportSection title="Prescription Status">
          <View style={{ gap: 12 }}>
            <ProgressBar label="Delivered" count={data.prescriptionStats.delivered} total={data.summary.totalPrescriptions} color="#10B981" />
            <ProgressBar label="Approved" count={data.prescriptionStats.approved} total={data.summary.totalPrescriptions} color="#6366F1" />
            <ProgressBar label="Quoted" count={data.prescriptionStats.quoted} total={data.summary.totalPrescriptions} color="#F59E0B" />
            <ProgressBar label="Pending" count={data.prescriptionStats.pending} total={data.summary.totalPrescriptions} color="#8B949E" />
            <ProgressBar label="Rejected" count={data.prescriptionStats.rejected} total={data.summary.totalPrescriptions} color="#EF4444" />
          </View>
        </ReportSection>

        {/* User Growth Chart (Custom Simple Bar) */}
        <ReportSection title="User Growth (Last 7 Days)">
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, paddingBottom: 20 }}>
            {data.recentGrowth.map((day, idx) => {
              const maxGrowth = Math.max(...data.recentGrowth.map(d => d.count)) || 1;
              const barHeight = (day.count / maxGrowth) * 100;
              return (
                <View key={idx} style={{ alignItems: 'center', width: (width - 80) / 7 }}>
                  <Animated.View 
                    entering={FadeInDown.delay(idx * 100)}
                    style={{ height: `${barHeight}%`, width: 24, backgroundColor: T.accent, borderRadius: 6, marginBottom: 8 }} 
                  />
                  <Text style={{ fontSize: 10, color: T.textSec, fontWeight: '700' }}>{day.date}</Text>
                  <Text style={{ fontSize: 9, color: T.textPri, fontWeight: '800' }}>{day.count}</Text>
                </View>
              );
            })}
          </View>
        </ReportSection>

        {/* Revenue Trend */}
        <ReportSection title="Revenue Trends">
          {data.revenueByMonth.length === 0 ? (
            <Text style={{ color: T.textSec, textAlign: 'center', padding: 20 }}>No revenue data available yet</Text>
          ) : (
            <View style={{ gap: 16 }}>
              {data.revenueByMonth.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.accent }} />
                      <Text style={{ color: T.textPri, fontWeight: '700' }}>{item.month}</Text>
                   </View>
                   <Text style={{ color: T.accent, fontWeight: '900' }}>Rs. {item.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </ReportSection>

      </ScrollView>
    </View>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
    const dark = useColorScheme() === 'dark';
    return (
        <View style={{ 
            flex: 1, minWidth: '45%', backgroundColor: dark ? '#161B22' : '#FFF', 
            padding: 16, borderRadius: 24, borderWidth: 1, borderColor: dark ? '#21262D' : '#E2E8F0' 
        }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: dark ? '#F0F6FC' : '#0F172A' }}>{value}</Text>
            <Text style={{ fontSize: 10, color: dark ? '#8B949E' : '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{title}</Text>
        </View>
    );
}

function ReportSection({ title, children }: any) {
    const dark = useColorScheme() === 'dark';
    return (
        <Animated.View entering={FadeInRight} style={{ 
            backgroundColor: dark ? '#161B22' : '#FFF', borderRadius: 28, padding: 20, marginBottom: 20,
            borderWidth: 1, borderColor: dark ? '#21262D' : '#E2E8F0'
        }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: dark ? '#F0F6FC' : '#0F172A', marginBottom: 20 }}>{title}</Text>
            {children}
        </Animated.View>
    );
}

function ProgressBar({ label, count, total, color }: any) {
    const dark = useColorScheme() === 'dark';
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: dark ? '#F0F6FC' : '#0F172A' }}>{label}</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color }}>{count} ({Math.round(percentage)}%)</Text>
            </View>
            <View style={{ height: 10, backgroundColor: dark ? '#0D1117' : '#F1F5F9', borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color }} />
            </View>
        </View>
    );
}
