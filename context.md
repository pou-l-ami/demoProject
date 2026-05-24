# Context Manual - Intelligent MERN & Python ML Event Recommender

This document provides a comprehensive overview of the **Smart Event Recommendation, Booking, & Payment Management System**. It outlines the full-stack architecture, database fallbacks, payment flows, administrative rules, and the global responsive design system.

---

## 🌟 Platform Core Features

### 1. AI-Powered Smart Recommendation
- **Natural Language Vectorization**: Implements **Scikit-Learn TF-IDF (`TfidfVectorizer`)** to capture semantic matching between user themes (e.g., *Wedding*, *Anniversary*, *Corporate*) and vendor packages, even in the absence of explicit categories.
- **Multi-Criteria Optimization**: Uses **Pandas** to compute matching scores based on:
  - **Location Compatibility**: Strict filter based on selected city (including full support for **Kolkata**!).
  - **Guest Capacity Matching**: Excludes undersized spaces and penalizes heavily oversized spaces.
  - **Sub-Budget Allocations**: Distributes the user's budget proportionally (**Venue 40%**, **Catering 30%**, **Decoration 20%**, **Products 10%**), ranking entries higher when they match or slide under their budget ceilings.
- **Dynamic Projections**: Displays an interactive analytical breakdown showing exact percentage-based budget metrics, health badges, and total estimates.

### 2. Connected Database Cart & Checkout
- **Instant Product Carting**: Recommended rental products inside the AI dashboard feature direct **Add to Cart** triggers. The Express server dynamically aligns recommendation items with database product IDs (auto-seeded or fallback matched), letting users add them instantly to their cart!
- **One-Click Event Booking**: Users can lock in their entire AI-curated matching block (Venue + Caterer + Decorator + Products) in one click using the **Book Curated Event** button. This creates a `Booking` entry mapping all estimates and specs.

### 3. Integrated Razorpay Payments
- **Seamless Order Creation**: Integrates Razorpay (`razorpay` npm package) to create secure order IDs mapping to bookings.
- **Instant Signature Verification**: Secures checkouts by comparing expected signature hashes using Node's native `crypto` module (`sha256`).
- **Payment tracking**: Successfully logs transactions and marks bookings as `paid` and `confirmed` upon verification, displaying invoicing summaries in both customer and administrative dashboards.

### 4. Admin Management Dashboard
- **Comprehensive Summary stats**: Aggregates booking totals, earnings, and statuses.
- **Dynamic Reservations Control**: Review all reservations, update status (Pending, Confirmed, Cancelled), and update payment specifications (Unpaid, Partial, Paid) with instant live catalog syncs.
- **Inventory Stock Management**: Administrators can monitor and update the availability and pricing of rental products, ensuring smooth item rentals.

### 5. Animated Light & Dark Mode
- **Smooth Global Transitions**: Integrates a responsive dark theme toggle button in the header. Applications transitions cleanly across the entire canvas with glowing borders, clean font color scaling, and custom tables in dark mode.

---

## 🛠️ Full-Stack Technology Stack

| Component | Technology | Primary Function |
| :--- | :--- | :--- |
| **Frontend** | React.js, Reactstrap, Axios | Responsive glassmorphic UI, dynamic sliders, SweetAlert2 alerts, PDF exporting via `jspdf` |
| **Backend API** | Node.js + Express.js | Spawns ML engines, connects to DB, exposes cart and booking CRUD routes, handles Razorpay orders |
| **ML Engine** | Python Flask, Pandas, Scikit-Learn | Exposes `/recommend` endpoints, conducts TF-IDF text similarity and multi-criteria mathematical sorting |
| **Database** | MongoDB & Mongoose | Models users, bookings, products, carts, and transactions |
| **Payments** | Razorpay SDK | Real-time secure financial checkout validation |

---

## 🔒 Offline Demo Mode & Safeguard Architecture

To ensure your application is **completely robust and runs successfully in any network or whitelisting environment**, we engineered an **Offline Demo Mode Fallback**:

