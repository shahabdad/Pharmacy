import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView,
    Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatThread } from '../components/ChatThread';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { Chat } from '../types';

// ─── Smart quick-reply suggestions ───────────────────────────────────────────
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

const ORDER_REPLIES = [
  'Your order has been confirmed!',
  'Your order is out for delivery.',
  'Your order has been delivered successfully.',
  'Your order is being prepared. Estimated time: 30–45 minutes.',
  'Could you please confirm your delivery address?',
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

  // Find last user message
  const lastUserMsg = [...chat.messages].reverse().find(m => m.sender === 'user');
  if (!lastUserMsg) return GENERAL_REPLIES;

  const text = lastUserMsg.message.toLowerCase();

  // Check keyword matches first
  for (const { keywords, replies } of KEYWORD_REPLIES) {
    if (keywords.some(k => text.includes(k))) return replies;
  }

  // Fall back to context type
  if (chat.prescriptionId) return PRESCRIPTION_REPLIES;
  if (chat.orderId)        return ORDER_REPLIES;
  return GENERAL_REPLIES;
}

/**
 * Enhanced Admin Chat Detail Screen
 * 
 * Features:
 * - Modern professional UI
 * - User info display
 * - Online status indicator
 * - Message count
 * - Quick actions menu
 * - Real-time updates
 * - Typing indicator
 * - Message delivery status
 */
export default function AdminChatDetailEnhancedScreen() {
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

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin privileges required');
      router.replace('/(tabs)');
    }
  }, [isAdmin]);

  // Load chat and listen for updates
  useEffect(() => {
    if (!chatId) return;

    loadChat();

    // Listen for real-time updates
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

  const getChatTitle = () => {
    if (!chat) return 'Chat';
    if (chat.prescriptionId) {
      return `Prescription #${chat.prescriptionId.slice(0, 8)}`;
    }
    if (chat.orderId) {
      return `Order #${chat.orderId.slice(0, 8)}`;
    }
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
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMessageCount = () => {
    return chat?.messages?.length || 0;
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
        if (chat?.prescriptionId) {
          router.push('/admin-prescriptions' as any);
        }
        break;
      case 'view-order':
        if (chat?.orderId) {
          router.push('/admin-orders' as any);
        }
        break;
      case 'clear-chat':
        Alert.alert(
          'Clear Chat',
          'Are you sure you want to clear this conversation?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => {
              Alert.alert('Coming Soon', 'This feature is under development');
            }},
          ]
        );
        break;
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-sm text-gray-400 mt-3 font-medium">Loading conversation...</Text>
      </View>
    );
  }

  if (!chat) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="chatbubble-outline" size={40} color="#9CA3AF" />
        </View>
        <Text className="text-lg font-bold text-gray-900 mb-2">Chat Not Found</Text>
        <Text className="text-sm text-gray-400 text-center">
          This conversation may have been deleted
        </Text>
      </View>
    );
  }

  const userName = getUserName();
  const avatarColor = getAvatarColor(userName);
  const initials = getInitials(userName);
  const messageCount = getMessageCount();

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-white px-5 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-slate-100 rounded-2xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>

          {/* User Avatar */}
          <View className="relative">
            <View
              className="w-11 h-11 rounded-2xl items-center justify-center"
              style={{ backgroundColor: avatarColor.bg }}
            >
              <Text className="text-sm font-black" style={{ color: avatarColor.text }}>
                {initials}
              </Text>
            </View>
            {/* Online indicator */}
            <View className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </View>

          {/* User Info */}
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">{userName}</Text>
            <Text className="text-[10px] text-gray-400 font-medium">
              {getChatTitle()} • {messageCount} message{messageCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Menu Button */}
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
          </TouchableOpacity>

          {/* Quick-reply toggle */}
          <TouchableOpacity
            onPress={() => { setShowSuggestions(s => !s); setShowMenu(false); }}
            className={`w-10 h-10 rounded-xl items-center justify-center ml-1 ${showSuggestions ? 'bg-violet-600' : 'bg-slate-100'}`}
            style={showSuggestions ? {
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4,
            } : {}}
          >
            <Ionicons name="flash" size={18} color={showSuggestions ? '#fff' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Menu */}
        {showMenu && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            className="mt-3 bg-slate-50 rounded-2xl p-2"
          >
            {chat.prescriptionId && (
              <TouchableOpacity
                onPress={() => handleMenuAction('view-prescription')}
                className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white"
              >
                <Ionicons name="document-text" size={18} color="#6366F1" />
                <Text className="text-sm font-semibold text-gray-900">View Prescription</Text>
              </TouchableOpacity>
            )}
            {chat.orderId && (
              <TouchableOpacity
                onPress={() => handleMenuAction('view-order')}
                className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white"
              >
                <Ionicons name="cart" size={18} color="#10B981" />
                <Text className="text-sm font-semibold text-gray-900">View Order</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleMenuAction('clear-chat')}
              className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-white"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text className="text-sm font-semibold text-gray-900">Clear Chat</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {/* Quick-reply suggestions panel */}
      {showSuggestions && (
        <Animated.View
          entering={FadeInDown.duration(250).springify()}
          className="bg-white border-b border-slate-100 px-4 py-3"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center gap-2 mb-2.5">
            <View className="w-5 h-5 bg-violet-100 rounded-full items-center justify-center">
              <Ionicons name="flash" size={11} color="#6366F1" />
            </View>
            <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Quick Replies
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {suggestedReplies.map((reply, idx) => (
              <Animated.View key={idx} entering={FadeInLeft.delay(idx * 40).springify()}>
                <TouchableOpacity
                  onPress={() => handleQuickReply(reply)}
                  className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-2.5"
                  style={{ maxWidth: 240 }}
                >
                  <Text className="text-xs font-semibold text-violet-700" numberOfLines={2}>
                    {reply}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Chat Thread */}
      <ChatThread
        chat={chat}
        currentSender="admin"
        onSendMessage={handleSendMessage}
        isLoading={sending}
        prefillText={prefillText}
        onPrefillConsumed={() => setPrefillText(undefined)}
      />
    </View>
  );
}
