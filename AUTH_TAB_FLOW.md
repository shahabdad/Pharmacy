# Authentication Tab Flow Diagram

## Visual Flow of Enhanced Authentication Screen

### Initial Screen (Default: Login Tab)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Medical Icon]                       │
│                                                         │
│                   Welcome back                          │
│                Sign in to continue                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────┐  ┌─────────────────────┐   │
│   │     Sign In         │  │     Register        │   │
│   │     (ACTIVE)        │  │                     │   │
│   │  ● Violet text      │  │  ○ Gray text        │   │
│   │  ● White bg         │  │  ○ Transparent bg   │   │
│   │  ● Shadow           │  │  ○ No shadow        │   │
│   └─────────────────────┘  └─────────────────────┘   │
│                                                         │
│   Email                                                 │
│   ┌─────────────────────────────────────────────────┐ │
│   │ 📧  you@email.com                               │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   Password                                              │
│   ┌─────────────────────────────────────────────────┐ │
│   │ 🔒  ••••••••                              👁    │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │          🔓  Sign In                            │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   ─────────── or continue with ───────────            │
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │          G  Continue with Google                │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### After Tapping "Register" Tab

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Medical Icon]                       │
│                                                         │
│                  Create account                         │
│          Join FastMadic — medicine at your door         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────┐  ┌─────────────────────┐   │
│   │     Sign In         │  │     Register        │   │
│   │                     │  │     (ACTIVE)        │   │
│   │  ○ Gray text        │  │  ● Violet text      │   │
│   │  ○ Transparent bg   │  │  ● White bg         │   │
│   │  ○ No shadow        │  │  ● Shadow           │   │
│   └─────────────────────┘  └─────────────────────┘   │
│                                                         │
│   Full Name                                             │
│   ┌─────────────────────────────────────────────────┐ │
│   │ 👤  Ali Hassan                                  │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   Email                                                 │
│   ┌─────────────────────────────────────────────────┐ │
│   │ 📧  you@email.com                               │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   Password                                              │
│   ┌─────────────────────────────────────────────────┐ │
│   │ 🔒  ••••••••                              👁    │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   Confirm Password                                      │
│   ┌─────────────────────────────────────────────────┐ │
│   │ 🔒  ••••••••                              👁    │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   I am a...                                             │
│   ┌──────────────────┐  ┌──────────────────┐         │
│   │  👤  Patient     │  │  🏪  Shop Admin  │         │
│   │  (SELECTED)      │  │                  │         │
│   └──────────────────┘  └──────────────────┘         │
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │          ➕  Create Account                      │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   ─────────── or continue with ───────────            │
│                                                         │
│   ┌─────────────────────────────────────────────────┐ │
│   │          G  Continue with Google                │ │
│   └─────────────────────────────────────────────────┘ │
│                                                         │
│   By signing up you agree to our Terms of Service      │
│   and Privacy Policy                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Tab Interaction Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER OPENS APP                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DEFAULT: SIGN IN TAB ACTIVE                │
│                                                         │
│  State: activeTab = 'login'                            │
│  Fields: Email, Password (2 fields)                    │
│  Button: "Sign In"                                     │
│  Header: "Welcome back"                                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ User taps    │          │ User taps    │
│ "Register"   │          │ "Sign In"    │
│ tab          │          │ button       │
└──────┬───────┘          └──────┬───────┘
       │                         │
       ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│ REGISTER TAB ACTIVE │   │   LOGIN PROCESS     │
│                     │   │                     │
│ State: activeTab =  │   │ 1. Validate fields  │
│        'register'   │   │ 2. Call Firebase    │
│                     │   │ 3. AuthContext      │
│ Fields: Name,       │   │    detects role     │
│         Email,      │   │ 4. Auto-redirect    │
│         Password,   │   │                     │
│         Confirm,    │   └─────────┬───────────┘
│         Role        │             │
│ (5 fields)          │             │
│                     │             ▼
│ Button: "Create     │   ┌─────────────────────┐
│         Account"    │   │   ROLE DETECTION    │
│                     │   │                     │
│ Header: "Create     │   │ IF admin email:     │
│         account"    │   │   → /admin-dashboard│
│                     │   │                     │
└──────┬──────────────┘   │ ELSE:               │
       │                  │   → /(tabs)         │
       │                  └─────────────────────┘
       ▼
