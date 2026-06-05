import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CONTACT_CONFIG } from '../constants/contact';
import { PRIMARY_BLUE } from '../../constants/theme';

const SECTIONS = [
  {
    id: "online-terms",
    title: "1. Online Store Terms",
    content: "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you violate any laws in your jurisdiction (including but not limited to copyright laws)."
  },
  {
    id: "pricing",
    title: "2. Modifications to Prices",
    content: "Prices for our products are subject to change without notice. Please note: A packaging and platform fee of Rs. 15 per order and an FBR-related fee of Rs. 1 per order will be applied and clearly displayed at checkout."
  },
  {
    id: "liability",
    title: "3. Limitation of Liability",
    content: "In no case shall MeriCare Pharmacy, our directors, or employees be liable for any injury, loss, claim, or any direct/indirect damages arising from your use of the service or any products procured through the service."
  },
  {
    id: "governing-law",
    title: "4. Governing Law",
    content: "These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Pakistan."
  }
];

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const textPrimary = isDark ? '#F0F6FC' : '#0F172A';
  const textSecondary = isDark ? '#8B949E' : '#64748B';
  const cardBg = isDark ? '#161B22' : '#FFFFFF';
  const border = isDark ? '#21262D' : '#F1F5F9';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F8FAFC' }}>
      {/* Header */}
      <View style={{ 
        paddingTop: insets.top + 10, 
        paddingHorizontal: 20, 
        paddingBottom: 20,
        backgroundColor: PRIMARY_BLUE, // Primary blue header
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -1 }}>Terms of Service</Text>
        <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '600' }}>Last updated: May 2026</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 15, color: textSecondary, lineHeight: 24 }}>
              This website is operated by <Text style={{ fontWeight: '800', color: textPrimary }}>MeriCare Pharmacy</Text>. 
              By visiting our site or purchasing from us, you engage in our “Service” and agree to be bound by the 
              following terms and conditions.
            </Text>
            <Text style={{ fontSize: 15, color: textSecondary, lineHeight: 24, marginTop: 12 }}>
              Our store is hosted on Shopify Inc., providing the e-commerce platform that allows us to sell 
              medical products and services to you.
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: border, marginBottom: 30 }} />

          {/* Dynamic Sections */}
          {SECTIONS.map((section, idx) => (
            <Animated.View 
              key={section.id} 
              entering={FadeInDown.delay(100 * idx + 200).duration(400)}
              style={{ marginBottom: 32 }}
            >
              <Text style={{ fontSize: 18, fontWeight: '900', color: textPrimary, marginBottom: 10 }}>{section.title}</Text>
              <Text style={{ fontSize: 15, color: textSecondary, lineHeight: 24 }}>{section.content}</Text>
            </Animated.View>
          ))}

          {/* Contact Section */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(400)}
            style={{ 
              backgroundColor: isDark ? '#161B22' : '#F8FAFC', 
              padding: 24, 
              borderRadius: 24, 
              borderWidth: 1, 
              borderColor: border,
              marginTop: 10
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: textPrimary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Contact Us</Text>
            <Text style={{ fontSize: 14, color: textSecondary, lineHeight: 22 }}>
              Questions regarding the Terms of Service should be sent to:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0EA5E9', marginTop: 8 }}>{CONTACT_CONFIG.supportEmail}</Text>
            <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`mailto:${CONTACT_CONFIG.supportEmail}`)}
            style={{ backgroundColor: isDark ? '#1e293b' : '#0f172a', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 999, marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Contact Support</Text>
          </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Text style={{ color: isDark ? '#334155' : '#cbd5e1', fontSize: 10, marginTop: 40, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}>
            © 2026 {CONTACT_CONFIG.address.split('—')[0].trim()} | Mardan, PK
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

