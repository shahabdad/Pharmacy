# Authentication & Role System Documentation

## Overview

The FastMadic app uses **Firebase Authentication** with an **email-based admin role assignment system**. Users are automatically assigned roles based on their email address:

- **Admin emails** → Redirected to Admin Dashboard
- **All other emails** → Normal user app experience

---

## 🔐 Authentication Methods

### Current Implementation
- ✅ **Email + Password** authentication via Firebase Auth
- ✅ Automatic role assignment based on email
- ✅ User profile stored in Firestore

### Future Support (Optional)
- 📱 **Phone OTP** authentication
- 🔗 **Google Sign-In**
- 🔗 **Facebook Sign-In**

---

## 👥 Role System

### Admin Role
**Admin emails are configured in**: `src/constants/adminEmails.ts`

**Current Admin Emails:**
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

**Admin Features:**
- Access to Admin Dashboard
- Manage prescriptions and orders
- View all users and chats
- System analytics and reports
- Inventory management

### User Role
**All other emails** are automatically assigned the `user` role.

**User Features:**
- Upload prescriptions
- Place orders
- Chat with pharmacy
- Track order status
- View order history

---

## 🏗️ Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/constants/adminEmails.ts` | Admin email configuration |
| `src/context/AuthContext.tsx` | Authentication state management |
| `src/services/authService.ts` | Firebase Auth operations |
| `src/app/_layout.tsx` | Route protection & redirection |
| `src/app/admin-dashboard.tsx` | Admin dashboard screen |
| `src/screens/LoginScreen.tsx` | Login UI |
| `src/screens/RegisterScreen.tsx` | Registration UI |

---

## 🔄 Authentication Flow

### Registration Flow
```
1. User enters email, password, and details
2. System checks if email is in admin list
3. If admin email → role = 'admin'
4. If regular email → role = 'user'
5. Create Firebase Auth account
6. Save user document to Firestore
7. Redirect based on role
```

### Login Flow
```
1. User enters email and password
2. Firebase authenticates credentials
3. Fetch user document from Firestore
4. Verify role matches email (auto-update if needed)
5. If admin → redirect to Admin Dashboard
6. If user → redirect to User Home
```

### Auto Role Verification
The system automatically verifies and updates roles on every login:
- If email is in admin list but role is 'user' → Update to 'admin'
- If email is not in admin list but role is 'admin' → Keep as 'admin' (manual override)

---

## 📝 Code Examples

### Check if Email is Admin
```typescript
import { isAdminEmail, getRoleFromEmail } from '@/src/constants/adminEmails';

// Check if email is admin
const isAdmin = isAdminEmail('shahabdad50@gmail.com'); // true
const isAdmin2 = isAdminEmail('user@example.com'); // false

// Get role from email
const role = getRoleFromEmail('shahabdad50@gmail.com'); // 'admin'
const role2 = getRoleFromEmail('user@example.com'); // 'user'
```

### Use Auth Context
```typescript
import { useAuth } from '@/src/context/AuthContext';

function MyComponent() {
  const { appUser, isAdmin, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (isAdmin) {
    return <AdminView user={appUser} />;
  } else {
    return <UserView user={appUser} />;
  }
}
```

### Protect Admin Routes
```typescript
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

function AdminOnlyScreen() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin privileges required');
      router.replace('/(tabs)');
    }
  }, [isAdmin]);
  
  if (!isAdmin) return null;
  
  return <AdminContent />;
}
```

---

## 🔧 Configuration

### Adding Admin Emails

**Method 1: Code (Recommended)**
Edit `src/constants/adminEmails.ts`:
```typescript
export const ADMIN_EMAILS: readonly string[] = [
  'shahabdad50@gmail.com',
  'shhhbdad@gmail.com',
  'newadmin@gmail.com', // Add new admin email
] as const;
```

**Method 2: Environment Variables (Future)**
Edit `.env`:
```env
EXPO_PUBLIC_ADMIN_EMAILS=shahabdad50@gmail.com,shhhbdad@gmail.com,newadmin@gmail.com
```

### Removing Admin Access
Simply remove the email from the `ADMIN_EMAILS` array. The user will be treated as a regular user on their next login.

---

## 🗄️ Database Schema

### Users Collection (`users/{uid}`)
```typescript
{
  uid: string;           // Firebase Auth UID
  name: string;          // Full name
  email: string;         // Email address
  phone: string;         // Phone number
  role: 'user' | 'admin' | 'shop-admin';
  region: string;        // User's region (default: 'lahore')
  createdAt: Date;       // Account creation timestamp
}
```

**Role Values:**
- `'user'` - Regular customer
- `'admin'` - System administrator (email-based)
- `'shop-admin'` - Shop manager (future feature)

---

