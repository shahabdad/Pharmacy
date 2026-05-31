import { DeliveryModal } from '@/src/components/DeliveryModal';
import { useAuth } from '@/src/context/AuthContext';
import { orderService } from '@/src/services/orderService';
import { submitPrescriptionOrder } from '@/src/services/prescriptionService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View, Linking } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');
type Step = 'idle' | 'picker' | 'modal1' | 'modal2' | 'success';

// ─── Greeting helper ──────────────────────────────────────────────────────────
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Quick action item ────────────────────────────────────────────────────────
function QuickAction({
  icon, label, color, onPress, delay,
}: {
  icon: string; label: string; color: string;
  onPress: () => void; delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{
          backgroundColor: color,
          borderRadius: 20, paddingVertical: 18,
          paddingHorizontal: 12,
          alignItems: 'center', gap: 8,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
        }}
      >
        <Ionicons name={icon as any} size={22} color="#FFFFFF" />
        <Text style={{
          fontSize: 12, fontWeight: '800', color: '#FFFFFF',
          letterSpacing: -0.2, textAlign: 'center',
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  value, label, color,
}: { value: number; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 10, fontWeight: '600', color, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── How it works step ────────────────────────────────────────────────────────
function HowStep({
  num, icon, title, desc, color, T,
}: {
  num: number; icon: string; title: string;
  desc: string; color: string; T: any;
}) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: T.card,
      borderRadius: 24,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: T.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: T.shadowOpacity ?? 0.05,
      shadowRadius: 10,
      elevation: 2,
    }}>
      {/* Icon Box */}
      <View style={{
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: color,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>

      {/* Title */}
      <Text style={{
        fontSize: 11, fontWeight: '900', color: T.textPri,
        textAlign: 'center', marginBottom: 6,
        lineHeight: 16,
      }}>
        {num}. {title}
      </Text>

      {/* Desc */}
      <Text style={{
        fontSize: 10, lineHeight: 14, color: T.textSec,
        textAlign: 'center', opacity: 0.9,
      }}>
        {desc}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const { firebaseUser, appUser } = useAuth();
  const firstName = appUser?.name?.split(' ')[0] ?? 'there';

  const [step, setStep] = useState<Step>('idle');
  const [orderMethod, setOrderMethod] = useState<'upload' | 'text'>('upload');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, done: 0 });
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'MedicCare Pharmacy App',
      subtitle: 'Fast Medicine Delivery',
      description: 'Safe, quick, and reliable.',
    },
    {
      title: 'Easy Prescription Upload',
      subtitle: 'Upload and order in seconds.',
      description: '',
    },
    {
      title: 'Trusted Healthcare',
      subtitle: 'Quality medicines, delivered.',
      description: '',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const openWhatsApp = () => {
    const phoneNumber = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? '+923191796621'; // WhatsApp number loaded from .env
    const messageText = 'Hello MediCare Pharmacy! I would like to consult or order a prescription.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure WhatsApp is installed.');
    });
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  const T = {
    bg: dark ? '#1B2028' : '#F2F4F7', // Sleek mockup background colors
    card: dark ? '#12161A' : '#FFFFFF', // High fidelity card colors
    card2: dark ? '#1E2530' : '#F9FAFB',
    border: dark ? '#252D37' : '#E5E7EB',
    textPri: dark ? '#F9FAFB' : '#111827',
    textSec: dark ? '#9CA3AF' : '#4B5563',
    textMuted: dark ? '#6B7280' : '#9CA3AF',
    inputBg: dark ? '#12161A' : '#F9FAFB',
    shadowOpacity: dark ? 0 : 0.05,
  };

  // ── Real-time stats ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = orderService.listenToUserOrders(firebaseUser.uid, orders => {
      const active = orders.filter(o =>
        o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped'
      ).length;
      const done = orders.filter(o => o.status === 'delivered').length;
      setStats({ total: orders.length, active, done });
    });
    return () => unsub();
  }, [firebaseUser?.uid]);

  // ── Image picker ───────────────────────────────────────────────────────────
  async function pickImage(source: 'camera' | 'gallery') {
    setStep('idle');
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', `Allow ${source} access in Settings.`);
      return;
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
      setOrderMethod('upload');
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(address: string, phone: string, paymentMethod: string) {
    setLoading(true);
    setProgress(0);
    try {
      await submitPrescriptionOrder(
        {
          imageUri, message, address, phone, paymentMethod,
          userId: appUser?.uid ?? 'anon',
          userName: appUser?.name ?? 'User',
        },
        setProgress,
      );
      setStep('success');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  function reset() {
    setImageUri(null);
    setMessage('');
    setStep('idle');
    setOrderMethod('upload');
  }

  const isFormValid = orderMethod === 'upload' ? !!imageUri : message.trim().length > 0;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <View style={{
        flex: 1, backgroundColor: T.bg,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 32, paddingTop: insets.top,
      }}>
        <Animated.View entering={ZoomIn.springify()} style={{
          width: 110, height: 110, borderRadius: 34,
          backgroundColor: dark ? '#064E3B' : '#D1FAE5',
          alignItems: 'center', justifyContent: 'center', marginBottom: 28,
          shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3, shadowRadius: 24, elevation: 12,
        }}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(150).springify()} style={{
          fontSize: 28, fontWeight: '900', color: T.textPri,
          letterSpacing: -0.5, textAlign: 'center', marginBottom: 10,
        }}>
          Request Sent!
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(220).springify()} style={{
          fontSize: 14, color: T.textSec, textAlign: 'center',
          lineHeight: 22, marginBottom: 36, maxWidth: 280,
        }}>
          Our pharmacist will review your prescription and send you a quote via chat shortly.
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ width: '100%', gap: 12 }}>
          <TouchableOpacity
            onPress={openWhatsApp}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#25D366', borderRadius: 20,
              paddingVertical: 16, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: 10,
              shadowColor: '#25D366', shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Open WhatsApp Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={reset}
            activeOpacity={0.8}
            style={{
              backgroundColor: T.card2, borderRadius: 20,
              paddingVertical: 16, alignItems: 'center',
              borderWidth: 1, borderColor: T.border,
            }}
          >
            <Text style={{ color: T.textSec, fontWeight: '700', fontSize: 15 }}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ── Main Dashboard Screen ──────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: isFormValid ? 110 : 40,
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, marginTop: 12
        }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: T.textPri, letterSpacing: -0.5 }}>
              Hello, {firstName.toLowerCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile' as any)}
            activeOpacity={0.8}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: '#0F766E', // Green avatar bg like mockup
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: dark ? '#2A3543' : '#FFFFFF',
              overflow: 'hidden',
              shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
            }}
          >
            {appUser?.photoURL ? (
              <Image source={{ uri: appUser.photoURL }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Ionicons name="person" size={24} color="#FFFFFF" style={{ marginTop: 2 }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Mardan Location Indicator Pill */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: dark ? '#0F766E22' : '#0F766E10',
            borderColor: '#0F766E40',
            borderWidth: 1,
            borderRadius: 14,
            paddingVertical: 8,
            paddingHorizontal: 14,
            alignSelf: 'flex-start',
            marginBottom: 20,
            gap: 6,
          }}
        >
          <Ionicons name="location" size={14} color="#0F766E" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F766E' }}>
            Serving Mardan City Only 📍
          </Text>
        </Animated.View>

        {/* Featured Banner */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            marginBottom: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: dark ? 0.3 : 0.08,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={['#0B3D67', '#0E7C7C']} // Modern professional blue to teal gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 28,
              paddingHorizontal: 22,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Scooter Icon graphic */}
            <View style={{ position: 'relative', width: 90, height: 60, justifyContent: 'center' }}>
              {/* Speed lines */}
              <View style={{ position: 'absolute', left: 0, top: 18, width: 15, height: 2, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              <View style={{ position: 'absolute', left: 4, top: 26, width: 22, height: 2, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
              <View style={{ position: 'absolute', left: 2, top: 34, width: 12, height: 2, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />

              <Ionicons name="bicycle" size={46} color="#FFFFFF" style={{ marginLeft: 20 }} />
            </View>

            {/* Right: Text info */}
            <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3, marginBottom: 8 }}>
                {slides[activeSlide].title}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.95)', lineHeight: 24 }}>
                {slides[activeSlide].subtitle}
              </Text>
              {slides[activeSlide].description ? (
                <Text style={{ fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.82)', marginTop: 10, lineHeight: 20 }}>
                  {slides[activeSlide].description}
                </Text>
              ) : null}
            </View>
          </LinearGradient>

          {/* Slide Indicators inside the card bottom */}
          <View style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}>
            {slides.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveSlide(index)}
                activeOpacity={0.8}
                style={{
                  width: index === activeSlide ? 18 : 8,
                  height: 8,
                  borderRadius: 6,
                  backgroundColor: index === activeSlide ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: T.textPri, marginBottom: 14 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <QuickAction
              icon="cloud-upload"
              label="Upload RX"
              color="#0F4C81" // Custom premium deep blue
              onPress={() => setStep('picker')}
              delay={150}
            />
            <QuickAction
              icon="document-text"
              label="Type Order"
              color="#0D9488" // Custom premium emerald green
              onPress={() => { setOrderMethod('text'); setStep('modal1'); }}
              delay={200}
            />
            <QuickAction
              icon="logo-whatsapp"
              label="WhatsApp"
              color="#25D366" // Official WhatsApp Green
              onPress={openWhatsApp}
              delay={250}
            />
          </View>
        </View>

        {/* Attachment Previews */}
        {imageUri && orderMethod === 'upload' && (
          <Animated.View entering={FadeInUp.springify()} style={{
            borderRadius: 24, overflow: 'hidden', height: 180,
            position: 'relative', borderWidth: 1, borderColor: T.border,
            marginBottom: 28,
          }}>
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={{
                position: 'absolute', top: 12, right: 12,
                backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 6, zIndex: 2
              }}
            >
              <Ionicons name="close" size={18} color="#FFF" />
            </TouchableOpacity>
            <View style={{
              position: 'absolute', bottom: 12, left: 12,
              backgroundColor: '#004B87', paddingVertical: 6, paddingHorizontal: 12,
              borderRadius: 12, flexDirection: 'row', alignItems: 'center'
            }}>
              <Ionicons name="image" size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Prescription Attached</Text>
            </View>
          </Animated.View>
        )}

        {message.trim().length > 0 && orderMethod === 'text' && (
          <Animated.View entering={FadeInUp.springify()} style={{
            backgroundColor: T.card, borderRadius: 24, padding: 18,
            borderWidth: 1, borderColor: T.border, marginBottom: 28,
            position: 'relative'
          }}>
            <TouchableOpacity
              onPress={() => setMessage('')}
              style={{
                position: 'absolute', top: 12, right: 12,
                backgroundColor: dark ? '#21262D' : '#F1F5F9', borderRadius: 20, padding: 4, zIndex: 2
              }}
            >
              <Ionicons name="close" size={16} color={T.textSec} />
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: '#F59E0B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Order Details
            </Text>
            <Text style={{ fontSize: 14, color: T.textPri, lineHeight: 20, paddingRight: 20 }}>
              {message}
            </Text>
          </Animated.View>
        )}

        {/* How It Works */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: T.textPri, marginBottom: 14 }}>
            How It Works
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <HowStep
              num={1}
              icon="cloud-upload"
              title="Upload Prescription"
              desc="Take a picture to improve your picture tox."
              color="#0F4C81"
              T={T}
            />
            <HowStep
              num={2}
              icon="checkbox"
              title="Pharmacist Review"
              desc="Our certified pharmacist to integration delivery..."
              color="#0D9488"
              T={T}
            />
            <HowStep
              num={3}
              icon="bicycle"
              title="Fast Delivery"
              desc="Accept the quote to Fast your pharmacy delivery."
              color="#B45309"
              T={T}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Button */}
      {isFormValid && (
        <Animated.View entering={FadeInUp.springify()} style={{
          position: 'absolute', bottom: insets.bottom + 12, left: 16, right: 16,
          zIndex: 10, shadowColor: '#004B87', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35, shadowRadius: 16, elevation: 10
        }}>
          <TouchableOpacity
            onPress={() => setStep('modal2')}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#004B87', borderRadius: 20,
              paddingVertical: 16, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: 10
            }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Submit Order Details</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Picker Modal */}
      <Modal visible={step === 'picker'} transparent animationType="fade" onRequestClose={() => setStep('idle')}>
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center', alignItems: 'center', padding: 24
        }}>
          <Animated.View entering={ZoomIn.springify()} style={{
            backgroundColor: T.card, borderRadius: 28, padding: 28,
            width: '100%', maxWidth: 400, alignItems: 'center',
            borderWidth: 1, borderColor: T.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.textPri, marginBottom: 8 }}>
              Upload Prescription
            </Text>
            <Text style={{ fontSize: 14, color: T.textSec, marginBottom: 24, textAlign: 'center' }}>
              Select a source for your prescription image
            </Text>

            <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
              <TouchableOpacity
                onPress={() => pickImage('camera')}
                style={{
                  flex: 1, paddingVertical: 20, borderRadius: 22, alignItems: 'center',
                  backgroundColor: dark ? '#0C2A44' : '#F0F9FF', borderWidth: 1.5, borderColor: '#004B87'
                }}
              >
                <Ionicons name="camera" size={32} color="#004B87" />
                <Text style={{ fontWeight: '700', marginTop: 10, fontSize: 14, color: '#004B87' }}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => pickImage('gallery')}
                style={{
                  flex: 1, paddingVertical: 20, borderRadius: 22, alignItems: 'center',
                  backgroundColor: dark ? '#064E3B' : '#D1FAE5', borderWidth: 1.5, borderColor: '#10B981'
                }}
              >
                <Ionicons name="images" size={32} color="#10B981" />
                <Text style={{ fontWeight: '700', marginTop: 10, fontSize: 14, color: '#10B981' }}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setStep('idle')} style={{ marginTop: 24, paddingVertical: 12 }}>
              <Text style={{ color: T.textSec, fontWeight: '700', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Text Details Modal */}
      <Modal visible={step === 'modal1'} transparent animationType="fade" onRequestClose={() => setStep('idle')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{
            backgroundColor: T.card, borderRadius: 28,
            padding: 24, paddingBottom: insets.bottom + 24,
            width: '100%', maxWidth: 520, maxHeight: '90%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: T.textPri }}>Medicine Details</Text>
              <TouchableOpacity onPress={() => setStep('idle')} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={T.textSec} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={{
                backgroundColor: T.inputBg, borderRadius: 18, padding: 20, minHeight: 150,
                color: T.textPri, fontSize: 16, borderWidth: 1, borderColor: T.border,
                textAlignVertical: 'top'
              }}
              placeholder="E.g., Panadol 500mg - 2 strips..."
              placeholderTextColor={T.textMuted}
              multiline
              value={message}
              onChangeText={setMessage}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => message.trim().length > 0 && setStep('modal2')}
              style={{
                marginTop: 24, backgroundColor: '#004B87', padding: 18, borderRadius: 24,
                alignItems: 'center', opacity: message.trim().length > 0 ? 1 : 0.6
              }}
              disabled={message.trim().length === 0}
            >
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delivery details Modal */}
      <DeliveryModal
        visible={step === 'modal2'}
        loading={loading}
        progress={progress}
        isDark={dark}
        onBack={() => setStep('idle')}
        onSubmit={handleSubmit}
      />
    </View>
  );
}