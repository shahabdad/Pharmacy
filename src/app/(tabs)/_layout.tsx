import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Text, View } from 'react-native';

import { ACCENT, INACTIVE_COLOR } from '@/constants/theme';

type TabItem = {
  name: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  { name: 'index',        label: 'Home',    activeIcon: 'home',        inactiveIcon: 'home-outline' },
  { name: 'chat',         label: 'Chat',    activeIcon: 'chatbubble',  inactiveIcon: 'chatbubble-outline' },
  { name: 'prescription', label: 'Rx',      activeIcon: 'document',    inactiveIcon: 'document-outline' },
  { name: 'orders',       label: 'Orders',  activeIcon: 'cart',        inactiveIcon: 'cart-outline' },
  { name: 'profile',      label: 'Profile', activeIcon: 'person',      inactiveIcon: 'person-outline' },
];

function TabIcon({
  focused,
  activeIcon,
  inactiveIcon,
  label,
}: {
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const scale       = useRef(new Animated.Value(1)).current;
  const pillWidth   = useRef(new Animated.Value(focused ? 52 : 40)).current;
  const dotScale    = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, tension: 300, friction: 7 }),
        Animated.spring(scale, { toValue: 1,   useNativeDriver: true, tension: 300, friction: 7 }),
      ]).start();
      Animated.parallel([
        Animated.spring(pillWidth,   { toValue: 52, useNativeDriver: false, tension: 120, friction: 10 }),
        Animated.timing(pillOpacity, { toValue: 1,  useNativeDriver: false, duration: 200 }),
        Animated.spring(dotScale,    { toValue: 1,  useNativeDriver: true,  tension: 200, friction: 8 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(pillWidth,   { toValue: 40, useNativeDriver: false, tension: 120, friction: 10 }),
        Animated.timing(pillOpacity, { toValue: 0,  useNativeDriver: false, duration: 150 }),
        Animated.spring(dotScale,    { toValue: 0,  useNativeDriver: true,  tension: 200, friction: 8 }),
      ]).start();
    }
  }, [focused]);

  // ✅ Derived colors — single source of truth
  const iconColor  = focused ? '#ffffff' : INACTIVE_COLOR;
  const labelColor = focused ? ACCENT    : INACTIVE_COLOR;

  return (
    <View className="items-center justify-center gap-[3px] pt-1.5">
      <Animated.View
        style={{
          width: pillWidth,
          backgroundColor: pillOpacity.interpolate({
            inputRange: [0, 1],
            // outputRange: ['transparent', ACCENT],
              outputRange: ['rgba(108,99,255,0)', 'rgba(108,99,255,1)'],
          }),
          shadowColor: ACCENT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: focused ? 0.3 : 0,
          shadowRadius: 10,
          elevation: focused ? 8 : 0,
        }}
        className="h-[30px] rounded-xl items-center justify-center overflow-hidden"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          {/* ✅ iconColor drives both active and inactive states */}
          <Ionicons
            name={focused ? activeIcon : inactiveIcon}
            size={22}
            color={iconColor}
          />
        </Animated.View>
      </Animated.View>

      {/* ✅ labelColor drives both active and inactive states */}
      <Text
        className="text-[9px] font-semibold"
        style={{ color: labelColor }}
      >
        {label}
      </Text>

      <Animated.View
        className="w-1 h-1 rounded-full"
        style={{
          backgroundColor: ACCENT,
          transform: [{ scale: dotScale }],
          opacity: dotScale,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 26 : 16,
          left: 16,
          right: 16,
          height: 62,
          borderRadius: 26,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 24,
          shadowColor: '#6C63FF',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        // ✅ Also set these so expo-router's own tint doesn't override anything
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                activeIcon={tab.activeIcon}
                inactiveIcon={tab.inactiveIcon}
                label={tab.label}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}