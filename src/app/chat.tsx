import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
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
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const { appUser } = useAuth();

  const [chat,    setChat]    = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [typing,  setTyping]  = useState(false);

  // ── Theme colors ───────────────────────────────────────────────────────────
  const T = {
    bg: dark ? '#0D1117' : '#F8FAFC',
    header: dark ? '#161B22' : '#FFFFFF',
    text: dark ? '#F0F6FC' : '#111827',
    subText: dark ? '#8B949E' : '#64748B',
    border: dark ? '#30363D' : '#E5E7EB',
    accent: '#0F766E',
  };

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

    try {
      await chatService.sendMessage(chat.id, 'user', appUser.name || 'User', message);
      setTyping(true);
      setTimeout(() => setTyping(false), 2500);
    } catch (e: any) {
      Alert.alert('Send failed', e?.message || 'Please try again');
    } finally {
      setSending(false);
    }
  };

  const hasMessages = (chat?.messages?.length ?? 0) > 0;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, paddingTop: insets.top }}>
        <View style={{ height: 60, backgroundColor: T.header, borderBottomWidth: 1, borderBottomColor: T.border }} />
        <ChatSkeleton />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* ── Top Bar ── */}
      <View
        style={{
          backgroundColor: T.header,
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: T.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 4,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: dark ? '#21262D' : '#F1F5F9',
            alignItems: 'center', justifyContent: 'center',
          }}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={T.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: T.accent,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="storefront" size={20} color="#fff" />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: T.text, letterSpacing: -0.5 }}>
                Health Concierge
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Active Support
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366' + '22', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => Alert.alert('Call Pharmacy', '+923191796621')}
        >
          <Ionicons name="call" size={20} color="#25D366" />
        </TouchableOpacity>
      </View>

      {/* ── Chat Thread ── */}
      {chat && (
        <ChatThread
          chat={chat}
          currentSender="user"
          onSendMessage={handleSend}
          isLoading={sending}
          isDark={dark}
          headerContent={
            !hasMessages && (
              <Animated.View entering={FadeInUp.delay(100).springify()} style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
                <View style={{ width: 80, height: 80, borderRadius: 28, backgroundColor: T.accent + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Ionicons name="chatbubbles" size={38} color={T.accent} />
                </View>
                <Text style={{ fontSize: 22, fontWeight: '900', color: T.text, marginBottom: 8 }}>Support Center</Text>
                <Text style={{ fontSize: 14, color: T.subText, textAlign: 'center', lineHeight: 22 }}>
                    How can we help you today? Our pharmacists are ready to assist with your medical needs.
                </Text>
              </Animated.View>
            )
          }
        />
      )}
    </View>
  );
}