## 🚀 Route Protection

### Automatic Redirection
The app automatically redirects users based on their role:

| User Type | After Login | After Signup |
|-----------|-------------|--------------|
| Admin | Admin Dashboard | Admin Dashboard |
| User | Home (Tabs) | Home (Tabs) |
| Not Logged In | Signup Screen | - |

### Protected Routes
- **Admin Dashboard** (`/admin-dashboard`) - Only accessible to admins
- **User Tabs** (`/(tabs)`) - Only accessible to logged-in users
- **Signup** (`/signup`) - Only accessible when not logged in

---

## 🔒 Security Features

### Email-Based Admin Assignment
✅ **Pros:**
- Simple to configure
- No database queries needed
- Instant role assignment
- Easy to add/remove admins

⚠️ **Considerations:**
- Admin emails are in code (not secret)
- Requires app update to change admin list
- Consider environment variables for production

### Auto Role Verification
The system automatically verifies roles on every login:
```typescript
// If email is in admin list but role is 'user'
if (isAdminEmail(email) && userData.role !== 'admin') {
  // Auto-update to admin
  await updateDoc(userRef, { role: 'admin' });
}
```

### Firebase Security Rules
Recommended Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own document
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Admins can read all users
    match /users/{userId} {
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Prescriptions
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null;
    }
    
    // Orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📱 Phone OTP (Future Implementation)

### Setup Steps
1. Enable Phone Authentication in Firebase Console
2. Install phone auth dependencies
3. Implement OTP verification flow
4. Update auth service with phone methods

### Code Structure
```typescript
// Future: Phone OTP authentication
export const authService = {
  async sendOTP(phoneNumber: string): Promise<string> {
    // Send OTP via Firebase
  },
  
  async verifyOTP(verificationId: string, code: string): Promise<User> {
    // Verify OTP and create/login user
  },
};
```

---

## 🧪 Testing

### Test Admin Login
1. Use admin email: `shahabdad50@gmail.com`
2. Login with password
3. Should redirect to Admin Dashboard
4. Verify admin features are accessible

### Test User Login
1. Use any other email: `user@example.com`
2. Login with password
3. Should redirect to User Home
4. Verify user features are accessible

### Test Role Auto-Update
1. Add email to `ADMIN_EMAILS` list
2. Login with that email
3. Role should auto-update to 'admin'
4. Should redirect to Admin Dashboard

---

## 🐛 Troubleshooting

### User Not Redirecting to Admin Dashboard
**Check:**
1. Email is in `ADMIN_EMAILS` array
2. Email matches exactly (case-insensitive)
3. User document exists in Firestore
4. Role field is set to 'admin'

**Solution:**
```typescript
// Manually update user role in Firestore
await updateDoc(doc(db, 'users', userId), {
  role: 'admin'
});
```

### Admin Seeing User App
**Check:**
1. `isAdmin` value in AuthContext
2. Route protection logic in `_layout.tsx`
3. Admin dashboard route is registered

**Solution:**
- Logout and login again
- Clear app cache
- Verify email in admin list

### Role Not Updating Automatically
**Check:**
1. `authService.login()` includes role verification
2. AuthContext `fetchAppUser()` checks admin status
3. Firestore write permissions

**Solution:**
- Check console for errors
- Verify Firestore security rules
- Manually trigger `refreshUser()`

---

## 📊 Admin Dashboard Features

### Current Features
- ✅ Dashboard overview with stats
- ✅ Quick action buttons
- ✅ Recent activity feed
- ✅ Admin info card
- ✅ Logout functionality

### Planned Features
- 📋 Prescription management
- 📦 Order management
- 💬 Chat management
- 👥 User management
- 📊 Analytics and reports
- 🏪 Inventory management
- ⚙️ System settings

---

## 🔄 Migration Guide

### Adding New Admin
1. Open `src/constants/adminEmails.ts`
2. Add email to `ADMIN_EMAILS` array
3. Save and rebuild app
4. New admin can login and access dashboard

### Removing Admin
1. Remove email from `ADMIN_EMAILS` array
2. Save and rebuild app
3. User will be treated as regular user on next login

### Bulk Admin Management (Future)
Consider moving to database-based admin management:
```typescript
// Future: Database-based admin list
const adminsRef = collection(db, 'admins');
const adminsSnap = await getDocs(adminsRef);
const adminEmails = adminsSnap.docs.map(d => d.data().email);
```

---

## 📞 Support

**Authentication Issues**: Check `src/services/authService.ts`  
**Role Assignment**: Check `src/constants/adminEmails.ts`  
**Route Protection**: Check `src/app/_layout.tsx`  
**Admin Dashboard**: Check `src/app/admin-dashboard.tsx`

**Last Updated**: April 29, 2026

