// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import React, { useState } from 'react';
// import {
//   Alert, Image, Linking, Platform, Pressable,
//   ScrollView, Text, TextInput, TouchableOpacity, View,
// } from 'react-native';
// import Animated, {
//   FadeInDown, FadeInLeft, FadeInRight, FadeInUp,
//   useAnimatedStyle, useSharedValue,
//   withSpring,
//   ZoomIn,
// } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import { DeliveryModal } from '@/src/components/DeliveryModal';
// import { useAuth } from '@/src/context/AuthContext';
// import { orderService } from '@/src/services/orderService';
// import { submitPrescriptionOrder } from '@/src/services/prescriptionService';

// type Step = 'idle' | 'modal1' | 'modal2' | 'success';
// type OrderMethod = 'upload' | 'text';

// // ─── Animated press wrapper ───────────────────────────────────────────────────
// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// function PressCard({ onPress, children, style, disabled }: {
//   onPress: () => void; children: React.ReactNode; style?: any; disabled?: boolean;
// }) {
//   const scale = useSharedValue(1);
//   const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
//   return (
//     <AnimatedPressable
//       style={[animStyle, style]}
//       onPressIn={() => { if (!disabled) scale.value = withSpring(0.96); }}
//       onPressOut={() => { scale.value = withSpring(1); }}
//       onPress={onPress}
//       disabled={disabled}
//     >
//       {children}
//     </AnimatedPressable>
//   );
// }

// // ─── Main screen ──────────────────────────────────────────────────────────────
// export default function HomeScreen() {
//   const insets    = useSafeAreaInsets();
//   const { firebaseUser, appUser } = useAuth();
//   const firstName = appUser?.name?.split(' ')[0] ?? 'there';

//   const [orderMethod, setOrderMethod] = useState<OrderMethod>('upload');
//   const [imageUri,    setImageUri]    = useState<string | null>(null);
//   const [message,     setMessage]     = useState('');
//   const [step,        setStep]        = useState<Step>('idle');
//   const [loading,     setLoading]     = useState(false);
//   const [progress,    setProgress]    = useState(0);
//   const [orderId,     setOrderId]     = useState<string | null>(null);

//   // Real-time stats
//   const [stats, setStats] = useState({ total: 0, active: 0, done: 0 });

//   React.useEffect(() => {
//     if (!firebaseUser) return;
    
//     // Listen to user orders to update stats dynamically
//     const unsubscribe = orderService.listenToUserOrders(firebaseUser.uid, (orders) => {
//       const active = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped').length;
//       const done = orders.filter(o => o.status === 'delivered').length;
//       setStats({
//         total: orders.length,
//         active,
//         done,
//       });
//     });

//     return () => unsubscribe();
//   }, [firebaseUser]);

//   const SHOP_WHATSAPP = '+923191796621';

//   async function pickImage(source: 'camera' | 'gallery') {
//     const perm = source === 'camera'
//       ? await ImagePicker.requestCameraPermissionsAsync()
//       : await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) { Alert.alert('Permission required', `Allow ${source} access in Settings.`); return; }
//     const result = source === 'camera'
//       ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
//       : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
//     if (!result.canceled) setImageUri(result.assets[0].uri);
//   }

//   async function handleSubmit(address: string, phone: string) {
//     setLoading(true); setProgress(0);
//     try {
//       const id = await submitPrescriptionOrder(
//         { imageUri, message, address, phone, userId: appUser?.uid ?? 'anonymous', userName: appUser?.name ?? 'User' },
//         setProgress,
//       );
//       setOrderId(id); setStep('success');
//     } catch (err: any) {
//       Alert.alert('Error', err?.message ?? 'Failed to submit. Please try again.');
//     } finally { setLoading(false); setProgress(0); }
//   }

//   function reset() { setImageUri(null); setMessage(''); setOrderId(null); setStep('idle'); }

//   const handleWhatsApp = () => {
//     const num = SHOP_WHATSAPP.replace(/[^0-9]/g, '');
//     const url = `https://wa.me/${num}?text=${encodeURIComponent('Hello! I need help with my prescription order.')}`;
//     Linking.canOpenURL(url).then(ok => ok ? Linking.openURL(url) : Alert.alert('Error', 'WhatsApp not installed'));
//   };

//   const isFormValid = orderMethod === 'upload' ? imageUri !== null : message.trim().length > 0;

