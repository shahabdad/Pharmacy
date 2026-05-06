import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { appUser, isAdmin } = useAuth();
  const scheme = useColorScheme();

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              router.replace('/auth' as any);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        
        {/* Header / Hero */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="bg-white dark:bg-slate-900 mx-5 mt-4 p-6 rounded-[32px] items-center border border-gray-100 dark:border-slate-800"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 }}
        >
          <View className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#6C63FF" />
            <View className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 items-center justify-center">
              <View className="w-2 h-2 bg-white rounded-full" />
            </View>
          </View>
          <Text className="text-xl font-black text-gray-900 dark:text-white mb-1">{appUser?.name || 'Guest User'}</Text>
          <Text className="text-sm text-gray-400 font-medium mb-4">{appUser?.email}</Text>

          <View className="flex-row gap-2">
            <View className="bg-violet-600 px-4 py-1.5 rounded-full">
              <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                {isAdmin ? 'System Admin' : 'Premium Member'}
              </Text>
            </View>
            <View className="bg-gray-100 dark:bg-slate-800 px-4 py-1.5 rounded-full">
              <Text className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {appUser?.region || 'Mardan'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <View className="flex-row px-5 mt-6 gap-3">
          {[
            { label: 'Orders', value: '12', icon: 'cart-outline', color: '#6366F1' },
            { label: 'Saved Rx', value: '4', icon: 'bookmark-outline', color: '#10B981' },
            { label: 'Credits', value: '240', icon: 'wallet-outline', color: '#F59E0B' },
          ].map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(i * 100 + 200).springify()}
              className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl items-center border border-gray-50 dark:border-slate-800"
            >
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text className="text-lg font-black text-gray-900 dark:text-white mt-1">{stat.value}</Text>
              <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Settings Groups */}
        <View className="px-5 mt-8">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Account Settings</Text>
          
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-slate-800">
            <SettingItem icon="person-outline" label="Edit Profile" />
            <SettingItem icon="location-outline" label="My Addresses" />
            <SettingItem icon="notifications-outline" label="Notifications" />
            <SettingItem icon="moon-outline" label="Dark Mode" right={<Text className="text-[10px] font-bold text-gray-400">{scheme === 'dark' ? 'ON' : 'SYSTEM'}</Text>} />
          </Animated.View>

          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 mt-8">Support & Legal</Text>
          <Animated.View entering={FadeInDown.delay(500).duration(400)} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-slate-800">
            <SettingItem icon="help-circle-outline" label="Help Center" />
            <SettingItem icon="shield-checkmark-outline" label="Privacy Policy" />
            <SettingItem icon="document-text-outline" label="Terms of Service" />
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)} className="mt-8">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="bg-red-50 dark:bg-red-950/20 py-5 rounded-[24px] flex-row items-center justify-center gap-3 border border-red-100 dark:border-red-900/30"
            >
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text className="text-red-500 font-black text-base">Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(800).duration(400)}
            className="text-center text-[10px] text-gray-300 mt-3 mb-2"
          >
            Medicare v1.0.0
          </Animated.Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingItem({ icon, label, right }: { icon: string; label: string; right?: React.ReactNode }) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      className="flex-row items-center px-6 py-4 border-b border-gray-50 dark:border-slate-800"
    >
      <View className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#6C63FF" />
      </View>
      <Text className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-200">{label}</Text>
      {right ? right : <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
    </TouchableOpacity>
  );
}
