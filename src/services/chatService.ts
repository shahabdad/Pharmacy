import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Chat, ChatMessage } from '../types';

export const chatService = {
  /**
   * Send message in a chat thread
   */
  async sendMessage(
    chatId: string,
    sender: 'user' | 'admin',
    senderName: string,
    message: string
  ): Promise<ChatMessage> {
    try {
      const chatMessage: ChatMessage = {
        sender,
        senderName,
        message,
        timestamp: new Date(),
      };

      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion(chatMessage),
        updatedAt: serverTimestamp(),
      });

      return chatMessage;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  /**
   * Get chat by ID
   */
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const docSnapshot = await getDoc(doc(db, 'chats', chatId));
      return docSnapshot.exists() ? ({ id: docSnapshot.id, ...docSnapshot.data() } as Chat) : null;
    } catch (error) {
      console.error('Get chat error:', error);
      throw error;
    }
  },

  /**
   * Get chat by prescription ID
   */
  async getChatByPrescriptionId(prescriptionId: string): Promise<Chat | null> {
    try {
      const q = query(collection(db, 'chats'), where('prescriptionId', '==', prescriptionId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Chat;
    } catch (error) {
      console.error('Get chat by prescription ID error:', error);
      throw error;
    }
  },

  /**
   * Get chat by order ID
   */
  async getChatByOrderId(orderId: string): Promise<Chat | null> {
    try {
      const q = query(collection(db, 'chats'), where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Chat;
    } catch (error) {
      console.error('Get chat by order ID error:', error);
      throw error;
    }
  },

  /**
   * Get all messages from a chat
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const chat = await this.getChat(chatId);
      return chat?.messages || [];
    } catch (error) {
      console.error('Get chat messages error:', error);
      throw error;
    }
  },

  /**
   * Listen to chat updates in real-time (modular Firebase v9+ API)
   */
  listenToChat(chatId: string, callback: (chat: Chat) => void) {
    return onSnapshot(doc(db, 'chats', chatId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Chat);
      }
    });
  },
};
