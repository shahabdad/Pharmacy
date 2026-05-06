# UI/UX Design Guide - FastMadic

## Overview

FastMadic uses a modern, clean design system built with **NativeWind (Tailwind CSS)** for React Native. The UI features rounded cards, soft shadows, smooth animations, and a responsive layout that works seamlessly on both iOS and Android.

---

## 🎨 Design System

### Technology Stack

**Styling Framework:**
- ✅ **NativeWind** - Tailwind CSS for React Native
- ✅ **React Native Reanimated** - Smooth animations
- ✅ **Expo Vector Icons (Ionicons)** - Consistent iconography

**Configuration Files:**
- `tailwind.config.js` - Tailwind configuration
- `global.css` - Global styles
- `nativewind-env.d.ts` - TypeScript definitions

---

## 🎯 Core Design Principles

### 1. Clean Modern UI ✅

**Characteristics:**
- Minimalist design
- Ample white space
- Clear typography hierarchy
- Consistent spacing
- Modern color palette

**Implementation:**
```typescript
// Clean card design
<View className="bg-white rounded-3xl p-5 mb-4">
  <Text className="text-lg font-black text-gray-900">Title</Text>
  <Text className="text-sm text-gray-400">Subtitle</Text>
</View>
```

### 2. Rounded Cards ✅

**Border Radius Scale:**
- `rounded-xl` - 12px (small cards)
- `rounded-2xl` - 16px (medium cards)
- `rounded-3xl` - 24px (large cards)
- `rounded-full` - Circular (badges, avatars)

**Examples:**
```typescript
// Large card
<View className="bg-white rounded-3xl p-6">

// Medium card
<View className="bg-white rounded-2xl p-4">

// Small card
<View className="bg-white rounded-xl p-3">

// Circular badge
<View className="bg-violet-600 rounded-full px-3 py-1">
```

### 3. Soft Shadows ✅

**Shadow System:**
```typescript
// Light shadow (cards)
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3
}}

// Medium shadow (buttons)
style={{
  shadowColor: '#6C63FF',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 6
}}

// Heavy shadow (hero cards)
style={{
  shadowColor: '#6C63FF',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.3,
  shadowRadius: 24,
  elevation: 14
}}
```

### 4. Modal-Based Flow ✅

**Implemented Modals:**
- Message Modal (prescription notes)
- Delivery Modal (address & phone)
- Quote Modal (admin sends quotes)
- Confirmation dialogs (logout, status updates)

**Example:**
```typescript
<Modal
  visible={showModal}
  transparent
  animationType="fade"
>
  <Pressable className="flex-1 bg-black/50 items-center justify-center">
    <View className="bg-white rounded-3xl p-6 w-full max-w-md">
      {/* Modal content */}
    </View>
  </Pressable>
</Modal>
```

### 5. Floating WhatsApp Button ✅

**Location:** Home screen (`src/app/(tabs)/index.tsx`)

**Implementation:**
```typescript
<Animated.View
  entering={ZoomIn.delay(600).springify()}
  className="absolute"
  style={{
    bottom: Platform.OS === 'ios' ? 180 : 168,
    right: 20,
  }}
>
  <TouchableOpacity
    onPress={handleWhatsAppPress}
    className="w-16 h-16 bg-green-500 rounded-full items-center justify-center"
    style={{
      shadowColor: '#25D366',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }}
  >
    <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" />
  </TouchableOpacity>
</Animated.View>
```

**Features:**
- Green circular button (64x64px)
- WhatsApp logo icon
- Positioned bottom-right
- Pulse animation effect
- Opens WhatsApp with pre-filled message
- Phone: +923191796621

### 6. Responsive Layout ✅

**Safe Area Handling:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<View style={{ paddingTop: insets.top }}>
  {/* Content */}
</View>
```

**Platform-Specific Spacing:**
```typescript
// Bottom spacing for tab bar
style={{
  bottom: Platform.OS === 'ios' ? 88 : 76,
}}

