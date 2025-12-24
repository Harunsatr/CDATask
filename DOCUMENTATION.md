# LuxePortal - Luxury Holiday Booking Portal

## Complete Technical Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [Deployment](#deployment)
11. [Demo Accounts](#demo-accounts)
12. [Environment Variables](#environment-variables)

---

## Project Overview

LuxePortal is an enterprise-grade luxury travel marketplace that connects high-end property owners (merchants) with discerning travelers (customers). The platform features a modern React frontend with a secure Express.js backend, supporting role-based access control for customers, merchants, and administrators.

### Key Highlights

- 🏨 **Property Listings**: Browse and book luxury properties worldwide
- 👥 **Multi-Role System**: Customer, Merchant, and Admin dashboards
- 💳 **Payment Processing**: Multiple payment methods with refund support
- 🔒 **Enterprise Security**: JWT auth, bcrypt hashing, rate limiting, input sanitization
- ☁️ **Serverless Ready**: Deployable to Vercel or Netlify

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │   React   │  │ TypeScript│  │  Tailwind │  │   Vite    │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
│                              │                                   │
│                    Axios HTTP Client                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────┴──────────────────────────────────┐
│                         BACKEND                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Express  │  │    JWT    │  │   Zod     │  │  Helmet   │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
│                              │                                   │
│         Controllers → Services → Repositories                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                        DATABASE                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │  SQLite (Local)     │ OR │  JSON (Serverless)  │            │
│  │  better-sqlite3     │    │  In-Memory Store    │            │
│  └─────────────────────┘    └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI Framework |
| TypeScript | 5.5 | Type Safety |
| Vite | 5.4 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 11.3 | Animations |
| Axios | 1.7 | HTTP Client |
| React Router | 6.26 | Routing |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18 | Runtime |
| Express | 4.19 | Web Framework |
| better-sqlite3 | 11.6 | Database (Local) |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password Hashing |
| Zod | 3.23 | Validation |
| Helmet | 7.1 | Security Headers |
| serverless-http | 3.2 | Serverless Adapter |

---

## Features

### Customer Features
- ✅ Browse luxury property listings
- ✅ View property details with image galleries
- ✅ Check property availability
- ✅ Book properties with date selection
- ✅ Multiple payment methods (Credit Card, PayPal, Bank Transfer, Stripe)
- ✅ View booking history
- ✅ Cancel bookings
- ✅ Request refunds

### Merchant Features
- ✅ Add new property listings
- ✅ Manage property details
- ✅ View bookings for owned properties
- ✅ Track revenue and statistics
- ✅ Update booking statuses

### Admin Features
- ✅ View platform analytics
- ✅ Manage all users
- ✅ Approve/reject property listings
- ✅ View all bookings
- ✅ Process refunds
- ✅ Payment statistics

---

## Getting Started

### Prerequisites

- Node.js ≥18
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Harunsatr/CDATask.git
cd CDATask

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Create environment file
cp .env.example .env
```

### Development

```bash
# Start backend server (Terminal 1)
node backend/server.js

# Start frontend dev server (Terminal 2)
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### Build for Production

```bash
cd frontend
npm run build
```

---

## Project Structure

```
Luxury/
├── api/                          # Vercel serverless function
│   └── index.js                  # Entry point for Vercel
│
├── backend/                      # Express.js Backend
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   └── env.js                # Environment configuration
│   ├── constants/
│   │   └── roles.js              # Role constants
│   ├── controllers/
│   │   ├── authController.js     # Authentication handlers
│   │   ├── propertyController.js # Property handlers
│   │   ├── bookingController.js  # Booking handlers
│   │   ├── paymentController.js  # Payment handlers
│   │   └── adminController.js    # Admin handlers
│   ├── data/
│   │   ├── database.js           # SQLite initialization
│   │   ├── jsonDatabase.js       # JSON in-memory store (serverless)
│   │   ├── userRepository.js     # User data access
│   │   ├── propertyRepository.js # Property data access
│   │   ├── bookingRepository.js  # Booking data access
│   │   └── paymentRepository.js  # Payment data access
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── validateRequest.js    # Request validation
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── errorHandler.js       # Global error handler
│   ├── routes/
│   │   └── index.js              # API routes
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   ├── propertyService.js    # Property business logic
│   │   ├── bookingService.js     # Booking business logic
│   │   ├── paymentService.js     # Payment business logic
│   │   └── userService.js        # User business logic
│   └── utils/
│       ├── crypto.js             # Password hashing & JWT
│       ├── validators.js         # Zod schemas
│       ├── sanitizer.js          # Input sanitization
│       └── response.js           # Response builder
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx  # Main layout
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── PropertyCard.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Auth state management
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # Auth hook
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── PropertiesPage.tsx
│   │   │   ├── PropertyDetailPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MerchantDashboardPage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts            # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── propertyService.ts
│   │   │   ├── bookingService.ts
│   │   │   ├── paymentService.ts
│   │   │   └── adminService.ts
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   └── styles/
│   │       └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── netlify/                      # Netlify Functions
│   └── functions/
│       └── api.js
│
├── package.json                  # Root package.json
├── netlify.toml                  # Netlify configuration
├── vercel.json                   # Vercel configuration
├── .env.example                  # Environment template
└── README.md
```

---

## API Documentation

### Base URL

- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-domain.vercel.app/api`

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

### Auth Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"  // customer | merchant
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890"
}
```

---

### Property Endpoints

#### List Properties
```http
GET /api/properties
GET /api/properties?location=Italy&minPrice=100&maxPrice=500
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| location | string | Filter by location |
| minPrice | number | Minimum price per night |
| maxPrice | number | Maximum price per night |
| bedrooms | number | Number of bedrooms |
| guests | number | Maximum guests |
| search | string | Search term |
| status | string | Property status |

#### Get Featured Properties
```http
GET /api/properties/featured
```

#### Get Property by ID
```http
GET /api/properties/:id
```

#### Check Availability
```http
GET /api/properties/:id/availability?checkIn=2025-01-01&checkOut=2025-01-05
```

#### Create Property (Merchant)
```http
POST /api/properties
Authorization: Bearer <merchant_token>
Content-Type: application/json

{
  "name": "Luxury Villa",
  "description": "Beautiful beachfront property",
  "location": "Maldives",
  "pricePerNight": 500,
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "amenities": ["Pool", "WiFi", "Beach Access"],
  "images": ["https://example.com/image1.jpg"]
}
```

#### Update Property
```http
PUT /api/properties/:id
Authorization: Bearer <token>
```

#### Delete Property
```http
DELETE /api/properties/:id
Authorization: Bearer <token>
```

#### Approve Property (Admin)
```http
POST /api/properties/:id/approve
Authorization: Bearer <admin_token>
```

#### Reject Property (Admin)
```http
POST /api/properties/:id/reject
Authorization: Bearer <admin_token>
```

---

### Booking Endpoints

#### Check Availability
```http
GET /api/bookings/check-availability?propertyId=xxx&checkIn=2025-01-01&checkOut=2025-01-05
```

#### List Bookings
```http
GET /api/bookings
GET /api/bookings?status=confirmed
Authorization: Bearer <token>
```

#### Get Booking by ID
```http
GET /api/bookings/:id
Authorization: Bearer <token>
```

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "property_uuid",
  "checkIn": "2025-01-01",
  "checkOut": "2025-01-05",
  "guests": 2,
  "specialRequests": "Late check-in requested"
}
```

#### Update Booking Status (Merchant/Admin)
```http
PUT /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### Cancel Booking
```http
POST /api/bookings/:id/cancel
Authorization: Bearer <token>
```

---

### Payment Endpoints

#### Get Payment Methods
```http
GET /api/payments/methods
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "credit_card",
      "name": "Credit Card",
      "description": "Visa, Mastercard, AMEX",
      "icon": "credit-card",
      "enabled": true
    },
    {
      "id": "paypal",
      "name": "PayPal",
      "description": "Pay with PayPal",
      "icon": "paypal",
      "enabled": true
    }
  ]
}
```

#### Process Payment
```http
POST /api/bookings/:bookingId/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "credit_card",
  "cardNumber": "4111111111111111",
  "cardExpiry": "12/28",
  "cardCvv": "123",
  "cardName": "John Doe"
}
```

#### Get User Payments
```http
GET /api/payments
Authorization: Bearer <token>
```

#### Get Payment by ID
```http
GET /api/payments/:id
Authorization: Bearer <token>
```

#### Request Refund
```http
POST /api/payments/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed travel plans"
}
```

---

### Admin Endpoints

#### List All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": {
      "total": 10,
      "active": 8,
      "pending": 2
    },
    "bookings": {
      "total": 50,
      "revenue": 25000,
      "pending": 5,
      "confirmed": 30
    },
    "payments": {
      "total": 45,
      "completed": 40,
      "completedAmount": 24000,
      "pending": 3,
      "pendingAmount": 800,
      "failed": 2
    },
    "users": {
      "total": 100,
      "breakdown": {
        "customer": 90,
        "merchant": 8,
        "admin": 2
      }
    }
  }
}
```

