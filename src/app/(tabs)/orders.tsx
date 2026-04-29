import { OrderCard } from '@/src/components/OrderCard';
import { Order } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockOrders: Order[] = [
  {
    id: 'ord_001', userId: 'user_1', shopId: 'shop_1',
    items: [
      { productId: 'item_001', name: 'Panadol Extra', quantity: 2, price: 100 },
      { productId: 'item_002', name: 'Augmentin 625', quantity: 1, price: 250 },
    ],
    totalAmount: 450, status: 'pending', whatsappNotified: false,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'ord_002', userId: 'user_1', shopId: 'shop_1',
    items: [{ productId: 'item_003', name: 'Vitamin C 1000mg', quantity: 3, price: 50 }],
    totalAmount: 150, status: 'delivered', whatsappNotified: true,
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'ord_003', userId: 'user_1', shopId: 'shop_1',
    items: [
      { productId: 'item_004', name: 'Brufen 400mg', quantity: 1, price: 500 },
      { productId: 'item_005', name: 'Omeprazole', quantity: 2, price: 75 },
      { productId: 'item_006', name: 'Zyrtec 10mg', quantity: 1, price: 120 },
    ],
    totalAmount: 770, status: 'shipped', whatsappNotified: false,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} className="px-5 pt-4 pb-3">
        <Text className="text-xs text-gray-400 font-medium mb-0.5">Track your</Text>
        <Text className="text-2xl font-black text-gray-900 tracking-tight">Orders</Text>
      </Animated.View>

      {/* Summary chips */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} className="flex-row gap-2 px-5 mb-4">
        {[
          { label: 'All',       count: mockOrders.length,                                    active: true  },
          { label: 'Pending',   count: mockOrders.filter(o => o.status === 'pending').length,  active: false },
          { label: 'Delivered', count: mockOrders.filter(o => o.status === 'delivered').length, active: false },
        ].map((chip) => (
          <View
            key={chip.label}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${chip.active ? 'bg-violet-600' : 'bg-white border border-gray-200'}`}
          >
            <Text className={`text-xs font-semibold ${chip.active ? 'text-white' : 'text-gray-600'}`}>{chip.label}</Text>
            <View className={`w-4 h-4 rounded-full items-center justify-center ${chip.active ? 'bg-white/20' : 'bg-gray-100'}`}>
              <Text className={`text-[9px] font-bold ${chip.active ? 'text-white' : 'text-gray-500'}`}>{chip.count}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
            <OrderCard order={item} onPress={(id) => Alert.alert('Order', `ID: ${id}`)} />
          </Animated.View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No orders yet</Text>
          </View>
        }
      />
    </View>
  );
}
