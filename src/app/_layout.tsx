import { AuthProvider, useAuth } from '../context/AuthContext';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../../global.css';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function AppNavigation() {
  const { firebaseUser, appUser, isAdmin, loading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (navigationState?.key) {
      setIsReady(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    if (!isReady || loading) return;
    if (firebaseUser && !appUser) return;

    const inAuthGroup = segments[0] === 'auth';
    const inAdminRoute = segments[0]?.startsWith('admin-');

    if (!firebaseUser) {
      if (!inAuthGroup) {
        router.replace('/auth');
      }
    } else if (appUser) {
      if (isAdmin) {
        if (inAuthGroup || segments[0] === '(tabs)' || !segments[0]) {
          router.replace('/admin-dashboard');
        }
      } else {
        if (inAdminRoute || inAuthGroup) {
          router.replace('/');
        }
      }
    }
  }, [isReady, loading, firebaseUser, appUser, isAdmin, segments]);

  if (!isReady || loading || (firebaseUser && !appUser)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#0D1117' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#004B87" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="upload-prescription" />
        <Stack.Screen name="admin-dashboard" />
        <Stack.Screen name="admin-prescriptions" />
        <Stack.Screen name="admin-orders" />
        <Stack.Screen name="admin-chats" />
        <Stack.Screen name="admin-chat-detail" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="help" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}
