import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatThread, TypingDots } from '../../components/ChatThread';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ChatSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { Chat, ChatMessage } from '../../types';

// ─── Quick reply chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  { icon: 'receipt-outline',    label: 'Order status'       },
  { icon: 'document-text',      label: 'Prescription help'  },
  { icon: 'bicycle-outline',    label: 'Delivery time'      },
  { icon: 'person-circle',      label: 'Talk to pharmacist' },
  { icon: 'medkit-outline',     label: 'Medicine info'      },
];

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function useTheme(dark: boolean) {
  return {
    // Backgrounds
    screenBg:    dark ? '#0D1117' : '#F8FAFC',
    headerBg:    dark ? '#0C2A44' : '#004B87',
    chatBg:      dark ? '#0D1117' : '#F8FAFC',

    // Header text / icons
    headerText:  '#FFFFFF',
    headerSub:   dark ? '#0EA5E9' : '#BAE6FD',
    headerIcon:  dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',

    // Welcome card
    cardBg:      dark ? '#161B22' : '#FFFFFF',
    cardBorder:  dark ? '#21262D' : '#F1F5F9',
    titleText:   dark ? '#F0F6FC' : '#0F172A',
    subText:     dark ? '#8B949E' : '#64748B',
    labelText:   dark ? '#6E7681' : '#94A3B8',

    // Quick reply chips
    chipBg:      dark ? '#161B22' : '#FFFFFF',
    chipBorder:  dark ? '#0EA5E930' : '#E0F2FE',
    chipText:    dark ? '#0EA5E9' : '#0369A1',
    chipIcon:    dark ? '#0EA5E9' : '#0369A1',

    // Accent
    accent:      dark ? '#0EA5E9' : '#005CAB',
    accentGlow:  dark ? '#0EA5E9' : '#0070CE',

    // Status
    online:      '#10B981',
    error:       '#EF4444',
    errorBg:     dark ? '#450A0A' : '#FEF2F2',
  };
}

