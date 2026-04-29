import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator, KeyboardAvoidingView, Modal,
    Platform, Pressable, Text, TextInput, View,
} from 'react-native';
import Animated, { SlideInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface Props {
  visible:   boolean;
  loading:   boolean;
  progress?: number;   // 0–100 upload progress
  onBack:    () => void;
  onSubmit:  (address: string, phone: string) => void;
}

export function DeliveryModal({ visible, loading, progress = 0, onBack, onSubmit }: Props) {
  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState('');
  const [errors,  setErrors]  = useState({ address: false, phone: false });

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%` as any, { duration: 300 }),
  }));

  function handleSubmit() {
    const e = { address: !address.trim(), phone: !phone.trim() };
    setErrors(e);
    if (e.address || e.phone) return;
    onSubmit(address.trim(), phone.trim());
  }

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
            <View className="h-1.5 w-6 rounded-full bg-gray-200" />
            <View className="h-1.5 w-14 rounded-full bg-violet-600" />
          </View>

          <Text className="text-xl font-black text-gray-900 mb-1">Delivery details</Text>
          <Text className="text-xs text-gray-400 mb-5">Where should we deliver your order?</Text>

          {/* Address field */}
          <Text className="text-xs font-bold text-gray-700 mb-2 flex-row items-center">
            <Ionicons name="location-outline" size={12} color="#374151" /> {'  '}Delivery address
          </Text>
          <View
            className={`bg-gray-50 rounded-2xl px-4 py-3 mb-1 border-2 ${
              errors.address ? 'border-red-400' : address ? 'border-violet-300' : 'border-transparent'
            }`}
          >
            <TextInput
              className="text-sm text-gray-800"
              placeholder="Street, city, area..."
              placeholderTextColor="#C7C7CC"
              value={address}
              onChangeText={(v) => { setAddress(v); setErrors(p => ({ ...p, address: false })); }}
              editable={!loading}
              style={{ padding: 0 }}
            />
          </View>
          {errors.address && (
            <Text className="text-[10px] text-red-400 mb-2 ml-1">Address is required</Text>
          )}

          {/* Phone field */}
          <Text className="text-xs font-bold text-gray-700 mb-2 mt-3 flex-row items-center">
            <Ionicons name="call-outline" size={12} color="#374151" /> {'  '}Phone number
          </Text>
          <View
            className={`bg-gray-50 rounded-2xl px-4 py-3 mb-1 border-2 ${
              errors.phone ? 'border-red-400' : phone ? 'border-violet-300' : 'border-transparent'
            }`}
          >
            <TextInput
              className="text-sm text-gray-800"
              placeholder="+92 300 0000000"
              placeholderTextColor="#C7C7CC"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrors(p => ({ ...p, phone: false })); }}
              editable={!loading}
              style={{ padding: 0 }}
            />
          </View>
          {errors.phone && (
            <Text className="text-[10px] text-red-400 mb-2 ml-1">Phone number is required</Text>
          )}

          {/* Upload progress bar — shown while loading */}
          {loading && (
            <View className="mt-4 mb-1">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-[10px] text-gray-400 font-medium">Uploading prescription...</Text>
                <Text className="text-[10px] text-violet-600 font-bold">{progress}%</Text>
              </View>
              <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <Animated.View
                  className="h-full bg-violet-600 rounded-full"
                  style={progressStyle}
                />
              </View>
            </View>
          )}

          {/* Buttons */}
          <View className="flex-row gap-3 mt-5">
            <Pressable
              className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
              onPress={onBack}
              disabled={loading}
            >
              <Text className="text-sm font-bold text-gray-500">← Back</Text>
            </Pressable>

            <Pressable
              className="flex-[2] rounded-2xl py-4 items-center flex-row justify-center gap-2"
              style={{
                backgroundColor: loading ? '#A78BFA' : '#6C63FF',
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="rocket-outline" size={16} color="#fff" />
                  <Text className="text-sm font-bold text-white">Submit order</Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
