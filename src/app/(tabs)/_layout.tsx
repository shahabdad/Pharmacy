import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, useColorScheme, View } from 'react-native';

// ─────────────────────────────────────────────
// Color tokens — single source of truth
// ─────────────────────────────────────────────
const ACCENT            = '#000000';
const ACCENT_DARK       = '#A09AFF';
const ICON_ACTIVE_LIGHT = '#FFFFFF';
const ICON_ACTIVE_DARK  = '#FFFFFF';
const INACTIVE_LIGHT    = '#9A9A9A';
const INACTIVE_DARK     = '#6B6B7A';

const TAB_BG_LIGHT      = '#FFFFFF';
const TAB_BG_DARK       = '#111118';
const SHADOW_LIGHT      = '#6C63FF';
const SHADOW_DARK       = '#000000';

// ─────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────
type TabItem = {
  name: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  { name: 'index',        label: 'Home',    activeIcon: 'home',        inactiveIcon: 'home-outline'        },
  { name: 'chat',         label: 'Chat',    activeIcon: 'chatbubble',  inactiveIcon: 'chatbubble-outline'  },
  { name: 'prescription', label: 'Rx',      activeIcon: 'document',    inactiveIcon: 'document-outline'    },  { name: 'profile',      label: 'Profile', activeIcon: 'person',      inactiveIcon: 'person-outline'      },
];

// ─────────────────────────────────────────────
// TabIcon
// ─────────────────────────────────────────────
function TabIcon({
  focused,
  activeIcon,
  inactiveIcon,
  label,
  isDark,
}: {
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  isDark: boolean;
}) {
  const scale       = useRef(new Animated.Value(1)).current;
  const pillWidth   = useRef(new Animated.Value(focused ? 52 : 40)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const dotScale    = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, tension: 300, friction: 7 }),
        Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 7 }),
      ]).start();
      Animated.parallel([
        Animated.spring(pillWidth,   { toValue: 52, useNativeDriver: false, tension: 120, friction: 10 }),
        Animated.timing(pillOpacity, { toValue: 1,  useNativeDriver: false, duration: 200 }),
        Animated.spring(dotScale,    { toValue: 1,  useNativeDriver: true,  tension: 200, friction: 8  }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(pillWidth,   { toValue: 40, useNativeDriver: false, tension: 120, friction: 10 }),
        Animated.timing(pillOpacity, { toValue: 0,  useNativeDriver: false, duration: 150 }),
        Animated.spring(dotScale,    { toValue: 0,  useNativeDriver: true,  tension: 200, friction: 8  }),
      ]).start();
    }
  }, [focused]);

  // Derived colors — single source of truth, theme-aware
  const accent      = isDark ? ACCENT_DARK       : ACCENT;
  const iconColor   = focused
    ? (isDark ? ICON_ACTIVE_DARK  : ICON_ACTIVE_LIGHT)
    : (isDark ? INACTIVE_DARK     : INACTIVE_LIGHT);
  const labelColor  = focused
    ? accent
    : (isDark ? INACTIVE_DARK : INACTIVE_LIGHT);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 36 }}>

      {/* Pill + icon */}
      <Animated.View
        style={{
          width: pillWidth,
          height: 30,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: pillOpacity.interpolate({
            inputRange:  [0, 1],
            outputRange: isDark
              ? ['rgba(160,154,255,0)', 'rgba(160,154,255,0.18)']  // soft violet tint in dark
              : ['rgba(108, 99,255,0)', 'rgba(108, 99,255,1)'   ],  // solid accent in light
          }),
          shadowColor:   accent,
          shadowOffset:  { width: 0, height: 4 },
          shadowOpacity: focused ? (isDark ? 0.4 : 0.3) : 0,
          shadowRadius:  10,
          elevation:     focused ? 8 : 0,
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={focused ? activeIcon : inactiveIcon}
            size={24}
            color={iconColor}
          />
        </Animated.View>
      </Animated.View>

      {/* Label */}
      <Text style={{ fontSize: 11, fontWeight: '600', color: labelColor }}>
        {label}
      </Text>

    </View>
  );
}

// ─────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────
export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const tabBarStyle = {
    position:        'absolute' as const,
    // bottom:          Platform.OS === 'ios' ? 26 : 16,
    // left:            16,
    // right:           16,
    height:          74,
    // borderRadius:    26,
    backgroundColor: isDark ? TAB_BG_DARK : TAB_BG_LIGHT,
    borderTopWidth:  0,
    // elevation:       74,
    shadowColor:     isDark ? SHADOW_DARK : SHADOW_LIGHT,
    shadowOffset:    { width: 0, height: 10 },
    shadowOpacity:   isDark ? 0.6 : 0.12,
    shadowRadius:    24,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown:           false,
        tabBarShowLabel:       false,
        tabBarStyle,
        tabBarItemStyle:       { paddingVertical: 0 },
        tabBarActiveTintColor: isDark ? ACCENT_DARK : ACCENT,
        tabBarInactiveTintColor: isDark ? INACTIVE_DARK : INACTIVE_LIGHT,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            // Hide the tab bar entirely on the chat screen
            tabBarStyle: tab.name === 'chat' ? { display: 'none' } : tabBarStyle,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                activeIcon={tab.activeIcon}
                inactiveIcon={tab.inactiveIcon}
                label={tab.label}
                isDark={isDark}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}