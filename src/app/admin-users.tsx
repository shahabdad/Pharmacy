// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     RefreshControl,
//     ScrollView,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
//     useColorScheme,
// } from 'react-native';
// import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useAuth } from '../context/AuthContext';
// import { userService } from '../services/userService';
// import { UserSkeleton } from '../components/Skeleton';
// import { User } from '../types';

// // ─── Avatar helpers ───────────────────────────────────────────────────────────
// const AVATAR_PALETTE = [
//   { bg: '#EDE9FE', fg: '#6D28D9' },
//   { bg: '#DBEAFE', fg: '#1D4ED8' },
//   { bg: '#D1FAE5', fg: '#065F46' },
//   { bg: '#FEF3C7', fg: '#92400E' },
//   { bg: '#FCE7F3', fg: '#9D174D' },
//   { bg: '#FEE2E2', fg: '#991B1B' },
// ];

// function avatarColor(name: string) {
//   return AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];
// }

// function initials(name: string): string {
//   if (!name) return '?';
//   return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
// }

// function timeAgo(date: Date): string {
//   try {
//     const diff = Math.floor((Date.now() - date.getTime()) / 1000);
//     if (diff < 60)    return 'just now';
//     if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
//     if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//     if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   } catch { return '—'; }
// }

// // ─── Role badge ───────────────────────────────────────────────────────────────
// function RoleBadge({ role }: { role: string }) {
//   const isAdmin = role === 'admin';
//   return (
//     <View style={{
//       flexDirection: 'row', alignItems: 'center', gap: 4,
//       backgroundColor: isAdmin ? '#EDE9FE' : '#F1F5F9',
//       paddingHorizontal: 8, paddingVertical: 3,
//       borderRadius: 20,
//     }}>
//       <Ionicons
//         name={isAdmin ? 'shield-checkmark' : 'person'}
//         size={10}
//         color={isAdmin ? '#6D28D9' : '#64748B'}
//       />
//       <Text style={{
//         fontSize: 10, fontWeight: '800',
//         color: isAdmin ? '#6D28D9' : '#64748B',
//         textTransform: 'uppercase', letterSpacing: 0.4,
//       }}>
//         {isAdmin ? 'Admin' : 'User'}
//       </Text>
//     </View>
//   );
// }

// // ─── User card ────────────────────────────────────────────────────────────────
// function UserCard({
//   user,
//   dark,
//   onRoleToggle,
//   onBlock,
//   onDelete,
// }: {
//   user: User & { blocked?: boolean };
//   dark: boolean;
//   onRoleToggle: (u: User) => void;
//   onBlock: (u: User & { blocked?: boolean }) => void;
//   onDelete: (u: User) => void;
// }) {
//   const av      = avatarColor(user.name);
//   const cardBg  = dark ? '#161B22' : '#FFFFFF';
//   const border  = dark ? '#21262D' : 'transparent';
//   const textPri = dark ? '#F0F6FC' : '#0F172A';
//   const textSec = dark ? '#8B949E' : '#64748B';
//   const mutedBg = dark ? '#21262D' : '#F8FAFC';

//   return (
//     <Animated.View
//       entering={FadeInRight.springify().damping(18)}
//       style={{
//         backgroundColor: cardBg,
//         borderRadius: 20, marginBottom: 12,
//         borderWidth: dark ? 1 : 0,
//         borderColor: border,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: dark ? 0.3 : 0.07,
//         shadowRadius: 10,
//         elevation: 4,
//         opacity: user.blocked ? 0.6 : 1,
//       }}
//     >
//       <View style={{ padding: 16 }}>
//         {/* ── Top row ── */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
//           {/* Avatar */}
//           <View style={{
//             width: 48, height: 48, borderRadius: 14,
//             backgroundColor: av.bg,
//             alignItems: 'center', justifyContent: 'center',
//           }}>
//             <Text style={{ fontSize: 16, fontWeight: '900', color: av.fg }}>
//               {initials(user.name)}
//             </Text>
//           </View>

