# Shop System Documentation

## Current Implementation: Single Shop (MadicCare)

### Overview
The FastMadic pharmacy delivery system currently operates with a **single default shop** called **"MadicCare"**. All prescription orders and regular orders are automatically assigned to this shop.

### Default Shop Configuration

**Shop Details:**
- **ID**: `madiccare-default`
- **Name**: MadicCare
- **Region**: default
- **Contact**: +923191796621
- **WhatsApp**: +923191796621
- **Email**: support@madiccare.com
- **Address**: Pakistan
- **Status**: Active

### How It Works

#### 1. Prescription Orders
When a user submits a prescription through the home screen:
- The prescription is automatically assigned to MadicCare
- Shop ID (`madiccare-default`) and Shop Name (`MadicCare`) are stored in Firestore
- No user input required for shop selection

**Code Location**: `src/services/prescriptionService.ts`
```typescript
// Automatically assigns default shop
const docRef = await addDoc(collection(db, 'prescriptions'), {
  userId: payload.userId,
  userName: payload.userName,
  shopId: DEFAULT_SHOP.id,      // madiccare-default
  shopName: DEFAULT_SHOP.name,  // MadicCare
  imageUrl,
  message: payload.message,
  address: payload.address,
  phone: payload.phone,
  status: 'pending',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
```

#### 2. Regular Orders
When creating regular orders (non-prescription):
- Orders are automatically assigned to MadicCare
- Shop ID defaults to `madiccare-default` if not specified
- Shop name is stored for easy reference

**Code Location**: `src/services/orderService.ts`
```typescript
async createOrder(
  userId: string,
  shopId: string = DEFAULT_SHOP.id, // Defaults to MadicCare
  items: OrderItem[],
  totalAmount: number
): Promise<Order>
```

#### 3. Shop Configuration
Centralized shop configuration is managed in:
**File**: `src/constants/shops.ts`

**Key Functions:**
- `DEFAULT_SHOP` - The default shop configuration object
- `getAssignedShopId(userId?, userRegion?)` - Returns shop ID to assign (currently always returns default)
- `getShopById(shopId)` - Get shop configuration by ID
- `getAllActiveShops()` - Get all active shops (currently returns only MadicCare)

### Database Schema

#### Prescriptions Collection
```typescript
{
  id: string;
  userId: string;
  userName: string;
  shopId: string;        // "madiccare-default"
  shopName: string;      // "MadicCare"
  imageUrl: string;
  message: string;
  address: string;
  phone: string;
  status: 'pending' | 'quoted' | 'approved' | 'delivered' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Orders Collection
```typescript
{
  id: string;
  userId: string;
  shopId: string;        // "madiccare-default"
  shopName: string;      // "MadicCare"
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  whatsappNotified: boolean;
  chatId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Future Enhancements

### 1. Multi-Shop System

**Goal**: Support multiple pharmacy shops in the system

**Features to Implement:**
- Shop registration and approval workflow
- Shop-specific admin dashboards
- Shop-specific inventory management
- Shop-specific pricing and promotions
- Shop performance analytics
- Shop ratings and reviews

**Database Changes:**
- Create `shops` collection in Firestore
- Add shop management UI for super-admin
- Update order/prescription assignment logic

**Code Changes:**
```typescript
// Future: Fetch shops from database
export async function getAllActiveShops(): Promise<ShopConfig[]> {
  const q = query(collection(db, 'shops'), where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopConfig));
}
```

### 2. Region-Based Shop Selection

**Goal**: Automatically assign orders to the nearest shop based on user location

**Features to Implement:**
- User location detection (GPS or manual region selection)
- Distance calculation between user and shops
- Regional delivery zones
- Shop availability by region
- Delivery time estimation based on distance

**Implementation Strategy:**
```typescript
// Future: Region-based assignment
export function getAssignedShopId(
  userId: string,
  userRegion: string,
): string {
  // 1. Get user's location/region
  // 2. Find active shops in that region
  // 3. Calculate distance to each shop
  // 4. Return nearest shop ID
  // 5. Fallback to default shop if no regional shop found
  
  const shops = getShopsByRegion(userRegion);
  if (shops.length === 0) return DEFAULT_SHOP.id;
  
  const nearestShop = findNearestShop(userId, shops);
  return nearestShop.id;
}
```

**Database Schema for Shops:**
```typescript
interface Shop {
  id: string;
  name: string;
  region: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  deliveryZones: string[];      // Array of postal codes or region IDs
  maxDeliveryDistance: number;  // in kilometers
  isActive: boolean;
  rating: number;
  totalOrders: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. User Shop Preferences

**Goal**: Allow users to select their preferred shop

**Features:**
- User profile setting for preferred shop
- Shop selection during order placement
- Save multiple delivery addresses with preferred shops
- Shop comparison (pricing, delivery time, ratings)

### 4. Shop Inventory Integration

**Goal**: Show real-time medicine availability per shop

**Features:**
- Shop-specific medicine inventory
- Real-time stock updates
- Alternative shop suggestions if medicine unavailable
- Pre-order for out-of-stock items

---

## Migration Path

### Phase 1: Database Preparation (Week 1-2)
1. Create `shops` collection in Firestore
2. Add MadicCare as the first shop entry
3. Update existing prescriptions/orders to include `shopName` field
4. Test data migration scripts

### Phase 2: Multi-Shop Backend (Week 3-4)
1. Implement shop CRUD operations
2. Update order/prescription services to support multiple shops
3. Create shop admin role and permissions
4. Add shop-specific queries and filters

### Phase 3: Region-Based Logic (Week 5-6)
1. Add location fields to user profiles
2. Implement distance calculation utilities
3. Create region-to-shop mapping logic
4. Add fallback mechanisms

### Phase 4: UI Updates (Week 7-8)
1. Add shop selection UI for users
2. Create shop management dashboard for super-admin
3. Add shop details page
4. Implement shop search and filter

### Phase 5: Testing & Rollout (Week 9-10)
1. Comprehensive testing with multiple shops
2. Performance optimization
3. Gradual rollout to users
4. Monitor and fix issues

---

## Configuration Files

### Primary Files
- `src/constants/shops.ts` - Shop configuration and helper functions
- `src/services/prescriptionService.ts` - Prescription order handling
- `src/services/orderService.ts` - Regular order handling
- `src/types/index.ts` - TypeScript interfaces

### Environment Variables
```env
# Shop Configuration (Future)
EXPO_PUBLIC_DEFAULT_SHOP_ID=madiccare-default
EXPO_PUBLIC_ENABLE_MULTI_SHOP=false
EXPO_PUBLIC_ENABLE_REGION_BASED_ASSIGNMENT=false
```

---

## Testing Checklist

### Current System (Single Shop)
- [x] Prescription orders assigned to MadicCare
- [x] Regular orders assigned to MadicCare
- [x] Shop ID and name stored in database
- [x] WhatsApp integration uses shop contact
- [x] No TypeScript errors

### Future System (Multi-Shop)
- [ ] Multiple shops can be created
- [ ] Orders assigned to correct shop based on region
- [ ] Shop-specific admin dashboards work
- [ ] Shop inventory tracking functional
- [ ] Region-based assignment accurate
- [ ] Fallback to default shop works
- [ ] Performance acceptable with 100+ shops

---

## Support

For questions or issues related to the shop system:
- **Technical Lead**: Review `src/constants/shops.ts`
- **Database**: Check Firestore `prescriptions` and `orders` collections
- **Configuration**: See `.env.example` for environment variables

**Last Updated**: April 29, 2026