//   // ── Success ─────────────────────────────────────────────────────────────────
//   if (step === 'success') {
//     return (
//       <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: insets.top }} className="dark:bg-slate-950">
//         <Animated.View entering={ZoomIn.springify()} style={{
//           width: 100, height: 100, borderRadius: 28, backgroundColor: '#ECFDF5',
//           alignItems: 'center', justifyContent: 'center', marginBottom: 24,
//           shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
//         }} className="dark:bg-emerald-900/30">
//           <Ionicons name="checkmark-circle" size={60} color="#10B981" />
//         </Animated.View>
//         <Animated.Text entering={FadeInUp.delay(150).springify()} style={{ fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 8, textAlign: 'center' }} className="dark:text-white">
//           Order Placed!
//         </Animated.Text>
//         <Animated.Text entering={FadeInUp.delay(220).springify()} style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 12 }} className="dark:text-slate-400">
//           Your prescription has been submitted.{'\n'}We'll confirm your order shortly.
//         </Animated.Text>
//         {orderId && (
//           <Animated.View entering={FadeInUp.delay(300).springify()} style={{
//             backgroundColor: '#EEF2FF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
//             flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32,
//           }} className="dark:bg-indigo-950/40">
//             <Ionicons name="receipt-outline" size={16} color="#6366F1" />
//             <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '700' }}>
//               Order ID: {orderId.slice(0, 12).toUpperCase()}
//             </Text>
//           </Animated.View>
//         )}
//         <Animated.View entering={FadeInUp.delay(380).springify()} style={{ width: '100%' }}>
//           <PressCard onPress={reset} style={{ borderRadius: 20 }}>
//             <View style={{
//               backgroundColor: '#6366F1', borderRadius: 20, paddingVertical: 16,
//               alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
//               shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
//             }}>
//               <Ionicons name="home" size={18} color="#fff" />
//               <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Back to Home</Text>
//             </View>
//           </PressCard>
//         </Animated.View>
//       </View>
//     );
//   }

//   // ── Main ────────────────────────────────────────────────────────────────────
//   return (
//     <View style={{ flex: 1, backgroundColor: '#F8FAFC' }} className="dark:bg-slate-950">
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 130 }}
//       >

//         {/* ── Hero Header ── */}
//         <Animated.View
//           entering={FadeInDown.duration(400)}
//           style={{
//             backgroundColor: '#6366F1',
//             paddingTop: insets.top + 16,
//             paddingBottom: 28,
//             paddingHorizontal: 24,
//             borderBottomLeftRadius: 32,
//             borderBottomRightRadius: 32,
//             shadowColor: '#6366F1',
//             shadowOffset: { width: 0, height: 8 },
//             shadowOpacity: 0.3,
//             shadowRadius: 20,
//             elevation: 10,
//           }}
//           className="dark:bg-indigo-900"
//         >
//           {/* Top row */}
//           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//             <View>
//               <Text style={{ fontSize: 13, color: '#C7D2FE', fontWeight: '500', marginBottom: 2 }}>
//                 Good day,
//               </Text>
//               <Text style={{ fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 }}>
//                 {firstName}
//               </Text>
//             </View>
//             <TouchableOpacity
//               style={{
//                 width: 44, height: 44, borderRadius: 14,
//                 backgroundColor: 'rgba(255,255,255,0.18)',
//                 alignItems: 'center', justifyContent: 'center',
//               }}
//             >
//               <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
//               <View style={{
//                 position: 'absolute', top: 8, right: 8,
//                 width: 8, height: 8, borderRadius: 4,
//                 backgroundColor: '#F87171', borderWidth: 1.5, borderColor: '#6366F1',
//               }} />
//             </TouchableOpacity>
//           </View>

