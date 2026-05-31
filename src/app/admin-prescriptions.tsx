// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//     ActivityIndicator, Alert, Image, Pressable,
//     RefreshControl, ScrollView, Text, TextInput,
//     TouchableOpacity, View, useColorScheme
// } from 'react-native';
// import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { PrescriptionCardSkeleton, HomeHeaderSkeleton } from '../components/Skeleton';
// import { DEFAULT_SHOP } from '../constants/shops';
// import { useAuth } from '../context/AuthContext';
// import { prescriptionService } from '../services/prescriptionService';
// import { Prescription, PrescriptionStatus } from '../types';

// // ─── Status config ────────────────────────────────────────────────────────────
// const STATUS_CFG: Record<PrescriptionStatus, { label: string; color: string; bg: string; icon: string }> = {
//   pending:   { label: 'Reviewing', icon: 'time-outline',       color: '#005CAB', bg: '#EBF5FF' },
//   quoted:    { label: 'Ready to Pay', icon: 'card-outline',     color: '#0369A1', bg: '#F0F9FF' },
//   approved:  { label: 'Approved',     icon: 'checkmark-circle', color: '#047857', bg: '#ECFDF5' },
//   delivered: { label: 'Delivered',    icon: 'cube-outline',     color: '#4338CA', bg: '#EEF2FF' },
//   rejected:  { label: 'Declined',     icon: 'alert-circle',     color: '#BE123C', bg: '#FFF1F2' },
// };

// const FILTERS: Array<{ label: string; value: PrescriptionStatus | 'all' }> = [
//   { label: 'All',       value: 'all'       },
//   { label: 'Reviewing', value: 'pending'   },
//   { label: 'To Pay',    value: 'quoted'    },
//   { label: 'Approved',  value: 'approved'  },
//   { label: 'Delivered', value: 'delivered' },
//   { label: 'Declined',  value: 'rejected'  },
// ];

// // ─── Quote sheet (absolute overlay — no Modal) ───────────────────────────────
// function QuoteModal({
//   visible, prescription, onClose, onSent,
// }: {
//   visible: boolean;
//   prescription: Prescription | null;
//   onClose: () => void;
//   onSent: () => void;
// }) {
//   const [amount,  setAmount]  = useState('');
//   const [msg,     setMsg]     = useState('');
//   const [loading, setLoading] = useState(false);
//   const dark = useColorScheme() === 'dark';

//   const T = {
//     modalBg:     dark ? '#161B22' : '#fff',
//     title:       dark ? '#F0F6FC' : '#0F172A',
//     subtitle:    dark ? '#8B949E' : '#64748B',
//     label:       dark ? '#8B949E' : '#374151',
//     inputBg:     dark ? '#0D1117' : '#F8FAFC',
//     inputText:   dark ? '#E6EDF3' : '#0F172A',
//     inputBorder: dark ? '#21262D' : '#E2E8F0',
//     placeholder: dark ? '#6E7681' : '#94A3B8',
//     iconBg:      dark ? '#1E3A5F' : '#DBEAFE',
//     closeBg:     dark ? '#21262D' : '#F1F5F9',
//     closeIcon:   dark ? '#8B949E' : '#64748B',
//     cancelBg:    dark ? '#21262D' : '#F1F5F9',
//     cancelText:  dark ? '#8B949E' : '#64748B',
//     nameText:    dark ? '#F0F6FC' : '#0F172A',
//   };

//   const submit = async () => {
//     if (!prescription) return;
//     const amt = parseFloat(amount);
//     if (!amount || isNaN(amt) || amt <= 0) {
//       Alert.alert('Invalid amount', 'Please enter a valid quote amount.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await prescriptionService.updatePrescriptionQuote(prescription.id, amt, msg);
//       Alert.alert('Quote sent', 'The customer has been notified.');
//       setAmount(''); setMsg('');
//       onSent();
//     } catch (e: any) {
//       Alert.alert('Error', e.message || 'Failed to send quote');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!visible) return null;

//   return (
//     <Animated.View
//       entering={FadeInDown.duration(180)}
//       style={{
//         position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//         backgroundColor: 'rgba(15,23,42,0.6)',
//         alignItems: 'center', justifyContent: 'center',
//         paddingHorizontal: 20, zIndex: 999,
//       }}
//     >
//       <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

