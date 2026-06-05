# Quick Reference: Admin Panel

## 🎯 Admin Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/admin-dashboard` | Overview & quick actions |
| Prescriptions | `/admin-prescriptions` | Manage prescriptions |
| Orders | `/admin-orders` | Manage orders |

---

## 📋 Prescription Status Flow

```
pending → quoted → approved → delivered
                 ↓
              rejected
```

**Actions:**
- **pending** → Send Quote
- **quoted** → Approve or Reject
- **approved** → Mark Delivered

---

## 📦 Order Status Flow

```
pending → confirmed → shipped → delivered
```

**Actions:**
- **pending** → Mark as confirmed
- **confirmed** → Mark as shipped
- **shipped** → Mark as delivered

---

## 🎨 Status Colors

### Prescriptions
| Status | Color | Icon |
|--------|-------|------|
| pending | 🟡 Amber | time |
| quoted | 🔵 Blue | pricetag |
| approved | 🟢 Green | checkmark-circle |
| delivered | 🟣 Indigo | checkmark-done-circle |
| rejected | 🔴 Red | close-circle |

### Orders
| Status | Color | Icon |
|--------|-------|------|
| pending | 🟡 Amber | time |
| confirmed | 🔵 Blue | checkmark-circle |
| shipped | 🟣 Indigo | airplane |
| delivered | 🟢 Green | checkmark-done-circle |

---

## 🔧 Quick Actions

### Send Quote
```typescript
1. Click "Send Quote" on pending prescription
2. Enter amount (₨)
3. Add optional message
4. Click "Send Quote"
```

### Update Prescription Status
```typescript
// Approve
await prescriptionService.approvePrescription(id);

// Reject
await prescriptionService.rejectPrescription(id);

// Deliver
await prescriptionService.deliverPrescription(id);
```

### Update Order Status
```typescript
await orderService.updateOrderStatus(orderId, newStatus);
```

---

## 📊 Data Operations

### Load Prescriptions
```typescript
const prescriptions = await prescriptionService.getShopPrescriptions(shopId);
```

### Load Orders
```typescript
const orders = await orderService.getShopOrders(shopId);
```

---

## 🔒 Access Control

**Admin Only:**
- All admin routes check `isAdmin`
- Non-admins redirected to home
- Admin emails in `src/constants/adminEmails.ts`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/app/admin-dashboard.tsx` | Main dashboard |
| `src/app/admin-prescriptions.tsx` | Prescriptions screen |
| `src/app/admin-orders.tsx` | Orders screen |
| `src/services/prescriptionService.ts` | Prescription operations |
| `src/services/orderService.ts` | Order operations |
| `ADMIN_PANEL.md` | Full documentation |

---

## ✅ Features

- ✅ View prescriptions & orders
- ✅ Filter by status
- ✅ Send quotes
- ✅ Update statuses
- ✅ Real-time refresh
- ✅ Modern UI
- ✅ Secure access

---

## 📞 Need Help?

**Full Docs**: See `ADMIN_PANEL.md`  
**Auth System**: See `AUTH_SYSTEM.md`  
**Shop System**: See `SHOP_SYSTEM.md`

