# FoodOrder App

Full-stack online food ordering prototype with React, Node.js, MongoDB, JWT auth, Stripe payments, admin dashboard, and Arabic/English support.

## Features

- Menu with images and prices
- Shopping cart and order placement
- User registration and login (JWT)
- Payment: Stripe (online) or Cash on Delivery
- Order status tracking
- Admin dashboard (products + orders + stats)
- Multi-language UI (English / Arabic with RTL)

## Project Structure

```
food-order-app/
├── backend/     # Express + MongoDB API
└── frontend/    # React + Vite UI
```

## Prerequisites

- Node.js 18+
- MongoDB installed and running (Windows service name is usually `MongoDB`)
- Stripe test keys (optional, for online payments)

### MongoDB on Windows

After installing MongoDB Community Server:

1. Open **Services** (`Win + R` → `services.msc`)
2. Find **MongoDB Server** and ensure it is **Running**
3. Default connection used by this app: `mongodb://127.0.0.1:27017/food-order-app`

Or run the automated setup script (see below).

## Quick Setup (Windows)

From PowerShell in the project folder:

```powershell
cd C:\Users\DELL\Projects\food-order-app
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

Or double-click: `scripts\setup-and-run.bat` (installs, seeds, then starts both servers).

Then open: **http://localhost:5173**

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs at `http://localhost:5001`.

> **Note:** Port `5000` often returns **403 Forbidden** on Windows (reserved by the system). This project uses **5001** instead.

### 2. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo Accounts

After seeding:

- **Admin:** `admin@foodorder.com` / `admin123`

Register a customer account from the Register page.

## Stripe Setup (Online Payments)

The error **"Online payments are not configured"** means Stripe test keys are missing from your `.env` files.

### Quick setup (recommended)

```powershell
cd C:\Users\DELL\Projects\food-order-app
powershell -ExecutionPolicy Bypass -File .\scripts\setup-stripe.ps1
```

Paste your keys from: **https://dashboard.stripe.com/test/apikeys**

| Key | Where it goes |
|-----|----------------|
| `sk_test_...` (Secret) | `backend/.env` → `STRIPE_SECRET_KEY` |
| `pk_test_...` (Publishable) | `frontend/.env` → `VITE_STRIPE_PUBLISHABLE_KEY` |

### Manual setup

**backend/.env**
```env
STRIPE_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
```

**frontend/.env**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_YOUR_KEY_HERE
```

### After adding keys

Restart **both** servers (required):

```powershell
cd backend && npm run dev
cd frontend && npm run dev
```

Backend should log: `Stripe: enabled (test/live secret key loaded)`

### Test payment

| Field | Value |
|-------|--------|
| Card | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/34`) |
| CVC | Any 3 digits (e.g. `123`) |
| ZIP | Any (e.g. `12345`) |

After successful payment, order status changes from **pending** → **confirmed** automatically.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register customer |
| POST | `/api/auth/login` | Login |
| GET | `/api/products` | Public menu |
| POST | `/api/orders` | Place order (auth) |
| GET | `/api/orders/mine` | User orders |
| GET | `/api/orders/admin/all` | All orders (admin) |
| PATCH | `/api/orders/:id/status` | Update status (admin) |

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, i18next, Stripe Elements

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Stripe, Vitest

### Backend tests

```bash
cd backend
npm install
npm test              # run all unit + feature tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```
