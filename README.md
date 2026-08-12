# 🏨 StayVerse — Modern Stay & Hotel Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**StayVerse** is a feature-rich, full-stack web application for discovering, listing, and booking accommodations globally. Built as an all-in-one hybrid platform combining **Airbnb-style host property listings** with **live external hotel API synchronization (Agoda via RapidAPI)**, StayVerse delivers a smooth reservation experience for both guests and property hosts.

---

## 🚀 Key Features

### 🌟 Dual Accommodation Ecosystem
* **Community Listings (Airbnb Style)**: Hosts can publish and manage unique stays (Villas, Apartments, Castles, Beachfronts, Mountain Cabins, and Pools).
* **Live Hotel Search (Booking.com / Agoda Style)**: Integration with external hotel APIs allowing real-time searching and filtering of thousands of hotels across global and Indian destinations.

### 🔐 Dual-Role Authentication System
* **Separate User & Host Portals**: Distinct login/registration workflows for **Guests** (`local-user`) and **Hosts** (`local-host`).
* **Secure Authentication**: Powered by **Passport.js** and **Bcrypt** password hashing with role-based authorization rules.
* **Role Switching**: Users can seamlessly toggle between guest and host privileges from their profile.

### 🔍 Interactive Search & Dynamic Filtering
* Real-time query search by destination, city, country, star rating, property type, price range, and amenities.
* Dynamic client-side rendering with asynchronous REST APIs.

### 📅 Booking & Reservation Management
* Instant booking placement for both host listings and hotels.
* Personalized booking dashboard separating upcoming and past stays.
* Host portal for property owners to view guest reservations and listing performance.

### ❤️ Wishlist & Favorites
* Interactive wishlist system with persistent storage in MongoDB.
* Quick toggle option to bookmark favorite properties and hotels.

### 🔄 Automated Background Data Sync
* Built-in cron scheduler using `node-cron` to perform daily synchronization of live hotel availability and rates across 50+ top global and domestic travel destinations.

### 💬 Reviews & Ratings
* Full review capability for host listings with star ratings and comments.
* Cascading deletion cleanup (deleting a listing automatically purges associated reviews).

---

## 🛠️ Tech Stack

### **Backend Framework & Core**
* **Node.js** — JavaScript Runtime
* **Express.js (v5)** — Web Application Framework
* **Passport.js** — Authentication middleware (Local Strategy)
* **Bcrypt** — Password Hashing & Security

### **Database & Session Management**
* **MongoDB** — NoSQL Database
* **Mongoose (v8)** — Object Data Modeling (ODM)
* **Connect-Mongo** — MongoDB session persistence
* **Express-Session** — Session middleware with cookie handling

### **Frontend & View Engine**
* **EJS (Embedded JavaScript)** — Dynamic Server-Side Rendering
* **EJS-Mate** — Layout and partial templates
* **Vanilla CSS & Bootstrap** — Responsive styling and glassmorphism UI components
* **FontAwesome** — Iconography

### **Services & External APIs**
* **RapidAPI / Agoda API** — Real-time external hotel search engine
* **Node-Cron** — Automated background job scheduling
* **Joi** — Schema validation for request payloads

---

## 📁 Project Architecture

```
StayVerse/
├── server/
│   ├── config/          # Database connection setup (db.js)
│   ├── controllers/     # Route business logic (Auth, Bookings, Hotels, Listings, Wishlist)
│   ├── middlewares/     # Authentication, Authorization, Validation & Error middlewares
│   ├── models/          # Mongoose Schemas (User, Listing, Hotel, Review)
│   ├── routes/          # Express Routers (authRoutes, hotelRoutes, listingRoutes, etc.)
│   ├── services/        # External hotel sync service & scheduled Cron jobs
│   ├── utils/           # Helper constants and default asset fallbacks
│   └── server.js        # Express application initialization & middleware stack
├── views/               # EJS Template files
│   ├── layouts/         # Boilerplate master template (boilerplate.ejs)
│   ├── pages/           # Page views (listings, hotels, auth, profile, bookings)
│   └── partials/        # Reusable UI components (navbar, footer, flash messages)
├── public/              # Static assets (CSS styles, client JavaScript, images)
├── init/                # Database seed data & population script (index.js, data.js)
├── .env                 # Environment variables configuration
├── app.js               # Application entry point (requires server/server.js)
├── index.js             # Deployment entry point (for Render / Vercel hosting)
└── package.json         # Project metadata and dependencies
```

---

## ⚙️ Installation & Setup Guide

### 📋 Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [MongoDB](https://www.mongodb.com/) (Local service running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string)
* [Git](https://git-scm.com/)

---

### 📥 1. Clone the Repository
```bash
git clone https://github.com/your-username/StayVerse.git
cd StayVerse
```

### 📦 2. Install Dependencies
```bash
npm install
```

---

### 🔑 3. Configure Environment Variables
Create a `.env` file in the root directory of the project:

```env
# Server Configuration
PORT=8080

# Database & Sessions
MONGO_URL=mongodb://127.0.0.1:27017/StayVerse
SECRET=your_custom_super_secret_session_key

# External APIs
RAPID_API_KEY=your_rapidapi_agoda_key_here
```

---

### 🌱 4. Seed the Database (Optional)
To populate the database with initial sample listings:

```bash
node init/index.js
```

---

## 🔄 How It Works

1. **User Authentication & Session Flow**:
   * Upon registering/logging in, Passport creates a serialized session stored inside MongoDB via `connect-mongo`.
   * Requests attached with authentication cookies are evaluated by custom middlewares (`isLoggedIn`, `isHost`) to restrict host-only actions (e.g. creating/editing listings).

2. **Listing Management**:
   * Registered **Hosts** can create property listings under categories like *Beachfront*, *Trending*, *Historic*, *Mountains*, *Castles*, etc.
   * Guests can view listing details, read reviews, add properties to wishlists, and place reservations.

3. **External Hotel Integration**:
   * Searching for destinations calls `/api/hotels/search` or `/hotels/search`.
   * The app queries the cached MongoDB `Hotel` collection first. If data is outdated or daily sync runs, `hotelService.js` fetches fresh property listings via Agoda's RapidAPI.

4. **Background Synchronization**:
   * At `00:00` daily, `startDailySyncCron()` iterates over major global tourist destinations (New York, Paris, Tokyo, Goa, Mumbai, etc.) updating pricing and hotel details automatically.

---

## 📡 API Reference Summary

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/listings` | `GET` | Browse all user/host listings | Public |
| `/listings/new` | `GET` | Render form to create a new stay | Host Only |
| `/listings` | `POST` | Create a new listing | Host Only |
| `/listings/:id` | `GET` | View details of a specific stay | Public |
| `/hotels/search` | `GET` | Search live hotels by city/keyword | Public |
| `/api/hotels` | `GET` | JSON endpoint for live hotels | Public |
| `/auth/login-user` | `GET/POST` | User/Guest login portal | Public |
| `/auth/login-host` | `GET/POST` | Host login portal | Public |
| `/my-bookings` | `GET` | View guest's booked reservations | Authenticated |
| `/wishlists` | `GET` | View user's saved wishlist | Authenticated |
| `/api/wishlists/toggle`| `POST` | Add/remove stay from wishlist | Authenticated |

---

## 🛡️ License

Distributed under the **ISC License**. See `package.json` for details.

---

⭐ *If you like StayVerse, give it a star on GitHub!*
