import { PrescriptionCard } from '@/src/components/PrescriptionCard';
import { Prescription } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockPrescriptions: Prescription[] = [
  { id: 'pres_001', userId: 'user_1', shopId: 'shop_1', imageURL: 'https://via.placeholder.com/150', status: 'pending',  adminMessage: "Waiting for doctor's review.", createdAt: new Date(Date.now() - 86400000 * 3), updatedAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'pres_002', userId: 'user_1', shopId: 'shop_1', imageURL: 'https://via.placeholder.com/150', status: 'approved', quoteAmount: 500, adminMessage: 'Approved and quoted.', createdAt: new Date(Date.now() - 86400000 * 7), updatedAt: new Date(Date.now() - 86400000 * 7) },
  { id: 'pres_003', userId: 'user_1', shopId: 'shop_1', imageURL: 'https://via.placeholder.com/150', status: 'quoted',   quoteAmount: 320, adminMessage: 'Quote available.', createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 86400000) },
  { id: 'pres_004', userId: 'user_1', shopId: 'shop_1', imageURL: 'https://via.placeholder.com/150', status: 'rejected', adminMessage: 'Rejected: unclear image.', createdAt: new Date(Date.now() - 86400000 * 10), updatedAt: new Date(Date.now() - 86400000 * 10) },
];

function UploadButton() {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Link href="/upload-prescription" asChild>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Animated.View
          style={[animStyle, { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 }]}
          className="bg-violet-600 rounded-2xl mx-5 mb-4 py-4 flex-row items-center justify-center gap-2"
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text className="text-white font-bold text-sm">Upload New Prescription</Text>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );
}

export default function PrescriptionScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <Animated.View entering={FadeInDown.duration(400)} className="px-5 pt-4 pb-3">
        <Text className="text-xs text-gray-400 font-medium mb-0.5">Manage your</Text>
        <Text className="text-2xl font-black text-gray-900 tracking-tight">Prescriptions</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <UploadButton />
      </Animated.View>

      <FlatList
        data={mockPrescriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80 + 160).duration(400)}>
            <PrescriptionCard
              prescription={item}
              onPress={(id) => Alert.alert('Prescription', `ID: ${id}`)}
            />
          </Animated.View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="document-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3">No prescriptions yet</Text>
          </View>
        }
      />
    </View>
  );
}
