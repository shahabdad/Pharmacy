/**
 * Validation utilities for form inputs
 */

export const validators = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength (minimum 6 characters)
   */
  isStrongPassword(password: string): boolean {
    return password.length >= 6;
  },

  /**
   * Validate phone number (Pakistani format)
   */
  isValidPhone(phone: string): boolean {
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Pakistan: 11-13 digits (with or without country code)
    return cleaned.length >= 10 && cleaned.length <= 13;
  },

  /**
   * Validate OTP (4-6 digits)
   */
  isValidOTP(otp: string): boolean {
    const otpRegex = /^\d{4,6}$/;
    return otpRegex.test(otp);
  },

  /**
   * Validate name (at least 2 characters)
   */
  isValidName(name: string): boolean {
    return name.trim().length >= 2;
  },
};