// Keyboard avoiding
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
```

---

## 🎨 Color Palette

### Primary Colors

```typescript
// Violet (Primary)
violet-50:  #F5F3FF
violet-100: #EDE9FE
violet-600: #6C63FF
violet-700: #5B52D9

// Red (Actions)
red-50:  #FEE2E2
red-500: #EF4444
red-600: #DC2626

// Green (Success)
green-50:  #D1FAE5
green-400: #34D399
green-500: #10B981

// Blue (Info)
blue-50:  #DBEAFE
blue-500: #3B82F6
blue-600: #2563EB

// Amber (Warning)
amber-50:  #FEF3C7
amber-500: #F59E0B
amber-600: #D97706
```

### Neutral Colors

```typescript
// Gray Scale
gray-50:  #F9FAFB
gray-100: #F3F4F6
gray-200: #E5E7EB
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280
gray-600: #4B5563
gray-700: #374151
gray-800: #1F2937
gray-900: #111827

// Background
slate-50: #F8FAFC (App background)
white:    #FFFFFF (Cards)
```

---

## 📐 Spacing System

### Padding/Margin Scale

```typescript
p-1  = 4px
p-2  = 8px
p-3  = 12px
p-4  = 16px
p-5  = 20px
p-6  = 24px
p-8  = 32px
p-10 = 40px
p-12 = 48px
```

### Common Patterns

```typescript
// Screen padding
className="px-6 pt-4 pb-6"

// Card padding
className="p-4" or "p-5"

// Section spacing
className="mb-4" or "mb-6"

// Gap between items
className="gap-2" or "gap-3"
```

---

## 🎭 Typography

### Font Weights

```typescript
font-normal    = 400 (Regular)
font-medium    = 500 (Medium)
font-semibold  = 600 (Semibold)
font-bold      = 700 (Bold)
font-black     = 900 (Black/Heavy)
```

### Font Sizes

```typescript
text-[10px] = 10px (Tiny)
text-xs     = 12px (Extra Small)
text-sm     = 14px (Small)
text-base   = 16px (Base)
text-lg     = 18px (Large)
text-xl     = 20px (Extra Large)
text-2xl    = 24px (2X Large)
text-3xl    = 30px (3X Large)
```

### Typography Patterns

```typescript
// Page title
<Text className="text-3xl font-black text-gray-900">

// Section title
<Text className="text-lg font-black text-gray-900">

// Card title
<Text className="text-base font-bold text-gray-900">

// Body text
<Text className="text-sm text-gray-600">

// Caption
<Text className="text-xs text-gray-400">

// Tiny label
<Text className="text-[10px] text-gray-400">
```

---

## ✨ Animations

### React Native Reanimated

**Fade In Animations:**
```typescript
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

// Fade in from bottom
<Animated.View entering={FadeInDown.duration(400)}>

// Fade in from top
<Animated.View entering={FadeInUp.duration(400)}>

// With delay
<Animated.View entering={FadeInDown.delay(100).duration(400)}>

// With spring
<Animated.View entering={FadeInDown.springify()}>
```

**Zoom Animations:**
```typescript
import { ZoomIn } from 'react-native-reanimated';

<Animated.View entering={ZoomIn.springify()}>
```

**Press Animations:**
```typescript
const scale = useSharedValue(1);

const animStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

<Animated.View style={animStyle}>
  <TouchableOpacity
    onPressIn={() => { scale.value = withSpring(0.97); }}
    onPressOut={() => { scale.value = withSpring(1); }}
  >
```

---

## 🧩 Component Patterns

### 1. Card Component

```typescript
<View
  className="bg-white rounded-3xl p-5 mb-4"
  style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  }}
>
  {/* Card content */}
</View>
```

### 2. Button Component

```typescript
<TouchableOpacity
  className="bg-violet-600 rounded-2xl py-4 items-center"
  style={{
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  }}
>
  <Text className="text-white font-bold text-sm">Button Text</Text>