#### Get All Bookings
```http
GET /api/admin/bookings
Authorization: Bearer <admin_token>
```

#### Get All Payments
```http
GET /api/admin/payments
Authorization: Bearer <admin_token>
```

#### Get Payment Stats
```http
GET /api/admin/payments/stats
Authorization: Bearer <admin_token>
```

#### Process Refund
```http
POST /api/admin/payments/:id/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "approved": true
}
```

---

### Merchant Endpoints

#### Get Merchant Properties
```http
GET /api/merchant/properties
Authorization: Bearer <merchant_token>
```

#### Get Merchant Bookings
```http
GET /api/merchant/bookings
Authorization: Bearer <merchant_token>
```

#### Get Merchant Stats
```http
GET /api/merchant/stats
Authorization: Bearer <merchant_token>
```

---

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| email | TEXT | Unique email address |
| password | TEXT | Bcrypt hashed password |
| name | TEXT | Display name |
| role | TEXT | customer, merchant, admin |
| phone | TEXT | Phone number (optional) |
| avatar | TEXT | Avatar URL (optional) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Properties Table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Property name |
| description | TEXT | Full description |
| location | TEXT | City, Country |
| address | TEXT | Full address |
| price_per_night | REAL | Nightly rate |
| currency | TEXT | USD, EUR, etc. |
| bedrooms | INTEGER | Number of bedrooms |
| bathrooms | INTEGER | Number of bathrooms |
| max_guests | INTEGER | Maximum guests |
| amenities | TEXT (JSON) | Array of amenities |
| images | TEXT (JSON) | Array of image URLs |
| merchant_id | TEXT (FK) | Owner reference |
| status | TEXT | pending, active, inactive, rejected |
| rating | REAL | Average rating |
| review_count | INTEGER | Number of reviews |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Bookings Table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| property_id | TEXT (FK) | Property reference |
| user_id | TEXT (FK) | Customer reference |
| check_in | DATE | Check-in date |
| check_out | DATE | Check-out date |
| guests | INTEGER | Number of guests |
| total_price | REAL | Total booking cost |
| currency | TEXT | Currency code |
| status | TEXT | pending, confirmed, cancelled, completed |
| payment_status | TEXT | unpaid, paid, refunded |
| special_requests | TEXT | Guest notes |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Payments Table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| booking_id | TEXT (FK) | Booking reference |
| user_id | TEXT (FK) | Payer reference |
| amount | REAL | Payment amount |
| currency | TEXT | Currency code |
| method | TEXT | credit_card, paypal, bank_transfer, stripe |
| status | TEXT | pending, completed, failed, refund_pending, refunded |
| transaction_id | TEXT | Gateway transaction ID |
| payment_data | TEXT (JSON) | Additional payment data |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

