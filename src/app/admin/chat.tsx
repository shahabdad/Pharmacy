import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView,
    Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatThread } from '../../components/ChatThread';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { Chat } from '../../types';

const GENERAL_REPLIES = [
  'Hello! How can I help you today?',
  'Your request has been received.',
  'Please allow us a few minutes to process this.',
  'Feel free to call us at +923191796621 for urgent queries.',
  'Thank you for your patience!',
];

const PRESCRIPTION_REPLIES = [
  'We have received your prescription and are reviewing it.',
  'Your medicines are being prepared. We will update you shortly.',
  'Prescription approved! Your order will be dispatched soon.',
  'Could you please provide a clearer image of the prescription?',
  'Your prescription quote is ready. Please check the app.',
];


const KEYWORD_REPLIES: { keywords: string[]; replies: string[] }[] = [
  {
    keywords: ['price', 'cost', 'how much', 'rate', 'quote'],
    replies: [
      'We will send you a price quote shortly.',
      'The price depends on availability. We will confirm within minutes.',
    ],
  },
  {
    keywords: ['delivery', 'deliver', 'when', 'time', 'arrive'],
    replies: [
      'Delivery typically takes 1–2 hours within the city.',
      'Please share your address so we can estimate delivery time.',
    ],
  },
  {
    keywords: ['available', 'stock', 'medicine', 'drug'],
    replies: [
      'Let me check the availability for you right away.',
      'Yes, this medicine is currently in stock.',
      'This item is currently out of stock. We can order it for you.',
    ],
  },
  {
    keywords: ['cancel', 'refund', 'return'],
    replies: [
      'We have noted your cancellation request and will process it shortly.',
      'Refunds are processed within 2–3 business days.',
    ],
  },
];

function getSuggestedReplies(chat: Chat): string[] {
  if (!chat.messages?.length) return GENERAL_REPLIES;
  const lastUserMsg = [...chat.messages].reverse().find(m => m.sender === 'user');
  if (!lastUserMsg) return GENERAL_REPLIES;
  const text = lastUserMsg.message.toLowerCase();
  for (const { keywords, replies } of KEYWORD_REPLIES) {
    if (keywords.some(k => text.includes(k))) return replies;
  }
  if (chat.prescriptionId) return PRESCRIPTION_REPLIES;
  return GENERAL_REPLIES;
}

export default function AdminChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { isAdmin, appUser } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [prefillText, setPrefillText] = useState<string | undefined>();

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin privileges required');
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!chatId) return;
    loadChat();
    const unsubscribe = chatService.listenToChat(chatId, (updatedChat) => {
      setChat(updatedChat);
    });
    return () => unsubscribe();
  }, [chatId]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const chatData = await chatService.getChat(chatId);
      if (chatData) {
        setChat(chatData);
      } else {
        Alert.alert('Error', 'Chat not found');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load chat');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chat || !appUser) return;
    try {
      setSending(true);
      await chatService.sendMessage(
        chat.id,
        'admin',
        appUser.name || 'Admin',
        message
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!chat) return;
    Alert.alert('Clear Chat', 'Are you sure you want to delete all messages for this customer? This cannot be undone.', [
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

  const getChatTitle = () => {
    if (!chat) return 'Chat';
    if (chat.prescriptionId) return `Rx #${chat.prescriptionId.slice(0, 8)}`;
    return 'Customer Chat';
  };

  const getUserName = () => {
    if (!chat) return 'Customer';
    if (chat.userName) return chat.userName;
    const userMsg = chat.messages?.find(m => m.sender === 'user');
    return userMsg?.senderName || 'Customer';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      { bg: '#FEE2E2', text: '#EF4444' },
      { bg: '#DBEAFE', text: '#3B82F6' },
      { bg: '#D1FAE5', text: '#10B981' },
      { bg: '#FEF3C7', text: '#F59E0B' },
      { bg: '#E0E7FF', text: '#6366F1' },
      { bg: '#FCE7F3', text: '#EC4899' },
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const suggestedReplies = useMemo(() => chat ? getSuggestedReplies(chat) : [], [chat]);

  const handleQuickReply = (text: string) => {
    setPrefillText(text);
    setShowSuggestions(false);
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'view-prescription':
        if (chat?.prescriptionId) router.push('/admin/prescriptions' as any);
        break;
    }
  };

  if (!isAdmin) return null;
  if (loading) return (
    <View className="flex-1 bg-slate-50 items-center justify-center" style={{ paddingTop: insets.top }}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="text-sm text-gray-400 mt-3 font-medium">Loading conversation...</Text>
    </View>
  );

  if (!chat) return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
      <Text className="text-lg font-bold text-gray-900 mb-2">Chat Not Found</Text>
    </View>
  );

  const userName = getUserName();
  const avatarColor = getAvatarColor(userName);
  const initials = getInitials(userName);

  return (
    <View className="flex-1 bg-[#121212]" style={{ paddingTop: insets.top }}>
      <Animated.View entering={FadeInDown.duration(400)} className="bg-[#075E54] px-5 py-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="relative">
            <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: avatarColor.bg }}>
              <Text className="text-sm font-black" style={{ color: avatarColor.text }}>{initials}</Text>
            </View>
            <View className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-white">{userName}</Text>
            <Text className="text-[10px] text-emerald-100 font-medium uppercase tracking-wider">MediCare Customer</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} className="w-10 h-10 items-center justify-center">
            <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowSuggestions(s => !s); setShowMenu(false); }} className={`w-10 h-10 rounded-xl items-center justify-center ml-1 ${showSuggestions ? 'bg-white/20' : ''}`}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <Animated.View entering={FadeInUp.duration(200)} className="mt-3 bg-slate-50 rounded-2xl p-2">
            {chat.prescriptionId && (
              <TouchableOpacity onPress={() => handleMenuAction('view-prescription')} className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white">
                <Ionicons name="document-text" size={18} color="#6366F1" />
                <Text className="text-sm font-semibold text-gray-900">View Prescription</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearChat} className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white">
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-sm font-semibold text-red-600">Clear Chat</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {showSuggestions && (
        <View className="bg-white border-b border-slate-100 px-4 py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {suggestedReplies.map((reply, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleQuickReply(reply)} className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-2.5">
                <Text className="text-xs font-semibold text-violet-700">{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ChatThread chat={chat} currentSender="admin" onSendMessage={handleSendMessage} isLoading={sending} prefillText={prefillText} onPrefillConsumed={() => setPrefillText(undefined)} />
    </View>
  );
}

