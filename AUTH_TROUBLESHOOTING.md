# Authentication Troubleshooting Guide

## Common Errors and Solutions

### 1. "auth/invalid-credential" Error

**Error Message**: "Login failed firebase: Error (auth/invalid-credential)"

**What it means**: The email/password combination doesn't exist in Firebase Authentication.

**Solutions**:

#### Solution A: Create a New Account (Recommended)
1. Tap the **"Register"** tab at the top
2. Fill in all fields:
   - Full Name: Your name
   - Email: Any valid email (e.g., `test@example.com`)
   - Password: At least 6 characters
   - Confirm Password: Same as password
   - Role: Select "Patient" or "Shop Admin"
3. Tap **"Create Account"**
4. You'll be automatically logged in

#### Solution B: Use Google Sign-In
1. Tap **"Continue with Google"** button
2. Select your Google account
3. Authorize the app
4. You'll be automatically logged in

#### Solution C: Check Your Credentials
- Make sure you're using the correct email address
- Check for typos in email or password
- Passwords are case-sensitive
- Make sure password is at least 6 characters

#### Solution D: Create Account via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pharmacy-8086d`
3. Navigate to **Authentication** → **Users**
4. Click **"Add user"**
5. Enter email and password (min 6 characters)
6. Click **"Add user"**
7. Now you can login with those credentials in the app

---

### 2. "auth/email-already-in-use" Error

**What it means**: You're trying to register with an email that already exists.

**Solution**:
1. Tap the **"Sign In"** tab
2. Use your existing email and password to login
3. If you forgot your password, use password reset (coming soon)

---

### 3. "auth/wrong-password" Error

**What it means**: The email exists but the password is incorrect.

**Solutions**:
- Double-check your password
- Make sure Caps Lock is off
- Try typing the password again carefully
- If you forgot your password, use password reset (coming soon)

---

### 4. "auth/invalid-email" Error

**What it means**: The email format is invalid.

**Solutions**:
- Check email format: `user@example.com`
- Remove any spaces before or after the email
- Make sure there's an `@` symbol
- Make sure there's a domain (e.g., `.com`, `.net`)

---

### 5. "auth/weak-password" Error

**What it means**: Password is too short or weak.

**Solutions**:
- Use at least 6 characters
- Consider using a mix of letters, numbers, and symbols
- Avoid common passwords like "123456" or "password"

---

### 6. "auth/too-many-requests" Error

**What it means**: Too many failed login attempts.

**Solutions**:
- Wait 5-10 minutes before trying again
- Make sure you're using the correct credentials
- Try password reset (coming soon)
- Contact support if issue persists

---

### 7. "auth/network-request-failed" Error

**What it means**: Network connection issue.

**Solutions**:
- Check your internet connection
- Try switching between WiFi and mobile data
- Restart the app
- Check if Firebase is accessible in your region

---

### 8. Google Sign-In Not Working

**Possible Issues**:
- Google account not set up on device
- App not authorized
- Network issue
- OAuth configuration issue

**Solutions**:
1. Make sure you have a Google account on your device
2. Check internet connection
3. Try again after a few seconds
4. If persists, use email/password registration

---

## Testing Accounts

### Create Test Accounts

#### Regular User Account
```
Email: test@example.com
Password: test123
Role: Patient
```

#### Admin Account
```
Email: shahabdad50@gmail.com
Password: [your password]
Role: Admin (auto-detected)
```

**Note**: Admin emails are configured in `src/constants/adminEmails.ts`

---

## Step-by-Step: First Time Setup

### For New Users

1. **Open the app**
   - You'll see the Login screen by default

2. **Create an account**
   - Tap the **"Register"** tab at the top
   - Fill in your details:
     - Full Name: `John Doe`
     - Email: `john@example.com`
     - Password: `password123` (min 6 chars)
     - Confirm Password: `password123`
     - Role: Select **"Patient"**
   - Tap **"Create Account"**

3. **Wait for account creation**
   - You'll see "Creating account..." message
   - This takes 2-3 seconds

4. **Automatic login**
   - You'll be automatically logged in
   - Redirected to User Home (tabs)

