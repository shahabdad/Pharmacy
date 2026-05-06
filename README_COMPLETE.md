# FastMadic Pharmacy Delivery App

> A professional React Native (Expo) + TypeScript + Firebase pharmacy prescription delivery system with multi-shop support, admin dashboard, and WhatsApp integration.

## 🚀 Features

### Current Features
- ✅ **Enhanced Authentication**: Tabbed login/register interface with email/password and Google OAuth
- ✅ **User Roles**: Automatic role detection for customers and admins
- ✅ **Prescription Upload**: Users can upload prescription images
- ✅ **Shop Selection**: Default shop (MadicCare) with future multi-shop support
- ✅ **Quote System**: Admin creates quotes for prescriptions
- ✅ **Internal Chat**: Real-time messaging between users and admins
- ✅ **Admin Panel**: Comprehensive dashboard for prescription and order management
- ✅ **Order Tracking**: Status updates for prescriptions/orders
- ✅ **WhatsApp Integration**: Floating button for quick support
- ✅ **Responsive UI**: Modern minimalist design with NativeWind (Tailwind CSS)

### Future Features
- 🔄 **Product Catalog**: Direct product ordering
- 🔄 **Geolocation**: Map-based shop discovery
- 🔄 **Push Notifications**: Firebase Cloud Messaging
- 🔄 **Payment Integration**: Stripe/JazzCash
- 🔄 **Delivery Tracking**: Real-time GPS tracking
- 🔄 **Rating System**: Customer reviews

## 📋 Project Structure

```
MyApp/
├── src/
│   ├── app/                         # Expo Router screens
│   │   ├── (tabs)/                  # Tab navigation (user)
│   │   │   ├── index.tsx            # Home screen
│   │   │   ├── chat.tsx             # Chat screen
│   │   │   ├── orders.tsx           # Orders screen
│   │   │   ├── prescription.tsx     # Prescriptions screen
│   │   │   ├── profile.tsx          # Profile screen
│   │   │   └── _layout.tsx          # Tab layout
│   │   ├── admin-dashboard.tsx      # Admin dashboard
│   │   ├── admin-prescriptions.tsx  # Admin prescriptions management
│   │   ├── admin-orders.tsx         # Admin orders management
│   │   ├── admin-chats.tsx          # Admin chats list
│   │   ├── admin-chat-detail.tsx    # Admin individual chat
│   │   ├── signup.tsx               # Enhanced login/register screen
│   │   ├── upload-prescription.tsx  # Prescription upload
│   │   └── _layout.tsx              # Root layout with auth routing
│   ├── components/
│   │   ├── AuthButton.tsx           # Reusable button component
│   │   ├── PrescriptionCard.tsx     # Prescription display card
│   │   ├── OrderCard.tsx            # Order display card
│   │   ├── ChatThread.tsx           # Chat interface
│   │   ├── DeliveryModal.tsx        # Delivery status modal
│   │   └── MessageModal.tsx         # Message modal
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Legacy login component
│   │   ├── RegisterScreen.tsx       # Legacy register component
│   │   ├── UserDashboard.tsx        # Customer panel
│   │   └── AdminDashboard.tsx       # Admin panel
│   ├── services/
│   │   ├── authService.ts          # Authentication logic
│   │   ├── prescriptionService.ts  # Prescription management
│   │   ├── orderService.ts         # Order management
│   │   ├── chatService.ts          # Real-time messaging
│   │   ├── shopService.ts          # Shop management
│   │   └── adminService.ts         # Admin operations
│   ├── context/
│   │   └── AuthContext.tsx         # Auth state management
│   ├── constants/
│   │   ├── adminEmails.ts          # Admin email list
│   │   ├── shops.ts                # Shop configuration
│   │   └── theme.ts                # Theme colors
│   ├── firebase/
│   │   └── config.ts               # Firebase initialization
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── utils/
│       ├── whatsappUtils.ts        # WhatsApp link generation
│       └── validators.ts           # Form validation
├── App.tsx                          # Main app entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.js               # NativeWind configuration
├── global.css                       # Global styles
└── .env.example                     # Environment variables template
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd MyApp
npm install
```

