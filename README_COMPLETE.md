# FastMadic Pharmacy Delivery App

> A professional React Native (Expo) + TypeScript + Firebase pharmacy prescription delivery system with multi-shop support, admin dashboard, and WhatsApp integration.

## 🚀 Features

### Current Features
- ✅ **Authentication**: Email/Password login and registration
- ✅ **User Roles**: Support for customers and shop admins
- ✅ **Prescription Upload**: Users can upload prescription images
- ✅ **Shop Selection**: Region-based shop filtering
- ✅ **Quote System**: Admin creates quotes for prescriptions
- ✅ **Internal Chat**: Real-time messaging between users and admins
- ✅ **Order Tracking**: Status updates for prescriptions/orders
- ✅ **WhatsApp Integration**: Quick notification links
- ✅ **Responsive UI**: Works on iOS, Android, and Web

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
│   ├── components/
│   │   ├── AuthButton.tsx           # Reusable button component
│   │   ├── PrescriptionCard.tsx     # Prescription display card
│   │   ├── OrderCard.tsx            # Order display card
│   │   └── ChatThread.tsx           # Chat interface
│   ├── screens/
│   │   ├── LoginScreen.tsx          # User login
│   │   ├── RegisterScreen.tsx       # User registration
│   │   ├── UserDashboard.tsx        # Customer panel
│   │   └── AdminDashboard.tsx       # Admin panel
│   ├── services/
│   │   ├── authService.ts          # Authentication logic
│   │   ├── prescriptionService.ts  # Prescription management
│   │   ├── orderService.ts         # Order management
│   │   ├── chatService.ts          # Real-time messaging
│   │   └── shopService.ts          # Shop management
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
```

### 4. Start the Development Server

```bash
npm run start
```

Then select:
- `i` for iOS (requires macOS)
- `a` for Android
- `w` for Web

## 📱 App Walkthrough

### User Journey

1. **Registration/Login**
   - Create account with email and phone
   - Select role: Customer or Admin

2. **Upload Prescription**
   - Select shop (filtered by region)
   - Upload prescription image
   - Wait for admin quote

3. **Review Quote**
   - Admin sends quote with details
   - Chat interface for Q&A
   - Accept or reject quote

4. **Track Order**
   - View status updates
   - Chat with admin
   - WhatsApp notifications

### Admin Journey

1. **Dashboard**
   - View all prescriptions for their shop
   - Filter by status

2. **Review & Quote**
   - View prescription image
   - Add medicine details if needed
   - Set quote amount and message

3. **Order Management**
   - Chat with customer
   - Update order status
   - Send WhatsApp notifications

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
