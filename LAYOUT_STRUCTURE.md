# App Layout Structure

## 📱 Route Hierarchy

```
src/app/
│
├── _layout.tsx                    # Root layout with auth & navigation
│
├── (tabs)/                        # User app (tab navigation)
│   ├── _layout.tsx               # Tab bar configuration
│   ├── index.tsx                 # Home (Prescription upload)
│   ├── chat.tsx                  # Chat with pharmacy
│   ├── orders.tsx                # User's orders
│   ├── prescription.tsx          # User's prescriptions
│   └── profile.tsx               # User profile
│
├── signup.tsx                     # Login/Register screen
├── modal.tsx                      # Modal screen
├── upload-prescription.tsx        # Prescription upload flow
│
├── admin-dashboard.tsx            # Admin dashboard (admin only)
├── admin-prescriptions.tsx        # Prescriptions management (admin only)
└── admin-orders.tsx               # Orders management (admin only)
```

---

## 🔐 Route Access Control

### Public Routes (No Auth Required)
- `/signup` - Login and registration

### User Routes (Auth Required)
- `/(tabs)` - User home and tabs
- `/(tabs)/index` - Home screen
- `/(tabs)/chat` - Chat screen
- `/(tabs)/orders` - Orders screen
- `/(tabs)/prescription` - Prescriptions screen
- `/(tabs)/profile` - Profile screen
- `/upload-prescription` - Upload prescription flow
- `/modal` - Modal screen

### Admin Routes (Admin Role Required)
- `/admin-dashboard` - Admin dashboard
- `/admin-prescriptions` - Prescriptions management
- `/admin-orders` - Orders management

---

## 🔄 Navigation Flow

### User Login Flow
```
/signup (Login)
    ↓
Check role
    ↓
┌───────────┴───────────┐
│                       │
User                  Admin
│                       │
↓                       ↓
/(tabs)           /admin-dashboard
```

### Admin Navigation
```
/admin-dashboard
    ↓
┌───────────┴───────────┐
│                       │
Prescriptions         Orders
│                       │
↓                       ↓
/admin-prescriptions  /admin-orders
```

### User Navigation
```
/(tabs)/index (Home)
    ↓
┌───────────┴───────────┬───────────┬───────────┐
│                       │           │           │
Chat                Orders    Prescriptions  Profile
│                       │           │           │
↓                       ↓           ↓           ↓
/(tabs)/chat    /(tabs)/orders  /(tabs)/prescription  /(tabs)/profile
```

---

## 🛡️ Route Protection Logic

### Root Layout (`src/app/_layout.tsx`)

**Protection Rules:**
1. **Not Logged In** → Redirect to `/signup`
2. **Admin Logged In** → Redirect to `/admin-dashboard`
3. **User Logged In** → Redirect to `/(tabs)`
4. **User Accessing Admin Route** → Redirect to `/(tabs)`
5. **Admin Accessing User Route** → Allowed (can view both)

**Implementation:**
```typescript
useEffect(() => {
  if (loading) return;
  
  const inAuthGroup = segments[0] === 'signup';
  const inAdminRoute = segments[0]?.startsWith('admin-');
  
  if (!firebaseUser && !inAuthGroup) {
    // Not logged in -> redirect to signup
    router.replace('/signup');
  } else if (firebaseUser && appUser) {
    if (isAdmin && inAuthGroup) {
      // Admin on signup -> redirect to dashboard
      router.replace('/admin-dashboard');
    } else if (!isAdmin && inAdminRoute) {
      // User trying admin route -> redirect to home
      router.replace('/(tabs)');
    } else if (!isAdmin && inAuthGroup) {
      // User on signup -> redirect to home
      router.replace('/(tabs)');
    }
  }
}, [loading, firebaseUser, appUser, isAdmin, segments]);
```

---

## 📋 Stack Screen Configuration

### Root Stack (`src/app/_layout.tsx`)
```typescript
<Stack>
  <Stack.Screen name="(tabs)"                options={{ headerShown: false }} />
  <Stack.Screen name="modal"                 options={{ presentation: 'modal', title: 'Modal' }} />
  <Stack.Screen name="signup"                options={{ headerShown: false }} />
  <Stack.Screen name="upload-prescription"   options={{ headerShown: false }} />
  <Stack.Screen name="admin-dashboard"       options={{ headerShown: false }} />
  <Stack.Screen name="admin-prescriptions"   options={{ headerShown: false }} />
  <Stack.Screen name="admin-orders"          options={{ headerShown: false }} />
</Stack>
```

