import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, SafeAreaView, useColorScheme, Linking } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CONTACT_CONFIG } from '../../constants/contact';
import { PRIMARY_BLUE } from '../../../constants/theme';

const PrivacyPolicy = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const PolicyCard = ({ icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100 + 400).duration(500)}
      className="flex-row items-start bg-white dark:bg-slate-900 p-5 mb-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm shadow-blue-900/5"
    >
      <View className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
        <MaterialCommunityIcons name={icon} size={24} color={PRIMARY_BLUE} />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 dark:text-slate-100 font-bold text-base mb-1">{title}</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-[13px] leading-5">{description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F8FAFC' }}>
      <View style={{ 
        paddingTop: insets.top + 10, 
        paddingHorizontal: 20, 
        paddingBottom: 20,
        backgroundColor: PRIMARY_BLUE,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mb-4"
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold tracking-widest text-[10px] uppercase mb-1 opacity-60">
          MediCare Mardan
        </Text>
        <Text className="text-3xl font-black text-white tracking-tight">
          Privacy & Security
        </Text>
        <View className="bg-blue-500/20 self-start px-2.5 py-1 rounded-md mt-2">
          <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">
            Fully Regulated Pharmacy
          </Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.Text 
          entering={FadeInDown.delay(200).duration(500)}
          className="text-slate-500 dark:text-slate-400 text-[15px] leading-6 mb-8 font-medium"
        >
          At MediCare, we take your data privacy seriously. Our digital services are 
          secured with modern encryption to protect the community in Mardan.
        </Animated.Text>

        <View>
          <PolicyCard 
            index={0}
            icon="shield-lock-outline"
            title="Data Encryption"
            description="Your personal information and medical prescriptions are encrypted via secure SSL protocols."
          />
          <PolicyCard 
            index={1}
            icon="map-marker-check-outline"
            title="Regional Privacy"
            description="Location data is strictly used for delivery logistics within the Mardan division and nowhere else."
          />
          <PolicyCard 
            index={2}
            icon="medical-bag"
            title="Pharmacist Access"
            description="Only licensed healthcare professionals can access your medical history for clinical verification."
          />
          <PolicyCard 
            index={3}
            icon="database-lock-outline"
            title="Account Integrity"
            description="We never share your patient records with third-party marketing firms or external advertisers."
          />
        </View>

        <Animated.View 
          entering={FadeInDown.delay(800).duration(500)}
          className="flex-row items-center bg-blue-900 p-5 rounded-[24px] mt-4 border border-blue-800 shadow-xl shadow-blue-900/20"
        >
          <View className="w-10 h-10 bg-amber-400/20 rounded-xl items-center justify-center">
            <MaterialCommunityIcons name="shield-alert-outline" size={24} color="#fbbf24" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-sm">Security Alert</Text>
            <Text className="text-blue-200 text-[11px] leading-4 mt-0.5 font-medium">
              Staff will never ask for your <Text className="text-white font-mono font-black uppercase">MediCare404@</Text> code via SMS.
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1000).duration(500)}
          className="mt-12 items-center"
        >
          <Text className="text-slate-400 dark:text-slate-500 text-xs mb-4 font-bold uppercase tracking-widest">Questions about your data?</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`mailto:${CONTACT_CONFIG.supportEmail}`)}
            className="bg-slate-900 dark:bg-slate-800 px-12 py-4 rounded-full shadow-lg shadow-slate-400/20"
          >
            <Text className="text-white font-black text-sm uppercase tracking-wider">Contact DPO</Text>
          </TouchableOpacity>
          <Text className="text-slate-300 dark:text-slate-700 text-[10px] mt-10 font-bold tracking-widest uppercase">
            © 2026 {CONTACT_CONFIG.address.split('—')[0].trim()} | Mardan, PK
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;