//       <Animated.View
//         entering={FadeInUp.duration(220).springify()}
//         style={{
//           backgroundColor: T.modalBg, borderRadius: 28, padding: 24,
//           width: '100%', maxWidth: 400,
//           shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
//           shadowOpacity: 0.2, shadowRadius: 32, elevation: 20,
//           borderWidth: dark ? 1 : 0,
//           borderColor: dark ? '#21262D' : 'transparent',
//         }}
//       >
//         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//             <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: T.iconBg, alignItems: 'center', justifyContent: 'center' }}>
//               <Ionicons name="card-outline" size={20} color="#005CAB" />
//             </View>
//             <Text style={{ fontSize: 18, fontWeight: '900', color: T.title }}>Send Quote</Text>
//           </View>
//           <TouchableOpacity
//             onPress={onClose}
//             style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: T.closeBg, alignItems: 'center', justifyContent: 'center' }}
//           >
//             <Ionicons name="close" size={18} color={T.closeIcon} />
//           </TouchableOpacity>
//         </View>

//         <Text style={{ fontSize: 13, color: T.subtitle, marginBottom: 20, lineHeight: 18 }}>
//           Enter the quote amount for{' '}
//           <Text style={{ fontWeight: '700', color: T.nameText }}>{prescription?.userName || 'this customer'}</Text>
//         </Text>

//         {/* Amount */}
//         <Text style={{ fontSize: 12, fontWeight: '700', color: T.label, marginBottom: 6 }}>Quote Amount ($)</Text>
//         <View style={{
//           backgroundColor: T.inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
//           borderWidth: 1.5, borderColor: amount ? '#6366F1' : T.inputBorder, marginBottom: 14,
//         }}>
//           <TextInput
//             style={{ fontSize: 15, color: T.inputText, padding: 0, fontWeight: '700' }}
//             placeholder="e.g. 1500"
//             placeholderTextColor={T.placeholder}
//             keyboardType="numeric"
//             value={amount}
//             onChangeText={setAmount}
//             editable={!loading}
//           />
//         </View>

//         {/* Message */}
//         <Text style={{ fontSize: 12, fontWeight: '700', color: T.label, marginBottom: 6 }}>Message (optional)</Text>
//         <View style={{
//           backgroundColor: T.inputBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
//           borderWidth: 1.5, borderColor: msg ? '#6366F1' : T.inputBorder, marginBottom: 20,
//         }}>
//           <TextInput
//             style={{ fontSize: 14, color: T.inputText, padding: 0, minHeight: 70, textAlignVertical: 'top' }}
//             placeholder="e.g. Includes delivery charges"
//             placeholderTextColor={T.placeholder}
//             multiline
//             value={msg}
//             onChangeText={setMsg}
//             editable={!loading}
//           />
//         </View>

//         <View style={{ flexDirection: 'row', gap: 10 }}>
//           <TouchableOpacity
//             onPress={onClose}
//             disabled={loading}
//             style={{ flex: 1, backgroundColor: T.cancelBg, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
//           >
//             <Text style={{ fontSize: 14, fontWeight: '700', color: T.cancelText }}>Cancel</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={submit}
//             disabled={loading}
//             style={{
//               flex: 2, backgroundColor: '#005CAB', borderRadius: 14, paddingVertical: 14,
//               alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
//               shadowColor: '#005CAB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
//             }}
//           >
//             {loading
//               ? <ActivityIndicator size="small" color="#fff" />
//               : <>
//                   <Ionicons name="send" size={16} color="#fff" />
//                   <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Send Quote</Text>
//                 </>
//             }
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     </Animated.View>
//   );
// }

// // ─── Prescription card ────────────────────────────────────────────────────────
// function PrescriptionItem({
//   prescription, onQuote, onStatus, updating,
// }: {
//   prescription: Prescription;
//   onQuote: (p: Prescription) => void;
//   onStatus: (id: string, status: PrescriptionStatus) => void;
//   updating: boolean;
// }) {
//   const cfg = STATUS_CFG[prescription.status];
//   const dark = useColorScheme() === 'dark';
//   const imageUri = (prescription.imageURL || prescription.imageUrl || '').trim() || null;
//   const hasImage = !!imageUri;

//   const statusBg = dark
//     ? { pending: '#0C2A44', quoted: '#082F49', approved: '#064E3B', delivered: '#1E1B4B', rejected: '#4C0519' }[prescription.status]
//     : cfg.bg;

//   const dateStr = (() => {
//     try {
//       const d = new Date(prescription.createdAt);
//       return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
//         ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } catch { return '—'; }
//   })();

//   return (
//     <View style={{
//       backgroundColor: dark ? '#161B22' : '#FFFFFF',
//       borderRadius: 24, marginBottom: 16, overflow: 'hidden',
//       shadowColor: cfg.color, shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: dark ? 0.2 : 0.1, shadowRadius: 14, elevation: 5,
//       borderWidth: dark ? 1 : 0,
//       borderColor: dark ? '#21262D' : 'transparent',
//     }}>
//       {/* Accent bar */}
//       <View style={{ height: 3, backgroundColor: cfg.color }} />

