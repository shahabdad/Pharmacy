import { useAuth } from '@/src/context/AuthContext';
import { prescriptionService } from '@/src/services/prescriptionService';
import { Prescription, PrescriptionStatus } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
    Linking,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  PrescriptionStatus,
  {
    label: string;
    icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
    color: string;
    bg: string;
    darkBg: string;
    bar: string;
    step: number;
    desc: string;
  }
> = {
  pending:   { label: 'Reviewing',  icon: 'time',             color: '#0F766E', bg: '#F0FDFA', darkBg: '#134E4A', bar: '#0D9488', step: 0, desc: 'Our pharmacist is currently reviewing your prescription.' },
  quoted:    { label: 'To Pay',     icon: 'wallet',           color: '#0369A1', bg: '#F0F9FF', darkBg: '#0C4A6E', bar: '#0284C7', step: 1, desc: 'Review the quote and proceed with the payment.' },
  approved:  { label: 'Approved',   icon: 'checkmark-circle', color: '#059669', bg: '#ECFDF5', darkBg: '#064E3B', bar: '#10B981', step: 2, desc: 'Payment received! Your medicines are being prepared.' },
  delivered: { label: 'Delivered',  icon: 'cube',             color: '#4338CA', bg: '#EEF2FF', darkBg: '#1E1B4B', bar: '#6366F1', step: 3, desc: 'The order has been successfully delivered to your address.' },
  rejected:  { label: 'Declined',   icon: 'alert-circle',     color: '#E11D48', bg: '#FFF1F2', darkBg: '#4C0519', bar: '#F43F5E', step: -1, desc: 'Unfortunately, this prescription could not be processed.' },
};

