import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatService, toDate } from '../services/chatService';
import { Chat, ChatMessage } from '../types';

// ─── Theme factory ────────────────────────────────────────────────────────────
function makeTheme(dark: boolean) {
  return {
    bg: dark ? '#0D1117' : '#F8FAFC',
    // Left (Customer/Admin)
    recvBg: dark ? '#161B22' : '#FFFFFF',
    recvText: dark ? '#F0F6FC' : '#1F2937',
    recvTime: dark ? '#8B949E' : '#94A3B8',
    // Right (Self)
    sentBg: '#0F766E', // MediCare Teal
    sentText: '#FFFFFF',
    sentTime: '#CCFBF1',
    sentTick: '#34D399',
    // Date pill
    pillBg: dark ? '#21262D' : '#E2E8F0',
    pillText: dark ? '#8B949E' : '#475569',
    // Input bar
    barBg: dark ? '#161B22' : '#FFFFFF',
    barBorder: dark ? '#30363D' : '#E5E7EB',
    inputBg: dark ? '#0D1117' : '#F1F5F9',
    inputText: dark ? '#F0F6FC' : '#111827',
    placeholder: '#94A3B8',
    // Icons
    accent: '#0F766E',
    // Buttons
    sendActive: '#0F766E',
    sendInactive: dark ? '#21262D' : '#E2E8F0',
  };
}

interface ChatThreadProps {
  chat: Chat;
  currentSender: 'user' | 'admin';
  onSendMessage: (message: string, replyTo?: ChatMessage) => void;
  isLoading?: boolean;
  isDark?: boolean;
  prefillText?: string;
  onPrefillConsumed?: () => void;
  headerContent?: React.ReactNode;
  bottomOffset?: number;
}

function fmtTime(raw: any): string {
  try {
    const d = toDate(raw);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function dayKey(raw: any): string {
  try { return toDate(raw).toDateString(); } catch { return new Date().toDateString(); }
}

function dayLabel(key: string): string {
  const today = new Date().toDateString();
  const yest = new Date(Date.now() - 86400000).toDateString();
  if (key === today) return 'Today';
  if (key === yest) return 'Yesterday';
  return key;
}

export function TypingDots({ isDark = false }: { isDark?: boolean }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={{ alignSelf: 'flex-start', marginBottom: 10, marginLeft: 16 }}>
      <View style={{ backgroundColor: isDark ? '#161B22' : '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#4F46E5', opacity: 0.4 + i * 0.2 }} />
        ))}
      </View>
    </Animated.View>
  );
}

function Bubble({ msg, currentSender, isDark }: { msg: ChatMessage; currentSender: string; isDark: boolean }) {
  const T = makeTheme(isDark);
  const isMine = msg.sender === currentSender;

  return (
    <Animated.View
      entering={(isMine ? FadeInRight : FadeInLeft).duration(400).springify()}
      style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        marginBottom: 12,
      }}
    >
      <View style={{
        backgroundColor: isMine ? T.sentBg : T.recvBg,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 6,
        borderRadius: 20,
        borderBottomRightRadius: isMine ? 4 : 20,
        borderBottomLeftRadius: isMine ? 20 : 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: isMine ? 0 : 1,
        borderColor: T.barBorder,
      }}>
        <Text style={{ 
            fontSize: 15, 
            lineHeight: 22, 
            color: isMine ? T.sentText : T.recvText,
            marginBottom: 4
        }}>
            {msg.message}
        </Text>
        
        <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            gap: 4 
        }}>
            <Text style={{ 
                fontSize: 10, 
                fontWeight: '700', 
                color: isMine ? T.sentTime : T.recvTime 
            }}>
                {fmtTime(msg.timestamp)}
            </Text>
            {isMine && (
                <Ionicons 
                    name={msg.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                    size={14} 
                    color={msg.status === 'read' ? T.sentTick : T.sentTime} 
                />
            )}
        </View>
      </View>
    </Animated.View>
  );
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  chat, currentSender, onSendMessage, isLoading, isDark = false, prefillText, onPrefillConsumed, headerContent, bottomOffset = 0
}) => {
  const T = makeTheme(isDark);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (prefillText) {
        setText(prefillText);
        onPrefillConsumed?.();
    }
  }, [prefillText]);

  const groups = useMemo(() => {
    const map: Record<string, ChatMessage[]> = {};
    const order: string[] = [];
    (chat.messages ?? []).forEach(msg => {
      const k = dayKey(msg.timestamp);
      if (!map[k]) { map[k] = []; order.push(k); }
      map[k].push(msg);
    });
    return order.map(k => ({ key: k, label: dayLabel(k), messages: map[k] }));
  }, [chat.messages]);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1, backgroundColor: T.bg }}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {headerContent}
        {groups.map(g => (
          <View key={g.key}>
            <View style={{ alignItems: 'center', marginVertical: 24 }}>
              <View style={{ backgroundColor: T.pillBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: T.pillText, textTransform: 'uppercase', letterSpacing: 1 }}>{g.label}</Text>
              </View>
            </View>
            {g.messages.map((m, i) => <Bubble key={i} msg={m} currentSender={currentSender} isDark={isDark} />)}
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={{ 
          paddingHorizontal: 16, 
          paddingTop: 12, 
          paddingBottom: Math.max(insets.bottom, 12) + bottomOffset,
          borderTopWidth: 1,
          borderTopColor: T.barBorder,
          backgroundColor: T.barBg,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 10,
      }}>
        <View style={{ 
            flex: 1, 
            backgroundColor: T.inputBg, 
            borderRadius: 24, 
            paddingHorizontal: 18, 
            paddingVertical: 12,
            maxHeight: 120,
            borderWidth: 1,
            borderColor: T.barBorder,
            flexDirection: 'row',
            alignItems: 'flex-end'
        }}>
            <TextInput
                placeholder="Type your message..."
                placeholderTextColor={T.placeholder}
                value={text}
                onChangeText={setText}
                multiline
                style={{ flex: 1, fontSize: 15, color: T.inputText, padding: 0, paddingTop: 0, textAlignVertical: 'bottom' }}
            />
            <TouchableOpacity style={{ marginBottom: 2 }}>
                <Ionicons name="happy-outline" size={22} color={T.placeholder} />
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
            onPress={handleSend}
            disabled={!text.trim() || isLoading}
            style={{ 
                width: 52, 
                height: 52, 
                borderRadius: 26, 
                backgroundColor: text.trim() ? T.sendActive : T.sendInactive,
                alignItems: 'center', 
                justifyContent: 'center',
                shadowColor: T.sendActive,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: text.trim() ? 0.3 : 0,
                shadowRadius: 10,
                elevation: text.trim() ? 6 : 0,
            }}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
            ) : (
                <Ionicons name="send" size={22} color="#FFF" style={{ marginLeft: 3 }} />
            )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

