# 🛒 OmniRetail Backend — Beginner-Friendly MVC Guide

Welcome to the **OmniRetail Backend**! This server is built using **Node.js**, **Express**, and **MongoDB (Mongoose)** following the clean, industry-standard **Model-View-Controller (MVC)** architectural pattern.

Whether you are completely new to backend development or looking to understand how production APIs are structured, this guide explains every part of the codebase step-by-step.

---

## 📚 What is the MVC Architecture?

**MVC** stands for **Model - View - Controller**. It is a software design pattern that separates code into distinct responsibilities so that projects are organized, easy to test, and simple to maintain.

```
Incoming Request from Frontend
            │
            ▼
   ┌─────────────────┐
   │    src/app.js   │ ── Attaches global security, parsers, and logging
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │   src/routes/   │ ── [ROUTING / DISPATCHER]
   │   (e.g. users)  │    Directs URL endpoints to the right controller
   └────────┬────────┘
            │
            ├─► [src/middlewares/] ── Checks authentication & permissions
            │
            ▼
   ┌─────────────────┐
   │src/controllers/ │ ── [CONTROLLER - The Brain]
   │                 │    Validates input and coordinates business logic
   └────────┬────────┘
            │
            ├─► [src/models/] ──── [MODEL - The Data Blueprint]
            │                      Defines MongoDB schema and queries
            ▼
   ┌─────────────────┐
   │  JSON Response  │ ── [VIEW - In REST APIs, the structured JSON payload]
   └─────────────────┘
```

### 1. Model (`src/models/`)
* **What it does:** Represents your data structures and talks to MongoDB.
* **Analogy:** The blueprint and filing cabinet.
* **Examples:** [user.model.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/models/user.model.js), [product.model.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/models/product.model.js).

### 2. View (JSON API Responses)
* **What it does:** In traditional web apps, the view is an HTML webpage. In a modern **REST API**, the "View" is the clean, structured **JSON response** sent back to React, mobile apps, or other clients.
* **Format:** `{ success: true, ...data }` or `{ success: false, message: '...' }`.

### 3. Controller (`src/controllers/`)
* **What it does:** The "brain" of each feature. It handles the incoming request (`req`), validates the data, asks the Model to fetch or update the database, and sends the response (`res`).
* **Analogy:** A waiter at a restaurant who takes your order, brings it to the kitchen (Model/Database), and serves you the food (Response).
* **Examples:** [user.controller.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/controllers/user.controller.js), [negotiation.controller.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/controllers/negotiation.controller.js).

### 4. Routes (`src/routes/`)
* **What it does:** Maps specific URLs and HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to their corresponding controller functions.
* **Analogy:** The restaurant menu showing what dishes can be ordered.
* **Central Hub:** [routes/index.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/routes/index.js) groups all individual route files into one master router.

### 5. Middlewares (`src/middlewares/`)
* **What it does:** Functions that inspect and modify requests **before** they reach the controller.
* **Examples:**
  * [auth.middleware.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/middlewares/auth.middleware.js): Verifies JSON Web Tokens (`protect`) and restricts routes by role (`authorize`).
  * [error.middleware.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/middlewares/error.middleware.js): Catches 404s and server errors cleanly.

---

## 📁 Directory Layout

