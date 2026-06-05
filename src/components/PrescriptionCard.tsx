import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Prescription, PrescriptionStatus } from '../types';

interface PrescriptionCardProps {
  prescription: Prescription;
  onPress: (id: string) => void;
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  PrescriptionStatus,
  {
    label: string;
    icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
    color: string;
    bg: string;
    darkBg: string;
    bar: string;
    step: number;
  }
> = {
  pending:   { label: 'Reviewing',  icon: 'time-outline',             color: '#0F766E', bg: '#F0FDFA', darkBg: '#134E4A', bar: '#0D9488', step: 0 },
  quoted:    { label: 'To Pay',     icon: 'wallet-outline',           color: '#0369A1', bg: '#F0F9FF', darkBg: '#0C4A6E', bar: '#0284C7', step: 1 },
  approved:  { label: 'Approved',   icon: 'checkmark-circle-outline', color: '#059669', bg: '#ECFDF5', darkBg: '#064E3B', bar: '#10B981', step: 2 },
  delivered: { label: 'Delivered',  icon: 'cube-outline',             color: '#4338CA', bg: '#EEF2FF', darkBg: '#1E1B4B', bar: '#6366F1', step: 3 },
  rejected:  { label: 'Declined',   icon: 'alert-circle-outline',     color: '#E11D48', bg: '#FFF1F2', darkBg: '#4C0519', bar: '#F43F5E', step: -1 },
};

const STEPS = ['Sent', 'Quote', 'Paid', 'Ready'];

// ─── Safe date → "time ago" ────────────────────────────────────────────────────
function timeAgo(raw: any): string {
  try {
    if (!raw) return '—';
    const d: Date = typeof raw.toDate === 'function'
      ? raw.toDate()
      : raw instanceof Date ? raw
      : typeof raw.seconds === 'number' ? new Date(raw.seconds * 1000)
      : new Date(raw);
    if (isNaN(d.getTime())) return '—';
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onPress,
}) => {
  const dark = useColorScheme() === 'dark';
  const cfg  = STATUS_CFG[prescription.status];
  const [showNote, setShowNote] = useState(false);

  const imageUri = (prescription.imageURL || prescription.imageUrl || '').trim() || null;
  const ago      = useMemo(() => timeAgo(prescription.createdAt), [prescription.createdAt]);
  const hasNote  = !!(prescription.message || prescription.adminMessage);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const cardBg   = dark ? '#161B22' : '#FFFFFF';
  const statusBg = dark ? cfg.darkBg : cfg.bg;
  const subText  = dark ? '#8B949E' : '#64748B';
  const bodyText = dark ? '#F0F6FC' : '#111827';
  const divider  = dark ? '#21262D' : '#F1F5F9';
  const noteBg   = dark ? '#1C2128' : '#F9FAFB';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(prescription.id)}
      style={{
        backgroundColor: cardBg,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: dark ? '#30363D' : '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: dark ? 0.2 : 0.05,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* ── Accent bar ── */}
      <View style={{ height: 3, backgroundColor: cfg.bar }} />

      {/* ── Image ── */}
      {imageUri && (
        <View>
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Status pill on image */}
          <View style={{
            position: 'absolute', top: 12, right: 12,
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: statusBg,
            paddingHorizontal: 12, paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: cfg.color + '33',
          }}>
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={{ fontSize: 11, fontWeight: '900', color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {cfg.label}
            </Text>
          </View>
        </View>
      )}

      <View style={{ padding: 18 }}>

        {/* ── Header row ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 18,
        }}>
          {/* Icon + price/status */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 48, height: 48, borderRadius: 16,
              backgroundColor: statusBg,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: cfg.color + '22',
            }}>
              <Ionicons name="document-text" size={24} color={cfg.color} />
            </View>
            <View>
              <Text style={{
                fontSize: 10, color: subText, fontWeight: '800',
                letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2,
              }}>
                Estimation
              </Text>
              {prescription.quoteAmount != null ? (
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>Rs.</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: bodyText, letterSpacing: -0.5 }}>
                    {prescription.quoteAmount.toLocaleString()}
                  </Text>
                </View>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '800', color: bodyText }}>
                  Processing...
                </Text>
              )}
            </View>
          </View>

          {/* Right side: metadata */}
          <View style={{ alignItems: 'flex-end' }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Ionicons name="time-outline" size={12} color={subText} />
                <Text style={{ fontSize: 11, color: subText, fontWeight: '700' }}>{ago}</Text>
             </View>
             {!imageUri && (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: statusBg,
                  paddingHorizontal: 10, paddingVertical: 5,
                  borderRadius: 12,
                  borderWidth: 1, borderColor: cfg.color + '22',
                }}>
                  <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                  <Text style={{ fontSize: 10, fontWeight: '900', color: cfg.color, textTransform: 'uppercase' }}>
                    {cfg.label}
                  </Text>
                </View>
             )}
          </View>
        </View>

        {/* ── Progress bar ── */}
        {prescription.status !== 'rejected' && (
          <View style={{ marginBottom: 18 }}>
            <View style={{
              height: 5, borderRadius: 3,
              backgroundColor: dark ? '#21262D' : '#F1F5F9',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              <View style={{
                height: '100%', borderRadius: 3,
                backgroundColor: cfg.bar,
                width: `${Math.max(((cfg.step + 1) / STEPS.length) * 100, 10)}%`,
              }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {STEPS.map((label, i) => (
                <Text
                  key={label}
                  style={{
                    fontSize: 9,
                    fontWeight: i <= cfg.step ? '800' : '600',
                    color: i <= cfg.step ? cfg.color : subText,
                    textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center',
                    flex: 1,
                    opacity: i <= cfg.step ? 1 : 0.6,
                  }}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Rejected banner ── */}
        {prescription.status === 'rejected' && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: dark ? '#450A0A' : '#FFF1F2',
            borderRadius: 16, padding: 14, marginBottom: 16,
            borderWidth: 1, borderColor: '#FDA4AF',
          }}>
            <Ionicons name="close-circle" size={20} color="#E11D48" />
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: dark ? '#FCA5A5' : '#BE123C', flex: 1,
            }}>
              This prescription was declined
            </Text>
          </View>
        )}

        {/* ── Notes Peek ── */}
        {hasNote && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: noteBg,
            borderRadius: 14, padding: 12, marginBottom: 18,
            borderWidth: 1, borderColor: divider,
          }}>
             <Ionicons name="chatbubble-ellipses-outline" size={16} color={cfg.color} />
             <Text style={{ fontSize: 12, color: subText, flex: 1, fontWeight: '500' }} numberOfLines={1}>
                {prescription.adminMessage || prescription.message}
             </Text>
             <Ionicons name="chevron-forward" size={12} color={subText} />
          </View>
        )}

        {/* ── Footer ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: divider,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{
              width: 24, height: 24, borderRadius: 8,
              backgroundColor: dark ? '#21262D' : '#F8FAFC',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="finger-print" size={13} color={subText} />
            </View>
            <Text style={{ fontSize: 11, color: subText, fontWeight: '600', letterSpacing: 0.2 }}>
              ID: {prescription.id.slice(-6).toUpperCase()}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#0F766E' + '11',
            paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1, borderColor: '#0F766E' + '22',
          }}>
            <Text style={{ fontSize: 12, color: '#0F766E', fontWeight: '800' }}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="#0F766E" />
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
};