//       {/* Prescription image */}
//       {hasImage && (
//         <View style={{ position: 'relative' }}>
//           <Image
//             source={{ uri: imageUri }}
//             style={{ width: '100%', height: 180 }}
//             resizeMode="cover"
//           />
//           <View style={{
//             position: 'absolute', top: 10, right: 10,
//             flexDirection: 'row', alignItems: 'center', gap: 4,
//             backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
//           }}>
//             <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
//             <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
//           </View>
//         </View>
//       )}

//       <View style={{ padding: 16 }}>
//         {/* Header */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//             <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: cfg.bg, alignItems: 'center', justifyContent: 'center' }}>
//               <Ionicons name="person" size={20} color={cfg.color} />
//             </View>
//             <View>
//               <Text style={{ fontSize: 15, fontWeight: '800', color: dark ? '#F0F6FC' : '#0F172A' }}>
//                 {prescription.userName || 'Customer'}
//               </Text>
//               <Text style={{ fontSize: 11, color: dark ? '#6E7681' : '#94A3B8', marginTop: 1 }}>{dateStr}</Text>
//             </View>
//           </View>
//           {/* Status badge (when no image) */}
//           {!hasImage && (
//             <View style={{
//               flexDirection: 'row', alignItems: 'center', gap: 4,
//               backgroundColor: statusBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
//             }}>
//               <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
//               <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
//             </View>
//           )}
//         </View>

//         {/* Medicine text (typed order) */}
//         {prescription.message ? (
//           <View style={{
//             backgroundColor: dark ? '#0D1117' : '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 10,
//             borderLeftWidth: 3, borderLeftColor: '#6366F1',
//           }}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
//               <Ionicons name="create-outline" size={14} color="#6366F1" />
//               <Text style={{ fontSize: 11, fontWeight: '700', color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
//                 Requested Items
//               </Text>
//             </View>
//             <Text style={{ fontSize: 12, color: dark ? '#8B949E' : '#475569', lineHeight: 18 }}>
//               {prescription.message}
//             </Text>
//           </View>
//         ) : null}

//         {/* Delivery info */}
//         {(prescription.address || prescription.phone) && (
//           <View style={{
//             backgroundColor: dark ? '#064E3B' : '#F0FDF4', borderRadius: 14, padding: 12, marginBottom: 10,
//             flexDirection: 'row', gap: 12,
//           }}>
//             {prescription.address && (
//               <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
//                 <Ionicons name="location-outline" size={14} color="#10B981" style={{ marginTop: 1 }} />
//                 <Text style={{ fontSize: 12, color: dark ? '#6EE7B7' : '#065F46', flex: 1, lineHeight: 18 }}>
//                   {prescription.address}
//                 </Text>
//               </View>
//             )}
//             {prescription.phone && (
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
//                 <Ionicons name="call-outline" size={14} color="#10B981" />
//                 <Text style={{ fontSize: 12, color: dark ? '#6EE7B7' : '#065F46', fontWeight: '600' }}>
//                   {prescription.phone}
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {/* Quote info */}
//         {prescription.quoteAmount != null && (
//           <View style={{
//             backgroundColor: dark ? '#1E3A5F' : '#EFF6FF', borderRadius: 14, padding: 12, marginBottom: 10,
//             flexDirection: 'row', alignItems: 'center', gap: 10,
//           }}>
//             <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: dark ? '#0C2A44' : '#EBF5FF', alignItems: 'center', justifyContent: 'center' }}>
//               <Ionicons name="card-outline" size={18} color="#005CAB" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={{ fontSize: 11, color: dark ? '#60A5FA' : '#93C5FD', fontWeight: '600' }}>Quote Amount</Text>
//               <Text style={{ fontSize: 18, fontWeight: '900', color: '#047857' }}>
//                 ${prescription.quoteAmount.toLocaleString()}
//               </Text>
//               {prescription.adminMessage ? (
//                 <Text style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>{prescription.adminMessage}</Text>
//               ) : null}
//             </View>
//           </View>
//         )}

//         {/* Action buttons */}
//         <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
//           {prescription.status === 'pending' && (
//             <TouchableOpacity
//               onPress={() => onQuote(prescription)}
//               disabled={updating}
//               style={{
//                 flex: 1, backgroundColor: '#005CAB', borderRadius: 14, paddingVertical: 12,
//                 alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
//                 shadowColor: '#005CAB', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
//               }}
//             >
//               <Ionicons name="card-outline" size={15} color="#fff" />
//               <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Send Quote</Text>
//             </TouchableOpacity>
//           )}

