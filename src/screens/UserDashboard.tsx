import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { PrescriptionCard } from '../components/PrescriptionCard';
import { prescriptionService } from '../services/prescriptionService';
import { shopService } from '../services/shopService';
import { Prescription, Shop, User } from '../types';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onViewPrescription?: (prescriptionId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onLogout,
  onViewPrescription = () => {},
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userPrescriptions = await prescriptionService.getUserPrescriptions(user.uid);
      setPrescriptions(userPrescriptions);

      const allShops = await shopService.getShopsByRegion(user.region);
      setShops(allShops);
      if (allShops.length > 0) {
        setSelectedShop(allShops[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadPrescription = async () => {
    if (!selectedImage || !selectedShop) {
      Alert.alert('Error', 'Please select an image and shop');
      return;
    }

    setUploading(true);
    try {
      const newPrescription = await prescriptionService.uploadPrescription(
        user.uid,
        selectedShop,
        selectedImage
      );
      setPrescriptions([newPrescription, ...prescriptions]);
      setSelectedImage(null);
      Alert.alert('Success', 'Prescription uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload prescription');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: dark ? '#0D1117' : '#f9f9f9' }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: dark ? '#0D1117' : '#f9f9f9' }]}>
      <View style={[styles.header, { backgroundColor: dark ? '#161B22' : '#4A90E2' }]}>
        <Text style={styles.greeting}>Welcome, {user.name}!</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: dark ? '#F0F6FC' : '#333' }]}>Upload Prescription</Text>

        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        )}

        <TouchableOpacity
          style={[styles.pickButton, {
            backgroundColor: dark ? '#161B22' : '#fff',
            borderColor: '#4A90E2',
          }]}
          onPress={pickImage}
        >
          <Text style={styles.pickButtonText}>
            {selectedImage ? '📷 Change Image' : '📷 Pick Image'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: dark ? '#8B949E' : '#333' }]}>Select Shop:</Text>
        <ScrollView horizontal style={styles.shopList}>
          {shops.map(shop => (
            <TouchableOpacity
              key={shop.id}
              style={[
                styles.shopButton,
                { backgroundColor: dark ? '#161B22' : '#fff', borderColor: dark ? '#21262D' : '#E0E0E0' },
                selectedShop === shop.id && styles.shopButtonActive,
              ]}
              onPress={() => setSelectedShop(shop.id)}
            >
              <Text
                style={[
                  styles.shopButtonText,
                  { color: dark ? '#8B949E' : '#333' },
                  selectedShop === shop.id && styles.shopButtonTextActive,
                ]}
              >
                {shop.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={uploadPrescription}
          disabled={uploading}
        >
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : 'Upload Prescription'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: dark ? '#F0F6FC' : '#333' }]}>Your Prescriptions</Text>
        {prescriptions.length === 0 ? (
          <Text style={[styles.emptyText, { color: dark ? '#6E7681' : '#999' }]}>No prescriptions yet</Text>
        ) : (
          prescriptions.map(prescription => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onPress={onViewPrescription}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  logoutButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  pickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  shopList: {
    marginBottom: 12,
  },
  shopButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  shopButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  shopButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shopButtonTextActive: {
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: '#7ED321',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