//           {/* Info */}
//           <View style={{ flex: 1 }}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
//               <Text style={{ fontSize: 15, fontWeight: '800', color: textPri }} numberOfLines={1}>
//                 {user.name || 'Unknown'}
//               </Text>
//               {user.blocked && (
//                 <View style={{
//                   backgroundColor: '#FEE2E2', borderRadius: 8,
//                   paddingHorizontal: 6, paddingVertical: 2,
//                 }}>
//                   <Text style={{ fontSize: 9, fontWeight: '800', color: '#DC2626', textTransform: 'uppercase' }}>
//                     Blocked
//                   </Text>
//                 </View>
//               )}
//             </View>
//             <Text style={{ fontSize: 12, color: textSec }} numberOfLines={1}>
//               {user.email}
//             </Text>
//           </View>

//           <RoleBadge role={user.role} />
//         </View>

//         {/* ── Meta row ── */}
//         <View style={{
//           flexDirection: 'row', gap: 8, marginBottom: 14,
//           backgroundColor: mutedBg, borderRadius: 12, padding: 10,
//         }}>
//           {[
//             { icon: 'call-outline',     value: user.phone  || '—' },
//             { icon: 'location-outline', value: user.region || '—' },
//             { icon: 'time-outline',     value: timeAgo(user.createdAt) },
//           ].map(m => (
//             <View key={m.icon} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//               <Ionicons name={m.icon as any} size={11} color={textSec} />
//               <Text style={{ fontSize: 10, color: textSec, fontWeight: '500', flex: 1 }} numberOfLines={1}>
//                 {m.value}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* ── Action buttons ── */}
//         <View style={{ flexDirection: 'row', gap: 8 }}>
//           {/* Role toggle */}
//           <TouchableOpacity
//             onPress={() => onRoleToggle(user)}
//             style={{
//               flex: 1, flexDirection: 'row', alignItems: 'center',
//               justifyContent: 'center', gap: 6,
//               backgroundColor: user.role === 'admin' ? '#EDE9FE' : '#EEF2FF',
//               borderRadius: 12, paddingVertical: 10,
//             }}
//           >
//             <Ionicons
//               name={user.role === 'admin' ? 'person-outline' : 'shield-checkmark-outline'}
//               size={14}
//               color={user.role === 'admin' ? '#6D28D9' : '#4F46E5'}
//             />
//             <Text style={{
//               fontSize: 12, fontWeight: '700',
//               color: user.role === 'admin' ? '#6D28D9' : '#4F46E5',
//             }}>
//               {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
//             </Text>
//           </TouchableOpacity>

//           {/* Block / Unblock */}
//           <TouchableOpacity
//             onPress={() => onBlock(user)}
//             style={{
//               flex: 1, flexDirection: 'row', alignItems: 'center',
//               justifyContent: 'center', gap: 6,
//               backgroundColor: user.blocked ? '#D1FAE5' : '#FEF3C7',
//               borderRadius: 12, paddingVertical: 10,
//             }}
//           >
//             <Ionicons
//               name={user.blocked ? 'checkmark-circle-outline' : 'ban-outline'}
//               size={14}
//               color={user.blocked ? '#059669' : '#D97706'}
//             />
//             <Text style={{
//               fontSize: 12, fontWeight: '700',
//               color: user.blocked ? '#059669' : '#D97706',
//             }}>
//               {user.blocked ? 'Unblock' : 'Block'}
//             </Text>
//           </TouchableOpacity>

//           {/* Delete */}
//           <TouchableOpacity
//             onPress={() => onDelete(user)}
//             style={{
//               width: 40, alignItems: 'center', justifyContent: 'center',
//               backgroundColor: '#FEE2E2', borderRadius: 12,
//             }}
//           >
//             <Ionicons name="trash-outline" size={16} color="#DC2626" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Animated.View>
//   );
// }

// // ─── Main screen ──────────────────────────────────────────────────────────────
// export default function AdminUsersScreen() {
//   const insets = useSafeAreaInsets();
//   const router = useRouter();
//   const dark   = useColorScheme() === 'dark';
//   const { isAdmin } = useAuth();

//   const [users,      setUsers]      = useState<(User & { blocked?: boolean })[]>([]);
//   const [loading,    setLoading]    = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [search,     setSearch]     = useState('');
//   const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

//   // ── Theme ──────────────────────────────────────────────────────────────────
//   const T = {
//     screenBg:  dark ? '#0D1117' : '#F8FAFC',
//     headerBg:  dark ? '#161B22' : '#FFFFFF',
//     border:    dark ? '#21262D' : '#F1F5F9',
//     textPri:   dark ? '#F0F6FC' : '#0F172A',
//     textSec:   dark ? '#8B949E' : '#64748B',
//     textMuted: dark ? '#6E7681' : '#94A3B8',
//     inputBg:   dark ? '#0D1117' : '#F8FAFC',
//     chipBg:    dark ? '#21262D' : '#FFFFFF',
//     chipBord:  dark ? '#30363D' : '#E2E8F0',
//   };

