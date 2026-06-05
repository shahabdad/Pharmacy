import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme, BackHandler, ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import '../../global.css';
import { AuthProvider, useAuth } from '../context/AuthContext';

function NavigationLayout() {
  const isDark = useColorScheme() === 'dark';
  const segments = useSegments();
  const router = useRouter();
  const { appUser, loading } = useAuth();

  // Prevent GO_BACK warning when no screens in stack (e.g., Android hardware back)
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => subscription.remove();
  }, []);

  // Automatic routing redirect based on auth state and role
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isAdminScreen = segments[0] && (
      segments[0].startsWith('admin') ||
      segments[0] === 'reports'
    );

    if (!appUser && !inAuthGroup) {
      // Unauthenticated user -> redirect to sign-in page
      router.replace('/auth');
    } else if (appUser) {
      if (appUser.role === 'admin') {
        // Admin user -> redirect to admin dashboard if on auth screen or normal tab space
        if (inAuthGroup || !segments[0] || segments[0] === '(tabs)') {
          router.replace('/admin-dashboard');
        }
      } else {
        // Patient user -> redirect to home page if on auth screen or attempting to view admin screens
        if (inAuthGroup || isAdminScreen) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [appUser, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0D1117' : '#F8FAFC' }}>
        <ActivityIndicator size="large" color={isDark ? '#0F172A' : '#004B87'} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarStyle: isDark ? 'light' : 'dark',
      }}
    />
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <NavigationLayout />
    </AuthProvider>
  );
}

