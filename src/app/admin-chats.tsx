import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { chatService, toDate } from '../services/chatService';
import { Chat } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLastMessage(chat: Chat): string {
  if (!chat.messages?.length) return 'No messages yet';
  return chat.messages[chat.messages.length - 1].message;
}

function getLastTime(chat: Chat): Date {
  if (!chat.messages?.length) return toDate(chat.createdAt);
  return toDate(chat.messages[chat.messages.length - 1].timestamp);
}

function getUnreadCount(chat: Chat): number {
  // Messages from user that admin hasn't replied after
  if (!chat.messages?.length) return 0;
  let count = 0;
  for (let i = chat.messages.length - 1; i >= 0; i--) {
    if (chat.messages[i].sender === 'admin') break;
    count++;
  }
  return count;
}

function getChatLabel(chat: Chat): string {
  if (chat.prescriptionId) return `Rx #${chat.prescriptionId.slice(0, 6)}`;
  if (chat.orderId)        return `Order #${chat.orderId.slice(0, 6)}`;
  return 'General';
}

function getUserName(chat: Chat): string {
  if (chat.userName) return chat.userName;
  return chat.messages?.find(m => m.sender === 'user')?.senderName ?? 'Customer';
}

function avatarColors(name: string) {
  const palette = [
    { bg: '#FEE2E2', fg: '#EF4444' },
    { bg: '#DBEAFE', fg: '#3B82F6' },
    { bg: '#D1FAE5', fg: '#10B981' },
    { bg: '#FEF3C7', fg: '#F59E0B' },
    { bg: '#E0E7FF', fg: '#6366F1' },
    { bg: '#FCE7F3', fg: '#EC4899' },
  ];
  return palette[(name.charCodeAt(0) ?? 0) % palette.length];
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7)  return `${d}d`;
  return date.toLocaleDateString();
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AdminChatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [chats,      setChats]      = useState<Chat[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState<'all' | 'unread' | 'active'>('all');

  // Guard
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin privileges required');
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  // ── Real-time listener for ALL chats ────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const unsub = chatService.listenToAllChats(updated => {
      setChats(updated);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsub();
  }, [isAdmin]);

  // ── Filtered + sorted list ───────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...chats];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        getUserName(c).toLowerCase().includes(q) ||
        getLastMessage(c).toLowerCase().includes(q) ||
        getChatLabel(c).toLowerCase().includes(q)
      );
    }

    if (filter === 'unread') {
      list = list.filter(c => getUnreadCount(c) > 0);
    } else if (filter === 'active') {
      list = list.filter(c => Date.now() - getLastTime(c).getTime() < 86400000);
    }

    return list;
  }, [chats, search, filter]);

  const totalUnread = useMemo(
    () => chats.reduce((s, c) => s + getUnreadCount(c), 0),
    [chats]
  );

  if (!isAdmin) return null;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0D1117]" style={{ paddingTop: insets.top }}>

      {/* ── Header ── */}
      <View className="bg-white dark:bg-[#161B22] px-5 pt-4 pb-4"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 }}
      >
        <Animated.View entering={FadeInDown.duration(350)} className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-slate-100 dark:bg-[#21262D] rounded-2xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-black text-gray-900 dark:text-[#F0F6FC]">Messages</Text>
            <Text className="text-xs text-gray-400 dark:text-[#6E7681] font-medium">
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
              {totalUnread > 0 && ` · ${totalUnread} unread`}
            </Text>
          </View>
          <View className="w-11 h-11 bg-violet-100 dark:bg-[#1E1B4B] rounded-2xl items-center justify-center">
            <Ionicons name="chatbubbles" size={22} color="#6366F1" />
          </View>
        </Animated.View>

        {/* Search */}
        <Animated.View entering={FadeInDown.delay(80).duration(350)} className="mb-3">
          <View className="flex-row items-center bg-slate-50 dark:bg-[#0D1117] rounded-2xl px-4 py-3 border border-slate-100 dark:border-[#21262D]">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-sm text-gray-800 dark:text-[#E6EDF3] ml-3"
              placeholder="Search conversations…"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              style={{ padding: 0 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Filter tabs */}
        <Animated.View entering={FadeInDown.delay(130).duration(350)} className="flex-row gap-2">
          {(['all', 'unread', 'active'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl ${filter === f ? 'bg-violet-600' : 'bg-slate-100 dark:bg-[#21262D]'}`}
            >
              <Text className={`text-xs font-bold capitalize ${filter === f ? 'text-white' : 'text-gray-600 dark:text-[#8B949E]'}`}>
                {f}{f === 'unread' && totalUnread > 0 ? ` (${totalUnread})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-sm text-gray-400 dark:text-[#6E7681] mt-3 font-medium">Loading conversations…</Text>
        </View>
      ) : displayed.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-slate-100 dark:bg-[#21262D] rounded-full items-center justify-center mb-4">
            <Ionicons name={search ? 'search' : 'chatbubbles-outline'} size={40} color="#9CA3AF" />
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-[#F0F6FC] mb-1">
            {search ? 'No results' : 'No conversations yet'}
          </Text>
          <Text className="text-sm text-gray-400 dark:text-[#6E7681] text-center">
            {search ? 'Try a different search term' : 'Customer chats will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}
              tintColor="#6366F1"
            />
          }
        >
          {displayed.map((chat, idx) => {
            const name      = getUserName(chat);
            const lastMsg   = getLastMessage(chat);
            const lastTime  = getLastTime(chat);
            const unread    = getUnreadCount(chat);
            const label     = getChatLabel(chat);
            const av        = avatarColors(name);
            const ini       = initials(name);
            const lastIsUser = chat.messages[chat.messages.length - 1]?.sender === 'user';

            return (
              <Animated.View key={chat.id} entering={FadeInRight.delay(idx * 35).springify()}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin-chat-detail?chatId=${chat.id}` as any)}
                  className="bg-white dark:bg-[#161B22] rounded-3xl p-4 mb-3 flex-row items-center gap-3"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: unread > 0 ? 0.1 : 0.05,
                    shadowRadius: 12,
                    elevation: unread > 0 ? 4 : 2,
                    borderWidth: unread > 0 ? 1.5 : 1,
                    borderColor: unread > 0 ? '#C7D2FE' : 'rgba(33,38,45,0.5)',
                  }}
                >
                  {/* Avatar */}
                  <View className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: av.bg }}>
                    <Text className="text-base font-black" style={{ color: av.fg }}>{ini}</Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-0.5">
                      <Text className="text-base font-bold text-gray-900 dark:text-[#F0F6FC]">{name}</Text>
                      <Text className="text-xs text-gray-400 dark:text-[#6E7681]">{formatTime(lastTime)}</Text>
                    </View>
                    <Text className="text-[11px] text-violet-500 font-semibold mb-1">{label}</Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center gap-1">
                        {!lastIsUser && (
                          <Ionicons name="checkmark-done" size={13} color="#10B981" />
                        )}
                        <Text
                          className={`text-sm flex-1 ${unread > 0 ? 'font-bold text-gray-900 dark:text-[#F0F6FC]' : 'text-gray-500 dark:text-[#6E7681]'}`}
                          numberOfLines={1}
                        >
                          {lastMsg}
                        </Text>
                      </View>
                      {unread > 0 && (
                        <View className="w-6 h-6 bg-violet-600 rounded-full items-center justify-center ml-2">
                          <Text className="text-white text-[10px] font-black">
                            {unread > 9 ? '9+' : unread}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
