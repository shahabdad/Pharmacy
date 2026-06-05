import { PrescriptionCard } from '@/src/components/PrescriptionCard';
import { useAuth } from '@/src/context/AuthContext';
import { prescriptionService } from '@/src/services/prescriptionService';
import { Prescription, PrescriptionStatus } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
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
  { key: 'all',       label: 'All',       icon: 'apps-outline',             color: '#0F766E' },
  { key: 'pending',   label: 'Reviewing', icon: 'time-outline',             color: '#0F766E' },
  { key: 'quoted',    label: 'To Pay',    icon: 'wallet-outline',           color: '#0369A1' },
  { key: 'approved',  label: 'Approved',  icon: 'checkmark-circle-outline', color: '#059669' },
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
        backgroundColor: bg, borderRadius: 24, padding: 16,
        alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: color + '15',
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
      }}>
        <View style={{
          width: 36, height: 36, borderRadius: 12,
          backgroundColor: color + '15',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color, letterSpacing: -0.5 }}>
              {value}
            </Text>
            <Text style={{
              fontSize: 9, fontWeight: '800', color,
              textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7,
            }}>
              {label}
            </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Upload button ─────────────────────────────────────────────────────────────
function UploadButton() {
  return (
    <Link href="/upload-prescription" asChild>
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 12, paddingVertical: 18, borderRadius: 24,
          backgroundColor: '#0F4C81',
          shadowColor: '#0F4C81',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <Ionicons name="cloud-upload" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }}>
          Upload New Prescription
        </Text>
      </TouchableOpacity>
    </Link>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function PrescriptionScreen() {
  const insets = useSafeAreaInsets();
  const dark   = useColorScheme() === 'dark';
  const { appUser, loading: authLoading } = useAuth();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [activeFilter,  setActiveFilter]  = useState<PrescriptionStatus | 'all'>('all');

  // ── Theme ──────────────────────────────────────────────────────────────────
  const T = {
    screenBg:  dark ? '#0D1117' : '#F2F4F7',
    headerBg:  dark ? '#161B22' : '#FFFFFF',
    border:    dark ? '#21262D' : '#E5E7EB',
    textPri:   dark ? '#F0F6FC' : '#111827',
    textSec:   dark ? '#8B949E' : '#4B5563',
    textMuted: dark ? '#6E7681' : '#9CA3AF',
    chipBg:    dark ? '#161B22' : '#FFFFFF',
    chipBord:  dark ? '#30363D' : '#E5E7EB',
    emptyBg:   dark ? '#161B22' : '#FFFFFF',
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = async (isRefresh = false) => {
    if (!appUser) {
      if (!authLoading) {
        setPrescriptions([]);
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

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

  useEffect(() => {
    load();
  }, [appUser?.uid, authLoading]);

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
            width: 80, height: 80, borderRadius: 28,
            backgroundColor: '#0F766E' + '15',
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            borderWidth: 1.5, borderColor: '#0F766E' + '25',
          }}>
            <Ionicons name="document-text" size={38} color="#0F766E" />
          </View>
          <ActivityIndicator size="small" color="#0F766E" />
          <Text style={{ fontSize: 14, color: T.textSec, marginTop: 16, fontWeight: '700' }}>
            Retrieving your records...
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
          paddingTop: 16,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: T.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: dark ? 0.3 : 0.04,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <View>
            <Text style={{
              fontSize: 10, color: '#0F766E', fontWeight: '900',
              letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4,
            }}>
              Personal Health
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: T.textPri, letterSpacing: -0.8 }}>
              Prescriptions
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => load(true)}
            style={{ 
                width: 44, height: 44, borderRadius: 14, 
                backgroundColor: T.chipBg, alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: T.chipBord
            }}
          >
            <Ionicons name="refresh" size={20} color={T.textSec} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#0F766E"
            colors={['#0F766E']}
          />
        }

        ListHeaderComponent={
          <View>
            {/* Stats */}
            {prescriptions.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(80).duration(350)}
                style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}
              >
                <StatCard
                  label="Active"   value={activeCount}  icon="pulse"
                  color="#0F766E"  bg={dark ? '#0F766E22' : '#F0FDFA'}  delay={100}
                />
                <StatCard
                  label="Review"   value={pendingCount} icon="time"
                  color="#B45309"  bg={dark ? '#B4530922' : '#FFFBEB'}  delay={150}
                />
                <StatCard
                  label="Completed" value={doneCount}    icon="checkmark-done-circle"
                  color="#059669"  bg={dark ? '#05966922' : '#ECFDF5'}  delay={200}
                />
              </Animated.View>
            )}

            {/* Upload */}
            <Animated.View
              entering={FadeInDown.delay(120).duration(350)}
              style={{ marginBottom: 24 }}
            >
              <UploadButton />
            </Animated.View>

            {/* Filter chips */}
            {prescriptions.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(180).duration(350)}
                style={{ marginBottom: 20 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{
                      fontSize: 12, fontWeight: '800', color: T.textPri,
                      textTransform: 'uppercase', letterSpacing: 0.8,
                    }}>
                      Status Filter
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: T.textMuted }}>
                        {prescriptions.length} items total
                    </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                  {FILTERS.map(f => {
                    const active = activeFilter === f.key;
                    const count  = f.key === 'all' ? prescriptions.length : (counts[f.key] ?? 0);
                    if (f.key !== 'all' && count === 0) return null;
                    return (
                      <TouchableOpacity
                        key={f.key}
                        onPress={() => setActiveFilter(f.key)}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 8,
                          paddingHorizontal: 16, paddingVertical: 10,
                          borderRadius: 20,
                          backgroundColor: active ? f.color : T.chipBg,
                          borderWidth: 1.5,
                          borderColor: active ? f.color : T.chipBord,
                          shadowColor: active ? f.color : '#000',
                          shadowOffset: { width: 0, height: active ? 4 : 1 },
                          shadowOpacity: active ? 0.2 : 0.05,
                          shadowRadius: active ? 8 : 4,
                          elevation: active ? 4 : 1,
                        }}
                      >
                        <Ionicons name={f.icon} size={14} color={active ? '#fff' : f.color} />
                        <Text style={{
                          fontSize: 13, fontWeight: '800',
                          color: active ? '#fff' : T.textSec,
                        }}>
                          {f.label}
                        </Text>
                        <View style={{
                          backgroundColor: active ? 'rgba(255,255,255,0.25)' : f.color + '15',
                          borderRadius: 10, minWidth: 22,
                          paddingHorizontal: 6, paddingVertical: 2,
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
                </ScrollView>
              </Animated.View>
            )}

            {/* Section label */}
            {filtered.length > 0 && (
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 14, fontWeight: '900', color: T.textPri,
                  letterSpacing: -0.2,
                }}>
                  {activeFilter === 'all' ? 'All Records' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Records`}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: T.chipBg, borderRadius: 12,
                  paddingHorizontal: 10, paddingVertical: 6,
                  borderWidth: 1, borderColor: T.chipBord,
                }}>
                  <Ionicons name="funnel-outline" size={12} color={T.textSec} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: T.textSec }}>Recent</Text>
                </View>
              </View>
            )}
          </View>
        }

        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 55 + 200).duration(350)}>
            <PrescriptionCard
              prescription={item}
              onPress={(id) => router.push(`/prescription/${id}` as any)}
            />
          </Animated.View>
        )}

        ListEmptyComponent={
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 }}
          >
            <View style={{
              width: 120, height: 120, borderRadius: 40,
              backgroundColor: T.emptyBg,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
              borderWidth: 1, borderColor: T.border,
              shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
            }}>
              <Ionicons
                name={activeFilter === 'all' ? 'document-text' : 'search'}
                size={54}
                color={dark ? '#30363D' : '#E2E8F0'}
              />
            </View>

            <Text style={{
              fontSize: 22, fontWeight: '900', color: T.textPri,
              marginBottom: 10, textAlign: 'center', letterSpacing: -0.5,
            }}>
              {activeFilter === 'all'
                ? 'No records found'
                : `No results for "${activeFilter}"`}
            </Text>
            <Text style={{
              fontSize: 15, color: T.textSec, textAlign: 'center',
              lineHeight: 22, marginBottom: 32, maxWidth: 280,
            }}>
              {activeFilter === 'all'
                ? 'Your uploaded prescriptions and their history will appear here for easy tracking.'
                : 'Try adjusting your filters to find the prescriptions you are looking for.'}
            </Text>

            {activeFilter === 'all' ? (
              <Link href="/upload-prescription" asChild>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0F766E',
                    paddingHorizontal: 32, paddingVertical: 16,
                    borderRadius: 20,
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    shadowColor: '#0F766E',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
                  }}
                >
                  <Ionicons name="add-circle" size={22} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                    Upload Now
                  </Text>
                </TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                style={{
                  backgroundColor: T.chipBg,
                  paddingHorizontal: 28, paddingVertical: 14,
                  borderRadius: 18,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  borderWidth: 1.5, borderColor: T.chipBord,
                }}
              >
                <Ionicons name="apps" size={18} color="#0F766E" />
                <Text style={{ color: '#0F766E', fontWeight: '800', fontSize: 14 }}>
                  Reset Filters
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        }
      />
    </View>
  );
}


