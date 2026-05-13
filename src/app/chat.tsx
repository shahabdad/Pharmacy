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
import { LoadingScreen } from '../components/LoadingScreen';
import { ChatSkeleton } from '../components/Skeleton';
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
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#F1F5F9',
        }}
      >
        {[0, 1, 2].map(i => (
          <View
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
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
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: insets.top }}>
        <View style={{ height: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }} />
        <ChatSkeleton />
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
          className="bg-blue-700 px-8 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold text-sm">Retry Connection</Text>
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
                className="w-10 h-10 rounded-2xl bg-blue-800 items-center justify-center"
                style={{
                  shadowColor: '#004B87',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="storefront" size={18} color="#fff" />
              </View>
              <View>
                <Text className="text-[15px] font-black text-slate-900 leading-tight">
                  Health Concierge
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <Text className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest">Online Now</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Call */}
          <TouchableOpacity
            className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center"
            onPress={() => Alert.alert('Call Pharmacy', '+923191796621')}
            hitSlop={8}
          >
            <Ionicons name="call" size={18} color="#005CAB" />
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
            className="w-20 h-20 rounded-[32px] bg-blue-800 items-center justify-center mb-6"
            style={{
              shadowColor: '#004B87',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Ionicons name="chatbubbles" size={38} color="#fff" />
          </View>
          <Text className="text-2xl font-black text-slate-900 mb-2">
            Hi {appUser?.name?.split(' ')[0] || 'there'} 👋
          </Text>
          <Text className="text-[15px] text-slate-500 text-center leading-6 mb-8 px-4">
            Our medical specialists are here to help you with your prescriptions and orders.
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
                  className="bg-white border-2 border-slate-100 rounded-2xl px-5 py-3"
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2,
                  }}
                >
                  <Ionicons name={qr.icon as any} size={15} color="#005CAB" />
                  <Text className="text-sm font-bold text-slate-700">{qr.label}</Text>
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
