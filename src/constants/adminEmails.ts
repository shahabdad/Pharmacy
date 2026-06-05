/**
 * Admin Email Configuration
 * 
 * This file contains the list of admin email addresses.
 * Users who sign in with these emails will be automatically assigned
 * the 'admin' role and redirected to the Admin Dashboard.
 * 
 * All other users will be assigned the 'user' role and see the normal user app.
 */

/**
 * List of admin email addresses
 * Loaded dynamically from the .env configuration
 */
const envEmails = process.env.EXPO_PUBLIC_ADMIN_EMAILS;
export const ADMIN_EMAILS: readonly string[] = envEmails
  ? envEmails.split(',').map(e => e.trim())
  : ['shahabdad50@gmail.com', 'shhhbdad@gmail.com'];

/**
 * Check if an email is an admin email
 * Case-insensitive comparison
 * 
 * @param email - Email address to check
 * @returns true if email is in admin list, false otherwise
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(adminEmail => 
    adminEmail.toLowerCase() === normalizedEmail
  );
}

/**
 * Get the role based on email address
 * 
 * @param email - Email address
 * @returns 'admin' if email is in admin list, 'user' otherwise
 */
export function getRoleFromEmail(email: string): 'admin' | 'user' {
  return isAdminEmail(email) ? 'admin' : 'user';
}

/**
 * Validate if user should have admin access
 * 
 * @param email - User's email address
 * @param role - User's current role
 * @returns true if user should have admin access
 */
export function validateAdminAccess(email: string, role: string): boolean {
  return isAdminEmail(email) && role === 'admin';
}

