import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import {
  Alert, Modal, Platform, Pressable,
  ScrollView, Text, TextInput, TouchableOpacity,
  useColorScheme, View,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp, ZoomIn,
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { DeliveryModal } from '@/src/components/DeliveryModal';
import { useAuth } from '@/src/context/AuthContext';
import { orderService } from '@/src/services/orderService';
import { submitPrescriptionOrder } from '@/src/services/prescriptionService';
import { PrescriptionWorkflow } from '@/src/components/PrescriptionWorkflow';
import { Skeleton, HomeHeaderSkeleton, PrescriptionCardSkeleton } from '@/src/components/Skeleton';

type Step = 'idle' | 'modal1' | 'modal2' | 'success' | 'picker';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressCard({ onPress, children, style, disabled }: {
  onPress: () => void; children: React.ReactNode; style?: any; disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[animStyle, style]}
      onPressIn={() => { if (!disabled) scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { firebaseUser, appUser } = useAuth();
  const firstName = appUser?.name?.split(' ')[0] ?? 'Sarah';
  const isDark = useColorScheme() === 'dark';

  // State Management
  const [orderMethod, setOrderMethod] = useState<'upload' | 'text'>('upload');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, done: 0 });

  // Theme Config (Professional Blue Palette)
  const PRIMARY_BLUE = '#004B87';
  const ACCENT_CYAN = '#0EA5E9';
  const bg = isDark ? '#0D1117' : '#F8FAFC';
  const cardBg = isDark ? '#161B22' : '#FFFFFF';
  const textPrimary = isDark ? '#F0F6FC' : '#0F172A';
  const textSecondary = isDark ? '#8B949E' : '#64748B';
  const borderColor = isDark ? '#21262D' : '#F1F5F9';

  // Order Listener
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribe = orderService.listenToUserOrders(firebaseUser.uid, (orders) => {
      const active = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;
      const done = orders.filter(o => o.status === 'delivered').length;
      setStats({ total: orders.length, active, done });
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Camera & Gallery Logic
  async function pickImage(source: 'camera' | 'gallery') {
    setStep('idle'); // Close picker modal first

    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission Denied', `Please allow ${source} access in settings.`);
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      setOrderMethod('upload');
    }
  }

  const handleSubmit = async (address: string, phone: string) => {
    setLoading(true);
    try {
      const id = await submitPrescriptionOrder(
        { imageUri, message, address, phone, userId: appUser?.uid ?? 'anon', userName: appUser?.name ?? 'User' },
        setProgress
      );
      setOrderId(id);
      setStep('success');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = orderMethod === 'upload' ? imageUri !== null : message.trim().length > 0;

  if (step === 'success') {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View entering={ZoomIn.springify()} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: isDark ? '#0C2A44' : '#EBF5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Ionicons name="checkmark-circle" size={60} color={ACCENT_CYAN} />
        </Animated.View>
        <Text style={{ fontSize: 26, fontWeight: '900', color: textPrimary, letterSpacing: -0.5 }}>Order Placed!</Text>
        <Text style={{ fontSize: 14, color: textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>Our pharmacist will review your request and send a quote shortly.</Text>
        <TouchableOpacity onPress={() => { setImageUri(null); setMessage(''); setStep('idle'); }} style={{ marginTop: 32, backgroundColor: PRIMARY_BLUE, paddingVertical: 18, paddingHorizontal: 48, borderRadius: 30, shadowColor: PRIMARY_BLUE, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
          <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bg }}>
        <HomeHeaderSkeleton />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
          <Skeleton width="100%" height={160} borderRadius={24} />
          <Skeleton width="100%" height={200} borderRadius={24} style={{ marginTop: 16 }} />
          <View style={{ marginTop: 24 }}>
            <PrescriptionCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Header */}
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 24, marginBottom: 25 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT_CYAN }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: ACCENT_CYAN, textTransform: 'uppercase', letterSpacing: 1 }}>MediCare Global</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: '900', color: textPrimary, letterSpacing: -1 }}>Hello, {firstName}</Text>
              <Text style={{ fontSize: 14, color: textSecondary, fontWeight: '500' }}>Your personalized health dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile' as any)}
              activeOpacity={0.8}
              style={{
                width: 54, height: 54,
                backgroundColor: cardBg,
                borderRadius: 22,
                borderWidth: 1.5,
                borderColor: isDark ? '#21262D' : '#F1F5F9',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2
              }}
            >
              {appUser?.photoURL?.startsWith('emoji:') ? (
                <Text style={{ fontSize: 24 }}>{appUser.photoURL.split(':')[1]}</Text>
              ) : appUser?.photoURL ? (
                <Image
                  source={{ uri: appUser.photoURL }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person-outline" size={24} color={textPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Card */}
        <Animated.View entering={FadeInDown.duration(600)} style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 28, padding: 20, borderWidth: 1, borderColor, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: PRIMARY_BLUE }}>Upload New Prescription</Text>
            <Text style={{ fontSize: 14, color: textSecondary, marginBottom: 20 }}>How would you like to submit your request?</Text>

            <View style={{ flexDirection: 'row', gap: 15 }}>
              <PressCard onPress={() => setStep('picker')} style={{ flex: 1 }}>
                <View style={{ padding: 18, borderRadius: 22, borderWidth: 2, borderColor: PRIMARY_BLUE, alignItems: 'center', backgroundColor: isDark ? '#0C2A44' : '#F0F9FF' }}>
                  <Ionicons name="scan-outline" size={32} color={PRIMARY_BLUE} />
                  <Text style={{ fontWeight: '800', marginTop: 10, color: PRIMARY_BLUE, fontSize: 14 }}>Scan Prescription</Text>
                </View>
              </PressCard>

              <PressCard onPress={() => { setOrderMethod('text'); setStep('modal1'); }} style={{ flex: 1 }}>
                <View style={{ padding: 18, borderRadius: 22, borderWidth: 2, borderColor: isDark ? '#21262D' : '#F1F5F9', alignItems: 'center', backgroundColor: cardBg }}>
                  <Ionicons name="create-outline" size={32} color={textSecondary} />
                  <Text style={{ fontWeight: '800', marginTop: 10, color: textSecondary, fontSize: 14 }}>Type Order</Text>
                </View>
              </PressCard>
            </View>

            {imageUri && orderMethod === 'upload' && (
              <Animated.View entering={FadeInUp} style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden' }}>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180 }} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 6 }}>
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>


        {/* Workflow Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <PrescriptionWorkflow />
        </Animated.View>

        {/* Tips Carousel */}
        <View style={{ paddingLeft: 24, marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: textPrimary, letterSpacing: -0.5, marginBottom: 4 }}>Wellness & Health Tips</Text>
          <Text style={{ fontSize: 13, color: textSecondary, marginBottom: 16, fontWeight: '500' }}>Quick guides for better treatment results</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, paddingRight: 24 }}>
            {[
              { icon: 'water-outline', title: 'Stay Hydrated', desc: 'Helps absorption.' },
              { icon: 'alarm-outline', title: 'Set Reminders', desc: 'Stay consistent.' },
              { icon: 'fast-food-outline', title: 'Take with Food', desc: 'Check labels.' },
            ].map((item, idx) => (
              <View key={idx} style={{ width: 160, backgroundColor: cardBg, borderRadius: 24, padding: 18, borderWidth: 1.5, borderColor: isDark ? '#21262D' : '#F1F5F9' }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isDark ? '#0C2A44' : '#F0F9FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name={item.icon as any} size={22} color={PRIMARY_BLUE} />
                </View>
                <Text style={{ fontWeight: '800', color: textPrimary, fontSize: 15, marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: textSecondary, lineHeight: 18 }}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Confirm Action Button */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => isFormValid && setStep('modal2')}
            disabled={!isFormValid}
            style={{
              backgroundColor: isFormValid ? PRIMARY_BLUE : (isDark ? '#21262D' : '#E2E8F0'),
              paddingVertical: 20,
              borderRadius: 24,
              alignItems: 'center',
              shadowColor: PRIMARY_BLUE,
              shadowOpacity: isFormValid ? 0.3 : 0,
              shadowRadius: 15,
              elevation: 6
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="cloud-upload" size={22} color={isFormValid ? '#FFF' : textSecondary} />
              <Text style={{ color: isFormValid ? '#FFF' : textSecondary, fontWeight: '800', fontSize: 17, letterSpacing: -0.2 }}>Submit Order</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>


      {/* Picker Modal */}
      <Modal visible={step === 'picker'} transparent animationType="fade" onRequestClose={() => setStep('idle')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: textPrimary, marginBottom: 20, textAlign: 'center' }}>Choose Image Source</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity onPress={() => pickImage('camera')} style={{ flex: 1, backgroundColor: isDark ? '#0C2A44' : '#F0F9FF', padding: 20, borderRadius: 22, alignItems: 'center', borderWidth: 2, borderColor: PRIMARY_BLUE }}>
                <Ionicons name="camera" size={32} color={PRIMARY_BLUE} />
                <Text style={{ fontWeight: '800', marginTop: 10, color: textPrimary }}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage('gallery')} style={{ flex: 1, backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', padding: 20, borderRadius: 22, alignItems: 'center', borderWidth: 2, borderColor: '#6366F1' }}>
                <Ionicons name="images" size={32} color="#6366F1" />
                <Text style={{ fontWeight: '800', marginTop: 10, color: textPrimary }}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setStep('idle')} style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: textSecondary, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Text Details Modal */}
      <Modal visible={step === 'modal1'} transparent animationType="slide" onRequestClose={() => setStep('idle')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: textPrimary }}>Medicine Details</Text>
              <TouchableOpacity onPress={() => setStep('idle')}><Ionicons name="close" size={24} color={textSecondary} /></TouchableOpacity>
            </View>
            <TextInput
              style={{ backgroundColor: isDark ? '#0D1117' : '#F8FAFC', borderRadius: 18, padding: 18, minHeight: 140, color: textPrimary, textAlignVertical: 'top', borderWidth: 1, borderColor: isDark ? '#21262D' : '#F1F5F9' }}
              placeholder="E.g., Panadol 500mg - 2 strips"
              multiline value={message} onChangeText={setMessage}
              placeholderTextColor={textSecondary}
              autoFocus
            />
            <TouchableOpacity onPress={() => message.trim().length > 0 && setStep('modal2')} style={{ marginTop: 24, backgroundColor: PRIMARY_BLUE, padding: 18, borderRadius: 18, alignItems: 'center', shadowColor: PRIMARY_BLUE, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 }}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>Next Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DeliveryModal
        visible={step === 'modal2'}
        loading={loading}
        progress={progress}
        isDark={isDark}
        onBack={() => setStep('idle')}
        onSubmit={handleSubmit}
      />
    </View>
  );
}