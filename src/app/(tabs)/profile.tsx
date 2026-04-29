import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
type MenuItem = {
  icon: string;
  label: string;
  sublabel?: string;
  color: string;
  bg: string;
  badge?: string;
  toggle?: boolean;
};

type Section = { title: string; items: MenuItem[] };

// ─── Data ─────────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline',    label: 'Edit Profile',       sublabel: 'Name, photo, bio',   color: '#6C63FF', bg: 'bg-violet-100'  },
      { icon: 'location-outline',  label: 'Delivery Addresses', sublabel: '2 saved addresses',  color: '#10B981', bg: 'bg-emerald-100' },
      { icon: 'card-outline',      label: 'Payment Methods',    sublabel: 'Visa •••• 4242',     color: '#3B82F6', bg: 'bg-blue-100'    },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline', label: 'Notifications', sublabel: 'Push & email alerts', color: '#F59E0B', bg: 'bg-amber-100',  toggle: true },
      { icon: 'moon-outline',          label: 'Dark Mode',     sublabel: 'App appearance',      color: '#8B5CF6', bg: 'bg-purple-100', toggle: true },
      { icon: 'language-outline',      label: 'Language',      sublabel: 'English',             color: '#06B6D4', bg: 'bg-cyan-100'   },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline',   label: 'Help & Support',  sublabel: 'FAQs, live chat',    color: '#EC4899', bg: 'bg-pink-100'  },
      { icon: 'document-text-outline', label: 'Terms & Privacy', sublabel: 'Legal documents',    color: '#64748B', bg: 'bg-slate-100' },
      { icon: 'star-outline',          label: 'Rate the App',    sublabel: 'Share your feedback', color: '#F59E0B', bg: 'bg-amber-100', badge: 'NEW' },
    ],
  },
];

const ACTIVITY = [
  { icon: 'bag-check-outline',  label: 'Order delivered',       time: '2h ago',    color: '#10B981', bg: 'bg-emerald-100' },
  { icon: 'document-outline',   label: 'Prescription approved', time: 'Yesterday', color: '#6C63FF', bg: 'bg-violet-100'  },
  { icon: 'chatbubble-outline', label: 'New message from shop', time: '2 days ago', color: '#3B82F6', bg: 'bg-blue-100'   },
];

