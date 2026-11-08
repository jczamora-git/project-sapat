# Sapat — Smart Food Pre-ordering & Preparation Management for School Canteens

> **"Sapat"** *(Tagalog)*: Sufficient, just enough — walang labis, walang kulang.

Sapat is a mobile-first web prototype designed to eliminate food waste in school canteens through **controlled daily preparation** and **advance student pre-orders**.

---

## 🚀 How to Run Locally

1. Simply double-click and open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox).
2. No servers, node modules, build steps, or internet connection required (100% Vanilla HTML5, CSS3, and JavaScript with LocalStorage persistence).

---

## 📱 Role Demonstration Features

The prototype features a **top switcher bar** and **modal selector** allowing real-time switching between roles:

### 🎓 1. Student Experience
- **Home**: Welcome greeting, live kitchen status badge, today's meal reservation rate, featured meals carousel, and quick pre-order links.
- **Menu**: Category filters (*Kanin at Ulam*, *Meryenda*, *Gulay & Healthy*, *Inumin*), real-time search, visual servings gauge showing portion limits, and instant add-to-cart.
- **Meal Details**: Modal view with ingredients, prep notes, stock status, and quantity stepper.
- **Cart & Checkout**: Strict remaining stock validation, pickup time slot selection (*9:45 AM Recess*, *11:30 AM Lunch 1*, *12:15 PM Lunch 2*, *3:00 PM Snack*), kitchen notes, and instant pre-order confirmation.
- **My Orders**: Real-time 5-stage order tracker (*Ordered → Confirmed → Cooking → Ready → Claimed*), pickup pass QR simulation, and cancellation (which immediately refunds reserved portions back to the canteen).
- **Profile**: Student info, personal food waste saved metrics, and Sapat philosophy.

### 👨‍🍳 2. Canteen Vendor Experience (Mobile-Optimized for Kitchen Staff)
- **Dashboard**: Live KPIs (*Total Orders, Target Prep Limit, Reserved Servings, Projected Sales*), urgent low-stock alerts, and smart demand forecasts.
- **Manage Menu**: Toggle item availability ON/OFF (immediately hides/shows in student app), add new dishes, and configure prices & preparation ceilings.
- **Manage Orders**: Incoming student preorders feed with one-touch kitchen workflow buttons (*Confirm Preorder → Mark Preparing → Ready for Pickup → Completed* or *Decline* with instant stock restoration).
- **Preparation Management**: The core feature of Sapat — Kitchen Prep Matrix showing daily limits, reserved portions, simulated historical demand targets, and quick batch quota adjustment buttons (`-5`, `+5`, `+10`).
- **Vendor Profile**: Canteen information, operating schedule, kitchen preparation accuracy rate, and reset demo data.

---

## 🔒 Core Logic & Rules
- **No Over-Ordering**: Students cannot order beyond the remaining portion quota.
- **Sold Out Safeguard**: When a dish hits its daily preparation limit, it instantly locks and displays `SOLD OUT` with disabled action buttons.
- **Instant Stock Sync**: Pre-orders and cancellations immediately update the shared LocalStorage state across both student and vendor interfaces.
- **Zero-Waste Focus**: Focuses strictly on advance demand control and controlled daily cooking targets.

