import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  SlideInDown, 
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface ModernAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
}

const TYPE_CONFIG = {
  success: {
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    bg: '#ECFDF5',
    darkBg: '#064E3B',
    accent: '#059669',
  },
  error: {
    icon: 'close-circle-outline',
    color: '#EF4444',
    bg: '#FEF2F2',
    darkBg: '#7F1D1D',
    accent: '#DC2626',
  },
  info: {
    icon: 'information-circle-outline',
    color: '#3B82F6',
    bg: '#EFF6FF',
    darkBg: '#1E3A5F',
    accent: '#2563EB',
  },
  warning: {
    icon: 'warning-outline',
    color: '#F59E0B',
    bg: '#FFFBEB',
    darkBg: '#78350F',
    accent: '#D97706',
  },
};

export const ModernAlert = ({ visible, title, message, type = 'info', onClose }: ModernAlertProps) => {
  const isDark = useColorScheme() === 'dark';
  const config = TYPE_CONFIG[type];
  
  if (!visible) return null;

  return (
    <View 
      className="absolute inset-0 z-[100] items-center justify-end pb-10 px-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      pointerEvents="box-none"
    >
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.duration(200)}
        className={`w-full max-w-[450px] rounded-3xl overflow-hidden border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-2xl'
        }`}
      >
        <View className="p-5 flex-row items-center gap-4">
          <View 
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: isDark ? config.darkBg : config.bg }}
          >
            <Ionicons name={config.icon as any} size={28} color={config.color} />
          </View>
          
          <View className="flex-1">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </Text>
            <Text className={`text-sm mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              {message}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={onClose}
          className="mx-5 mb-5 py-3.5 rounded-2xl items-center justify-center"
          style={{ backgroundColor: config.accent }}
        >
          <Text className="text-white font-bold text-base">Dismiss</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

interface ToastProps {
  visible: boolean;
  message: string;
  type?: AlertType;
  duration?: number;
  onHide: () => void;
}

export const ModernToast = ({ visible, message, type = 'success', duration = 3000, onHide }: ToastProps) => {
  const isDark = useColorScheme() === 'dark';
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <View 
      className="absolute top-12 left-0 right-0 z-[1000] items-center px-6"
      pointerEvents="none"
    >
      <Animated.View
        entering={FadeInUp.springify()}
        exiting={FadeOutUp.duration(200)}
        className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl border ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-lg'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View 
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: isDark ? config.darkBg : config.bg }}
        >
          <Ionicons name={config.icon as any} size={18} color={config.color} />
        </View>
        <Text className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};
