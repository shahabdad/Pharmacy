import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';

interface SkeletonProps {
  width: any;
  height: any;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 12, style }) => {
  const isDark = useColorScheme() === 'dark';
  const opacity = useSharedValue(isDark ? 0.3 : 0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(isDark ? 0.1 : 0.3, { duration: 800 }),
        withTiming(isDark ? 0.3 : 0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View 
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#161B22' : '#F1F5F9', // Base background
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View 
        style={[
          {
            flex: 1,
            backgroundColor: isDark ? '#30363D' : '#E2E8F0', // Animated pulse layer
          },
          animatedStyle,
        ]} 
      />
    </View>
  );
};

export const PrescriptionCardSkeleton = () => (
  <View style={{ 
    marginHorizontal: 16, 
    marginBottom: 16, 
    padding: 20, 
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 24,
  }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
      <View>
        <Skeleton width={60} height={10} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width={100} height={24} borderRadius={8} />
      </View>
      <Skeleton width={80} height={28} borderRadius={14} />
    </View>
    
    <Skeleton width="100%" height={6} borderRadius={3} style={{ marginBottom: 20 }} />
    
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
      <Skeleton width={32} height={32} borderRadius={16} />
      <View style={{ flex: 1 }}>
        <Skeleton width="90%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width="60%" height={12} borderRadius={4} />
      </View>
    </View>
    
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 }}>
      <Skeleton width={80} height={14} borderRadius={4} />
      <Skeleton width={60} height={14} borderRadius={4} />
    </View>
  </View>
);

export const HomeHeaderSkeleton = () => (
  <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Skeleton width={120} height={10} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width={180} height={28} borderRadius={8} style={{ marginBottom: 6 }} />
        <Skeleton width={150} height={14} borderRadius={4} />
      </View>
      <Skeleton width={54} height={54} borderRadius={22} />
    </View>
  </View>
);

export const ProfileSkeleton = () => (
  <View style={{ alignItems: 'center', paddingVertical: 30 }}>
    <Skeleton width={120} height={120} borderRadius={60} style={{ marginBottom: 20 }} />
    <Skeleton width={200} height={24} borderRadius={8} style={{ marginBottom: 12 }} />
    <Skeleton width={150} height={14} borderRadius={4} style={{ marginBottom: 30 }} />
    
    <View style={{ width: '100%', paddingHorizontal: 24, gap: 12 }}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 20 }}>
          <Skeleton width={40} height={40} borderRadius={12} />
          <View style={{ flex: 1 }}>
            <Skeleton width="40%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={10} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

export const ChatSkeleton = () => (
  <View style={{ flex: 1, padding: 16, gap: 16 }}>
    {[
      { align: 'flex-start', w: '60%' },
      { align: 'flex-end', w: '70%' },
      { align: 'flex-start', w: '50%' },
      { align: 'flex-start', w: '80%' },
      { align: 'flex-end', w: '40%' },
    ].map((m, i) => (
      <View key={i} style={{ alignSelf: m.align as any, width: m.w as any }}>
        <Skeleton width="100%" height={60} borderRadius={20} style={{ 
          borderTopLeftRadius: m.align === 'flex-start' ? 4 : 20,
          borderTopRightRadius: m.align === 'flex-end' ? 4 : 20,
        }} />
      </View>
    ))}
  </View>
);

export const ActivitySkeleton = () => (
  <View style={{ gap: 12 }}>
    {[1, 2, 3].map(i => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
        <Skeleton width={40} height={40} borderRadius={16} />
        <View style={{ flex: 1 }}>
          <Skeleton width="80%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={10} borderRadius={4} />
        </View>
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
    ))}
  </View>
);

export const OrderSkeleton = () => (
  <View style={{ padding: 16, gap: 16 }}>
    {[1, 2, 3].map(i => (
      <View key={i} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 24, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Skeleton width={100} height={16} borderRadius={4} />
          <Skeleton width={80} height={24} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={2} borderRadius={1} style={{ marginBottom: 16 }} />
        <View style={{ gap: 8, marginBottom: 16 }}>
          <Skeleton width="60%" height={12} borderRadius={4} />
          <Skeleton width="40%" height={12} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Skeleton width={42} height={42} borderRadius={12} />
          <Skeleton width={42} height={42} borderRadius={12} />
          <View style={{ flex: 1 }}>
            <Skeleton width="100%" height={42} borderRadius={12} />
          </View>
        </View>
      </View>
    ))}
  </View>
);

export const UserSkeleton = () => (
  <View style={{ padding: 16, gap: 12 }}>
    {[1, 2, 3, 4].map(i => (
      <View key={i} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 20, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Skeleton width={48} height={48} borderRadius={14} />
          <View style={{ flex: 1 }}>
            <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
            <Skeleton width="60%" height={10} borderRadius={4} />
          </View>
          <Skeleton width={60} height={20} borderRadius={10} />
        </View>
        <Skeleton width="100%" height={32} borderRadius={12} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Skeleton width="45%" height={36} borderRadius={12} />
          <Skeleton width="45%" height={36} borderRadius={12} />
        </View>
      </View>
    ))}
  </View>
);

