# MediLink — Pharmaceutical Distribution Management System

## 📋 Project Overview

**MediLink** is a full-stack web application designed for managing pharmaceutical distribution between a central distributor (admin) and retail pharmacies (retailers). It provides a comprehensive ERP-style platform for managing products, orders, inventory, payments, and generating business reports.

### Key Features
- **Role-based access control** — Admin and Retailer roles with separate dashboards
- **Product & Category management** — Full CRUD with stock tracking
- **Order workflow** — Retailers place orders → Admin confirms → Stock auto-deducted → Delivery tracking
- **Inventory management** — Real-time stock levels, low-stock alerts, inventory changelog
- **Payment tracking** — Record payments, upload receipts, admin verification
- **Reports & Analytics** — Dashboard stats, monthly revenue charts, retailer reports, daily/sales reports, PDF export

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 7 |
| **UI Framework** | Material UI (MUI) v7 |
| **Routing** | React Router v7 |
| **State Management** | React Context API |
| **HTTP Client** | Axios |
| **Charts** | Recharts |
| **PDF Generation** | jsPDF + jspdf-autotable |
| **Date Handling** | Day.js + MUI X Date Pickers |
| **Notifications** | React Toastify |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB |
| **ODM** | Mongoose 8 |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hashing** | bcryptjs |
| **File Upload** | Multer |
| **Validation** | express-validator |
| **Security** | Helmet + CORS |
| **Logging** | Morgan |

---

## 📁 Project Structure

```
Mani_fyp/
├── project_overview.md       # This file
│
├── backend/                  # Node.js + Express API server
│   ├── .env                  # Environment variables (MongoDB URI, JWT secret)
│   ├── package.json          # Backend dependencies
│   ├── uploads/              # Uploaded receipt images
│   └── src/
│       ├── server.js         # Express app entry point
│       ├── seed.js           # Database seeder script
│       ├── config/
│       │   └── database.js   # MongoDB/Mongoose connection
│       ├── middleware/
│       │   ├── auth.js       # JWT authentication & role guards
│       │   ├── upload.js     # Multer file upload config
│       │   └── validate.js   # Express-validator middleware
│       ├── models/           # Mongoose schemas
│       │   ├── index.js      # Model exports
│       │   ├── User.js       # User schema (admin/retailer)
│       │   ├── Retailer.js   # Retailer profile (linked to User)
│       │   ├── Category.js   # Product categories
│       │   ├── Product.js    # Medicine/product catalog
│       │   ├── Order.js      # Orders
│       │   ├── OrderItem.js  # Line items within orders
│       │   ├── Payment.js    # Payment records
│       │   └── Inventory.js  # Inventory change logs
│       ├── controllers/      # Business logic
│       │   ├── authController.js       # Login, register, profile
│       │   ├── retailerController.js   # CRUD retailers (admin)
│       │   ├── categoryController.js   # CRUD categories
│       │   ├── productController.js    # CRUD products, stock management
│       │   ├── orderController.js      # Place/manage orders
│       │   ├── paymentController.js    # Record/verify payments
│       │   ├── inventoryController.js  # Inventory logs & alerts
│       │   └── reportController.js     # Dashboard stats & reports
│       └── routes/           # Express route definitions
│           ├── authRoutes.js
│           ├── retailerRoutes.js
│           ├── categoryRoutes.js
│           ├── productRoutes.js
│           ├── orderRoutes.js
│           ├── paymentRoutes.js
│           ├── inventoryRoutes.js
│           └── reportRoutes.js
│
└── frontend/                 # React + Vite SPA
    ├── package.json          # Frontend dependencies
    ├── index.html            # HTML entry point
    ├── vite.config.js        # Vite configuration
    └── src/
        ├── main.jsx          # React app entry
        ├── App.jsx           # Root component with routing
        ├── theme.js          # MUI theme customization
        ├── index.css         # Global styles
        ├── App.css           # App-level styles
        ├── context/
        │   └── AuthContext.jsx    # Authentication state
        ├── services/
        │   └── api.js             # Axios API client + all endpoints
        ├── components/
        │   ├── common/
        │   │   └── ProtectedRoute.jsx  # Role-based route guard
        │   └── layout/
        │       └── DashboardLayout.jsx # Sidebar + top bar layout
        └── pages/
            ├── Profile.jsx         # Shared profile page
            ├── auth/
            │   ├── Login.jsx       # Login page
            │   └── Register.jsx    # Registration page
            ├── admin/
            │   ├── AdminDashboard.jsx      # Admin dashboard with stats
            │   ├── RetailerManagement.jsx  # Manage retailers
            │   ├── CategoryManagement.jsx  # Manage categories
            │   ├── ProductManagement.jsx   # Manage products
            │   ├── OrderManagement.jsx     # View/manage all orders
            │   ├── InventoryManagement.jsx # Inventory logs & alerts
            │   ├── PaymentManagement.jsx   # View/verify payments
            │   └── ReportManagement.jsx    # Sales reports & PDF export
            └── retailer/
                ├── RetailerDashboard.jsx   # Retailer dashboard
                ├── BrowseProducts.jsx      # Browse product catalog
                ├── PlaceOrder.jsx          # Cart & order placement
                ├── MyOrders.jsx            # View own order history
                └── RetailerPayments.jsx    # View and pay outstanding balances
```

