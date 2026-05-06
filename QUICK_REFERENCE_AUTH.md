# Quick Reference: Authentication & Roles

## 🔑 Admin Emails

**Current Admins:**
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

**Configuration File**: `src/constants/adminEmails.ts`

---

## 📍 Key Files

| File | Purpose |
|------|---------|
| `src/constants/adminEmails.ts` | Admin email list |
| `src/context/AuthContext.tsx` | Auth state & role checking |
| `src/services/authService.ts` | Login/register logic |
| `src/app/_layout.tsx` | Route protection |
| `src/app/admin-dashboard.tsx` | Admin dashboard |
| `AUTH_SYSTEM.md` | Full documentation |

---

## 🚀 Quick Usage

### Check if User is Admin
```typescript
import { useAuth } from '@/src/context/AuthContext';

const { isAdmin, appUser } = useAuth();

if (isAdmin) {
  // Show admin features
}
```

### Check Email
```typescript
import { isAdminEmail } from '@/src/constants/adminEmails';

const isAdmin = isAdminEmail('shahabdad50@gmail.com'); // true
```

### Get User Role
```typescript
import { getRoleFromEmail } from '@/src/constants/adminEmails';

const role = getRoleFromEmail(email); // 'admin' or 'user'
```

---

## 🔄 User Flow

### Admin Login
```
1. Login with admin email
2. Auto-assigned 'admin' role
3. Redirect to Admin Dashboard
4. Access admin features
```

### User Login
```
1. Login with any other email
2. Auto-assigned 'user' role
3. Redirect to User Home
4. Access user features
```

---

## ➕ Add New Admin

**Step 1**: Edit `src/constants/adminEmails.ts`
```typescript
export const ADMIN_EMAILS: readonly string[] = [
  'shahabdad50@gmail.com',
  'shhhbdad@gmail.com',
  'newadmin@gmail.com', // Add here
] as const;
```

**Step 2**: Rebuild app
```bash
npm run android
# or
npm run ios
```

**Step 3**: New admin can login

---

## 🗄️ User Document

```typescript
{
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  region: string;
  createdAt: Date;
}
```

---

## ✅ What's Automatic

- ✅ Role assignment based on email
- ✅ Auto-redirect after login
- ✅ Role verification on every login
- ✅ Admin dashboard access control
- ✅ User document creation

---

## 🔒 Security

- Email-based admin assignment
- Auto role verification
- Protected routes
- Firebase Auth integration
- Firestore user documents

---

## 📞 Need Help?

**Full Docs**: See `AUTH_SYSTEM.md`  
**Admin Emails**: `src/constants/adminEmails.ts`  
**Auth Logic**: `src/services/authService.ts`  
**Route Protection**: `src/app/_layout.tsx`
