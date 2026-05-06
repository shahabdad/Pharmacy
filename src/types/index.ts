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
