// FastMadic - Complete API Reference
// All services, types, and utilities available in your app

// ============================================
// AUTHENTICATION SERVICE
// ============================================
// Location: src/services/authService.ts

// authService.register(data: RegisterData) → Promise<User>
// Register new user with email and password

// authService.login(credentials: LoginCredentials) → Promise<User>
// Login with email and password

// authService.logout() → Promise<void>
// Sign out current user

// authService.getCurrentUser() → Promise<User | null>
// Get authenticated user or null

// authService.getAuthState() → User | null
// Get Firebase auth state

// ============================================
// PRESCRIPTION SERVICE
// ============================================
// Location: src/services/prescriptionService.ts

// uploadPrescription(userId, shopId, imageUri, medicineList?) → Promise<Prescription>
// Upload prescription image to Storage and create document

// getUserPrescriptions(userId) → Promise<Prescription[]>
// Get all prescriptions for a user

// getShopPrescriptions(shopId) → Promise<Prescription[]>
// Get all prescriptions for a shop

// getPrescription(prescriptionId) → Promise<Prescription | null>
// Get single prescription details

// updatePrescriptionQuote(prescriptionId, quoteAmount, adminMessage) → Promise<void>
// Admin sends quote to customer

// approvePrescription(prescriptionId) → Promise<void>
// Customer approves quote

// rejectPrescription(prescriptionId) → Promise<void>
// Customer rejects quote

// deliverPrescription(prescriptionId) → Promise<void>
// Mark prescription as delivered

// ============================================
// ORDER SERVICE
// ============================================
// Location: src/services/orderService.ts

// createOrder(userId, shopId, items, totalAmount) → Promise<Order>
// Create new order

// getUserOrders(userId) → Promise<Order[]>
// Get all orders for user

// getShopOrders(shopId) → Promise<Order[]>
// Get all orders for shop

// getOrder(orderId) → Promise<Order | null>
// Get single order details

// updateOrderStatus(orderId, status) → Promise<void>
// Update order status

// markWhatsAppNotified(orderId) → Promise<void>
// Mark order as WhatsApp notified

// ============================================
// CHAT SERVICE
// ============================================
// Location: src/services/chatService.ts

// sendMessage(chatId, sender, senderName, message) → Promise<ChatMessage>
// Send message in chat thread

// getChat(chatId) → Promise<Chat | null>
// Get chat by ID

// getChatByPrescriptionId(prescriptionId) → Promise<Chat | null>
// Get chat associated with prescription

// getChatByOrderId(orderId) → Promise<Chat | null>
// Get chat associated with order

// getChatMessages(chatId) → Promise<ChatMessage[]>
// Get all messages from chat

// listenToChat(chatId, callback) → void
// Real-time listener for chat updates

// ============================================
// SHOP SERVICE
// ============================================
// Location: src/services/shopService.ts

// getAllShops() → Promise<Shop[]>
// Get all shops

// getShopsByRegion(region) → Promise<Shop[]>
// Get shops in specific region

// getShop(shopId) → Promise<Shop | null>
// Get single shop details

// createShop(shopData) → Promise<Shop>
// Create new shop (admin only)

// updateShop(shopId, updates) → Promise<void>
// Update shop details

// ============================================
// WHATSAPP UTILITIES
// ============================================
// Location: src/utils/whatsappUtils.ts

// generatePrescriptionQuoteLink(shopPhone, userName, prescriptionId, quoteAmount) → string
// Generate WhatsApp link for prescription quote

// generateOrderConfirmationLink(shopPhone, userName, orderId, totalAmount, items) → string
// Generate WhatsApp link for order confirmation

// generateOrderStatusLink(shopPhone, userName, orderId, status) → string
// Generate WhatsApp link for status update

// generateDeliveryLink(shopPhone, userName, orderId) → string
// Generate WhatsApp link for delivery notification

// formatPhoneNumber(phone) → string
// Format phone number with Pakistan country code

// ============================================
// VALIDATORS
// ============================================
// Location: src/utils/validators.ts

// validators.isValidEmail(email) → boolean
// Validate email format

// validators.isStrongPassword(password) → boolean
// Validate password (min 6 chars)

// validators.isValidPhone(phone) → boolean
// Validate Pakistani phone number

// validators.isValidOTP(otp) → boolean
// Validate OTP (4-6 digits)

// validators.isValidName(name) → boolean
// Validate name (min 2 chars)

// ============================================
// TYPES / INTERFACES
// ============================================
// Location: src/types/index.ts

// User
// {
//   uid: string
//   name: string
//   email: string
//   phone: string
//   role: 'user' | 'admin' | 'shop-admin'
//   region: string
//   createdAt: Date
// }

// Prescription
// {
//   id: string
//   userId: string
//   shopId: string
//   imageURL: string
//   medicineList?: string[]
//   status: 'pending' | 'quoted' | 'approved' | 'delivered' | 'rejected'
//   quoteAmount?: number
//   adminMessage?: string
//   chatId?: string
//   createdAt: Date
//   updatedAt: Date
// }

