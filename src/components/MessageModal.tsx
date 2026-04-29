import React from 'react';
import {
    KeyboardAvoidingView, Modal, Platform,
    Pressable, Text, TextInput, View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

interface Props {
  visible:  boolean;
  message:  string;
  onChange: (v: string) => void;
  onNext:   () => void;
  onCancel: () => void;
}

export function MessageModal({ visible, message, onChange, onNext, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          className="bg-white rounded-t-[32px] px-5 pt-0 pb-8"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 }}
        >
          {/* Handle */}
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-5" />

          {/* Step indicator */}
          <View className="flex-row gap-2 mb-5">
            <View className="h-1.5 w-14 rounded-full bg-violet-600" />
            <View className="h-1.5 w-6 rounded-full bg-gray-200" />
          </View>

          <Text className="text-xl font-black text-gray-900 mb-1">Add a message</Text>
          <Text className="text-xs text-gray-400 mb-5">Optional note for the pharmacist</Text>

          <Text className="text-xs font-bold text-gray-700 mb-2">Message (optional)</Text>
          <View className="bg-gray-50 rounded-2xl px-4 py-3 mb-1 border-2 border-transparent">
            <TextInput
              className="text-sm text-gray-800"
              multiline
              numberOfLines={4}
              maxLength={200}
              placeholder="e.g. Please include generic alternatives..."
              placeholderTextColor="#C7C7CC"
              value={message}
              onChangeText={onChange}
              style={{ padding: 0, minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>
          <Text className="text-[10px] text-gray-400 text-right mb-5">{message.length}/200</Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
              onPress={onCancel}
            >
              <Text className="text-sm font-bold text-gray-500">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-[2] rounded-2xl py-4 items-center"
              style={{ backgroundColor: '#6C63FF', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
              onPress={onNext}
            >
              <Text className="text-sm font-bold text-white">Next →</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
