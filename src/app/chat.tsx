import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatThread } from '../components/ChatThread';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { Chat, ChatMessage } from '../types';

const QUICK_REPLIES = [
  { icon: 'medical',          label: 'Order status?'      },
  { icon: 'document-text',    label: 'Prescription help'  },
  { icon: 'bicycle',          label: 'Delivery time?'     },
  { icon: 'chatbubble',       label: 'Talk to pharmacist' },
];

function TypingDots() {
  return (
    <Animated.View entering={FadeIn.duration(250)} className="self-start mb-3 ml-4">
      <View
        className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 flex-row items-center gap-1.5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: 1,
          borderColor: '#F1F5F9',
        }}
      >
        {[0, 1, 2].map(i => (
          <View
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400"
            style={{ opacity: 0.35 + i * 0.3 }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appUser } = useAuth();

  const [chat,    setChat]    = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [typing,  setTyping]  = useState(false);

  useEffect(() => {
    if (!appUser) return;
    let unsub: (() => void) | null = null;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const c = await chatService.getOrCreateUserChat(appUser.uid, appUser.name || 'User');
        unsub = chatService.listenToChat(c.id, updated => setChat(updated));
      } catch (e: any) {
        setError(e?.message || 'Could not connect to chat');
      } finally {
        setLoading(false);
      }
    })();

    return () => { unsub?.(); };
  }, [appUser?.uid]);

  const handleSend = async (message: string) => {
    if (!message.trim() || !chat || !appUser || sending) return;
    setSending(true);

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      sender: 'user',
      senderName: appUser.name || 'You',
      message,
      timestamp: new Date(),
    };
    setChat(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);

    try {
      await chatService.sendMessage(chat.id, 'user', appUser.name || 'User', message);
      setTyping(true);
      setTimeout(() => setTyping(false), 2500);
    } catch (e: any) {
      Alert.alert('Send failed', e?.message || 'Please try again');
      setChat(prev =>
        prev ? { ...prev, messages: prev.messages.filter(m => m.id !== optimistic.id) } : prev
      );
    } finally {
      setSending(false);
    }
  };

  const hasMessages = (chat?.messages?.length ?? 0) > 0;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center" style={{ paddingTop: insets.top }}>
        <View className="w-16 h-16 bg-violet-100 rounded-3xl items-center justify-center mb-4">
          <Ionicons name="chatbubbles" size={32} color="#6366F1" />
        </View>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-sm text-gray-400 mt-3 font-medium">Connecting…</Text>
      </View>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <View className="w-16 h-16 bg-red-100 rounded-3xl items-center justify-center mb-4">
          <Ionicons name="wifi-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-base font-bold text-gray-900 mb-2 text-center">Connection Error</Text>
        <Text className="text-sm text-gray-400 text-center mb-6">{error}</Text>
        <TouchableOpacity
          onPress={() => { setError(null); setLoading(true); }}
          className="bg-violet-600 px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>

      {/* ── Top bar: back arrow left, pharmacy name center, call right ── */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        className="bg-white px-4 pb-3"
        style={{
          paddingTop: insets.top > 0 ? 8 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center">
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center"
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>

          {/* Center: avatar + name + status */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-xl bg-violet-600 items-center justify-center"
                style={{
                  shadowColor: '#6366F1',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons name="storefront" size={16} color="#fff" />
              </View>
              <View>
                <Text className="text-sm font-black text-gray-900 leading-tight">
                  MadicCare Pharmacy
                </Text>
                <View className="flex-row items-center gap-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <Text className="text-[10px] text-emerald-500 font-semibold">Online</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Call */}
          <TouchableOpacity
            className="w-10 h-10 rounded-2xl bg-violet-50 items-center justify-center"
            onPress={() => Alert.alert('Call Pharmacy', '+923191796621')}
            hitSlop={8}
          >
            <Ionicons name="call" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Welcome + quick replies (empty state) ── */}
      {!hasMessages && (
        <Animated.View
          entering={FadeInUp.delay(150).springify()}
          className="items-center pt-8 pb-4 px-6"
        >
          <View
            className="w-20 h-20 rounded-3xl bg-violet-600 items-center justify-center mb-5"
            style={{
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Ionicons name="chatbubbles" size={38} color="#fff" />
          </View>
          <Text className="text-xl font-black text-gray-900 mb-2">
            Hi {appUser?.name?.split(' ')[0] || 'there'}
          </Text>
          <Text className="text-sm text-gray-400 text-center leading-5 mb-6">
            Ask us anything about your prescriptions, orders, or medicines.
          </Text>

          <View className="w-full">
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Quick messages
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {QUICK_REPLIES.map(qr => (
                <TouchableOpacity
                  key={qr.label}
                  onPress={() => handleSend(qr.label)}
                  className="bg-white border border-violet-200 rounded-2xl px-4 py-2.5"
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <Ionicons name={qr.icon as any} size={13} color="#6366F1" />
                  <Text className="text-xs font-semibold text-violet-700">{qr.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {typing && <TypingDots />}

      {chat && (
        <ChatThread
          chat={chat}
          currentSender="user"
          onSendMessage={handleSend}
          isLoading={sending}
        />
      )}
    </View>
  );
}
