import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { dashboardService, DashboardStats, ActivityItem } from '../../services/dashboardService';

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appUser, isAdmin } = useAuth();

  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stats, activity] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
      ]);
      setDashboardStats(stats);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/auth' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to logout');
    }
  };

  const handleRecentActivityPress = (activity: ActivityItem) => {
    setRecentActivity((prev) => prev.filter((item) => item.id !== activity.id || item.type !== activity.type));
    const route = activity.route.startsWith('/admin-')
      ? activity.route.replace('/admin-', '/admin/')
      : activity.route;
    router.push(route as any);
  };

  if (!isAdmin) {
    return null;
  }

  const stats = [
    { label: 'Prescriptions', value: (dashboardStats?.prescriptions ?? 0).toString(), icon: 'document-text', color: '#EF4444', bg: '#FEE2E2', trend: '+12%' },
    { label: 'Active Chats', value: (dashboardStats?.activeChats ?? 0).toString(), icon: 'chatbubbles', color: '#10B981', bg: '#D1FAE5', trend: '+5' },
    { label: 'Total Users', value: (dashboardStats?.userCount ?? 0).toString(), icon: 'people', color: '#6366F1', bg: '#E0E7FF', trend: 'Growing' },
  ];

  const quickActions = [
    { label: 'Prescriptions', icon: 'document-text', color: '#EF4444', route: '/admin/prescriptions' },
    { label: 'Chats', icon: 'chatbubbles', color: '#10B981', route: '/admin/chats' },
    { label: 'Users', icon: 'people', color: '#F59E0B', route: '/admin/users' },
    { label: 'Reports', icon: 'stats-chart', color: '#EC4899', route: '/admin/reports' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0D1117]" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Animated.View entering={FadeInDown.duration(400)} className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-sm text-gray-400 dark:text-[#6E7681] font-medium mb-1">Admin Dashboard</Text>
              <Text className="text-3xl font-black text-gray-900 dark:text-[#F0F6FC]">
                {appUser?.name?.split(' ')[0] || 'Admin'}
              </Text>
              <Text className="text-xs text-violet-600 font-bold mt-1">
                {appUser?.email}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-12 h-12 bg-white dark:bg-[#161B22] rounded-2xl items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {stats.map((stat, idx) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInDown.delay(idx * 50 + 150).springify()}
                  className="flex-1 min-w-[45%]"
                >
                  <View
                    className="bg-white dark:bg-[#161B22] rounded-3xl p-4"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 10,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View
                        className="w-11 h-11 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: stat.bg }}
                      >
                        <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                      </View>
                      <View className="bg-green-50 dark:bg-[#064E3B] px-2 py-1 rounded-lg">
                        <Text className="text-[10px] font-bold text-green-600 dark:text-green-400">{stat.trend}</Text>
                      </View>
                    </View>
                    <Text className="text-2xl font-black text-gray-900 dark:text-[#F0F6FC] mb-1">{stat.value}</Text>
                    <Text className="text-[10px] text-gray-400 dark:text-[#6E7681] font-semibold uppercase tracking-wide">{stat.label}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>

        <View className="px-6">
          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} className="mb-6">
            <Text className="text-lg font-black text-gray-900 dark:text-[#F0F6FC] mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-3">
              {quickActions.map((action, idx) => (
                <Animated.View
                  key={action.label}
                  entering={FadeInDown.delay(idx * 40 + 300).springify()}
                  className="w-[31%]"
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (action.route.startsWith('/admin') ||
                        action.route === '/reports') {
                        router.push(action.route as any);
                      } else {
                        Alert.alert('Coming Soon', `${action.label} feature is under development`);
                      }
                    }}
                    className="bg-white dark:bg-[#161B22] rounded-3xl p-4 items-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 10,
                      elevation: 3,
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text className="text-xs font-bold text-gray-900 dark:text-[#F0F6FC] text-center">
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            className="bg-white dark:bg-[#161B22] rounded-3xl p-5 mb-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-gray-900 dark:text-[#F0F6FC]">Recent Activity</Text>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-violet-600">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-3">
              {loading ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : recentActivity.length === 0 ? (
                <Text className="text-sm text-gray-400 dark:text-[#6E7681] text-center py-4">No recent activity</Text>
              ) : (
                recentActivity.map((activity, idx) => (
                  <Animated.View
                    key={activity.id + activity.type}
                    entering={FadeInUp.delay(idx * 60 + 450).springify()}
                  >
                    <TouchableOpacity
                      onPress={() => handleRecentActivityPress(activity)}
                      className="flex-row items-center gap-3 py-2"
                    >
                      <View
                        className="w-10 h-10 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: `${activity.color}15` }}
                      >
                        <Ionicons name={activity.icon as any} size={18} color={activity.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-900 dark:text-[#F0F6FC]">{activity.text}</Text>
                        <Text className="text-xs text-gray-400 dark:text-[#6E7681]">{timeAgo(activity.time)}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl items-center justify-center">
                  <Ionicons name="shield-checkmark" size={22} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-white text-lg font-black tracking-tighter">
                    Admin Console
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                      System Active
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                <Text className="text-zinc-400 text-[10px] font-bold uppercase">Root</Text>
              </View>
            </View>

            <Text className="text-zinc-400 text-sm leading-6">
              Authorized access only. You are currently operating with
              <Text className="text-white font-bold"> Full Administrative Privileges</Text>.
              Manage system architecture, user databases, and order fulfillment.
            </Text>

            <View className="mt-4 pt-4 border-t border-zinc-800 flex-row justify-between items-center">
              <Text className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider">
                Security Level: High
              </Text>
              <Ionicons name="finger-print" size={14} color="#3F3F46" />
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