//   // ── Guard ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!isAdmin) {
//       Alert.alert('Access Denied', 'Admin privileges required');
//       router.replace('/(tabs)' as any);
//     }
//   }, [isAdmin]);

//   // ── Real-time listener ─────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!isAdmin) return;
//     setLoading(true);
//     const unsub = userService.listenToAllUsers(data => {
//       setUsers(data as any);
//       setLoading(false);
//       setRefreshing(false);
//     });
//     return () => unsub();
//   }, [isAdmin]);

//   // ── Filtered list ──────────────────────────────────────────────────────────
//   const displayed = useMemo(() => {
//     let list = [...users];
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(u =>
//         u.name?.toLowerCase().includes(q) ||
//         u.email?.toLowerCase().includes(q) ||
//         u.phone?.toLowerCase().includes(q) ||
//         u.region?.toLowerCase().includes(q)
//       );
//     }
//     if (roleFilter !== 'all') {
//       list = list.filter(u => u.role === roleFilter);
//     }
//     return list;
//   }, [users, search, roleFilter]);

//   const adminCount  = users.filter(u => u.role === 'admin').length;
//   const blockedCount = users.filter(u => (u as any).blocked).length;

//   // ── Actions ────────────────────────────────────────────────────────────────
//   const handleRoleToggle = (user: User) => {
//     const newRole = user.role === 'admin' ? 'user' : 'admin';
//     Alert.alert(
//       newRole === 'admin' ? 'Grant Admin Access' : 'Revoke Admin Access',
//       `${newRole === 'admin'
//         ? `Give ${user.name} full admin privileges?`
//         : `Remove admin privileges from ${user.name}?`}`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: newRole === 'admin' ? 'Grant' : 'Revoke',
//           style: newRole === 'admin' ? 'default' : 'destructive',
//           onPress: async () => {
//             try {
//               await userService.updateUserRole(user.uid, newRole);
//             } catch (e: any) {
//               Alert.alert('Error', e.message || 'Failed to update role');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleBlock = (user: User & { blocked?: boolean }) => {
//     const blocking = !user.blocked;
//     Alert.alert(
//       blocking ? 'Block User' : 'Unblock User',
//       blocking
//         ? `Block ${user.name}? They will not be able to use the app.`
//         : `Unblock ${user.name}? They will regain access.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: blocking ? 'Block' : 'Unblock',
//           style: blocking ? 'destructive' : 'default',
//           onPress: async () => {
//             try {
//               await userService.setUserBlocked(user.uid, blocking);
//             } catch (e: any) {
//               Alert.alert('Error', e.message || 'Failed to update user');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleDelete = (user: User) => {
//     Alert.alert(
//       'Delete User',
//       `Permanently delete ${user.name}'s account? This cannot be undone.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await userService.deleteUser(user.uid);
//             } catch (e: any) {
//               Alert.alert('Error', e.message || 'Failed to delete user');
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (!isAdmin) return null;

//   return (
//     <View style={{ flex: 1, backgroundColor: T.screenBg, paddingTop: insets.top }}>

//       {/* ── Header ── */}
//       <Animated.View
//         entering={FadeInDown.duration(350)}
//         style={{
//           backgroundColor: T.headerBg,
//           paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
//           borderBottomWidth: 1, borderBottomColor: T.border,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: dark ? 0.3 : 0.05,
//           shadowRadius: 8, elevation: 3,
//         }}
//       >
//         {/* Title row */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={{
//               width: 42, height: 42, borderRadius: 14,
//               backgroundColor: dark ? '#21262D' : '#F1F5F9',
//               alignItems: 'center', justifyContent: 'center',
//             }}
//           >
//             <Ionicons name="arrow-back" size={22} color={dark ? '#E6EDF3' : '#1E293B'} />
//           </TouchableOpacity>
//           <View style={{ flex: 1 }}>
//             <Text style={{ fontSize: 22, fontWeight: '900', color: T.textPri }}>Users</Text>
//             <Text style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>
//               {users.length} registered · {adminCount} admin{adminCount !== 1 ? 's' : ''}
//               {blockedCount > 0 ? ` · ${blockedCount} blocked` : ''}
//             </Text>
//           </View>
//           <View style={{
//             width: 42, height: 42, borderRadius: 14,
//             backgroundColor: dark ? '#1E1B4B' : '#EEF2FF',
//             alignItems: 'center', justifyContent: 'center',
//           }}>
//             <Ionicons name="people" size={22} color="#6366F1" />
//           </View>
//         </View>

//         {/* Search */}
//         <View style={{
//           flexDirection: 'row', alignItems: 'center',
//           backgroundColor: T.inputBg, borderRadius: 14,
//           paddingHorizontal: 14, paddingVertical: 10,
//           borderWidth: 1, borderColor: T.border,
//           marginBottom: 12,
//         }}>
//           <Ionicons name="search" size={17} color={T.textMuted} />
//           <TextInput
//             style={{
//               flex: 1, fontSize: 14, color: T.textPri,
//               marginLeft: 10, padding: 0,
//             }}
//             placeholder="Search by name, email, phone…"
//             placeholderTextColor={T.textMuted}
//             value={search}
//             onChangeText={setSearch}
//           />
//           {search.length > 0 && (
//             <TouchableOpacity onPress={() => setSearch('')}>
//               <Ionicons name="close-circle" size={18} color={T.textMuted} />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Role filter chips */}
//         <View style={{ flexDirection: 'row', gap: 8 }}>
//           {(['all', 'user', 'admin'] as const).map(f => {
//             const active = roleFilter === f;
//             const color  = f === 'admin' ? '#6D28D9' : f === 'user' ? '#0EA5E9' : '#6366F1';
//             return (
//               <TouchableOpacity
//                 key={f}
//                 onPress={() => setRoleFilter(f)}
//                 style={{
//                   flexDirection: 'row', alignItems: 'center', gap: 5,
//                   paddingHorizontal: 14, paddingVertical: 7,
//                   borderRadius: 20,
//                   backgroundColor: active ? color : T.chipBg,
//                   borderWidth: 1.5,
//                   borderColor: active ? color : T.chipBord,
//                 }}
//               >
//                 <Ionicons
//                   name={f === 'admin' ? 'shield-checkmark' : f === 'user' ? 'person' : 'apps'}
//                   size={12}
//                   color={active ? '#fff' : color}
//                 />
//                 <Text style={{
//                   fontSize: 12, fontWeight: '700',
//                   color: active ? '#fff' : T.textSec,
//                   textTransform: 'capitalize',
//                 }}>
//                   {f === 'all' ? `All (${users.length})` : `${f === 'admin' ? 'Admins' : 'Users'} (${users.filter(u => u.role === f).length})`}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </Animated.View>

//       {/* ── Content ── */}
//       {loading ? (
//         <UserSkeleton />
//       ) : (
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => setRefreshing(true)}
//               tintColor="#6366F1"
//             />
//           }
//         >
//           {/* Stats strip */}
//           <Animated.View
//             entering={FadeInDown.delay(60).duration(300)}
//             style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}
//           >
//             {[
//               { label: 'Total',   value: users.length,   color: '#6366F1', bg: dark ? '#1E1B4B' : '#EEF2FF' },
//               { label: 'Admins',  value: adminCount,     color: '#6D28D9', bg: dark ? '#2E1065' : '#EDE9FE' },
//               { label: 'Blocked', value: blockedCount,   color: '#DC2626', bg: dark ? '#450A0A' : '#FEE2E2' },
//             ].map(s => (
//               <View key={s.label} style={{
//                 flex: 1, backgroundColor: s.bg,
//                 borderRadius: 16, padding: 12, alignItems: 'center', gap: 4,
//               }}>
//                 <Text style={{ fontSize: 22, fontWeight: '900', color: s.color }}>{s.value}</Text>
//                 <Text style={{ fontSize: 9, fontWeight: '800', color: s.color, textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.8 }}>
//                   {s.label}
//                 </Text>
//               </View>
//             ))}
//           </Animated.View>

