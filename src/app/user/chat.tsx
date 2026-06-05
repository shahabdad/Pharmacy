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
import { ChatThread } from '../../components/ChatThread';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ChatSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { Chat, ChatMessage } from '../../types';

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
  const [showMenu, setShowMenu] = useState(false);

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

  const handleClearChat = async () => {
    if (!chat) return;
    Alert.alert('Clear Chat', 'Are you sure you want to delete all messages? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await chatService.clearChat(chat.id);
            setShowMenu(false);
          } catch (e: any) {
            Alert.alert('Error', 'Failed to clear chat');
          }
        }
      }
    ]);
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: insets.top }}>
      <ChatSkeleton />
    </View>
  );

  if (error) return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-8" style={{ paddingTop: insets.top }}>
      <Text className="text-base font-bold text-gray-900 mb-2 text-center">Connection Error</Text>
      <Text className="text-sm text-gray-400 text-center mb-6">{error}</Text>
      <TouchableOpacity onPress={() => { setError(null); setLoading(true); }} className="bg-blue-700 px-8 py-3 rounded-2xl">
        <Text className="text-white font-bold text-sm">Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]" style={{ paddingTop: insets.top }}>
      <Animated.View entering={FadeInDown.duration(350)} className="bg-[#075E54] px-4 pb-4" style={{ paddingTop: insets.top > 0 ? 8 : 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="medical" size={20} color="#fff" />
              </View>
              <View>
                <Text className="text-[17px] font-bold text-white">MediCare Shop - Pharmacist</Text>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <Text className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Online</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center" onPress={() => setShowMenu(!showMenu)}>
            <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <Animated.View entering={FadeInUp.duration(200)} className="mt-3 bg-slate-50 rounded-2xl p-2 border border-slate-100">
            <TouchableOpacity onPress={() => { setShowMenu(false); Alert.alert('Call Pharmacy', '+923191796621'); }} className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white">
              <Ionicons name="call" size={18} color="#005CAB" />
              <Text className="text-sm font-semibold text-slate-700">Call Pharmacy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowMenu(false); Alert.alert('Success', 'Notifications muted for this chat.'); }} className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white">
              <Ionicons name="notifications-off-outline" size={18} color="#64748B" />
              <Text className="text-sm font-semibold text-slate-700">Mute Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowMenu(false); Alert.alert('Report', 'Our team has been notified. We will review the chat.'); }} className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white">
              <Ionicons name="warning-outline" size={18} color="#F59E0B" />
              <Text className="text-sm font-semibold text-slate-700">Report Problem</Text>
            </TouchableOpacity>
            <View className="h-[1px] bg-slate-200 my-1 mx-2" />
            <TouchableOpacity onPress={handleClearChat} className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white">
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-sm font-semibold text-red-600">Clear Chat</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {!((chat?.messages?.length ?? 0) > 0) && (
        <Animated.View entering={FadeInUp.delay(150).springify()} className="items-center pt-8 pb-4 px-6">
          <View className="w-20 h-20 rounded-[32px] bg-blue-800 items-center justify-center mb-6">
            <Ionicons name="chatbubbles" size={38} color="#fff" />
          </View>
          <Text className="text-2xl font-black text-slate-900 mb-2">Hi {appUser?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text className="text-[15px] text-slate-500 text-center leading-6 mb-8 px-4">Our medical specialists are here to help you.</Text>
          <View className="w-full">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
              {QUICK_REPLIES.map(qr => (
                <TouchableOpacity key={qr.label} onPress={() => handleSend(qr.label)} className="bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 flex-row items-center gap-2">
                  <Ionicons name={qr.icon as any} size={15} color="#005CAB" />
                  <Text className="text-sm font-bold text-slate-700">{qr.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {typing && <TypingDots />}
      {chat && <ChatThread chat={chat} currentSender="user" onSendMessage={handleSend} isLoading={sending} />}
    </View>
  );
}

