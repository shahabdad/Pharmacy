/**
 * ChatThread — Premium teal/emerald palette, full dark-mode support
 *
 * Light palette:
 *   Background  : #F0FDF9  (mint tint)
 *   Sent bubble : #0D9488  (teal-600)
 *   Recv bubble : #FFFFFF
 *   Admin bubble: #0F766E  (teal-700)
 *   Date pill   : #CCFBF1
 *
 * Dark palette:
 *   Background  : #0D1117  (GitHub dark)
 *   Sent bubble : #0D9488
 *   Recv bubble : #161B22
 *   Admin bubble: #134E4A
 *   Date pill   : #0D2B27
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { toDate } from '../services/chatService';
import { Chat, ChatMessage } from '../types';

// ─── Theme factory ────────────────────────────────────────────────────────────
function makeTheme(dark: boolean) {
  return {
    // Layout
    bg:           dark ? '#0D1117' : '#F8FAFC',
    // Sent (user)
    sentBg:       '#004B87',
    sentText:     '#FFFFFF',
    sentTime:     '#BAE6FD',
    sentTick:     '#0EA5E9',
    // Received (other user)
    recvBg:       dark ? '#161B22' : '#FFFFFF',
    recvText:     dark ? '#F0F6FC' : '#0F172A',
    recvTime:     dark ? '#8B949E' : '#64748B',
    recvBorder:   dark ? '#21262D' : '#F1F5F9',
    // Admin
    adminBg:      dark ? '#0C2A44' : '#0369A1',
    adminText:    '#FFFFFF',
    adminTime:    '#BAE6FD',
    // Date pill
    pillBg:       dark ? '#0C2A44' : '#E0F2FE',
    pillText:     dark ? '#0EA5E9' : '#0369A1',
    // Input bar
    barBg:        dark ? '#0D1117' : '#FFFFFF',
    barBorder:    dark ? '#21262D' : '#F1F5F9',
    inputBg:      dark ? '#161B22' : '#F8FAFC',
    inputBorder:  dark ? '#0EA5E920' : '#E0F2FE',
    inputText:    dark ? '#F0F6FC' : '#0F172A',
    placeholder:  dark ? '#8B949E' : '#94A3B8',
    // Send button
    sendActive:   '#004B87',
    sendInactive: dark ? '#21262D' : '#F1F5F9',
    sendIconOff:  dark ? '#8B949E' : '#94A3B8',
    // Reply bar
    replyBg:      dark ? '#161B22' : '#F8FAFC',
    replyBorder:  '#004B87',
    replyName:    '#0EA5E9',
    replyText:    dark ? '#8B949E' : '#64748B',
    // Context menu
    menuBg:       dark ? '#161B22' : '#FFFFFF',
    menuBorder:   dark ? '#21262D' : '#F1F5F9',
    menuText:     dark ? '#F0F6FC' : '#0F172A',
    // Sender label
    accent:       '#0EA5E9',
    accentAdmin:  '#10B981',
    // Overlay
    overlay:      'rgba(0,0,0,0.7)',
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatThreadProps {
  chat: Chat;
  currentSender: 'user' | 'admin';
  onSendMessage: (message: string, replyTo?: ChatMessage) => void;
  isLoading?: boolean;
  isDark?: boolean;
  headerContent?: React.ReactNode;
  headerHeight?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(raw: any): string {
  try { return toDate(raw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}
function dayKey(raw: any): string {
  try { return toDate(raw).toDateString(); } catch { return new Date().toDateString(); }
}
function dayLabel(key: string): string {
  const today = new Date().toDateString();
  const yest  = new Date(Date.now() - 86400000).toDateString();
  if (key === today) return 'Today';
  if (key === yest)  return 'Yesterday';
  try { return new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }); }
  catch { return key; }
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
export function TypingDots({ isDark = false }: { isDark?: boolean }) {
  const T = makeTheme(isDark);
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ alignSelf: 'flex-start', marginBottom: 10, marginLeft: 4 }}
    >
      <View style={{
        backgroundColor: T.recvBg,
        borderRadius: 18, borderTopLeftRadius: 4,
        paddingHorizontal: 16, paddingVertical: 13,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.08, shadowRadius: 8, elevation: 3,
        borderWidth: 1, borderColor: T.recvBorder,
      }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: T.accent,
            opacity: 0.3 + i * 0.35,
          }} />
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Context menu overlay ─────────────────────────────────────────────────────
function BubbleMenu({ visible, isMine, isDark, onCopy, onReply, onDelete, onClose }: {
  visible: boolean; isMine: boolean; isDark: boolean;
  onCopy: () => void; onReply: () => void;
  onDelete: () => void; onClose: () => void;
}) {
  const T = makeTheme(isDark);
  if (!visible) return null;

  const actions = [
    { icon: 'copy-outline',   label: 'Copy',   color: T.menuText,  bg: isDark ? '#21262D' : '#F8FAFC' },
    { icon: 'arrow-undo',     label: 'Reply',  color: '#0EA5E9',   bg: '#0EA5E918' },
    ...(isMine ? [{ icon: 'trash-outline', label: 'Delete', color: '#EF4444', bg: '#EF444418' }] : []),
  ];
  const fns = [onCopy, onReply, ...(isMine ? [onDelete] : [])];

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: T.overlay,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 40, zIndex: 999,
      }}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <Animated.View
            entering={FadeInUp.duration(180).springify()}
            style={{
              backgroundColor: T.menuBg,
              borderRadius: 20, overflow: 'hidden',
              width: '100%', maxWidth: 300,
              borderWidth: 1, borderColor: T.menuBorder,
              shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
              shadowOpacity: isDark ? 0.6 : 0.15, shadowRadius: 32, elevation: 20,
            }}
          >
            {actions.map((a, i) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => { fns[i](); onClose(); }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingHorizontal: 20, paddingVertical: 15,
                  borderBottomWidth: i < actions.length - 1 ? 1 : 0,
                  borderBottomColor: T.menuBorder,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 12,
                  backgroundColor: a.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={a.icon as any} size={18} color={a.color} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: a.color }}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Single bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, idx, isLastInGroup, currentSender, isDark, onReply, onDelete, onLongPress }: {
  msg: ChatMessage; idx: number; isLastInGroup: boolean;
  currentSender: 'user' | 'admin'; isDark: boolean;
  onReply: (m: ChatMessage) => void;
  onDelete: (m: ChatMessage) => void;
  onLongPress: (m: ChatMessage) => void;
}) {
  const T       = makeTheme(isDark);
  const isMine  = msg.sender === currentSender;
  const isAdmin = msg.sender === 'admin';
  const replyData = (msg as any).replyTo as ChatMessage | undefined;

  let bg: string, textClr: string, timeClr: string, tickClr: string;
  if (isMine) {
    bg = T.sentBg; textClr = T.sentText; timeClr = T.sentTime; tickClr = T.sentTick;
  } else if (isAdmin) {
    bg = T.adminBg; textClr = T.adminText; timeClr = T.adminTime; tickClr = T.adminTime;
  } else {
    bg = T.recvBg; textClr = T.recvText; timeClr = T.recvTime; tickClr = T.recvTime;
  }

  const senderColor = isAdmin ? T.accentAdmin : T.accent;

  return (
    <Animated.View
      entering={(isMine ? FadeInRight : FadeInLeft).delay(Math.min(idx * 18, 120)).springify()}
      style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        marginBottom: 3,
      }}
    >
      {/* Sender label for received messages */}
      {!isMine && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4, marginLeft: 4 }}>
          <View style={{
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: senderColor + '22',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={isAdmin ? 'storefront' : 'person'} size={10} color={senderColor} />
          </View>
          <Text style={{ fontSize: 10, fontWeight: '800', color: senderColor, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {msg.senderName}
          </Text>
        </View>
      )}

      <TouchableOpacity onLongPress={() => onLongPress(msg)} activeOpacity={0.85} delayLongPress={280}>
        <View style={{
          backgroundColor: bg,
          borderRadius: 24,
          borderTopRightRadius: isMine ? 4 : 24,
          borderTopLeftRadius: isMine ? 24 : 4,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 10,
          shadowColor: isMine ? T.sentBg : '#000',
          shadowOffset: { width: 0, height: isMine ? 4 : 2 },
          shadowOpacity: isMine ? 0.3 : (isDark ? 0.4 : 0.05),
          shadowRadius: isMine ? 12 : 8,
          elevation: isMine ? 8 : 2,
          borderWidth: !isMine && !isAdmin ? 1.5 : 0,
          borderColor: T.recvBorder,
        }}>
          {/* Quoted reply */}
          {replyData && (
            <View style={{
              borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
              marginBottom: 10, borderLeftWidth: 3.5,
              backgroundColor: isMine ? 'rgba(255,255,255,0.12)' : (isDark ? '#0C2A44' : '#F0F9FF'),
              borderLeftColor: isMine ? 'rgba(255,255,255,0.5)' : T.accent,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', marginBottom: 2,
                color: isMine ? '#99F6E4' : T.accent }}>
                {replyData.senderName}
              </Text>
              <Text style={{ fontSize: 11, color: isMine ? '#CCFBF1' : T.replyText }}
                numberOfLines={1}>
                {replyData.message}
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 15, lineHeight: 22, color: textClr }}>
            {msg.message}
          </Text>

          {/* Time + tick */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5,
            justifyContent: isMine ? 'flex-end' : 'flex-start',
          }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: timeClr }}>
              {fmtTime(msg.timestamp)}
            </Text>
            {isMine && isLastInGroup && (
              <Ionicons name="checkmark-done" size={14} color={tickClr} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Reply bar ────────────────────────────────────────────────────────────────
function ReplyBar({ msg, isDark, onCancel }: { msg: ChatMessage; isDark: boolean; onCancel: () => void }) {
  const T = makeTheme(isDark);
  return (
    <Animated.View
      entering={FadeInUp.duration(160)}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: T.replyBg,
        borderLeftWidth: 3, borderLeftColor: T.replyBorder,
        marginHorizontal: 12, marginBottom: 6,
        paddingHorizontal: 12, paddingVertical: 9,
        borderRadius: 14, gap: 10,
        borderWidth: 1, borderColor: T.barBorder,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: T.replyName, marginBottom: 2 }}>
          {msg.senderName}
        </Text>
        <Text style={{ fontSize: 12, color: T.replyText }} numberOfLines={1}>
          {msg.message}
        </Text>
      </View>
      <TouchableOpacity onPress={onCancel} hitSlop={8}>
        <View style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: T.accent + '20',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="close" size={14} color={T.accent} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const ChatThread: React.FC<ChatThreadProps> = ({
  chat, currentSender, onSendMessage, isLoading,
  isDark = false, headerContent, headerHeight = 60,
}) => {
  const T      = makeTheme(isDark);
  const insets = useSafeAreaInsets();

  const [text,    setText]    = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [menuMsg, setMenuMsg] = useState<ChatMessage | null>(null);
  const scrollRef  = useRef<ScrollView>(null);
  const inputRef   = useRef<TextInput>(null);
  const sendScale  = useSharedValue(1);
  const sendStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: withTiming(text.trim() ? 1 : 0.45, { duration: 150 }),
  }));

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

  const handleSend = useCallback(() => {
    if (!text.trim() || isLoading) return;
    sendScale.value = withSpring(0.8, {}, () => { sendScale.value = withSpring(1); });
    onSendMessage(text.trim(), replyTo ?? undefined);
    setText('');
    setReplyTo(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [text, isLoading, replyTo, onSendMessage]);

  const handleDelete = useCallback((_msg: ChatMessage) => {
    Alert.alert('Delete message', 'Remove this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('', 'Coming soon') },
    ]);
  }, []);

  const canSend    = text.trim().length > 0 && !isLoading;
  const kavOffset  = Platform.OS === 'ios' ? headerHeight + insets.top : 0;

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={kavOffset}
      >
        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: T.bg }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {headerContent}

          {groups.map(({ key, label, messages }) => (
            <View key={key}>
              {/* Date pill */}
              <View style={{ alignItems: 'center', marginVertical: 18 }}>
                <View style={{
                  backgroundColor: T.pillBg,
                  paddingHorizontal: 14, paddingVertical: 5,
                  borderRadius: 20,
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '800',
                    color: T.pillText,
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    {label}
                  </Text>
                </View>
              </View>

              {messages.map((msg, idx) => (
                <Bubble
                  key={msg.id ?? `${key}-${idx}`}
                  msg={msg} idx={idx}
                  isLastInGroup={idx === messages.length - 1}
                  currentSender={currentSender}
                  isDark={isDark}
                  onReply={m => { setReplyTo(m); inputRef.current?.focus(); }}
                  onDelete={handleDelete}
                  onLongPress={m => setMenuMsg(m)}
                />
              ))}
            </View>
          ))}
          <View style={{ height: 6 }} />
        </ScrollView>

        {/* ── Reply bar ── */}
        {replyTo && (
          <ReplyBar
            msg={replyTo}
            isDark={isDark}
            onCancel={() => setReplyTo(null)}
          />
        )}

        {/* ── Input bar ── */}
        <Animated.View
          entering={FadeInDown.duration(280)}
          style={{
            backgroundColor: T.barBg,
            borderTopWidth: 1.5, borderTopColor: T.barBorder,
            paddingHorizontal: 14, paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 14),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 20, elevation: 15,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            {/* Input pill */}
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'flex-end',
              backgroundColor: T.inputBg,
              borderRadius: 28, borderWidth: 1.5, borderColor: T.inputBorder,
              paddingHorizontal: 16, paddingVertical: 12,
              minHeight: 52, maxHeight: 130,
            }}>
              <TouchableOpacity
                style={{ marginRight: 8, marginBottom: 1 }}
                onPress={() => inputRef.current?.focus()}
                hitSlop={6}
              >
                <Ionicons name="happy-outline" size={22} color={T.placeholder} />
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                style={{
                  flex: 1, fontSize: 15, color: T.inputText,
                  padding: 0, lineHeight: 22, maxHeight: 90,
                }}
                placeholder="Type a message…"
                placeholderTextColor={T.placeholder}
                value={text}
                onChangeText={setText}
                multiline
                editable={!isLoading}
                returnKeyType="default"
              />
            </View>

            {/* Send button */}
            <Animated.View style={sendStyle}>
              <TouchableOpacity
                onPress={handleSend}
                disabled={!canSend}
                style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: canSend ? T.sendActive : T.sendInactive,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: T.sendActive,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: canSend ? 0.35 : 0,
                  shadowRadius: 12, elevation: 10,
                }}
              >
                {isLoading
                  ? <ActivityIndicator size="small" color={T.sendIconOff} />
                  : <Ionicons
                      name="send"
                      size={22}
                      color={canSend ? '#fff' : T.sendIconOff}
                      style={{ marginLeft: 3 }}
                    />
                }
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* ── Context menu overlay ── */}
      {menuMsg && (
        <BubbleMenu
          visible
          isDark={isDark}
          isMine={menuMsg.sender === currentSender}
          onCopy={() => Alert.alert('Message', menuMsg.message)}
          onReply={() => { setReplyTo(menuMsg); inputRef.current?.focus(); }}
          onDelete={() => handleDelete(menuMsg)}
          onClose={() => setMenuMsg(null)}
        />
      )}
    </View>
  );
};