//           {/* User list */}
//           {displayed.length === 0 ? (
//             <Animated.View
//               entering={FadeInDown.delay(100).springify()}
//               style={{ alignItems: 'center', paddingVertical: 48 }}
//             >
//               <View style={{
//                 width: 80, height: 80, borderRadius: 24,
//                 backgroundColor: dark ? '#21262D' : '#F1F5F9',
//                 alignItems: 'center', justifyContent: 'center', marginBottom: 16,
//               }}>
//                 <Ionicons name="people-outline" size={40} color={dark ? '#6E7681' : '#CBD5E1'} />
//               </View>
//               <Text style={{ fontSize: 16, fontWeight: '800', color: T.textPri, marginBottom: 6 }}>
//                 {search ? 'No results found' : 'No users yet'}
//               </Text>
//               <Text style={{ fontSize: 13, color: T.textMuted, textAlign: 'center' }}>
//                 {search ? 'Try a different search term' : 'Registered users will appear here'}
//               </Text>
//             </Animated.View>
//           ) : (
//             displayed.map((user, idx) => (
//               <Animated.View key={user.uid} entering={FadeInDown.delay(idx * 40).duration(300)}>
//                 <UserCard
//                   user={user}
//                   dark={dark}
//                   onRoleToggle={handleRoleToggle}
//                   onBlock={handleBlock}
//                   onDelete={handleDelete}
//                 />
//               </Animated.View>
//             ))
//           )}
//         </ScrollView>
//       )}
//     </View>
//   );
// }


