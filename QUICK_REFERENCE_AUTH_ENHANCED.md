# Quick Reference: Enhanced Authentication

## What Changed? 🎯

The login/signup screen now has **two tabs** at the top:
- **Sign In** (default) - For returning users
- **Register** - For new users

## For Users

### First Time Opening the App
1. You'll see the **Sign In** screen by default
2. Notice the **Register** tab at the top
3. Tap **Register** to create a new account
4. Fill in your details and tap **Create Account**

### Returning Users
1. You'll see the **Sign In** screen by default
2. Enter your email and password
3. Tap **Sign In**
4. You're in!

### Switching Between Login and Register
- Just tap the tab at the top
- **Sign In** tab → Login form (2 fields)
- **Register** tab → Registration form (5 fields)

## Visual Guide

```
┌─────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐    │
│  │ Sign In  │  │ Register │    │  ← Tap to switch
│  │ (ACTIVE) │  │          │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

## Login (Default View)

**Fields:**
- Email
- Password

**Button:** Sign In

**Also available:** Google sign-in

## Register (Tap Register Tab)

**Fields:**
- Full Name
- Email
- Password
- Confirm Password
- Role (Patient or Shop Admin)

**Button:** Create Account

**Also available:** Google sign-in

## Authentication Methods

### 1. Email/Password
- **Login**: Email + Password
- **Register**: Full details + Role selection

### 2. Google Sign-In
- Available in both Login and Register modes
- One-tap authentication
- Automatically creates profile if new user

## After Login/Register

### Admin Users
If your email is:
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

→ You'll see the **Admin Dashboard**

### Regular Users
All other emails:

→ You'll see the **User Home** with tabs:
- Home
- Chat
- Orders
- Prescriptions
- Profile

## Tips

✅ **Default is Login**: Returning users can sign in immediately
✅ **Clear Registration**: New users can easily find the Register tab
✅ **One-Tap Switching**: No need to navigate between screens
✅ **Google OAuth**: Quick sign-in option available
✅ **Auto-Routing**: Automatically redirected based on your role

## Troubleshooting

### "I can't find where to register"
→ Look at the top of the screen for the **Register** tab

### "I already have an account but see registration form"
→ Tap the **Sign In** tab at the top

### "I'm an admin but see user interface"
→ Make sure you're logging in with an admin email:
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

### "Google sign-in not working"
→ Make sure you have Google account set up on your device

## File Location
`src/app/signup.tsx`

## Documentation
- `AUTH_SCREEN_ENHANCED.md` - Detailed technical documentation
- `AUTH_BEFORE_AFTER.md` - Visual comparison
- `TASK_14_COMPLETE.md` - Implementation summary
- `AUTH_SYSTEM.md` - Overall authentication system
- `AUTH_FLOW_SIMPLE.md` - Authentication flow diagram

## Status
✅ **COMPLETE AND READY TO USE**

