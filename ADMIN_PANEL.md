# Admin Panel Documentation

## Overview

The FastMadic Admin Panel is a comprehensive management system built directly into the mobile app. Admins can manage prescriptions, orders, and track all business operations from a single interface.

---

## 🔐 Access Control

**Admin Access:**
- Only users with admin role can access the admin panel
- Admin role is automatically assigned based on email (see `AUTH_SYSTEM.md`)
- Non-admin users are redirected to user home if they try to access admin routes

**Admin Emails:**
- `shahabdad50@gmail.com`
- `shhhbdad@gmail.com`

---

## 📱 Admin Panel Screens

### 1. Admin Dashboard (`/admin-dashboard`)

**Purpose**: Central hub for admin operations

**Features:**
- **Stats Overview**:
  - Total Orders
  - Pending Orders
  - Completed Orders
  - Revenue

- **Quick Actions**:
  - Prescriptions Management
  - Orders Management
  - Chats (Coming Soon)
  - Users (Coming Soon)
  - Inventory (Coming Soon)
  - Reports (Coming Soon)

- **Recent Activity Feed**:
  - New prescriptions
  - Order updates
  - User messages

- **Admin Info Card**:
  - Admin privileges indicator
  - Access level information

**Navigation:**
- Accessible after admin login
- Quick action buttons navigate to specific management screens

---

### 2. Prescriptions Management (`/admin-prescriptions`)

**Purpose**: Manage all prescription orders from customers

**Features:**

#### View Prescriptions
- List of all prescriptions for the shop
- Sorted by newest first
- Prescription image display
- User information (name, date, time)
- Current status badge
- User's message/notes
- Delivery address and phone

#### Filter by Status
- **All**: View all prescriptions
- **Pending**: New prescriptions awaiting quote
- **Quoted**: Prescriptions with sent quotes
- **Approved**: Approved prescriptions ready for processing
- **Delivered**: Completed deliveries
- **Rejected**: Rejected prescriptions

#### Send Quote
**When**: Prescription status is 'pending'

**Process:**
1. Click "Send Quote" button
2. Enter quote amount (₨)
3. Add optional admin message
4. Click "Send Quote"
5. Status changes to 'quoted'

**Fields:**
- **Quote Amount**: Price for the prescription (required)
- **Admin Message**: Additional notes (optional)
  - Example: "Includes delivery charges"
  - Example: "2-3 days for delivery"

#### Update Status

**Status Flow:**
```
pending → quoted → approved → delivered
                 ↓
              rejected
```

**Actions by Status:**

| Current Status | Available Actions |
|----------------|-------------------|
| pending | Send Quote |
| quoted | Approve, Reject |
| approved | Mark Delivered |
| delivered | (Final state) |
| rejected | (Final state) |

**Approve Prescription:**
- Available when status is 'quoted'
- Confirms the order will be processed
- Customer can proceed with payment

**Reject Prescription:**
- Available when status is 'quoted'
- Declines the order
- Provide reason in admin message

**Mark Delivered:**
- Available when status is 'approved'
- Confirms delivery completion
- Final status

#### Refresh
- Pull to refresh or tap refresh icon
- Reloads all prescriptions from database

---

### 3. Orders Management (`/admin-orders`)

**Purpose**: Manage regular orders (non-prescription)

**Features:**

#### View Orders
- List of all orders for the shop
- Sorted by newest first
- Order ID (first 8 characters)
- Order date and time
- Current status badge
- Order items with quantities
- Total amount
- WhatsApp notification status

#### Filter by Status
- **All**: View all orders
- **Pending**: New orders awaiting confirmation
- **Confirmed**: Confirmed orders ready for shipping
- **Shipped**: Orders in transit
- **Delivered**: Completed deliveries

#### Update Order Status

**Status Flow:**
```
pending → confirmed → shipped → delivered
```

**Actions by Status:**