//           {prescription.status === 'quoted' && (
//             <>
//               <TouchableOpacity
//                 onPress={() => onStatus(prescription.id, 'approved')}
//                 disabled={updating}
//                 style={{
//                   flex: 1, backgroundColor: '#059669', borderRadius: 14, paddingVertical: 12,
//                   alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
//                   shadowColor: '#059669', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
//                 }}
//               >
//                 <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
//                 <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Approve</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => onStatus(prescription.id, 'rejected')}
//                 disabled={updating}
//                 style={{
//                   flex: 1, backgroundColor: '#DC2626', borderRadius: 14, paddingVertical: 12,
//                   alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
//                   shadowColor: '#DC2626', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
//                 }}
//               >
//                 <Ionicons name="close-circle-outline" size={15} color="#fff" />
//                 <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Reject</Text>
//               </TouchableOpacity>
//             </>
//           )}

//           {prescription.status === 'approved' && (
//             <TouchableOpacity
//               onPress={() => onStatus(prescription.id, 'delivered')}
//               disabled={updating}
//               style={{
//                 flex: 1, backgroundColor: '#4F46E5', borderRadius: 14, paddingVertical: 12,
//                 alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
//                 shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
//               }}
//             >
//               <Ionicons name="bag-check-outline" size={15} color="#fff" />
//               <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Mark Delivered</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

// // ─── Main screen ──────────────────────────────────────────────────────────────
// export default function AdminPrescriptionsScreen() {
//   const insets = useSafeAreaInsets();
//   const router = useRouter();
//   const { isAdmin } = useAuth();
//   const dark = useColorScheme() === 'dark';

//   const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
//   const [loading,        setLoading]       = useState(true);
//   const [refreshing,     setRefreshing]    = useState(false);
//   const [filter,         setFilter]        = useState<PrescriptionStatus | 'all'>('all');
//   const [quoteTarget,    setQuoteTarget]   = useState<Prescription | null>(null);
//   const [updating,       setUpdating]      = useState(false);

//   useEffect(() => {
//     if (!isAdmin) { Alert.alert('Access Denied', 'Admin privileges required'); router.replace('/(tabs)'); }
//   }, [isAdmin]);

//   const load = async (isRefresh = false) => {
//     try {
//       isRefresh ? setRefreshing(true) : setLoading(true);
//       const data = await prescriptionService.getShopPrescriptions(DEFAULT_SHOP.id);
//       data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//       setPrescriptions(data);
//     } catch (e: any) {
//       Alert.alert('Error', e.message || 'Failed to load');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const handleStatus = async (id: string, status: PrescriptionStatus) => {
//     setUpdating(true);
//     try {
//       if (status === 'approved')  await prescriptionService.approvePrescription(id);
//       if (status === 'rejected')  await prescriptionService.rejectPrescription(id);
//       if (status === 'delivered') await prescriptionService.deliverPrescription(id);
//       await load();
//     } catch (e: any) {
//       Alert.alert('Error', e.message || 'Failed to update');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const filtered = filter === 'all'
//     ? prescriptions
//     : prescriptions.filter(p => p.status === filter);

//   const counts = prescriptions.reduce<Record<string, number>>((acc, p) => {
//     acc[p.status] = (acc[p.status] ?? 0) + 1;
//     return acc;
//   }, {});

//   if (!isAdmin) return null;

//   return (
//     <View style={{ flex: 1, backgroundColor: dark ? '#0D1117' : '#F8FAFC', paddingTop: insets.top }}>

//       {/* ── Header ── */}
//       <Animated.View
//         entering={FadeInDown.duration(350)}
//         style={{
//           backgroundColor: dark ? '#161B22' : '#FFFFFF',
//           paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
//           shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: dark ? 0.4 : 0.06, shadowRadius: 8, elevation: 4,
//           borderBottomWidth: dark ? 1 : 0,
//           borderBottomColor: dark ? '#21262D' : 'transparent',
//         }}
//       >
//         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: dark ? '#21262D' : '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
//             >
//               <Ionicons name="arrow-back" size={22} color={dark ? '#E6EDF3' : '#1E293B'} />
//             </TouchableOpacity>
//             <View>
//               <Text style={{ fontSize: 22, fontWeight: '900', color: dark ? '#F0F6FC' : '#0F172A' }}>Prescriptions</Text>
//               <Text style={{ fontSize: 12, color: dark ? '#6E7681' : '#94A3B8', marginTop: 1 }}>
//                 {filtered.length} {filter === 'all' ? 'total' : filter}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity
//             onPress={() => load(true)}
//             disabled={loading || refreshing}
//             style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: dark ? '#1E1B4B' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}
//           >
//             <Ionicons name="refresh" size={20} color="#6366F1" />
//           </TouchableOpacity>
//         </View>