export default function ChatScreen() {
  const insets    = useSafeAreaInsets();
  const router    = useRouter();
  const scheme    = useColorScheme();
  const dark      = scheme === 'dark';
  const T         = useTheme(dark);
  const { appUser } = useAuth();

  const [chat,    setChat]    = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [typing,  setTyping]  = useState(false);
  const [headerH, setHeaderH] = useState(60);

  // ── Init ──────────────────────────────────────────────────────────────────
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

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async (message: string, replyTo?: ChatMessage) => {
    if (!message.trim() || !chat || !appUser || sending) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      sender: 'user',
      senderName: appUser.name || 'You',
      message,
      timestamp: new Date(),
      ...(replyTo ? { replyTo } : {}),
    } as any;
    setChat(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);
    try {
      await chatService.sendMessage(chat.id, 'user', appUser.name || 'User', message);
      setTyping(true);
      setTimeout(() => setTyping(false), 2800);
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.screenBg }}>
        <View style={{ height: 100, backgroundColor: T.headerBg }} />
        <ChatSkeleton />
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: T.screenBg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: insets.top }}>
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: T.errorBg,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Ionicons name="wifi-outline" size={34} color={T.error} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800', color: dark ? '#F0FDF4' : '#134E4A', marginBottom: 8, textAlign: 'center' }}>
            Connection Error
          </Text>
          <Text style={{ fontSize: 13, color: T.subText, textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => { setError(null); setLoading(true); }}
            style={{
              backgroundColor: T.accent,
              paddingHorizontal: 32, paddingVertical: 13,
              borderRadius: 16,
              shadowColor: T.accent, shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── Welcome card ──────────────────────────────────────────────────────────
  const welcomeContent = !hasMessages ? (
    <Animated.View entering={FadeInUp.delay(100).springify()} style={{ paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4 }}>
      {/* Hero card */}
      <View style={{
        backgroundColor: T.cardBg,
        borderRadius: 24, padding: 24,
        borderWidth: 1, borderColor: T.cardBorder,
        alignItems: 'center', marginBottom: 20,
        shadowColor: T.accent, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: dark ? 0.25 : 0.12, shadowRadius: 20, elevation: 6,
      }}>
        {/* Glow ring avatar */}
        <View style={{
          width: 72, height: 72, borderRadius: 24,
          backgroundColor: dark ? '#0C2A44' : '#F0F9FF',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
          borderWidth: 2, borderColor: dark ? '#0EA5E930' : '#E0F2FE',
          shadowColor: '#005CAB', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
        }}>
          <Ionicons name="chatbubbles" size={32} color={T.accent} />
        </View>

        <Text style={{ fontSize: 20, fontWeight: '900', color: T.titleText, marginBottom: 6, textAlign: 'center', letterSpacing: -0.3 }}>
          Hey {appUser?.name?.split(' ')[0] || 'there'} 👋
        </Text>
        <Text style={{ fontSize: 13, color: T.subText, textAlign: 'center', lineHeight: 20, maxWidth: 260 }}>
          Ask us anything about your prescriptions, orders, or medicines.
        </Text>

        {/* Divider */}
        <View style={{ width: '100%', height: 1, backgroundColor: T.cardBorder, marginVertical: 18 }} />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {[
            { icon: 'flash',        label: 'Fast replies'  },
            { icon: 'shield-checkmark', label: 'Secure chat' },
            { icon: 'time',         label: '24/7 support'  },
          ].map(s => (
            <View key={s.label} style={{ alignItems: 'center', gap: 4 }}>
              <View style={{
                width: 34, height: 34, borderRadius: 10,
                backgroundColor: T.accent + '18',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name={s.icon as any} size={16} color={T.accent} />
              </View>
              <Text style={{ fontSize: 9, fontWeight: '700', color: T.labelText, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick replies */}
      <Text style={{ fontSize: 10, fontWeight: '800', color: T.labelText, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginLeft: 2 }}>
        Quick messages
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        keyboardShouldPersistTaps="handled"
      >
        {QUICK_REPLIES.map(qr => (
          <TouchableOpacity
            key={qr.label}
            onPress={() => handleSend(qr.label)}
            style={{
              backgroundColor: T.chipBg,
              borderWidth: 1.5, borderColor: T.chipBorder,
              borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10,
              flexDirection: 'row', alignItems: 'center', gap: 7,
              shadowColor: T.accent, shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
            }}
          >
            <Ionicons name={qr.icon as any} size={14} color={T.chipIcon} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: T.chipText }}>{qr.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  ) : null;

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: T.screenBg }}>

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}
        style={{
          backgroundColor: T.headerBg,
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 16,
          shadowColor: T.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: dark ? 0.5 : 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 13,
              backgroundColor: T.headerIcon,
              alignItems: 'center', justifyContent: 'center',
            }}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Center info */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Avatar with ring */}
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: dark ? '#0D9488' : 'rgba(255,255,255,0.25)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
              }}>
                <Ionicons name="storefront" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 }}>
                  Health Concierge
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{
                    width: 7, height: 7, borderRadius: 4,
                    backgroundColor: T.online,
                    shadowColor: T.online, shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1, shadowRadius: 4,
                  }} />
                  <Text style={{ fontSize: 11, color: T.headerSub, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Available · Pharmacist
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Call button */}
          <TouchableOpacity
            onPress={() => Alert.alert('Call Pharmacy', '+923191796621')}
            style={{
              width: 40, height: 40, borderRadius: 13,
              backgroundColor: T.headerIcon,
              alignItems: 'center', justifyContent: 'center',
            }}
            hitSlop={8}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Chat thread ── */}
      {chat && (
        <ChatThread
          chat={chat}
          currentSender="user"
          onSendMessage={handleSend}
          isLoading={sending}
          isDark={dark}
          bottomOffset={Platform.OS === 'ios' ? 90 : 70}
          headerContent={
            <>
              {welcomeContent}
              {typing && <TypingDots isDark={dark} />}
            </>
          }
        />
      )}
    </View>
  );
}

