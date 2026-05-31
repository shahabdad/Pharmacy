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
    bg: dark ? '#0D1117' : '#FFFFFF',
    // Left (Customer)
    recvBg: dark ? '#161B22' : '#F8FAFC',
    recvText: dark ? '#F0F6FC' : '#1F2937',
    recvTime: dark ? '#8B949E' : '#94A3B8',
    // Right (Admin/Self)
    sentBg: dark ? '#312E81' : '#4F46E5',
    sentText: '#FFFFFF',
    sentTime: dark ? '#A5B4FC' : '#C7D2FE',
    sentTick: '#10B981',
    // Date pill
    pillBg: dark ? '#21262D' : '#F1F5F9',
    pillText: dark ? '#8B949E' : '#64748B',
    // Input bar
    barBg: dark ? '#0D1117' : '#FFFFFF',
    barBorder: dark ? '#21262D' : '#F1F5F9',
    inputBg: dark ? '#161B22' : '#F8FAFC',
    inputText: dark ? '#F0F6FC' : '#1F2937',
    placeholder: '#94A3B8',
    // Icons
    accent: '#4F46E5',
    overlay: 'rgba(0,0,0,0.6)',
    menuBg: dark ? '#161B22' : '#FFFFFF',
    menuText: dark ? '#F0F6FC' : '#1F2937',
    menuBorder: dark ? '#30363D' : '#E2E8F0',
    // Buttons
    sendActive: '#4F46E5',
    sendInactive: dark ? '#21262D' : '#F1F5F9',
    sendIconOff: '#94A3B8',
  };
}

interface ChatThreadProps {
  chat: Chat;
  currentSender: 'user' | 'admin';
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isDark?: boolean;
  prefillText?: string;
  onPrefillConsumed?: () => void;
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
      entering={(isMine ? FadeInRight : FadeInLeft).springify()}
      style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: 6,
      }}
    >
      <View style={{
        backgroundColor: isMine ? T.sentBg : T.recvBg,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 4,
        borderRadius: 18,
        borderBottomRightRadius: isMine ? 4 : 18,
        borderBottomLeftRadius: isMine ? 18 : 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Text style={{ 
                fontSize: 15, 
                lineHeight: 20, 
                color: isMine ? T.sentText : T.recvText,
                paddingRight: 60, // Space for time and status
                marginBottom: 4
            }}>
                {msg.message}
            </Text>
            
            <View style={{ 
                position: 'absolute', 
                right: 0, 
                bottom: 4, 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 3 
            }}>
                <Text style={{ 
                    fontSize: 10, 
                    fontWeight: '600', 
                    color: isMine ? T.sentTime : T.recvTime 
                }}>
                    {fmtTime(msg.timestamp)}
                </Text>
                {isMine && (
                    <Ionicons 
                        name={msg.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                        size={14} 
                        color={msg.status === 'read' ? '#10B981' : T.sentTime} 
                    />
                )}
            </View>
        </View>
      </View>
    </Animated.View>
  );
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  chat, currentSender, onSendMessage, isLoading, isDark = false, prefillText, onPrefillConsumed
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
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {groups.map(g => (
          <View key={g.key}>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <View style={{ backgroundColor: T.pillBg, px: 12, py: 4, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: T.pillText, textTransform: 'uppercase' }}>{g.label}</Text>
              </View>
            </View>
            {g.messages.map((m, i) => <Bubble key={i} msg={m} currentSender={currentSender} isDark={isDark} />)}
          </View>
        ))}
      </ScrollView>

      <View style={{ 
          paddingHorizontal: 16, 
          paddingTop: 12, 
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderTopColor: T.barBorder,
          backgroundColor: T.barBg,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 12
      }}>
        <View style={{ 
            flex: 1, 
            backgroundColor: T.inputBg, 
            borderRadius: 24, 
            paddingHorizontal: 16, 
            paddingVertical: 10,
            maxHeight: 120,
            borderWidth: 1,
            borderColor: T.barBorder
        }}>
            <TextInput
                placeholder="Type a response..."
                placeholderTextColor={T.placeholder}
                value={text}
                onChangeText={setText}
                multiline
                style={{ fontSize: 15, color: T.inputText, padding: 0 }}
            />
        </View>
        <TouchableOpacity 
            onPress={handleSend}
            disabled={!text.trim() || isLoading}
            style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 24, 
                backgroundColor: text.trim() ? T.sendActive : T.sendInactive,
                items: 'center', justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={20} color="#FFF" style={{ marginLeft: 3 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};
