# Enhanced Authentication Screen

## Overview
The authentication screen (`/signup`) now features a **tabbed interface** that makes it easy for users to switch between **Login** and **Register** modes.

## Key Features

### 1. **Tabbed Interface**
- **Two tabs**: "Sign In" and "Register"
- **Default view**: Login (Sign In)
- **Visual feedback**: Active tab has white background with shadow
- **Easy switching**: One tap to switch between login and register

### 2. **Login Tab (Default)**
When users first access the app, they see:
- ✅ Email field
- ✅ Password field
- ✅ "Sign In" button
- ✅ Google sign-in option
- ✅ Clear "Register" tab to create new account

**Fields shown**: Email, Password (2 fields only)

### 3. **Register Tab**
When users tap "Register", they see:
- ✅ Full Name field
- ✅ Email field
- ✅ Password field
- ✅ Confirm Password field
- ✅ Role selector (Patient/Shop Admin)
- ✅ "Create Account" button
- ✅ Google sign-in option
- ✅ Terms of Service agreement
- ✅ Clear "Sign In" tab to go back to login

**Fields shown**: Full Name, Email, Password, Confirm Password, Role (5 fields)

## User Flow

### First-Time User
```
1. Opens app
   ↓
2. Sees Login screen (default)
   ↓
3. Notices "Register" tab at top
   ↓
4. Taps "Register" tab
   ↓
5. Fills registration form
   ↓
6. Creates account
   ↓
7. Automatically logged in and redirected
```

### Returning User
```
1. Opens app
   ↓
2. Sees Login screen (default)
   ↓
3. Enters email and password
   ↓
4. Taps "Sign In"
   ↓
5. Automatically redirected based on role
```

## Dynamic UI Elements

### Header Text
- **Login mode**: "Welcome back" / "Sign in to continue"
- **Register mode**: "Create account" / "Join FastMadic — medicine at your door"

### Button Text
- **Login mode**: "Sign In" / "Signing in..."
- **Register mode**: "Create Account" / "Creating account..."

### Button Icon
- **Login mode**: `log-in-outline`
- **Register mode**: `person-add-outline`

### Conditional Fields
- **Full Name**: Only shown in Register mode
- **Confirm Password**: Only shown in Register mode
- **Role Selector**: Only shown in Register mode
- **Terms of Service**: Only shown in Register mode

## Authentication Methods

### 1. Email/Password
- **Login**: Email + Password
- **Register**: Name + Email + Password + Confirm + Role

### 2. Google OAuth
- Available in both Login and Register modes
- One-tap sign-in with Google account
- Automatically creates user profile if new
- Automatically detects admin role based on email

## Role Detection

### Admin Users
If email matches admin list:
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

→ Redirected to `/admin-dashboard`

### Regular Users
All other emails:
→ Redirected to `/(tabs)` (User Home)

## Visual Design

### Tab Selector
```
┌─────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐    │
│  │ Sign In  │  │ Register │    │
│  │ (active) │  │          │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

### Active Tab
- White background
- Violet text (#0F172A)
- Subtle shadow
- Bold font

### Inactive Tab
- Transparent background
- Gray text (#9CA3AF)
- No shadow
- Bold font

## Animation Delays

### Login Mode
- Email field: 200ms
- Password field: 260ms
- Sign In button: 320ms
- Divider: 380ms
- Google button: 440ms

### Register Mode
- Full Name field: 200ms
- Email field: 260ms
- Password field: 320ms
- Confirm Password field: 380ms
- Role selector: 440ms
- Create Account button: 500ms
- Divider: 560ms
- Google button: 620ms
- Terms: 680ms

## Benefits

### For New Users
✅ **Clear registration path**: Obvious "Register" tab at the top
✅ **No confusion**: Tab labels are clear ("Sign In" vs "Register")
✅ **Easy discovery**: Don't need to scroll to find registration option
✅ **Visual feedback**: Active tab is clearly highlighted

### For Returning Users
✅ **Login by default**: No extra steps to sign in
✅ **Fast access**: Email and password fields immediately visible
✅ **Minimal fields**: Only 2 fields for login (vs 5 for register)

### For All Users
✅ **Single screen**: No navigation between separate login/register screens
✅ **Consistent design**: Same visual style for both modes
✅ **Google OAuth**: Available in both modes
✅ **Smooth animations**: Polished user experience

## Technical Implementation

### State Management
```typescript
const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
```

### Conditional Rendering
- Fields shown/hidden based on `activeTab`
- Button text changes based on `activeTab`
- Header text changes based on `activeTab`
- Animation delays adjust based on `activeTab`

### Authentication Functions
- `handleLogin()`: Email/password sign-in
- `handleSignUp()`: Email/password registration
- `handleGoogle()`: Google OAuth (works for both)

### Auto-Routing
- AuthContext detects user role after login/register
- Root layout (`_layout.tsx`) handles automatic redirection
- Admin users → `/admin-dashboard`
- Regular users → `/(tabs)`

## Files Modified
- `src/app/signup.tsx` - Enhanced with tabbed interface

## Files Referenced
- `src/context/AuthContext.tsx` - Role detection and user state
- `src/app/_layout.tsx` - Auto-routing based on role
- `src/constants/adminEmails.ts` - Admin email list
- `src/firebase/config.ts` - Firebase authentication

## Testing Checklist

### Login Flow
- [ ] Default view shows Login tab active
- [ ] Email and password fields visible
- [ ] Sign In button works
- [ ] Google sign-in works
- [ ] Admin email redirects to admin dashboard
- [ ] Regular email redirects to user home

### Register Flow
- [ ] Tapping Register tab switches view
- [ ] All registration fields visible
- [ ] Role selector works
- [ ] Create Account button works
- [ ] Password confirmation validates
- [ ] Google sign-in works
- [ ] Terms of Service shown
- [ ] New account redirects correctly

### UI/UX
- [ ] Tab switching is smooth
- [ ] Active tab is clearly highlighted
- [ ] Animations play correctly
- [ ] Header text updates
- [ ] Button text updates
- [ ] Loading states work
- [ ] Error messages display

## Summary
The enhanced authentication screen provides a **seamless, intuitive experience** for both new and returning users. The tabbed interface makes it **immediately obvious** how to register a new account while keeping login as the default view for returning users.

