/**
 * WhatsApp Link Generator Utility
 * Generates WhatsApp links for sending messages to shop admins
 */

export const whatsappUtils = {
  /**
   * Generate WhatsApp link for prescription quote
   */
  generatePrescriptionQuoteLink(
    shopPhone: string,
    userName: string,
    prescriptionId: string,
    quoteAmount: number
  ): string {
    const message = `Hello ${userName}, your prescription quote (ID: ${prescriptionId}) is Rs.${quoteAmount}. Please confirm via the app to proceed with your order.`;
    return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Generate WhatsApp link for order confirmation
   */
  generateOrderConfirmationLink(
    shopPhone: string,
    userName: string,
    orderId: string,
    totalAmount: number,
    items: string
  ): string {
    const message = `Hello ${userName}, your order (ID: ${orderId}) has been confirmed for Rs.${totalAmount}. Items: ${items}. Track your order in the app.`;
    return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Generate WhatsApp link for order status update
   */
  generateOrderStatusLink(
    shopPhone: string,
    userName: string,
    orderId: string,
    status: string
  ): string {
    const message = `Hello ${userName}, your order (ID: ${orderId}) status has been updated to: ${status}. Check the app for more details.`;
    return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Generate WhatsApp link for delivery notification
   */
  generateDeliveryLink(
    shopPhone: string,
    userName: string,
    orderId: string
  ): string {
    const message = `Hello ${userName}, your order (ID: ${orderId}) has been delivered! Thank you for choosing MediCare. Rate your experience in the app.`;
    return `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Format phone number to include country code if needed
   */
  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add Pakistan country code if not present
    if (!cleaned.startsWith('92')) {
      if (cleaned.startsWith('0')) {
        cleaned = '92' + cleaned.substring(1);
      } else {
        cleaned = '92' + cleaned;
      }
    }
    
    return cleaned;
  },
};

