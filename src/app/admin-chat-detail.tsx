import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView,
    Text, TouchableOpacity, View,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatThread } from '../components/ChatThread';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { Chat } from '../types';
import { ModernAlert, ModernToast, AlertType } from '../components/ModernAlert';

// ─── Smart Quick Replies ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: 'Check Stock', text: 'Let me check our current stock for you right away.', icon: 'cube' },
    { label: 'Review Rx', text: 'I am reviewing your prescription now. One moment please.', icon: 'document-text' },
    { label: 'Price Quote', text: 'The total for these medicines will be Rs. ', icon: 'cash' },
    { label: 'Delivery Time', text: 'Our rider can deliver this to you in approximately 30-45 minutes.', icon: 'time' },
];

export default function AdminChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { isAdmin, appUser } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [prefillText, setPrefillText] = useState<string | undefined>();

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

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
      return;
    }

    if (!chatId) return;

    // Load initial data
    chatService.getChat(chatId).then(data => {
        if (data) setChat(data);
        setLoading(false);
    });

    // Real-time listener
    const unsub = chatService.listenToChat(chatId, (updated) => {
      setChat(updated);
      // Auto mark as read
      const unread = updated.messages?.some(m => m.sender === 'user' && m.status !== 'read');
      if (unread) {
        chatService.markMessagesAsRead(chatId, 'admin').catch(console.error);
      }
    });

    return () => unsub();
  }, [chatId, isAdmin]);

  const handleSendMessage = async (message: string) => {
    if (!chat || !appUser) return;
    try {
      setSending(true);
      await chatService.sendMessage(chat.id, 'admin', appUser.name || 'Pharmacist', message);
    } catch (e: any) {
      showAlert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  const userName = chat?.userName || 'Customer';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const isOnline = useMemo(() => {
    if (!chat?.updatedAt) return false;
    const lastActive = chat.updatedAt instanceof Date ? chat.updatedAt : (chat.updatedAt as any).toDate ? (chat.updatedAt as any).toDate() : new Date(chat.updatedAt);
    const diff = Date.now() - lastActive.getTime();
    return diff < 120000; // Active within last 2 minutes
  }, [chat?.updatedAt]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  }

  if (!chat) return null;

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white dark:bg-[#0D1117]"
        style={{ paddingTop: insets.top }}
    >
      {/* ── Professional Header ── */}
      <View className="px-5 py-4 border-b border-slate-50 dark:border-zinc-800 flex-row items-center gap-3 bg-white dark:bg-[#0D1117]">
        <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-slate-50 dark:bg-[#161B22] rounded-xl items-center justify-center"
        >
            <Ionicons name="chevron-back" size={20} color="#64748B" />
        </TouchableOpacity>

        {/* User Status */}
        <View className="flex-1 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center">
                <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400">{initials}</Text>
            </View>
            <View>
                <Text className="text-base font-black text-slate-900 dark:text-white">{userName}</Text>
                <View className="flex-row items-center gap-1">
                    <View className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {isOnline ? 'Active Now' : 'Last seen recently'}
                    </Text>
                </View>
            </View>
        </View>

        {/* Context Actions */}
        <View className="flex-row gap-2">
            {chat.prescriptionId && (
                <TouchableOpacity 
                    onPress={() => router.push('/admin-prescriptions')}
                    className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl items-center justify-center border border-rose-100 dark:border-rose-900/30"
                >
                    <Ionicons name="document-text" size={18} color="#DC2626" />
                </TouchableOpacity>
            )}
            <TouchableOpacity 
                onPress={() => setShowMenu(!showMenu)}
                className="w-10 h-10 bg-slate-50 dark:bg-[#161B22] rounded-xl items-center justify-center"
            >
                <Ionicons name="ellipsis-horizontal" size={18} color="#64748B" />
            </TouchableOpacity>
        </View>
      </View>

      {/* ── Pharmacist Quick Toolbar ── */}
      <View className="bg-slate-50 dark:bg-[#161B22]/50 border-b border-slate-100 dark:border-zinc-800 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {QUICK_ACTIONS.map((action, idx) => (
                <Animated.View key={idx} entering={FadeInRight.delay(idx * 50).duration(400)}>
                    <TouchableOpacity
                        onPress={() => setPrefillText(action.text)}
                        className="flex-row items-center bg-white dark:bg-[#0D1117] px-3 py-2 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm"
                    >
                        <Ionicons name={action.icon as any} size={14} color="#6366F1" />
                        <Text className="ml-2 text-[11px] font-black text-slate-600 dark:text-slate-300">{action.label}</Text>
                    </TouchableOpacity>
                </Animated.View>
            ))}
        </ScrollView>
      </View>

      {/* ── Chat Thread ── */}
      <View className="flex-1">
          <ChatThread
            chat={chat}
            currentSender="admin"
            onSendMessage={handleSendMessage}
            isLoading={sending}
            prefillText={prefillText}
            onPrefillConsumed={() => setPrefillText(undefined)}
          />
      </View>

      {/* ── Context Menu Overlay ── */}
      {showMenu && (
          <View className="absolute inset-0 z-50">
              <Pressable className="flex-1" onPress={() => setShowMenu(false)} />
              <Animated.View 
                entering={FadeInDown.duration(200)}
                className="absolute top-20 right-5 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                  <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50 dark:border-slate-800">
                      <Ionicons name="person-outline" size={18} color="#64748B" />
                      <Text className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-200">Customer Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50 dark:border-slate-800">
                      <Ionicons name="notifications-off-outline" size={18} color="#64748B" />
                      <Text className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-200">Mute Alerts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                        setShowMenu(false);
                        Alert.alert('Clear Chat', 'Permanently delete this thread?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => chatService.clearChat(chat.id) }
                        ]);
                    }}
                    className="flex-row items-center p-4"
                  >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      <Text className="ml-3 text-sm font-bold text-red-600">Delete Conversation</Text>
                  </TouchableOpacity>
              </Animated.View>
          </View>
      )}

      <ModernAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />

      <ModernToast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}
