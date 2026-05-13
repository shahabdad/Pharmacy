import { PrescriptionCard } from '@/src/components/PrescriptionCard';
import { useAuth } from '@/src/context/AuthContext';
import { prescriptionService } from '@/src/services/prescriptionService';
import { Prescription, PrescriptionStatus } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Filter config ─────────────────────────────────────────────────────────────
const FILTERS: {
  key: PrescriptionStatus | 'all';
  label: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
}[] = [
  { key: 'all',       label: 'All',       icon: 'apps-outline',             color: '#6366F1' },
  { key: 'pending',   label: 'Reviewing', icon: 'time-outline',             color: '#F59E0B' },
  { key: 'quoted',    label: 'To Pay',    icon: 'card-outline',             color: '#3B82F6' },
  { key: 'approved',  label: 'Approved',  icon: 'checkmark-circle-outline', color: '#10B981' },
  { key: 'delivered', label: 'Delivered', icon: 'cube-outline',             color: '#6366F1' },
  { key: 'rejected',  label: 'Declined',  icon: 'alert-circle-outline',     color: '#E11D48' },
];

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, color, bg, delay,
}: {
  label: string; value: number; icon: string;
  color: string; bg: string; delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <View style={{
        backgroundColor: bg, borderRadius: 18, padding: 14,
        alignItems: 'center', gap: 6,
      }}>
        <View style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: color + '22',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '900', color, letterSpacing: -0.8 }}>
          {value}
        </Text>
        <Text style={{
          fontSize: 8, fontWeight: '800', color,
          textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.8,
        }}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Upload button ─────────────────────────────────────────────────────────────