### 1. Database Connection Bypass
If your MongoDB Atlas cluster connection is blocked by whitelisting or offline:
- The Express server automatically switches to an in-memory database (`global.mockUsers`, `global.mockBookings`, `global.mockCarts`).
- **Registration**: Register *any* username/email and password immediately without failing!
- **Default Credentials**: You can log in instantly with these preseeded test accounts:
  - **Admin**: `admin@evenza.com` (password: `admin123`)
  - **User**: `user@evenza.com` (password: `user123`)

### 2. Razorpay Signature Fallback
If you attempt a payment in My Bookings but Razorpay API credentials are not yet configured in `.env`:
- The server generates a safe `order_mock_...` tracking order.
- The browser Razorpay module initiates a successful test payment, returning mock order signatures that the backend automatically verifies.
- This ensures that you can test the **full checkout flow, bookings updates, and invoices** without any API key setup!

---

## 🔧 Resolved Issues & Fixes

### 1. Authentication Check Bypass (Cookie Validation Fix)
- **Problem**: When logging in under Offline Demo Mode, the server generated a valid JWT token but failed to set the `accessToken` HTTP-only cookie on the response. Because of this, subsequent calls to protected routes (like cart retrieval `/api/cart`, user bookings `/api/v1/booking/my-bookings`, or admin dashboards) failed with a `401 You are not authenticated` error.
- **Fix**: Updated `authController.js` in the offline login branch to execute `res.cookie('accessToken', token, { httpOnly: true, ... })` identical to the online flow. This successfully persists the session cookie in the browser, making the cart, booking tracker, payment panels, and admin controls 100% operational in both modes.

### 2. "Database Match Missing" (Product ID Resolution Fix)
- **Problem**: Recommended products returned from the CSV dataset via Python Flask do not natively have MongoDB `_id` values. When the database was offline or the catalog was unseeded, the backend failed to map these products, returning recommended items with an empty `_id`. Clicking "Add to Cart" threw a "Database Match Missing" error.
- **Fix**: Enhanced the mapping logic inside `recommendationController.js`. It now evaluates `mongoose.connection.readyState`. If MongoDB is offline or unseeded, it queries the offline `mockProductsList` as a fallback, successfully mapping valid IDs (e.g. `mock_prod_4`) to every item in the recommendation deck. Clicking "Add to Cart" now operates smoothly.

---

## 🚀 Step-by-Step Testing & Verification Guide

### Step 1: Fire up the servers
Make sure both servers are running. 
- Backend: `npm start` in the `server/` directory (automatically launches Flask ML on port `5000`!).
- Frontend: `npm start` in the `client/` directory.

### Step 2: Test User Booking & Cart Addition
1. Log in as a User: `user@evenza.com` with `user123` (or register a fresh account!).
2. Go to **Events (AI Recommend)**.
3. Configure your search: Select **Kolkata**, Select **Engagement 🤝**, set Guests to **170**, and Budget to **₹1,500,000**.
4. Press **Get Smart Matches** to calculate allocations.
5. In the Recommended Products grid: Click **Add to Cart** on any item. Choose **Go to Shopping Cart** in the SweetAlert pop-up to see the item successfully carted!
6. Go back to the Recommendations page and click the green **Book Curated Event** button. Click **Go to My Bookings**.
7. In the bookings list, click **Pay Now** to execute the Razorpay signature verification and mark the reservation as `paid` and `confirmed`!

### Step 3: Test Admin Bookings & Stock Management
1. Click **Logout** at the top right, and log in as Admin: `admin@evenza.com` with `admin123`.
2. Notice the new **Admin Panel** link that appears in the Header navbar!
3. Click **Admin Panel** to see:
   - **Dashboard**: Aggregated statistics, booking counts, and total paid revenue.
   - **Bookings**: Toggle and edit statuses (e.g. mark event bookings as Confirmed/Paid) and press **Save**.
   - **Edit Stock**: Update product rental rates and inventories in real time.