```
backend/
├── .env.example              # Template for environment variables (copy to .env)
├── package.json              # Project dependencies and npm scripts
├── seed.js                   # Standalone database reset & demo data generator
├── vercel.json               # Deployment configuration for Vercel Serverless
└── src/
    ├── index.js              # Server entry point: loads .env and starts HTTP listener
    ├── app.js                # Express app setup: middlewares, routes, error handling
    ├── config/
    │   ├── db.js             # Mongoose MongoDB connection & pooling
    │   └── passport.js       # Google OAuth 2.0 Passport configuration
    ├── models/               # [M in MVC] Mongoose schemas and data validation
    │   ├── user.model.js
    │   ├── product.model.js
    │   ├── order.model.js
    │   ├── negotiation.model.js
    │   ├── customer.model.js
    │   └── store.model.js
    ├── controllers/          # [C in MVC] Business logic functions
    │   ├── user.controller.js
    │   ├── product.controller.js
    │   ├── order.controller.js
    │   ├── negotiation.controller.js
    │   ├── customer.controller.js
    │   ├── store.controller.js
    │   └── dashboard.controller.js
    ├── routes/               # URL route definitions
    │   ├── index.js          # Master router aggregating all routes
    │   ├── user.routes.js
    │   ├── product.routes.js
    │   ├── order.routes.js
    │   ├── negotiation.routes.js
    │   ├── customer.routes.js
    │   ├── store.routes.js
    │   └── dashboard.routes.js
    ├── middlewares/          # Request interceptors
    │   ├── auth.middleware.js
    │   └── error.middleware.js
    └── utils/                # Helper utilities
        └── generateToken.js  # Signs JWT tokens for logged-in users
```

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
Open your terminal in the `backend/` folder:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file and create your `.env` file:
```bash
cp .env.example .env
```
Open `.env` and verify your settings. A ready-to-use cloud MongoDB database is already set as a fallback in [src/config/db.js](file:///c:/Users/Saptak/Desktop/setproj1/omni2.0/backend/src/config/db.js) for quick development testing!

### 3. Seed Demo Data (Optional but Recommended)
Populate your database with test products, stores, orders, and user accounts:
```bash
npm run seed
# or
node seed.js
```
**Test Credentials created by the seeder:**
* 👤 **Customer:** `customer@test.com` / `test123`
* 🏪 **Retailer:** `retailer@test.com` / `test123`

### 4. Start the Server
* **Development mode** (auto-reloads on file changes):
  ```bash
  npm run dev
  ```
* **Standard mode**:
  ```bash
  npm start
  ```
The server will start at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/v1/health`

---

## 🔌 API Endpoint Reference

All endpoints are prefixed with both `/api/v1` and `/v1`.

### 🔐 Authentication & Users (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register customer or retailer |
| `POST` | `/login` | Public | Log in with email & password |
| `GET` | `/profile` | Private | Get logged-in user profile |
| `PUT` | `/profile` | Private | Update logged-in user profile |
| `POST` | `/api-key` | Retailer | Generate automated API key |
| `GET` | `/auth/google` | Public | Start Google OAuth login flow |
| `GET` | `/auth/google/callback` | Public | Google OAuth redirect callback |

### 📦 Products (`/api/v1/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Private | List products (with `?category=` and `?search=`) |
| `GET` | `/:id` | Private | Get single product by ID |
| `POST` | `/` | Retailer | Create a new product |
| `PUT` | `/:id` | Retailer | Update an existing product |
| `POST` | `/import` | Retailer | Bulk import products via JSON array |

### 🤖 AI Negotiations (`/api/v1/negotiations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Private | List all active negotiations |
| `POST` | `/` | Private | Start a negotiation session for a product |
| `GET` | `/:id` | Private | Get negotiation details and chat history |
| `POST` | `/:id/message` | Private | Send a price counter-offer to the AI bot |
| `PUT` | `/:id/accept` | Private | Accept current price & generate Order |
| `PUT` | `/:id/reject` | Private | Reject negotiation session |

### 📋 Orders (`/api/v1/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stats` | Private | Get order KPI counts for dashboard |
| `GET` | `/` | Private | List orders (with `?status=` and `?search=`) |
| `PUT` | `/:id/status` | Private | Update order status (Processing, Shipped, etc.) |

### 👥 Customers (`/api/v1/customers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stats` | Retailer | Get CRM analytics (active, total, avg spend) |
| `GET` | `/` | Retailer | List customers (with `?search=`) |

### 🏪 Stores (`/api/v1/stores`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/nearby` | Public | Find nearest stores using GPS `?lat=&lng=&radius=` |
| `GET` | `/:storeId/stock/:productId` | Public | Check in-store inventory and aisle location |
| `POST` | `/seed` | Public | Seed default store locations |

### 📊 Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stats` | Retailer | Fetch KPI metrics (offers, acceptance rate) |
| `DELETE` | `/factory-reset` | Retailer | Wipe demo collections for clean testing |

---

## 💡 Developer Tips

1. **How to add a new endpoint?**
   - **Step 1:** If you need a new data entity, create a Mongoose schema in `src/models/myentity.model.js`.
   - **Step 2:** Write your business logic function in `src/controllers/myentity.controller.js`.
   - **Step 3:** Define your URL path in `src/routes/myentity.routes.js`.
   - **Step 4:** Mount your router in `src/routes/index.js`.
2. **How to protect a route?**
   - Import `protect` from `src/middlewares/auth.middleware.js` and add it before your controller function in the route definition:
     ```javascript
     router.get('/secret', protect, myController);
     ```
3. **How to restrict to retailers?**
   - Add `authorize('retailer')` right after `protect`:
     ```javascript
     router.post('/admin-only', protect, authorize('retailer'), myAdminController);
     ```