//           {/* Stats row */}
//           <View style={{ flexDirection: 'row', gap: 10 }}>
//             {[
//               { label: 'Orders',    value: stats.total.toString(),  icon: 'receipt-outline',   color: '#FDE68A' },
//               { label: 'Active',    value: stats.active.toString(), icon: 'time-outline',      color: '#6EE7B7' },
//               { label: 'Done',      value: stats.done.toString(),   icon: 'checkmark-circle',  color: '#A5B4FC' },
//             ].map((s, i) => (
//               <Animated.View key={s.label} entering={FadeInDown.delay(i * 60 + 200).springify()} style={{ flex: 1 }}>
//                 <View style={{
//                   backgroundColor: 'rgba(255,255,255,0.15)',
//                   borderRadius: 18, padding: 14,
//                   borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
//                 }}>
//                   <Ionicons name={s.icon as any} size={20} color={s.color} />
//                   <Text style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginTop: 8, marginBottom: 2 }}>
//                     {s.value}
//                   </Text>
//                   <Text style={{ fontSize: 10, color: '#C7D2FE', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
//                     {s.label}
//                   </Text>
//                 </View>
//               </Animated.View>
//             ))}
//           </View>
//         </Animated.View>

//         <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>

//           {/* ── Quick Actions ── */}
//           <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginBottom: 24 }}>
//             <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 14 }} className="dark:text-white">
//               Quick Actions
//             </Text>
//             <View style={{ flexDirection: 'row', gap: 12 }}>
//               {[
//                 { icon: 'chatbubble-ellipses', label: 'Chat\nPharmacy', color: '#6366F1', bg: '#EEF2FF' },
//                 { icon: 'cart',               label: 'My\nOrders',    color: '#10B981', bg: '#ECFDF5' },
//                 { icon: 'document-text',      label: 'My Rx\nHistory', color: '#F59E0B', bg: '#FFFBEB' },
//                 { icon: 'call',               label: 'Call\nUs',      color: '#EF4444', bg: '#FEF2F2' },
//               ].map((a, i) => (
//                 <Animated.View key={a.label} entering={FadeInDown.delay(i * 50 + 250).springify()} style={{ flex: 1 }}>
//                   <TouchableOpacity
//                     style={{
//                       backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14,
//                       alignItems: 'center',
//                       shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//                       shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
//                     }}
//                     className="dark:bg-slate-900"
//                     onPress={() => a.label.includes('Call') && handleWhatsApp()}
//                   >
//                     <View style={{
//                       width: 44, height: 44, borderRadius: 14,
//                       backgroundColor: a.bg, alignItems: 'center', justifyContent: 'center',
//                       marginBottom: 8,
//                     }} className="dark:bg-slate-800">
//                       <Ionicons name={a.icon as any} size={22} color={a.color} />
//                     </View>
//                     <Text style={{ fontSize: 10, fontWeight: '700', color: '#374151', textAlign: 'center', lineHeight: 14 }} className="dark:text-slate-400">
//                       {a.label}
//                     </Text>
//                   </TouchableOpacity>
//                 </Animated.View>
//               ))}
//             </View>
//           </Animated.View>

//           {/* ── Upload Card ── */}
//           <Animated.View entering={FadeInDown.delay(320).duration(400)} style={{ marginBottom: 20 }}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//               <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }} className="dark:text-white">
//                 New Prescription
//               </Text>
//               {isFormValid && (
//                 <Animated.View entering={FadeInRight.springify()} style={{
//                   backgroundColor: '#ECFDF5', borderRadius: 20,
//                   paddingHorizontal: 10, paddingVertical: 4,
//                   flexDirection: 'row', alignItems: 'center', gap: 4,
//                 }} className="dark:bg-emerald-900/30">
//                   <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
//                   <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981' }}>Ready</Text>
//                 </Animated.View>
//               )}
//             </View>

//             {/* Method toggle */}
//             <View style={{
//               flexDirection: 'row', backgroundColor: '#F1F5F9',
//               borderRadius: 16, padding: 4, marginBottom: 16,
//             }} className="dark:bg-slate-900">
//               {(['upload', 'text'] as const).map(m => (
//                 <Pressable
//                   key={m}
//                   onPress={() => setOrderMethod(m)}
//                   style={{
//                     flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12,
//                     flexDirection: 'row', justifyContent: 'center', gap: 6,
//                     backgroundColor: orderMethod === m ? '#FFFFFF' : 'transparent',
//                     ...(orderMethod === m ? {
//                       shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
//                       shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
//                     } : {}),
//                   }}
//                   className={orderMethod === m ? "dark:bg-slate-800" : ""}
//                 >
//                   <Ionicons
//                     name={m === 'upload' ? 'camera' : 'create-outline'}
//                     size={15}
//                     color={orderMethod === m ? '#0F172A' : '#94A3B8'}
//                   />
//                   <Text style={{
//                     fontSize: 13, fontWeight: '700',
//                     color: orderMethod === m ? '#0F172A' : '#94A3B8',
//                   }}>
//                     {m === 'upload' ? 'Upload Photo' : 'Type Medicine'}
//                   </Text>
//                 </Pressable>
//               ))}
//             </View>