// Order
// {
//   id: string
//   userId: string
//   shopId: string
//   items: OrderItem[]
//   totalAmount: number
//   status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
//   whatsappNotified: boolean
//   chatId?: string
//   createdAt: Date
//   updatedAt: Date
// }

// Chat
// {
//   id: string
//   prescriptionId?: string
//   orderId?: string
//   messages: ChatMessage[]
//   createdAt: Date
// }

// ChatMessage
// {
//   sender: 'user' | 'admin'
//   senderName: string
//   message: string
//   timestamp: Date
// }

// ============================================
// COMPONENTS
// ============================================
// Location: src/components/

// <PrescriptionCard prescription={prescription} onPress={onPress} />
// Display single prescription with status

// <OrderCard order={order} onPress={onPress} />
// Display single order with status

// <ChatThread chat={chat} onSendMessage={onSendMessage} />
// Chat interface for messaging

// <AuthButton title={string} onPress={fn} loading={bool} variant={variant} />
// Reusable auth button component

// ============================================
// SCREENS
// ============================================
// Location: src/screens/

// <LoginScreen onLoginSuccess={fn} onNavigateToRegister={fn} />
// User login screen

// <RegisterScreen onRegisterSuccess={fn} onNavigateToLogin={fn} />
// User registration screen

// <UserDashboard user={user} onLogout={fn} onViewPrescription={fn} />
// Customer dashboard

// <AdminDashboard user={user} onLogout={fn} />
// Admin/shop owner dashboard

// ============================================
// COMMON USAGE PATTERNS
// ============================================

// 1. AUTHENTICATE USER
// const user = await authService.login({
//   email: 'user@example.com',
//   password: 'password123'
// });

// 2. UPLOAD PRESCRIPTION
// const prescription = await prescriptionService.uploadPrescription(
//   userId,
//   shopId,
//   imageUri,
//   ['Medicine A', 'Medicine B']
// );

// 3. SEND QUOTE
// await prescriptionService.updatePrescriptionQuote(
//   prescriptionId,
//   2500,
//   'Available in stock'
// );

// 4. SEND CHAT MESSAGE
// await chatService.sendMessage(
//   chatId,
//   'admin',
//   'Admin Name',
//   'Your prescription is ready'
// );

// 5. GENERATE WHATSAPP LINK
// const link = whatsappUtils.generatePrescriptionQuoteLink(
//   '923001234567',
//   'John',
//   'prescription123',
//   2500
// );
// // Use in: <Linking.openURL(link)>

// ============================================
// ERROR HANDLING PATTERN
// ============================================

// try {
//   const result = await someService.someMethod();
//   // Handle success
// } catch (error: any) {
//   console.error('Error:', error.message);
//   Alert.alert('Error', error.message || 'An error occurred');
// }

// ============================================
// REAL-TIME LISTENER PATTERN
// ============================================

// const unsubscribe = chatService.listenToChat(chatId, (updatedChat) => {
//   setChat(updatedChat);
// });

// // Cleanup when component unmounts
// useEffect(() => {
//   return () => unsubscribe?.();
// }, []);

// ============================================
// DATABASE STRUCTURE
// ============================================

// Firestore Collections:
// - users/          (authenticated users)
// - shops/          (pharmacy shops)
// - prescriptions/  (prescription submissions)
// - orders/         (product orders - future)
// - chats/          (threaded messages)

// Storage Paths:
// - prescriptions/{userId}/{timestamp}  (prescription images)

// ============================================
// FIREBASE SECURITY RULES
// ============================================

// Users: Read/Write own documents
// Shops: Read all, Write by admin
// Prescriptions: Read by user/admin, Create by user, Update by admin
// Orders: Read/Write by user/admin
// Chats: Read/Write by authenticated users

// ============================================
// KEY ENVIRONMENT VARIABLES
// ============================================

// EXPO_PUBLIC_FIREBASE_API_KEY
// EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
// EXPO_PUBLIC_FIREBASE_PROJECT_ID
// EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
// EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
// EXPO_PUBLIC_FIREBASE_APP_ID
// EXPO_PUBLIC_WHATSAPP_PHONE (optional)

// ============================================
// HELPFUL DEBUGGING TIPS
// ============================================

// 1. Enable Firebase debugging:
//    auth.settings.appVerificationDisabledForTesting = true;

// 2. Monitor Firestore queries:
//    enableIndexedDbPersistence(db);

// 3. Log auth state changes:
//    auth.onAuthStateChanged(user => console.log(user));

// 4. Test with React DevTools:
//    Enable in Expo: Menu → More → React DevTools

// 5. Clear local storage:
//    AsyncStorage.clear();

console.log('FastMadic API Reference Ready! 📚');
