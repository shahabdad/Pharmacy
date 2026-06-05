# Authentication Flow - Simple Guide

## ✅ Current System Working Correctly

The app automatically detects if a user's email is in the admin list and shows the appropriate UI.

---

## 🔐 Authentication Flow

```
User logs in with email + password
         ↓
Check: Is email in admin list?
         ↓
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ↓         ↓
ADMIN UI   USER UI
```

---

## 📧 Admin Email Check

**Admin Emails** (in `src/constants/adminEmails.ts`):
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

**Logic**:
```typescript
if (email in ADMIN_EMAILS) {
  role = 'admin'
  redirect to /admin-dashboard
} else {
  role = 'user'
  redirect to /(tabs)
}
```

---

## 🎯 What Happens After Login

### IF Email is in Admin List → Admin UI

```
Login: shahabdad50@gmail.com
    ↓
Email found in ADMIN_EMAILS
    ↓
Role assigned: 'admin'
    ↓
isAdmin = true
    ↓
Redirect to: /admin-dashboard
    ↓
Shows:
  📊 Admin Dashboard
  💊 Prescriptions Management
  📦 Orders Management
  💬 Chats Management
```

### ELSE → User UI

```
Login: user@example.com
    ↓
Email NOT in ADMIN_EMAILS
    ↓
Role assigned: 'user'
    ↓
isAdmin = false
    ↓
Redirect to: /(tabs)
    ↓
Shows:
  🏠 Home (Upload Prescription)
  💬 Chat
  📦 Orders
  💊 Prescriptions
  👤 Profile
```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │ Logged in?    │
                    └───────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
                   NO              YES
                    │               │
                    ↓               ↓
            ┌──────────────┐  ┌──────────────┐
            │ Show Signup  │  │ Check Email  │
            │   Screen     │  │ in Admin     │
            └──────────────┘  │    List      │
                              └──────────────┘
                                      ↓
                              ┌───────┴───────┐
                              │               │
                          ADMIN            USER
                              │               │
                              ↓               ↓
                    ┌──────────────┐  ┌──────────────┐
                    │ Admin        │  │ User         │
                    │ Dashboard    │  │ Home (Tabs)  │
                    └──────────────┘  └──────────────┘
                              │               │
                              ↓               ↓
                    ┌──────────────┐  ┌──────────────┐
                    │ • Manage Rx  │  │ • Upload Rx  │
                    │ • Manage     │  │ • Chat       │
                    │   Orders     │  │ • Orders     │
                    │ • Chats      │  │ • Profile    │
                    │ • Stats      │  │              │
                    └──────────────┘  └──────────────┘
```

---

## 🛡️ Route Protection

### Admin Routes (Protected)
- `/admin-dashboard`
- `/admin-prescriptions`
- `/admin-orders`
- `/admin-chats`
- `/admin-chat-detail`

**Access**: Only if `isAdmin = true`

### User Routes (Protected)
- `/(tabs)` - All tab screens
- `/upload-prescription`
- `/modal`

**Access**: Only if logged in

### Public Routes
- `/signup` - Login/Register

**Access**: Anyone

---

## 🔒 Security Features

### 1. Email-Based Admin Detection
```typescript
// src/constants/adminEmails.ts
export const ADMIN_EMAILS = [
  'shahabdad50@gmail.com',
  'shhhbdad@gmail.com',
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
```

### 2. Auto Role Assignment
```typescript
// On login/register
const role = isAdminEmail(email) ? 'admin' : 'user';
```

### 3. Route Protection
```typescript
// In _layout.tsx
if (isAdmin && inAuthGroup) {
  router.replace('/admin-dashboard');  // Admin → Dashboard
} else if (!isAdmin && inAuthGroup) {
  router.replace('/(tabs)');           // User → Home
}
```

### 4. Access Control
```typescript
// In admin screens
if (!isAdmin) {
  Alert.alert('Access Denied');
  router.replace('/(tabs)');
}
```

---

## 📱 User Experience

### Admin Login Experience
1. Enter email: `shahabdad50@gmail.com`
2. Enter password
3. Click "Sign In"
4. ✅ Automatically redirected to Admin Dashboard
5. See admin features (Manage Prescriptions, Orders, Chats)

### User Login Experience
1. Enter email: `user@example.com`
2. Enter password
3. Click "Sign In"
4. ✅ Automatically redirected to User Home
5. See user features (Upload Rx, Chat, Orders, Profile)

---

## 🧪 Testing

### Test Admin Access
```bash
Email: shahabdad50@gmail.com
Password: [your password]
Expected: Admin Dashboard
```

### Test User Access
```bash
Email: user@example.com
Password: [your password]
Expected: User Home (Tabs)
```

### Test Route Protection
```bash
# User tries to access admin route
Result: Redirected to /(tabs)

# Admin tries to access user route
Result: Allowed (admins can see both)
```

---

## ✅ Current Status

**Working Features:**
- ✅ Email-based admin detection
- ✅ Automatic role assignment
- ✅ Admin → Admin Dashboard
- ✅ User → User Home
- ✅ Route protection
- ✅ Access control
- ✅ Logout functionality

**Admin Emails:**
- ✅ `shahabdad50@gmail.com`
- ✅ `shhhbdad@gmail.com`

**System Status:** ✅ **WORKING CORRECTLY**

---

## 📞 Quick Reference

| Email Type | Role | Redirect To | UI Shown |
|------------|------|-------------|----------|
| In admin list | admin | /admin-dashboard | Admin UI |
| Not in admin list | user | /(tabs) | User UI |

**Admin List Location**: `src/constants/adminEmails.ts`  
**Auth Logic**: `src/app/_layout.tsx`  
**Role Check**: `src/context/AuthContext.tsx`

---

**Last Updated**: April 29, 2026

