# Profile Tab Documentation

## Overview

The Profile Tab provides users with a comprehensive view of their account information, settings, and quick access to important features. It displays user details, role information, current shop, and various settings options.

---

## 📱 Profile Screen Features

### 1. Hero Card (User Profile)

**Displays:**
- **Avatar**: First letter of user's name in a styled circle
- **User Name**: Full name from Firebase Auth
- **Email**: User's email address
- **Role Badge**: Shows "Admin" or "User" with appropriate styling
- **Verification Badge**: Green checkmark indicating verified account
- **Edit Button**: Quick access to edit profile (coming soon)

**Stats Section:**
- **Orders**: Total number of orders placed
- **Prescriptions**: Total prescriptions uploaded
- **Points**: Loyalty points earned

**Membership Bar:**
- Current membership level (Silver, Gold, etc.)
- Progress bar showing advancement to next level
- Percentage to next tier

---

### 2. Account Information Section

**User Details:**

| Field | Description | Icon | Color |
|-------|-------------|------|-------|
| **Email** | User's email address | mail-outline | Blue |
| **Phone** | Contact phone number | call-outline | Green |
| **Role** | User or Admin | shield/person | Red/Violet |
| **Region** | User's region/location | location-outline | Purple |
| **Current Shop** | Assigned pharmacy shop | storefront-outline | Amber |

**Features:**
- ✅ Display email from Firebase Auth
- ✅ Display phone number
- ✅ Show role with badge (Admin gets special badge)
- ✅ Show current region with "Change" button
- ✅ Display current shop (MadicCare)
- ✅ Show shop contact number
- ✅ Online status indicator (green dot)

---

### 3. Recent Activity

**Shows:**
- Order delivered notifications
- Prescription approval updates
- New messages from shop
- Timestamps for each activity

**Format:**
- Icon with colored background
- Activity description
- Time ago (e.g., "2h ago", "Yesterday")

---

### 4. Account Settings

**Options:**
- **Edit Profile**: Update name & photo
- **Delivery Addresses**: Manage saved addresses
- **Payment Methods**: Coming soon

---

### 5. App Preferences

**Options:**
- **Notifications**: Toggle push & email alerts (with switch)
- **Dark Mode**: Coming soon
- **Language**: Select app language (Default: English)
- **Region**: Select your region for shop assignment

---

### 6. Support & Legal

**Options:**
- **Help & Support**: FAQs and contact support
- **Terms & Privacy**: Legal documents
- **Rate the App**: Share feedback (NEW badge)
- **About**: App version information

---

### 7. Logout Button

**Features:**
- Red-themed button at bottom
- Confirmation dialog before logout
- Loading state during logout
- Redirects to signup screen after logout

**Confirmation Dialog:**
```
Title: "Log Out"
Message: "Are you sure you want to log out?"
Buttons: [Cancel, Log Out]
```

---

## 🎨 UI/UX Design

### Color Scheme

