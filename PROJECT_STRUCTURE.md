# CloudPulse AI — Project Structure

```
CloudPulse-AI/
├── frontend/          # React SPA (Vite)
├── backend/           # Node.js API (Express)
├── .env               # Environment variables (repo root — not committed)
├── .env.example
└── PROJECT_STRUCTURE.md
```

## Frontend Technologies

| Technology | Purpose |
|------------|---------|
| **React** | UI components and routing |
| **Tailwind CSS** | Utility-first styling and design system |
| **Framer Motion** | Page transitions and micro-interactions |
| **Recharts** | Dashboard and analytics charts |
| **Vite** | Dev server and production build |
| **React Router** | Client-side navigation |

### Frontend layout

```
frontend/
├── src/
│   ├── components/     # (via features/, ui/)
│   ├── pages/          # Route pages
│   ├── features/       # Feature modules (dashboard, assistant, workspace)
│   ├── hooks/          # Custom hooks
│   ├── services/       # API client, storage
│   ├── context/        # Auth, theme, cloud, toast
│   ├── layouts/        # App chrome, navigation
│   ├── routes/         # Route definitions
│   ├── utils/          # Helpers, chatbot fallback knowledge
│   └── assets/         # Static assets (if any)
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## Backend Technologies

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | HTTP API |
| **JWT** | Session tokens after login |
| **BCrypt** | Password and OTP hashing |
| **Nodemailer** | OTP and alert emails |
| **Gemini API** | CloudPulse AI Assistant |
| **PDFKit** | Report PDF generation |
| **pg** | PostgreSQL client |

### Backend layout

```
backend/
├── server/           # Entry point (index.js)
├── routes/           # API route handlers
├── controllers/      # Business logic (profile, workspace)
├── services/         # Email, PDF, Gemini, OTP, metrics
├── middleware/       # Auth, rate limits
├── config/           # Environment loading (.env from repo root)
├── database/         # Pool, migrations, schema validation
│   └── migrations/   # SQL migration files
├── uploads/          # Generated report PDFs
└── package.json
```

## Database

- **PostgreSQL** stores users, OTP codes, reports, and alert subscriptions.
- Migrations run automatically on server start (`AUTO_MIGRATE=true`) or via `npm run db:migrate`.
- Connection string: `DATABASE_URL` in root `.env`.

## Authentication

1. **Register** → account created, OTP emailed.
2. **OTP verification** → `verified` + `otp_verified` set, JWT issued.
3. **Login** → JWT for protected routes (`Authorization: Bearer <token>`).

## AI Assistant

- **Google Gemini** (`gemini-2.5-flash` with Flash fallbacks).
- API key: `GEMINI_API_KEY` in root `.env` (backend only).
- Endpoint: `POST /api/chat` with message + conversation history.

## Running the application

### Install dependencies

```bash
npm run install:all
```

Or separately:

```bash
cd frontend && npm install
cd backend && npm install
```

### Development

From repo root:

```bash
npm run dev
```

Or independently:

```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` → backend)
- Backend: http://localhost:3001

### Environment

Copy `.env.example` to `.env` at the **repository root**. Both frontend and backend read configuration from there (backend via `backend/config/env.js`).

## Key API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/profile` | Load profile |
| PUT | `/api/profile` | Save profile |
| PUT | `/api/change-password` | Update password |
| DELETE | `/api/reports/:id` | Delete a report |
| POST | `/api/chat` | Gemini assistant |
| POST | `/api/reports/generate` | Generate PDF report |
