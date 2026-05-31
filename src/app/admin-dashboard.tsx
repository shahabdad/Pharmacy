import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  ActivityItem,
  dashboardService,
  DashboardStats,
} from '../services/dashboardService';
import { notificationService } from '../services/notificationService';
import { ModernAlert, ModernToast, AlertType } from '../components/ModernAlert';
import { Notification } from '../types';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;
const ACCENT = '#4F46E5';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function IconButton({
  icon,
  onPress,
  badgeCount,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badgeCount?: number;
}) {
  return (
    <View className="relative">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="w-10 h-10 bg-white dark:bg-[#161B22] rounded-2xl items-center justify-center border border-slate-100 dark:border-zinc-800"
      >
        <Ionicons name={icon} size={20} color="#64748B" />
      </TouchableOpacity>
      {badgeCount && badgeCount > 0 ? (
        <View 
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 items-center justify-center border-2 border-white dark:border-[#0D1117]"
          style={{ zIndex: 10 }}
        >
          <Text className="text-[9px] font-black text-white">
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
  trend,
  loading,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  trend?: string;
  loading?: boolean;
}) {
  return (
    <View className="flex-1 min-w-[30%] bg-white dark:bg-[#161B22] rounded-2xl p-4 border border-slate-100 dark:border-zinc-800">
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {trend ? (
          <View className="bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <Text className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              {trend}
            </Text>
          </View>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={ACCENT} style={{ alignSelf: 'flex-start' }} />
      ) : (
        <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          {value}
        </Text>
      )}
      <Text className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
        {label}
      </Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appUser, isAdmin } = useAuth();

  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const [notificationsDropdownVisible, setNotificationsDropdownVisible] = React.useState(false);
  const [adminMenuVisible, setAdminMenuVisible] = React.useState(false);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: AlertType }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: AlertType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showAlert = (title: string, message: string, type: AlertType = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const showToast = (message: string, type: AlertType = 'success') => {
    setToast({ visible: true, message, type });
  };

  React.useEffect(() => {
    if (!isAdmin) {
      showAlert('Access Denied', 'You do not have admin privileges');
      setTimeout(() => router.replace('/(tabs)'), 2000);
    }
  }, [isAdmin, router]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (isAdmin) {
        fetchData();
        const unsub = notificationService.listenToAdminNotifications((newNotifications) => {
            setNotifications(newNotifications);
        });
        return unsub;
    }
  }, [isAdmin, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleNotificationPress = async (notification: Notification) => {
    setNotificationsDropdownVisible(false);
    await notificationService.markAsRead(notification);
    router.push(notification.route as any);
  };

  const handleMarkAllRead = async () => {
      try {
          const unread = notifications.filter(n => !n.read);
          await Promise.all(unread.map(n => notificationService.markAsRead(n)));
          setNotificationsDropdownVisible(false);
          showToast('All notifications marked as read');
      } catch (error) {
          console.error('Error marking all as read:', error);
      }
  };

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
    setAdminMenuVisible(false);
    setDrawerVisible(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      setLogoutModalVisible(false);
      await authService.logout();
      router.replace('/auth' as any);
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to logout');
    }
  };

  const handleLogout = async () => {
    handleLogoutPress();
  };

  const handleRecentActivityPress = (activity: ActivityItem) => {
    setRecentActivity((prev) => prev.filter((item) => item.id !== activity.id || item.type !== activity.type));
    router.push(activity.route as any);
  };

  if (!isAdmin) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-[#0D1117] items-center justify-center">
        <ModernAlert 
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
        />
      </View>
    );
  }

  const initials =
    appUser?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AD';

  const stats = [
    {
      label: 'Total Users',
      value: dashboardStats?.userCount?.toLocaleString() ?? '0',
      icon: 'people-outline' as const,
      color: '#4F46E5',
      bg: '#EEF2FF',
    },
    {
      label: 'Active Chats',
      value: dashboardStats?.activeChats?.toLocaleString() ?? '0',
      icon: 'chatbubbles-outline' as const,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      label: 'Prescriptions',
      value: dashboardStats?.prescriptions?.toLocaleString() ?? '0',
      icon: 'document-text-outline' as const,
      color: '#DC2626',
      bg: '#FEF2F2',
    },
  ];

  const quickActions = [
    { label: 'Prescriptions', icon: 'document-text-outline', color: '#DC2626', route: '/admin-prescriptions' },
    { label: 'Chats', icon: 'chatbubbles-outline', color: '#059669', route: '/admin-chats' },
    { label: 'Users', icon: 'people-outline', color: '#4F46E5', route: '/admin-users' },
    { label: 'Reports', icon: 'stats-chart-outline', color: '#DB2777', route: '/reports' },
  ];

  const drawerItems = [
    { label: 'Dashboard', icon: 'grid-outline', route: '/admin-dashboard', color: '#4F46E5' },
    { label: 'Prescriptions', icon: 'document-text-outline', route: '/admin-prescriptions', color: '#DC2626' },
    { label: 'Customer Chats', icon: 'chatbubbles-outline', route: '/admin-chats', color: '#059669' },
    { label: 'User Management', icon: 'people-outline', route: '/admin-users', color: '#8B5CF6' },
    { label: 'Analytics Reports', icon: 'stats-chart-outline', route: '/reports', color: '#EC4899' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View
      className="flex-1 bg-slate-50 dark:bg-[#0D1117]"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-2">
          <Animated.View entering={FadeInDown.duration(350)}>
            <View className="flex-row items-center justify-between mb-6">
              <IconButton icon="menu-outline" onPress={() => setDrawerVisible(true)} />
              <View className="flex-row items-center gap-2">
                <IconButton
                  icon="notifications-outline"
                  badgeCount={unreadCount}
                  onPress={() => setNotificationsDropdownVisible(!notificationsDropdownVisible)}
                />
                <TouchableOpacity
                  onPress={() => setAdminMenuVisible(!adminMenuVisible)}
                  activeOpacity={0.8}
                  className="w-10 h-10 rounded-2xl items-center justify-center ml-1"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Text className="text-white text-sm font-bold">{initials}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Welcome back
            </Text>
            <Text className="text-[28px] font-bold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
              {appUser?.name || 'Admin'}
            </Text>
            <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1" numberOfLines={1}>
              {appUser?.email}
            </Text>
          </Animated.View>
        </View>

        {/* Stats */}
        <View className="px-5 mb-5">
          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
            <View className="flex-row flex-wrap gap-3">
              {stats.map((stat, idx) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInDown.delay(idx * 40 + 120).springify()}
                  className="flex-1"
                  style={{ minWidth: '30%' }}
                >
                  <StatCard {...stat} loading={loading} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>

        <View className="px-5">
          <Animated.View entering={FadeInDown.delay(220).duration(350)} className="mb-5">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-50 mb-3">
              Quick actions
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {quickActions.map((action, idx) => (
                <Animated.View
                  key={action.label}
                  entering={FadeInDown.delay(idx * 35 + 260).springify()}
                  className="w-[22%]"
                >
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => router.push(action.route as any)}
                    className="bg-white dark:bg-[#161B22] rounded-2xl py-4 px-2 items-center border border-slate-100 dark:border-zinc-800"
                  >
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center mb-2"
                      style={{ backgroundColor: `${action.color}12` }}
                    >
                      <Ionicons name={action.icon as any} size={22} color={action.color} />
                    </View>
                    <Text
                      className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center"
                      numberOfLines={1}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(350)}
            className="bg-white dark:bg-[#161B22] rounded-2xl mb-5 border border-slate-100 dark:border-zinc-800 overflow-hidden"
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-base font-bold text-slate-900 dark:text-slate-50">
                Recent activity
              </Text>
              <TouchableOpacity hitSlop={12}>
                <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 pb-4">
              {loading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" color={ACCENT} />
                </View>
              ) : recentActivity.length === 0 ? (
                <View className="py-10 items-center">
                  <Ionicons name="time-outline" size={28} color="#94A3B8" />
                  <Text className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                    No recent activity
                  </Text>
                </View>
              ) : (
                recentActivity.map((activity, idx) => (
                  <Animated.View
                    key={`${activity.id}-${activity.type}`}
                    entering={FadeInUp.delay(idx * 50 + 350).springify()}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRecentActivityPress(activity)}
                      className="flex-row items-center py-3"
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${activity.color}14` }}
                      >
                        <Ionicons name={activity.icon as any} size={18} color={activity.color} />
                      </View>
                      <View className="flex-1 mx-3">
                        <Text
                          className="text-sm font-medium text-slate-900 dark:text-slate-50"
                          numberOfLines={2}
                        >
                          {activity.text}
                        </Text>
                        <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {timeAgo(activity.time)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                    {idx < recentActivity.length - 1 ? (
                      <View className="h-px bg-slate-100 dark:bg-zinc-800 ml-[52px]" />
                    ) : null}
                  </Animated.View>
                ))
              )}
            </View>
          </Animated.View>

          {/* Admin status Card - Restored */}
          <Animated.View
            entering={FadeInDown.delay(380).duration(350)}
            className="bg-slate-900 dark:bg-[#111827] rounded-2xl p-5 border border-slate-800"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-xl bg-indigo-500/15 items-center justify-center">
                  <Ionicons name="shield-checkmark" size={22} color="#818CF8" />
                </View>
                <View>
                  <Text className="text-white text-base font-bold">Admin console</Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <Text className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wide">
                      Active
                    </Text>
                  </View>
                </View>
              </View>
              <View className="bg-slate-800 px-2.5 py-1 rounded-md">
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Root</Text>
              </View>
            </View>

            <Text className="text-slate-400 text-sm leading-5">
              Full administrative access. Manage users, prescriptions, chats, and reports from
              this console.
            </Text>

            <View className="mt-4 pt-4 border-t border-slate-800 flex-row items-center justify-between">
              <Text className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                Security: High
              </Text>
              <TouchableOpacity
                onPress={handleLogoutPress}
                className="flex-row items-center gap-1"
              >
                <Ionicons name="log-out-outline" size={14} color="#94A3B8" />
                <Text className="text-slate-400 text-xs font-semibold">Sign out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Side Navigation Drawer */}
      {drawerVisible && (
        <View className="absolute inset-0 z-[100] flex-row">
          <Pressable 
            className="absolute inset-0 bg-black/50" 
            onPress={() => setDrawerVisible(false)} 
          />
          <Animated.View
            entering={SlideInLeft.duration(300)}
            exiting={SlideOutLeft.duration(250)}
            className="h-full bg-white dark:bg-[#0D1117] shadow-2xl border-r border-slate-100 dark:border-zinc-800"
            style={{ width: DRAWER_WIDTH }}
          >
            {/* Drawer Header */}
            <View className="px-6 pb-6 pt-12 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#161B22]">
                <View className="flex-row items-center gap-4">
                    <View className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm" style={{ backgroundColor: ACCENT }}>
                        <Text className="text-white text-lg font-black">{initials}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-black text-slate-900 dark:text-white" numberOfLines={1}>{appUser?.name}</Text>
                        <View className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md self-start mt-1">
                            <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">Administrator</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <ScrollView className="flex-1 py-4 px-3">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-4 mb-4 mt-2">Main Menu</Text>
                {drawerItems.map((item, idx) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => {
                            setDrawerVisible(false);
                            router.push(item.route as any);
                        }}
                        activeOpacity={0.7}
                        className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1 active:bg-slate-100 dark:active:bg-zinc-800"
                    >
                        <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${item.color}12` }}>
                            <Ionicons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1">{item.label}</Text>
                        {item.label === 'Customer Chats' && unreadCount > 0 && (
                            <View className="bg-emerald-500 px-2 py-0.5 rounded-full">
                                <Text className="text-[10px] font-black text-white">{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Drawer Footer */}
            <View className="p-4 border-t border-slate-100 dark:border-zinc-800">
                <TouchableOpacity 
                    onPress={handleLogoutPress}
                    activeOpacity={0.7}
                    className="flex-row items-center py-4 px-4 rounded-2xl bg-red-50 dark:bg-red-950/20"
                >
                    <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                    <Text className="text-sm font-black text-red-600 dark:text-red-400 ml-3">Sign Out Account</Text>
                </TouchableOpacity>
                <Text className="text-center text-[10px] text-slate-400 mt-4 mb-2">MadicCare Admin v1.2.0</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Notifications Dropdown */}
      {notificationsDropdownVisible && (
        <View className="absolute inset-0 z-50">
          <Pressable className="flex-1" onPress={() => setNotificationsDropdownVisible(false)} />
          <Animated.View
            entering={FadeInDown.duration(200).springify()}
            className="absolute top-16 right-5 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
            style={{ width: 320, maxHeight: 480 }}
          >
            <View className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900 dark:text-white">Notifications</Text>
              {unreadCount > 0 && (
                <View className="bg-indigo-500 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] text-white font-bold">{unreadCount} New</Text>
                </View>
              )}
            </View>
            
            <ScrollView className="flex-1">
              {notifications.length === 0 ? (
                <View className="py-12 items-center">
                  <Ionicons name="notifications-off-outline" size={32} color="#94A3B8" />
                  <Text className="text-sm text-slate-400 mt-2">No notifications</Text>
                </View>
              ) : (
                notifications.slice(0, 5).map((n, idx) => (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => handleNotificationPress(n)}
                    activeOpacity={0.7}
                    className={`px-5 py-4 flex-row items-start gap-3 border-b border-slate-50 dark:border-slate-800/50 ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                  >
                    <View className="w-10 h-10 rounded-xl items-center justify-center flex-shrink-0" style={{ backgroundColor: `${n.color}15` }}>
                      <Ionicons name={n.icon} size={18} color={n.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>{n.title}</Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={2}>{n.message}</Text>
                      <Text className="text-[10px] text-slate-400 mt-1.5 font-medium">{timeAgo(n.timestamp)}</Text>
                    </View>
                    {!n.read && (
                      <View className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            
            <View className="flex-row border-t border-slate-100 dark:border-slate-800">
                <TouchableOpacity 
                    onPress={handleMarkAllRead}
                    className="flex-1 py-3.5 items-center border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <Text className="text-[11px] font-bold text-slate-500">Mark all read</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {
                        setNotificationsDropdownVisible(false);
                        router.push('/admin-notifications');
                    }}
                    className="flex-1 py-3.5 items-center bg-slate-50 dark:bg-slate-800/50"
                >
                  <Text className="text-[11px] font-bold text-indigo-600">View all alerts</Text>
                </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}


      {/* --- EXISTING ADMIN MENU (Updated onPress) --- */}
      {adminMenuVisible && (
        <View className="absolute inset-0 z-50">
          <Pressable className="flex-1" onPress={() => setAdminMenuVisible(false)} />
          <Animated.View
            entering={FadeInDown.duration(250).springify()}
            className="absolute top-16 right-5 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
            style={{ width: 260 }}
          >
            <View className="px-5 py-5 border-b border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: ACCENT }}>
                  <Text className="text-white text-sm font-bold">{initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">{appUser?.name || 'Admin'}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>{appUser?.email}</Text>
                </View>
              </View>
            </View>

            <View className="py-2">
              <TouchableOpacity
                // UPDATE: Close dropdown and open modal instead of logging out directly
                onPress={() => {
                  setAdminMenuVisible(false);
                  setLogoutModalVisible(true);
                }}
                className="px-5 py-3 flex-row items-center gap-3 active:bg-red-50 dark:active:bg-red-950/20"
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text className="text-sm font-medium text-red-600 dark:text-red-400 flex-1">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* --- NEW SIGN OUT CONFIRMATION MODAL --- */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center z-50">
          {/* Card matching your image */}
          <View className="bg-white dark:bg-slate-800 rounded-lg p-6 w-[85%] max-w-sm shadow-xl elevation-5">
            
            <Text className="text-slate-700 dark:text-slate-200 text-lg text-center font-medium mb-6">
              Are you sure you want to sign out?
            </Text>

            {/* Buttons Row */}
            <View className="flex-row justify-center gap-4">
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="bg-slate-400 dark:bg-slate-600 py-3 px-8 rounded-md"
              >
                <Text className="text-white font-semibold text-base">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                // Put your actual logout logic here
                onPress={() => {
                  setLogoutModalVisible(false);
                  handleLogoutConfirm(); 
                }}
                className="bg-red-500 py-3 px-8 rounded-md"
              >
                <Text className="text-white font-semibold text-base">OK</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>
    </View>
  );
}
