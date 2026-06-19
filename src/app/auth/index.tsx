import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { LoginForm } from '../../components/auth/LoginForm';
import { RegisterForm } from '../../components/auth/RegisterForm';

import { PRIMARY_BLUE } from '../../../constants/theme';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Animated.View
          entering={FadeInUp.springify().damping(16)}
          className="px-6 rounded-b-[44px] overflow-hidden"
          style={{
            paddingTop: insets.top + 24,
            paddingBottom: 36,
            backgroundColor: PRIMARY_BLUE,
            shadowColor: PRIMARY_BLUE,
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.28,
            shadowRadius: 28,
            elevation: 16,
          }}
        >
          <View className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/10" pointerEvents="none" />
          <View className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-blue-500/30" pointerEvents="none" />

          <Animated.View entering={ZoomIn.delay(100).springify()} className="mb-5">
            <View
              className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[18px] items-center justify-center overflow-hidden"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8 }}
            >
              <Image
                source={require('../../../assets/images/Medi.png')}
                style={{ width: 48, height: 48, borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(120).duration(400)} className="text-white text-3xl font-black tracking-tight">
            {activeTab === 'login' ? 'Welcome back' : 'Join Medicare'}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(180).duration(400)} className="text-blue-100 text-sm mt-1">
            {activeTab === 'login' ? 'Sign in to continue' : 'Medicine delivered to your door'}
          </Animated.Text>
        </Animated.View>

        {/* Tab Selector */}
        <View className="px-6 pt-6 pb-2">
          <View className="flex-row bg-gray-100 dark:bg-slate-900 rounded-2xl p-1.5">
            <TouchableOpacity
              onPress={() => setActiveTab('login')}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'login' ? 'bg-white dark:bg-slate-800' : ''}`}
              style={activeTab === 'login' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 } : {}}
            >
              <Text 
                className={`text-sm font-bold ${activeTab === 'login' ? '' : 'text-gray-400 dark:text-gray-500'}`}
                style={activeTab === 'login' ? { color: PRIMARY_BLUE } : {}}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('register')}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'register' ? 'bg-white dark:bg-slate-800' : ''}`}
              style={activeTab === 'register' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 } : {}}
            >
              <Text 
                className={`text-sm font-bold ${activeTab === 'register' ? '' : 'text-gray-400 dark:text-gray-500'}`}
                style={activeTab === 'register' ? { color: PRIMARY_BLUE } : {}}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View className="px-6 pt-5">
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(activeTab === 'login' ? 380 : 600).duration(400)} className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
            <Text className="text-xs text-gray-400 font-medium">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
          </Animated.View>

          {/* Google button (disabled on iOS until iosClientId is configured) */}
          {Platform.OS !== 'ios' && (
            <GoogleButton delay={activeTab === 'login' ? 440 : 660} />
          )}

          {/* Terms (only for register) */}
          {activeTab === 'register' && (
            <Animated.View entering={FadeInDown.delay(720).duration(400)} className="mb-4">
              <Text className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-4">
                By signing up you agree to our{' '}
                <Text style={{ color: PRIMARY_BLUE, fontWeight: '600' }}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={{ color: PRIMARY_BLUE, fontWeight: '600' }}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          )}

          <View className="pb-6" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