5. **Start using the app**
   - Upload prescriptions
   - Chat with pharmacy
   - Track orders

### For Admin Users

1. **Open the app**
   - You'll see the Login screen

2. **Create admin account**
   - Tap the **"Register"** tab
   - Use one of the admin emails:
     - `shahabdad50@gmail.com`
     - `shhhbdad@gmail.com`
   - Fill in password and other details
   - Role will be auto-detected as "Admin"
   - Tap **"Create Account"**

3. **Automatic redirect**
   - You'll be redirected to Admin Dashboard
   - Not to User Home

4. **Start managing**
   - View prescriptions
   - Send quotes
   - Manage orders
   - Chat with customers

---

## Verification Checklist

### Before Reporting Issues

- [ ] I'm using a valid email format
- [ ] My password is at least 6 characters
- [ ] I've tried creating a new account (Register tab)
- [ ] I've checked my internet connection
- [ ] I've tried Google Sign-In
- [ ] I've waited a few minutes if I got "too many requests" error
- [ ] I've checked Firebase Console for the user account
- [ ] I've restarted the app

---

## Firebase Console Verification

### Check if User Exists

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `pharmacy-8086d`
3. Navigate to **Authentication** → **Users**
4. Search for your email
5. If found: User exists, check password
6. If not found: Create account using Register tab

### Check Firestore User Document

1. Go to **Firestore Database**
2. Navigate to `users` collection
3. Look for document with your UID
4. Verify fields:
   - `email`: Your email
   - `role`: 'user' or 'admin'
   - `name`: Your name
   - `region`: 'lahore'

---

## Error Messages Explained

### Improved Error Messages (After Update)

#### Login Errors
- **"No account found with this email and password"**
  → Use Register tab to create account

- **"Incorrect password"**
  → Check your password and try again

- **"Invalid email address format"**
  → Check email format (user@example.com)

- **"Too many failed login attempts"**
  → Wait 5-10 minutes and try again

#### Registration Errors
- **"This email is already registered"**
  → Use Sign In tab to login

- **"Invalid email address format"**
  → Check email format

- **"Password is too weak"**
  → Use at least 6 characters

- **"Network error"**
  → Check internet connection

---

## Quick Fixes

### Can't Login?
1. Tap **"Register"** tab
2. Create a new account
3. Use that account to login

### Forgot Password?
- Password reset feature coming soon
- For now, create a new account with different email
- Or contact admin to reset via Firebase Console

### Google Sign-In Failed?
- Try email/password registration instead
- Check internet connection
- Make sure Google account is set up on device

### Account Created but Can't Login?
- Wait 10 seconds after registration
- Try restarting the app
- Check Firebase Console to verify account exists
- Try Google Sign-In instead

---

## Contact Support

If none of these solutions work:

1. **Check Firebase Status**
   - Visit [Firebase Status Dashboard](https://status.firebase.google.com/)
   - Check if there are any ongoing issues

2. **Provide Details**
   - Error message (exact text)
   - Steps you took
   - Email you're trying to use (without password!)
   - Device type (iOS/Android)
   - App version

3. **Contact Admin**
   - WhatsApp: +923191796621
   - Email: shahabdad50@gmail.com

---

## Developer Notes

### Error Handling Improvements

The app now provides user-friendly error messages for:
- Invalid credentials
- Email already in use
- Weak passwords
- Network errors
- Too many requests

### Firebase Configuration

Make sure `.env` file has:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pharmacy-8086d
```

### Admin Email Configuration

Admin emails are in `src/constants/adminEmails.ts`:
```typescript
export const ADMIN_EMAILS = [
  'shahabdad50@gmail.com',
  'shhhbdad@gmail.com',
];
```

---

## Summary

**Most Common Issue**: Trying to login with credentials that don't exist yet

**Quick Solution**: Use the **Register tab** to create a new account first

**Alternative**: Use **Google Sign-In** for instant access

**Remember**: 
- Passwords must be at least 6 characters
- Email format must be valid (user@example.com)
- Admin emails are auto-detected and redirected to Admin Dashboard
- Regular users are redirected to User Home (tabs)

