import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { auth, db } from '../../firebase/config';
import { PressScale } from './PressScale';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID     ?? '796858068178-pmk6397vpgap5laluuqiocmkd488g6dj.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '796858068178-0svnct6c3a1pdoecftn9l0bish57l9ji.apps.googleusercontent.com';

export function GoogleButton({ delay }: { delay: number }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        Alert.alert('Error', 'Google ID token not found');
        setGoogleLoading(false);
        return;
      }
      handleGoogleCredential(idToken);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Alert.alert('Google Sign-In Failed', response.error?.message ?? 'Unknown error');
    } else if (response?.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

  async function handleGoogleCredential(idToken: string) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(auth, credential);

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:       cred.user.uid,
        name:      cred.user.displayName ?? 'Google User',
        email:     cred.user.email ?? '',
        phone:     cred.user.phoneNumber ?? '',
        role:      'user',
        region:    'lahore',
        createdAt: new Date(),
      }, { merge: true });

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

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
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
        <View style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1, borderColor: '#E5E7EB',
          borderRadius: 18, paddingVertical: 14,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
          opacity: (googleLoading || !request) ? 0.6 : 1,
        }}>
          <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#4285F4', lineHeight: 20 }}>G</Text>
          </View>
          <Text style={{ color: '#374151', fontWeight: '700', fontSize: 14 }}>
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </Text>
        </View>
      </PressScale>
    </Animated.View>
  );
}

