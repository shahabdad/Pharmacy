import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { auth } from '../../firebase/config';
import { Field } from './Field';
import { PressScale } from './PressScale';

// ─── Map every Firebase Auth error code to a friendly message ────────────────
function friendlyAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/user-not-found': 
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Contact support.';
    default:
      return 'Login failed. Please check your details and try again.';
  }
}

export function LoginForm() {
  const dark = useColorScheme() === 'dark';
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      // Success — AuthContext + _layout will handle navigation
    } catch (e: any) {
      setError(friendlyAuthError(e?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Field
        label="Email"
        icon="mail-outline"
        value={email}
        onChange={v => { setEmail(v); setError(''); }}
        placeholder="you@email.com"
        delay={200}
        keyboard="email-address"
      />
      <Field
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChange={v => { setPassword(v); setError(''); }}
        placeholder="Min. 6 characters"
        delay={260}
        secure
      />

      {/* Inline error banner */}
      {!!error && (
        <Animated.View
          entering={FadeInUp.duration(220)}
          style={{
            backgroundColor: dark ? '#450A0A' : '#FEF2F2',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: dark ? '#7F1D1D' : '#FECACA',
          }}
        >
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={{ fontSize: 13, color: dark ? '#FCA5A5' : '#DC2626', flex: 1, lineHeight: 18, fontWeight: '500' }}>
            {error}
          </Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(320).duration(400)}>
        <PressScale
          onPress={handleLogin}
          disabled={loading}
          style={{
            borderRadius: 18,
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: loading ? 0 : 0.28,
            shadowRadius: 16,
            elevation: loading ? 0 : 10,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              borderRadius: 18, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row',
              justifyContent: 'center', gap: 8,
              backgroundColor: loading ? '#C4B5FD' : '#0F172A',
            }}
          >
            <Ionicons
              name={loading ? 'hourglass-outline' : 'log-in-outline'}
              size={18}
              color="#fff"
            />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              {loading ? 'Logging in…' : 'Login'}
            </Text>
          </View>
        </PressScale>
      </Animated.View>
    </>
  );
}
