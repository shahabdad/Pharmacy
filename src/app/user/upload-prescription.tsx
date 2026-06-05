// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import { router, Stack } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Alert, Image,
//     ScrollView, Text, TouchableOpacity, View
// } from 'react-native';
// import Animated, {
//     FadeInDown,
//     useAnimatedStyle,
//     useSharedValue, withSpring, ZoomIn
// } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { submitPrescriptionOrder } from '../../services/prescriptionService';
// import { useAuth } from '../../context/AuthContext';

// const tips = [
//   { icon: 'sunny-outline',    text: 'Good lighting, avoid shadows'       },
//   { icon: 'text-outline',     text: 'All text must be clearly readable'  },
//   { icon: 'ribbon-outline',   text: "Include doctor's stamp if present"  },
//   { icon: 'crop-outline',     text: 'Keep prescription fully in frame'   },
// ];

// export default function UploadPrescriptionScreen() {
//   const insets   = useSafeAreaInsets();
//   const { appUser } = useAuth();
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [loading,  setLoading]  = useState(false);

//   const btnScale = useSharedValue(1);
//   const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

//   async function pickImage(source: 'camera' | 'gallery') {
//     const perm = source === 'camera'
//       ? await ImagePicker.requestCameraPermissionsAsync()
//       : await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) {
//       Alert.alert('Permission required', `Please allow ${source} access in Settings.`);
//       return;
//     }
//     const result = source === 'camera'
//       ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
//       : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
//     if (!result.canceled) setImageUri(result.assets[0].uri);
//   }

//   async function handleSubmit() {
//     if (!imageUri) {
//       Alert.alert('No image', 'Please select a prescription image first.');
//       return;
//     }
//     setLoading(true);
//     try {
//       if (!appUser) {
//         Alert.alert('Not logged in', 'Please log in to upload a prescription.');
//         return;
//       }
//       await submitPrescriptionOrder({
//         imageUri,
//         message: '',
//         address: appUser.region || '',
//         phone: appUser.phone || '',
//         paymentMethod: 'cash_on_delivery',
//         userId: appUser.uid,
//         userName: appUser.name || 'User',
//       });
//       Alert.alert('Success', 'Prescription submitted!');
//       router.back();
//     } catch {
//       Alert.alert('Error', 'Failed to submit. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
//       <Stack.Screen options={{ headerShown: false }} />
//       <Animated.View
//         entering={FadeInDown.duration(400)}
//         className="flex-row items-center px-5 py-4 border-b border-gray-100"
//       >
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3"
//         >
//           <Ionicons name="arrow-back" size={18} color="#374151" />
//         </TouchableOpacity>
//         <Text className="text-lg font-black text-gray-900">Upload Prescription</Text>
//       </Animated.View>

//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <Animated.View entering={FadeInDown.delay(80).duration(400)}>
//           {!imageUri ? (
//             <View
//               className="border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-3xl p-8 items-center mb-5"
//               style={{ gap: 12 }}
//             >
//               <View
//                 className="w-20 h-20 bg-violet-100 rounded-3xl items-center justify-center"
//                 style={{ shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 }}
//               >
//                 <Ionicons name="document-text-outline" size={36} color="#0F172A" />
//               </View>
//               <Text className="text-base font-black text-gray-900">Upload Prescription</Text>
//               <Text className="text-xs text-gray-400 text-center leading-4">
//                 Take a clear photo or choose from your gallery
//               </Text>

//               <View className="flex-row gap-3 w-full mt-2">
//                 {(['camera', 'gallery'] as const).map((src) => (
//                   <TouchableOpacity
//                     key={src}
//                     onPress={() => pickImage(src)}
//                     className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 flex-row items-center justify-center gap-2"
//                     style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
//                     activeOpacity={0.8}
//                   >
//                     <Ionicons
//                       name={src === 'camera' ? 'camera-outline' : 'images-outline'}
//                       size={18}
//                       color="#0F172A"
//                     />
//                     <Text className="text-xs font-bold text-violet-600 capitalize">{src}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           ) : (
//             <Animated.View
//               entering={ZoomIn.springify()}
//               className="rounded-3xl overflow-hidden mb-5"
//               style={{ shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}
//             >
//               <Image source={{ uri: imageUri }} className="w-full h-52" resizeMode="cover" />
//               <View className="bg-white px-4 py-3 flex-row items-center justify-between">
//                 <View className="flex-row items-center gap-2">
//                   <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center">
//                     <Ionicons name="checkmark" size={16} color="#10B981" />
//                   </View>
//                   <Text className="text-xs font-semibold text-gray-800">prescription.jpg</Text>
//                 </View>
//                 <TouchableOpacity onPress={() => setImageUri(null)}>
//                   <Text className="text-xs font-bold text-violet-600">Change</Text>
//                 </TouchableOpacity>
//               </View>
//             </Animated.View>
//           )}
//         </Animated.View>

//         <Animated.View
//           entering={FadeInDown.delay(160).duration(400)}
//           className="bg-gray-50 rounded-3xl p-4 mb-6"
//         >
//           <View className="flex-row items-center gap-2 mb-3">
//             <View className="w-6 h-6 bg-amber-100 rounded-lg items-center justify-center">
//               <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
//             </View>
//             <Text className="text-xs font-black text-gray-700">Tips for best results</Text>
//           </View>
//           {tips.map((tip, i) => (
//             <Animated.View
//               key={tip.text}
//               entering={FadeInDown.delay(i * 50 + 200).duration(300)}
//               className="flex-row items-center gap-3 mb-2.5"
//             >
//               <View className="w-7 h-7 bg-violet-100 rounded-xl items-center justify-center">
//                 <Ionicons name={tip.icon as any} size={14} color="#0F172A" />
//               </View>
//               <Text className="text-xs text-gray-500 flex-1">{tip.text}</Text>
//             </Animated.View>
//           ))}
//         </Animated.View>
//       </ScrollView>

