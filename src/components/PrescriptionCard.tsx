import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { Prescription, PrescriptionStatus } from '../types';

interface PrescriptionCardProps {
  prescription: Prescription;
  onPress: (id: string) => void;
}

const STATUS_CONFIG: Record<PrescriptionStatus, { label: string; color: string; bg: string; icon: string; accent: string }> = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FEF3C7', icon: 'hourglass-outline',        accent: '#F59E0B' },
  quoted:    { label: 'Quoted',    color: '#3B82F6', bg: '#DBEAFE', icon: 'pricetag-outline',          accent: '#3B82F6' },
  approved:  { label: 'Approved',  color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline',  accent: '#10B981' },
  delivered: { label: 'Delivered', color: '#6C63FF', bg: '#EDE9FE', icon: 'bag-check-outline',         accent: '#6C63FF' },
  rejected:  { label: 'Rejected',  color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline',      accent: '#EF4444' },
};

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, onPress }) => {
  const scale = useSharedValue(1);
  const cfg   = STATUS_CONFIG[prescription.status];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { shadowColor: cfg.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => onPress(prescription.id)}
        className="bg-white rounded-3xl mb-3 overflow-hidden"
      >
        {/* Image */}
        {prescription.imageURL ? (
          <View className="relative">
            <Image
              source={{ uri: prescription.imageURL }}
              className="w-full h-32"
              resizeMode="cover"
            />
            {/* Status overlay badge */}
            <View
              className="absolute top-3 right-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: cfg.bg }}
            >
              <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
              <Text className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</Text>
            </View>
          </View>
        ) : null}

        <View className="p-4">
          {/* Title row */}
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-[10px] text-gray-400 font-medium">Prescription</Text>
              <Text className="text-sm font-bold text-gray-900">#{prescription.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            {!prescription.imageURL && (
              <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.bg }}>
                <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
                <Text className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</Text>
              </View>
            )}
          </View>

          {/* Quote amount */}
          {prescription.quoteAmount != null && (
            <View className="flex-row items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2 mb-2">
              <Ionicons name="pricetag" size={14} color="#10B981" />
              <Text className="text-sm font-black text-emerald-600">Rs. {prescription.quoteAmount}</Text>
              <Text className="text-xs text-emerald-400">quoted</Text>
            </View>
          )}

          {/* Admin message */}
          {prescription.adminMessage && (
            <View className="flex-row gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-2">
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#9CA3AF" style={{ marginTop: 1 }} />
              <Text className="text-xs text-gray-500 flex-1 leading-4">{prescription.adminMessage}</Text>
            </View>
          )}

          {/* Date */}
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
            <Text className="text-[10px] text-gray-400">
              {new Date(prescription.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
