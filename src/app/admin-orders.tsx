import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    SlideInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_SHOP } from '../constants/shops';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { OrderSkeleton } from '../components/Skeleton';
import { Order, OrderStatus } from '../types';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<OrderStatus, {
  label: string; color: string; bg: string; icon: string; next: OrderStatus | null; nextLabel: string;
}> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', icon: 'time-outline',              next: 'confirmed', nextLabel: 'Confirm Order'   },
  confirmed: { label: 'Confirmed', color: '#2563EB', bg: '#DBEAFE', icon: 'checkmark-circle-outline',  next: 'shipped',   nextLabel: 'Mark Shipped'    },
  shipped:   { label: 'Shipped',   color: '#7C3AED', bg: '#EDE9FE', icon: 'bicycle-outline',           next: 'delivered', nextLabel: 'Mark Delivered'  },
  delivered: { label: 'Delivered', color: '#059669', bg: '#D1FAE5', icon: 'bag-check-outline',         next: null,        nextLabel: ''                },
};

const FILTERS: Array<{ label: string; value: OrderStatus | 'all' }> = [
  { label: 'All',       value: 'all'       },
  { label: 'Pending',   value: 'pending'   },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped',   value: 'shipped'   },
  { label: 'Delivered', value: 'delivered' },
];