**Role Colors:**
- **Admin**: Red (#EF4444) with red badge
- **User**: Violet (#6C63FF) with violet badge

**Section Colors:**
- Email: Blue (#3B82F6)
- Phone: Green (#10B981)
- Role: Red/Violet (based on role)
- Region: Purple (#8B5CF6)
- Shop: Amber (#F59E0B)

### Visual Elements

**Hero Card:**
- Gradient background (Violet to Indigo)
- Decorative blob shapes
- Shadow effects
- Rounded corners (28px)

**Information Cards:**
- White background
- Subtle shadows
- Rounded corners (16px)
- Icon badges with colored backgrounds

**Animations:**
- Fade in from top (Hero card)
- Fade in from bottom (Sections)
- Zoom in (Avatar)
- Spring animations on press

---

## 📊 Data Display

### User Information

**Source**: `AuthContext` - `appUser` object

```typescript
{
  uid: string;           // Firebase Auth UID
  name: string;          // User's full name
  email: string;         // Email address
  phone: string;         // Phone number
  role: 'user' | 'admin'; // User role
  region: string;        // User's region
  createdAt: Date;       // Account creation date
}
```

### Shop Information

**Source**: `DEFAULT_SHOP` from `src/constants/shops.ts`

```typescript
{
  id: 'madiccare-default',
  name: 'MadicCare',
  region: 'default',
  contact: '+923191796621',
  whatsapp: '+923191796621',
}
```

---

## 🔧 Functionality

### Current Features

**Working:**
- ✅ Display user information
- ✅ Show role with badge
- ✅ Display current shop
- ✅ Logout functionality
- ✅ Confirmation dialog
- ✅ Redirect after logout
- ✅ Loading states
- ✅ Smooth animations

**Coming Soon:**
- 📋 Edit profile
- 📋 Manage delivery addresses
- 📋 Payment methods
- 📋 Dark mode toggle
- 📋 Language selection
- 📋 Region selection
- 📋 Help & support
- 📋 Terms & privacy

---

## 🔄 User Flow

### View Profile
```
User taps Profile tab
    ↓
Profile screen loads
    ↓
Display user information
    ↓
Show account details
    ↓
Show settings options
```

### Logout Flow
```
User taps Logout button
    ↓
Confirmation dialog appears
    ↓
User confirms logout
    ↓
Firebase Auth signs out
    ↓
Redirect to signup screen
```

### Edit Profile (Future)
```
User taps Edit Profile
    ↓
Edit screen opens
    ↓
User updates information
    ↓
Save to Firebase
    ↓
Update local state
    ↓
Show success message
```

---

## 🎯 Role-Based Display

### User Role Display

**Badge**: "User" in violet
**Icon**: person-outline
**Color**: Violet (#6C63FF)
**Background**: bg-violet-100

**Features Available:**
- View profile
- Edit profile
- Manage addresses
- View orders
- View prescriptions
- Logout

### Admin Role Display

**Badge**: "ADMIN" in red
**Icon**: shield-checkmark-outline
**Color**: Red (#EF4444)
**Background**: bg-red-100

**Features Available:**
- All user features
- Access to admin dashboard
- Manage prescriptions
- Manage orders
- View all chats
- System settings

---

## 📱 Responsive Design

### Safe Area Handling
- Top inset for notched devices
- Bottom padding for tab bar
- Proper spacing on all devices

### Scroll Behavior
- Smooth scrolling
- Content padding at bottom (110px)
- No scroll indicators
- Pull to refresh (future)

---

## 🔒 Security & Privacy

### Data Display
- Email: From Firebase Auth (verified)
- Phone: From Firestore user document
- Role: Verified against admin emails
- Region: User-selected or default

### Logout Security
- Confirmation required
- Firebase Auth sign out
- Clear local state
- Redirect to login

---

## 🚀 Future Enhancements

### Phase 1: Profile Management
- [ ] Edit profile screen
- [ ] Upload profile photo
- [ ] Update name and bio
- [ ] Change phone number
- [ ] Email verification

### Phase 2: Address Management
- [ ] Add delivery addresses
- [ ] Edit addresses
- [ ] Delete addresses
- [ ] Set default address
- [ ] Address validation

### Phase 3: Preferences
- [ ] Dark mode toggle
- [ ] Language selection
- [ ] Region selection
- [ ] Notification preferences
- [ ] Privacy settings

### Phase 4: Support
- [ ] Help center
- [ ] FAQs
- [ ] Contact support
- [ ] Live chat
- [ ] Ticket system

### Phase 5: Advanced Features
- [ ] Loyalty program
- [ ] Referral system
- [ ] Achievements
- [ ] Order history
- [ ] Prescription history

---

## 📁 File Structure

```
src/app/(tabs)/profile.tsx    # Main profile screen
src/context/AuthContext.tsx   # User authentication state
src/constants/shops.ts         # Shop configuration
src/services/authService.ts   # Auth operations
```

---

## 🧪 Testing Checklist

### Display Tests
- [ ] User name displays correctly
- [ ] Email displays correctly
- [ ] Phone displays correctly
- [ ] Role displays correctly
- [ ] Region displays correctly
- [ ] Shop displays correctly
- [ ] Avatar letter is correct

### Role Tests
- [ ] User role shows violet badge
- [ ] Admin role shows red badge
- [ ] Admin badge says "ADMIN"
- [ ] User badge says "User"

### Logout Tests
- [ ] Logout button visible
- [ ] Confirmation dialog appears
- [ ] Cancel button works
- [ ] Logout button works
- [ ] Loading state shows
- [ ] Redirects to signup
- [ ] User is logged out

### UI Tests
- [ ] Animations work smoothly
- [ ] Scroll works properly
- [ ] Buttons respond to touch
- [ ] Colors are correct
- [ ] Layout is responsive

---

## 📞 Support

**Profile Screen**: `src/app/(tabs)/profile.tsx`  
**Auth Context**: `src/context/AuthContext.tsx`  
**Shop Config**: `src/constants/shops.ts`  
**Auth Service**: `src/services/authService.ts`

---

## ✨ Summary

The Profile Tab provides:
- ✅ Complete user information display
- ✅ Email, phone, role, region, shop
- ✅ Role-based badge display
- ✅ Current shop information
- ✅ Settings options (coming soon)
- ✅ Logout functionality
- ✅ Beautiful UI with animations
- ✅ Responsive design

**Status**: ✅ Complete and Ready for Production

**Last Updated**: April 29, 2026