//         {/* Filter chips */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
//           {FILTERS.map(f => {
//             const active = filter === f.value;
//             const count  = f.value === 'all' ? prescriptions.length : (counts[f.value] ?? 0);
//             if (f.value !== 'all' && count === 0) return null;
//             return (
//               <TouchableOpacity
//                 key={f.value}
//                 onPress={() => setFilter(f.value)}
//                 style={{
//                   flexDirection: 'row', alignItems: 'center', gap: 5,
//                   paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
//                   backgroundColor: active ? '#6366F1' : (dark ? '#21262D' : '#F1F5F9'),
//                 }}
//               >
//                 <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : (dark ? '#8B949E' : '#374151') }}>
//                   {f.label}
//                 </Text>
//                 <View style={{
//                   backgroundColor: active ? 'rgba(255,255,255,0.25)' : (dark ? '#30363D' : '#E2E8F0'),
//                   borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
//                 }}>
//                   <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : (dark ? '#6E7681' : '#64748B') }}>
//                     {count}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>
//       </Animated.View>

//       {/* ── Content ── */}
//       {loading ? (
//         <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
//           {[1, 2, 3, 4].map(i => <PrescriptionCardSkeleton key={i} />)}
//         </ScrollView>
//       ) : filtered.length === 0 ? (
//         <Animated.View entering={FadeInUp.delay(100).springify()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
//           <View style={{
//             width: 80, height: 80, borderRadius: 24,
//             backgroundColor: dark ? '#21262D' : '#F1F5F9',
//             alignItems: 'center', justifyContent: 'center', marginBottom: 16,
//           }}>
//             <Ionicons name="document-text-outline" size={40} color={dark ? '#6E7681' : '#CBD5E1'} />
//           </View>
//           <Text style={{ fontSize: 16, fontWeight: '800', color: dark ? '#F0F6FC' : '#374151', marginBottom: 6, textAlign: 'center' }}>
//             {filter === 'all' ? 'No prescriptions yet' : `No ${filter} prescriptions`}
//           </Text>
//           <Text style={{ fontSize: 13, color: dark ? '#6E7681' : '#94A3B8', textAlign: 'center', lineHeight: 20 }}>
//             {filter === 'all'
//               ? 'Prescriptions from customers will appear here'
//               : 'Try a different filter'}
//           </Text>
//         </Animated.View>
//       ) : (
//         <ScrollView
//           contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#6366F1" />
//           }
//         >
//           {filtered.map((p, idx) => (
//             <Animated.View key={p.id} entering={FadeInDown.delay(idx * 50).springify()}>
//               <PrescriptionItem
//                 prescription={p}
//                 onQuote={setQuoteTarget}
//                 onStatus={handleStatus}
//                 updating={updating}
//               />
//             </Animated.View>
//           ))}
//         </ScrollView>
//       )}

//       {/* ── Quote modal ── */}
//       <QuoteModal
//         visible={!!quoteTarget}
//         prescription={quoteTarget}
//         onClose={() => setQuoteTarget(null)}
//         onSent={() => { setQuoteTarget(null); load(); }}
//       />
//     </View>
//   );
// }


import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrescriptionCardSkeleton } from '../components/Skeleton';
import { ModernAlert, ModernToast, AlertType } from '../components/ModernAlert';
import { DEFAULT_SHOP } from '../constants/shops';
import { useAuth } from '../context/AuthContext';
import { prescriptionService } from '../services/prescriptionService';
import { Prescription, PrescriptionStatus } from '../types';

const ACCENT = '#4F46E5';

const STATUS_CFG: Record<
  PrescriptionStatus,
  { label: string; color: string; bg: string; bgDark: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { label: 'Reviewing', icon: 'time-outline', color: '#2563EB', bg: '#EFF6FF', bgDark: '#1E3A5F' },
  quoted: { label: 'Ready to pay', icon: 'card-outline', color: '#0369A1', bg: '#F0F9FF', bgDark: '#0C4A6E' },
  approved: { label: 'Approved', icon: 'checkmark-circle-outline', color: '#059669', bg: '#ECFDF5', bgDark: '#064E3B' },
  delivered: { label: 'Delivered', icon: 'cube-outline', color: '#4F46E5', bg: '#EEF2FF', bgDark: '#312E81' },
  rejected: { label: 'Declined', icon: 'close-circle-outline', color: '#DC2626', bg: '#FEF2F2', bgDark: '#7F1D1D' },
};

const FILTERS: Array<{ label: string; value: PrescriptionStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Reviewing', value: 'pending' },
  { label: 'To pay', value: 'quoted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Declined', value: 'rejected' },
];

function formatDate(iso: string | Date) {
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return (
      d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return '—';
  }
}

function StatusBadge({ status, dark }: { status: PrescriptionStatus; dark: boolean }) {
  const cfg = STATUS_CFG[status];
  return (
    <View
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{ backgroundColor: dark ? cfg.bgDark : cfg.bg }}
    >
      <Ionicons name={cfg.icon} size={12} color={cfg.color} />
      <Text className="text-[11px] font-semibold" style={{ color: cfg.color }}>
        {cfg.label}
      </Text>
    </View>
  );
}

