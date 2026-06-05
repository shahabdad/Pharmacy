import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, View, TouchableOpacity, Platform } from 'react-native';

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Professional mockup colors
  const T = {
    bg: isDark ? '#1B2028' : '#F2F4F7', // screen background color
    tabBg: isDark ? '#12161A' : '#FFFFFF',
    border: isDark ? '#252D37' : '#E5E7EB',
    active: isDark ? '#10B981' : '#0F766E', // Green/Teal highlight like mockup
    inactive: isDark ? '#6B7280' : '#9CA3AF',
  };

  const tabBarStyle = {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: T.tabBg,
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDark ? 0.15 : 0.04,
    shadowRadius: 12,
    elevation: 8,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarActiveTintColor: T.active,
        tabBarInactiveTintColor: T.inactive,
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? T.active : T.inactive}
            />
          ),
        }}
      />

      {/* 2. Chat / Quotes List Tab (renders as a Document Icon like the mockup!) */}
      <Tabs.Screen
        name="chat"
        options={{
          // Hide tab bar on the actual chat thread screen if needed, but display on listing
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={24}
              color={focused ? T.active : T.inactive}
            />
          ),
        }}
      />

      {/* 3. Scooter FAB Tab (Floating Action Button in the center!) */}
      <Tabs.Screen
        name="prescription"
        options={{
          tabBarIcon: () => (
            <View style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? -38 : -32, // Float above the tab bar!
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#0F766E', // Emerald Green FAB like mockup
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 5,
              borderColor: T.bg, // Thick border matches background color to create natural cutout look
              shadowColor: '#0F766E',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}>
              <Ionicons name="bicycle" size={26} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      {/* 4. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={focused ? T.active : T.inactive}
            />
          ),
        }}
      />
    </Tabs>
  );
}