function UploadButton() {
  return (
    <Link href="/upload-prescription" asChild>
      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 10, paddingVertical: 16, borderRadius: 20,
          backgroundColor: '#6366F1',
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <View style={{
          width: 28, height: 28, borderRadius: 8,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="add" size={18} color="#fff" />
        </View>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 }}>
          New Prescription
        </Text>
      </TouchableOpacity>
    </Link>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function PrescriptionScreen() {
  const insets = useSafeAreaInsets();
  const dark   = useColorScheme() === 'dark';
  const { appUser } = useAuth();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [activeFilter,  setActiveFilter]  = useState<PrescriptionStatus | 'all'>('all');

  // ── Theme ──────────────────────────────────────────────────────────────────
  const T = {
    screenBg:  dark ? '#0D1117' : '#F8FAFC',
    headerBg:  dark ? '#161B22' : '#FFFFFF',
    border:    dark ? '#21262D' : '#F1F5F9',
    textPri:   dark ? '#F0F6FC' : '#0F172A',
    textSec:   dark ? '#8B949E' : '#64748B',
    textMuted: dark ? '#6E7681' : '#94A3B8',
    chipBg:    dark ? '#21262D' : '#FFFFFF',
    chipBord:  dark ? '#30363D' : '#E2E8F0',
    emptyBg:   dark ? '#21262D' : '#F1F5F9',
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = async (isRefresh = false) => {
    if (!appUser) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await prescriptionService.getUserPrescriptions(appUser.uid);
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPrescriptions(data);
    } catch {
      // silently fail — empty list shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [appUser?.uid]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const counts = useMemo(() =>
    prescriptions.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {}),
  [prescriptions]);

  const filtered = useMemo(() =>
    activeFilter === 'all'
      ? prescriptions
      : prescriptions.filter(p => p.status === activeFilter),
  [prescriptions, activeFilter]);

  const activeCount  = (counts['pending'] ?? 0) + (counts['quoted'] ?? 0) + (counts['approved'] ?? 0);
  const doneCount    = counts['delivered'] ?? 0;
  const pendingCount = counts['pending'] ?? 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{
        flex: 1, backgroundColor: T.screenBg,
        alignItems: 'center', justifyContent: 'center',
        paddingTop: insets.top,
      }}>
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            backgroundColor: '#6366F1' + '20',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            borderWidth: 1.5, borderColor: '#6366F1' + '40',
          }}>
            <Ionicons name="document-text" size={34} color="#6366F1" />
          </View>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={{ fontSize: 13, color: T.textMuted, marginTop: 12, fontWeight: '600' }}>
            Loading prescriptions…
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.screenBg, paddingTop: insets.top }}>

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        style={{
          backgroundColor: T.headerBg,
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: dark ? 0.3 : 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{
              fontSize: 12, color: T.textMuted, fontWeight: '600',
              letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2,
            }}>
              My Health Records
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: T.textPri, letterSpacing: -0.5 }}>
              Prescriptions
            </Text>
          </View>
          {prescriptions.length > 0 && (
            <View style={{
              backgroundColor: '#6366F1' + '18',
              borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
              borderWidth: 1, borderColor: '#6366F1' + '30',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#6366F1' }}>
                {prescriptions.length} total
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }

        ListHeaderComponent={
          <View>
            {/* Stats */}
            {prescriptions.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(80).duration(350)}
                style={{ flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 }}
              >
                <StatCard
                  label="Active"   value={activeCount}  icon="flash-outline"
                  color="#6366F1"  bg={dark ? '#1E1B4B' : '#EEF2FF'}  delay={100}
                />
                <StatCard
                  label="Pending"  value={pendingCount} icon="time-outline"
                  color="#F59E0B"  bg={dark ? '#78350F' : '#FEF3C7'}  delay={150}
                />
                <StatCard
                  label="Done"     value={doneCount}    icon="checkmark-done"
                  color="#10B981"  bg={dark ? '#064E3B' : '#D1FAE5'}  delay={200}
                />
              </Animated.View>
            )}

            {/* Upload */}
            <Animated.View
              entering={FadeInDown.delay(120).duration(350)}
              style={{ marginBottom: 16 }}
            >
              <UploadButton />
            </Animated.View>

            {/* Filter chips */}
            {prescriptions.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(180).duration(350)}
                style={{ marginBottom: 16 }}
              >
                <Text style={{
                  fontSize: 11, fontWeight: '700', color: T.textMuted,
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
                }}>
                  Filter by status
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {FILTERS.map(f => {
                    const active = activeFilter === f.key;
                    const count  = f.key === 'all' ? prescriptions.length : (counts[f.key] ?? 0);
                    if (f.key !== 'all' && count === 0) return null;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        onPress={() => setActiveFilter(f.key)}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 6,
                          paddingHorizontal: 13, paddingVertical: 8,
                          borderRadius: 22,
                          backgroundColor: active ? f.color : T.chipBg,
                          borderWidth: 1.5,
                          borderColor: active ? f.color : T.chipBord,
                          shadowColor: active ? f.color : '#000',
                          shadowOffset: { width: 0, height: active ? 4 : 1 },
                          shadowOpacity: active ? 0.25 : 0.04,
                          shadowRadius: active ? 8 : 3,
                          elevation: active ? 5 : 1,
                        }}
                      >
                        <Ionicons name={f.icon} size={13} color={active ? '#fff' : f.color} />
                        <Text style={{
                          fontSize: 12, fontWeight: '700',
                          color: active ? '#fff' : T.textSec,
                        }}>
                          {f.label}
                        </Text>
                        <View style={{
                          backgroundColor: active ? 'rgba(255,255,255,0.25)' : f.color + '20',
                          borderRadius: 10, minWidth: 20,
                          paddingHorizontal: 5, paddingVertical: 1,
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            fontSize: 10, fontWeight: '900',
                            color: active ? '#fff' : f.color,
                          }}>
                            {count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            {/* Section label */}
            {filtered.length > 0 && (
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 12,
              }}>
                <Text style={{
                  fontSize: 13, fontWeight: '800', color: T.textSec,
                  textTransform: 'uppercase', letterSpacing: 0.6,
                }}>
                  {activeFilter === 'all'
                    ? `All (${filtered.length})`
                    : `${activeFilter} (${filtered.length})`}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: T.chipBg, borderRadius: 10,
                  paddingHorizontal: 8, paddingVertical: 4,
                  borderWidth: 1, borderColor: T.chipBord,
                }}>
                  <Ionicons name="swap-vertical-outline" size={12} color={T.textMuted} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: T.textMuted }}>Newest</Text>
                </View>
              </View>
            )}
          </View>
        }

        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 55 + 200).duration(350)}>
            <PrescriptionCard
              prescription={item}
              onPress={() => {/* detail screen not yet built */}}
            />
          </Animated.View>
        )}

        ListEmptyComponent={
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}
          >
            <View style={{
              width: 100, height: 100, borderRadius: 30,
              backgroundColor: T.emptyBg,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: dark ? 0.3 : 0.07,
              shadowRadius: 16,
              elevation: 4,
            }}>
              <Ionicons
                name={activeFilter === 'all' ? 'document-text-outline' : 'filter-outline'}
                size={46}
                color={dark ? '#30363D' : '#CBD5E1'}
              />
            </View>

            <Text style={{
              fontSize: 18, fontWeight: '900', color: T.textPri,
              marginBottom: 8, textAlign: 'center', letterSpacing: -0.3,
            }}>
              {activeFilter === 'all'
                ? 'No prescriptions yet'
                : `No ${activeFilter} prescriptions`}
            </Text>
            <Text style={{
              fontSize: 13, color: T.textMuted, textAlign: 'center',
              lineHeight: 20, marginBottom: 28, maxWidth: 260,
            }}>
              {activeFilter === 'all'
                ? 'Upload your first prescription and our pharmacist will review it shortly.'
                : 'Try selecting a different filter to see your prescriptions.'}
            </Text>

            {activeFilter === 'all' ? (
              <Link href="/upload-prescription" asChild>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#6366F1',
                    paddingHorizontal: 28, paddingVertical: 14,
                    borderRadius: 18,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    shadowColor: '#6366F1',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 14,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
                    Upload Prescription
                  </Text>
                </TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                style={{
                  backgroundColor: T.chipBg,
                  paddingHorizontal: 24, paddingVertical: 12,
                  borderRadius: 16,
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  borderWidth: 1.5, borderColor: T.chipBord,
                }}
              >
                <Ionicons name="apps-outline" size={16} color="#6366F1" />
                <Text style={{ color: '#6366F1', fontWeight: '700', fontSize: 13 }}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        }
      />
    </View>
  );
}
