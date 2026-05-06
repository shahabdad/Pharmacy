import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../../global.css';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootNavigator() {
  const colorScheme = useColorScheme();
  const router      = useRouter();
  const segments    = useSegments();
  const { firebaseUser, appUser, isAdmin, loading } = useAuth();

  useEffect(() => {
    // Wait until auth is fully resolved (both firebase user AND appUser loaded)
    if (loading) return;
    // If firebase user exists but appUser not yet loaded, wait
    if (firebaseUser && !appUser) return;

    const inAuthGroup  = segments[0] === 'auth';
    const inAdminRoute = segments[0]?.startsWith('admin-');
    const inTabsRoute  = segments[0] === '(tabs)';

    if (!firebaseUser && !inAuthGroup) {
      // Not logged in → go to auth
      router.replace('/auth' as any);
    } else if (firebaseUser && appUser) {
      if (isAdmin) {
        // Admin should never be on user tabs or auth
        if (inAuthGroup || inTabsRoute) {
          router.replace('/admin-dashboard');
        }
      } else {
        // Regular user should never be on admin routes or auth
        if (inAdminRoute) {
          router.replace('/(tabs)');
        } else if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [loading, firebaseUser, appUser, isAdmin, segments]);

  // Show spinner while:
  // - auth state is loading, OR
  // - firebase user exists but appUser (role) not yet fetched
  if (loading || (firebaseUser && !appUser)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#111118' : '#fff' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"                options={{ headerShown: false }} />
        <Stack.Screen name="chat"                  options={{ headerShown: false }} />
        <Stack.Screen name="modal"                 options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="auth"                  options={{ headerShown: false }} />
        <Stack.Screen name="upload-prescription"   options={{ headerShown: false }} />
        <Stack.Screen name="admin-dashboard"       options={{ headerShown: false }} />
        <Stack.Screen name="admin-prescriptions"   options={{ headerShown: false }} />
        <Stack.Screen name="admin-orders"          options={{ headerShown: false }} />
        <Stack.Screen name="admin-chats"           options={{ headerShown: false }} />
        <Stack.Screen name="admin-chat-detail"     options={{ headerShown: false }} />
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