| Current Status | Action Button | Next Status |
|----------------|---------------|-------------|
| pending | Mark as confirmed | confirmed |
| confirmed | Mark as shipped | shipped |
| shipped | Mark as delivered | delivered |
| delivered | (Completed) | - |

**Process:**
1. Click "Mark as [next status]" button
2. Confirm the status change
3. Order status updates
4. Customer can track progress

#### Order Details Display
- **Order ID**: Unique identifier (shortened)
- **Items**: List of products with quantities and prices
- **Total**: Sum of all items
- **WhatsApp Badge**: Shows if customer was notified

#### Refresh
- Pull to refresh or tap refresh icon
- Reloads all orders from database

---

## 🎨 UI/UX Features

### Design Elements
- **Modern Card Layout**: Clean, card-based design
- **Status Badges**: Color-coded status indicators
- **Smooth Animations**: Fade-in animations for list items
- **Pull to Refresh**: Swipe down to reload data
- **Empty States**: Helpful messages when no data

### Status Colors

**Prescriptions:**
| Status | Color | Icon |
|--------|-------|------|
| pending | Amber | time |
| quoted | Blue | pricetag |
| approved | Green | checkmark-circle |
| delivered | Indigo | checkmark-done-circle |
| rejected | Red | close-circle |

**Orders:**
| Status | Color | Icon |
|--------|-------|------|
| pending | Amber | time |
| confirmed | Blue | checkmark-circle |
| shipped | Indigo | airplane |
| delivered | Green | checkmark-done-circle |

### Responsive Layout
- Adapts to different screen sizes
- Safe area insets for notched devices
- Optimized for iOS and Android

---

## 🔄 Workflow Examples

### Prescription Order Workflow

**Scenario**: Customer uploads prescription

1. **Customer Action**:
   - Uploads prescription image
   - Adds message: "Need urgent delivery"
   - Provides address and phone

2. **Admin Receives**:
   - Prescription appears in "Pending" filter
   - Admin views prescription image
   - Reads customer message

3. **Admin Sends Quote**:
   - Clicks "Send Quote"
   - Enters amount: ₨1500
   - Adds message: "Includes delivery charges"
   - Status → 'quoted'

4. **Customer Reviews Quote**:
   - Receives quote notification
   - Reviews amount and message
   - Decides to proceed

5. **Admin Approves**:
   - Clicks "Approve"
   - Status → 'approved'
   - Begins processing order

6. **Admin Delivers**:
   - Order is delivered
   - Clicks "Mark Delivered"
   - Status → 'delivered'
   - Workflow complete

### Regular Order Workflow

**Scenario**: Customer places regular order

1. **Customer Action**:
   - Adds items to cart
   - Places order
   - Order created with status 'pending'

2. **Admin Confirms**:
   - Reviews order items
   - Clicks "Mark as confirmed"
   - Status → 'confirmed'

3. **Admin Ships**:
   - Packages order
   - Clicks "Mark as shipped"
   - Status → 'shipped'

4. **Admin Delivers**:
   - Order delivered to customer
   - Clicks "Mark as delivered"
   - Status → 'delivered'
   - Workflow complete

---

## 📊 Database Operations

### Prescriptions Collection

**Read Operations:**
```typescript
// Get all prescriptions for shop
await prescriptionService.getShopPrescriptions(shopId);

// Get single prescription
await prescriptionService.getPrescription(prescriptionId);
```

**Update Operations:**
```typescript
// Send quote
await prescriptionService.updatePrescriptionQuote(
  prescriptionId,
  quoteAmount,
  adminMessage
);

// Approve
await prescriptionService.approvePrescription(prescriptionId);

// Reject
await prescriptionService.rejectPrescription(prescriptionId);

// Mark delivered
await prescriptionService.deliverPrescription(prescriptionId);
```

### Orders Collection

**Read Operations:**
```typescript
// Get all orders for shop
await orderService.getShopOrders(shopId);

// Get single order
await orderService.getOrder(orderId);
```

