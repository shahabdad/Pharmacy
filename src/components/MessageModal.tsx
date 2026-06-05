import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardEvent,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
    useColorScheme,
} from 'react-native';
import AnimatedRN, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface Props {
  visible:  boolean;
  message:  string;
  onChange: (v: string) => void;
  onNext:   () => void;
  onCancel: () => void;
}

/**
 * MessageModal — absolute overlay (no RN Modal) + Keyboard listener
 * so the sheet slides up when the keyboard appears on both iOS & Android.
 */
export function MessageModal({ visible, message, onChange, onNext, onCancel }: Props) {
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const dark = useColorScheme() === 'dark';

  // ── Theme ──────────────────────────────────────────────────────────────────
  const T = {
    sheetBg:      dark ? '#161B22' : '#FFFFFF',
    handle:       dark ? '#30363D' : '#E2E8F0',
    title:        dark ? '#F0F6FC' : '#0F172A',
    subtitle:     dark ? '#6E7681' : '#94A3B8',
    label:        dark ? '#8B949E' : '#374151',
    inputBg:      dark ? '#0D1117' : '#F8FAFC',
    inputText:    dark ? '#E6EDF3' : '#1E293B',
    inputBorder:  dark ? '#21262D' : '#E2E8F0',
    placeholder:  dark ? '#6E7681' : '#C7C7CC',
    counter:      dark ? '#6E7681' : '#94A3B8',
    cancelBg:     dark ? '#21262D' : '#F1F5F9',
    cancelText:   dark ? '#8B949E' : '#64748B',
    stepDot:      dark ? '#21262D' : '#E2E8F0',
  };

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

  useEffect(() => {
    if (!visible) {
      keyboardOffset.setValue(0);
      Keyboard.dismiss();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatedRN.View
      entering={FadeIn.duration(180)}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.55)',
      }}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onCancel(); }}>
        <View style={{ flex: 1, width: '100%' }} />
      </TouchableWithoutFeedback>

      {/* Sheet slides up with keyboard */}
      <Animated.View style={{ transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }] }}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <AnimatedRN.View
            entering={SlideInDown.springify().damping(18)}
            style={{
              backgroundColor: T.sheetBg,
              borderRadius: 28,
              width: '100%',
              maxWidth: 520,
              paddingHorizontal: 20,
              paddingBottom: Platform.OS === 'ios' ? 40 : 28,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: dark ? 0.4 : 0.1, shadowRadius: 20, elevation: 20,
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
              <View style={{ height: 5, width: 48, borderRadius: 3, backgroundColor: '#0F172A' }} />
              <View style={{ height: 5, width: 20, borderRadius: 3, backgroundColor: T.stepDot }} />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: T.title, marginBottom: 4, letterSpacing: -0.3 }}>
              Add a message
            </Text>
            <Text style={{ fontSize: 13, color: T.subtitle, marginBottom: 20, lineHeight: 18 }}>
              Optional note for the pharmacist
            </Text>

            <Text style={{ fontSize: 11, fontWeight: '700', color: T.label, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Message (optional)
            </Text>
            <View style={{
              backgroundColor: T.inputBg, borderRadius: 16,
              paddingHorizontal: 14, paddingVertical: 12,
              borderWidth: 1.5,
              borderColor: message.length > 0 ? '#0F172A' : T.inputBorder,
              marginBottom: 6,
            }}>
              <TextInput
                style={{
                  fontSize: 14, color: T.inputText, padding: 0,
                  minHeight: 80, textAlignVertical: 'top', lineHeight: 22,
                }}
                multiline
                numberOfLines={4}
                maxLength={200}
                placeholder="e.g. Please include generic alternatives..."
                placeholderTextColor={T.placeholder}
                value={message}
                onChangeText={onChange}
                returnKeyType="done"
              />
            </View>
            <Text style={{ fontSize: 10, color: T.counter, textAlign: 'right', marginBottom: 20 }}>
              {message.length}/200
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => { Keyboard.dismiss(); onCancel(); }}
                style={{
                  flex: 1, backgroundColor: T.cancelBg,
                  borderRadius: 18, paddingVertical: 15,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: T.cancelText }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => { Keyboard.dismiss(); onNext(); }}
                style={{
                  flex: 2, backgroundColor: '#0F172A',
                  borderRadius: 18, paddingVertical: 15,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 8,
                  shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            </View>
          </AnimatedRN.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </AnimatedRN.View>
  );
}

