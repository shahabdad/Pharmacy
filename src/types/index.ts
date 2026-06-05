// User Types
export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'shop-admin';
  region: string;
  createdAt: Date;
  notificationSettings?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  savedAddresses?: Array<{
    id: string;
    label: string;
    address: string;
    isDefault?: boolean;
  }>;
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  region: string;
  contact: string;
  adminId: string;
  createdAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prescription Types
export type PrescriptionStatus = 'pending' | 'quoted' | 'approved' | 'delivered' | 'rejected';

export interface Prescription {
  id: string;
  userId: string;
  userName?: string;      // User's name for display
  shopId: string;
  shopName?: string;      // Shop name for easy reference (e.g., "MadicCare")
  imageURL?: string;
  imageUrl?: string;      // Alternative field name (for compatibility)
  message?: string;       // User's message/notes
  address?: string;       // Delivery address
  phone?: string;         // Contact phone
  medicineList?: string[];
  status: PrescriptionStatus;
  quoteAmount?: number;
  adminMessage?: string;
  chatId?: string;
  adminViewed?: boolean; // If admin has seen the notification for this prescription
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;      // Customer name for admin display
  userPhone?: string;     // Customer phone for admin contact
  userAddress?: string;   // Delivery address
  shopId: string;
  shopName?: string;      // Shop name for easy reference (e.g., "MadicCare")
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  adminNote?: string;     // Admin note / message to customer
  whatsappNotified: boolean;
  chatId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  id?: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  status?: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}

export interface Chat {
  id: string;
  userId?: string;        // Owner user ID
  userName?: string;      // Owner user name
  type?: 'general' | 'prescription' | 'order'; // Chat type
  participants?: string[];
  prescriptionId?: string;
  orderId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt?: Date;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin';
}

export interface OTPVerification {
  phone: string;
  otp: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'message' | 'prescription' | 'order' | 'system';
  icon: any;
  color: string;
  route: string;
  data?: any;
}

