import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { Order, OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  onPress: (id: string) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline'             },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#DBEAFE', icon: 'checkmark-circle-outline' },
  shipped:   { label: 'Shipped',   color: '#8B5CF6', bg: '#EDE9FE', icon: 'bicycle-outline'          },
  delivered: { label: 'Delivered', color: '#10B981', bg: '#D1FAE5', icon: 'bag-check-outline'        },
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const scale = useSharedValue(1);
  const cfg   = STATUS_CONFIG[order.status];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => onPress(order.id)}
        className="bg-white rounded-3xl p-4 mb-3 overflow-hidden"
      >
        {/* Accent bar */}
        <View className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-violet-500" />

        <View className="pl-3">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-[10px] text-gray-400 font-medium">Order ID</Text>
              <Text className="text-sm font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: cfg.bg }}>
              <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
              <Text className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</Text>
            </View>
          </View>

          {/* Items preview */}
          <View className="bg-gray-50 rounded-2xl p-3 mb-3">
            {order.items.slice(0, 2).map((item, i) => (
              <View key={i} className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <View className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <Text className="text-xs text-gray-700 font-medium">{item.name}</Text>
                </View>
                <Text className="text-xs text-gray-400">×{item.quantity}</Text>
              </View>
            ))}
            {order.items.length > 2 && (
              <Text className="text-[10px] text-gray-400 italic mt-0.5">+{order.items.length - 2} more items</Text>
            )}
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
              <Text className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-gray-400">Total</Text>
              <Text className="text-sm font-black text-emerald-500">Rs. {order.totalAmount}</Text>
            </View>
          </View>

          {order.whatsappNotified && (
            <View className="flex-row items-center gap-1 mt-2 pt-2 border-t border-gray-100">
              <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
              <Text className="text-[10px] text-emerald-500 font-medium">WhatsApp notified</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
