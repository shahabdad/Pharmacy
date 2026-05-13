import React from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Connecting to Secure Servers...' }) => {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: isDark ? '#0D1117' : '#F8FAFC', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      {/* Central Branding */}
      <Animated.View 
        entering={ZoomIn.duration(600).springify()}
        style={{ alignItems: 'center', marginBottom: 40 }}
      >
        <View style={{ 
          width: 80, height: 80, 
          borderRadius: 24, 
          backgroundColor: isDark ? '#0C2A44' : '#EBF5FF', 
          alignItems: 'center', 
          justifyContent: 'center',
          shadowColor: '#004B87',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 10
        }}>
          <Ionicons name="medical" size={42} color="#005CAB" />
        </View>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: '900', 
          color: isDark ? '#F0F6FC' : '#0F172A', 
          marginTop: 16,
          letterSpacing: -1
        }}>
          MediCare
        </Text>
      </Animated.View>

      {/* Progress */}
      <View style={{ alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#005CAB" />
        <Text style={{ 
          fontSize: 13, 
          color: isDark ? '#8B949E' : '#64748B', 
          marginTop: 12, 
          fontWeight: '600',
          letterSpacing: 0.3
        }}>
          {message}
        </Text>
      </View>

      {/* Footer (WhatsApp Style) */}
      <Animated.View 
        entering={FadeIn.delay(400).duration(800)}
        style={{ 
          position: 'absolute', 
          bottom: 50, 
          alignItems: 'center',
          flexDirection: 'row',
          gap: 6
        }}
      >
        <Ionicons name="shield-checkmark" size={14} color={isDark ? '#30363D' : '#CBD5E1'} />
        <Text style={{ 
          fontSize: 11, 
          fontWeight: '800', 
          color: isDark ? '#30363D' : '#CBD5E1', 
          textTransform: 'uppercase',
          letterSpacing: 1.5
        }}>
          Secure & Encrypted
        </Text>
      </Animated.View>
    </View>
  );
};