// ─── Row item ─────────────────────────────────────────────────────────────────
function RowItem({
  item, index, total, delay,
}: {
  item: MenuItem; index: number; total: number; delay: number;
}) {
  const [toggled, setToggled] = useState(false);
  const scale    = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)} style={animStyle}>
      <TouchableOpacity
        activeOpacity={item.toggle ? 1 : 0.8}
        onPressIn={() => { if (!item.toggle) scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => { if (!item.toggle) Alert.alert(item.label); }}
        className={`flex-row items-center gap-3 bg-white px-4 py-3.5
          ${index === 0 ? 'rounded-t-2xl' : ''}
          ${index === total - 1 ? 'rounded-b-2xl' : 'border-b border-gray-50'}`}
      >
        <View className={`w-9 h-9 ${item.bg} rounded-xl items-center justify-center`}>
          <Ionicons name={item.icon as any} size={18} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-800">{item.label}</Text>
          {item.sublabel && <Text className="text-[11px] text-gray-400 mt-0.5">{item.sublabel}</Text>}
        </View>
        {item.badge && (
          <View className="bg-violet-600 rounded-full px-2 py-0.5 mr-1">
            <Text className="text-white text-[9px] font-bold">{item.badge}</Text>
          </View>
        )}
        {item.toggle ? (
          <Switch
            value={toggled}
            onValueChange={setToggled}
            trackColor={{ false: '#E5E7EB', true: '#6C63FF' }}
            thumbColor="#fff"
            style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
          />
        ) : (
          <Ionicons name="chevron-forward" size={15} color="#D1D5DB" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets  = useSafeAreaInsets();
  const { appUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const logoutScale = useSharedValue(1);
  const logoutStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoutScale.value }] }));

  // Derived display values from real user data
  const displayName  = appUser?.name  ?? 'User';
  const displayEmail = appUser?.email ?? '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const roleLabel    = appUser?.role === 'admin' ? 'Shop Admin' : 'Patient';

  async function handleLogout() {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await authService.logout();
              router.replace('/signup');
            } catch {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInUp.springify().damping(16)}
          className="mx-4 mt-4 mb-5 rounded-[28px] overflow-hidden"
          style={{ shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 14 }}
        >
          <View className="bg-violet-600 px-5 pt-6 pb-6">
            {/* Blobs */}
            <View className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10" pointerEvents="none" />
            <View className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-500/30" pointerEvents="none" />

            {/* Avatar + info */}
            <View className="flex-row items-center gap-4 mb-5">
              <Animated.View entering={ZoomIn.delay(100).springify()}>
                <View
                  className="w-[68px] h-[68px] rounded-[22px] bg-white items-center justify-center"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 }}
                >
                  <Text className="text-3xl font-black text-violet-600">{avatarLetter}</Text>
                </View>
                <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
              </Animated.View>

              <View className="flex-1">
                <Text className="text-white text-xl font-black tracking-tight" numberOfLines={1}>
                  {displayName}
                </Text>
                <Text className="text-violet-200 text-xs mt-0.5" numberOfLines={1}>
                  {displayEmail}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-2">
                  <View className="bg-white/20 rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
                    <Ionicons name={appUser?.role === 'admin' ? 'storefront' : 'person'} size={9} color="#fff" />
                    <Text className="text-white text-[10px] font-bold">{roleLabel}</Text>
                  </View>
                  <View className="bg-emerald-400/30 rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
                    <Ionicons name="checkmark-circle" size={9} color="#6EE7B7" />
                    <Text className="text-emerald-200 text-[10px] font-bold">Verified</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="w-9 h-9 bg-white/20 rounded-xl items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={15} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View className="flex-row gap-2.5">
              {[
                { value: '12',  label: 'Orders'        },
                { value: '8',   label: 'Prescriptions' },
                { value: '240', label: 'Points'        },
              ].map((s) => (
                <View key={s.label} className="flex-1 bg-white/15 rounded-2xl py-3 items-center">
                  <Text className="text-white font-black text-xl">{s.value}</Text>
                  <Text className="text-violet-200 text-[10px] font-semibold mt-0.5">{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Membership bar */}
          <View className="bg-indigo-700 px-5 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="diamond-outline" size={16} color="#A5B4FC" />
              <Text className="text-indigo-200 text-xs font-semibold">Silver Member</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="h-1.5 w-24 bg-indigo-500 rounded-full overflow-hidden">
                <View className="h-full w-[60%] bg-violet-300 rounded-full" />
              </View>
              <Text className="text-indigo-300 text-[10px] ml-1">60% to Gold</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Recent Activity ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mx-4 mb-5">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Recent Activity
          </Text>
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
          >
            {ACTIVITY.map((a, i) => (
              <View
                key={a.label}
                className={`flex-row items-center gap-3 px-4 py-3 ${i < ACTIVITY.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <View className={`w-8 h-8 ${a.bg} rounded-xl items-center justify-center`}>
                  <Ionicons name={a.icon as any} size={15} color={a.color} />
                </View>
                <Text className="flex-1 text-xs font-semibold text-gray-700">{a.label}</Text>
                <Text className="text-[10px] text-gray-400">{a.time}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Settings sections ─────────────────────────────────────────── */}
        {SECTIONS.map((section, si) => (
          <View key={section.title} className="mx-4 mb-5">
            <Animated.Text
              entering={FadeInDown.delay(si * 120 + 150).duration(350)}
              className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1"
            >
              {section.title}
            </Animated.Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
            >
              {section.items.map((item, ii) => (
                <RowItem
                  key={item.label}
                  item={item}
                  index={ii}
                  total={section.items.length}
                  delay={si * 120 + ii * 60 + 200}
                />
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ────────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(400)}
          style={logoutStyle}
          className="mx-4 mb-2"
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPressIn={() => { logoutScale.value = withSpring(0.97); }}
            onPressOut={() => { logoutScale.value = withSpring(1); }}
            onPress={handleLogout}
            disabled={loggingOut}
            className="flex-row items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-4"
            style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 }}
          >
            <View className="w-9 h-9 bg-red-100 rounded-xl items-center justify-center">
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text className="flex-1 text-sm font-bold text-red-500">
              {loggingOut ? 'Logging out...' : 'Log Out'}
            </Text>
            <Ionicons name="chevron-forward" size={15} color="#FCA5A5" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(800).duration(400)}
          className="text-center text-[10px] text-gray-300 mt-3"
        >
          FastMadic v1.0.0 · Made with ❤️
        </Animated.Text>
      </ScrollView>
    </View>
  );
}
