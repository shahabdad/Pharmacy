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
    Pressable,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { chatService, toDate } from '../services/chatService';
import { Chat } from '../types';

const ACCENT = '#4F46E5';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLastMessage(chat: Chat): string {
  if (!chat.messages?.length) return 'New conversation started';
  return chat.messages[chat.messages.length - 1].message;
}

function getLastTime(chat: Chat): Date {
  if (!chat.messages?.length) return toDate(chat.createdAt);
  return toDate(chat.messages[chat.messages.length - 1].timestamp);
}

function getUnreadCount(chat: Chat): number {
  if (!chat.messages?.length) return 0;
  return chat.messages.filter(m => m.sender === 'user' && m.status !== 'read').length;
}

function getChatType(chat: Chat) {
    if (chat.prescriptionId) return { label: 'Prescription', icon: 'document-text', color: '#DC2626', bg: '#FEF2F2' };
    if (chat.orderId) return { label: 'Order', icon: 'cart', color: '#059669', bg: '#ECFDF5' };
    return { label: 'General', icon: 'chatbubble', color: '#6366F1', bg: '#EEF2FF' };
}

function getUserName(chat: Chat): string {
  return chat.userName || 'Customer';
}

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
  const [activeTab,  setActiveTab]  = useState<'all' | 'unread' | 'rx' | 'orders'>('all');

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const unsub = chatService.listenToAllChats(updated => {
      // Sort by last message time
      const sorted = updated.sort((a, b) => getLastTime(b).getTime() - getLastTime(a).getTime());
      setChats(sorted);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsub();
  }, [isAdmin]);

  const filteredChats = useMemo(() => {
    let list = chats;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        getUserName(c).toLowerCase().includes(q) ||
        getLastMessage(c).toLowerCase().includes(q)
      );
    }

    // Tab filter
    switch (activeTab) {
        case 'unread': list = list.filter(c => getUnreadCount(c) > 0); break;
        case 'rx':     list = list.filter(c => !!c.prescriptionId); break;
        case 'orders': list = list.filter(c => !!c.orderId); break;
    }

    return list;
  }, [chats, search, activeTab]);

  const totalUnread = chats.reduce((s, c) => s + getUnreadCount(c), 0);

  if (!isAdmin) return null;

  return (
    <View className="flex-1 bg-white dark:bg-[#0D1117]" style={{ paddingTop: insets.top }}>
      
      {/* ── Custom Professional Header ── */}
      <View className="px-6 pt-2 pb-4">
        <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 bg-slate-50 dark:bg-[#161B22] rounded-xl items-center justify-center border border-slate-100 dark:border-zinc-800"
            >
                <Ionicons name="chevron-back" size={20} color="#64748B" />
            </TouchableOpacity>
            <Text className="text-lg font-black text-slate-900 dark:text-white">Admin Inbox</Text>
            <View className="w-10 h-10 items-center justify-center">
                {totalUnread > 0 && (
                    <View className="bg-indigo-500 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-black text-white">{totalUnread}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-50 dark:bg-[#161B22] rounded-2xl px-4 py-3 border border-slate-100 dark:border-zinc-800 mb-6">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 text-sm text-slate-900 dark:text-white ml-3 font-medium"
            placeholder="Search by customer or message..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Professional Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[
                { id: 'all', label: 'All Messages', icon: 'mail' },
                { id: 'unread', label: 'Unread', icon: 'alert-circle' },
                { id: 'rx', label: 'Prescriptions', icon: 'document-text' },
                { id: 'orders', label: 'Orders', icon: 'cart' },
            ].map(tab => (
                <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as any)}
                    className={`flex-row items-center px-4 py-2.5 rounded-2xl mr-2 ${activeTab === tab.id ? 'bg-slate-900 dark:bg-white' : 'bg-slate-50 dark:bg-[#161B22] border border-slate-100 dark:border-zinc-800'}`}
                >
                    <Ionicons 
                        name={(tab.id === activeTab ? tab.icon : `${tab.icon}-outline`) as any} 
                        size={16} 
                        color={activeTab === tab.id ? (activeTab === 'all' ? '#FFF' : (activeTab === 'rx' ? '#FFF' : '#FFF')) : '#64748B'} 
                    />
                    <Text className={`ml-2 text-xs font-black ${activeTab === tab.id ? 'text-white dark:text-slate-900' : 'text-slate-500'}`}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* ── Chat List ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : filteredChats.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 bg-slate-50 dark:bg-[#161B22] rounded-full items-center justify-center mb-4">
            <Ionicons name="chatbubbles-outline" size={32} color="#94A3B8" />
          </View>
          <Text className="text-base font-bold text-slate-900 dark:text-white">No messages found</Text>
          <Text className="text-sm text-slate-400 text-center mt-1">Try adjusting your filters or search terms</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={ACCENT} />
          }
        >
          {filteredChats.map((chat, idx) => {
            const name = getUserName(chat);
            const lastMsg = getLastMessage(chat);
            const lastTime = getLastTime(chat);
            const unread = getUnreadCount(chat);
            const type = getChatType(chat);
            const lastIsUser = chat.messages[chat.messages.length - 1]?.sender === 'user';

            return (
              <Animated.View 
                key={chat.id} 
                entering={FadeInUp.delay(idx * 50).duration(400)}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  onPress={() => router.push(`/admin-chat-detail?chatId=${chat.id}` as any)}
                  activeOpacity={0.7}
                  className={`flex-row items-start py-5 border-b border-slate-50 dark:border-zinc-800/50 ${unread > 0 ? 'bg-indigo-50/20 dark:bg-indigo-500/5 -mx-5 px-5' : ''}`}
                >
                  {/* Modern Avatar with Type Icon Overlay */}
                  <View className="relative">
                    <View className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#161B22] items-center justify-center">
                        <Text className="text-lg font-black text-slate-400 dark:text-slate-500">{name[0].toUpperCase()}</Text>
                    </View>
                    <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center border-2 border-white dark:border-[#0D1117]" style={{ backgroundColor: type.color }}>
                        <Ionicons name={type.icon as any} size={10} color="white" />
                    </View>
                  </View>

                  {/* Chat Info */}
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className={`text-base ${unread > 0 ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-400">{formatTime(lastTime)}</Text>
                    </View>
                    
                    <View className="flex-row items-center mb-1.5">
                        <View className="px-2 py-0.5 rounded-md mr-2" style={{ backgroundColor: `${type.color}15` }}>
                            <Text className="text-[9px] font-black uppercase tracking-tighter" style={{ color: type.color }}>{type.label}</Text>
                        </View>
                        {chat.prescriptionId && (
                            <Text className="text-[10px] font-bold text-slate-400">ID: {chat.prescriptionId.slice(0, 8)}</Text>
                        )}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center gap-1.5">
                        {!lastIsUser && (
                          <Ionicons name="checkmark-done" size={14} color={ACCENT} />
                        )}
                        <Text
                          className={`text-sm flex-1 ${unread > 0 ? 'font-black text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}
                          numberOfLines={1}
                        >
                          {lastMsg}
                        </Text>
                      </View>
                      {unread > 0 && (
                        <Animated.View entering={ZoomIn} className="w-5 h-5 bg-indigo-500 rounded-full items-center justify-center ml-2">
                          <Text className="text-white text-[9px] font-black">{unread}</Text>
                        </Animated.View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
