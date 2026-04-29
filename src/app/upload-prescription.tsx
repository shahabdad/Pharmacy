import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue, withSpring, ZoomIn
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { submitPrescriptionOrder } from '../services/prescriptionService';

const tips = [
  { icon: 'sunny-outline',    text: 'Good lighting, avoid shadows'       },
  { icon: 'text-outline',     text: 'All text must be clearly readable'  },
  { icon: 'ribbon-outline',   text: "Include doctor's stamp if present"  },
  { icon: 'crop-outline',     text: 'Keep prescription fully in frame'   },
];

export default function UploadPrescriptionScreen() {
  const insets   = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  async function pickImage(source: 'camera' | 'gallery') {
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', `Please allow ${source} access in Settings.`);
      return;
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!imageUri) {
      Alert.alert('No image', 'Please select a prescription image first.');
      return;
    }
    setLoading(true);
    try {
      await submitPrescriptionOrder({ imageUri, message: '', address: '', phone: '' });
      Alert.alert('Success', 'Prescription submitted!');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-5 py-4 border-b border-gray-100"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-900">Upload Prescription</Text>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload zone */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          {!imageUri ? (
            <View
              className="border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-3xl p-8 items-center mb-5"
              style={{ gap: 12 }}
            >
              <View
                className="w-20 h-20 bg-violet-100 rounded-3xl items-center justify-center"
                style={{ shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 }}
              >
                <Ionicons name="document-text-outline" size={36} color="#6C63FF" />
              </View>
              <Text className="text-base font-black text-gray-900">Upload Prescription</Text>
              <Text className="text-xs text-gray-400 text-center leading-4">
                Take a clear photo or choose from your gallery
              </Text>

              <View className="flex-row gap-3 w-full mt-2">
                {(['camera', 'gallery'] as const).map((src) => (
                  <TouchableOpacity
                    key={src}
                    onPress={() => pickImage(src)}
                    className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 flex-row items-center justify-center gap-2"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={src === 'camera' ? 'camera-outline' : 'images-outline'}
                      size={18}
                      color="#6C63FF"
                    />
                    <Text className="text-xs font-bold text-violet-600 capitalize">{src}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <Animated.View
              entering={ZoomIn.springify()}
              className="rounded-3xl overflow-hidden mb-5"
              style={{ shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}
            >
              <Image source={{ uri: imageUri }} className="w-full h-52" resizeMode="cover" />
              <View className="bg-white px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                  <Text className="text-xs font-semibold text-gray-800">prescription.jpg</Text>
                </View>
                <TouchableOpacity onPress={() => setImageUri(null)}>
                  <Text className="text-xs font-bold text-violet-600">Change</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Tips */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(400)}
          className="bg-gray-50 rounded-3xl p-4 mb-6"
        >
          <Text className="text-xs font-black text-gray-700 mb-3">💡 Tips for best results</Text>
          {tips.map((tip, i) => (
            <Animated.View
              key={tip.text}
              entering={FadeInDown.delay(i * 50 + 200).duration(300)}
              className="flex-row items-center gap-3 mb-2.5"
            >
              <View className="w-7 h-7 bg-violet-100 rounded-xl items-center justify-center">
                <Ionicons name={tip.icon as any} size={14} color="#6C63FF" />
              </View>
              <Text className="text-xs text-gray-500 flex-1">{tip.text}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Submit button */}
      <View
        className="px-5"
        style={{ paddingBottom: Platform.OS === 'ios' ? 32 : 20 }}
      >
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={() => { btnScale.value = withSpring(0.97); }}
            onPressOut={() => { btnScale.value = withSpring(1); }}
            disabled={!imageUri || loading}
            activeOpacity={0.9}
            className={`rounded-2xl py-4 items-center ${imageUri && !loading ? 'bg-violet-600' : 'bg-violet-300'}`}
            style={imageUri ? { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 } : {}}
          >
            <Text className="text-white font-bold text-sm">
              {loading ? 'Submitting...' : 'Submit Prescription 🚀'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}



