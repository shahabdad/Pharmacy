import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  ActivityIndicator,
  Switch,
  Image as RNImage
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileSkeleton } from '@/src/components/Skeleton';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOutUp,
  FadeOutDown
} from 'react-native-reanimated';

const EMOJI_OPTIONS = ['👨‍⚕️', '👩‍⚕️', '💊', '🏥', '🚑', '💉', '🧪', '🧬', '🩺', '📱', '👤', '🧑‍🔬', '🌟', '🔥', '❤️', '😎', '🍀', '✨', '⚡', '🌈'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { appUser, isAdmin, refreshUser } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Edit State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(appUser?.name || '');
  const [editRegion, setEditRegion] = useState(appUser?.region || '');
  const [editPhone, setEditPhone] = useState(appUser?.phone || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tempEmoji, setTempEmoji] = useState<string | null>(null);
  const [resetToDefault, setResetToDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isNotifySaving, setIsNotifySaving] = useState(false);
  const [isNotifyModalVisible, setIsNotifyModalVisible] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(appUser?.notificationSettings?.push ?? true);
  const [emailEnabled, setEmailEnabled] = useState(appUser?.notificationSettings?.email ?? true);
  const [smsEnabled, setSmsEnabled] = useState(appUser?.notificationSettings?.sms ?? false);

  // Address State
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [isAddrSaving, setIsAddrSaving] = useState(false);

  // Constants
  const PRIMARY_BLUE = '#004B87';
  const ACCENT_CYAN = '#0EA5E9';

  React.useEffect(() => {
    // Simulate initial load for skeleton effect
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setTempEmoji(null);
      setResetToDefault(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/auth' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to logout');
    }
  };

  const openEditModal = () => {
    setEditName(appUser?.name || '');
    setEditRegion(appUser?.region || '');
    setEditPhone(appUser?.phone || '');
    setSelectedImage(null);
    setTempEmoji(appUser?.photoURL?.startsWith('emoji:') ? appUser.photoURL.split(':')[1] : null);
    setResetToDefault(false);
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!appUser?.uid) return;
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      let photoURL = appUser.photoURL;

      if (resetToDefault) {
        photoURL = "";
      } else if (tempEmoji) {
        photoURL = `emoji:${tempEmoji}`;
      } else if (selectedImage) {
        photoURL = await authService.uploadProfilePicture(appUser.uid, selectedImage);
      }

      await authService.updateUser(appUser.uid, {
        name: editName,
        region: editRegion,
        phone: editPhone,
        photoURL: photoURL || undefined,
      });
      await refreshUser();
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!appUser?.uid) return;
    setIsNotifySaving(true);
    try {
      await authService.updateUser(appUser.uid, {
        notificationSettings: {
          push: pushEnabled,
          email: emailEnabled,
          sms: smsEnabled,
        }
      });
      await refreshUser();
      setIsNotifyModalVisible(false);
      Alert.alert('Success', 'Notification preferences updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update preferences');
    } finally {
      setIsNotifySaving(false);
    }
  };

  const openNotifyModal = () => {
    setPushEnabled(appUser?.notificationSettings?.push ?? true);
    setEmailEnabled(appUser?.notificationSettings?.email ?? true);
    setSmsEnabled(appUser?.notificationSettings?.sms ?? false);
    setIsNotifyModalVisible(true);
  };

  const handleAddAddress = async () => {
    if (!appUser?.uid || !newAddrText.trim()) return;
    setIsAddrSaving(true);
    try {
      const newAddress = {
        id: Date.now().toString(),
        label: newAddrLabel,
        address: newAddrText,
        isDefault: (appUser.savedAddresses?.length || 0) === 0,
      };
      const updatedAddresses = [...(appUser.savedAddresses || []), newAddress];
      await authService.updateUser(appUser.uid, { savedAddresses: updatedAddresses });
      await refreshUser();
      setNewAddrText('');
      setIsAddingAddress(false);
      Alert.alert('Success', 'Address added');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add address');
    } finally {
      setIsAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!appUser?.uid) return;
    try {
      const updatedAddresses = (appUser.savedAddresses || []).filter(a => a.id !== id);
      await authService.updateUser(appUser.uid, { savedAddresses: updatedAddresses });
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!appUser?.uid) return;
    try {
      const updatedAddresses = (appUser.savedAddresses || []).map(a => ({
        ...a,
        isDefault: a.id === id
      }));
      await authService.updateUser(appUser.uid, { savedAddresses: updatedAddresses });
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to set default');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F8FAFC', paddingTop: insets.top }}>
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        {/* Header / Hero */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          exiting={FadeOutUp.duration(300)}
          className="bg-white dark:bg-slate-900 mx-5 mt-4 p-8 rounded-[40px] items-center border border-slate-100 dark:border-slate-800"
          style={{ shadowColor: '#004B87', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4 }}
        >
          <TouchableOpacity
            onPress={openEditModal}
            activeOpacity={0.9}
            className="w-28 h-28 bg-blue-50 dark:bg-blue-900/20 rounded-full items-center justify-center mb-5 overflow-hidden border-2 border-blue-100 dark:border-blue-800"
          >
            {appUser?.photoURL?.startsWith('emoji:') ? (
              <Text style={{ fontSize: 52 }}>{appUser.photoURL.split(':')[1]}</Text>
            ) : appUser?.photoURL ? (
              <Image
                source={{ uri: appUser.photoURL }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons name="person" size={54} color={PRIMARY_BLUE} />
            )}
            <View className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 items-center justify-center">
              <View className="w-2.5 h-2.5 bg-white rounded-full" />
            </View>
          </TouchableOpacity>

          <Text className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{appUser?.name || 'Guest User'}</Text>
          <Text className="text-[13px] text-slate-400 font-bold mb-5 tracking-wide">{appUser?.email}</Text>

          <View className="flex-row gap-2">
            <View className="bg-blue-600 px-5 py-2 rounded-full shadow-lg shadow-blue-200">
              <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                {isAdmin ? 'System Admin' : 'Premium Member'}
              </Text>
            </View>
            <View className="bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-full">
              <Text className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {appUser?.region || 'United States'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <View className="flex-row px-5 mt-6 gap-3">
          {[
            { label: 'Orders', value: '12', icon: 'cart-outline', color: '#0369A1' },
            { label: 'Saved Rx', value: '4', icon: 'bookmark-outline', color: '#10B981' },
            { label: 'Insurance', value: 'Active', icon: 'shield-checkmark', color: '#005CAB' },
          ].map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(i * 100 + 400).springify().damping(15)}
              exiting={FadeOutDown.delay(i * 50)}
              className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-3xl items-center border border-slate-50 dark:border-slate-800"
              style={{ shadowColor: stat.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
            >
              <View style={{ backgroundColor: stat.color + '15', padding: 8, borderRadius: 12, marginBottom: 8 }}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Settings Groups */}
        <View className="px-5 mt-8">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Account Settings</Text>

          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            exiting={FadeOutDown.duration(300)}
            className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <SettingItem index={0} icon="person-outline" label="Account Edit" onPress={openEditModal} accent={PRIMARY_BLUE} />
            <SettingItem index={1} icon="location-outline" label="Saved Addresses" onPress={() => setIsAddressModalVisible(true)} accent={PRIMARY_BLUE} />
            <SettingItem index={2} icon="notifications-outline" label="Notification Preferences" onPress={openNotifyModal} accent={PRIMARY_BLUE} />
            <SettingItem index={3} icon="moon-outline" label="Appearance" accent={PRIMARY_BLUE} right={<Text className="text-[10px] font-bold text-slate-400">{scheme === 'dark' ? 'DARK' : 'LIGHT'}</Text>} />
          </Animated.View>

          <Text className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 mt-8">Support & Security</Text>
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            exiting={FadeOutDown.duration(300)}
            className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <SettingItem index={4} icon="help-circle-outline" label="Help & Support" accent={PRIMARY_BLUE} onPress={() => router.push('/user/help' as any)} />
            <SettingItem index={5} icon="shield-checkmark-outline" label="Privacy & Security" accent={PRIMARY_BLUE} onPress={() => router.push('/user/privacy' as any)} />
            <SettingItem index={6} icon="document-text-outline" label="Terms of Service" accent={PRIMARY_BLUE} onPress={() => router.push('/user/terms' as any)} />
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)} className="mt-8">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="bg-red-50 dark:bg-red-950/20 py-5 rounded-[24px] flex-row items-center justify-center gap-3 border border-red-100 dark:border-red-900/30"
            >
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text className="text-red-500 font-black text-base">Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(800).duration(400)}
            className="text-center text-[10px] text-gray-300 mt-3 mb-2"
          >
            Medicare v1.0.0
          </Animated.Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade" onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Animated.View entering={FadeInUp} className="bg-white dark:bg-slate-900 rounded-3xl p-8" style={{ paddingBottom: insets.bottom + 20, width: '100%', maxWidth: 520, maxHeight: '90%' }}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-gray-900 dark:text-white">Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-4">
              <View
                className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-full items-center justify-center border-4 border-blue-500/10"
              >
                {tempEmoji ? (
                  <Text style={{ fontSize: 44 }}>{tempEmoji}</Text>
                ) : resetToDefault || (!appUser?.photoURL && !selectedImage) ? (
                  <Ionicons name="person-outline" size={40} color={PRIMARY_BLUE} />
                ) : (
                  <Image
                    source={{ uri: selectedImage || appUser?.photoURL }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                )}
              </View>
              <TouchableOpacity
                onPress={pickImage}
                className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800"
              >
                <Text className="text-[10px] text-blue-800 dark:text-blue-400 font-black uppercase tracking-widest">Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-3">Quick Emoji Avatar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
                <TouchableOpacity
                  onPress={() => {
                    setTempEmoji(null);
                    setSelectedImage(null);
                    setResetToDefault(true);
                  }}
                  className={`w-14 h-14 rounded-2xl items-center justify-center border-2 transition-all ${resetToDefault ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'}`}
                >
                  <Ionicons name="person-outline" size={24} color={PRIMARY_BLUE} />
                  <Text className="text-[8px] font-bold text-slate-500 mt-1 uppercase">Default</Text>
                </TouchableOpacity>

                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      setTempEmoji(emoji);
                      setSelectedImage(null);
                      setResetToDefault(false);
                    }}
                    className={`w-14 h-14 rounded-2xl items-center justify-center border-2 transition-all ${tempEmoji === emoji ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'}`}
                  >
                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="gap-5">
              <View>
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Full Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-slate-700"
                />
              </View>

              <View>
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Region / City</Text>
                <TextInput
                  value={editRegion}
                  onChangeText={setEditRegion}
                  placeholder="Enter your city"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-slate-700"
                />
              </View>

              <View>
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Phone Number</Text>
                <TextInput
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter your phone"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-slate-700"
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={isSaving}
                activeOpacity={0.8}
                className="bg-blue-800 py-5 rounded-2xl mt-4 items-center justify-center flex-row shadow-lg shadow-blue-200"
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text className="text-white font-black text-lg ml-2">Update Profile</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Notification Preferences Modal */}
      <Modal visible={isNotifyModalVisible} transparent animationType="fade" onRequestClose={() => setIsNotifyModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Animated.View entering={FadeInUp} className="bg-white dark:bg-slate-900 rounded-3xl p-8" style={{ paddingBottom: insets.bottom + 20, width: '100%', maxWidth: 520, maxHeight: '90%' }}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-gray-900 dark:text-white">Notifications</Text>
              <TouchableOpacity onPress={() => setIsNotifyModalVisible(false)}>
                <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <View className="gap-4 mb-8">
              <NotifyToggle
                icon="notifications-outline"
                title="Push Notifications"
                subtitle="Prescription status and chat alerts"
                value={pushEnabled}
                onValueChange={setPushEnabled}
              />
              <NotifyToggle
                icon="mail-outline"
                title="Email Alerts"
                subtitle="Order summaries and receipts"
                value={emailEnabled}
                onValueChange={setEmailEnabled}
              />
              <NotifyToggle
                icon="chatbox-ellipses-outline"
                title="SMS Updates"
                subtitle="Urgent delivery notifications"
                value={smsEnabled}
                onValueChange={setSmsEnabled}
              />
            </View>

            <TouchableOpacity
              onPress={handleUpdateNotifications}
              disabled={isNotifySaving}
              activeOpacity={0.8}
              className="bg-blue-800 py-5 rounded-2xl items-center justify-center flex-row shadow-lg shadow-blue-200"
            >
              {isNotifySaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFF" />
                  <Text className="text-white font-black text-lg ml-2">Save Preferences</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Saved Addresses Modal */}
      <Modal visible={isAddressModalVisible} transparent animationType="fade" onRequestClose={() => setIsAddressModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Animated.View entering={FadeInUp} className="bg-white dark:bg-slate-900 rounded-3xl p-8" style={{ paddingBottom: insets.bottom + 20, width: '100%', maxWidth: 520, maxHeight: '90%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-gray-900 dark:text-white">Saved Addresses</Text>
              <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              {appUser?.savedAddresses?.length ? (
                appUser.savedAddresses.map((addr) => (
                  <View key={addr.id} className="bg-gray-50 dark:bg-slate-800 p-5 rounded-3xl mb-4 border border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-row items-center">
                        <Ionicons name={addr.label === 'Home' ? 'home-outline' : 'briefcase-outline'} size={18} color={PRIMARY_BLUE} />
                        <Text className="text-base font-bold text-slate-800 dark:text-white ml-2">{addr.label}</Text>
                        {addr.isDefault && (
                          <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-3">
                            <Text className="text-[9px] font-black text-blue-800 dark:text-blue-400 uppercase">Default</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-[13px] text-slate-500 dark:text-slate-400 leading-5 mb-4">{addr.address}</Text>
                    {!addr.isDefault && (
                      <TouchableOpacity onPress={() => handleSetDefaultAddress(addr.id)}>
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">Set as Default</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View className="items-center py-10">
                  <Ionicons name="location-outline" size={48} color="#D1D5DB" />
                  <Text className="text-slate-400 font-bold mt-4">No addresses saved yet</Text>
                </View>
              )}

              {isAddingAddress && (
                <Animated.View entering={FadeIn} className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-800 mb-4">
                  <View className="flex-row gap-2 mb-4">
                    {['Home', 'Office', 'Other'].map(l => (
                      <TouchableOpacity
                        key={l}
                        onPress={() => setNewAddrLabel(l)}
                        className={`px-4 py-2 rounded-full border ${newAddrLabel === l ? 'bg-blue-800 border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${newAddrLabel === l ? 'text-white' : 'text-slate-500'}`}>{l}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    placeholder="Enter full address"
                    placeholderTextColor="#94A3B8"
                    value={newAddrText}
                    onChangeText={setNewAddrText}
                    multiline
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl text-slate-800 dark:text-white font-medium border border-slate-100 dark:border-slate-700 min-h-[80px]"
                  />
                  <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity onPress={() => setIsAddingAddress(false)} className="flex-1 py-3 items-center">
                      <Text className="text-slate-400 font-bold uppercase text-xs">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddAddress} disabled={isAddrSaving} className="flex-2 bg-blue-800 px-8 py-3 rounded-xl items-center justify-center">
                      {isAddrSaving ? <ActivityIndicator size="small" color="#FFF" /> : <Text className="text-white font-black uppercase text-xs">Save Address</Text>}
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </ScrollView>

            {!isAddingAddress && (
              <TouchableOpacity
                onPress={() => setIsAddingAddress(true)}
                activeOpacity={0.8}
                className="bg-blue-800 py-5 rounded-2xl items-center justify-center flex-row shadow-lg shadow-blue-200"
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text className="text-white font-black text-lg ml-2">Add New Address</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function NotifyToggle({ icon, title, subtitle, value, onValueChange }: { icon: string; title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl items-center justify-center mr-4">
          <Ionicons name={icon as any} size={20} color="#004B87" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-slate-800 dark:text-white">{title}</Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
        thumbColor={value ? '#004B87' : '#9CA3AF'}
      />
    </View>
  );
}

function SettingItem({ icon, label, right, onPress, accent = '#0F172A', index = 0 }: { icon: string; label: string; right?: React.ReactNode; onPress?: () => void; accent?: string; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(700 + (index * 50)).duration(400)}>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onPress}
        className="flex-row items-center px-6 py-5 border-b border-slate-50 dark:border-slate-800"
      >
        <View style={{ backgroundColor: accent + '10' }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
          <Ionicons name={icon as any} size={20} color={accent} />
        </View>
        <Text className="flex-1 text-[15px] font-bold text-slate-700 dark:text-gray-200">{label}</Text>
        {right ? right : <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
      </TouchableOpacity>
    </Animated.View>
  );
}

