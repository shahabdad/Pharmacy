import { ChatThread } from '@/src/components/ChatThread';
import { Chat } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockChat: Chat = {
  id: '1',
  participants: ['User', 'Admin'],
  messages: [
    { id: 'm1', sender: 'admin', senderName: 'Pharmacy', message: 'Hello! How can I help you today?', timestamp: new Date(Date.now() - 60000) },
    { id: 'm2', sender: 'user',  senderName: 'You',      message: 'I have a question about my order.', timestamp: new Date(Date.now() - 30000) },
    { id: 'm3', sender: 'admin', senderName: 'Pharmacy', message: 'Sure! Please share your order ID and I will look into it right away.', timestamp: new Date(Date.now() - 10000) },
  ],
  createdAt: new Date(),
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-white px-5 py-4 flex-row items-center gap-3"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 }}
      >
        <View className="w-10 h-10 rounded-2xl bg-violet-100 items-center justify-center">
          <Ionicons name="storefront" size={20} color="#6C63FF" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-900">MadicCare Pharmacy</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <View className="w-2 h-2 rounded-full bg-emerald-400" />
            <Text className="text-[10px] text-emerald-500 font-medium">Online</Text>
          </View>
        </View>
        <View className="w-8 h-8 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="call-outline" size={16} color="#6C63FF" />
        </View>
      </Animated.View>

      <ChatThread chat={mockChat} onSendMessage={(msg) => console.log('send:', msg)} />
    </View>
  );
}
