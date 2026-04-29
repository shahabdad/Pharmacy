// User Types
export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'shop-admin';
  region: string;
  createdAt: Date;
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

// Prescription Types
export type PrescriptionStatus = 'pending' | 'quoted' | 'approved' | 'delivered' | 'rejected';

export interface Prescription {
  id: string;
  userId: string;
  shopId: string;
  shopName?: string;      // Shop name for easy reference (e.g., "MadicCare")
  imageURL: string;
  medicineList?: string[];
  status: PrescriptionStatus;
  quoteAmount?: number;
  adminMessage?: string;
  chatId?: string;
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
  shopId: string;
  shopName?: string;      // Shop name for easy reference (e.g., "MadicCare")
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
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
  timestamp: Date;
}

export interface Chat {
  id: string;
  participants?: string[];
  prescriptionId?: string;
  orderId?: string;
  messages: ChatMessage[];
  createdAt: Date;
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
