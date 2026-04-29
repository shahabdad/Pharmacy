import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const VARIANT_STYLES = {
  primary:   { bg: 'bg-violet-600',  text: 'text-white',      shadow: '#6C63FF' },
  secondary: { bg: 'bg-gray-100',    text: 'text-violet-600', shadow: '#000'    },
  danger:    { bg: 'bg-red-500',     text: 'text-white',      shadow: '#EF4444' },
};

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading  = false,
  disabled = false,
  variant  = 'primary',
}) => {
  const scale = useSharedValue(1);
  const cfg   = VARIANT_STYLES[variant];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        animStyle,
        { shadowColor: cfg.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: isDisabled ? 0 : 0.2, shadowRadius: 12, elevation: isDisabled ? 0 : 6 },
      ]}
      className="my-2"
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { if (!isDisabled) scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        disabled={isDisabled}
        activeOpacity={0.9}
        className={`${cfg.bg} rounded-2xl py-3.5 items-center ${isDisabled ? 'opacity-50' : ''}`}
      >
        <Text className={`${cfg.text} text-base font-bold`}>
          {loading ? 'Loading...' : title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
