import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { auth, db } from '../../firebase/config';
import { Field } from './Field';
import { PressScale } from './PressScale';

function friendlyAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-up is not enabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network.';
    default:
      return 'Sign up failed. Please check your details and try again.';
  }
}

export function RegisterForm() {
  const dark = useColorScheme() === 'dark';
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [city,            setCity]            = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState<'user' | 'admin'>('user');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const clearError = () => setError('');

  const handleSignUp = async () => {
    setError('');

    if (!name.trim()) { setError('Please enter your full name.'); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address.'); return; }

    if (!phone.trim()) { setError('Please enter your phone number.'); return; }

    if (!city.trim()) { setError('Please enter your city.'); return; }
    if (!city.toLowerCase().includes('mardan')) {
      setError('Medicare is currently only available in Mardan. We are expanding soon!');
      return;
    }

    if (!password) { setError('Please enter a password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:       cred.user.uid,
        name:      name.trim(),
        email:     email.trim().toLowerCase(),
        phone:     phone.trim(),
        role,
        region:    city.trim().toLowerCase(),
        createdAt: new Date(),
      });
    } catch (e: any) {
      setError(friendlyAuthError(e?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Field label="Full Name" icon="person-outline"      value={name}            onChange={v => { setName(v);            clearError(); }} placeholder="Ali Hassan"        delay={200} />
      <Field label="Email"     icon="mail-outline"        value={email}           onChange={v => { setEmail(v);           clearError(); }} placeholder="you@email.com"     delay={240} keyboard="email-address" />
      <Field label="Phone"     icon="call-outline"        value={phone}           onChange={v => { setPhone(v);           clearError(); }} placeholder="+92 300 1234567"   delay={280} keyboard="phone-pad" />
      <Field label="City"      icon="location-outline"    value={city}            onChange={v => { setCity(v);            clearError(); }} placeholder="e.g. Mardan"       delay={320} />
      <Field label="Password"  icon="lock-closed-outline" value={password}        onChange={v => { setPassword(v);        clearError(); }} placeholder="Min. 6 characters" delay={360} secure />
      <Field label="Confirm"   icon="lock-closed-outline" value={confirmPassword} onChange={v => { setConfirmPassword(v); clearError(); }} placeholder="Repeat password"   delay={400} secure />

      {/* Role selector */}
      <Animated.View entering={FadeInDown.delay(460).duration(400)} style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4,
          color: dark ? '#8B949E' : '#4B5563',
        }}>
          I am a...
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['user', 'admin'] as const).map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              activeOpacity={0.85}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                paddingVertical: 14, borderRadius: 16,
                borderWidth: 2,
                backgroundColor: role === r ? '#0F172A' : (dark ? '#0D1117' : '#F9FAFB'),
                borderColor: role === r ? '#0F172A' : (dark ? '#21262D' : 'transparent'),
              }}
            >
              <Ionicons
                name={r === 'user' ? 'person' : 'storefront'}
                size={16}
                color={role === r ? '#fff' : '#9CA3AF'}
              />
              <Text style={{ fontSize: 12, fontWeight: '700', color: role === r ? '#fff' : '#9CA3AF' }}>
                {r === 'user' ? 'Patient' : 'Shop Admin'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

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

      {/* Submit button */}
      <Animated.View entering={FadeInDown.delay(540).duration(400)}>
        <PressScale
          onPress={handleSignUp}
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
              name={loading ? 'hourglass-outline' : 'person-add-outline'}
              size={18}
              color="#fff"
            />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </Text>
          </View>
        </PressScale>
      </Animated.View>
    </>
  );
}

