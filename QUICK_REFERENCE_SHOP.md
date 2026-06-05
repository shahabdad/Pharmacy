# Quick Reference: Shop System

## 🏪 Default Shop: MadicCare

**Shop ID**: `madiccare-default`  
**Shop Name**: MadicCare  
**Contact**: +923191796621  
**WhatsApp**: +923191796621

---

## 📍 Key Files

| File | Purpose |
|------|---------|
| `src/constants/shops.ts` | Shop configuration & helper functions |
| `src/services/prescriptionService.ts` | Prescription order handling |
| `src/services/orderService.ts` | Regular order handling |
| `src/types/index.ts` | TypeScript interfaces |
| `SHOP_SYSTEM.md` | Complete documentation |

---

## 🔧 Quick Usage

### Import Shop Configuration
```typescript
import { DEFAULT_SHOP, getAssignedShopId } from '@/src/constants/shops';
```

### Get Shop Details
```typescript
console.log(DEFAULT_SHOP.id);        // "madiccare-default"
console.log(DEFAULT_SHOP.name);      // "MadicCare"
console.log(DEFAULT_SHOP.contact);   // "+923191796621"
console.log(DEFAULT_SHOP.whatsapp);  // "+923191796621"
```

### Get Assigned Shop ID
```typescript
const shopId = getAssignedShopId(userId, userRegion);
// Returns: "madiccare-default"
```

---

## 📦 Database Fields

### Prescriptions
```typescript
{
  shopId: "madiccare-default",
  shopName: "MadicCare",
  // ... other fields
}
```

### Orders
```typescript
{
  shopId: "madiccare-default",
  shopName: "MadicCare",
  // ... other fields
}
```

---

## ✅ What's Automatic

- ✅ All prescriptions assigned to MadicCare
- ✅ All orders assigned to MadicCare
- ✅ Shop ID and name stored in database
- ✅ No user input required
- ✅ Ready for multi-shop expansion

---

## 🚀 Future Features

### Phase 1: Multi-Shop
- Multiple pharmacy shops
- Shop-specific dashboards
- Shop inventory management

### Phase 2: Region-Based
- Automatic shop selection by location
- Distance calculation
- Regional delivery zones

### Phase 3: User Preferences
- Preferred shop selection
- Shop comparison
- Shop ratings

---

## 📞 Need Help?

**Full Documentation**: See `SHOP_SYSTEM.md`  
**Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`  
**Code**: Check `src/constants/shops.ts`