//       <View className="px-5">
//         <Animated.View style={btnStyle}>
//           <TouchableOpacity
//             onPress={handleSubmit}
//             onPressIn={() => { btnScale.value = withSpring(0.97); }}
//             onPressOut={() => { btnScale.value = withSpring(1); }}
//             disabled={!imageUri || loading}
//             activeOpacity={0.9}
//             className={`rounded-2xl py-4 items-center ${imageUri && !loading ? 'bg-violet-600' : 'bg-violet-300'}`}
//             style={imageUri ? { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 } : {}}
//           >
//             <Text className="text-white font-bold text-sm">
//             {loading ? 'Submitting...' : 'Submit Prescription'}
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </View>
//     </View>
//   );
// }


import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Make sure these paths match your project structure
import { submitPrescriptionOrder } from '../../services/prescriptionService';
import { useAuth } from '../../context/AuthContext';

const tips = [
  { icon: 'sunny-outline', text: 'Ensure good lighting and avoid shadows' },
  { icon: 'text-outline', text: 'All text must be clearly readable' },
  { icon: 'ribbon-outline', text: "Include the doctor's stamp if present" },
  { icon: 'crop-outline', text: 'Keep the entire prescription in the frame' },
];

export default function UploadPrescriptionScreen() {
  const insets = useSafeAreaInsets();
  const { appUser } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Button press animation
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  async function pickImage(source: 'camera' | 'gallery') {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert(
        'Permission Required',
        `Please allow ${source} access in your device settings to continue.`
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please capture or select a prescription image first.');
      return;
    }
    if (!appUser) {
      Alert.alert('Authentication Required', 'Please log in to upload a prescription.');
      return;
    }

    setLoading(true);
    try {
      await submitPrescriptionOrder({
        imageUri,
        message: '',
        address: appUser.region || '',
        phone: appUser.phone || '',
        paymentMethod: 'cash_on_delivery',
        userId: appUser.uid,
        userName: appUser.name || 'User',
      });
      Alert.alert('Success', 'Your prescription has been submitted successfully.');
      router.back();
    } catch {
      Alert.alert('Upload Failed', 'There was an error submitting your prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-5 py-4 bg-white z-10"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4 border border-gray-100"
        >
          <Ionicons name="chevron-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 tracking-tight">
          Upload Prescription
        </Text>
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          {!imageUri ? (
            // Empty State / Dropzone
            <View className="border-2 border-dashed border-violet-200 bg-violet-50/30 rounded-[28px] p-6 items-center mb-6">
              <View className="w-20 h-20 bg-violet-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="document-attach-outline" size={32} color="#0F172A" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-1">
                Attach Prescription
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-6 px-4">
                Take a clear photo of your physical prescription or upload it from your gallery.
              </Text>

              <View className="flex-row gap-4 w-full">
                <TouchableOpacity
                  onPress={() => pickImage('camera')}
                  className="flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm"
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={20} color="#0F172A" />
                  <Text className="text-sm font-semibold text-gray-800">Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => pickImage('gallery')}
                  className="flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm"
                  activeOpacity={0.7}
                >
                  <Ionicons name="image" size={20} color="#0F172A" />
                  <Text className="text-sm font-semibold text-gray-800">Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Image Preview State
            <Animated.View
              entering={ZoomIn.springify().damping(14)}
              exiting={FadeOut}
              className="rounded-[28px] overflow-hidden mb-6 bg-white border border-gray-100 shadow-sm"
            >
              {/* Preview Header */}
              <View className="bg-gray-50 px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                    <Ionicons name="checkmark-done" size={16} color="#059669" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">Document ready</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setImageUri(null)}
                  className="w-8 h-8 bg-red-50 rounded-full items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>

              {/* Image */}
              <Image
                source={{ uri: imageUri }}
                className="w-full h-64"
                resizeMode="cover"
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Tips Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-5 mb-4"
        >
          <View className="flex-row items-center gap-2.5 mb-4">
            <View className="w-7 h-7 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="information" size={18} color="#2563EB" />
            </View>
            <Text className="text-sm font-bold text-blue-900">
              Tips for best results
            </Text>
          </View>

          {tips.map((tip, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 100 + 300).duration(300)}
              className="flex-row items-center gap-3 mb-3 pl-1"
            >
              <Ionicons name={tip.icon as any} size={16} color="#3B82F6" />
              <Text className="text-sm text-gray-600 flex-1">{tip.text}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={() => (btnScale.value = withSpring(0.96))}
            onPressOut={() => (btnScale.value = withSpring(1))}
            disabled={!imageUri || loading}
            activeOpacity={0.8}
            className={`rounded-2xl py-4 flex-row items-center justify-center ${imageUri && !loading ? 'bg-violet-600 shadow-lg shadow-violet-600/30' : 'bg-gray-200'
              }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" className="mr-2" />
            ) : null}
            <Text
              className={`font-bold text-base ${imageUri && !loading ? 'text-white' : 'text-gray-400'
                }`}
            >
              {loading ? 'Uploading...' : 'Submit Prescription'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