---

## 🗄️ Database Schema (MongoDB)

### Collections & Relationships

```
Users ──┬── 1:1 ──── Retailers (profile info for retailer users)
        ├── 1:N ──── Orders (retailer places orders)
        └── 1:N ──── Payments (retailer's payments)

Categories ──── 1:N ──── Products

Products ──┬── 1:N ──── OrderItems
           └── 1:N ──── Inventory (stock change logs)

Orders ──┬── 1:N ──── OrderItems
         ├── 1:N ──── Payments
         └── 1:N ──── Inventory (order-related stock changes)
```

### Collection Details

| Collection | Key Fields | References |
|-----------|-----------|------------|
| **users** | userId, name, email, password, role (admin/retailer), phone, isActive | — |
| **retailers** | shopName, address, city, state, pincode, gstNumber, drugLicenseNumber | userId → User |
| **categories** | name, description, isActive | — |
| **products** | name, description, price, costPrice, stockQuantity, lowStockThreshold, expiryDate, manufacturer, batchNumber, isActive | categoryId → Category |
| **orders** | orderNumber, status, totalAmount, discountPercent, discountAmount, finalAmount, paymentDueDate, paymentStatus (unpaid/partial/paid), shippingAddress, notes, orderDate, confirmedAt, deliveredAt, paidAt | retailerId → User |
| **orderitems** | quantity, unitPrice, totalPrice | orderId → Order, productId → Product |
| **payments** | amountCollected, paymentMethod, paymentDate, receiptImage, notes, isVerified, verifiedAt | orderId → Order, retailerId → User, verifiedBy → User |
| **inventories** | changeType (addition/deduction/adjustment), quantityChanged, previousQuantity, newQuantity, reason | productId → Product, orderId → Order, updatedByUserId → User |

---

## 🔗 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register retailer account |
| POST | `/login` | No | Login |
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/change-password` | Yes | Change password |

### Retailers (`/api/retailers`) — Admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all retailers |
| GET | `/:id` | Get retailer details |
| POST | `/` | Create retailer |
| PUT | `/:id` | Update retailer |
| DELETE | `/:id` | Delete retailer |

### Categories (`/api/categories`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List all categories |
| GET | `/:id` | Yes | Get category |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Products (`/api/products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | List active products (with search/filter) |
| GET | `/admin/all` | Admin | List all products (incl. inactive) |
| GET | `/low-stock` | Admin | Get low stock products |
| GET | `/:id` | Yes | Get product details |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| PUT | `/:id/stock` | Admin | Update stock quantity |
| DELETE | `/:id` | Admin | Soft-delete product |

