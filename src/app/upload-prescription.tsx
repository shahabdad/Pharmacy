import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, Image,
    ScrollView, Text, TouchableOpacity, View
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
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true });
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
      Alert.alert('Success', 'Prescription submitted successfully!');
      router.replace('/(tabs)/prescription');
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-5 py-5 bg-white border-b border-gray-100 shadow-sm"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <View>
            <Text className="text-xl font-black text-gray-900 tracking-tight">Upload Prescription</Text>
            <Text className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Medical Concierge</Text>
        </View>
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
              className="border-2 border-dashed border-teal-200 bg-teal-50/30 rounded-[32px] p-10 items-center mb-6"
              style={{ gap: 14 }}
            >
              <View
                className="w-24 h-24 bg-teal-600 rounded-[32px] items-center justify-center"
                style={{ shadowColor: '#0D9488', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }}
              >
                <Ionicons name="document-attach" size={44} color="#fff" />
              </View>
              <View className="items-center">
                  <Text className="text-lg font-black text-gray-900">Digital Scan</Text>
                  <Text className="text-xs text-gray-500 text-center leading-5 mt-1 px-4">
                    Position your prescription in a well-lit area for the most accurate quote
                  </Text>
              </View>

              <View className="flex-row gap-4 w-full mt-4">
                {(['camera', 'gallery'] as const).map((src) => (
                  <TouchableOpacity
                    key={src}
                    onPress={() => pickImage(src)}
                    className="flex-1 bg-white border border-gray-100 rounded-2xl py-4 flex-row items-center justify-center gap-2.5"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={src === 'camera' ? 'camera' : 'images'}
                      size={20}
                      color="#0F766E"
                    />
                    <Text className="text-sm font-black text-teal-900 capitalize">{src}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <Animated.View
              entering={ZoomIn.springify()}
              className="rounded-[32px] overflow-hidden mb-6 border-4 border-white"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 15 }}
            >
              <Image source={{ uri: imageUri }} className="w-full h-64" contentFit="cover" />
              <View className="bg-white px-5 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100">
                    <Ionicons name="checkmark-done" size={18} color="#059669" />
                  </View>
                  <View>
                      <Text className="text-xs font-black text-gray-900">Document ready</Text>
                      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready for pharmacist</Text>
                  </View>
                </View>
                <TouchableOpacity 
                    onPress={() => setImageUri(null)}
                    className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100"
                >
                  <Text className="text-xs font-black text-teal-700">Retake</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Tips */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(400)}
          className="bg-white rounded-[28px] p-6 mb-8 border border-gray-100 shadow-sm"
        >
          <View className="flex-row items-center gap-3 mb-5">
            <View className="w-8 h-8 bg-amber-50 rounded-xl items-center justify-center border border-amber-100">
              <Ionicons name="sparkles" size={16} color="#D97706" />
            </View>
            <Text className="text-sm font-black text-gray-800">Quality Checklist</Text>
          </View>
          <View className="gap-4">
              {tips.map((tip, i) => (
                <Animated.View
                  key={tip.text}
                  entering={FadeInDown.delay(i * 80 + 200).duration(300)}
                  className="flex-row items-center gap-4"
                >
                  <View className="w-9 h-9 bg-teal-50 rounded-xl items-center justify-center">
                    <Ionicons name={tip.icon as any} size={16} color="#0F766E" />
                  </View>
                  <Text className="text-xs font-bold text-gray-500 flex-1 leading-5">{tip.text}</Text>
                </Animated.View>
              ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Submit button */}
      <View className="px-5 pb-6">
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={() => { btnScale.value = withSpring(0.95); }}
            onPressOut={() => { btnScale.value = withSpring(1); }}
            disabled={!imageUri || loading}
            activeOpacity={0.9}
            className={`rounded-2xl py-5 items-center flex-row justify-center gap-3 ${imageUri && !loading ? 'bg-teal-700' : 'bg-gray-200'}`}
            style={imageUri ? { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 12 } : {}}
          >
            {loading ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <>
                    <Ionicons name="cloud-done" size={22} color="#fff" />
                    <Text className="text-white font-black text-base tracking-tight">
                        Confirm & Upload
                    </Text>
                </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}




