import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { prescriptionService } from '../../../services/prescriptionService';
import { Prescription } from '../../../types';
import { ActivityIndicator } from 'react-native';

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    (async () => {
      try {
        const data = await prescriptionService.getPrescription(id);
        setPrescription(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: dark ? '#0D1117' : '#F8FAFC' }}>
        <ActivityIndicator size="large" color={dark ? '#fff' : '#000'} />
      </View>
    );
  }

  if (!prescription) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: dark ? '#0D1117' : '#F8FAFC' }}>
        <Text style={{ color: dark ? '#fff' : '#000' }}>Prescription not found.</Text>
        <Text style={{ color: 'blue', marginTop: 10 }} onPress={() => router.back()}>
          Go Back
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: dark ? '#0D1117' : '#F8FAFC', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: dark ? '#fff' : '#000', marginBottom: 12 }}>
        Prescription Details
      </Text>
      <Text style={{ color: dark ? '#ddd' : '#333', marginBottom: 8 }}>
        ID: {prescription.id}
      </Text>
      <Text style={{ color: dark ? '#ddd' : '#333', marginBottom: 8 }}>
        Status: {prescription.status}
      </Text>
      <Text style={{ color: dark ? '#ddd' : '#333', marginBottom: 8 }}>
        Created At: {new Date(prescription.createdAt).toLocaleString()}
      </Text>
    </ScrollView>
  );
}
