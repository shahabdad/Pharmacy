# Authentication Flow Diagrams

## 📊 Visual Guide to Authentication & Role System

---

## 1️⃣ Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  User enters:                                                │
│  • Name                                                      │
│  • Email                                                     │
│  • Phone                                                     │
│  • Password                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Check: Is email in ADMIN_EMAILS list?                      │
│  • shahabdad50@gmail.com                                     │
│  • shhhbdad@gmail.com                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────┴───────────┐
                │                       │
            YES │                       │ NO
                ↓                       ↓
    ┌───────────────────┐   ┌───────────────────┐
    │  role = 'admin'   │   │  role = 'user'    │
    └───────────────────┘   └───────────────────┘
                │                       │
                └───────────┬───────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Create Firebase Auth Account                                │
│  • Email + Password authentication                           │
│  • Generate UID                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Save User Document to Firestore                             │
│  Collection: users/{uid}                                     │
│  {                                                           │
│    uid, name, email, phone,                                  │
│    role: 'admin' | 'user',                                   │
│    region, createdAt                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────┴───────────┐
                │                       │
          ADMIN │                       │ USER
                ↓                       ↓
    ┌───────────────────┐   ┌───────────────────┐
    │ Admin Dashboard   │   │   User Home       │
    │  /admin-dashboard │   │   /(tabs)         │
    └───────────────────┘   └───────────────────┘
```

---

## 2️⃣ Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER LOGIN                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  User enters:                                                │
│  • Email                                                     │
│  • Password                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Firebase Authentication                                     │
│  • Verify credentials                                        │
│  • Return Firebase User                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Fetch User Document from Firestore                          │
│  users/{uid}                                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────┴───────────┐
                │                       │
          EXISTS│                       │ NOT EXISTS
                ↓                       ↓
    ┌───────────────────┐   ┌───────────────────┐
    │  Load user data   │   │  Create new doc   │
    │  from Firestore   │   │  with auto role   │
    └───────────────────┘   └───────────────────┘
                │                       │
                └───────────┬───────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ROLE VERIFICATION                                           │
│  Check: Is email in ADMIN_EMAILS?                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
    YES │                                       │ NO
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ Is role='admin'?  │               │ Keep role='user'  │
└───────────────────┘               └───────────────────┘
        │                                       │
    ┌───┴───┐                                   │
    │       │                                   │
  YES       NO                                  │
    │       │                                   │
    │       ↓                                   │
    │  ┌────────────────┐                      │
    │  │ Update role to │                      │
    │  │ 'admin' in DB  │                      │
    │  └────────────────┘                      │
    │       │                                   │
    └───┬───┘                                   │
        │                                       │
        └───────────────┬───────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            │                       │
      ADMIN │                       │ USER
            ↓                       ↓
┌───────────────────┐   ┌───────────────────┐
│ Admin Dashboard   │   │   User Home       │
│  /admin-dashboard │   │   /(tabs)         │
└───────────────────┘   └───────────────────┘
```

---

## 3️⃣ Auto Role Verification (On Every Login)

```
┌─────────────────────────────────────────────────────────────┐
│              AUTH STATE CHANGE DETECTED                      │
│              (Login, App Start, Token Refresh)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Fetch User Document from Firestore                          │
│  users/{uid}                                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Check: Is user.email in ADMIN_EMAILS?                       │
│  isAdminEmail(user.email)                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
    YES │                                       │ NO
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ Is role='admin'?  │               │ Is role='admin'?  │
└───────────────────┘               └───────────────────┘
        │                                       │
    ┌───┴───┐                               ┌───┴───┐
    │       │                               │       │
  YES       NO                            YES       NO
    │       │                               │       │
    │       ↓                               │       ↓
    │  ┌────────────────┐                  │  ┌────────────┐
    │  │ UPDATE ROLE    │                  │  │ Keep role  │
    │  │ user → admin   │                  │  │ as 'user'  │
    │  │ in Firestore   │                  │  └────────────┘
    │  └────────────────┘                  │       │
    │       │                               │       │
    └───┬───┘                               └───┬───┘
        │                                       │
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ Set isAdmin=true  │               │ Set isAdmin=false │
│ in AuthContext    │               │ in AuthContext    │
└───────────────────┘               └───────────────────┘
        │                                       │
        └───────────────┬───────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            │                       │
      ADMIN │                       │ USER
            ↓                       ↓
┌───────────────────┐   ┌───────────────────┐
│ Redirect to       │   │ Redirect to       │
│ Admin Dashboard   │   │ User Home         │
└───────────────────┘   └───────────────────┘
```

---

## 4️⃣ Route Protection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  USER NAVIGATES TO ROUTE                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Check Authentication State                                  │
│  • Is user logged in?                                        │
│  • What is user's role?                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
  LOGGED IN                               NOT LOGGED IN
        │                                       │
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ Check user role   │               │ Redirect to       │
│ from AuthContext  │               │ /signup           │
└───────────────────┘               └───────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────┐
│  Route Access Matrix                                         │
│                                                              │
│  Route                    Admin    User                      │
│  ────────────────────────────────────────                    │
│  /signup                  ✗        ✗                         │
│  /(tabs)                  ✓        ✓                         │
│  /admin-dashboard         ✓        ✗                         │
│  /upload-prescription     ✓        ✓                         │
│  /modal                   ✓        ✓                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
   ALLOWED                                 NOT ALLOWED
        │                                       │
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ Show requested    │               │ Redirect to       │
│ route             │               │ appropriate route │
└───────────────────┘               └───────────────────┘
```

---

## 5️⃣ Admin Email Check Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  isAdminEmail(email)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Normalize Email                                             │
│  • Convert to lowercase                                      │
│  • Trim whitespace                                           │
│  Example: "  Admin@Email.COM  " → "admin@email.com"         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Check Against ADMIN_EMAILS Array                            │
│  const ADMIN_EMAILS = [                                      │
│    'shahabdad50@gmail.com',                                  │
│    'shhhbdad@gmail.com'                                      │
│  ]                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
    MATCH                                   NO MATCH
        │                                       │
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ return true       │               │ return false      │
│ (Is Admin)        │               │ (Is User)         │
└───────────────────┘               └───────────────────┘
```

---

## 6️⃣ Component Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT RENDERS                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  const { isAdmin, appUser } = useAuth()                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
  isAdmin=true                            isAdmin=false
        │                                       │
        ↓                                       ↓
┌───────────────────┐               ┌───────────────────┐
│ Show Admin UI     │               │ Show User UI      │
│ • Admin stats     │               │ • User features   │
│ • Manage orders   │               │ • Upload Rx       │
│ • View all users  │               │ • Track orders    │
│ • Analytics       │               │ • Chat support    │
└───────────────────┘               └───────────────────┘
```

---

## 7️⃣ Database Structure

```
Firestore Database
│
├── users/
│   ├── {uid1}/
│   │   ├── uid: "abc123"
│   │   ├── name: "Shahab Dad"
│   │   ├── email: "shahabdad50@gmail.com"  ← Admin email
│   │   ├── phone: "+923001234567"
│   │   ├── role: "admin"                   ← Auto-assigned
│   │   ├── region: "lahore"
│   │   └── createdAt: Timestamp
│   │
│   ├── {uid2}/
│   │   ├── uid: "xyz789"
│   │   ├── name: "John Doe"
│   │   ├── email: "john@example.com"       ← Regular email
│   │   ├── phone: "+923009876543"
│   │   ├── role: "user"                    ← Auto-assigned
│   │   ├── region: "lahore"
│   │   └── createdAt: Timestamp
│   │
│   └── ...
│
├── prescriptions/
│   └── {prescriptionId}/
│       ├── userId: "xyz789"
│       ├── shopId: "madiccare-default"
│       ├── shopName: "MadicCare"
│       └── ...
│
└── orders/
    └── {orderId}/
        ├── userId: "xyz789"
        ├── shopId: "madiccare-default"
        ├── shopName: "MadicCare"
        └── ...
```

---

## 🔑 Key Takeaways

1. **Email-Based Admin Assignment**
   - Admin emails defined in code
   - Automatic role assignment
   - Case-insensitive matching

2. **Auto Role Verification**
   - Checks on every login
   - Updates role if needed
   - Ensures consistency

3. **Route Protection**
   - Automatic redirection
   - Role-based access control
   - Prevents unauthorized access

4. **Type-Safe**
   - Full TypeScript support
   - Type checking at compile time
   - Prevents runtime errors

5. **Well-Documented**
   - Clear flow diagrams
   - Code examples
   - Troubleshooting guides

---

**Last Updated**: April 29, 2026

