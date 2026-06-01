# CloudPulse AI

Enterprise multi-cloud cost & sustainability intelligence platform.

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for the full monorepo layout.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Environment

Copy `.env.example` to `.env` at the **repository root** and configure:

- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY` (AI Assistant)
- SMTP settings (optional; OTP logs to console in dev if unset)

### 2. Install

```bash
npm run install:all
```

Or:

```bash
cd frontend && npm install
cd backend && npm install
```

### 3. Database

```bash
npm run db:migrate
```

### 4. Run

**Both (recommended):**

```bash
npm run dev
```

**Independently:**

```bash
cd frontend && npm run dev
```

```bash
cd backend && npm run dev
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:3001  

## Features

- JWT authentication with email OTP verification
- Settings: profile save, password change, workspace deletion
- AI Assistant powered by Google Gemini (English, Tamil, Tanglish)
- PDF reports with PostgreSQL history
- Responsive UI for mobile through desktop

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | Backend only |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run build` | Production frontend build |