┌─────────────────────┐
│ User taps "Create   │
│ Account" button     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ REGISTER PROCESS    │
│                     │
│ 1. Validate fields  │
│ 2. Check password   │
│    match            │
│ 3. Call Firebase    │
│ 4. Create user doc  │
│ 5. AuthContext      │
│    detects role     │
│ 6. Auto-redirect    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   ROLE DETECTION    │
│                     │
│ IF admin email:     │
│   → /admin-dashboard│
│                     │
│ ELSE:               │
│   → /(tabs)         │
└─────────────────────┘
```

## State Management

### Tab State
```typescript
const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
```

### Tab Switching
```typescript
// User taps "Sign In" tab
setActiveTab('login')
  ↓
- Header changes to "Welcome back"
- Fields reduce to 2 (Email, Password)
- Button changes to "Sign In"
- Role selector hidden
- Terms hidden

// User taps "Register" tab
setActiveTab('register')
  ↓
- Header changes to "Create account"
- Fields expand to 5 (Name, Email, Password, Confirm, Role)
- Button changes to "Create Account"
- Role selector shown
- Terms shown
```

## Conditional Rendering Logic

```typescript
// Header text
{activeTab === 'login' 
  ? 'Welcome back' 
  : 'Create account'}

// Full Name field
{activeTab === 'register' && (
  <Field label="Full Name" ... />
)}

// Confirm Password field
{activeTab === 'register' && (
  <Field label="Confirm" ... />
)}

// Role selector
{activeTab === 'register' && (
  <RoleSelector ... />
)}

// Terms of Service
{activeTab === 'register' && (
  <Terms ... />
)}

// Button text
{activeTab === 'login' 
  ? 'Sign In' 
  : 'Create Account'}

// Button icon
{activeTab === 'login' 
  ? 'log-in-outline' 
  : 'person-add-outline'}
```

## Animation Delays

### Login Mode
```
Email field:     200ms
Password field:  260ms
Sign In button:  320ms
Divider:         380ms
Google button:   440ms
```

### Register Mode
```
Full Name field:       200ms
Email field:           260ms
Password field:        320ms
Confirm Password:      380ms
Role selector:         440ms
Create Account button: 500ms
Divider:               560ms
Google button:         620ms
Terms:                 680ms
```

## User Journey Comparison

### Returning User (Login)
```
1. Opens app
   ↓
2. Sees "Sign In" tab active (default)
   ↓
3. Enters email and password
   ↓
4. Taps "Sign In"
   ↓
5. Redirected based on role
```
**Steps**: 5 | **Friction**: None ✅

### New User (Register)
```
1. Opens app
   ↓
2. Sees "Sign In" tab active
   ↓
3. Notices "Register" tab
   ↓
4. Taps "Register" tab
   ↓
5. Fills registration form
   ↓
6. Taps "Create Account"
   ↓
7. Redirected based on role
```
**Steps**: 7 | **Friction**: None ✅

### User Changes Mind
```
1. Taps "Register" tab
   ↓
2. Starts filling form
   ↓
3. Realizes has account
   ↓
4. Taps "Sign In" tab
   ↓
5. Enters credentials
   ↓
6. Taps "Sign In"
   ↓
7. Redirected based on role
```
**Steps**: 7 | **Friction**: None ✅

## Benefits Summary

### Visual Clarity
✅ Both options always visible at top
✅ Clear active/inactive states
✅ Obvious which mode is active
✅ Professional tab design

### User Experience
✅ Login by default (most common)
✅ One tap to switch modes
✅ No navigation needed
✅ Contextual UI (shows only relevant fields)

### Technical Quality
✅ Single unified screen
✅ Clean state management
✅ Conditional rendering
✅ Smooth animations

### Accessibility
✅ Clear labels
✅ Visual feedback
✅ Logical tab order
✅ Touch-friendly targets

## Conclusion

The tabbed authentication interface provides a **seamless, intuitive experience** that:
- Makes both login and registration **equally accessible**
- Provides **clear visual feedback** for the active mode
- Reduces **cognitive load** by showing only relevant fields
- Maintains **professional polish** with smooth animations

**Result**: A balanced authentication experience that serves both new and returning users equally well.