</TouchableOpacity>
```

### 3. Icon Badge

```typescript
<View className="w-10 h-10 bg-violet-100 rounded-2xl items-center justify-center">
  <Ionicons name="document-text" size={20} color="#6C63FF" />
</View>
```

### 4. Status Badge

```typescript
<View className="bg-green-50 rounded-full px-3 py-1.5 flex-row items-center gap-1">
  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
  <Text className="text-xs font-bold text-green-600">Active</Text>
</View>
```

### 5. Input Field

```typescript
<View className="bg-gray-50 rounded-2xl px-4 py-3 border-2 border-transparent">
  <TextInput
    className="text-sm text-gray-900"
    placeholder="Enter text..."
    placeholderTextColor="#9CA3AF"
  />
</View>
```

---

## 📱 Screen Layouts

### 1. Home Screen (User)

**Features:**
- ✅ Gradient header with user greeting
- ✅ Horizontal scrolling stats cards
- ✅ Pro tips section with icons
- ✅ Upload prescription card
- ✅ Fixed submit button at bottom
- ✅ Floating WhatsApp button
- ✅ Smooth animations

**Layout:**
```
┌─────────────────────────────┐
│ Header (Gradient)           │
│ - Hello, [Name]             │
│ - Notification icon         │
├─────────────────────────────┤
│ Stats (Horizontal Scroll)   │
│ [Orders] [Progress] [Done]  │
├─────────────────────────────┤
│ Pro Tips Card               │
│ - Use natural lighting      │
│ - Ensure text readable      │
│ - Capture full document     │
├─────────────────────────────┤
│ Upload Prescription Card    │
│ [Camera] [Gallery]          │
├─────────────────────────────┤
│                             │
│ (Scrollable content)        │
│                             │
├─────────────────────────────┤
│ [Submit Button] (Fixed)     │
└─────────────────────────────┘
  [WhatsApp] (Floating)
```

### 2. Admin Dashboard

**Features:**
- ✅ Stats grid (4 cards)
- ✅ Quick action buttons (6 items)
- ✅ Recent activity feed
- ✅ Admin info card
- ✅ Logout button

**Layout:**
```
┌─────────────────────────────┐
│ Header                      │
│ - Admin name & email        │
│ - Logout button             │
├─────────────────────────────┤
│ Stats Grid (2x2)            │
│ [Total] [Pending]           │
│ [Done]  [Revenue]           │
├─────────────────────────────┤
│ Quick Actions (3x2)         │
│ [Rx] [Orders] [Chats]       │
│ [Users] [Inv] [Reports]     │
├─────────────────────────────┤
│ Recent Activity             │
│ - New prescription          │
│ - Order completed           │
│ - New message               │
├─────────────────────────────┤
│ Admin Info Card             │
└─────────────────────────────┘
```

### 3. Profile Screen

**Features:**
- ✅ Hero card with gradient
- ✅ User info section
- ✅ Recent activity
- ✅ Settings sections
- ✅ Logout button

**Layout:**
```
┌─────────────────────────────┐
│ Hero Card (Gradient)        │
│ - Avatar                    │
│ - Name & Email              │
│ - Role badge                │
│ - Stats (Orders, Rx, Pts)   │
│ - Membership bar            │
├─────────────────────────────┤
│ Account Information         │
│ - Email                     │
│ - Phone                     │
│ - Role                      │
│ - Region                    │
│ - Current Shop              │
├─────────────────────────────┤
│ Recent Activity             │
├─────────────────────────────┤
│ Settings Sections           │
├─────────────────────────────┤
│ [Logout Button]             │
└─────────────────────────────┘
```

---

## 🎯 Interactive Elements

### 1. Touchable Feedback

**Press Scale Animation:**
```typescript
<TouchableOpacity
  activeOpacity={0.8}
  onPressIn={() => { scale.value = withSpring(0.97); }}
  onPressOut={() => { scale.value = withSpring(1); }}
