import { collection, onSnapshot, query, where, doc, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Notification, Chat, Prescription } from '../types';
import { toDate, chatService } from './chatService';
import { DEFAULT_SHOP } from '../constants/shops';

export const notificationService = {
  /**
   * Listen to real-time notifications for admins
   * Aggregates unread messages and system alerts
   */
  listenToAdminNotifications(callback: (notifications: Notification[]) => void): () => void {
    let allChatNotifications: Notification[] = [];
    let allSystemNotifications: Notification[] = [];

    const updateAll = () => {
      const combined = [...allChatNotifications, ...allSystemNotifications];
      // Sort by timestamp descending
      combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      callback(combined);
    };

    // 1. Listen for chats with unread messages
    const chatUnsub = onSnapshot(collection(db, 'chats'), (snap) => {
        allChatNotifications = [];
        snap.docs.forEach(d => {
          const data = d.data() as Chat;
          const unreadMessages = (data.messages || []).filter(m => m.sender === 'user' && m.status !== 'read');
          
          if (unreadMessages.length > 0) {
            const lastMsg = unreadMessages[unreadMessages.length - 1];
            allChatNotifications.push({
              id: `chat-${d.id}`,
              title: `Message from ${data.userName || 'Customer'}`,
              message: lastMsg.message,
              timestamp: toDate(lastMsg.timestamp),
              read: false,
              type: 'message',
              icon: 'chatbubbles-outline',
              color: '#059669',
              route: `/admin-chat-detail?chatId=${d.id}`,
              data: { chatId: d.id }
            });
          }
        });
        updateAll();
    }, (error) => {
        console.error('Chat Notification Listener Error:', error);
    });

    // 2. Listen for new prescriptions
    // Only show prescriptions that are 'pending' AND have NOT been 'viewed' by an admin
    const prescUnsub = onSnapshot(
        query(
          collection(db, 'prescriptions'), 
          where('status', '==', 'pending'),
          limit(30)
        ), 
        (snap) => {
          allSystemNotifications = snap.docs.reduce((acc: Notification[], d) => {
            const data = d.data() as Prescription;
            
            // Filter: must belong to default shop and not be viewed yet
            if (data.shopId === DEFAULT_SHOP.id && !data.adminViewed) {
              acc.push({
                id: `presc-${d.id}`,
                title: 'New Prescription Request',
                message: `${data.userName || 'A customer'} uploaded a new prescription`,
                timestamp: toDate(data.createdAt),
                read: false,
                type: 'prescription',
                icon: 'document-text-outline',
                color: '#DC2626',
                route: '/admin-prescriptions',
                data: { prescriptionId: d.id, shopId: data.shopId }
              });
            }
            return acc;
          }, []);

          // Sort descending
          allSystemNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
          updateAll();
        },
        (error) => {
            console.warn('Prescription Notification Listener Error:', error.message);
        }
    );

    return () => {
      chatUnsub();
      prescUnsub();
    };
  },

  /**
   * Marks a notification as read and removes it from the notification feed
   */
  async markAsRead(notification: Notification): Promise<void> {
    try {
      if (notification.type === 'message' && notification.data?.chatId) {
        // Mark all messages in this chat as read
        await chatService.markMessagesAsRead(notification.data.chatId, 'admin');
      } 
      else if (notification.type === 'prescription' && notification.data?.prescriptionId) {
        // Mark the prescription as viewed by admin so it stops showing up in notifications
        const prescRef = doc(db, 'prescriptions', notification.data.prescriptionId);
        await updateDoc(prescRef, {
          adminViewed: true,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
};

