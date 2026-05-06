import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
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
  pending:   { label: 'Pending Review', icon: 'hourglass-outline',       color: '#D97706', bg: '#FEF3C7', darkBg: '#78350F', bar: '#F59E0B', step: 0 },
  quoted:    { label: 'Quote Sent',     icon: 'pricetag-outline',         color: '#2563EB', bg: '#DBEAFE', darkBg: '#1E3A5F', bar: '#3B82F6', step: 1 },
  approved:  { label: 'Approved',       icon: 'checkmark-circle-outline', color: '#059669', bg: '#D1FAE5', darkBg: '#064E3B', bar: '#10B981', step: 2 },
  delivered: { label: 'Delivered',      icon: 'bag-check-outline',        color: '#4F46E5', bg: '#EDE9FE', darkBg: '#1E1B4B', bar: '#6366F1', step: 3 },
  rejected:  { label: 'Rejected',       icon: 'close-circle-outline',     color: '#DC2626', bg: '#FEE2E2', darkBg: '#450A0A', bar: '#EF4444', step: -1 },
};

const STEPS = ['Submitted', 'Quoted', 'Approved', 'Delivered'];

// ─── Friendly date formatter ───────────────────────────────────────────────────
function formatDate(raw: Date): { date: string; time: string } {
  try {
    const d = new Date(raw);
    const date = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  } catch {
    return { date: '—', time: '' };
  }
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onPress,
}) => {
  const dark = useColorScheme() === 'dark';
  const cfg  = STATUS_CFG[prescription.status];

  const imageUri  = (prescription.imageURL || prescription.imageUrl || '').trim() || null;
  const { date, time } = formatDate(prescription.createdAt);

  // ── Theme shortcuts ──────────────────────────────────────────────────────────
  const cardBg   = dark ? '#161B22' : '#FFFFFF';
  const statusBg = dark ? cfg.darkBg : cfg.bg;
  const subText  = dark ? '#6E7681' : '#94A3B8';
  const bodyText = dark ? '#F0F6FC' : '#0F172A';
  const mutedBg  = dark ? '#0D1117' : '#F8FAFC';
  const divider  = dark ? '#21262D' : '#F1F5F9';

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
      {/* ── Top accent bar ── */}
      <View style={{ height: 4, backgroundColor: cfg.bar }} />

      {/* ── Prescription image ── */}
      {imageUri && (
        <View>
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 140 }}
            resizeMode="cover"
          />
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.18)',
          }} />
          {/* Status pill */}
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
          {/* Date chip on image */}
          <View style={{
            position: 'absolute', bottom: 12, left: 12,
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: 'rgba(0,0,0,0.55)',
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 10,
          }}>
            <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.8)" />
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>{date}</Text>
          </View>
        </View>
      )}

      <View style={{ padding: 18 }}>

        {/* ── Header row ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          {/* Left: icon + title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 46, height: 46, borderRadius: 14,
              backgroundColor: statusBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="document-text" size={22} color={cfg.color} />
            </View>
            <View>
              {/* Modern label instead of raw ID */}
              <Text style={{
                fontSize: 11, color: subText, fontWeight: '600',
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>
                {imageUri ? 'Photo Prescription' : 'Text Prescription'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Text style={{
                  fontSize: 15, fontWeight: '900', color: bodyText, letterSpacing: -0.2,
                }}>
                  {date}
                </Text>
                {time ? (
                  <View style={{
                    backgroundColor: dark ? '#21262D' : '#F1F5F9',
                    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: subText }}>
                      {time}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Right: status pill (no-image only) */}
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

        {/* ── Progress tracker (not for rejected) ── */}
        {prescription.status !== 'rejected' && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              {STEPS.map((_, i) => {
                const done    = i <= cfg.step;
                const current = i === cfg.step;
                return (
                  <React.Fragment key={i}>
                    <View style={{
                      width: current ? 14 : 10,
                      height: current ? 14 : 10,
                      borderRadius: 7,
                      backgroundColor: done ? cfg.bar : (dark ? '#30363D' : '#E2E8F0'),
                      borderWidth: current ? 2.5 : 0,
                      borderColor: current ? cfg.bar : 'transparent',
                    }} />
                    {i < STEPS.length - 1 && (
                      <View style={{
                        flex: 1, height: 3, borderRadius: 2,
                        backgroundColor: i < cfg.step
                          ? cfg.bar
                          : (dark ? '#21262D' : '#E2E8F0'),
                        marginHorizontal: 3,
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
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
              This prescription was rejected
            </Text>
          </View>
        )}

        {/* ── Quote amount ── */}
        {prescription.quoteAmount != null && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: dark ? '#064E3B' : '#ECFDF5',
            borderRadius: 16, padding: 14, marginBottom: 12,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: dark ? '#065F46' : '#D1FAE5',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="pricetag" size={18} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: 0.5, color: dark ? '#34D399' : '#059669',
              }}>
                Quoted Price
              </Text>
              <Text style={{
                fontSize: 20, fontWeight: '900', letterSpacing: -0.5,
                color: dark ? '#6EE7B7' : '#065F46',
              }}>
                Rs. {prescription.quoteAmount.toLocaleString()}
              </Text>
            </View>
            <View style={{
              backgroundColor: dark ? '#065F46' : '#D1FAE5',
              borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
            }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>
                QUOTED
              </Text>
            </View>
          </View>
        )}

        {/* ── Pharmacist note ── */}
        {prescription.adminMessage ? (
          <View style={{
            flexDirection: 'row', gap: 10,
            backgroundColor: mutedBg,
            borderRadius: 14, padding: 12, marginBottom: 12,
            borderLeftWidth: 3, borderLeftColor: cfg.bar,
          }}>
            <View style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: statusBg,
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Ionicons name="chatbubble-ellipses" size={13} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 10, fontWeight: '700', color: cfg.color,
                marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4,
              }}>
                Pharmacist Note
              </Text>
              <Text style={{ fontSize: 12, color: dark ? '#8B949E' : '#475569', lineHeight: 18 }}>
                {prescription.adminMessage}
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── Medicine list (text orders) ── */}
        {prescription.message && !imageUri ? (
          <View style={{
            backgroundColor: mutedBg,
            borderRadius: 14, padding: 12, marginBottom: 12,
            borderLeftWidth: 3, borderLeftColor: '#6366F1',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Ionicons name="create-outline" size={13} color="#6366F1" />
              <Text style={{
                fontSize: 10, fontWeight: '700', color: '#6366F1',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Medicine List
              </Text>
            </View>
            <Text style={{
              fontSize: 12, color: dark ? '#8B949E' : '#475569', lineHeight: 18,
            }} numberOfLines={3}>
              {prescription.message}
            </Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: divider,
        }}>
          {/* Date (only shown when no image — image already has it) */}
          {!imageUri ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{
                width: 22, height: 22, borderRadius: 6,
                backgroundColor: dark ? '#21262D' : '#F1F5F9',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="calendar-outline" size={12} color={subText} />
              </View>
              <Text style={{ fontSize: 11, color: subText, fontWeight: '500' }}>{date}</Text>
            </View>
          ) : (
            /* Status label repeated for image cards */
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: cfg.bar,
              }} />
              <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '700' }}>
                {cfg.label}
              </Text>
            </View>
          )}

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
