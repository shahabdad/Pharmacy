import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; darkBg: string; icon: string; step: number }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', darkBg: '#451A03', icon: 'time-outline',             step: 1 },
  confirmed: { label: 'Confirmed', color: '#2563EB', bg: '#DBEAFE', darkBg: '#1E3A5F', icon: 'checkmark-circle-outline', step: 2 },
  shipped:   { label: 'Shipped',   color: '#7C3AED', bg: '#EDE9FE', darkBg: '#2E1065', icon: 'bicycle-outline',          step: 3 },
  delivered: { label: 'Delivered', color: '#059669', bg: '#D1FAE5', darkBg: '#022C22', icon: 'bag-check-outline',        step: 4 },
};

const STEPS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

// ─── Progress stepper ─────────────────────────────────────────────────────────
function OrderStepper({ status, dark }: { status: OrderStatus; dark: boolean }) {
  const current = STATUS_CFG[status].step;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
      {STEPS.map((s, i) => {
        const cfg   = STATUS_CFG[s];
        const done  = cfg.step <= current;
        const isNow = cfg.step === current;
        return (
          <React.Fragment key={s}>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: done ? cfg.color : (dark ? '#21262D' : '#E2E8F0'),
                alignItems: 'center', justifyContent: 'center',
                borderWidth: isNow ? 2 : 0,
                borderColor: isNow ? cfg.color + '60' : 'transparent',
              }}>
                <Ionicons
                  name={done ? (isNow ? cfg.icon as any : 'checkmark') : 'ellipse-outline'}
                  size={isNow ? 14 : 12}
                  color={done ? '#fff' : (dark ? '#6E7681' : '#94A3B8')}
                />
              </View>
              <Text style={{
                fontSize: 8, fontWeight: '700', marginTop: 4,
                color: done ? cfg.color : (dark ? '#6E7681' : '#94A3B8'),
                textTransform: 'uppercase', letterSpacing: 0.3,
              }}>
                {cfg.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={{
                flex: 1, height: 2, marginBottom: 16,
                backgroundColor: STATUS_CFG[STEPS[i + 1]].step <= current
                  ? STATUS_CFG[STEPS[i + 1]].color
                  : (dark ? '#21262D' : '#E2E8F0'),
              }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Single order card ────────────────────────────────────────────────────────
function OrderCard({ order, dark }: { order: Order; dark: boolean }) {
  const cfg = STATUS_CFG[order.status];
  const [expanded, setExpanded] = useState(false);

  const dateStr = (() => {
    try {
      return new Date(order.createdAt).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return '—'; }
  })();

  return (
    <View style={{
      backgroundColor: dark ? '#161B22' : '#FFFFFF',
      borderRadius: 22, marginBottom: 14, overflow: 'hidden',
      shadowColor: cfg.color, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: dark ? 0.2 : 0.08, shadowRadius: 14, elevation: 5,
      borderWidth: 1, borderColor: dark ? '#21262D' : '#F1F5F9',
    }}>
      {/* Accent bar */}
      <View style={{ height: 3, backgroundColor: cfg.color }} />

      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '900', color: dark ? '#E6EDF3' : '#0F172A' }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 11, color: dark ? '#6E7681' : '#94A3B8', marginTop: 1 }}>{dateStr}</Text>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: dark ? cfg.darkBg : cfg.bg,
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
          }}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
          </View>
        </View>

        {/* Stepper */}
        <OrderStepper status={order.status} dark={dark} />

        {/* Admin note */}
        {order.adminNote ? (
          <View style={{
            backgroundColor: dark ? '#1C2A3A' : '#EFF6FF',
            borderRadius: 12, padding: 10, marginBottom: 10,
            flexDirection: 'row', alignItems: 'flex-start', gap: 8,
          }}>
            <Ionicons name="chatbubble-outline" size={13} color="#2563EB" style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: dark ? '#93C5FD' : '#1D4ED8', flex: 1, lineHeight: 18 }}>
              {order.adminNote}
            </Text>
          </View>
        ) : null}

        {/* Items preview / expand */}
        <TouchableOpacity
          onPress={() => setExpanded(e => !e)}
          style={{
            backgroundColor: dark ? '#0D1117' : '#F8FAFC',
            borderRadius: 14, padding: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: expanded ? 8 : 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="cart-outline" size={13} color={dark ? '#8B949E' : '#6366F1'} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: dark ? '#8B949E' : '#6366F1', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#059669' }}>
                Rs.{order.totalAmount.toLocaleString()}
              </Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={dark ? '#6E7681' : '#94A3B8'} />
            </View>
          </View>

          {expanded && order.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#A5B4FC' }} />
                <Text style={{ fontSize: 12, color: dark ? '#E6EDF3' : '#334155', fontWeight: '500' }}>{item.name}</Text>
                <Text style={{ fontSize: 11, color: dark ? '#6E7681' : '#94A3B8' }}>×{item.quantity}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: dark ? '#E6EDF3' : '#0F172A' }}>
                Rs.{(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* WhatsApp notified */}
        {order.whatsappNotified && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <Ionicons name="logo-whatsapp" size={12} color="#16A34A" />
            <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '600' }}>Notified via WhatsApp</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const { firebaseUser } = useAuth();

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = orderService.listenToUserOrders(firebaseUser.uid, data => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [firebaseUser]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const bg = dark ? '#0D1117' : '#F8FAFC';

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>

      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.duration(350)} style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 }}>
        <Text style={{ fontSize: 11, color: dark ? '#6E7681' : '#94A3B8', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Track your
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: dark ? '#F0FDF4' : '#0F172A', letterSpacing: -0.5 }}>
          Orders
        </Text>
      </Animated.View>

      {/* ── Filter chips ── */}
      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 14 }}
        >
          {([
            { label: 'All',       value: 'all'       as const, count: orders.length },
            { label: 'Pending',   value: 'pending'   as const, count: counts.pending   ?? 0 },
            { label: 'Confirmed', value: 'confirmed' as const, count: counts.confirmed ?? 0 },
            { label: 'Shipped',   value: 'shipped'   as const, count: counts.shipped   ?? 0 },
            { label: 'Delivered', value: 'delivered' as const, count: counts.delivered ?? 0 },
          ]).map(chip => {
            const active = filter === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                onPress={() => setFilter(chip.value)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: active ? '#6366F1' : (dark ? '#161B22' : '#FFFFFF'),
                  borderWidth: 1, borderColor: active ? '#6366F1' : (dark ? '#21262D' : '#E2E8F0'),
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : (dark ? '#8B949E' : '#374151') }}>
                  {chip.label}
                </Text>
                <View style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.25)' : (dark ? '#21262D' : '#F1F5F9'),
                  borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : (dark ? '#6E7681' : '#64748B') }}>
                    {chip.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Content ── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={{ fontSize: 13, color: dark ? '#6E7681' : '#94A3B8', marginTop: 12, fontWeight: '600' }}>
              Loading orders…
            </Text>
          </Animated.View>
        </View>
      ) : filtered.length === 0 ? (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: dark ? '#161B22' : '#F1F5F9',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Ionicons name="receipt-outline" size={40} color={dark ? '#30363D' : '#CBD5E1'} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: dark ? '#E6EDF3' : '#374151', marginBottom: 6, textAlign: 'center' }}>
            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          </Text>
          <Text style={{ fontSize: 13, color: dark ? '#6E7681' : '#94A3B8', textAlign: 'center', lineHeight: 20 }}>
            {filter === 'all'
              ? 'Your orders will appear here once you submit a prescription'
              : 'Try a different filter'}
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((order, idx) => (
            <Animated.View key={order.id} entering={FadeInDown.delay(idx * 50).springify()}>
              <OrderCard order={order} dark={dark} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
