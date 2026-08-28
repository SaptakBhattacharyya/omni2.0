# 📦 OmniRetail — The Future of Phygital Commerce

<img width="1918" height="870" alt="image" src="https://github.com/user-attachments/assets/998e9a41-c322-4df3-844e-3fde33093baf" /> <br/> <br/>
<img width="1917" height="870" alt="image" src="https://github.com/user-attachments/assets/a688f009-c9b4-4e4c-8c3c-49761eb39b12" />



[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://www.mongodb.com/mern-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Development-orange?style=for-the-badge)]()

OmniRetail is a cutting-edge **Phygital (Physical + Digital)** commerce platform designed to bridge the gap between offline inventory uncertainty and online pricing rigidity. By unifying real-time physical store inventory visibility with an AI-powered price negotiation engine, OmniRetail empowers both consumers and retailers.

---
UI/UX link : https://www.figma.com/proto/wKJxGXyaNh73Bxtp85UrNf/Untitled?page-id=19%3A3&node-id=50-1080&p=f&viewport=-2486%2C565%2C0.78&t=dacZZSEY3vB82TKX-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=50%3A652  <br>
deployment link : https://omni2-0-ymx3.vercel.app/  <br>
documentation link : https://documenter.getpostman.com/view/50841251/2sBXqJLLqV  <br>
youtube link: https://youtu.be/H9lBS77Kyr0?si=3Z0b1xRSHSTZenq_
---

## 🚀 Key Value Propositions

- **Offline Inventory Transparency**: No more wasted trips. Look up real-time, shelf-level inventory for local physical stores.
- **Dynamic Price Negotiation**: Bring the power of bargaining to e-commerce. Negotiate prices in real-time with our automated AI engine.
- **Unified Retail Intelligence**: A single platform serving consumer discovery and advanced retailer analytics.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Zustand, React Query |
| **Backend** | Node.js 20, Express (MVC), Mongoose |
| **Database** | MongoDB Atlas, Redis (Caching/Rate Limiting) |
| **Real-time** | Socket.io (Inventory Push, Live Negotiation) |
| **Security** | JWT (Sessions), SHA-256 Hashed API Keys, Bcrypt |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## ✨ Core Features

### 🔍 Store Locator & Real-Time Stock
*   **Geo-Search**: Find stores within a specific radius using browser geolocation.
*   **Shelf-Level Accuracy**: View exactly where an item is (Aisle/Shelf) and its current stock status.
*   **Live Updates**: Inventory changes sync instantly via Socket.io broadcast.

### 💬 AI-Powered Negotiation Room
*   **Live Bargaining**: Initiate a negotiation session for any enabled product.
*   **Intelligent Counter-Offers**: Rule-based pricing engine that responds based on stock levels, expiry dates, and bulk tiers.
*   **Expiration Logic**: Sessions are time-limited (TTL) to encourage immediate conversion.

### 📊 Retailer Command Center
*   **Inventory Manager**: Direct sync with POS/ERP systems via secured API keys.
*   **Negotiation Analytics**: Track acceptance rates and average discounts to optimize pricing strategies.
*   **Product Lifecycle**: Manage listings, toggle negotiation flags, and set bulk discount tiers.

---

## 🏗️ System Architecture

OmniRetail follows a strict **Model-View-Controller (MVC)** pattern on the backend and a component-driven architecture on the frontend.

```text
backend/
├── models/       # MongoDB Schemas (User, Product, Store, Inventory, Negotiation)
├── controllers/  # Thin Logic Handlers
├── routes/       # API Versioning (v1)
├── services/     # Heavy Business Logic (Pricing Engine, Geo-Search)
└── middleware/   # Security (JWT, API Key, Rate Limiter)

frontend/
├── api/          # Axios Interceptors & Endpoint Definitions
├── components/   # Atomic UI System
├── store/        # Zustand State Management (Auth, Cart)
└── pages/        # Route-level Views (Home, Search, Room, Dashboard)
```

---

## 🔐 Security & Reliability

- **Dual-Auth System**: JWT for consumer sessions and SHA-256 hashed API keys for Retailer integrations (POS/ERP).
- **Rate Limiting**: Redis-backed protection against brute force and DDoS attacks.
- **Data Integrity**: NoSQL injection prevention and strict schema validation using Joi.
- **Performance**: <200ms response time for cached inventory lookups.

---

## 📅 Roadmap (14-Week Plan)

1.  **Phases 1-2**: Foundation & Inventory Engine (Auth, Scaffolding, Redis Sync).
2.  **Phases 3-4**: Pricing Engine & Frontend Core (Negotiation Logic, Vite Setup).
3.  **Phases 5-6**: Feature Implementation (Live Negotiation Room, Store Locator).
4.  **Phase 7**: Quality Assurance & Deployment (Cypress, Load Testing).

---

## 📦 Getting Started

### Prerequisites
- Node.js v20+
- MongoDB Atlas Account
- Redis Instance
- Google Maps API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/omniretail.git
   cd omniretail
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure your .env (see OmniRetail_PRD.md for template)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Configure your .env (VITE_API_BASE_URL, etc.)
   npm run dev
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---