//             {/* Upload area */}
//             {orderMethod === 'upload' ? (
//               !imageUri ? (
//                 <View style={{
//                   backgroundColor: '#FFFFFF', borderRadius: 24,
//                   borderWidth: 2, borderStyle: 'dashed', borderColor: '#E2E8F0',
//                   padding: 32, alignItems: 'center',
//                   shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
//                 }} className="dark:bg-slate-900 dark:border-slate-800">
//                   <Animated.View entering={ZoomIn.delay(100).springify()} style={{
//                     width: 80, height: 80, borderRadius: 24,
//                     backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
//                     marginBottom: 16,
//                     shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 },
//                     shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
//                   }} className="dark:bg-red-950/30">
//                     <Ionicons name="document-text" size={38} color="#EF4444" />
//                   </Animated.View>
//                   <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 6 }} className="dark:text-white">
//                     Upload Prescription
//                   </Text>
//                   <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 24 }} className="dark:text-slate-400">
//                     Take a clear photo or choose from your gallery
//                   </Text>
//                   <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
//                     {(['camera', 'gallery'] as const).map((src, i) => (
//                       <Animated.View key={src} entering={FadeInDown.delay(i * 60 + 100).springify()} style={{ flex: 1 }}>
//                         <PressCard onPress={() => pickImage(src)} style={{ borderRadius: 16 }}>
//                           <View style={{
//                             backgroundColor: src === 'camera' ? '#EF4444' : '#6366F1',
//                             borderRadius: 16, paddingVertical: 14,
//                             alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
//                             shadowColor: src === 'camera' ? '#EF4444' : '#6366F1',
//                             shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
//                           }}>
//                             <Ionicons name={src === 'camera' ? 'camera' : 'images'} size={18} color="#fff" />
//                             <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, textTransform: 'capitalize' }}>
//                               {src}
//                             </Text>
//                           </View>
//                         </PressCard>
//                       </Animated.View>
//                     ))}
//                   </View>
//                 </View>
//               ) : (
//                 <Animated.View entering={ZoomIn.springify()} style={{
//                   backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden',
//                   shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
//                   shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
//                 }} className="dark:bg-slate-900">
//                   <View style={{ position: 'relative' }}>
//                     <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
//                     {/* Overlay gradient feel */}
//                     <View style={{
//                       position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//                       backgroundColor: 'rgba(0,0,0,0.08)',
//                     }} />
//                     <View style={{
//                       position: 'absolute', top: 12, right: 12,
//                       backgroundColor: '#10B981', borderRadius: 20,
//                       paddingHorizontal: 12, paddingVertical: 6,
//                       flexDirection: 'row', alignItems: 'center', gap: 5,
//                     }}>
//                       <Ionicons name="checkmark-circle" size={14} color="#fff" />
//                       <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Uploaded</Text>
//                     </View>
//                     <Pressable
//                       onPress={() => setImageUri(null)}
//                       hitSlop={8}
//                       style={{
//                         position: 'absolute', top: 12, left: 12,
//                         width: 34, height: 34, borderRadius: 17,
//                         backgroundColor: 'rgba(0,0,0,0.45)',
//                         alignItems: 'center', justifyContent: 'center',
//                       }}
//                     >
//                       <Ionicons name="close" size={18} color="#fff" />
//                     </Pressable>
//                   </View>
//                   <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//                     <View style={{
//                       width: 44, height: 44, borderRadius: 12,
//                       backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
//                     }} className="dark:bg-indigo-950/40">
//                       <Ionicons name="image" size={22} color="#6366F1" />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }} className="dark:text-white">prescription.jpg</Text>
//                       <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ready to submit</Text>
//                     </View>
//                     <View style={{
//                       backgroundColor: '#ECFDF5', borderRadius: 10,
//                       paddingHorizontal: 10, paddingVertical: 5,
//                     }} className="dark:bg-emerald-900/30">
//                       <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>JPG</Text>
//                     </View>
//                   </View>
//                 </Animated.View>
//               )
//             ) : (
//               /* Text entry */
//               <View style={{
//                 backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
//                 shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
//               }} className="dark:bg-slate-900">
//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
//                   <View style={{
//                     width: 38, height: 38, borderRadius: 12,
//                     backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
//                   }} className="dark:bg-slate-800">
//                     <Ionicons name="create" size={20} color="#6366F1" />
//                   </View>
//                   <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }} className="dark:text-white">
//                     Type your medicines
//                   </Text>
//                 </View>
//                 <TextInput
//                   style={{
//                     backgroundColor: '#F8FAFC', borderRadius: 16,
//                     padding: 16, minHeight: 130,
//                     fontSize: 14, color: '#1E293B', lineHeight: 22,
//                     borderWidth: 1.5,
//                     borderColor: message.length > 0 ? '#6366F1' : '#E2E8F0',
//                     textAlignVertical: 'top',
//                   }}
//                   className="dark:bg-slate-950 dark:text-white dark:border-slate-800"
//                   placeholder={'E.g., Panadol 500mg - 2 strips\nAugmentin 625mg - 1 pack\nVitamin C - 1 bottle'}
//                   placeholderTextColor="#94A3B8"
//                   multiline
//                   value={message}
//                   onChangeText={setMessage}
//                 />
//                 {message.length > 0 && (
//                   <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right', marginTop: 6 }}>
//                     {message.length} characters
//                   </Text>
//                 )}
//               </View>
//             )}
//           </Animated.View>

