import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../../global.css';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Inner component that can use the auth context
function RootNavigator() {
  const colorScheme = useColorScheme();
  const router      = useRouter();
  const segments    = useSegments();
  const { firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'signup';
    if (!firebaseUser && !inAuthGroup) {
      // router.replace('/signup');
    } else if (firebaseUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [loading, firebaseUser, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"              options={{ headerShown: false }} />
        <Stack.Screen name="modal"               options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="signup"              options={{ headerShown: false }} />
        <Stack.Screen name="upload-prescription" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
