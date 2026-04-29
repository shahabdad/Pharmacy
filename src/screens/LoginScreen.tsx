import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Animated, {
    FadeInDown, FadeInUp
} from 'react-native-reanimated';
import { AuthButton } from '../components/AuthButton';
import { authService } from '../services/authService';
import { validators } from '../utils/validators';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!validators.isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!validators.isStrongPassword(password)) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.login({ email, password });
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero section */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          className="bg-violet-600 px-6 pt-16 pb-12 rounded-b-[40px] overflow-hidden"
          style={{ shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 16 }}
        >
          {/* Decorative circles */}
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <View className="absolute top-10 -left-8 w-28 h-28 rounded-full bg-white/5" />

          <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 }}
          >
            <Ionicons name="medical" size={28} color="#6C63FF" />
          </View>
          <Text className="text-white text-3xl font-black tracking-tight">FastMadic</Text>
          <Text className="text-violet-200 text-sm mt-1">Medicine delivery at your doorstep</Text>
        </Animated.View>

        <View className="px-6 pt-8 pb-8">
          <Animated.Text entering={FadeInDown.delay(100).duration(400)} className="text-2xl font-black text-gray-900 mb-1">
            Welcome back 👋
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(150).duration(400)} className="text-sm text-gray-400 mb-7">
            Sign in to continue
          </Animated.Text>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-4">
            <Text className="text-xs font-bold text-gray-700 mb-2">Email address</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-2xl px-4 border-2 border-transparent"
              style={{ borderColor: email ? '#6C63FF' : 'transparent' }}
            >
              <Ionicons name="mail-outline" size={18} color={email ? '#6C63FF' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-sm text-gray-800 py-3.5 ml-3"
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                style={{ padding: 0 }}
              />
            </View>
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.delay(260).duration(400)} className="mb-6">
            <Text className="text-xs font-bold text-gray-700 mb-2">Password</Text>
            <View
              className="flex-row items-center bg-gray-50 rounded-2xl px-4 border-2"
              style={{ borderColor: password ? '#6C63FF' : 'transparent' }}
            >
              <Ionicons name="lock-closed-outline" size={18} color={password ? '#6C63FF' : '#9CA3AF'} />
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
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400)}>
            <AuthButton title="Sign In" onPress={handleLogin} loading={loading} variant="primary" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(380).duration(400)} className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400 mx-4">Don't have an account?</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(440).duration(400)}>
            <TouchableOpacity
              onPress={onNavigateToRegister}
              disabled={loading}
              className="border-2 border-violet-200 rounded-2xl py-3.5 items-center"
            >
              <Text className="text-violet-600 font-bold text-sm">Create a new account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