**Screen Options:**
- `headerShown: false` - No header bar (custom headers in screens)
- `presentation: 'modal'` - Modal presentation style

---

## 🎨 Tab Bar Configuration

### User Tabs (`src/app/(tabs)/_layout.tsx`)

**Tab Screens:**
1. **Home** (`index`) - Prescription upload
2. **Chat** (`chat`) - Customer support
3. **Orders** (`orders`) - Order history
4. **Prescriptions** (`prescription`) - Prescription history
5. **Profile** (`profile`) - User settings

**Tab Bar Style:**
- Bottom navigation
- Icon + label
- Active/inactive states
- Badge support (notifications)

---

## 🔀 Navigation Methods

### Programmatic Navigation
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to route
router.push('/admin-dashboard');

// Replace current route
router.replace('/(tabs)');

// Go back
router.back();
```

### Link Navigation
```typescript
import { Link } from 'expo-router';

<Link href="/admin-prescriptions">
  View Prescriptions
</Link>
```

---

## 🧪 Testing Routes

### Test User Routes
```bash
# Home screen
/(tabs)/index

# Chat screen
/(tabs)/chat

# Orders screen
/(tabs)/orders

# Prescriptions screen
/(tabs)/prescription

# Profile screen
/(tabs)/profile
```

### Test Admin Routes
```bash
# Admin dashboard
/admin-dashboard

# Prescriptions management
/admin-prescriptions

# Orders management
/admin-orders
```

### Test Auth Flow
```bash
# Login screen
/signup

# After login (user)
/(tabs)

# After login (admin)
/admin-dashboard
```

---

## 🚨 Common Issues & Solutions

### Issue: Admin not redirecting to dashboard
**Solution:**
1. Check `isAdmin` value in AuthContext
2. Verify email is in `ADMIN_EMAILS` list
3. Check route protection logic in `_layout.tsx`
4. Logout and login again

### Issue: User can access admin routes
**Solution:**
1. Verify route protection in admin screens
2. Check `useEffect` hook in admin screens
3. Ensure `isAdmin` check is working
4. Add redirect logic if missing

### Issue: Infinite redirect loop
**Solution:**
1. Check `loading` state is handled
2. Verify redirect conditions don't conflict
3. Add proper guards for each route type
4. Check segment detection logic

### Issue: Tab bar showing on admin screens
**Solution:**
- Admin screens are outside `(tabs)` folder
- Tab bar only shows for routes inside `(tabs)`
- Verify admin screens are at root level

---

## 📊 Route Hierarchy Diagram

```
Root (_layout.tsx)
│
├── Auth Provider
│   └── Navigation Logic
│       ├── Not Logged In → /signup
│       ├── Admin → /admin-dashboard
│       └── User → /(tabs)
│
├── Stack Navigator
│   ├── (tabs) [User Routes]
│   │   ├── Tab Navigator
│   │   │   ├── index (Home)
│   │   │   ├── chat
│   │   │   ├── orders
│   │   │   ├── prescription
│   │   │   └── profile
│   │   └── _layout.tsx
│   │
│   ├── signup [Public]
│   ├── modal [User]
│   ├── upload-prescription [User]
│   │
│   └── Admin Routes [Admin Only]
│       ├── admin-dashboard
│       ├── admin-prescriptions
│       └── admin-orders
│
└── Status Bar
```

---

## 🔧 Configuration Files

### Root Layout
**File**: `src/app/_layout.tsx`
- Auth provider wrapper
- Route protection logic
- Stack navigator configuration
- Initial route: `(tabs)`

### Tab Layout
**File**: `src/app/(tabs)/_layout.tsx`
- Tab bar configuration
- Tab screen definitions
- Tab icons and labels
- Tab bar styling

---

## ✅ Layout Checklist

### Root Layout
- [x] Auth provider configured
- [x] Route protection implemented
- [x] Admin routes registered
- [x] User routes registered
- [x] Public routes registered
- [x] Redirect logic working
- [x] Loading state handled

### Tab Layout
- [x] Tab screens configured
- [x] Tab icons set
- [x] Tab labels set
- [x] Tab bar styled
- [x] Active states working

### Admin Screens
- [x] Admin dashboard created
- [x] Prescriptions screen created
- [x] Orders screen created
- [x] Access control implemented
- [x] Navigation working

---

## 📞 Support

**Root Layout**: `src/app/_layout.tsx`  
**Tab Layout**: `src/app/(tabs)/_layout.tsx`  
**Admin Routes**: `src/app/admin-*.tsx`  
**Auth System**: See `AUTH_SYSTEM.md`

---

**Last Updated**: April 29, 2026
