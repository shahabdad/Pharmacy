import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInLeft, FadeInRight,
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { Chat } from '../types';

interface ChatThreadProps {
  chat: Chat;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ chat, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = React.useState('');
  const scrollRef = useRef<ScrollView>(null);
  const sendScale = useSharedValue(1);

  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {chat.messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <Animated.View
              key={msg.id ?? index}
              entering={(isUser ? FadeInRight : FadeInLeft).delay(index * 60).springify()}
              className={`mb-3 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}
            >
              {!isUser && (
                <Text className="text-[10px] font-semibold text-gray-400 mb-1 ml-1">
                  {msg.senderName}
                </Text>
              )}
              <View
                className={`rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-violet-600 rounded-tr-sm'
                    : 'bg-white rounded-tl-sm border border-gray-100'
                }`}
                style={
                  isUser
                    ? { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 }
                    : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }
                }
              >
                <Text className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                  {msg.message}
                </Text>
                <Text className={`text-[10px] mt-1 ${isUser ? 'text-violet-200' : 'text-gray-400'} text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </Animated.View>
          );
        })}
        <View className="h-4" />
      </ScrollView>

      {/* Input bar */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-100"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 8 }}
      >
        <View
          className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100"
          style={{ minHeight: 44, maxHeight: 100 }}
        >
          <TextInput
            className="text-sm text-gray-800"
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
            style={{ padding: 0 }}
          />
        </View>

        <Animated.View style={sendAnimStyle}>
          <TouchableOpacity
            className={`w-11 h-11 rounded-2xl items-center justify-center ${inputText.trim() ? 'bg-violet-600' : 'bg-gray-200'}`}
            style={inputText.trim() ? { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 } : {}}
            onPress={handleSend}
            onPressIn={() => { sendScale.value = withSpring(0.9); }}
            onPressOut={() => { sendScale.value = withSpring(1); }}
            disabled={isLoading || !inputText.trim()}
          >
            <Ionicons
              name="send"
              size={16}
              color={inputText.trim() ? '#fff' : '#9CA3AF'}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};