**Update Operations:**
```typescript
// Update status
await orderService.updateOrderStatus(orderId, newStatus);

// Mark WhatsApp notified
await orderService.markWhatsAppNotified(orderId);
```

---

## 🔒 Security & Permissions

### Route Protection
- All admin routes check `isAdmin` from AuthContext
- Non-admin users are redirected to home
- Admin status verified on every navigation

### Data Access
- Admins can view all prescriptions for their shop
- Admins can view all orders for their shop
- User data is protected (only necessary fields shown)

### Firestore Security Rules
```javascript
// Recommended rules
match /prescriptions/{prescriptionId} {
  // Admins can read all prescriptions
  allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  
  // Admins can update prescriptions
  allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

match /orders/{orderId} {
  // Admins can read all orders
  allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  
  // Admins can update orders
  allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 🧪 Testing Checklist

### Prescriptions Management
- [ ] View all prescriptions
- [ ] Filter by each status
- [ ] Send quote with amount and message
- [ ] Approve prescription
- [ ] Reject prescription
- [ ] Mark as delivered
- [ ] Refresh prescription list
- [ ] View prescription image
- [ ] Read user message

### Orders Management
- [ ] View all orders
- [ ] Filter by each status
- [ ] Update order status (pending → confirmed)
- [ ] Update order status (confirmed → shipped)
- [ ] Update order status (shipped → delivered)
- [ ] View order items and total
- [ ] Refresh order list
- [ ] See WhatsApp notification badge

### Access Control
- [ ] Admin can access admin dashboard
- [ ] Admin can access prescriptions screen
- [ ] Admin can access orders screen
- [ ] Non-admin redirected from admin routes
- [ ] Logout works correctly

---

## 🚀 Future Enhancements

### Phase 1: Enhanced Features
- [ ] Search prescriptions by user name
- [ ] Search orders by order ID
- [ ] Date range filters
- [ ] Export data to CSV
- [ ] Print prescription/order details

### Phase 2: Communication
- [ ] In-app chat with customers
- [ ] WhatsApp integration for notifications
- [ ] SMS notifications
- [ ] Email notifications

### Phase 3: Analytics
- [ ] Revenue analytics
- [ ] Order trends
- [ ] Popular medicines
- [ ] Customer insights
- [ ] Performance metrics

### Phase 4: Inventory
- [ ] Medicine inventory management
- [ ] Stock alerts
- [ ] Supplier management
- [ ] Purchase orders

### Phase 5: Advanced Admin
- [ ] Multiple admin roles
- [ ] Permission management
- [ ] Activity logs
- [ ] Audit trail

---

## 📁 File Structure

```
src/
├── app/
│   ├── admin-dashboard.tsx       # Main admin dashboard
│   ├── admin-prescriptions.tsx   # Prescriptions management
│   └── admin-orders.tsx          # Orders management
├── services/
│   ├── prescriptionService.ts    # Prescription CRUD operations
│   └── orderService.ts           # Order CRUD operations
├── constants/
│   ├── adminEmails.ts            # Admin email configuration
│   └── shops.ts                  # Shop configuration
├── context/
│   └── AuthContext.tsx           # Authentication & role management
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 📞 Support

**Admin Dashboard**: `src/app/admin-dashboard.tsx`  
**Prescriptions**: `src/app/admin-prescriptions.tsx`  
**Orders**: `src/app/admin-orders.tsx`  
**Services**: `src/services/prescriptionService.ts`, `src/services/orderService.ts`  
**Auth System**: See `AUTH_SYSTEM.md`

---

## ✨ Summary

The Admin Panel provides a complete management solution for:
- ✅ Viewing and managing prescriptions
- ✅ Sending quotes to customers
- ✅ Updating prescription status (5 states)
- ✅ Managing regular orders
- ✅ Updating order status (4 states)
- ✅ Filtering by status
- ✅ Real-time data refresh
- ✅ Modern, intuitive UI
- ✅ Secure, role-based access

**Status**: ✅ Complete and Ready for Production

**Last Updated**: April 29, 2026
