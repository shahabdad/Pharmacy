import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';

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
  return date.toLocaleDateString();
}

export default function AdminNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
      return;
    }

    const unsub = notificationService.listenToAdminNotifications((newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
      setRefreshing(false);
    });

    return unsub;
  }, [isAdmin]);

  const onRefresh = () => {
    setRefreshing(true);
    // The listener handles updates automatically
  };

  const handlePress = async (notification: Notification) => {
    await notificationService.markAsRead(notification);
    router.push(notification.route as any);
  };

  const renderItem = ({ item, index }: { item: Notification; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
        className={`px-5 py-5 flex-row items-start gap-4 border-b border-slate-100 dark:border-slate-800 ${!item.read ? 'bg-indigo-50/40 dark:bg-indigo-500/5' : 'bg-white dark:bg-[#0D1117]'}`}
      >
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center flex-shrink-0" 
          style={{ backgroundColor: `${item.color}15` }}
        >
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-slate-900 dark:text-white" numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && (
              <View className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </View>
          
          <Text className="text-sm text-slate-500 dark:text-slate-400 leading-5" numberOfLines={2}>
            {item.message}
          </Text>
          
          <Text className="text-xs text-slate-400 mt-2 font-medium">
            {timeAgo(item.timestamp)}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" className="mt-1" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0D1117] items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-[#0D1117]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">All Notifications</Text>
        </View>
        
        {notifications.filter(n => !n.read).length > 0 && (
          <TouchableOpacity 
            onPress={async () => {
                const unread = notifications.filter(n => !n.read);
                await Promise.all(unread.map(n => notificationService.markAsRead(n)));
            }}
          >
            <Text className="text-sm font-bold text-indigo-600">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
            <Ionicons name="notifications-off-outline" size={40} color="#94A3B8" />
          </View>
          <Text className="text-lg font-bold text-slate-900 dark:text-white text-center">No notifications yet</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
            When you receive alerts about messages or prescriptions, they will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
          }
        />
      )}
    </View>
  );
}