function FilterChip({
  label,
  count,
  active,
  onPress,
  dark,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  dark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl border ${
        active
          ? 'bg-indigo-600 border-indigo-600'
          : dark
            ? 'bg-[#161B22] border-zinc-800'
            : 'bg-white border-slate-200'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${active ? 'text-white' : dark ? 'text-slate-400' : 'text-slate-600'}`}
      >
        {label}
      </Text>
      <View
        className={`px-1.5 py-0.5 rounded-md min-w-[20px] items-center ${
          active ? 'bg-white/20' : dark ? 'bg-zinc-800' : 'bg-slate-100'
        }`}
      >
        <Text
          className={`text-[10px] font-bold ${active ? 'text-white' : dark ? 'text-slate-500' : 'text-slate-500'}`}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function QuoteModal({
  visible,
  prescription,
  onClose,
  onSent,
}: {
  visible: boolean;
  prescription: Prescription | null;
  onClose: () => void;
  onSent: (msg?: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: AlertType }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const dark = useColorScheme() === 'dark';

  const showAlert = (title: string, message: string, type: AlertType = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const submit = async () => {
    if (!prescription) return;
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      showAlert('Invalid amount', 'Enter a valid quote amount.');
      return;
    }
    setLoading(true);
    try {
      await prescriptionService.updatePrescriptionQuote(prescription.id, amt, msg);
      setAmount('');
      setMsg('');
      onSent('Quote sent successfully!');
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to send quote');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      className="absolute inset-0 z-50 items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
    >
      <Pressable onPress={onClose} className="absolute inset-0" />
      <Animated.View
        entering={FadeInUp.duration(250).springify()}
        className={`w-full max-w-[400px] rounded-2xl p-5 border ${
          dark ? 'bg-[#161B22] border-zinc-800' : 'bg-white border-slate-100'
        }`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-indigo-500/10 items-center justify-center">
              <Ionicons name="card-outline" size={20} color={ACCENT} />
            </View>
            <Text className={`text-lg font-bold ${dark ? 'text-slate-50' : 'text-slate-900'}`}>
              Send quote
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className={`w-9 h-9 rounded-xl items-center justify-center ${dark ? 'bg-zinc-800' : 'bg-slate-100'}`}
          >
            <Ionicons name="close" size={18} color={dark ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>
        </View>

        <Text className={`text-sm mb-5 leading-5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Amount for{' '}
          <Text className={`font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>
            {prescription?.userName || 'customer'}
          </Text>
        </Text>

        <Text className={`text-xs font-semibold mb-2 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Amount (Rs.)
        </Text>
        <View
          className={`rounded-xl px-4 py-3 mb-4 border ${
            amount ? 'border-indigo-500' : dark ? 'border-zinc-700 bg-[#0D1117]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <TextInput
            className={`text-base font-semibold p-0 ${dark ? 'text-slate-100' : 'text-slate-900'}`}
            placeholder="e.g. 1500"
            placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />
        </View>

        <Text className={`text-xs font-semibold mb-2 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Note (optional)
        </Text>
        <View
          className={`rounded-xl px-4 py-3 mb-5 border ${
            msg ? 'border-indigo-500' : dark ? 'border-zinc-700 bg-[#0D1117]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <TextInput
            className={`text-sm p-0 min-h-[72px] ${dark ? 'text-slate-100' : 'text-slate-900'}`}
            placeholder="Delivery or packaging details…"
            placeholderTextColor={dark ? '#6B7280' : '#94A3B8'}
            multiline
            textAlignVertical="top"
            value={msg}
            onChangeText={setMsg}
            editable={!loading}
          />
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            disabled={loading}
            className={`flex-1 py-3.5 rounded-xl items-center ${dark ? 'bg-zinc-800' : 'bg-slate-100'}`}
          >
            <Text className={`text-sm font-semibold ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            className="flex-[2] py-3.5 rounded-xl items-center flex-row justify-center gap-2 bg-indigo-600"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={16} color="#fff" />
                <Text className="text-sm font-semibold text-white">Send quote</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ModernAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
    </Animated.View>
  );
}

function InfoBlock({
  icon,
  title,
  children,
  accent,
  dark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
  accent: string;
  dark: boolean;
}) {
  return (
    <View
      className={`rounded-xl p-3.5 mb-3 border ${
        dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
      }`}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name={icon} size={14} color={accent} />
        <Text className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function PrescriptionItem({
  prescription,
  onQuote,
  onStatus,
  updating,
}: {
  prescription: Prescription;
  onQuote: (p: Prescription) => void;
  onStatus: (id: string, status: PrescriptionStatus) => void;
  updating: boolean;
}) {
  const cfg = STATUS_CFG[prescription.status];
  const dark = useColorScheme() === 'dark';
  const imageUri = (prescription.imageURL || prescription.imageUrl || '').trim() || null;

  return (
    <View
      className={`rounded-2xl mb-4 overflow-hidden border ${
        dark ? 'bg-[#161B22] border-zinc-800' : 'bg-white border-slate-100'
      }`}
    >
      {imageUri ? (
        <View className="relative">
          <Image source={{ uri: imageUri }} className="w-full h-44" resizeMode="cover" />
          <View className="absolute top-3 right-3">
            <StatusBadge status={prescription.status} dark={dark} />
          </View>
        </View>
      ) : null}

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: dark ? cfg.bgDark : cfg.bg }}
            >
              <Ionicons name="person-outline" size={20} color={cfg.color} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-semibold ${dark ? 'text-slate-50' : 'text-slate-900'}`}
                numberOfLines={1}
              >
                {prescription.userName || 'Customer'}
              </Text>
              <Text className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {formatDate(prescription.createdAt)}
              </Text>
            </View>
          </View>
          {!imageUri ? <StatusBadge status={prescription.status} dark={dark} /> : null}
        </View>

        {prescription.message ? (
          <InfoBlock icon="medical-outline" title="Requested items" accent="#4F46E5" dark={dark}>
            <Text className={`text-sm leading-5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              {prescription.message}
            </Text>
          </InfoBlock>
        ) : null}

        {(prescription.address || prescription.phone) ? (
          <InfoBlock icon="location-outline" title="Delivery" accent="#059669" dark={dark}>
            {prescription.address ? (
              <Text className={`text-sm leading-5 mb-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                {prescription.address}
              </Text>
            ) : null}
            {prescription.phone ? (
              <View className="flex-row items-center gap-2">
                <Ionicons name="call-outline" size={14} color="#059669" />
                <Text className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {prescription.phone}
                </Text>
              </View>
            ) : null}
          </InfoBlock>
        ) : null}

        {prescription.quoteAmount != null ? (
          <View
            className={`rounded-xl p-3.5 mb-3 flex-row items-center gap-3 border ${
              dark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
            }`}
          >
            <View className="w-10 h-10 rounded-xl bg-indigo-500/15 items-center justify-center">
              <Ionicons name="wallet-outline" size={18} color={ACCENT} />
            </View>
            <View className="flex-1">
              <Text className={`text-[10px] font-semibold uppercase ${dark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                Quote
              </Text>
              <Text className={`text-xl font-bold mt-0.5 ${dark ? 'text-slate-50' : 'text-slate-900'}`}>
                Rs. {prescription.quoteAmount.toLocaleString()}
              </Text>
              {prescription.adminMessage ? (
                <Text className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {prescription.adminMessage}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View className="flex-row gap-2 mt-1">
          {prescription.status === 'pending' && (
            <TouchableOpacity
              onPress={() => onQuote(prescription)}
              disabled={updating}
              activeOpacity={0.8}
              className="flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 bg-indigo-600"
            >
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">Send quote</Text>
            </TouchableOpacity>
          )}

          {prescription.status === 'quoted' && (
            <>
              <TouchableOpacity
                onPress={() => onStatus(prescription.id, 'approved')}
                disabled={updating}
                className="flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 bg-emerald-600"
              >
                <Ionicons name="checkmark-outline" size={16} color="#fff" />
                <Text className="text-sm font-semibold text-white">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onStatus(prescription.id, 'rejected')}
                disabled={updating}
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 border ${
                  dark ? 'border-red-900/50 bg-red-950/30' : 'border-red-200 bg-red-50'
                }`}
              >
                <Ionicons name="close-outline" size={16} color="#DC2626" />
                <Text className="text-sm font-semibold text-red-600">Decline</Text>
              </TouchableOpacity>
            </>
          )}

          {prescription.status === 'approved' && (
            <TouchableOpacity
              onPress={() => onStatus(prescription.id, 'delivered')}
              disabled={updating}
              className="flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 bg-indigo-600"
            >
              <Ionicons name="cube-outline" size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">Mark delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function AdminPrescriptionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const dark = useColorScheme() === 'dark';

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PrescriptionStatus | 'all'>('all');
  const [quoteTarget, setQuoteTarget] = useState<Prescription | null>(null);
  const [updating, setUpdating] = useState(false);

  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: AlertType }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: AlertType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showAlert = (title: string, message: string, type: AlertType = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const showToast = (message: string, type: AlertType = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (!isAdmin) {
      showAlert('Access Denied', 'Admin privileges required');
      setTimeout(() => router.replace('/(tabs)'), 2000);
    }
  }, [isAdmin, router]);

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await prescriptionService.getShopPrescriptions(DEFAULT_SHOP.id);
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPrescriptions(data);
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const handleStatus = async (id: string, status: PrescriptionStatus) => {
    setUpdating(true);
    try {
      if (status === 'approved') {
        await prescriptionService.approvePrescription(id);
        showToast('Prescription approved');
      }
      if (status === 'rejected') {
        await prescriptionService.rejectPrescription(id);
        showToast('Prescription declined', 'warning');
      }
      if (status === 'delivered') {
        await prescriptionService.deliverPrescription(id);
        showToast('Marked as delivered');
      }
      await load();
    } catch (e: any) {
      showAlert('Error', e.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const filtered =
    filter === 'all' ? prescriptions : prescriptions.filter((p) => p.status === filter);

  const counts = prescriptions.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  if (!isAdmin) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-[#0D1117] items-center justify-center">
        <ModernAlert 
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
        />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-50 dark:bg-[#0D1117]"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        className={`px-5 pt-4 pb-3 border-b ${
          dark ? 'bg-[#161B22] border-zinc-800' : 'bg-white border-slate-100'
        }`}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className={`w-10 h-10 rounded-xl items-center justify-center border ${
                  dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Ionicons name="arrow-back" size={20} color={dark ? '#E2E8F0' : '#334155'} />
              </TouchableOpacity>
              <View>
                <Text className={`text-xl font-bold ${dark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Prescriptions
                </Text>
                <Text className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {DEFAULT_SHOP.name ?? 'Manage orders'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => load(true)}
              disabled={loading || refreshing}
              className={`w-10 h-10 rounded-xl items-center justify-center border ${
                dark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
              }`}
            >
              <Ionicons name="refresh-outline" size={20} color={ACCENT} />
            </TouchableOpacity>
          </View>

          {/* Summary strip */}
          <View className="flex-row gap-2 mb-4">
            <View
              className={`flex-1 rounded-xl px-3 py-2.5 border ${
                dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <Text className={`text-[10px] font-medium uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Total
              </Text>
              <Text className={`text-lg font-bold mt-0.5 ${dark ? 'text-slate-50' : 'text-slate-900'}`}>
                {prescriptions.length}
              </Text>
            </View>
            <View
              className={`flex-1 rounded-xl px-3 py-2.5 border ${
                dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <Text className={`text-[10px] font-medium uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                Reviewing
              </Text>
              <Text className="text-lg font-bold mt-0.5 text-blue-600 dark:text-blue-400">
                {counts.pending ?? 0}
              </Text>
            </View>
            <View
              className={`flex-1 rounded-xl px-3 py-2.5 border ${
                dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <Text className={`text-[10px] font-medium uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                To pay
              </Text>
              <Text className="text-lg font-bold mt-0.5 text-sky-600 dark:text-sky-400">
                {counts.quoted ?? 0}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((f) => {
              const count = f.value === 'all' ? prescriptions.length : counts[f.value] ?? 0;
              if (f.value !== 'all' && count === 0) return null;
              return (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  count={count}
                  active={filter === f.value}
                  onPress={() => setFilter(f.value)}
                  dark={!!dark}
                />
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* List */}
      {loading ? (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <PrescriptionCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <Animated.View
          entering={FadeInUp.delay(80).springify()}
          className="flex-1 items-center justify-center px-8"
        >
          <View
            className={`w-16 h-16 rounded-2xl items-center justify-center mb-4 ${
              dark ? 'bg-zinc-800' : 'bg-slate-100'
            }`}
          >
            <Ionicons name="document-text-outline" size={32} color={dark ? '#64748B' : '#94A3B8'} />
          </View>
          <Text className={`text-base font-semibold text-center ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
            {filter === 'all' ? 'No prescriptions yet' : `No ${STATUS_CFG[filter as PrescriptionStatus]?.label.toLowerCase() ?? filter} items`}
          </Text>
          <Text className={`text-sm text-center mt-2 leading-5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {filter === 'all'
              ? 'New customer prescriptions will show up here.'
              : 'Try another filter.'}
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={ACCENT} />
          }
        >
          <Text className={`text-xs font-medium mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Showing {filtered.length} {filter === 'all' ? 'prescriptions' : 'items'}
          </Text>
          {filtered.map((p, idx) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(idx * 40).springify()}>
              <PrescriptionItem
                prescription={p}
                onQuote={setQuoteTarget}
                onStatus={handleStatus}
                updating={updating}
              />
            </Animated.View>
          ))}
        </ScrollView>
      )}

      <QuoteModal
        visible={!!quoteTarget}
        prescription={quoteTarget}
        onClose={() => setQuoteTarget(null)}
        onSent={(msg) => {
          setQuoteTarget(null);
          load();
          if (msg) showToast(msg);
        }}
      />

      <ModernAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />

      <ModernToast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}