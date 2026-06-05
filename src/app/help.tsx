import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Linking, useColorScheme } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CONTACT_CONFIG } from '../constants/contact';
import { PRIMARY_BLUE } from '../../constants/theme';

const HelpSupportScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const SupportOption = ({ icon, title, subtitle, onPress, color = "blue", index }: { icon: any, title: string, subtitle: string, onPress: () => void, color?: string, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100 + 400).duration(500)}>
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center bg-white dark:bg-slate-900 p-5 mb-4 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm shadow-blue-900/5"
      >
        <View style={{ backgroundColor: color === "blue" ? '#EBF5FF' : '#FEF2F2' }} className="p-3.5 rounded-2xl mr-4">
          <MaterialCommunityIcons name={icon} size={26} color={color === "blue" ? PRIMARY_BLUE : "#ef4444"} />
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 dark:text-slate-100 font-bold text-base tracking-tight">{title}</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-0.5">{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={isDark ? '#4B5563' : '#cbd5e1'} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F8FAFC' }}>
      {/* Premium Header */}
      <View style={{ 
        paddingTop: insets.top + 10, 
        paddingHorizontal: 20, 
        paddingBottom: 24,
        backgroundColor: PRIMARY_BLUE,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mb-5"
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-blue-400 font-bold tracking-widest text-[10px] uppercase mb-1">
          Customer Care
        </Text>
        <Text className="text-3xl font-black text-white tracking-tight">
          How can we help?
        </Text>
        <View className="bg-emerald-500/20 self-start px-3 py-1.5 rounded-full mt-4 flex-row items-center border border-emerald-500/30">
          <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
          <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            Operational: {CONTACT_CONFIG.hours}
          </Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
      >
        
        {/* Local Service Highlight */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          className="bg-blue-700 p-7 rounded-[32px] mb-8 shadow-xl shadow-blue-900/20"
        >
          <View className="flex-row items-center mb-3">
            <View className="bg-white/20 p-2 rounded-xl">
              <MaterialCommunityIcons name="truck-delivery" size={26} color="white" />
            </View>
            <Text className="text-white font-black ml-3 text-xl tracking-tight">Mardan Home Delivery</Text>
          </View>
          <Text className="text-blue-100 text-[14px] leading-5 font-medium">
            Get your medicines delivered directly to your house anywhere in Mardan city. 
            Standard delivery available within 60-90 minutes.
          </Text>
        </Animated.View>

        {/* Support Channels */}
        <View>
          <SupportOption 
            index={0}
            icon="whatsapp" 
            title="Chat on WhatsApp" 
            subtitle="Fastest way to send prescriptions"
            onPress={() => Linking.openURL(`whatsapp://send?phone=${CONTACT_CONFIG.whatsapp}`)}
          />
          <SupportOption 
            index={1}
            icon="phone-outline" 
            title="Call Helpline" 
            subtitle="Talk to our Mardan branch"
            onPress={() => Linking.openURL(`tel:${CONTACT_CONFIG.helpline}`)}
          />
          <SupportOption 
            index={2}
            icon="email-outline" 
            title="Email Support" 
            subtitle="For inquiries and MediCare404@ assistance"
            onPress={() => Linking.openURL(`mailto:${CONTACT_CONFIG.supportEmail}`)}
          />
          <SupportOption 
            index={3}
            icon="alert-circle-outline" 
            title="Report an Issue" 
            subtitle="Order delays or medicine concerns"
            color="red"
            onPress={() => {}}
          />
        </View>

        {/* FAQ Quick Link */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(500)}
          className="mt-4 p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 items-center"
        >
          <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Authorized DRAP Pharmacy
          </Text>
          <Text className="text-slate-900 dark:text-slate-100 text-center text-[13px] font-bold mt-2 leading-5 px-4">
            We strictly follow Pakistan's drug regulations for your safety.
          </Text>
        </Animated.View>

        {/* Footer */}
        <View className="mt-12 items-center">
          <Text className="text-slate-300 dark:text-slate-700 text-[10px] uppercase font-black tracking-[3px]">
            MediCare Mardan Division
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default HelpSupportScreen;

