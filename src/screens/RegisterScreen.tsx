import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AuthButton } from '../components/AuthButton';
import { authService } from '../services/authService';
import { validators } from '../utils/validators';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState<'user' | 'admin'>('user');
  const [loading,         setLoading]         = useState(false);
  const [showPass,        setShowPass]        = useState(false);

  const handleRegister = async () => {
    if (!validators.isValidName(name))       { Alert.alert('Invalid Name', 'Please enter a valid name'); return; }
    if (!validators.isValidEmail(email))     { Alert.alert('Invalid Email', 'Please enter a valid email'); return; }
    if (!validators.isValidPhone(phone))     { Alert.alert('Invalid Phone', 'Please enter a valid phone number'); return; }
    if (!validators.isStrongPassword(password)) { Alert.alert('Weak Password', 'Password must be at least 6 characters'); return; }
    if (password !== confirmPassword)        { Alert.alert('Mismatch', 'Passwords do not match'); return; }

    setLoading(true);
    try {
      await authService.register({ name, email, phone, password, role });
      Alert.alert('Success', 'Account created successfully');
      onRegisterSuccess();
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name',     icon: 'person-outline',   value: name,    set: setName,    placeholder: 'John Doe',          type: 'default',       secure: false },
    { label: 'Email',         icon: 'mail-outline',     value: email,   set: setEmail,   placeholder: 'your@email.com',    type: 'email-address', secure: false },
    { label: 'Phone Number',  icon: 'call-outline',     value: phone,   set: setPhone,   placeholder: '+92 300 1234567',   type: 'phone-pad',     secure: false },
  ] as const;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="bg-violet-600 px-6 pt-14 pb-10 rounded-b-[40px] overflow-hidden"
          style={{ shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 16 }}
        >
          <View className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mb-3"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}
          >
            <Ionicons name="person-add" size={22} color="#6C63FF" />
          </View>
          <Text className="text-white text-2xl font-black">Create Account</Text>
          <Text className="text-violet-200 text-xs mt-1">Join Medicare today</Text>
        </Animated.View>

        <View className="px-6 pt-7">
          {/* Text fields */}
          {fields.map((f, i) => (
            <Animated.View key={f.label} entering={FadeInDown.delay(i * 60 + 100).duration(400)} className="mb-4">
              <Text className="text-xs font-bold text-gray-700 mb-2">{f.label}</Text>
              <View
                className="flex-row items-center bg-gray-50 rounded-2xl px-4 border-2"
                style={{ borderColor: f.value ? '#6C63FF' : 'transparent' }}
              >
                <Ionicons name={f.icon as any} size={17} color={f.value ? '#6C63FF' : '#9CA3AF'} />
                <TextInput
                  className="flex-1 text-sm text-gray-800 py-3.5 ml-3"
                  placeholder={f.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={f.value}
                  onChangeText={f.set as any}
                  keyboardType={f.type as any}
                  autoCapitalize="none"
                  editable={!loading}
                  style={{ padding: 0 }}
                />
              </View>
            </Animated.View>
          ))}

          {/* Role selector */}
          <Animated.View entering={FadeInDown.delay(280).duration(400)} className="mb-4">
            <Text className="text-xs font-bold text-gray-700 mb-2">I am a...</Text>
            <View className="flex-row gap-3">
              {(['user', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  disabled={loading}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl border-2 ${
                    role === r ? 'bg-violet-600 border-violet-600' : 'bg-gray-50 border-transparent'
                  }`}
                >
                  <Ionicons
                    name={r === 'user' ? 'person' : 'storefront'}
                    size={16}
                    color={role === r ? '#fff' : '#9CA3AF'}
                  />
                  <Text className={`text-xs font-bold ${role === r ? 'text-white' : 'text-gray-500'}`}>
                    {r === 'user' ? 'Patient' : 'Shop Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.delay(340).duration(400)} className="mb-4">
            <Text className="text-xs font-bold text-gray-700 mb-2">Password</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-2xl px-4 border-2"
              style={{ borderColor: password ? '#6C63FF' : 'transparent' }}
            >
              <Ionicons name="lock-closed-outline" size={17} color={password ? '#6C63FF' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-sm text-gray-800 py-3.5 ml-3"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                editable={!loading}
                style={{ padding: 0 }}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={17} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="mb-6">
            <Text className="text-xs font-bold text-gray-700 mb-2">Confirm Password</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-2xl px-4 border-2"
              style={{ borderColor: confirmPassword ? '#6C63FF' : 'transparent' }}
            >
              <Ionicons name="lock-closed-outline" size={17} color={confirmPassword ? '#6C63FF' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-sm text-gray-800 py-3.5 ml-3"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
                editable={!loading}
                style={{ padding: 0 }}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(460).duration(400)}>
            <AuthButton title="Create Account" onPress={handleRegister} loading={loading} variant="primary" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(520).duration(400)}>
            <TouchableOpacity
              onPress={onNavigateToLogin}
              disabled={loading}
              className="mt-3 py-3 items-center"
            >
              <Text className="text-sm text-gray-400">
                Already have an account?{' '}
                <Text className="text-violet-600 font-bold">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