### Orders (`/api/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Retailer | Place new order |
| GET | `/my-orders` | Retailer | Get own orders |
| GET | `/` | Admin | List all orders (with filters) |
| GET | `/pending-payments` | Admin | List all unpaid/pending orders grouped by retailer |
| GET | `/:id` | Yes | Get order details |
| PUT | `/:id/status` | Admin | Update order status (with optional discount & due date on confirm) |
| PUT | `/:id/payment-status` | Admin | Update payment status (unpaid/partial/paid) |
| PUT | `/:id/pay` | Retailer | Pay for an order by the retailer |

### Payments (`/api/payments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Record payment (with receipt upload) |
| GET | `/` | Admin | List all payments |
| PUT | `/:id/verify` | Admin | Verify payment |
| GET | `/order/:orderId` | Yes | Get payments for an order |

### Inventory (`/api/inventory`) — Admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs` | Get inventory change logs |
| GET | `/low-stock` | Get low stock alerts |
| GET | `/summary` | Get inventory summary stats |

### Reports (`/api/reports`) — Admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard stats & monthly revenue |
| GET | `/retailer` | Retailer-specific sales report |
| GET | `/daily` | Daily sales report |
| GET | `/sales` | Overall sales report with top products |
| GET | `/orders/pending-payments` | Pending payments report for retailers |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medilink
JWT_SECRET=medilink_super_secret_key_2024_xK9mP2nQ
JWT_EXPIRES_IN=24h
UPLOAD_DIR=uploads
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on port 27017 (or a remote MongoDB URI)

### Backend Setup
```bash
cd backend
npm install
npm run seed      # Seeds database with sample data
npm run dev       # Starts backend on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev       # Starts frontend on http://localhost:5173
```

### Default Login Credentials (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medilink.com | admin123 |
| Retailer | rajesh@pharmacy.com | retailer123 |
| Retailer | priya@medplus.com | retailer123 |

---

## 🔄 Application Workflow

### Order Lifecycle
1. **Retailer** browses products and places an order (status: `pending`, no upfront payment needed)
2. **Admin** reviews the order and can:
   - Apply a **discount percentage** (0-100%) — the discounted final amount is auto-calculated
   - Set a **payment due date** — retailer can pay by this date
   - Then **confirms** the order (status: `confirmed`)
   - Stock is automatically deducted from inventory
   - Inventory log entries created
3. **Admin** marks order as delivered (status: `delivered`)
4. At any point before delivery, order can be cancelled (status: `cancelled`)
5. **Admin** can update payment status (unpaid → partial → paid) at any time after confirmation

### Payment Flow (Credit-Based)
1. Orders are placed **without instant payment** — retailers pay later
2. When confirming, admin sets a **discount** and **payment due date**
3. Retailer sees the discounted amount and due date in their orders and the **Payments tab**
4. **Retailer** can click **"Pay Now"** on unpaid orders to clear their balance and record the payment immediately
5. **Admin** marks payment as `partial` or `paid` when received manually if the retailer didn't use self-service payment
6. **Admin** can view a global **Pending Balances** dashboard and generate a pending payments PDF report
7. Overdue payments are highlighted in both admin and retailer views
8. Separate payment module allows recording payments with receipt uploads

### Inventory Management
- Stock levels update automatically when orders are confirmed
- Admin can manually adjust stock (addition/deduction/adjustment)
- Low stock alerts when `stockQuantity ≤ lowStockThreshold`
- Full audit trail via inventory change logs

---

## 🛡️ Security Features
- **JWT Authentication** — Token-based auth with configurable expiry
- **Password Hashing** — bcryptjs with 12 salt rounds
- **Role-based Access Control** — Admin and Retailer middleware guards
- **Input Validation** — express-validator on all endpoints
- **HTTP Security Headers** — Helmet middleware
- **CORS** — Configurable cross-origin resource sharing
- **Password hidden from responses** — `toJSON()` override strips password field

---

## 📝 Notes
- The application uses a **credit-based payment model** — retailers can order without instant payment and pay later by the admin-set due date.
- MongoDB transactions have been removed for compatibility with standalone MongoDB instances. Operations run sequentially instead.
- File uploads (payment receipts) are stored in the `backend/uploads/` directory and served as static files.
- The frontend communicates with the backend via the Axios API client defined in `frontend/src/services/api.js`.
