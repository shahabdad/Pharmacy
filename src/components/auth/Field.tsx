import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FieldProps {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboard?: any;
  secure?: boolean;
  delay: number;
}

export function Field({
  label, icon, value, onChange, placeholder, keyboard, secure, delay,
}: FieldProps) {
  const [show, setShow] = React.useState(false);
  const focused = value.length > 0;
  const dark = useColorScheme() === 'dark';

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={{ marginBottom: 16 }}>
      <Text style={{
        fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4,
        color: dark ? '#8B949E' : '#4B5563',
      }}>
        {label}
      </Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: dark ? '#0D1117' : '#F9FAFB',
        borderRadius: 16, paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: focused ? '#6C63FF' : (dark ? '#21262D' : 'transparent'),
      }}>
        <Ionicons name={icon as any} size={17} color={focused ? '#6C63FF' : '#9CA3AF'} />
        <TextInput
          style={{
            flex: 1, fontSize: 14,
            color: dark ? '#E6EDF3' : '#1F2937',
            paddingVertical: 14, marginLeft: 12, padding: 0,
          }}
          placeholder={placeholder}
          placeholderTextColor={dark ? '#6E7681' : '#9CA3AF'}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard ?? 'default'}
          autoCapitalize="none"
          secureTextEntry={secure && !show}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} hitSlop={8}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={17} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
