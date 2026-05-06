import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardEvent,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AnimatedRN, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  visible:   boolean;
  loading:   boolean;
  progress?: number;
  isDark?:   boolean;
  onBack:    () => void;
  onSubmit:  (address: string, phone: string) => void;
}

// ─── Theme (pure — no hooks) ──────────────────────────────────────────────────
function makeTheme(dark: boolean) {
  return {
    dark,
    overlay:      'rgba(0,0,0,0.65)',
    sheetBg:      dark ? '#161B22' : '#FFFFFF',
    handle:       dark ? '#30363D' : '#E2E8F0',
    title:        dark ? '#F0FDF4' : '#0F172A',
    subtitle:     dark ? '#6E7681' : '#94A3B8',
    label:        dark ? '#8B949E' : '#374151',
    inputBg:      dark ? '#0D1117' : '#F8FAFC',
    inputText:    dark ? '#E6EDF3' : '#1E293B',
    inputBorder:  dark ? '#21262D' : '#E2E8F0',
    inputFocus:   '#0D9488',
    inputError:   '#F87171',
    placeholder:  dark ? '#6E7681' : '#C7C7CC',
    progressBg:   dark ? '#21262D' : '#F1F5F9',
    progressFill: '#0D9488',
    backBg:       dark ? '#21262D' : '#F1F5F9',
    backText:     dark ? '#8B949E' : '#64748B',
    submitBg:     '#0D9488',
    stepDot:      dark ? '#21262D' : '#E2E8F0',
    stepActive:   '#0D9488',
    divider:      dark ? '#21262D' : '#F1F5F9',
  };
}

export function DeliveryModal({
  visible, loading, progress = 0, isDark = false, onBack, onSubmit,
}: Props) {
  const T = makeTheme(isDark);

  const [address,    setAddress]    = useState('');
  const [phone,      setPhone]      = useState('');
  const [errors,     setErrors]     = useState({ address: false, phone: false });
  const [addrFocus,  setAddrFocus]  = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);

  // Keyboard offset — slides the sheet up when keyboard appears
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      Animated.spring(keyboardOffset, {
        toValue: e.endCoordinates.height,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    };
    const onHide = () => {
      Animated.spring(keyboardOffset, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    };

    const s1 = Keyboard.addListener(showEvent, onShow);
    const s2 = Keyboard.addListener(hideEvent, onHide);
    return () => { s1.remove(); s2.remove(); };
  }, []);

  // Reset keyboard offset when modal closes
  useEffect(() => {
    if (!visible) {
      keyboardOffset.setValue(0);
      Keyboard.dismiss();
    }
  }, [visible]);

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%` as any, { duration: 300 }),
  }));

  function handleSubmit() {
    const e = { address: !address.trim(), phone: !phone.trim() };
    setErrors(e);
    if (e.address || e.phone) return;
    Keyboard.dismiss();
    onSubmit(address.trim(), phone.trim());
  }

  if (!visible) return null;

  return (
    <AnimatedRN.View
      entering={FadeIn.duration(200)}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: T.overlay,
        zIndex: 1000,
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop tap — dismiss */}
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); if (!loading) onBack(); }}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>

      {/* Sheet — slides up with keyboard */}
      <Animated.View style={{ transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }] }}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <AnimatedRN.View
            entering={SlideInDown.springify().damping(18)}
            style={{
              backgroundColor: T.sheetBg,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 20,
              paddingBottom: Platform.OS === 'ios' ? 40 : 28,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: T.dark ? 0.5 : 0.12,
              shadowRadius: 24,
              elevation: 24,
            }}
          >
            {/* Handle */}
            <View style={{
              width: 40, height: 4, borderRadius: 2,
              backgroundColor: T.handle,
              alignSelf: 'center', marginTop: 12, marginBottom: 20,
            }} />

            {/* Step dots */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
              <View style={{ height: 4, width: 20, borderRadius: 2, backgroundColor: T.stepDot }} />
              <View style={{ height: 4, width: 48, borderRadius: 2, backgroundColor: T.stepActive }} />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: T.title, marginBottom: 4, letterSpacing: -0.3 }}>
              Delivery details
            </Text>
            <Text style={{ fontSize: 13, color: T.subtitle, marginBottom: 24, lineHeight: 18 }}>
              Where should we deliver your order?
            </Text>

            {/* Address */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name="location-outline" size={13} color={T.label} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: T.label, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Delivery address
                </Text>
              </View>
              <View style={{
                backgroundColor: T.inputBg, borderRadius: 16,
                paddingHorizontal: 16, paddingVertical: 14,
                borderWidth: 1.5,
                borderColor: errors.address ? T.inputError : addrFocus ? T.inputFocus : T.inputBorder,
              }}>
                <TextInput
                  style={{ fontSize: 14, color: T.inputText, padding: 0 }}
                  placeholder="Street, city, area..."
                  placeholderTextColor={T.placeholder}
                  value={address}
                  onChangeText={v => { setAddress(v); setErrors(p => ({ ...p, address: false })); }}
                  onFocus={() => setAddrFocus(true)}
                  onBlur={() => setAddrFocus(false)}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
              {errors.address && (
                <Text style={{ fontSize: 11, color: T.inputError, marginTop: 4, marginLeft: 4 }}>
                  Address is required
                </Text>
              )}
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name="call-outline" size={13} color={T.label} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: T.label, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Phone number
                </Text>
              </View>
              <View style={{
                backgroundColor: T.inputBg, borderRadius: 16,
                paddingHorizontal: 16, paddingVertical: 14,
                borderWidth: 1.5,
                borderColor: errors.phone ? T.inputError : phoneFocus ? T.inputFocus : T.inputBorder,
              }}>
                <TextInput
                  style={{ fontSize: 14, color: T.inputText, padding: 0 }}
                  placeholder="+92 300 0000000"
                  placeholderTextColor={T.placeholder}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={v => { setPhone(v); setErrors(p => ({ ...p, phone: false })); }}
                  onFocus={() => setPhoneFocus(true)}
                  onBlur={() => setPhoneFocus(false)}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
              {errors.phone && (
                <Text style={{ fontSize: 11, color: T.inputError, marginTop: 4, marginLeft: 4 }}>
                  Phone number is required
                </Text>
              )}
            </View>

            {/* Upload progress */}
            {loading && (
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, color: T.subtitle, fontWeight: '600' }}>Uploading prescription…</Text>
                  <Text style={{ fontSize: 11, color: T.stepActive, fontWeight: '800' }}>{progress}%</Text>
                </View>
                <View style={{ height: 6, backgroundColor: T.progressBg, borderRadius: 3, overflow: 'hidden' }}>
                  <AnimatedRN.View style={[{ height: '100%', backgroundColor: T.progressFill, borderRadius: 3 }, progressStyle]} />
                </View>
              </View>
            )}

            <View style={{ height: 1, backgroundColor: T.divider, marginBottom: 16 }} />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => { Keyboard.dismiss(); onBack(); }}
                disabled={loading}
                style={{
                  flex: 1, backgroundColor: T.backBg,
                  borderRadius: 18, paddingVertical: 16,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 6,
                }}
              >
                <Ionicons name="chevron-back" size={16} color={T.backText} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: T.backText }}>Back</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2, backgroundColor: loading ? T.stepActive : T.submitBg,
                  borderRadius: 18, paddingVertical: 16,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 8,
                  shadowColor: T.submitBg,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name="rocket-outline" size={18} color="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Submit order</Text>
                    </>
                }
              </Pressable>
            </View>
          </AnimatedRN.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </AnimatedRN.View>
  );
}
