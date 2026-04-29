import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert, Image, Linking, Platform, Pressable,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp,
  useAnimatedStyle, useSharedValue,
  withSpring, withTiming, ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeliveryModal } from '@/src/components/DeliveryModal';
import { MessageModal } from '@/src/components/MessageModal';
import { useAuth } from '@/src/context/AuthContext';
import { submitPrescriptionOrder } from '@/src/services/prescriptionService';

type Step = 'idle' | 'modal1' | 'modal2' | 'success';

// ─── Animated press card ──────────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressCard({
  onPress, children, style, disabled,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
}) {
  const scale  = useSharedValue(1);
  const shadow = useSharedValue(6);

  const animStyle = useAnimatedStyle(() => ({
    transform:     [{ scale: scale.value }],
    shadowRadius:  shadow.value,
    shadowOpacity: shadow.value / 20,
    elevation:     shadow.value,
  }));

  return (
    <AnimatedPressable
      style={[animStyle, style]}
      onPressIn={() => {
        if (!disabled) {
          scale.value  = withSpring(0.97);
          shadow.value = withTiming(2);
        }
      }}
      onPressOut={() => {
        scale.value  = withSpring(1);
        shadow.value = withTiming(6);
      }}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets              = useSafeAreaInsets();
  const { appUser }         = useAuth();
  const firstName           = appUser?.name?.split(' ')[0] ?? 'there';

  const [imageUri,  setImageUri]  = useState<string | null>(null);
  const [message,   setMessage]   = useState('');
  const [step,      setStep]      = useState<Step>('idle');
  const [loading,   setLoading]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [orderId,   setOrderId]   = useState<string | null>(null);

  // WhatsApp shop contact
  const SHOP_WHATSAPP = '+923191796621'; // Shop WhatsApp number

  // ── Image picker ────────────────────────────────────────────────────────────
  async function pickImage(source: 'camera' | 'gallery') {
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission required', `Please allow ${source} access in Settings.`);
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  // ── Submit order ────────────────────────────────────────────────────────────
  async function handleSubmit(address: string, phone: string) {
    if (!imageUri) return;

    setLoading(true);
    setProgress(0);

    try {
      const id = await submitPrescriptionOrder(
        {
          imageUri,
          message,
          address,
          phone,
          userId:   appUser?.uid   ?? 'anonymous',
          userName: appUser?.name  ?? 'User',
        },
        setProgress,
      );
      setOrderId(id);
      setStep('success');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  function reset() {
    setImageUri(null);
    setMessage('');
    setOrderId(null);
    setStep('idle');
  }

  // ── WhatsApp Handler ────────────────────────────────────────────────────────
  const handleWhatsAppPress = () => {
    const phoneNumber = SHOP_WHATSAPP.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const defaultMessage = `Hello! I need help with my prescription order.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    
    Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on your device');
        }
      })
      .catch((err: any) => {
        console.error('WhatsApp error:', err);
        Alert.alert('Error', 'Failed to open WhatsApp');
      });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-8"
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          entering={ZoomIn.springify()}
          className="w-24 h-24 rounded-3xl bg-emerald-50 items-center justify-center mb-6"
          style={{ shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 }}
        >
          <Ionicons name="checkmark-circle" size={56} color="#10B981" />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(150).springify()} className="text-2xl font-black text-gray-900 mb-2 text-center">
          Order placed! 🎉
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(250).springify()} className="text-sm text-gray-400 text-center leading-5 mb-3">
          Your prescription has been submitted.{'\n'}We'll confirm your order shortly.
        </Animated.Text>

        {orderId && (
          <Animated.View
            entering={FadeInUp.delay(320).springify()}
            className="bg-violet-50 rounded-2xl px-4 py-2.5 mb-8 flex-row items-center gap-2"
          >
            <Ionicons name="receipt-outline" size={14} color="#6C63FF" />
            <Text className="text-xs text-violet-600 font-bold">
              Order ID: {orderId.slice(0, 12).toUpperCase()}
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(400).springify()} className="w-full">
          <PressCard
            onPress={reset}
            style={{
              borderRadius: 18,
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <View className="bg-violet-600 rounded-[18px] py-4 items-center">
              <Text className="text-white font-bold text-sm">Back to home</Text>
            </View>
          </PressCard>
        </Animated.View>
      </View>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimalist Header */}
        <View className="px-6 pt-4 pb-6">
          <Animated.View entering={FadeInDown.duration(400)} className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-sm text-gray-400 font-medium mb-1">Hello,</Text>
              <Text className="text-3xl font-black text-gray-900">{firstName}</Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 bg-white rounded-2xl items-center justify-center"
              style={{ 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 2 }, 
                shadowOpacity: 0.08, 
                shadowRadius: 8, 
                elevation: 4 
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#1F2937" />
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </TouchableOpacity>
          </Animated.View>

          {/* Horizontal Stats Scroll */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              className="mb-6"
            >
              {[
                { label: 'Total Orders',  value: '12', icon: 'receipt',          color: '#EF4444', bg: '#FEE2E2' },
                { label: 'In Progress',   value: '3',  icon: 'hourglass',        color: '#F59E0B', bg: '#FEF3C7' },
                { label: 'Completed',     value: '9',  icon: 'checkmark-done',   color: '#10B981', bg: '#D1FAE5' },
                { label: 'Saved',         value: '5',  icon: 'heart',            color: '#EC4899', bg: '#FCE7F3' },
              ].map((stat, idx) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInDown.delay(idx * 50 + 150).springify()}
                >
                  <View
                    className="bg-white rounded-3xl p-4 w-32"
                    style={{ 
                      shadowColor: '#000', 
                      shadowOffset: { width: 0, height: 2 }, 
                      shadowOpacity: 0.06, 
                      shadowRadius: 10, 
                      elevation: 3 
                    }}
                  >
                    <View 
                      className="w-11 h-11 rounded-2xl items-center justify-center mb-3"
                      style={{ backgroundColor: stat.bg }}
                    >
                      <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 mb-1">{stat.value}</Text>
                    <Text className="text-[10px] text-gray-400 font-semibold">{stat.label}</Text>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>

        <View className="px-6">

        {/* Pro Tips Card - NOW AT TOP */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          className="bg-white rounded-3xl p-5 mb-6"
          style={{ 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.06, 
            shadowRadius: 10, 
            elevation: 3 
          }}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-amber-50 rounded-2xl items-center justify-center">
              <Ionicons name="bulb" size={20} color="#F59E0B" />
            </View>
            <Text className="text-base font-bold text-gray-900">Pro Tips</Text>
          </View>
          
          <View className="space-y-3">
            {[
              { icon: 'sunny-outline', text: 'Use natural lighting', color: '#F59E0B' },
              { icon: 'text-outline', text: 'Ensure text is readable', color: '#EF4444' },
              { icon: 'scan-outline', text: 'Capture full document', color: '#10B981' },
            ].map((tip, idx) => (
              <Animated.View 
                key={tip.text} 
                entering={FadeInDown.delay(idx * 40 + 300).springify()}
                className="flex-row items-center gap-3 py-2"
              >
                <View className="w-8 h-8 bg-gray-50 rounded-xl items-center justify-center">
                  <Ionicons name={tip.icon as any} size={16} color={tip.color} />
                </View>
                <Text className="text-sm text-gray-600 flex-1">{tip.text}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#D1D5DB" />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Main Upload Card - NOW AT BOTTOM */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-black text-gray-900">Upload Prescription</Text>
            {imageUri && (
              <View className="flex-row items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full">
                <View className="w-2 h-2 bg-emerald-500 rounded-full" />
                <Text className="text-xs font-bold text-emerald-600">Ready</Text>
              </View>
            )}
          </View>

          {!imageUri ? (
            <View
              className="bg-white rounded-3xl p-8 items-center border-2 border-dashed border-gray-200"
              style={{ 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 4 }, 
                shadowOpacity: 0.04, 
                shadowRadius: 12, 
                elevation: 2 
              }}
            >
              <Animated.View
                entering={ZoomIn.delay(450).springify()}
                className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-5"
              >
                <Ionicons name="document-text" size={40} color="#EF4444" />
              </Animated.View>
              
              <Text className="text-base font-bold text-gray-900 mb-2">Upload Prescription</Text>
              <Text className="text-sm text-gray-400 text-center mb-6 leading-5">
                Snap a photo or select from gallery
              </Text>

              <View className="flex-row gap-3 w-full">
                {(['camera', 'gallery'] as const).map((src, idx) => (
                  <Animated.View key={src} entering={FadeInDown.delay(idx * 60 + 500).springify()} className="flex-1">
                    <PressCard
                      onPress={() => pickImage(src)}
                      style={{ 
                        borderRadius: 16, 
                        shadowColor: '#EF4444', 
                        shadowOffset: { width: 0, height: 2 }, 
                        shadowOpacity: 0.15, 
                        shadowRadius: 8, 
                        elevation: 3 
                      }}
                    >
                      <View className="bg-red-500 rounded-2xl py-4 items-center flex-row justify-center gap-2">
                        <Ionicons
                          name={src === 'camera' ? 'camera' : 'images'}
                          size={20}
                          color="#fff"
                        />
                        <Text className="text-sm font-bold text-white capitalize">{src}</Text>
                      </View>
                    </PressCard>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : (
            <Animated.View
              entering={ZoomIn.springify()}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 4 }, 
                shadowOpacity: 0.08, 
                shadowRadius: 16, 
                elevation: 6 
              }}
            >
              <View className="relative">
                <Image source={{ uri: imageUri }} className="w-full h-64" resizeMode="cover" />
                <View className="absolute top-4 right-4 bg-emerald-500 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text className="text-xs font-bold text-white">Uploaded</Text>
                </View>
              </View>
              
              <View className="p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-1">prescription.jpg</Text>
                    <Text className="text-xs text-gray-400">Image ready for submission</Text>
                  </View>
                  <Pressable 
                    onPress={() => setImageUri(null)} 
                    hitSlop={8}
                    className="ml-3"
                  >
                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                      <Ionicons name="close" size={18} color="#6B7280" />
                    </View>
                  </Pressable>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1 bg-gray-50 rounded-2xl p-3 flex-row items-center gap-2">
                    <Ionicons name="image" size={16} color="#6B7280" />
                    <Text className="text-xs text-gray-600 font-medium">JPG</Text>
                  </View>
                  <View className="flex-1 bg-gray-50 rounded-2xl p-3 flex-row items-center gap-2">
                    <Ionicons name="resize" size={16} color="#6B7280" />
                    <Text className="text-xs text-gray-600 font-medium">High Quality</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        </View>
      </ScrollView>

      {/* Fixed Submit Button */}
      <View
        className="absolute left-0 right-0 bg-white border-t border-gray-200 px-6"
        style={{
          bottom: Platform.OS === 'ios' ? 88 : 76,
          paddingTop: 16,
          paddingBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <Pressable
          onPress={() => imageUri && setStep('modal1')}
          disabled={!imageUri}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: imageUri ? '#EF4444' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: imageUri ? 0.25 : 0.05,
            shadowRadius: 12,
            elevation: imageUri ? 6 : 2,
          }}
        >
          <View
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              backgroundColor: imageUri ? '#EF4444' : '#E5E7EB',
            }}
          >
            <Ionicons
              name={imageUri ? 'paper-plane' : 'cloud-upload-outline'}
              size={22}
              color={imageUri ? '#FFFFFF' : '#9CA3AF'}
            />

            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 0.3,
                color: imageUri ? '#FFFFFF' : '#9CA3AF',
              }}
            >
              {imageUri ? 'Submit New Prescription' : 'Upload Prescription First'}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Floating WhatsApp Button */}
      <Animated.View
        entering={ZoomIn.delay(600).springify()}
        className="absolute"
        style={{
          bottom: Platform.OS === 'ios' ? 180 : 168,
          right: 20,
        }}
      >
        <TouchableOpacity
          onPress={handleWhatsAppPress}
          activeOpacity={0.8}
          className="w-16 h-16 bg-green-500 rounded-full items-center justify-center"
          style={{
            shadowColor: '#25D366',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" />
          
          {/* Pulse animation indicator */}
          <View 
            className="absolute w-16 h-16 bg-green-400 rounded-full opacity-30"
            style={{
              transform: [{ scale: 1.2 }],
            }}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal 1 — Message */}
      <MessageModal
        visible={step === 'modal1'}
        message={message}
        onChange={setMessage}
        onNext={() => setStep('modal2')}
        onCancel={() => setStep('idle')}
      />

      {/* Modal 2 — Delivery + submit */}
      <DeliveryModal
        visible={step === 'modal2'}
        loading={loading}
        progress={progress}
        onBack={() => setStep('modal1')}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