import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { UserSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User } from '../types';

const ACCENT = '#4F46E5';

type UserRow = User & { blocked?: boolean };
type RoleFilter = 'all' | 'user' | 'admin';
type StatusFilter = 'all' | 'active' | 'blocked';
type SortOption = 'newest' | 'name';

const AVATAR_PALETTE = [
  { bg: '#EEF2FF', fg: '#4F46E5' },
  { bg: '#DBEAFE', fg: '#2563EB' },
  { bg: '#D1FAE5', fg: '#059669' },
  { bg: '#FEF3C7', fg: '#B45309' },
  { bg: '#FCE7F3', fg: '#BE185D' },
  { bg: '#FEE2E2', fg: '#DC2626' },
];

function avatarColor(name: string) {
  return AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];
}

function initials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date: Date): string {
  try {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function StatPill({
  label,
  value,
  color,
  dark,
}: {
  label: string;
  value: number;
  color: string;
  dark: boolean;
}) {
  return (
    <View
      className={`flex-1 rounded-xl px-3 py-3 border ${
        dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
      }`}
    >
      <Text className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
        {label}
      </Text>
      <Text className="text-xl font-bold mt-0.5" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}

function RoleBadge({ role, dark }: { role: string; dark: boolean }) {
  const isAdmin = role === 'admin';
  return (
    <View
      className={`flex-row items-center gap-1 px-2 py-1 rounded-md ${
        isAdmin
          ? dark
            ? 'bg-violet-500/15'
            : 'bg-violet-50'
          : dark
            ? 'bg-zinc-800'
            : 'bg-slate-100'
      }`}
    >
      <Ionicons
        name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
        size={11}
        color={isAdmin ? '#7C3AED' : '#64748B'}
      />
      <Text
        className="text-[10px] font-semibold uppercase"
        style={{ color: isAdmin ? '#7C3AED' : '#64748B' }}
      >
        {isAdmin ? 'Admin' : 'User'}
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
  count?: number;
  active: boolean;
  onPress: () => void;
  dark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
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
      {count !== undefined ? (
        <View className={`px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : dark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
          <Text
            className={`text-[10px] font-bold ${active ? 'text-white' : 'text-slate-500'}`}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function MetaItem({
  icon,
  value,
  dark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  dark: boolean;
}) {
  return (
    <View className="flex-1 flex-row items-center gap-1.5">
      <Ionicons name={icon} size={12} color={dark ? '#64748B' : '#94A3B8'} />
      <Text
        className={`text-[10px] flex-1 ${dark ? 'text-slate-500' : 'text-slate-500'}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  variant,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant: 'primary' | 'warning' | 'success' | 'danger';
}) {
  const styles = {
    primary: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
    warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
    danger: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
  };
  const colors = {
    primary: '#4F46E5',
    warning: '#D97706',
    success: '#059669',
    danger: '#DC2626',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${styles[variant]}`}
    >
      <Ionicons name={icon} size={14} color={colors[variant]} />
      <Text className="text-[11px] font-semibold" style={{ color: colors[variant] }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function UserCard({
  user,
  dark,
  onBlock,
  onDelete,
  onPress,
}: {
  user: UserRow;
  dark: boolean;
  onBlock: (u: UserRow) => void;
  onDelete: (u: User) => void;
  onPress: (u: UserRow) => void;
}) {
  const av = avatarColor(user.name);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(user)}
      className={`rounded-2xl mb-3 border overflow-hidden ${
        dark ? 'bg-[#161B22] border-zinc-800' : 'bg-white border-slate-100'
      } ${user.blocked ? 'opacity-70' : ''}`}
    >
      <View className="p-4">
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: av.bg }}
          >
            <Text className="text-base font-bold" style={{ color: av.fg }}>
              {initials(user.name)}
            </Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text
                className={`text-base font-semibold ${dark ? 'text-slate-50' : 'text-slate-900'}`}
                numberOfLines={1}
              >
                {user.name || 'Unknown'}
              </Text>
              {user.blocked ? (
                <View className="bg-red-50 dark:bg-red-500/15 px-2 py-0.5 rounded-md">
                  <Text className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase">
                    Blocked
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}
              numberOfLines={1}
            >
              {user.email}
            </Text>
          </View>

          <RoleBadge role={user.role} dark={dark} />
        </View>

        <View
          className={`flex-row gap-2 rounded-xl p-3 mb-3 border ${
            dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <MetaItem icon="call-outline" value={user.phone || '—'} dark={dark} />
          <MetaItem icon="location-outline" value={user.region || '—'} dark={dark} />
          <MetaItem icon="time-outline" value={timeAgo(user.createdAt)} dark={dark} />
        </View>

        <View className="flex-row gap-2">
          <ActionButton
            label={user.blocked ? 'Unblock' : 'Block'}
            icon={user.blocked ? 'checkmark-circle-outline' : 'ban-outline'}
            variant={user.blocked ? 'success' : 'warning'}
            onPress={() => onBlock(user)}
          />
          <TouchableOpacity
            onPress={() => onDelete(user)}
            activeOpacity={0.75}
            className="w-11 items-center justify-center rounded-xl border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10"
          >
            <Ionicons name="trash-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin privileges required');
      router.replace('/(tabs)' as any);
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const unsub = userService.listenToAllUsers((data) => {
      setUsers(data as UserRow[]);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsub();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const blockedCount = users.filter((u) => u.blocked).length;
    const activeCount = users.length - blockedCount;
    return { adminCount, blockedCount, activeCount };
  }, [users]);

  const displayed = useMemo(() => {
    let list = [...users];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.region?.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (statusFilter === 'blocked') {
      list = list.filter((u) => u.blocked);
    } else if (statusFilter === 'active') {
      list = list.filter((u) => !u.blocked);
    }

    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [users, search, roleFilter, statusFilter, sortBy]);

  const handleBlock = useCallback((user: UserRow) => {
    const blocking = !user.blocked;
    Alert.alert(
      blocking ? 'Block user' : 'Unblock user',
      blocking
        ? `Block ${user.name}? They won't be able to use the app.`
        : `Unblock ${user.name}? They'll regain access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: blocking ? 'Block' : 'Unblock',
          style: blocking ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await userService.setUserBlocked(user.uid, blocking);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to update user');
            }
          },
        },
      ]
    );
  }, []);

  const handleDelete = useCallback((user: User) => {
    Alert.alert(
      'Delete user',
      `Permanently delete ${user.name}'s account? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteUser(user.uid);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  }, []);

  const openUserActions = useCallback(
    (user: UserRow) => {
      Alert.alert(user.name || 'User', user.email, [
        {
          text: user.blocked ? 'Unblock' : 'Block',
          style: user.blocked ? 'default' : 'destructive',
          onPress: () => handleBlock(user),
        },
        { text: 'Delete account', style: 'destructive', onPress: () => handleDelete(user) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [handleBlock, handleDelete]
  );

  if (!isAdmin) return null;

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
            <View className="flex-row items-center gap-3 flex-1">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className={`w-10 h-10 rounded-xl items-center justify-center border ${
                  dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Ionicons name="arrow-back" size={20} color={dark ? '#E2E8F0' : '#334155'} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className={`text-xl font-bold ${dark ? 'text-slate-50' : 'text-slate-900'}`}>
                  Users
                </Text>
                <Text className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Manage accounts & access
                </Text>
              </View>
            </View>
            <View
              className={`w-10 h-10 rounded-xl items-center justify-center border ${
                dark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
              }`}
            >
              <Ionicons name="people-outline" size={20} color={ACCENT} />
            </View>
          </View>

          {/* Search */}
          <View
            className={`flex-row items-center rounded-xl px-4 py-3 mb-3 border ${
              dark ? 'bg-[#0D1117] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <Ionicons name="search-outline" size={18} color={dark ? '#64748B' : '#94A3B8'} />
            <TextInput
              className={`flex-1 text-sm mx-2 p-0 ${dark ? 'text-slate-100' : 'text-slate-900'}`}
              placeholder="Search name, email, phone, region…"
              placeholderTextColor={dark ? '#64748B' : '#94A3B8'}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={dark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Role filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2 pr-2">
              <FilterChip
                label="All"
                count={users.length}
                active={roleFilter === 'all'}
                onPress={() => setRoleFilter('all')}
                dark={!!dark}
              />
              <FilterChip
                label="Users"
                count={users.filter((u) => u.role === 'user').length}
                active={roleFilter === 'user'}
                onPress={() => setRoleFilter('user')}
                dark={!!dark}
              />
              <FilterChip
                label="Admins"
                count={stats.adminCount}
                active={roleFilter === 'admin'}
                onPress={() => setRoleFilter('admin')}
                dark={!!dark}
              />
            </View>
          </ScrollView>

          {/* Status + sort */}
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row gap-2 flex-1">
              <FilterChip
                label="Active"
                count={stats.activeCount}
                active={statusFilter === 'active'}
                onPress={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
                dark={!!dark}
              />
              <FilterChip
                label="Blocked"
                count={stats.blockedCount}
                active={statusFilter === 'blocked'}
                onPress={() => setStatusFilter(statusFilter === 'blocked' ? 'all' : 'blocked')}
                dark={!!dark}
              />
            </View>
            <TouchableOpacity
              onPress={() => setSortBy(sortBy === 'newest' ? 'name' : 'newest')}
              className={`flex-row items-center gap-1 px-3 py-2 rounded-xl border ${
                dark ? 'bg-[#161B22] border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              <Ionicons name="swap-vertical-outline" size={14} color={ACCENT} />
              <Text className={`text-xs font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                {sortBy === 'newest' ? 'Newest' : 'A–Z'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Content */}
      {loading ? (
        <UserSkeleton />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}
              tintColor={ACCENT}
            />
          }
        >
          <Animated.View entering={FadeInDown.delay(60).duration(300)} className="flex-row gap-2 mb-4">
            <StatPill label="Total" value={users.length} color={ACCENT} dark={!!dark} />
            <StatPill label="Admins" value={stats.adminCount} color="#7C3AED" dark={!!dark} />
            <StatPill label="Blocked" value={stats.blockedCount} color="#DC2626" dark={!!dark} />
          </Animated.View>

          <Text className={`text-xs font-medium mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {displayed.length} {displayed.length === 1 ? 'user' : 'users'}
            {search ? ` matching "${search}"` : ''}
          </Text>

          {displayed.length === 0 ? (
            <Animated.View
              entering={FadeInUp.delay(80).springify()}
              className="items-center py-16 px-6"
            >
              <View
                className={`w-16 h-16 rounded-2xl items-center justify-center mb-4 ${
                  dark ? 'bg-zinc-800' : 'bg-slate-100'
                }`}
              >
                <Ionicons name="people-outline" size={32} color={dark ? '#64748B' : '#94A3B8'} />
              </View>
              <Text className={`text-base font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                {search ? 'No results' : 'No users yet'}
              </Text>
              <Text
                className={`text-sm text-center mt-2 leading-5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}
              >
                {search ? 'Try another search or filter.' : 'Registered users will appear here.'}
              </Text>
              {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                <TouchableOpacity
                  onPress={() => {
                    setSearch('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600"
                >
                  <Text className="text-sm font-semibold text-white">Clear filters</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            displayed.map((user, idx) => (
              <Animated.View key={user.uid} entering={FadeInDown.delay(idx * 35).duration(280)}>
                <UserCard
                  user={user}
                  dark={!!dark}
                  onBlock={handleBlock}
                  onDelete={handleDelete}
                  onPress={openUserActions}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}