// ─── Note modal (bottom sheet) ────────────────────────────────────────────────
function NoteSheet({
  order,
  onClose,
  onConfirm,
}: {
  order: Order;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const cfg = STATUS_CFG[order.status];
  const next = cfg.next;
  const [note, setNote] = useState(order.adminNote ?? '');

  if (!next) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999,
        justifyContent: 'flex-end',
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={() => {}}>
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 24, paddingBottom: 36,
            shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
          }}
        >
          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: STATUS_CFG[next].bg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name={STATUS_CFG[next].icon as any} size={22} color={STATUS_CFG[next].color} />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>{cfg.nextLabel}</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Note for customer (optional)
          </Text>
          <View style={{
            backgroundColor: '#F8FAFC', borderRadius: 14,
            paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: 1.5, borderColor: note ? '#6366F1' : '#E2E8F0',
            marginBottom: 20,
          }}>
            <TextInput
              style={{ fontSize: 14, color: '#0F172A', padding: 0, minHeight: 70, textAlignVertical: 'top' }}
              placeholder="e.g. Your order is on the way!"
              placeholderTextColor="#94A3B8"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(note)}
              style={{
                flex: 2, backgroundColor: STATUS_CFG[next].color,
                borderRadius: 14, paddingVertical: 14,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                shadowColor: STATUS_CFG[next].color,
                shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
              }}
            >
              <Ionicons name="arrow-forward-circle" size={18} color="#fff" />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{cfg.nextLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────
function OrderItem({
  order,
  onAdvance,
  updating,
}: {
  order: Order;
  onAdvance: (o: Order) => void;
  updating: boolean;
}) {
  const cfg  = STATUS_CFG[order.status];
  const next = cfg.next;

  const dateStr = (() => {
    try {
      const d = new Date(order.createdAt);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  })();

  const callCustomer = () => {
    const phone = order.userPhone?.replace(/\s/g, '');
    if (!phone) { Alert.alert('No phone', 'No phone number on this order.'); return; }
    Linking.openURL(`tel:${phone}`);
  };

  const whatsappCustomer = () => {
    const num = (order.userPhone ?? DEFAULT_SHOP.whatsapp).replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hi ${order.userName || 'Customer'}, your order #${order.id.slice(0, 8).toUpperCase()} status: ${cfg.label}`);
    Linking.openURL(`https://wa.me/${num}?text=${msg}`);
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, overflow: 'hidden',
      shadowColor: cfg.color, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 14, elevation: 5,
    }}>
      {/* Accent bar */}
      <View style={{ height: 3, backgroundColor: cfg.color }} />

      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 2 }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>{dateStr}</Text>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
          }}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
          </View>
        </View>

        {/* Customer info */}
        {(order.userName || order.userPhone || order.userAddress) && (
          <View style={{
            backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person" size={14} color="#6366F1" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                {order.userName || 'Customer'}
              </Text>
            </View>
            {order.userPhone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="call-outline" size={12} color="#6366F1" />
                <Text style={{ fontSize: 12, color: '#475569' }}>{order.userPhone}</Text>
              </View>
            ) : null}
            {order.userAddress ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                <Ionicons name="location-outline" size={12} color="#6366F1" style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 12, color: '#475569', flex: 1, lineHeight: 18 }}>{order.userAddress}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Items */}
        <View style={{
          backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="cart-outline" size={13} color="#6366F1" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </Text>
          </View>
          {order.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#A5B4FC' }} />
                <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500' }}>{item.name}</Text>
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>×{item.quantity}</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                Rs.{(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#059669' }}>
              Rs.{order.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Admin note */}
        {order.adminNote ? (
          <View style={{
            backgroundColor: '#EFF6FF', borderRadius: 12, padding: 10, marginBottom: 10,
            flexDirection: 'row', alignItems: 'flex-start', gap: 8,
          }}>
            <Ionicons name="chatbubble-outline" size={14} color="#2563EB" style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: '#1D4ED8', flex: 1, lineHeight: 18 }}>{order.adminNote}</Text>
          </View>
        ) : null}

        {/* WhatsApp notified badge */}
        {order.whatsappNotified && (
          <View style={{
            backgroundColor: '#F0FDF4', borderRadius: 12, padding: 8, marginBottom: 10,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}>
            <Ionicons name="logo-whatsapp" size={14} color="#16A34A" />
            <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '600' }}>Customer notified via WhatsApp</Text>
          </View>
        )}

        {/* Action row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Contact buttons */}
          <TouchableOpacity
            onPress={callCustomer}
            style={{
              width: 42, height: 42, borderRadius: 13,
              backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="call" size={18} color="#16A34A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={whatsappCustomer}
            style={{
              width: 42, height: 42, borderRadius: 13,
              backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
          </TouchableOpacity>

          {/* Advance status */}
          {next ? (
            <TouchableOpacity
              onPress={() => onAdvance(order)}
              disabled={updating}
              style={{
                flex: 1, backgroundColor: STATUS_CFG[next].color,
                borderRadius: 13, paddingVertical: 12,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
                shadowColor: STATUS_CFG[next].color,
                shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
              }}
            >
              {updating
                ? <ActivityIndicator size="small" color="#fff" />
                : <>
                    <Ionicons name="arrow-forward-circle" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{cfg.nextLabel}</Text>
                  </>
              }
            </TouchableOpacity>
          ) : (
            <View style={{
              flex: 1, backgroundColor: '#D1FAE5', borderRadius: 13, paddingVertical: 12,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
            }}>
              <Ionicons name="checkmark-done-circle" size={16} color="#059669" />
              <Text style={{ color: '#059669', fontSize: 13, fontWeight: '700' }}>Completed</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<OrderStatus | 'all'>('all');
  const [updating, setUpdating] = useState(false);
  const [sheet,    setSheet]    = useState<Order | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAdmin) { Alert.alert('Access Denied', 'Admin privileges required'); router.replace('/(tabs)'); }
  }, [isAdmin]);

  useEffect(() => {
    setLoading(true);
    unsubRef.current = orderService.listenToShopOrders(DEFAULT_SHOP.id, data => {
      setOrders(data);
      setLoading(false);
    });
    return () => { unsubRef.current?.(); };
  }, []);

  const handleAdvance = async (order: Order, note: string) => {
    const next = STATUS_CFG[order.status].next;
    if (!next) return;
    setUpdating(true);
    setSheet(null);
    try {
      await orderService.updateOrderStatus(order.id, next, note);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Summary stats
  const revenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + o.totalAmount, 0);

  if (!isAdmin) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: insets.top }}>

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#0F172A' }}>Orders</Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
                {filtered.length} {filter === 'all' ? 'total' : filter} · Rs.{revenue.toLocaleString()} revenue
              </Text>
            </View>
          </View>

          {/* Live indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#16A34A' }}>Live</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Pending',   count: counts.pending   ?? 0, color: '#D97706', bg: '#FEF3C7' },
            { label: 'Confirmed', count: counts.confirmed ?? 0, color: '#2563EB', bg: '#DBEAFE' },
            { label: 'Shipped',   count: counts.shipped   ?? 0, color: '#7C3AED', bg: '#EDE9FE' },
            { label: 'Delivered', count: counts.delivered ?? 0, color: '#059669', bg: '#D1FAE5' },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: s.bg, borderRadius: 12, padding: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: s.color }}>{s.count}</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', color: s.color, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map(f => {
            const active = filter === f.value;
            const count  = f.value === 'all' ? orders.length : (counts[f.value] ?? 0);
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: active ? '#6366F1' : '#F1F5F9',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : '#374151' }}>
                  {f.label}
                </Text>
                <View style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                  borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : '#64748B' }}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Content ── */}
      {loading ? (
        <OrderSkeleton />
      ) : filtered.length === 0 ? (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24, backgroundColor: '#F1F5F9',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Ionicons name="cart-outline" size={40} color="#CBD5E1" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 6, textAlign: 'center' }}>
            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          </Text>
          <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 }}>
            {filter === 'all' ? 'Orders from customers will appear here in real-time' : 'Try a different filter'}
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => {}} tintColor="#6366F1" />
          }
        >
          {filtered.map((order, idx) => (
            <Animated.View key={order.id} entering={FadeInDown.delay(idx * 40).springify()}>
              <OrderItem
                order={order}
                onAdvance={o => setSheet(o)}
                updating={updating}
              />
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* ── Note / confirm sheet ── */}
      {sheet && (
        <NoteSheet
          order={sheet}
          onClose={() => setSheet(null)}
          onConfirm={note => handleAdvance(sheet, note)}
        />
      )}
    </View>
  );
}
