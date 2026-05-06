/**
 * Shop Configuration
 * 
 * Currently supports single shop: "MadicCare"
 * All orders are automatically assigned to this default shop.
 * 
 * Future Enhancements:
 * ────────────────────
 * 1. Multi-shop system:
 *    - Support multiple pharmacy shops
 *    - Shop-specific inventory and pricing
 *    - Shop-specific admin dashboards
 * 
 * 2. Region-based shop selection:
 *    - Automatically assign shop based on user's region/location
 *    - Distance-based shop matching
 *    - Regional delivery zones
 * 
 * 3. Shop management features:
 *    - Shop registration and approval workflow
 *    - Shop performance analytics
 *    - Shop-specific promotions and offers
 */

export interface ShopConfig {
  id: string;
  name: string;
  region: string;
  contact: string;
  whatsapp: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

/**
 * Default shop: MadicCare
 * This is the primary pharmacy shop handling all orders
 */
export const DEFAULT_SHOP: ShopConfig = {
  id: 'medicare-default',
  name: 'Medicare',
  region: 'default',
  contact: '+923191796621',
  whatsapp: '+923191796621',
  email: 'support@medicare.com',
  address: 'Pakistan',
  isActive: true,
} as const;

/**
 * Get the shop ID to assign to a new order/prescription
 * 
 * Current logic: Always returns default shop
 * Future: Can implement region-based or user-preference logic
 * 
 * @param userId - User ID (for future region-based assignment)
 * @param userRegion - User's region (for future region-based assignment)
 * @returns Shop ID to assign
 */
export function getAssignedShopId(
  userId?: string,
  userRegion?: string,
): string {
  // TODO: Implement multi-shop logic here when ready
  // For now, always return default shop
  return DEFAULT_SHOP.id;
}

/**
 * Get shop configuration by ID
 * 
 * @param shopId - Shop ID
 * @returns Shop configuration or null if not found
 */
export function getShopById(shopId: string): ShopConfig | null {
  // TODO: Fetch from database when multi-shop is implemented
  // For now, only default shop exists
  return shopId === DEFAULT_SHOP.id ? DEFAULT_SHOP : null;
}

/**
 * Get all active shops
 * 
 * @returns Array of active shop configurations
 */
export function getAllActiveShops(): ShopConfig[] {
  // TODO: Fetch from database when multi-shop is implemented
  // For now, return only default shop
  return [DEFAULT_SHOP];
}