//           {/* ── Tips ── */}
//           <Animated.View entering={FadeInDown.delay(420).duration(400)} style={{
//             backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 20,
//             shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
//           }} className="dark:bg-slate-900">
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
//               <View style={{
//                 width: 38, height: 38, borderRadius: 12,
//                 backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center',
//               }} className="dark:bg-amber-950/30">
//                 <Ionicons name="bulb" size={20} color="#F59E0B" />
//               </View>
//               <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }} className="dark:text-white">Tips for best results</Text>
//             </View>
//             {[
//               { icon: 'sunny-outline',  text: 'Use natural lighting for clear photos', color: '#F59E0B' },
//               { icon: 'text-outline',   text: 'Ensure all text is clearly readable',   color: '#6366F1' },
//               { icon: 'scan-outline',   text: 'Capture the full prescription page',    color: '#10B981' },
//             ].map((tip, i) => (
//               <Animated.View
//                 key={tip.text}
//                 entering={FadeInLeft.delay(i * 50 + 450).springify()}
//                 style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}
//               >
//                 <View style={{
//                   width: 34, height: 34, borderRadius: 10,
//                   backgroundColor: tip.color + '15', alignItems: 'center', justifyContent: 'center',
//                 }}>
//                   <Ionicons name={tip.icon as any} size={16} color={tip.color} />
//                 </View>
//                 <Text style={{ fontSize: 13, color: '#475569', flex: 1, lineHeight: 18 }} className="dark:text-slate-400">{tip.text}</Text>
//                 <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tip.color + '60' }} />
//               </Animated.View>
//             ))}
//           </Animated.View>

//           {/* ── Submit button ── */}
//           <Animated.View entering={FadeInUp.delay(500).duration(400)}>
//             <PressCard
//               onPress={() => isFormValid && setStep('modal2')}
//               disabled={!isFormValid}
//               style={{ borderRadius: 20 }}
//             >
//               <View style={{
//                 paddingVertical: 18, borderRadius: 20,
//                 alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10,
//                 backgroundColor: isFormValid ? '#6366F1' : '#E2E8F0',
//                 ...(isFormValid ? {
//                   shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 },
//                   shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
//                 } : {}),
//               }} className={!isFormValid ? "dark:bg-slate-800" : ""}>
//                 <Ionicons
//                   name={isFormValid ? 'paper-plane' : 'cloud-upload-outline'}
//                   size={22}
//                   color={isFormValid ? '#FFFFFF' : '#94A3B8'}
//                 />
//                 <Text style={{
//                   fontSize: 16, fontWeight: '800',
//                   color: isFormValid ? '#FFFFFF' : '#94A3B8',
//                   letterSpacing: 0.2,
//                 }}>
//                   {isFormValid ? 'Submit Prescription' : 'Add Prescription First'}
//                 </Text>
//               </View>
//             </PressCard>
//           </Animated.View>

