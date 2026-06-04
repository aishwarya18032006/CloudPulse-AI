# Environment Variables Setup

## Frontend Configuration

### Development (.env.local or .env)

Create a file `frontend/.env.local`:

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com

# API URL (for production, omit for local development)
# VITE_API_URL=https://cloudpulse-ai.onrender.com
```

### Production - Vercel Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add the following:

| Variable Name | Value | Environment |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | `640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com` | Production, Preview, Development |
| `VITE_API_URL` | `https://cloudpulse-ai.onrender.com` | Production |

**Important:** 
- Keep `VITE_GOOGLE_CLIENT_ID` visible (it's public, safe to expose)
- `VITE_API_URL` should point to your Render backend

---

## Backend Configuration

### Development

The backend doesn't require environment variables for Google OAuth to function.

Existing `.env` variables (if any) can remain unchanged.

### Production - Render Environment Variables

In Render Dashboard:
1. Go to Service Settings → Environment
2. No new variables required for Google OAuth

**Backend keeps existing variables:**
- Database connection strings
- Email configuration
- Other app-specific variables

---

## Quick Setup Commands

### 1. Local Development

```bash
# Frontend
cd frontend
echo 'VITE_GOOGLE_CLIENT_ID=640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com' > .env.local

# Run development server
npm run dev
```

### 2. Database Migration

```bash
cd backend

# Run migrations
npm run db:migrate

# Verify schema
npm run db:verify
```

### 3. Production Deployment

**Vercel:**
```bash
# Set environment variables in Vercel Dashboard
# Then redeploy
```

**Render:**
```bash
# Push to GitHub - Render auto-deploys
git push origin main
```

---

## Verification

### Test Google Sign-In Locally

1. Start frontend: `npm run dev`
2. Visit: http://localhost:5173
3. Click "Continue with Google"
4. Select a Google account
5. You should be logged in

### Check Environment Variables Are Loaded

**Frontend:**
```javascript
// Open browser console
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
// Should output: 640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com
```

### Database Schema Verification

```bash
cd backend
npm run db:verify
```

Should output confirmation that `google_id`, `login_provider`, and `profile_picture` columns exist.

---

## Google Cloud Console Configuration

### Prerequisites

- Google Cloud Project created
- OAuth 2.0 credentials generated
- Client ID: `640498533559-uo4m73jnk6k0qdaij2rpuokckpvd45qc.apps.googleusercontent.com`

### Authorized Origins

In Google Cloud Console → Credentials → OAuth 2.0 Client ID:

**Authorized JavaScript origins:**
- http://localhost:5173 (local development)
- http://localhost:3000 (if different port)
- https://cloudpulse-ai.vercel.app (production)
- Any other production URLs

**Authorized redirect URIs:**
- http://localhost:5173
- https://cloudpulse-ai.vercel.app
- Any other production URLs

### Security Note

The Client ID is public (it's embedded in frontend code). Only the authorization URIs matter for security.

---

## File Checklist

Ensure these files exist and contain the required configurations:

```
frontend/
├── .env.local (local development only, gitignored)
│   └── VITE_GOOGLE_CLIENT_ID=...
├── index.html
│   └── <script src="https://accounts.google.com/gsi/client"></script>
├── src/
│   ├── pages/AuthPage.jsx
│   │   └── import.meta.env.VITE_GOOGLE_CLIENT_ID
│   ├── services/api.js
│   │   └── googleLogin() method
│   └── context/AuthContext.jsx
│       └── googleLogin() method

backend/
├── database/
│   └── migrations/
│       └── 004_google_oauth.sql
└── routes/
    └── auth.js
        └── /auth/google-login endpoint

Root/
└── GOOGLE_OAUTH_SETUP.md (this file)
```

---

## Troubleshooting Environment Issues

### `import.meta.env.VITE_GOOGLE_CLIENT_ID` is undefined

**Solution:**
- Check `.env.local` file exists in frontend directory
- Verify variable name starts with `VITE_`
- Restart development server: `npm run dev`
- Clear browser cache

### Google Sign-In script not loading

**Solution:**
- Check internet connection
- Verify `index.html` has Google script tag
- Check browser console for CSP violations
- Verify no adblockers blocking Google scripts

### Database migration fails

**Solution:**
- Ensure PostgreSQL is running
- Check database connection in backend
- Run `npm run db:test` to verify connection
- Check migration file syntax

---

## Environment Variables Reference

### All Variables Used in Application

| Variable | Location | Type | Required | Description |
|---|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Public | Yes | Google OAuth Client ID for authentication |
| `VITE_API_URL` | Frontend | Public | No | Backend API URL (omit for localhost dev) |
| Database Connection | Backend | Secret | Yes | PostgreSQL connection (existing setup) |

---

## Next Steps

1. ✅ Add `VITE_GOOGLE_CLIENT_ID` to `.env.local`
2. ✅ Run `npm run db:migrate` in backend
3. ✅ Start frontend development server
4. ✅ Test Google Sign-In
5. ✅ Deploy to production when ready

---

## Support

For issues or questions about environment setup, refer to:
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Implementation details
- [Frontend .env documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)
