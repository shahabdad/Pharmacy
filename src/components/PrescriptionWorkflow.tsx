import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isLast?: boolean;
  isActive?: boolean;
}

const Step = ({ icon, title, description, isLast, isActive }: StepProps) => {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${isActive ? 'bg-blue-600' : (isDark ? 'bg-zinc-800' : 'bg-slate-100')}`}>
          <Ionicons name={icon} size={20} color={isActive ? '#FFF' : (isDark ? '#52525B' : '#94A3B8')} />
        </View>
        {!isLast && (
          <View className={`w-0.5 flex-1 my-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`} />
        )}
      </View>
      <View className="flex-1 pb-8">
        <Text className={`text-sm font-bold mb-1 ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-zinc-300' : 'text-slate-700')}`}>
          {title}
        </Text>
        <Text className={`text-xs leading-5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export const PrescriptionWorkflow = () => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View className={`p-6 rounded-[32px] border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
      <Text className={`text-lg font-black mb-6 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
        How it Works
      </Text>
      
      <Step 
        icon="cloud-upload-outline"
        title="1. Upload Prescription"
        description="Submit a photo or a list of medicines. Our pharmacist will review it immediately."
        isActive
      />
      
      <Step 
        icon="card-outline"
        title="2. Get a Quote"
        description="We'll send you a price quote and delivery estimate for your approval."
      />
      
      <Step 
        icon="checkmark-circle-outline"
        title="3. Confirm & Pay"
        description="Approve the quote and choose your delivery address to start processing."
      />
      
      <Step 
        icon="cube-outline"
        title="4. Fast Delivery"
        description="Your medicines will be prepared and delivered to your doorstep."
        isLast
      />
    </View>
  );
};