//         </View>
//       </ScrollView>

//       {/* ── WhatsApp FAB ── */}
//       <Animated.View
//         entering={ZoomIn.delay(700).springify()}
//         style={{
//           position: 'absolute',
//           bottom: Platform.OS === 'ios' ? 104 : 92,
//           right: 20,
//         }}
//       >
//         <TouchableOpacity
//           onPress={handleWhatsApp}
//           activeOpacity={0.85}
//           style={{
//             width: 58, height: 58, borderRadius: 29,
//             backgroundColor: '#25D366',
//             alignItems: 'center', justifyContent: 'center',
//             shadowColor: '#25D366', shadowOffset: { width: 0, height: 6 },
//             shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
//           }}
//         >
//           <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
//         </TouchableOpacity>
//       </Animated.View>

//       {/* ── Modals ── */}
//       <DeliveryModal
//         visible={step === 'modal2'}
//         loading={loading}
//         progress={progress}
//         onBack={() => setStep('idle')}
//         onSubmit={handleSubmit}
//       />
//     </View>
//   );
// }



import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert, Image, Linking, Platform, Pressable,
  ScrollView, Text, TextInput, TouchableOpacity,
  useColorScheme, View,
} from 'react-native';
import Animated, {
  FadeInDown, FadeInLeft, FadeInRight, FadeInUp,
  useAnimatedStyle, useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeliveryModal } from '@/src/components/DeliveryModal';
import { useAuth } from '@/src/context/AuthContext';
import { orderService } from '@/src/services/orderService';
import { submitPrescriptionOrder } from '@/src/services/prescriptionService';

