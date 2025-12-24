# Luxury Holiday Booking Portal

Enterprise-grade luxury travel marketplace featuring a React + Tailwind frontend and a secure Netlify Functions backend.

## Architecture Overview

- **Frontend**: Vite + React + TypeScript, Tailwind utility design system, framer-motion micro-interactions, and Zustand-ready state architecture.
- **Backend**: Express wrapped by Netlify Functions, layered controllers/services, Zod validation, bcrypt password hashing, JWT auth, and RBAC middleware.
- **Data**: Lightweight JSON persistence (`backend/data/db.json`) with seed entities (admin, merchant, traveler, showcase properties) for quick demos or Netlify deploy previews.

```
Luxury/
├── frontend/               # React application
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
├── backend/                # Express app consumed by Netlify Functions
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   └── data/
├── netlify/functions/api.js
├── netlify.toml
└── README.md
```

## Security Posture (OWASP-lite)

| Control | Implementation |
| --- | --- |
| Authentication | Bcrypt password hashing, JWT issuance with env-driven secrets, profile endpoint for session validation |
| Authorization | RBAC middleware (`authorize`) gates admin/merchant/customer routes |
| Input Validation | Zod schemas + sanitizer that trims, escapes, and XSS-cleans payloads |
| Rate Limiting | `express-rate-limit` with modern headers |
| Transport Headers | Helmet with CORP policy, `x-powered-by` disabled |
| Error Handling | Central handler hides stack traces in production |
| Secure Storage | `.env` driven secrets, sample `.env.example` provided |
| CORS | Allow-list via `CORS_ALLOWED_ORIGINS` environment variable |
| Sensitive Logging | Server logs restricted to error summary outside development |

## Getting Started

### Prerequisites

- Node.js 18+
- Netlify CLI (`npm i -g netlify-cli`) for local serverless emulation

### Environment

1. Copy `.env.example` to `.env` and set strong secrets:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development` / `production` |
| `JWT_SECRET` | 32+ char random string |
| `TOKEN_EXPIRES_IN` | JWT TTL (e.g., `4h`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins (`http://localhost:5173,https://luxury.example.com`) |

### Install

```bash
npm install          # installs root + frontend workspace deps
```

### Run Locally

```bash
netlify dev          # boots Vite on :5173 and serverless API on :8888 proxied to /api
```

### Frontend-only commands

```bash
npm run dev:frontend
npm run build:frontend
npm run lint
```

### Seed baseline data

```bash
npm run seed
```

## Deployment (Netlify)

1. Connect repo to Netlify and set build command `npm run build`, publish directory `frontend/dist`.
2. Configure the following environment variables inside the Netlify dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=<strong secret>`
   - `TOKEN_EXPIRES_IN=6h`
   - `CORS_ALLOWED_ORIGINS=https://<your-site>.netlify.app`
3. Deploy. Netlify automatically installs workspaces, builds the Vite frontend, and deploys the `netlify/functions/api.js` serverless handler.

### Post-deploy Smoke Test

- `GET /.netlify/functions/api/health` should return `{ status: 'ok' }`.
- Register a traveler user, log in, and request a booking. Verify bookings persist in `backend/data/db.json` (stored via Netlify function included file).

## Testing Checklist

- [ ] `npm run lint` passes
- [ ] Register/Login flows work (customer + merchant + admin)
- [ ] Protected routes enforce RBAC (admin analytics, merchant console, booking flow)
- [ ] Booking requests blocked on overlapping dates and guest limits
- [ ] API rejects invalid payloads (e.g., short password, invalid email)

## Extending the MVP

- Swap JSON persistence with a managed database (Supabase/Postgres) by implementing new adapters in `backend/services/*`.
- Integrate Netlify Identity or enterprise IdP via OAuth while keeping RBAC middleware.
- Automate visual regression coverage using Playwright component tests.
- Connect analytics endpoints to Snowflake/BigQuery for executive dashboards.

---
Crafted for premium hospitality brands seeking a ready-to-deploy digital concierge experience.
