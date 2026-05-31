import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Chat, ChatMessage } from '../types';

// ─── Helper: convert any timestamp value to a JS Date ────────────────────────
export function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Firestore Timestamp
  if (typeof value?.toDate === 'function') return value.toDate();
  // Firestore Timestamp-like { seconds, nanoseconds }
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  return new Date(value);
}

// ─── Helper: normalise a raw chat doc from Firestore ─────────────────────────
function normaliseChat(id: string, data: any): Chat {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
    messages: (data.messages ?? []).map((m: any) => ({
      ...m,
      timestamp: toDate(m.timestamp),
    })),
  } as Chat;
}

export const chatService = {
  // ── Send a message ──────────────────────────────────────────────────────────
  async sendMessage(
    chatId: string,
    sender: 'user' | 'admin',
    senderName: string,
    message: string
  ): Promise<void> {
    // Store timestamp as ISO string so arrayUnion can serialise it reliably
    const chatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender,
      senderName,
      message,
      status: 'delivered',
      timestamp: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'chats', chatId), {
      messages: arrayUnion(chatMessage),
      updatedAt: serverTimestamp(),
    });
  },

  // ── Get a single chat ───────────────────────────────────────────────────────
  async getChat(chatId: string): Promise<Chat | null> {
    const snap = await getDoc(doc(db, 'chats', chatId));
    if (!snap.exists()) return null;
    return normaliseChat(snap.id, snap.data());
  },

  // ── Get chat by prescription ID ─────────────────────────────────────────────
  async getChatByPrescriptionId(prescriptionId: string): Promise<Chat | null> {
    const q = query(collection(db, 'chats'), where('prescriptionId', '==', prescriptionId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return normaliseChat(snap.docs[0].id, snap.docs[0].data());
  },

  // ── Get chat by order ID ────────────────────────────────────────────────────
  async getChatByOrderId(orderId: string): Promise<Chat | null> {
    const q = query(collection(db, 'chats'), where('orderId', '==', orderId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return normaliseChat(snap.docs[0].id, snap.docs[0].data());
  },

  // ── Get all messages from a chat ────────────────────────────────────────────
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const chat = await this.getChat(chatId);
    return chat?.messages ?? [];
  },

  // ── Real-time listener for a single chat ────────────────────────────────────
  listenToChat(chatId: string, callback: (chat: Chat) => void): () => void {
    return onSnapshot(doc(db, 'chats', chatId), snap => {
      if (snap.exists()) callback(normaliseChat(snap.id, snap.data()));
    });
  },

  // ── Get or create the user's general support chat ───────────────────────────
  async getOrCreateUserChat(userId: string, userName: string): Promise<Chat> {
    // Try to find existing general chat for this user using single-field query
    const chats = await this.getUserChats(userId);
    const generalChat = chats.find(c => c.type === 'general');

    if (generalChat) {
      return generalChat;
    }

    // Create a new one
    const now = Timestamp.now();
    const newChat = {
      userId,
      userName,
      type: 'general',
      participants: [userId, 'admin'],
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'chats'), newChat);
    return normaliseChat(ref.id, { ...newChat, createdAt: now, updatedAt: now });
  },

  // ── Get all chats for a user ────────────────────────────────────────────────
  async getUserChats(userId: string): Promise<Chat[]> {
    const q = query(collection(db, 'chats'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => normaliseChat(d.id, d.data()));
  },

  // ── Real-time listener for all user chats ───────────────────────────────────
  listenToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const q = query(collection(db, 'chats'), where('userId', '==', userId));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => normaliseChat(d.id, d.data())));
    });
  },

  // ── Get all chats (admin) ───────────────────────────────────────────────────
  async getAllChats(): Promise<Chat[]> {
    const snap = await getDocs(collection(db, 'chats'));
    return snap.docs.map(d => normaliseChat(d.id, d.data()));
  },

  // ── Real-time listener for ALL chats (admin) ────────────────────────────────
  listenToAllChats(callback: (chats: Chat[]) => void): () => void {
    return onSnapshot(collection(db, 'chats'), snap => {
      const all = snap.docs.map(d => normaliseChat(d.id, d.data()));
      // Sort by most recent activity
      all.sort((a, b) => {
        const aT = a.messages.length ? toDate(a.messages[a.messages.length - 1].timestamp) : toDate(a.createdAt);
        const bT = b.messages.length ? toDate(b.messages[b.messages.length - 1].timestamp) : toDate(b.createdAt);
        return bT.getTime() - aT.getTime();
      });
      callback(all);
    });
  },

  async markMessagesAsRead(chatId: string, viewerRole: 'user' | 'admin'): Promise<void> {
    const chat = await this.getChat(chatId);
    if (!chat || !chat.messages.length) return;

    let changed = false;
    const updatedMessages = chat.messages.map(m => {
      if (m.sender !== viewerRole && m.status !== 'read') {
        changed = true;
        return { ...m, status: 'read' as const };
      }
      return m;
    });

    if (changed) {
      const rawMessages = updatedMessages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        status: m.status ?? 'delivered'
      }));
      await updateDoc(doc(db, 'chats', chatId), {
        messages: rawMessages,
        updatedAt: serverTimestamp(),
      });
    }
  },

  // ─── Mark messages as read ──────────────────────────────────────────────
  async markChatAsRead(chatId: string): Promise<void> {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      const data = snap.data() as Chat;
      const updatedMessages = (data.messages || []).map(m => {
        if (m.sender === 'user' && m.status !== 'read') {
          return { ...m, status: 'read' as const };
        }
        return m;
      });

      // Serialise timestamps back to ISO for consistency
      const rawMessages = updatedMessages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : 
                  (m.timestamp as any).toDate ? (m.timestamp as any).toDate().toISOString() : m.timestamp
      }));

      await updateDoc(chatRef, {
        messages: rawMessages,
        updatedAt: serverTimestamp()
      });
    }
  },

  // ─── Clear chat ──────────────────────────────────────────────────────────────

  async clearChat(chatId: string): Promise<void> {
    await updateDoc(doc(db, 'chats', chatId), {
      messages: [],
      updatedAt: serverTimestamp(),
    });
  },
};