### 2. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a "Web" app to your project
4. Copy your Firebase config

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
EXPO_PUBLIC_WHATSAPP_PHONE=+923191796621
```

### 5. Configure Admin Emails

Edit `src/constants/adminEmails.ts` to add admin email addresses:

```typescript
export const ADMIN_EMAILS = [
  'shahabdad50@gmail.com',
  'shhhbdad@gmail.com',
];
```

### 6. Start the Development Server

```bash
npm run start
```

Then select:
- `i` for iOS (requires macOS)
- `a` for Android
- `w` for Web

## 📱 App Walkthrough

### Authentication Screen (`/signup`)

**Tabbed Interface:**
- **Sign In Tab (Default)**: Login form for returning users
- **Register Tab**: Registration form for new users
- **One-tap switching**: Easy navigation between modes
- **Google OAuth**: Available in both modes

**Login Mode:**
- Email field
- Password field
- "Sign In" button
- Google sign-in option

**Register Mode:**
- Full Name field
- Email field
- Password field
- Confirm Password field
- Role selector (Patient/Shop Admin)
- "Create Account" button
- Google sign-in option
- Terms of Service

**Auto-Routing After Login:**
- Admin emails → `/admin-dashboard`
- Regular users → `/(tabs)` (User Home)

### User Journey

1. **Registration/Login**
   - **Tabbed interface**: Choose between "Sign In" and "Register"
   - **Login (default)**: Email and password (2 fields)
   - **Register**: Full name, email, password, confirm, role (5 fields)
   - **Google OAuth**: One-tap sign-in available in both modes
   - **Auto-routing**: Admins → Admin Dashboard, Users → User Home

2. **Upload Prescription**
   - Navigate to Home tab
   - Tap "Upload Prescription" card
   - Select prescription image from gallery or camera
   - Automatically assigned to MadicCare shop
   - Submit for quote

3. **Review Quote**
   - Admin sends quote with amount and details
   - View in Prescriptions tab
   - Chat interface for Q&A
   - Accept or reject quote

4. **Track Order**
   - View status updates in Orders tab
   - Chat with admin via Chat tab
   - WhatsApp support button (bottom-right)
   - Real-time status updates

### Admin Journey

1. **Login**
   - Use admin email: `shahabdad50@gmail.com` or `shhhbdad@gmail.com`
   - Automatically redirected to Admin Dashboard

2. **Dashboard**
   - View stats: Total prescriptions, pending, quoted, delivered
   - Quick action buttons: Prescriptions, Orders, Chats
   - Recent activity feed

3. **Prescriptions Management** (`/admin-prescriptions`)
   - View all prescriptions with images
   - Filter by status (pending/quoted/approved/delivered/rejected)
   - Send quotes with amount and message
   - Update status through workflow
   - Real-time refresh

4. **Orders Management** (`/admin-orders`)
   - View all orders
   - Filter by status (pending/confirmed/shipped/delivered)
   - Update status sequentially
   - View order items and totals
   - Real-time refresh

5. **Chat Management** (`/admin-chats`)
   - View all customer conversations
   - See unread counts and last messages
   - Chat with individual customers
   - Real-time messaging

## 🗄️ Database Structure (Firestore)

### Collections

#### `users/`
```typescript
{
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'shop-admin';
  region: string;
  createdAt: Date;
}
```

#### `shops/`
```typescript
{
  id: string;
  name: string;
  region: string;
  contact: string;
  adminId: string;
  createdAt: Date;
}
```

#### `prescriptions/`
```typescript
{
  id: string;
  userId: string;
  shopId: string;
  imageURL: string;
  medicineList?: string[];
  status: 'pending' | 'quoted' | 'approved' | 'delivered' | 'rejected';
  quoteAmount?: number;
  adminMessage?: string;
  chatId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `orders/`
```typescript
{
  id: string;
  userId: string;
  shopId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  whatsappNotified: boolean;
  chatId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `chats/`
```typescript
{
  id: string;
  prescriptionId?: string;
  orderId?: string;
  messages: ChatMessage[];
  createdAt: Date;
}
```

## 🔐 Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Users can read all shops
    match /shops/{shopId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.adminId;
    }

    // Users can read/write their own prescriptions
    match /prescriptions/{prescriptionId} {
      allow read: if request.auth.uid == resource.data.userId || 
                     request.auth.uid == resource.data.shopAdminId;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.shopAdminId;
    }

    // Similar rules for orders and chats
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId ||
                           request.auth.uid == resource.data.shopAdminId;
    }

    match /chats/{chatId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📲 WhatsApp Integration

The app generates WhatsApp links for:
- **Quote notifications**: Notifies customers of available quotes
- **Order confirmations**: Confirms order placement
- **Status updates**: Delivery status changes
- **Delivery notifications**: Confirms successful delivery

Example link:
```
https://wa.me/923001234567?text=Hello%20John%2C%20your%20prescription%20quote%20is%20Rs.2500
```

## 🚀 Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Expo Managed Hosting

```bash
eas build --platform all
eas submit --platform ios --latest
eas submit --platform android --latest
```

## 🛠️ Development

### Adding New Features

1. Create types in `src/types/index.ts`
2. Create service in `src/services/`
3. Create components in `src/components/`
4. Create screens in `src/screens/`
5. Update `App.tsx` to route to new screens

### Code Standards

- Use TypeScript for type safety
- Follow React hooks best practices
- Use Firebase services consistently
- Add error handling and loading states
- Test on multiple platforms

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native TypeScript](https://react-native.dev/docs/typescript)
- [WhatsApp Business API](https://www.whatsapp.com/business/api/)
- [NativeWind (Tailwind CSS for React Native)](https://www.nativewind.dev/)

## 📖 Project Documentation

### Authentication
- `AUTH_SCREEN_ENHANCED.md` - Enhanced authentication screen details
- `AUTH_BEFORE_AFTER.md` - Visual comparison of authentication improvements
- `AUTH_SYSTEM.md` - Overall authentication system architecture
- `AUTH_FLOW_SIMPLE.md` - Authentication flow diagram
- `QUICK_REFERENCE_AUTH_ENHANCED.md` - Quick reference guide

### Features
- `SHOP_SYSTEM.md` - Shop system and default shop logic
- `ADMIN_PANEL.md` - Admin panel features and usage
- `PROFILE_TAB.md` - Profile tab implementation
- `UI_UX_GUIDE.md` - UI/UX design guidelines

### Project Status
- `PROJECT_COMPLETE.md` - Complete project overview
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `QUICK_START.md` - Quick start guide
- `TASK_14_COMPLETE.md` - Latest enhancement (tabbed auth)

## 🎨 Design System

### Colors
- **Primary**: Violet (#6C63FF)
- **Secondary**: Red (#EF4444)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font Family**: System default (San Francisco on iOS, Roboto on Android)
- **Font Weights**: Regular (400), Semibold (600), Bold (700), Black (900)

### Spacing
- **Base unit**: 4px
- **Common spacing**: 8px, 12px, 16px, 20px, 24px
- **Safe area**: iOS (88-90px bottom), Android (76-78px bottom)

### Components
- **Rounded corners**: 12px to 24px
- **Shadows**: Layered system for depth
- **Animations**: React Native Reanimated for smooth transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project

## 📞 Support

For issues and questions, please contact the FastMadic team.

---

**Built with ❤️ using React Native, TypeScript, and Firebase**
