import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { prescriptionService } from '../services/prescriptionService';
import { chatService } from '../services/chatService';
import { User, Prescription, Chat } from '../types';
import { PrescriptionCard } from '../components/PrescriptionCard';
import { AuthButton } from '../components/AuthButton';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    if (selectedPrescription?.id) {
      loadPrescriptionDetails();
    }
  }, [selectedPrescription?.id]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      // Admin sees prescriptions for their shop
      const allPrescriptions = await prescriptionService.getShopPrescriptions(
        user.uid // In real app, use shop ID from user data
      );
      setPrescriptions(allPrescriptions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptionDetails = async () => {
    try {
      if (!selectedPrescription?.chatId) return;
      const chatData = await chatService.getChat(selectedPrescription.chatId);
      setChat(chatData);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendQuote = async () => {
    if (!selectedPrescription || !quoteAmount || !adminMessage) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await prescriptionService.updatePrescriptionQuote(
        selectedPrescription.id,
        parseFloat(quoteAmount),
        adminMessage
      );

      // Send message in chat
      if (selectedPrescription.chatId) {
        await chatService.sendMessage(
          selectedPrescription.chatId,
          'admin',
          user.name,
          `Quote: Rs. ${quoteAmount}\n${adminMessage}`
        );
      }

      setQuoteAmount('');
      setAdminMessage('');
      Alert.alert('Success', 'Quote sent to customer');
      loadPrescriptions();
      setSelectedPrescription(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to send quote');
    } finally {
      setSubmitting(false);
    }
  };

  const sendChatMessage = async () => {
    if (!selectedPrescription?.chatId || !messageText.trim()) return;

    try {
      await chatService.sendMessage(
        selectedPrescription.chatId,
        'admin',
        user.name,
        messageText
      );
      setMessageText('');
      loadPrescriptionDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const markAsDelivered = async () => {
    if (!selectedPrescription) return;

    try {
      await prescriptionService.deliverPrescription(selectedPrescription.id);
      Alert.alert('Success', 'Marked as delivered');
      loadPrescriptions();
      setSelectedPrescription(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (selectedPrescription) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedPrescription(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Prescription Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <PrescriptionCard
            prescription={selectedPrescription}
            onPress={() => {}}
          />
        </View>

        {selectedPrescription.status === 'pending' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send Quote</Text>
            <Text style={styles.label}>Quote Amount (Rs.)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2500"
              value={quoteAmount}
              onChangeText={setQuoteAmount}
              keyboardType="decimal-pad"
              editable={!submitting}
            />

            <Text style={styles.label}>Message to Customer</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Add details about the prescription..."
              value={adminMessage}
              onChangeText={setAdminMessage}
              multiline
              editable={!submitting}
            />

            <AuthButton
              title="Send Quote"
              onPress={sendQuote}
              loading={submitting}
              variant="primary"
            />
          </View>
        )}

        {selectedPrescription.status === 'approved' && (
          <View style={styles.section}>
            <AuthButton
              title="Mark as Delivered"
              onPress={markAsDelivered}
              variant="primary"
            />
          </View>
        )}

        {chat && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chat Thread</Text>
            <ScrollView style={styles.chatBox}>
              {chat.messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.chatMessage,
                    msg.sender === 'admin' && styles.chatMessageAdmin,
                  ]}
                >
                  <Text style={styles.chatSender}>{msg.senderName}</Text>
                  <Text style={styles.chatText}>{msg.message}</Text>
                  <Text style={styles.chatTime}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInput}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity onPress={sendChatMessage}>
                <Text style={styles.sendButton}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Admin Dashboard</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Pending Prescriptions ({prescriptions.filter(p => p.status === 'pending').length})
        </Text>
        {prescriptions.filter(p => p.status === 'pending').length === 0 ? (
          <Text style={styles.emptyText}>No pending prescriptions</Text>
        ) : (
          prescriptions
            .filter(p => p.status === 'pending')
            .map(prescription => (
              <TouchableOpacity
                key={prescription.id}
                onPress={() => setSelectedPrescription(prescription)}
              >
                <PrescriptionCard prescription={prescription} onPress={() => {}} />
              </TouchableOpacity>
            ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Prescriptions</Text>
        {prescriptions.map(prescription => (
          <TouchableOpacity
            key={prescription.id}
            onPress={() => setSelectedPrescription(prescription)}
          >
            <PrescriptionCard prescription={prescription} onPress={() => {}} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailHeader: {
    backgroundColor: '#4A90E2',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  chatBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
    marginBottom: 12,
  },
  chatMessage: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  chatMessageAdmin: {
    backgroundColor: '#E3F2FD',
  },
  chatSender: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  chatText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  chatTime: {
    fontSize: 10,
    color: '#999',
  },
  chatInput: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 12,
  },
});
