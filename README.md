# My Secret Drawer

A full-stack luxury fashion and beauty e-commerce platform designed for customers in Lesotho and South Africa.

**Live Demo**  
https://my-secret-drawer.vercel.app/

**GitHub Repository**  
https://github.com/Boitumelo-bit/my-secret-drawer

---

# About The Project

My Secret Drawer is a modern full-stack e-commerce platform developed to provide a premium online shopping experience for fashion and beauty products.

The platform allows customers to browse products, manage shopping carts, save products to a wishlist, securely authenticate, place orders, track deliveries, and manage their accounts. It also provides dedicated dashboards for employees and administrators to efficiently manage products, orders, customers, analytics, and system settings.

The application follows a modern client-server architecture using React.js for the frontend, Express.js for the backend, Prisma ORM for database management, and PostgreSQL hosted on Neon.

---

# Key Highlights

- Fully responsive design
- Mobile-first user interface
- Firebase Authentication
- Email & Password authentication
- Google Sign-In
- Facebook Sign-In
- JWT Authorization
- Role-based access control
- Customer Dashboard
- Employee Dashboard
- Administrator Dashboard
- Shopping Cart
- Wishlist
- Order Tracking
- Product Reviews
- Email Notifications
- RESTful API
- PostgreSQL Database
- Cloudinary Image Storage
- Vercel Deployment

---

# Features

## Customer Features

- User registration
- Secure login
- Firebase Authentication
- Google Sign-In
- Facebook Sign-In
- Browse fashion products
- Browse beauty products
- Product categories
- Product search
- Product filtering
- Product details
- Multiple product images
- Product sizes
- Product colours
- Shopping cart
- Wishlist
- Checkout
- Order placement
- Order tracking
- Customer account management
- Product reviews
- Email notifications

---

## Employee Features

- Employee dashboard
- Order management
- Product management
- Inventory management
- Customer management
- Banner management
- Sales monitoring
- Refund management
- Review moderation
- Analytics dashboard

---

## Administrator Features

- Administrator dashboard
- User management
- Employee management
- Customer management
- Product management
- Order management
- Revenue monitoring
- Analytics
- Audit logs
- System settings
- Platform administration

---

# Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Tailwind CSS
- Axios
- Framer Motion
- Swiper.js
- React Hot Toast
- Firebase Authentication

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- Socket.io
- Bcrypt

---

## Database

- PostgreSQL
- Neon Database

---

## Cloud Services

- Vercel
- Cloudinary
- Firebase

---

# System Architecture

The application follows a modern three-tier architecture.

### Presentation Layer

- React.js
- Responsive user interface
- React Router
- Context API
- Tailwind CSS

### Business Logic Layer

- Express.js
- REST API
- JWT Authentication
- Firebase Authentication
- Prisma ORM

### Data Layer

- PostgreSQL
- Prisma ORM
- Neon Database

---

# Database Design

The database contains multiple relational entities including:

- Users
- Products
- Categories
- Orders
- Order Items
- Cart Items
- Wishlist
- Payments
- Reviews
- Notifications
- Addresses
- Coupons
- Loyalty Points
- Audit Logs
- Sessions
- Refunds
- Shipping Zones
- Product Views
- Search Logs
- Banners

---

# Authentication and Security

The application provides secure authentication using Firebase Authentication together with JWT authorization.

Supported authentication methods include:

- Email & Password Authentication
- Google Sign-In
- Facebook Sign-In

Security features include:

- Firebase Authentication
- JWT Authentication
- Password hashing using bcrypt
- Role-based access control
- Protected routes
- Secure REST APIs
- User session validation
- Audit logging

---

# Responsive Design

My Secret Drawer follows a mobile-first design approach.

The application is fully responsive and automatically adapts to different screen sizes including:

- Mobile phones
- Tablets
- Laptops
- Desktop computers

Responsive layouts have been implemented throughout the application, including:

- Homepage
- Product pages
- Shopping cart
- Checkout
- Customer dashboard
- Employee dashboard
- Administrator dashboard

The interface automatically adjusts navigation, grids, forms, images, and dashboards to provide a consistent user experience across all devices.

# Installation and Setup

## Clone Repository

```bash
git clone https://github.com/Boitumelo-bit/my-secret-drawer.git
```

Navigate into the project directory.

```bash
cd my-secret-drawer
```

---

# Backend Setup

Navigate to the backend folder.

```bash
cd backend
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Generate the Prisma client.

```bash
npx prisma generate
```

Run database migrations.

```bash
npx prisma migrate dev
```

Start the backend server.

```bash
npm run dev
```

---

# Frontend Setup

Navigate to the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the development server.

```bash
npm run dev
```

---

# API Overview

## Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/firebase-sync
GET  /api/auth/me
PUT  /api/auth/profile
```

---

## Products

```
GET /api/products
GET /api/products/:id
```

---

## Shopping Cart

```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update/:cartItemId
DELETE /api/cart/remove/:cartItemId
DELETE /api/cart/clear
```

---

## Wishlist

```
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/:id
```

---

## Orders

```
POST  /api/orders
GET   /api/orders/my-orders
GET   /api/orders/all
GET   /api/orders/track/:orderNumber
PATCH /api/orders/:id/status
```

---

## Dashboard

```
GET /api/dashboard/customer
GET /api/dashboard/employee
GET /api/dashboard/admin
```

---

# Deployment

## Frontend

- Vercel

## Backend

- Node.js server

## Database

- Neon PostgreSQL

---

# Future Improvements

Possible future enhancements include:

- Lesotho payment gateway integration
- PayFast integration
- Mobile Money payments
- Push notifications
- AI product recommendations
- Live chat support
- Multi-language support
- Advanced reporting
- Native mobile application

---

# Developer

**Boitumelo Mosiuoa**

Diploma in Information Technology

Limkokwing University of Creative Technology

GitHub:
https://github.com/Boitumelo-bit

---

# License

This project was developed for educational and portfolio purposes.