>
```

**Disabled State:**
```typescript
<TouchableOpacity
  disabled={!isValid}
  className={isValid ? 'bg-violet-600' : 'bg-gray-200'}
>
```

### 2. Loading States

**Button Loading:**
```typescript
{loading ? (
  <ActivityIndicator size="small" color="#fff" />
) : (
  <Text className="text-white font-bold">Submit</Text>
)}
```

**Screen Loading:**
```typescript
<View className="flex-1 items-center justify-center">
  <ActivityIndicator size="large" color="#6366F1" />
  <Text className="text-sm text-gray-400 mt-3">Loading...</Text>
</View>
```

### 3. Empty States

```typescript
<View className="flex-1 items-center justify-center px-6">
  <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
    <Ionicons name="document-text-outline" size={40} color="#9CA3AF" />
  </View>
  <Text className="text-lg font-bold text-gray-900 mb-2">No Data</Text>
  <Text className="text-sm text-gray-400 text-center">
    No items found
  </Text>
</View>
```

---

## 📐 Responsive Design

### Safe Area Insets

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

// Top padding for notched devices
style={{ paddingTop: insets.top }}

// Bottom padding for home indicator
style={{ paddingBottom: insets.bottom }}
```

### Platform-Specific Styles

```typescript
// Different spacing for iOS/Android
bottom: Platform.OS === 'ios' ? 88 : 76

// Keyboard behavior
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
```

### Flexible Layouts

```typescript
// Flex containers
className="flex-1"
className="flex-row"
className="flex-col"

// Responsive grid
className="flex-row flex-wrap gap-3"

// Min/max widths
className="w-full max-w-md"
className="min-w-[45%]"
```

---

## ✅ UI/UX Checklist

### Implemented Features

- ✅ **NativeWind (Tailwind CSS)** - All screens
- ✅ **Clean Modern UI** - Minimalist design
- ✅ **Rounded Cards** - 12px to 24px radius
- ✅ **Soft Shadows** - Layered shadow system
- ✅ **Modal-Based Flow** - Message & Delivery modals
- ✅ **Floating WhatsApp Button** - Bottom-right corner
- ✅ **Responsive Layout** - Safe area handling
- ✅ **Smooth Animations** - Reanimated library
- ✅ **Consistent Icons** - Ionicons throughout
- ✅ **Loading States** - All async operations
- ✅ **Empty States** - Helpful messages
- ✅ **Error Handling** - User-friendly alerts
- ✅ **Platform Optimization** - iOS & Android

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Tailwind configuration |
| `global.css` | Global styles |
| `nativewind-env.d.ts` | TypeScript definitions |
| `src/app/(tabs)/index.tsx` | Home screen (example) |
| `src/app/admin-dashboard.tsx` | Admin dashboard (example) |
| `src/app/(tabs)/profile.tsx` | Profile screen (example) |

---

## 🎨 Design Resources

### Color Palette
- Primary: Violet (#6C63FF)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)
- Info: Blue (#3B82F6)

### Typography
- Font Family: System default (San Francisco on iOS, Roboto on Android)
- Font Weights: 400, 500, 600, 700, 900
- Font Sizes: 10px to 30px

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px

### Border Radius
- Small: 12px (rounded-xl)
- Medium: 16px (rounded-2xl)
- Large: 24px (rounded-3xl)
- Circle: 9999px (rounded-full)

---

## ✨ Summary

The FastMadic app features a **modern, clean UI** built with:
- ✅ NativeWind (Tailwind CSS)
- ✅ Rounded cards with soft shadows
- ✅ Modal-based user flows
- ✅ Floating WhatsApp button
- ✅ Fully responsive layout
- ✅ Smooth animations
- ✅ Consistent design system

**Status**: ✅ Complete and Production-Ready

**Last Updated**: April 29, 2026
