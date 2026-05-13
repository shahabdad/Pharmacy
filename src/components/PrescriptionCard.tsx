import { Ionicons } from '@expo/vector-icons';
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
  pending:   { label: 'Reviewing',  icon: 'time-outline',             color: '#D97706', bg: '#FEF3C7', darkBg: '#78350F', bar: '#F59E0B', step: 0 },
  quoted:    { label: 'To Pay',     icon: 'card-outline',             color: '#2563EB', bg: '#DBEAFE', darkBg: '#1E3A5F', bar: '#3B82F6', step: 1 },
  approved:  { label: 'Approved',   icon: 'checkmark-circle-outline', color: '#059669', bg: '#D1FAE5', darkBg: '#064E3B', bar: '#10B981', step: 2 },
  delivered: { label: 'Delivered',  icon: 'cube-outline',             color: '#4F46E5', bg: '#EDE9FE', darkBg: '#1E1B4B', bar: '#6366F1', step: 3 },
  rejected:  { label: 'Declined',   icon: 'alert-circle-outline',     color: '#DC2626', bg: '#FEE2E2', darkBg: '#450A0A', bar: '#EF4444', step: -1 },
};

const STEPS = ['Sent', 'Quote', 'Approved', 'Ready'];

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
    if (diff < 60)   return 'just now';
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
  const subText  = dark ? '#6E7681' : '#94A3B8';
  const bodyText = dark ? '#F0F6FC' : '#0F172A';
  const mutedBg  = dark ? '#0D1117' : '#F8FAFC';
  const divider  = dark ? '#21262D' : '#F1F5F9';
  const noteBg   = dark ? '#1C2128' : '#F8FAFC';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(prescription.id)}
      style={{
        backgroundColor: cardBg,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: dark ? 1 : 0,
        borderColor: dark ? '#21262D' : 'transparent',
        shadowColor: cfg.bar,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: dark ? 0.2 : 0.12,
        shadowRadius: 18,
        elevation: 6,
      }}
    >
      {/* ── Accent bar ── */}
      <View style={{ height: 4, backgroundColor: cfg.bar }} />

      {/* ── Image ── */}
      {imageUri && (
        <View>
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 140 }}
            resizeMode="cover"
          />
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.15)',
          }} />
          {/* Status pill on image */}
          <View style={{
            position: 'absolute', top: 12, right: 12,
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: statusBg,
            paddingHorizontal: 11, paddingVertical: 6,
            borderRadius: 22,
          }}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>
              {cfg.label}
            </Text>
          </View>
          {/* Time chip on image */}
          <View style={{
            position: 'absolute', bottom: 12, left: 12,
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 10,
          }}>
            <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{ago}</Text>
          </View>
        </View>
      )}

      <View style={{ padding: 18 }}>

        {/* ── Header row ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          {/* Icon + price/status */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 46, height: 46, borderRadius: 14,
              backgroundColor: statusBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="document-text" size={22} color={cfg.color} />
            </View>
            <View>
              <Text style={{
                fontSize: 11, color: subText, fontWeight: '600',
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>
                Price
              </Text>
              {prescription.quoteAmount != null ? (
                <Text style={{
                  fontSize: 20, fontWeight: '900', color: '#059669', letterSpacing: -0.5,
                }}>
                  Rs. {prescription.quoteAmount.toLocaleString()}
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cfg.bar }} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.color }}>
                    {cfg.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Right side: note toggle + status pill (no-image) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {hasNote && (
              <TouchableOpacity
                onPress={() => setShowNote(v => !v)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: showNote
                    ? cfg.bar
                    : (dark ? '#21262D' : '#F1F5F9'),
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={17}
                  color={showNote ? '#fff' : subText}
                />
              </TouchableOpacity>
            )}
            {!imageUri && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                backgroundColor: statusBg,
                paddingHorizontal: 11, paddingVertical: 6,
                borderRadius: 22,
              }}>
                <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>
                  {cfg.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Progress bar ── */}
        {prescription.status !== 'rejected' && (
          <View style={{ marginBottom: 16 }}>
            {/* Track */}
            <View style={{
              height: 6, borderRadius: 3,
              backgroundColor: dark ? '#21262D' : '#F1F5F9',
              overflow: 'hidden',
              marginBottom: 6,
            }}>
              <View style={{
                height: '100%', borderRadius: 3,
                backgroundColor: cfg.bar,
                width: `${Math.max((cfg.step / (STEPS.length - 1)) * 100, 8)}%`,
              }} />
            </View>
            {/* Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {STEPS.map((label, i) => (
                <Text
                  key={label}
                  style={{
                    fontSize: 9,
                    fontWeight: i === cfg.step ? '800' : '500',
                    color: i <= cfg.step ? cfg.color : subText,
                    textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center',
                    flex: 1,
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
            backgroundColor: dark ? '#450A0A' : '#FEF2F2',
            borderRadius: 14, padding: 12, marginBottom: 14,
            borderLeftWidth: 3, borderLeftColor: '#EF4444',
          }}>
            <Ionicons name="close-circle" size={18} color="#EF4444" />
            <Text style={{
              fontSize: 12, fontWeight: '700',
              color: dark ? '#FCA5A5' : '#DC2626', flex: 1,
            }}>
              This prescription was declined
            </Text>
          </View>
        )}

        {/* ── Expandable notes ── */}
        {showNote && hasNote && (
          <Animated.View entering={FadeInDown.duration(250)}>
            {prescription.message ? (
              <View style={{
                flexDirection: 'row', gap: 10,
                backgroundColor: noteBg,
                borderRadius: 14, padding: 12, marginBottom: 10,
                borderLeftWidth: 3, borderLeftColor: '#6366F1',
              }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 8,
                  backgroundColor: dark ? '#21262D' : '#EEF2FF',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Ionicons name="person-outline" size={13} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '700', color: '#6366F1',
                    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3,
                  }}>
                    Your Note
                  </Text>
                  <Text style={{
                    fontSize: 12, color: dark ? '#8B949E' : '#475569', lineHeight: 18,
                  }} numberOfLines={3}>
                    {prescription.message}
                  </Text>
                </View>
              </View>
            ) : null}

            {prescription.adminMessage ? (
              <View style={{
                flexDirection: 'row', gap: 10,
                backgroundColor: noteBg,
                borderRadius: 14, padding: 12, marginBottom: 10,
                borderLeftWidth: 3, borderLeftColor: cfg.bar,
              }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 8,
                  backgroundColor: statusBg,
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Ionicons name="chatbubble-ellipses" size={13} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 10, fontWeight: '700', color: cfg.color,
                    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3,
                  }}>
                    Pharmacist Note
                  </Text>
                  <Text style={{
                    fontSize: 12, color: dark ? '#8B949E' : '#475569', lineHeight: 18,
                  }} numberOfLines={3}>
                    {prescription.adminMessage}
                  </Text>
                </View>
              </View>
            ) : null}
          </Animated.View>
        )}

        {/* ── Footer ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: divider,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{
              width: 22, height: 22, borderRadius: 6,
              backgroundColor: dark ? '#21262D' : '#F1F5F9',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="time-outline" size={12} color={subText} />
            </View>
            <Text style={{ fontSize: 11, color: subText, fontWeight: '500' }}>{ago}</Text>
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: statusBg,
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '700' }}>View details</Text>
            <Ionicons name="arrow-forward" size={12} color={cfg.color} />
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
};