---

## Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user_uuid",
  "role": "customer",
  "iat": 1735000000,
  "exp": 1735086400
}
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **customer** | Browse properties, make bookings, manage own bookings, make payments |
| **merchant** | All customer permissions + create/manage properties, view property bookings |
| **admin** | All permissions + manage users, approve properties, process refunds, view analytics |

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 24-hour expiration
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Sanitization**: XSS protection
- **Helmet**: Security headers
- **CORS**: Configurable origin whitelist

---

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure settings:
   - **Root Directory**: `.` (leave empty)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
4. Add environment variables in Vercel dashboard
5. Deploy

### Netlify Deployment

1. Push code to GitHub
2. Connect repository to Netlify
3. Configure settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Functions Directory**: `netlify/functions`
4. Add environment variables
5. Deploy

### Important Notes for Serverless

- SQLite (`better-sqlite3`) does not work in serverless environments
- The app automatically switches to in-memory JSON storage when deployed
- Data resets on cold starts (suitable for demos)
- For production, consider migrating to a cloud database (PostgreSQL, MongoDB)

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin123 |
| Merchant | merchant@gmail.com | merchant123 |
| Customer | user@gmail.com | user123 |

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Database (local development)
DATABASE_PATH=./backend/data/luxury_booking.db

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

---

## License

This project is proprietary software developed for CDA.

---

## Support

For issues or questions, please contact the development team or create an issue in the GitHub repository.
