import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../firebase/config';

// Required by expo-auth-session to close the browser after redirect
WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID     ?? '796858068178-pmk6397vpgap5laluuqiocmkd488g6dj.apps.googleusercontent.com';
                                                                               
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '796858068178-0svnct6c3a1pdoecftn9l0bish57l9ji.apps.googleusercontent.com';
// ─── Animated press wrapper ───────────────────────────────────────────────────
function PressScale({
  children,
  onPress,
  style,
  disabled,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => { if (!disabled) scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onPress}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Input field ─────────────────────────────────────────────────────────────
function Field({
  label, icon, value, onChange, placeholder, keyboard, secure, delay,
}: {
  label: string; icon: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboard?: any; secure?: boolean; delay: number;
}) {
  const [show, setShow] = useState(false);
  const focused = value.length > 0;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} className="mb-4">
      <Text className="text-xs font-bold text-gray-600 mb-2 ml-1">{label}</Text>
      <View
        className="flex-row items-center bg-gray-50 rounded-2xl px-4 border-2"
        style={{ borderColor: focused ? '#6C63FF' : 'transparent' }}
      >
        <Ionicons name={icon as any} size={17} color={focused ? '#6C63FF' : '#9CA3AF'} />
        <TextInput
          className="flex-1 text-sm text-gray-800 py-3.5 ml-3"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard ?? 'default'}
          autoCapitalize="none"
          secureTextEntry={secure && !show}
          style={{ padding: 0 }}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} hitSlop={8}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={17} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SignUpScreen() {
  const insets = useSafeAreaInsets();

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState<'user' | 'admin'>('user');
  const [loading,         setLoading]         = useState(false);
  const [googleLoading,   setGoogleLoading]   = useState(false);

  // ── Google OAuth setup ────────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  // // Handle Google OAuth response
  useEffect(() => {
  if (response?.type === 'success') {
    const idToken = response.authentication?.idToken;

    if (!idToken) {
      Alert.alert('Error', 'Google ID token not found');
      setGoogleLoading(false);
      return;
    }

    handleGoogleCredential(idToken);
  }

  if (response?.type === 'error') {
    setGoogleLoading(false);
    Alert.alert('Google Sign-In Failed', response.error?.message ?? 'Unknown error');
  }

  if (response?.type === 'dismiss') {
    setGoogleLoading(false);
  }
}, [response]);
  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { id_token } = response.params;
  //     handleGoogleCredential(id_token);
  //   } else if (response?.type === 'error') {
  //     setGoogleLoading(false);
  //     Alert.alert('Google Sign-In Failed', response.error?.message ?? 'Unknown error');
  //   } else if (response?.type === 'dismiss') {
  //     setGoogleLoading(false);
  //   }
  // }, [response]);

  async function handleGoogleCredential(idToken: string) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(auth, credential);

      // Save/update user doc in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:       cred.user.uid,
        name:      cred.user.displayName ?? 'Google User',
        email:     cred.user.email ?? '',
        phone:     cred.user.phoneNumber ?? '',
        role:      'user',
        region:    'lahore',
        createdAt: new Date(),
      }, { merge: true }); // merge so existing users aren't overwritten

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign-In Failed', error.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await promptAsync();
  };

  // ── Email sign-up ─────────────────────────────────────────────────────────
  const handleSignUp = async () => {
    if (!name.trim())          { Alert.alert('Missing name', 'Please enter your full name.'); return; }
    if (!email.trim())         { Alert.alert('Missing email', 'Please enter your email.'); return; }
    if (password.length < 6)   { Alert.alert('Weak password', 'Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { Alert.alert('Mismatch', 'Passwords do not match.'); return; }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:       cred.user.uid,
        name:      name.trim(),
        email:     email.trim(),
        phone:     '',
        role,
        region:    'lahore',
        createdAt: new Date(),
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Animated.View
          entering={FadeInUp.springify().damping(16)}
          className="bg-violet-600 px-6 rounded-b-[44px] overflow-hidden"
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: 36,
            shadowColor: '#6C63FF',
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.28,
            shadowRadius: 28,
            elevation: 16,
          }}
        >
          <View className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/10" pointerEvents="none" />
          <View className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/30" pointerEvents="none" />

          <Animated.View entering={ZoomIn.delay(100).springify()} className="mb-5">
            <View
              className="w-14 h-14 bg-white rounded-[18px] items-center justify-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8 }}
            >
              <Ionicons name="medical" size={28} color="#6C63FF" />
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(120).duration(400)} className="text-white text-3xl font-black tracking-tight">
            Create account
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(180).duration(400)} className="text-violet-200 text-sm mt-1">
            Join FastMadic — medicine at your door
          </Animated.Text>
        </Animated.View>

        {/* Form */}
        <View className="px-6 pt-7">
          <Field label="Full Name" icon="person-outline"      value={name}            onChange={setName}            placeholder="Ali Hassan"        delay={200} />
          <Field label="Email"     icon="mail-outline"        value={email}           onChange={setEmail}           placeholder="you@email.com"     delay={260} keyboard="email-address" />
          <Field label="Password"  icon="lock-closed-outline" value={password}        onChange={setPassword}        placeholder="Min. 6 characters" delay={320} secure />
          <Field label="Confirm"   icon="lock-closed-outline" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password"    delay={380} secure />

          {/* Role */}
          <Animated.View entering={FadeInDown.delay(440).duration(400)} className="mb-6">
            <Text className="text-xs font-bold text-gray-600 mb-2 ml-1">I am a...</Text>
            <View className="flex-row gap-3">
              {(['user', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  activeOpacity={0.85}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border-2 ${
                    role === r ? 'bg-violet-600 border-violet-600' : 'bg-gray-50 border-transparent'
                  }`}
                  style={role === r ? { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 } : {}}
                >
                  <Ionicons name={r === 'user' ? 'person' : 'storefront'} size={16} color={role === r ? '#fff' : '#9CA3AF'} />
                  <Text className={`text-xs font-bold ${role === r ? 'text-white' : 'text-gray-400'}`}>
                    {r === 'user' ? 'Patient' : 'Shop Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Sign up button */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <PressScale
              onPress={handleSignUp}
              disabled={loading}
              style={{
                borderRadius: 18,
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: loading ? 0 : 0.28,
                shadowRadius: 16,
                elevation: loading ? 0 : 10,
                marginBottom: 16,
              }}
            >
              <View className={`rounded-[18px] py-4 items-center flex-row justify-center gap-2 ${loading ? 'bg-violet-300' : 'bg-violet-600'}`}>
                <Ionicons name={loading ? 'hourglass-outline' : 'person-add-outline'} size={18} color="#fff" />
                <Text className="text-white font-bold text-sm">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Text>
              </View>
            </PressScale>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(560).duration(400)} className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400 font-medium">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </Animated.View>

          {/* Google button */}
          <Animated.View entering={FadeInDown.delay(620).duration(400)}>
            <PressScale
              onPress={handleGoogle}
              disabled={googleLoading || !request}
              style={{
                borderRadius: 18,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
                marginBottom: 20,
              }}
            >
              <View className={`bg-white border border-gray-200 rounded-[18px] py-3.5 flex-row items-center justify-center gap-3 ${(googleLoading || !request) ? 'opacity-60' : ''}`}>
                {/* Google G */}
                <View className="w-6 h-6 items-center justify-center">
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#4285F4', lineHeight: 20 }}>G</Text>
                </View>
                <Text className="text-gray-700 font-bold text-sm">
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </Text>
              </View>
            </PressScale>
          </Animated.View>

          {/* Terms */}
          <Animated.View entering={FadeInDown.delay(680).duration(400)} className="mb-4">
            <Text className="text-[11px] text-gray-400 text-center leading-4">
              By signing up you agree to our{' '}
              <Text className="text-violet-600 font-semibold">Terms of Service</Text>
              {' '}and{' '}
              <Text className="text-violet-600 font-semibold">Privacy Policy</Text>
            </Text>
          </Animated.View>

          {/* Login link */}
          <Animated.View entering={FadeInDown.delay(740).duration(400)} className="items-center pb-6">
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text className="text-sm text-gray-400">
                Already have an account?{' '}
                <Text className="text-violet-600 font-bold">Sign in</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