type Step = 'idle' | 'modal1' | 'modal2' | 'success';
type OrderMethod = 'upload' | 'text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
function PressCard({ onPress, children, style, disabled }: {
  onPress: () => void; children: React.ReactNode; style?: any; disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={[animStyle, style]}
      onPressIn={() => { if (!disabled) scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { firebaseUser, appUser } = useAuth();
  const firstName = appUser?.name?.split(' ')[0] ?? 'there';
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [orderMethod, setOrderMethod] = useState<OrderMethod>('upload');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, active: 0, done: 0 });

  React.useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribe = orderService.listenToUserOrders(firebaseUser.uid, (orders) => {
      const active = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped').length;
      const done = orders.filter(o => o.status === 'delivered').length;
      setStats({ total: orders.length, active, done });
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  const SHOP_WHATSAPP = '+923191796621';

  async function pickImage(source: 'camera' | 'gallery') {
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', `Allow ${source} access in Settings.`); return; }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSubmit(address: string, phone: string) {
    setLoading(true); setProgress(0);
    try {
      const id = await submitPrescriptionOrder(
        { imageUri, message, address, phone, userId: appUser?.uid ?? 'anonymous', userName: appUser?.name ?? 'User' },
        setProgress,
      );
      setOrderId(id); setStep('success');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to submit. Please try again.');
    } finally { setLoading(false); setProgress(0); }
  }

  function reset() { setImageUri(null); setMessage(''); setOrderId(null); setStep('idle'); }

  const handleWhatsApp = () => {
    const num = SHOP_WHATSAPP.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${num}?text=${encodeURIComponent('Hello! I need help with my prescription order.')}`;
    Linking.canOpenURL(url).then(ok => ok ? Linking.openURL(url) : Alert.alert('Error', 'WhatsApp not installed'));
  };

  const isFormValid = orderMethod === 'upload' ? imageUri !== null : message.trim().length > 0;

  // Color tokens based on isDark
  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';
  const toggleBg = isDark ? '#1E293B' : 'rgba(148,163,184,0.15)';

  // Success screen
  if (step === 'success') {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: insets.top }}>
        <Animated.View entering={ZoomIn.springify()} style={{
          width: 100, height: 100, borderRadius: 28,
          backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
          alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
        }}>
          <Ionicons name="checkmark-circle" size={60} color="#10B981" />
        </Animated.View>
        <Animated.Text entering={FadeInUp.delay(150).springify()} style={{ fontSize: 26, fontWeight: '900', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
          Order Placed!
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(220).springify()} style={{ fontSize: 14, color: textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 12 }}>
          Your prescription has been submitted.{'\n'}We'll confirm your order shortly.
        </Animated.Text>
        {orderId && (
          <Animated.View entering={FadeInUp.delay(300).springify()} style={{
            backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF',
            borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
            flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32,
          }}>
            <Ionicons name="receipt-outline" size={16} color="#6366F1" />
            <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '700' }}>
              Order ID: {orderId.slice(0, 12).toUpperCase()}
            </Text>
          </Animated.View>
        )}
        <Animated.View entering={FadeInUp.delay(380).springify()} style={{ width: '100%' }}>
          <PressCard onPress={reset} style={{ borderRadius: 20 }}>
            <View style={{
              backgroundColor: '#6366F1', borderRadius: 20, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
            }}>
              <Ionicons name="home" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Back to Home</Text>
            </View>
          </PressCard>
        </Animated.View>
      </View>
    );
  }

  const QUICK_ACTIONS = [
    { icon: 'chatbubble-ellipses', label: 'Chat\nPharmacy', color: '#6366F1', iconBg: isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF' },
    { icon: 'cart',               label: 'My\nOrders',    color: '#10B981', iconBg: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' },
    { icon: 'document-text',      label: 'My Rx\nHistory', color: '#F59E0B', iconBg: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB' },
    { icon: 'call',               label: 'Call\nUs',      color: '#EF4444', iconBg: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

        {/* Hero Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: isDark ? '#312E81' : '#6366F1',
            paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 24,
            borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
            shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 13, color: '#C7D2FE', fontWeight: '500', marginBottom: 2 }}>Good day,</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 }}>{firstName}</Text>
            </View>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F87171', borderWidth: 1.5, borderColor: '#6366F1' }} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Orders', value: stats.total.toString(), icon: 'receipt-outline', color: '#FDE68A' },
              { label: 'Active', value: stats.active.toString(), icon: 'time-outline', color: '#6EE7B7' },
              { label: 'Done',   value: stats.done.toString(),   icon: 'checkmark-circle', color: '#A5B4FC' },
            ].map((s, i) => (
              <Animated.View key={s.label} entering={FadeInDown.delay(i * 60 + 200).springify()} style={{ flex: 1 }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginTop: 8, marginBottom: 2 }}>{s.value}</Text>
                  <Text style={{ fontSize: 10, color: '#C7D2FE', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary, marginBottom: 14 }}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <Animated.View key={a.label} entering={FadeInDown.delay(i * 50 + 250).springify()} style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: cardBg, borderRadius: 20, padding: 14, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}
                    onPress={() => a.label.includes('Call') && handleWhatsApp()}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: a.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Ionicons name={a.icon as any} size={22} color={a.color} />
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: textSecondary, textAlign: 'center', lineHeight: 14 }}>{a.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* New Prescription */}
          <Animated.View entering={FadeInDown.delay(320).duration(400)} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary }}>New Prescription</Text>
              {isFormValid && (
                <Animated.View entering={FadeInRight.springify()} style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981' }}>Ready</Text>
                </Animated.View>
              )}
            </View>

            {/* Method toggle */}
            <View style={{ flexDirection: 'row', backgroundColor: toggleBg, borderRadius: 16, padding: 4, marginBottom: 16 }}>
              {(['upload', 'text'] as const).map(m => (
                <Pressable
                  key={m}
                  onPress={() => setOrderMethod(m)}
                  style={{
                    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12,
                    flexDirection: 'row', justifyContent: 'center', gap: 6,
                    backgroundColor: orderMethod === m ? cardBg : 'transparent',
                    ...(orderMethod === m ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : {}),
                  }}
                >
                  <Ionicons name={m === 'upload' ? 'camera' : 'create-outline'} size={15} color={orderMethod === m ? '#6366F1' : '#94A3B8'} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: orderMethod === m ? textPrimary : '#94A3B8' }}>
                    {m === 'upload' ? 'Upload Photo' : 'Type Medicine'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Upload area */}
            {orderMethod === 'upload' ? (
              !imageUri ? (
                <View style={{ backgroundColor: cardBg, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: borderColor, padding: 32, alignItems: 'center', elevation: 2 }}>
                  <Animated.View entering={ZoomIn.delay(100).springify()} style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="document-text" size={38} color="#EF4444" />
                  </Animated.View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: textPrimary, marginBottom: 6 }}>Upload Prescription</Text>
                  <Text style={{ fontSize: 13, color: textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>Take a clear photo or choose from your gallery</Text>
                  <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    {(['camera', 'gallery'] as const).map((src, i) => (
                      <Animated.View key={src} entering={FadeInDown.delay(i * 60 + 100).springify()} style={{ flex: 1 }}>
                        <PressCard onPress={() => pickImage(src)} style={{ borderRadius: 16 }}>
                          <View style={{ backgroundColor: src === 'camera' ? '#EF4444' : '#6366F1', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                            <Ionicons name={src === 'camera' ? 'camera' : 'images'} size={18} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, textTransform: 'capitalize' }}>{src}</Text>
                          </View>
                        </PressCard>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ) : (
                <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: cardBg, borderRadius: 24, overflow: 'hidden', elevation: 6 }}>
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.08)' }} />
                    <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#10B981', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Ionicons name="checkmark-circle" size={14} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Uploaded</Text>
                    </View>
                    <Pressable onPress={() => setImageUri(null)} hitSlop={8} style={{ position: 'absolute', top: 12, left: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="close" size={18} color="#fff" />
                    </Pressable>
                  </View>
                  <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="image" size={22} color="#6366F1" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary }}>prescription.jpg</Text>
                      <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>Ready to submit</Text>
                    </View>
                    <View style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>JPG</Text>
                    </View>
                  </View>
                </Animated.View>
              )
            ) : (
              <View style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, elevation: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? '#334155' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="create" size={20} color="#6366F1" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary }}>Type your medicines</Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: inputBg, borderRadius: 16,
                    padding: 16, minHeight: 130, fontSize: 14, color: textPrimary, lineHeight: 22,
                    borderWidth: 1.5, borderColor: message.length > 0 ? '#6366F1' : borderColor,
                    textAlignVertical: 'top',
                  }}
                  placeholder={'E.g., Panadol 500mg - 2 strips\nAugmentin 625mg - 1 pack\nVitamin C - 1 bottle'}
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={message}
                  onChangeText={setMessage}
                />
              </View>
            )}
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInDown.delay(420).duration(400)} style={{ backgroundColor: cardBg, borderRadius: 24, padding: 20, marginBottom: 20, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: textPrimary }}>Tips for best results</Text>
            </View>
            {[
              { icon: 'sunny-outline', text: 'Use natural lighting for clear photos', color: '#F59E0B' },
              { icon: 'text-outline',  text: 'Ensure all text is clearly readable',   color: '#6366F1' },
              { icon: 'scan-outline',  text: 'Capture the full prescription page',    color: '#10B981' },
            ].map((tip, i) => (
              <Animated.View key={tip.text} entering={FadeInLeft.delay(i * 50 + 450).springify()} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: tip.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={tip.icon as any} size={16} color={tip.color} />
                </View>
                <Text style={{ fontSize: 13, color: textSecondary, flex: 1, lineHeight: 18 }}>{tip.text}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Submit */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)}>
            <PressCard onPress={() => isFormValid && setStep('modal2')} disabled={!isFormValid} style={{ borderRadius: 20 }}>
              <View style={{
                paddingVertical: 18, borderRadius: 20,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10,
                backgroundColor: isFormValid ? '#6366F1' : (isDark ? '#334155' : '#E2E8F0'),
                ...(isFormValid ? { shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 } : {}),
              }}>
                <Ionicons name={isFormValid ? 'paper-plane' : 'cloud-upload-outline'} size={22} color={isFormValid ? '#FFFFFF' : '#94A3B8'} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: isFormValid ? '#FFFFFF' : '#94A3B8', letterSpacing: 0.2 }}>
                  {isFormValid ? 'Submit Prescription' : 'Add Prescription First'}
                </Text>
              </View>
            </PressCard>
          </Animated.View>

        </View>
      </ScrollView>

      {/* WhatsApp FAB */}
      <Animated.View entering={ZoomIn.delay(700).springify()} style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 104 : 92, right: 20 }}>
        <TouchableOpacity onPress={handleWhatsApp} activeOpacity={0.85} style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', shadowColor: '#25D366', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 }}>
          <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <DeliveryModal
        visible={step === 'modal2'}
        loading={loading}
        progress={progress}
        isDark={isDark}
        onBack={() => setStep('idle')}
        onSubmit={handleSubmit}
      />
    </View>
  );
}