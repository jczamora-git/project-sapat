# Sapat — Smart Food Pre-ordering & Preparation Management for School Canteens

> **"Sapat"** *(Tagalog)*: Sufficient, just enough — walang labis, walang kulang.

Sapat is a mobile-first web prototype designed to eliminate food waste in school canteens through **controlled daily preparation** and **advance student pre-orders** across multiple independent canteen stalls.

---

## 🚀 How to Run Locally

1. Simply double-click and open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox).
2. No servers, node modules, build steps, or internet connection required (100% Vanilla HTML5, CSS3, and JavaScript with LocalStorage persistence).

---

## 🏪 5 Selectable Canteen Vendors

Each vendor has their own dedicated menu, preparation quotas, and incoming student orders:

1. **Ate Lita's Kitchen (Stall #3)** — *Lutong Bahay & Homestyle Rice Meals*
   - Chicken Adobo – ₱65
   - Pork Sinigang sa Sampalok – ₱70
   - Crispy Lumpiang Shanghai – ₱45
2. **Kuya Ben's Silog Meals (Stall #1)** — *All-Day Silog & Breakfast*
   - Tapsilog – ₱85
   - Hotsilog – ₱60
   - Longsilog – ₱75
3. **Nanay Cora's Lutong Bahay (Stall #2)** — *Traditional Ulam & Healthy Veggies*
   - Pork Giniling – ₱60
   - Ginisang Monggo – ₱45
   - Fried Fish Meal – ₱70
4. **Green Bowl Express (Stall #4)** — *Healthy & Rice Bowls*
   - Chicken Teriyaki Rice – ₱85
   - Tofu Veggie Bowl – ₱65
   - Tuna Rice Bowl – ₱75
5. **Merienda ni Aling Tess (Stall #5)** — *Snacks & Merienda*
   - Pancit Bihon – ₱40
   - Turon – ₱20
   - Cheese Lumpia – ₱35

---

## 📱 Role Demonstration Features

### 🎓 1. Student Experience
- **Explore Canteens**: Visually attractive cards for all 5 stalls displaying stall number, food specialty, open status, and remaining portions available. Tapping any stall card instantly filters the menu to ONLY that vendor.
- **Menu with Canteen Switcher**: Easily switch between "All Canteens" or browse specific stalls with one-tap tab pills. Real-time daily portion gauges show exact remaining kitchen quotas.
- **Featured Meals with Vendor Identification**: Top dishes displayed with their corresponding stall badges.
- **Cart & Multi-Vendor Checkout**: Grouped by stall with strict kitchen batch quota validation.
- **My Orders**: Real-time 5-stage order tracker displaying stall name and pickup window, pickup pass QR with counter window details, and cancellation with instant portion refunds.
- **Profile**: Student info, personal food waste saved metrics, and Sapat philosophy.

### 👨‍🍳 2. Canteen Vendor Experience (Mobile-Optimized for Kitchen Staff)
- **Demo Vendor Account Switcher**: Easily switch between all 5 vendor accounts from any vendor tab or through the Role Modal.
- **Isolated Vendor Dashboard**: Live KPIs (*Total Orders, Target Prep Limit, Reserved Servings, Projected Sales*), urgent stock alerts, and personalized simulated demand forecasts strictly for the active vendor.
- **Manage Menu**: Toggle item availability ON/OFF (hides/shows in student app), add new dishes, and configure daily preparation ceilings for this stall.
- **Manage Orders**: Incoming preorders feed filtered strictly to this stall with one-touch kitchen workflow buttons (*Confirm Preorder → Mark Preparing → Ready for Pickup → Completed* or *Decline* with instant stock restoration).
- **Preparation Management**: The core feature of Sapat — Kitchen Prep Matrix showing daily limits, reserved portions, simulated demand targets, and quick batch quota adjustment buttons (`-5`, `+5`, `+10`).
- **Vendor Profile**: Stall operating schedule, pickup counter information, and kitchen accuracy metrics.

---

## 🔒 Core Logic & Rules
- **No Over-Ordering**: Students cannot order beyond a dish's remaining portion quota.
- **Sold Out Safeguard**: When a dish hits its daily preparation limit, it instantly locks and displays `SOLD OUT` with disabled action buttons.
- **Strict Vendor Isolation**: Changes made by one vendor (menu edits, quota adjustments, order cancellations) never affect another vendor's inventory.
- **Zero-Waste Focus**: Focuses strictly on advance demand control and controlled daily cooking targets.