const STEPS = ['Sent', 'Quote', 'Paid', 'Ready'];

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const { appUser } = useAuth();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const T = {
    bg: dark ? '#0D1117' : '#F2F4F7',
    card: dark ? '#161B22' : '#FFFFFF',
    border: dark ? '#21262D' : '#E5E7EB',
    textPri: dark ? '#F0F6FC' : '#111827',
    textSec: dark ? '#8B949E' : '#4B5563',
    textMuted: dark ? '#6E7681' : '#9CA3AF',
    divider: dark ? '#21262D' : '#F1F5F9',
  };

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getPrescription(id as string);
      setPrescription(data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load prescription details.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? '+923191796621';
    const message = `Hello, I'm inquiring about my prescription #${id?.slice(-6).toUpperCase()}.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp not found.'));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={{ marginTop: 12, color: T.textSec, fontWeight: '600' }}>Loading details...</Text>
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
        <Ionicons name="alert-circle-outline" size={64} color={T.textMuted} />
        <Text style={{ color: T.textPri, fontSize: 18, fontWeight: '800', marginTop: 16 }}>Record Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#0F766E', borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = STATUS_CFG[prescription.status];
  const imageUri = (prescription.imageURL || prescription.imageUrl || '').trim() || null;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Sticky Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: T.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: T.border,
        zIndex: 10,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: dark ? '#21262D' : '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={22} color={T.textPri} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: T.textPri }}>Prescription Details</Text>
          <Text style={{ fontSize: 11, color: T.textMuted, fontWeight: '700' }}>#{prescription.id.slice(-8).toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={openWhatsApp} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#25D366' + '22', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Status Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{
          backgroundColor: T.card,
          padding: 24,
          marginBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <View style={{
              width: 56, height: 56, borderRadius: 18,
              backgroundColor: dark ? cfg.darkBg : cfg.bg,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: cfg.color + '22',
            }}>
              <Ionicons name={cfg.icon} size={28} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: cfg.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                Current Status
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '900', color: T.textPri, letterSpacing: -0.5 }}>
                {cfg.label}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 14, color: T.textSec, lineHeight: 22, marginBottom: 24 }}>
            {cfg.desc}
          </Text>

          {/* Progress Tracker */}
          {prescription.status !== 'rejected' && (
            <View>
              <View style={{
                height: 6, borderRadius: 3,
                backgroundColor: dark ? '#21262D' : '#F1F5F9',
                overflow: 'hidden',
                marginBottom: 10,
              }}>
                <View style={{
                  height: '100%', borderRadius: 3,
                  backgroundColor: cfg.bar,
                  width: `${Math.max(((cfg.step + 1) / STEPS.length) * 100, 10)}%`,
                }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {STEPS.map((label, i) => (
                  <Text key={label} style={{
                    fontSize: 10,
                    fontWeight: i <= cfg.step ? '800' : '600',
                    color: i <= cfg.step ? cfg.color : T.textMuted,
                    textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center',
                    flex: 1,
                    opacity: i <= cfg.step ? 1 : 0.6,
                  }}>
                    {label}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Quote Section */}
        {prescription.quoteAmount && (
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{
            backgroundColor: T.card,
            padding: 24,
            marginBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: T.border,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Pricing Details
            </Text>
            <View style={{ 
                backgroundColor: dark ? '#0F766E22' : '#F0FDFA', 
                borderRadius: 20, padding: 20, 
                borderWidth: 1, borderColor: '#0F766E33',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <View>
                    <Text style={{ fontSize: 13, color: '#0F766E', fontWeight: '700', marginBottom: 2 }}>Quote Amount</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F766E' }}>Rs.</Text>
                        <Text style={{ fontSize: 32, fontWeight: '900', color: T.textPri, letterSpacing: -1 }}>
                            {prescription.quoteAmount.toLocaleString()}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={{
                    backgroundColor: '#0F766E',
                    paddingHorizontal: 20, paddingVertical: 12,
                    borderRadius: 14, shadowColor: '#0F766E', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
                }}>
                    <Text style={{ color: '#fff', fontWeight: '800' }}>Pay Now</Text>
                </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Image Section */}
        {imageUri && (
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{
            backgroundColor: T.card,
            padding: 24,
            marginBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: T.border,
          }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Prescription Document
            </Text>
            <TouchableOpacity activeOpacity={0.9} style={{
                width: '100%', height: 300, borderRadius: 24, overflow: 'hidden',
                backgroundColor: T.divider, borderWidth: 1, borderColor: T.border,
            }}>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }} />
                <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 12 }}>
                    <Ionicons name="expand" size={20} color="#111827" />
                </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Content Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={{
          backgroundColor: T.card,
          padding: 24,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
        }}>
          {prescription.message && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Ionicons name="person-outline" size={16} color="#0F766E" />
                <Text style={{ fontSize: 12, fontWeight: '800', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Your Message
                </Text>
              </View>
              <Text style={{ fontSize: 15, color: T.textPri, lineHeight: 24 }}>{prescription.message}</Text>
            </View>
          )}

          {prescription.adminMessage && (
            <View style={{ 
                backgroundColor: dark ? '#21262D' : '#F8FAFC', 
                borderRadius: 20, padding: 16,
                borderLeftWidth: 4, borderLeftColor: '#0F766E'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#0F766E" />
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F766E', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Pharmacist Note
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: T.textSec, lineHeight: 22 }}>{prescription.adminMessage}</Text>
            </View>
          )}
          
          <View style={{ height: 1, backgroundColor: T.divider, marginVertical: 24 }} />

          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: T.textMuted, fontWeight: '600' }}>Patient Name</Text>
                <Text style={{ color: T.textPri, fontWeight: '800' }}>{prescription.userName || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: T.textMuted, fontWeight: '600' }}>Contact Phone</Text>
                <Text style={{ color: T.textPri, fontWeight: '800' }}>{prescription.phone || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: T.textMuted, fontWeight: '600' }}>Created On</Text>
                <Text style={{ color: T.textPri, fontWeight: '800' }}>{new Date(prescription.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: T.textMuted, fontWeight: '600' }}>Delivery Address</Text>
                <Text style={{ color: T.textPri, fontWeight: '800', textAlign: 'right', flex: 1, marginLeft: 20 }}>{prescription.address || 'N/A'}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={{
        position: 'absolute',
        bottom: insets.bottom + 16,
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 12,
      }}>
        <TouchableOpacity 
            onPress={() => router.push(`/chat?prescriptionId=${prescription.id}` as any)}
            style={{
                flex: 1, height: 60, borderRadius: 20,
                backgroundColor: T.card, borderWidth: 1, borderColor: T.border,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
            }}
        >
            <Ionicons name="chatbubbles-outline" size={22} color="#0F766E" />
            <Text style={{ color: '#0F766E', fontWeight: '800', fontSize: 15 }}>Chat Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            onPress={openWhatsApp}
            style={{
                flex: 1.2, height: 60, borderRadius: 20,
                backgroundColor: '#0F4C81',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                shadowColor: '#0F4C81', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8
            }}
        >
            <Ionicons name="call" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Contact Pharmacy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
