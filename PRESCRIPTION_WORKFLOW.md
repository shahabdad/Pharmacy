# 💊 Prescription Management Workflow

This document outlines the professional workflow for prescription processing within the Medicare application, designed for high-end healthcare service standards.

---

## 🔄 Interaction Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (App)
    participant S as Firebase / System
    participant A as Admin (Pharmacist)

    U->>S: Upload Prescription (pending)
    S-->>A: Notify New Rx
    A->>S: Review & Send Quote (quoted)
    S-->>U: Notify: Quote Ready
    U->>S: Review & Approve Quote (approved)
    S-->>A: Notify: Start Preparation
    A->>S: Prepare & Deliver (delivered)
    S-->>U: Notify: Arrived
```

---

## 🚦 State Transitions (Flowchart)

```mermaid
stateDiagram-v2
    [*] --> Reviewing: User Submits
    Reviewing --> ReadyToPay: Pharmacist Quotes
    Reviewing --> Declined: Pharmacist Rejects
    
    ReadyToPay --> Processing: User Approves
    ReadyToPay --> Declined: User Cancels
    
    Processing --> Delivered: Pharmacist Dispatches
    Delivered --> [*]
```

---

## 📑 Lifecycle Overview

### 1. Submission (User)
*   **Action**: User uploads a photo of a physical prescription or types a medicine list.
*   **System State**: `pending`
*   **UI Label**: "Reviewing"

### 2. Quoting (Pharmacist)
*   **Action**: Pharmacist reviews the image, sets a price ($), and adds a note.
*   **System State**: `quoted`
*   **UI Label**: "Action Required" / "Ready to Pay"

### 3. Approval & Payment (User)
*   **Action**: User reviews the price and confirms the order.
*   **System State**: `approved`
*   **UI Label**: "Processing"

### 4. Fulfillment & Delivery (Pharmacist)
*   **Action**: Pharmacist préparer the order and marks as delivered once received.
*   **System State**: `delivered`
*   **UI Label**: "Delivered"

---

## 🎨 Professional Design Standards
*   **Color Palette**: Professional Blue and Emerald themes.
*   **Typography**: Clean, minimalist fonts for American tech standards.
*   **Icons**: Precise `Ionicons` for a premium healthcare feel.

