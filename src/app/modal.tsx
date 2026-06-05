// import { Link } from 'expo-router';
// import { Text } from 'react-native';
// import { StyleSheet, View } from 'react-native';

// // import { ThemedText } from '@/components/themed-text';
// // import { View } from '@/components/themed-view';

// export default function ModalScreen() {
//   return (
//     <View style={styles.container}>
//       <Text >This is a modal</Text>
//       <Link href="/" dismissTo style={styles.link}>
//         <Text >Go to home screen</Text>
//       </Link>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   link: {
//     marginTop: 15,
//     paddingVertical: 15,
//   },
// });





import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert, Linking, Modal, Pressable,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
  useColorScheme, View, Dimensions
} from 'react-native';
import Animated, {
  FadeInDown, FadeInUp, ZoomIn,
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';

// Keep your existing imports for context/services
import { DeliveryModal } from '@/src/components/DeliveryModal';
import { useAuth } from '@/src/context/AuthContext';
import { submitPrescriptionOrder } from '@/src/services/prescriptionService';
import { PrescriptionWorkflow } from '@/src/components/PrescriptionWorkflow';
import { HomeHeaderSkeleton, PrescriptionCardSkeleton, Skeleton } from '@/src/components/Skeleton';
import { DEFAULT_SHOP } from '@/src/constants/shops';

type Step = 'idle' | 'modal1' | 'modal2' | 'success' | 'picker';

// --- Reusable Animated Pressable ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressCard({ onPress, children, style, disabled }: {
  onPress: () => void; children: React.ReactNode; style?: any; disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[animStyle, style]}
      onPressIn={() => { if (!disabled) scale.value = withSpring(0.97); }}
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
  const { appUser } = useAuth();
  const firstName = appUser?.name?.split(' ')[0] ?? 'Sarah';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // --- State Management ---
  const [orderMethod, setOrderMethod] = useState<'upload' | 'text'>('upload');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderId, setOrderId] = useState<string | null>(null);

  // --- Theme Config (Professional US-Based Palette) ---
  const theme = useMemo(() => ({
    primaryBlue: '#0F172A', // Slightly deeper, more corporate blue
    accentCyan: '#00B8D4',
    bg: isDark ? '#121212' : '#F4F7F9', // Very light grey-blue background for modern feel
    cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#1A1D1F',
    textSecondary: isDark ? '#A0A0A0' : '#6C757D',
    borderColor: isDark ? '#333333' : '#E9ECEF',
    successGreen: '#10B981',
    whatsAppGreen: '#25D366',
    shadowColor: isDark ? '#000000' : '#171a1f',
  }), [isDark]);

  // Initialize styles based on theme
  const styles = getStyles(theme, insets, isDark);

  useEffect(() => {
    // Clean up on unmount if needed
  }, []);

  // --- Camera & Gallery Logic ---
  async function pickImage(source: 'camera' | 'gallery') {
    setStep('idle');

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

  const handleSubmit = async (address: string, phone: string, paymentMethod: string) => {
    setLoading(true);
    try {
      const id = await submitPrescriptionOrder(
        { imageUri, message, address, phone, paymentMethod, userId: appUser?.uid ?? 'anon', userName: appUser?.name ?? 'User' },
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

  // --- Render Views ---

  if (step === 'success') {
    return (
      <View style={styles.successContainer}>
        <Animated.View entering={ZoomIn.springify()} style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={64} color={theme.accentCyan} />
        </Animated.View>
        <Text style={styles.successTitle}>Request Submitted!</Text>
        <Text style={styles.successBody}>Our pharmacist will review your prescription and contact you via chat shortly.</Text>
        <TouchableOpacity
          onPress={() => { setImageUri(null); setMessage(''); setStep('idle'); }}
          style={styles.successButton}
          activeOpacity={0.8}
        >
          <Text style={styles.successButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <HomeHeaderSkeleton />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 20, paddingTop: 20 }}>
          <Skeleton width="100%" height={180} borderRadius={24} />
          <Skeleton width="100%" height={120} borderRadius={24} />
          <View style={{ marginTop: 10 }}>
            <PrescriptionCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContentRow}>
            <View>
              <View style={styles.brandContainer}>
                <View style={styles.brandDot} />
                <Text style={styles.brandText}>MediCare Global</Text>
              </View>
              <Text style={styles.greetingText}>Hello, {firstName}</Text>
              <Text style={styles.subtitleText}>Your personalized health dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile' as any)}
              activeOpacity={0.8}
              style={styles.profileButton}
            >
              {appUser?.photoURL?.startsWith('emoji:') ? (
                <Text style={{ fontSize: 28 }}>{appUser.photoURL.split(':')[1]}</Text>
              ) : appUser?.photoURL ? (
                <Image source={{ uri: appUser.photoURL }} style={styles.profileImage} contentFit="cover" />
              ) : (
                <Ionicons name="person-outline" size={24} color={theme.textPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Action Section */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>New Request</Text>
          <Text style={styles.sectionSubtitle}>How would you like to submit your prescription?</Text>

          <View style={styles.actionGrid}>
            {/* Scan Rx Action */}
            <PressCard onPress={() => setStep('picker')} style={styles.actionCardWrapper}>
              {/* Using a View inside PressCard allows us to style the "pressed" state if needed, though PressCard handles scale */}
              <View style={[styles.actionCard, { backgroundColor: isDark ? '#0C2A44' : '#E6F0FF', borderColor: theme.primaryBlue }]}>
                <Ionicons name="scan-outline" size={30} color={theme.primaryBlue} />
                <Text style={[styles.actionCardLabel, { color: theme.primaryBlue }]}>Scan Rx</Text>
              </View>
            </PressCard>

            {/* Type Order Action */}
            <PressCard onPress={() => { setOrderMethod('text'); setStep('modal1'); }} style={styles.actionCardWrapper}>
              <View style={[styles.actionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <Ionicons name="create-outline" size={30} color={theme.textSecondary} />
                <Text style={[styles.actionCardLabel, { color: theme.textSecondary }]}>Type Order</Text>
              </View>
            </PressCard>

            {/* WhatsApp Action */}
            <PressCard
              onPress={() => {
                const num = DEFAULT_SHOP.whatsapp.replace(/[^0-9]/g, '');
                Linking.openURL(`https://wa.me/${num}`);
              }}
              style={styles.actionCardWrapper}
            >
              <View style={[styles.actionCard, { backgroundColor: isDark ? '#064E3B' : '#E8FDF0', borderColor: theme.whatsAppGreen }]}>
                <Ionicons name="logo-whatsapp" size={30} color={theme.whatsAppGreen} />
                <Text style={[styles.actionCardLabel, { color: '#059669' }]}>WhatsApp</Text>
              </View>
            </PressCard>
          </View>

          {/* Image Preview Area */}
          {imageUri && orderMethod === 'upload' && (
            <Animated.View entering={FadeInUp.springify()} style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
              <View style={styles.imagePreviewOverlay} />
              <TouchableOpacity onPress={() => setImageUri(null)} style={styles.closeImageButton}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.imagePreviewLabel}>
                <Ionicons name="image" size={14} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Prescription Attached</Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>


        {/* Workflow Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.sectionContainerNoPadding}>
          <PrescriptionWorkflow />
        </Animated.View>

        {/* Tips Carousel */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Wellness & Health Tips</Text>
          <Text style={styles.sectionSubtitle}>Quick guides for better treatment results</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsScrollContent}>
            {[
              { icon: 'water-outline', title: 'Stay Hydrated', desc: 'Helps absorption & recovery.' },
              { icon: 'alarm-outline', title: 'Set Reminders', desc: 'Consistency is key for meds.' },
              { icon: 'fast-food-outline', title: 'Take with Food', desc: 'Always check the label.' },
            ].map((item, idx) => (
              <View key={idx} style={styles.tipCard}>
                <View style={styles.tipIconWrapper}>
                  <Ionicons name={item.icon as any} size={22} color={theme.primaryBlue} />
                </View>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipDesc}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Fixed Bottom Submit Button Container */}
      <Animated.View entering={FadeInUp.delay(400)} style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={() => isFormValid && setStep('modal2')}
          disabled={!isFormValid}
          activeOpacity={0.85}
          style={[
            styles.submitButton,
            {
              backgroundColor: isFormValid ? theme.primaryBlue : (isDark ? '#333' : '#E2E8F0'),
              shadowOpacity: isFormValid ? 0.25 : 0,
            }
          ]}
        >
          <Ionicons name="cloud-upload-outline" size={22} color={isFormValid ? '#FFF' : theme.textSecondary} style={{ marginRight: 10 }} />
          <Text style={[styles.submitButtonText, { color: isFormValid ? '#FFF' : theme.textSecondary }]}>
            Submit Request
          </Text>
        </TouchableOpacity>
      </Animated.View>


      {/* --- Modals --- */}

      {/* Picker Modal (Center Fade) */}
      <Modal visible={step === 'picker'} transparent animationType="fade" onRequestClose={() => setStep('idle')}>
        <View style={styles.modalOverlayCenter}>
          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.pickerModalCard}>
            <Text style={styles.modalTitleCenter}>Upload Prescription</Text>
            <Text style={styles.modalSubtitleCenter}>Choose an image source</Text>

            <View style={styles.pickerButtonsRow}>
              <TouchableOpacity onPress={() => pickImage('camera')} style={[styles.pickerButton, { backgroundColor: isDark ? '#0C2A44' : '#F0F7FF', borderColor: theme.primaryBlue }]}>
                <Ionicons name="camera" size={32} color={theme.primaryBlue} />
                <Text style={[styles.pickerButtonText, { color: theme.primaryBlue }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage('gallery')} style={[styles.pickerButton, { backgroundColor: isDark ? '#1F1B3A' : '#F5F3FF', borderColor: '#8B5CF6' }]}>
                <Ionicons name="images" size={32} color="#8B5CF6" />
                <Text style={[styles.pickerButtonText, { color: '#8B5CF6' }]}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setStep('idle')} style={styles.pickerCancelButton}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Text Details Modal (Centered) */}
      <Modal visible={step === 'modal1'} transparent animationType="fade" onRequestClose={() => setStep('idle')}>
        <View style={styles.modalOverlayBottom}>
          <View style={styles.textModalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Medicine Details</Text>
              <TouchableOpacity onPress={() => setStep('idle')} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInputArea}
              placeholder="E.g., Panadol 500mg - 2 strips..."
              multiline
              value={message}
              onChangeText={setMessage}
              placeholderTextColor={theme.textSecondary}
              autoFocus
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={() => message.trim().length > 0 && setStep('modal2')}
              style={[styles.modalNextButton, { opacity: message.trim().length > 0 ? 1 : 0.6 }]}
              disabled={message.trim().length === 0}
            >
              <Text style={styles.modalNextButtonText}>Continue</Text>
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

// --- Stylesheet Generation Function ---
const getStyles = (theme: any, insets: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    paddingBottom: 120, // Space for fixed bottom button
  },
  // Success View
  successContainer: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: isDark ? 'rgba(0, 184, 212, 0.15)' : '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    maxWidth: '80%',
  },
  successButton: {
    marginTop: 40,
    backgroundColor: theme.primaryBlue,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: theme.primaryBlue,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  successButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Header
  headerContainer: {
    paddingTop: insets.top + 24,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accentCyan,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.accentCyan,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '800', // Slightly less aggressive than 900
    color: theme.textPrimary,
    letterSpacing: -1,
    lineHeight: 38,
  },
  subtitleText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  profileButton: {
    width: 50,
    height: 50,
    backgroundColor: theme.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.borderColor,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadowColor,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },

  // Sections generic
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 36,
  },
  sectionContainerNoPadding: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 20,
    fontWeight: '500',
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardWrapper: {
    flex: 1,
  },
  actionCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5, // slightly thinner border
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
  },
  actionCardLabel: {
    fontWeight: '700',
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
  },

  // Image Preview
  imagePreviewContainer: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)', // subtle overlay
  },
  closeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
  },
  imagePreviewLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: theme.primaryBlue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Tips Carousel
  tipsScrollContent: {
    gap: 16,
    paddingRight: 24,
  },
  tipCard: {
    width: 170,
    backgroundColor: theme.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.borderColor,
    // Softer shadow
    shadowColor: theme.shadowColor,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tipIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isDark ? '#0C2A44' : '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  tipTitle: {
    fontWeight: '700',
    color: theme.textPrimary,
    fontSize: 15,
    marginBottom: 6,
  },
  tipDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 19,
  },

  // Bottom Submit Button Container
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.cardBg,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: insets.bottom + 16,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
    // Subtle upward shadow for the fixed bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 28, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: theme.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    elevation: 6,
  },
  submitButtonText: {
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.2,
  },

  // --- Modals ---
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Picker Modal
  pickerModalCard: {
    backgroundColor: theme.cardBg,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitleCenter: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitleCenter: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  pickerButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  pickerButtonText: {
    fontWeight: '700',
    marginTop: 10,
    fontSize: 14,
  },
  pickerCancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  pickerCancelText: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },

  // Text Modal
  textModalContainer: {
    backgroundColor: theme.cardBg,
    borderRadius: 28,
    padding: 24,
    paddingBottom: insets.bottom + 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
  },  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  textInputArea: {
    backgroundColor: isDark ? '#121212' : '#F4F7F9',
    borderRadius: 18,
    padding: 20,
    minHeight: 150,
    color: theme.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  modalNextButton: {
    marginTop: 24,
    backgroundColor: theme.primaryBlue,
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: theme.primaryBlue,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  modalNextButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 17,
  },
});

